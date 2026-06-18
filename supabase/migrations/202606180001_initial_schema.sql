begin;

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'pharmacist', 'cashier');
create type public.record_status as enum ('active', 'inactive');
create type public.sale_status as enum ('draft', 'completed', 'voided');
create type public.payment_method as enum ('cash', 'card', 'other');
create type public.purchase_order_status as enum (
  'draft',
  'ordered',
  'partially_received',
  'received',
  'cancelled'
);
create type public.inventory_adjustment_type as enum (
  'receive',
  'increase',
  'decrease',
  'correction',
  'sale',
  'sale_void'
);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.app_role not null default 'cashier',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_not_blank check (length(trim(email)) > 0)
);

create table public.medicine_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medicine_categories_name_not_blank check (length(trim(name)) > 0)
);

create unique index medicine_categories_name_unique
  on public.medicine_categories (lower(name));

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_name_not_blank check (length(trim(name)) > 0),
  constraint suppliers_email_format check (
    email is null or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
);

create index suppliers_name_idx on public.suppliers (name);

create table public.medicines (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  generic_name text,
  dosage_form text not null,
  strength text,
  category_id uuid references public.medicine_categories (id) on delete set null,
  default_supplier_id uuid references public.suppliers (id) on delete set null,
  sku text,
  barcode text,
  unit text not null default 'unit',
  default_selling_price numeric(12, 2) not null default 0,
  default_cost_price numeric(12, 2) not null default 0,
  reorder_threshold integer not null default 0,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medicines_brand_name_not_blank check (length(trim(brand_name)) > 0),
  constraint medicines_dosage_form_not_blank check (length(trim(dosage_form)) > 0),
  constraint medicines_unit_not_blank check (length(trim(unit)) > 0),
  constraint medicines_selling_price_nonnegative check (default_selling_price >= 0),
  constraint medicines_cost_price_nonnegative check (default_cost_price >= 0),
  constraint medicines_reorder_threshold_nonnegative check (reorder_threshold >= 0),
  constraint medicines_sku_not_blank check (sku is null or length(trim(sku)) > 0),
  constraint medicines_barcode_not_blank check (barcode is null or length(trim(barcode)) > 0)
);

create unique index medicines_sku_unique
  on public.medicines (lower(sku))
  where sku is not null;
create unique index medicines_barcode_unique
  on public.medicines (barcode)
  where barcode is not null;
create index medicines_brand_name_idx on public.medicines (brand_name);
create index medicines_generic_name_idx on public.medicines (generic_name);
create index medicines_category_id_idx on public.medicines (category_id);
create index medicines_default_supplier_id_idx on public.medicines (default_supplier_id);
create index medicines_status_idx on public.medicines (status);

create table public.inventory_batches (
  id uuid primary key default gen_random_uuid(),
  medicine_id uuid not null references public.medicines (id) on delete restrict,
  supplier_id uuid references public.suppliers (id) on delete set null,
  batch_number text not null,
  expiry_date date not null,
  cost_price numeric(12, 2) not null,
  selling_price numeric(12, 2) not null,
  initial_quantity integer not null,
  current_quantity integer not null,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_batches_batch_not_blank check (length(trim(batch_number)) > 0),
  constraint inventory_batches_cost_nonnegative check (cost_price >= 0),
  constraint inventory_batches_selling_nonnegative check (selling_price >= 0),
  constraint inventory_batches_initial_quantity_positive check (initial_quantity > 0),
  constraint inventory_batches_current_quantity_nonnegative check (current_quantity >= 0),
  constraint inventory_batches_medicine_batch_unique unique (medicine_id, batch_number)
);

create index inventory_batches_medicine_id_idx
  on public.inventory_batches (medicine_id);
create index inventory_batches_supplier_id_idx
  on public.inventory_batches (supplier_id);
create index inventory_batches_expiry_date_idx
  on public.inventory_batches (expiry_date);
create index inventory_batches_saleable_idx
  on public.inventory_batches (medicine_id, expiry_date, received_at)
  where current_quantity > 0;

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  sale_number text not null unique,
  status public.sale_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  amount_paid numeric(12, 2) not null default 0,
  change_amount numeric(12, 2) not null default 0,
  payment_method public.payment_method not null default 'cash',
  cashier_id uuid not null references public.profiles (id) on delete restrict,
  completed_at timestamptz,
  voided_at timestamptz,
  voided_by uuid references public.profiles (id) on delete restrict,
  void_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sales_number_not_blank check (length(trim(sale_number)) > 0),
  constraint sales_amounts_nonnegative check (
    subtotal >= 0
    and discount_amount >= 0
    and tax_amount >= 0
    and total_amount >= 0
    and amount_paid >= 0
    and change_amount >= 0
  ),
  constraint sales_discount_not_above_subtotal check (discount_amount <= subtotal),
  constraint sales_completion_fields check (
    (status <> 'completed' or completed_at is not null)
    and (status <> 'voided' or (voided_at is not null and voided_by is not null))
  )
);

create index sales_cashier_id_idx on public.sales (cashier_id);
create index sales_status_idx on public.sales (status);
create index sales_created_at_idx on public.sales (created_at desc);
create index sales_completed_at_idx on public.sales (completed_at desc);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales (id) on delete cascade,
  medicine_id uuid not null references public.medicines (id) on delete restrict,
  inventory_batch_id uuid references public.inventory_batches (id) on delete restrict,
  quantity integer not null,
  unit_price numeric(12, 2) not null,
  cost_price_snapshot numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  constraint sale_items_quantity_positive check (quantity > 0),
  constraint sale_items_amounts_nonnegative check (
    unit_price >= 0
    and cost_price_snapshot >= 0
    and discount_amount >= 0
    and line_total >= 0
  ),
  constraint sale_items_discount_valid check (
    discount_amount <= unit_price * quantity
  )
);

create index sale_items_sale_id_idx on public.sale_items (sale_id);
create index sale_items_medicine_id_idx on public.sale_items (medicine_id);
create index sale_items_inventory_batch_id_idx on public.sale_items (inventory_batch_id);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  supplier_id uuid not null references public.suppliers (id) on delete restrict,
  status public.purchase_order_status not null default 'draft',
  expected_date date,
  subtotal numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  notes text,
  created_by uuid not null references public.profiles (id) on delete restrict,
  ordered_at timestamptz,
  received_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_orders_number_not_blank check (length(trim(order_number)) > 0),
  constraint purchase_orders_amounts_nonnegative check (
    subtotal >= 0
    and discount_amount >= 0
    and tax_amount >= 0
    and total_amount >= 0
  ),
  constraint purchase_orders_discount_not_above_subtotal check (
    discount_amount <= subtotal
  )
);

create index purchase_orders_supplier_id_idx on public.purchase_orders (supplier_id);
create index purchase_orders_status_idx on public.purchase_orders (status);
create index purchase_orders_created_at_idx on public.purchase_orders (created_at desc);

create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders (id) on delete cascade,
  medicine_id uuid not null references public.medicines (id) on delete restrict,
  ordered_quantity integer not null,
  received_quantity integer not null default 0,
  unit_cost numeric(12, 2) not null,
  intended_selling_price numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_order_items_ordered_positive check (ordered_quantity > 0),
  constraint purchase_order_items_received_valid check (
    received_quantity >= 0 and received_quantity <= ordered_quantity
  ),
  constraint purchase_order_items_prices_nonnegative check (
    unit_cost >= 0 and intended_selling_price >= 0
  ),
  constraint purchase_order_items_order_medicine_unique
    unique (purchase_order_id, medicine_id)
);

create index purchase_order_items_order_id_idx
  on public.purchase_order_items (purchase_order_id);
create index purchase_order_items_medicine_id_idx
  on public.purchase_order_items (medicine_id);

alter table public.inventory_batches
  add column purchase_order_item_id uuid
  references public.purchase_order_items (id) on delete set null;

create index inventory_batches_purchase_order_item_id_idx
  on public.inventory_batches (purchase_order_item_id);

create table public.inventory_adjustments (
  id uuid primary key default gen_random_uuid(),
  medicine_id uuid not null references public.medicines (id) on delete restrict,
  inventory_batch_id uuid not null references public.inventory_batches (id) on delete restrict,
  adjustment_type public.inventory_adjustment_type not null,
  quantity_change integer not null,
  reason text not null,
  reference_type text,
  reference_id uuid,
  performed_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint inventory_adjustments_quantity_nonzero check (quantity_change <> 0),
  constraint inventory_adjustments_reason_not_blank check (length(trim(reason)) > 0)
);

create index inventory_adjustments_medicine_id_idx
  on public.inventory_adjustments (medicine_id);
create index inventory_adjustments_batch_id_idx
  on public.inventory_adjustments (inventory_batch_id);
create index inventory_adjustments_performed_by_idx
  on public.inventory_adjustments (performed_by);
create index inventory_adjustments_created_at_idx
  on public.inventory_adjustments (created_at desc);
create index inventory_adjustments_reference_idx
  on public.inventory_adjustments (reference_type, reference_id);

create table public.app_settings (
  singleton boolean primary key default true,
  pharmacy_name text not null default 'My Pharmacy',
  phone text,
  email text,
  address text,
  currency_code text not null default 'USD',
  tax_rate numeric(5, 2) not null default 0,
  expiry_alert_days integer not null default 30,
  default_reorder_threshold integer not null default 10,
  receipt_footer text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (singleton),
  constraint app_settings_name_not_blank check (length(trim(pharmacy_name)) > 0),
  constraint app_settings_currency_code check (currency_code ~ '^[A-Z]{3}$'),
  constraint app_settings_tax_rate_valid check (tax_rate >= 0 and tax_rate <= 100),
  constraint app_settings_expiry_days_nonnegative check (expiry_alert_days >= 0),
  constraint app_settings_reorder_nonnegative check (default_reorder_threshold >= 0)
);

insert into public.app_settings (singleton) values (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, new.id::text || '@pending.local'),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'cashier'
  );
  return new;
end;
$$;

create or replace function private.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and is_active = true
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_user_role() = 'admin', false)
$$;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_user_role() in ('admin', 'pharmacist'), false)
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function private.current_user_role() from public, anon;
revoke all on function private.is_admin() from public, anon;
revoke all on function private.is_staff() from public, anon;
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_staff() to authenticated;

insert into public.profiles (id, email, full_name, role)
select
  users.id,
  coalesce(users.email, users.id::text || '@pending.local'),
  coalesce(users.raw_user_meta_data ->> 'full_name', ''),
  'cashier'
from auth.users
on conflict (id) do nothing;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
create trigger medicine_categories_updated_at
before update on public.medicine_categories
for each row execute function public.set_updated_at();
create trigger suppliers_updated_at
before update on public.suppliers
for each row execute function public.set_updated_at();
create trigger medicines_updated_at
before update on public.medicines
for each row execute function public.set_updated_at();
create trigger inventory_batches_updated_at
before update on public.inventory_batches
for each row execute function public.set_updated_at();
create trigger sales_updated_at
before update on public.sales
for each row execute function public.set_updated_at();
create trigger purchase_orders_updated_at
before update on public.purchase_orders
for each row execute function public.set_updated_at();
create trigger purchase_order_items_updated_at
before update on public.purchase_order_items
for each row execute function public.set_updated_at();
create trigger app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create view public.medicine_inventory_summary
with (security_invoker = true)
as
select
  m.id as medicine_id,
  coalesce(sum(b.current_quantity), 0)::bigint as total_stock,
  coalesce(
    sum(b.current_quantity) filter (where b.expiry_date >= current_date),
    0
  )::bigint as saleable_stock,
  min(b.expiry_date) filter (
    where b.current_quantity > 0 and b.expiry_date >= current_date
  ) as nearest_expiry_date
from public.medicines m
left join public.inventory_batches b on b.medicine_id = m.id
group by m.id;

alter table public.profiles enable row level security;
alter table public.medicine_categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.medicines enable row level security;
alter table public.inventory_batches enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.inventory_adjustments enable row level security;
alter table public.app_settings enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or private.is_admin());

create policy "profiles_insert_admin"
on public.profiles for insert to authenticated
with check (private.is_admin());

create policy "profiles_update_admin"
on public.profiles for update to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "categories_select_authenticated"
on public.medicine_categories for select to authenticated
using (private.current_user_role() is not null);

create policy "categories_insert_staff"
on public.medicine_categories for insert to authenticated
with check (private.is_staff());

create policy "categories_update_staff"
on public.medicine_categories for update to authenticated
using (private.is_staff())
with check (private.is_staff());

create policy "categories_delete_staff"
on public.medicine_categories for delete to authenticated
using (private.is_staff());

create policy "suppliers_select_staff"
on public.suppliers for select to authenticated
using (private.is_staff());

create policy "suppliers_insert_staff"
on public.suppliers for insert to authenticated
with check (private.is_staff());

create policy "suppliers_update_staff"
on public.suppliers for update to authenticated
using (private.is_staff())
with check (private.is_staff());

create policy "suppliers_delete_staff"
on public.suppliers for delete to authenticated
using (private.is_staff());

create policy "medicines_select_authenticated"
on public.medicines for select to authenticated
using (private.current_user_role() is not null);

create policy "medicines_insert_staff"
on public.medicines for insert to authenticated
with check (private.is_staff());

create policy "medicines_update_staff"
on public.medicines for update to authenticated
using (private.is_staff())
with check (private.is_staff());

create policy "medicines_delete_staff"
on public.medicines for delete to authenticated
using (private.is_staff());

create policy "batches_select_authenticated"
on public.inventory_batches for select to authenticated
using (private.current_user_role() is not null);

create policy "batches_insert_staff"
on public.inventory_batches for insert to authenticated
with check (private.is_staff());

create policy "batches_update_staff"
on public.inventory_batches for update to authenticated
using (private.is_staff())
with check (private.is_staff());

create policy "batches_delete_staff"
on public.inventory_batches for delete to authenticated
using (private.is_staff());

create policy "sales_select_staff_or_own"
on public.sales for select to authenticated
using (private.is_staff() or cashier_id = auth.uid());

create policy "sales_insert_staff"
on public.sales for insert to authenticated
with check (private.is_staff());

create policy "sales_insert_cashier_own_draft"
on public.sales for insert to authenticated
with check (
  private.current_user_role() = 'cashier'
  and cashier_id = auth.uid()
  and status = 'draft'
);

create policy "sales_update_staff"
on public.sales for update to authenticated
using (private.is_staff())
with check (private.is_staff());

create policy "sale_items_select_staff_or_own_sale"
on public.sale_items for select to authenticated
using (
  private.is_staff()
  or exists (
    select 1
    from public.sales
    where sales.id = sale_items.sale_id
      and sales.cashier_id = auth.uid()
  )
);

create policy "sale_items_insert_staff"
on public.sale_items for insert to authenticated
with check (private.is_staff());

create policy "sale_items_insert_cashier_own_draft"
on public.sale_items for insert to authenticated
with check (
  private.current_user_role() = 'cashier'
  and exists (
    select 1
    from public.sales
    where sales.id = sale_items.sale_id
      and sales.cashier_id = auth.uid()
      and sales.status = 'draft'
  )
);

create policy "sale_items_update_staff"
on public.sale_items for update to authenticated
using (private.is_staff())
with check (private.is_staff());

create policy "sale_items_delete_staff"
on public.sale_items for delete to authenticated
using (private.is_staff());

create policy "purchase_orders_select_staff"
on public.purchase_orders for select to authenticated
using (private.is_staff());

create policy "purchase_orders_insert_staff"
on public.purchase_orders for insert to authenticated
with check (private.is_staff());

create policy "purchase_orders_update_staff"
on public.purchase_orders for update to authenticated
using (private.is_staff())
with check (private.is_staff());

create policy "purchase_orders_delete_staff"
on public.purchase_orders for delete to authenticated
using (private.is_staff());

create policy "purchase_order_items_select_staff"
on public.purchase_order_items for select to authenticated
using (private.is_staff());

create policy "purchase_order_items_insert_staff"
on public.purchase_order_items for insert to authenticated
with check (private.is_staff());

create policy "purchase_order_items_update_staff"
on public.purchase_order_items for update to authenticated
using (private.is_staff())
with check (private.is_staff());

create policy "purchase_order_items_delete_staff"
on public.purchase_order_items for delete to authenticated
using (private.is_staff());

create policy "inventory_adjustments_select_staff"
on public.inventory_adjustments for select to authenticated
using (private.is_staff());

create policy "inventory_adjustments_insert_staff"
on public.inventory_adjustments for insert to authenticated
with check (private.is_staff() and performed_by = auth.uid());

create policy "app_settings_select_authenticated"
on public.app_settings for select to authenticated
using (private.current_user_role() is not null);

create policy "app_settings_update_admin"
on public.app_settings for update to authenticated
using (private.is_admin())
with check (private.is_admin());

revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, update, delete on public.medicine_inventory_summary from authenticated;
grant select on public.medicine_inventory_summary to authenticated;

commit;
