begin;

create or replace function public.complete_sale(
  requested_items jsonb,
  requested_discount numeric default 0,
  requested_payment_method public.payment_method default 'cash'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_role public.app_role;
  new_sale_id uuid := gen_random_uuid();
  new_sale_number text :=
    'S-' || to_char(clock_timestamp(), 'YYYYMMDD-HH24MISS') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  completed_time timestamptz := now();
  requested_item record;
  batch_record record;
  remaining_quantity integer;
  allocated_quantity integer;
  calculated_subtotal numeric(12, 2) := 0;
  calculated_total numeric(12, 2);
  result_items jsonb;
begin
  select role
  into current_role
  from public.profiles
  where id = current_user_id
    and is_active = true;

  if current_user_id is null or current_role is null then
    raise exception 'An active staff account is required.';
  end if;

  if current_role not in ('admin', 'pharmacist', 'cashier') then
    raise exception 'This account cannot create sales.';
  end if;

  if requested_items is null
    or jsonb_typeof(requested_items) <> 'array'
    or jsonb_array_length(requested_items) = 0 then
    raise exception 'Add at least one medicine to the sale.';
  end if;

  if requested_discount is null or requested_discount < 0 then
    raise exception 'Discount cannot be negative.';
  end if;

  create temporary table if not exists pg_temp.sale_allocations (
    medicine_id uuid not null,
    inventory_batch_id uuid not null,
    quantity integer not null,
    unit_price numeric(12, 2) not null,
    cost_price numeric(12, 2) not null,
    line_total numeric(12, 2) not null
  ) on commit drop;

  truncate table pg_temp.sale_allocations;

  for requested_item in
    select
      item.medicine_id,
      sum(item.quantity)::integer as quantity
    from jsonb_to_recordset(requested_items)
      as item(medicine_id uuid, quantity integer)
    group by item.medicine_id
    order by item.medicine_id
  loop
    if requested_item.medicine_id is null
      or requested_item.quantity is null
      or requested_item.quantity <= 0 then
      raise exception 'Every sale item must have a positive quantity.';
    end if;

    if not exists (
      select 1
      from public.medicines
      where id = requested_item.medicine_id
        and status = 'active'
    ) then
      raise exception 'A selected medicine is inactive or unavailable.';
    end if;

    remaining_quantity := requested_item.quantity;

    for batch_record in
      select
        id,
        current_quantity,
        selling_price,
        cost_price
      from public.inventory_batches
      where medicine_id = requested_item.medicine_id
        and current_quantity > 0
        and expiry_date >= current_date
      order by expiry_date, received_at, id
      for update
    loop
      exit when remaining_quantity = 0;

      allocated_quantity := least(
        remaining_quantity,
        batch_record.current_quantity
      );

      insert into pg_temp.sale_allocations (
        medicine_id,
        inventory_batch_id,
        quantity,
        unit_price,
        cost_price,
        line_total
      )
      values (
        requested_item.medicine_id,
        batch_record.id,
        allocated_quantity,
        batch_record.selling_price,
        batch_record.cost_price,
        round(batch_record.selling_price * allocated_quantity, 2)
      );

      calculated_subtotal :=
        calculated_subtotal +
        round(batch_record.selling_price * allocated_quantity, 2);
      remaining_quantity := remaining_quantity - allocated_quantity;
    end loop;

    if remaining_quantity > 0 then
      raise exception 'Insufficient saleable stock for one or more medicines.';
    end if;
  end loop;

  calculated_subtotal := round(calculated_subtotal, 2);

  if requested_discount > calculated_subtotal then
    raise exception 'Discount cannot be greater than the subtotal.';
  end if;

  calculated_total := round(calculated_subtotal - requested_discount, 2);

  insert into public.sales (
    id,
    sale_number,
    status,
    subtotal,
    discount_amount,
    total_amount,
    amount_paid,
    payment_method,
    cashier_id,
    completed_at
  )
  values (
    new_sale_id,
    new_sale_number,
    'completed',
    calculated_subtotal,
    round(requested_discount, 2),
    calculated_total,
    calculated_total,
    requested_payment_method,
    current_user_id,
    completed_time
  );

  insert into public.sale_items (
    sale_id,
    medicine_id,
    inventory_batch_id,
    quantity,
    unit_price,
    cost_price_snapshot,
    line_total
  )
  select
    new_sale_id,
    medicine_id,
    inventory_batch_id,
    quantity,
    unit_price,
    cost_price,
    line_total
  from pg_temp.sale_allocations;

  update public.inventory_batches as batch
  set current_quantity = batch.current_quantity - allocation.quantity
  from (
    select inventory_batch_id, sum(quantity)::integer as quantity
    from pg_temp.sale_allocations
    group by inventory_batch_id
  ) as allocation
  where batch.id = allocation.inventory_batch_id;

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
  select
    medicine_id,
    inventory_batch_id,
    'sale',
    -quantity,
    'Completed sale ' || new_sale_number,
    'sale',
    new_sale_id,
    current_user_id
  from pg_temp.sale_allocations;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', sale_item.id,
        'medicine_id', sale_item.medicine_id,
        'medicine_name', medicine.brand_name,
        'batch_number', batch.batch_number,
        'quantity', sale_item.quantity,
        'unit_price', sale_item.unit_price,
        'line_total', sale_item.line_total
      )
      order by medicine.brand_name, batch.expiry_date
    ),
    '[]'::jsonb
  )
  into result_items
  from public.sale_items as sale_item
  join public.medicines as medicine on medicine.id = sale_item.medicine_id
  join public.inventory_batches as batch
    on batch.id = sale_item.inventory_batch_id
  where sale_item.sale_id = new_sale_id;

  return jsonb_build_object(
    'id', new_sale_id,
    'sale_number', new_sale_number,
    'subtotal', calculated_subtotal,
    'discount_amount', round(requested_discount, 2),
    'total_amount', calculated_total,
    'payment_method', requested_payment_method,
    'completed_at', completed_time,
    'items', result_items
  );
end;
$$;

revoke all on function public.complete_sale(
  jsonb,
  numeric,
  public.payment_method
) from public, anon;

grant execute on function public.complete_sale(
  jsonb,
  numeric,
  public.payment_method
) to authenticated;

commit;
