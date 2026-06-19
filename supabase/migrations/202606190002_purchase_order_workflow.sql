begin;

create or replace function public.create_purchase_order(
  requested_supplier_id uuid,
  requested_expected_date date,
  requested_notes text,
  requested_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_app_role public.app_role;
  new_order_id uuid := gen_random_uuid();
  new_order_number text :=
    'PO-' || to_char(clock_timestamp(), 'YYYYMMDD-HH24MISS') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  calculated_subtotal numeric(12, 2);
begin
  select role
  into current_app_role
  from public.profiles
  where id = current_user_id
    and is_active = true;

  if current_user_id is null
    or current_app_role not in ('admin', 'pharmacist') then
    raise exception 'Only active Admin and Pharmacist users can create purchase orders.';
  end if;

  if not exists (
    select 1
    from public.suppliers
    where id = requested_supplier_id
      and is_active = true
  ) then
    raise exception 'Select an active supplier.';
  end if;

  if requested_items is null
    or jsonb_typeof(requested_items) <> 'array'
    or jsonb_array_length(requested_items) = 0 then
    raise exception 'Add at least one medicine to the purchase order.';
  end if;

  create temporary table if not exists pg_temp.purchase_items (
    medicine_id uuid primary key,
    ordered_quantity integer not null,
    unit_cost numeric(12, 2) not null,
    intended_selling_price numeric(12, 2) not null
  ) on commit drop;

  truncate table pg_temp.purchase_items;

  insert into pg_temp.purchase_items (
    medicine_id,
    ordered_quantity,
    unit_cost,
    intended_selling_price
  )
  select
    item.medicine_id,
    item.ordered_quantity,
    round(item.unit_cost, 2),
    round(item.intended_selling_price, 2)
  from jsonb_to_recordset(requested_items) as item(
    medicine_id uuid,
    ordered_quantity integer,
    unit_cost numeric,
    intended_selling_price numeric
  );

  if (select count(*) from pg_temp.purchase_items) <> jsonb_array_length(requested_items) then
    raise exception 'Each medicine can appear only once on a purchase order.';
  end if;

  if exists (
    select 1
    from pg_temp.purchase_items
    where medicine_id is null
      or ordered_quantity <= 0
      or unit_cost < 0
      or intended_selling_price < 0
  ) then
    raise exception 'Purchase quantities must be positive and prices cannot be negative.';
  end if;

  if exists (
    select 1
    from pg_temp.purchase_items as item
    left join public.medicines as medicine on medicine.id = item.medicine_id
    where medicine.id is null or medicine.status <> 'active'
  ) then
    raise exception 'Every purchase item must reference an active medicine.';
  end if;

  select round(sum(ordered_quantity * unit_cost), 2)
  into calculated_subtotal
  from pg_temp.purchase_items;

  insert into public.purchase_orders (
    id,
    order_number,
    supplier_id,
    status,
    expected_date,
    subtotal,
    total_amount,
    notes,
    created_by
  )
  values (
    new_order_id,
    new_order_number,
    requested_supplier_id,
    'draft',
    requested_expected_date,
    calculated_subtotal,
    calculated_subtotal,
    nullif(trim(requested_notes), ''),
    current_user_id
  );

  insert into public.purchase_order_items (
    purchase_order_id,
    medicine_id,
    ordered_quantity,
    unit_cost,
    intended_selling_price
  )
  select
    new_order_id,
    medicine_id,
    ordered_quantity,
    unit_cost,
    intended_selling_price
  from pg_temp.purchase_items;

  return new_order_id;
end;
$$;

create or replace function public.set_purchase_order_status(
  requested_order_id uuid,
  requested_status public.purchase_order_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_app_role public.app_role;
  current_status public.purchase_order_status;
begin
  select role
  into current_app_role
  from public.profiles
  where id = current_user_id
    and is_active = true;

  if current_user_id is null
    or current_app_role not in ('admin', 'pharmacist') then
    raise exception 'Only active Admin and Pharmacist users can manage purchase orders.';
  end if;

  select status
  into current_status
  from public.purchase_orders
  where id = requested_order_id
  for update;

  if current_status is null then
    raise exception 'Purchase order not found.';
  end if;

  if requested_status = 'ordered' and current_status = 'draft' then
    update public.purchase_orders
    set status = 'ordered',
        ordered_at = now()
    where id = requested_order_id;
    return;
  end if;

  if requested_status = 'cancelled' and current_status in ('draft', 'ordered') then
    update public.purchase_orders
    set status = 'cancelled'
    where id = requested_order_id;
    return;
  end if;

  raise exception 'This purchase order status change is not allowed.';
end;
$$;

create or replace function public.receive_purchase_order(
  requested_order_id uuid,
  requested_deliveries jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_app_role public.app_role;
  order_record record;
  delivery_record record;
  new_batch_id uuid;
  received_time timestamptz := now();
begin
  select role
  into current_app_role
  from public.profiles
  where id = current_user_id
    and is_active = true;

  if current_user_id is null
    or current_app_role not in ('admin', 'pharmacist') then
    raise exception 'Only active Admin and Pharmacist users can receive purchase orders.';
  end if;

  select id, order_number, supplier_id, status
  into order_record
  from public.purchase_orders
  where id = requested_order_id
  for update;

  if order_record.id is null then
    raise exception 'Purchase order not found.';
  end if;

  if order_record.status <> 'ordered' then
    raise exception 'Only an ordered purchase order can be delivered.';
  end if;

  if requested_deliveries is null
    or jsonb_typeof(requested_deliveries) <> 'array'
    or jsonb_array_length(requested_deliveries) = 0 then
    raise exception 'Delivery batch details are required.';
  end if;

  create temporary table if not exists pg_temp.purchase_deliveries (
    purchase_order_item_id uuid primary key,
    batch_number text not null,
    expiry_date date not null
  ) on commit drop;

  truncate table pg_temp.purchase_deliveries;

  insert into pg_temp.purchase_deliveries (
    purchase_order_item_id,
    batch_number,
    expiry_date
  )
  select
    delivery.purchase_order_item_id,
    trim(delivery.batch_number),
    delivery.expiry_date
  from jsonb_to_recordset(requested_deliveries) as delivery(
    purchase_order_item_id uuid,
    batch_number text,
    expiry_date date
  );

  if (select count(*) from pg_temp.purchase_deliveries)
    <> jsonb_array_length(requested_deliveries) then
    raise exception 'Each purchase item must have one delivery batch.';
  end if;

  if (select count(*) from pg_temp.purchase_deliveries)
    <> (
      select count(*)
      from public.purchase_order_items
      where purchase_order_id = requested_order_id
    ) then
    raise exception 'Batch details are required for every purchase item.';
  end if;

  if exists (
    select 1
    from pg_temp.purchase_deliveries
    where length(batch_number) = 0
      or expiry_date < current_date
  ) then
    raise exception 'Batch numbers are required and expiry dates cannot be in the past.';
  end if;

  if exists (
    select 1
    from pg_temp.purchase_deliveries as delivery
    left join public.purchase_order_items as item
      on item.id = delivery.purchase_order_item_id
      and item.purchase_order_id = requested_order_id
    where item.id is null
  ) then
    raise exception 'A delivery item does not belong to this purchase order.';
  end if;

  if exists (
    select 1
    from pg_temp.purchase_deliveries as delivery
    join public.purchase_order_items as item
      on item.id = delivery.purchase_order_item_id
    join public.inventory_batches as batch
      on batch.medicine_id = item.medicine_id
      and lower(batch.batch_number) = lower(delivery.batch_number)
  ) then
    raise exception 'A batch number already exists for one of these medicines.';
  end if;

  for delivery_record in
    select
      item.id as purchase_order_item_id,
      item.medicine_id,
      item.ordered_quantity,
      item.unit_cost,
      item.intended_selling_price,
      delivery.batch_number,
      delivery.expiry_date
    from public.purchase_order_items as item
    join pg_temp.purchase_deliveries as delivery
      on delivery.purchase_order_item_id = item.id
    where item.purchase_order_id = requested_order_id
    order by item.id
  loop
    new_batch_id := gen_random_uuid();

    insert into public.inventory_batches (
      id,
      medicine_id,
      supplier_id,
      purchase_order_item_id,
      batch_number,
      expiry_date,
      cost_price,
      selling_price,
      initial_quantity,
      current_quantity,
      received_at
    )
    values (
      new_batch_id,
      delivery_record.medicine_id,
      order_record.supplier_id,
      delivery_record.purchase_order_item_id,
      delivery_record.batch_number,
      delivery_record.expiry_date,
      delivery_record.unit_cost,
      delivery_record.intended_selling_price,
      delivery_record.ordered_quantity,
      delivery_record.ordered_quantity,
      received_time
    );

    update public.purchase_order_items
    set received_quantity = ordered_quantity
    where id = delivery_record.purchase_order_item_id;

    update public.medicines
    set default_cost_price = delivery_record.unit_cost,
        default_selling_price = case
          when delivery_record.intended_selling_price > 0
            then delivery_record.intended_selling_price
          else default_selling_price
        end,
        default_supplier_id = order_record.supplier_id
    where id = delivery_record.medicine_id;

    insert into public.inventory_adjustments (
      medicine_id,
      inventory_batch_id,
      adjustment_type,
      quantity_change,
      reason,
      reference_type,
      reference_id,
      performed_by
    )
    values (
      delivery_record.medicine_id,
      new_batch_id,
      'receive',
      delivery_record.ordered_quantity,
      'Received purchase order ' || order_record.order_number,
      'purchase_order',
      requested_order_id,
      current_user_id
    );
  end loop;

  update public.purchase_orders
  set status = 'received',
      received_at = received_time
  where id = requested_order_id;
end;
$$;

revoke all on function public.create_purchase_order(uuid, date, text, jsonb)
from public, anon;
revoke all on function public.set_purchase_order_status(
  uuid,
  public.purchase_order_status
) from public, anon;
revoke all on function public.receive_purchase_order(uuid, jsonb)
from public, anon;

grant execute on function public.create_purchase_order(uuid, date, text, jsonb)
to authenticated;
grant execute on function public.set_purchase_order_status(
  uuid,
  public.purchase_order_status
) to authenticated;
grant execute on function public.receive_purchase_order(uuid, jsonb)
to authenticated;

commit;
