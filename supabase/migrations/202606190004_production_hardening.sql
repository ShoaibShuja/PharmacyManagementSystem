begin;

-- Profiles are created by the Auth trigger. Role changes must use the protected RPC.
drop policy if exists "profiles_insert_admin" on public.profiles;

-- Historical master data is deactivated, never deleted from the browser.
drop policy if exists "categories_delete_staff" on public.medicine_categories;
drop policy if exists "suppliers_delete_staff" on public.suppliers;
drop policy if exists "medicines_delete_staff" on public.medicines;

-- Inventory, sales, purchases, and audit rows are changed only by security-definer
-- workflows so browser clients cannot bypass validation or transactional locking.
drop policy if exists "batches_insert_staff" on public.inventory_batches;
drop policy if exists "batches_update_staff" on public.inventory_batches;
drop policy if exists "batches_delete_staff" on public.inventory_batches;

drop policy if exists "sales_insert_staff" on public.sales;
drop policy if exists "sales_insert_cashier_own_draft" on public.sales;
drop policy if exists "sales_update_staff" on public.sales;

drop policy if exists "sale_items_insert_staff" on public.sale_items;
drop policy if exists "sale_items_insert_cashier_own_draft" on public.sale_items;
drop policy if exists "sale_items_update_staff" on public.sale_items;
drop policy if exists "sale_items_delete_staff" on public.sale_items;

drop policy if exists "purchase_orders_insert_staff" on public.purchase_orders;
drop policy if exists "purchase_orders_update_staff" on public.purchase_orders;
drop policy if exists "purchase_orders_delete_staff" on public.purchase_orders;

drop policy if exists "purchase_order_items_insert_staff"
on public.purchase_order_items;
drop policy if exists "purchase_order_items_update_staff"
on public.purchase_order_items;
drop policy if exists "purchase_order_items_delete_staff"
on public.purchase_order_items;

drop policy if exists "inventory_adjustments_insert_staff"
on public.inventory_adjustments;

create or replace function public.validate_purchase_order_dates()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.expected_date is not null and new.expected_date < current_date then
    raise exception 'Expected delivery date cannot be in the past.';
  end if;
  return new;
end;
$$;

revoke all on function public.validate_purchase_order_dates()
from public, anon, authenticated;

drop trigger if exists purchase_orders_validate_dates
on public.purchase_orders;
create trigger purchase_orders_validate_dates
before insert or update of expected_date on public.purchase_orders
for each row execute function public.validate_purchase_order_dates();

-- Physical batch numbers are case-insensitively unique per medicine.
do $$
begin
  if exists (
    select 1
    from public.inventory_batches
    group by medicine_id, lower(batch_number)
    having count(*) > 1
  ) then
    raise exception
      'Case-insensitive duplicate batch numbers must be corrected before applying production hardening.';
  end if;
end;
$$;

create unique index if not exists inventory_batches_medicine_batch_lower_unique
  on public.inventory_batches (medicine_id, lower(batch_number));

commit;
