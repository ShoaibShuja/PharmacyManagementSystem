-- Darman demo reset and seed
-- Run this entire file in Supabase SQL Editor. It removes pharmacy business
-- data but deliberately preserves auth.users and public.profiles, including roles.
-- This is destructive for catalog, stock, sales, purchases, and settings data.

begin;

do $$
begin
  if not exists (select 1 from public.profiles where is_active) then
    raise exception 'Create and activate at least one user profile before running this seed.';
  end if;
end;
$$;

-- Dependent rows are included explicitly. Do not add profiles or auth.users here.
truncate table
  public.inventory_adjustments,
  public.sale_items,
  public.sales,
  public.inventory_batches,
  public.purchase_order_items,
  public.purchase_orders,
  public.medicines,
  public.medicine_categories,
  public.suppliers;

insert into public.app_settings (
  singleton, pharmacy_name, phone, email, address, currency_code,
  tax_rate, expiry_alert_days, default_reorder_threshold, receipt_footer, updated_by
)
select
  true, 'Darman Pharmacy', '+93 700 123 456', 'hello@darman.example',
  'Kabul, Afghanistan', 'AFN', 0, 90, 12,
  'Thank you for choosing Darman Pharmacy.', id
from public.profiles
where is_active
order by case role when 'admin' then 0 when 'pharmacist' then 1 else 2 end, created_at
limit 1
on conflict (singleton) do update set
  pharmacy_name = excluded.pharmacy_name,
  phone = excluded.phone,
  email = excluded.email,
  address = excluded.address,
  currency_code = excluded.currency_code,
  tax_rate = excluded.tax_rate,
  expiry_alert_days = excluded.expiry_alert_days,
  default_reorder_threshold = excluded.default_reorder_threshold,
  receipt_footer = excluded.receipt_footer,
  updated_by = excluded.updated_by;

insert into public.medicine_categories (name, description)
values
  ('Pain Relief', 'Pain and fever medicines.'),
  ('Antibiotics', 'Antibacterial medicines.'),
  ('Cold and Flu', 'Cold, cough, and allergy relief.'),
  ('Digestive Health', 'Stomach and digestive medicines.'),
  ('Vitamins and Supplements', 'Daily vitamins and minerals.'),
  ('First Aid', 'Wound care and basic medical supplies.');

insert into public.suppliers (name, contact_person, phone, email, address, notes)
values
  ('Kabul Medical Distributors', 'Ahmad Rahimi', '+93 700 111 201', 'orders@kabulmedical.example', 'Kabul Industrial Park', 'Primary medicines supplier.'),
  ('Aryana Pharma Supply', 'Laila Safi', '+93 700 111 202', 'sales@aryanapharma.example', 'Shahr-e-Naw, Kabul', 'Fast delivery for common stock.'),
  ('HealthPlus Wholesale', 'Farid Hamdard', '+93 700 111 203', 'support@healthplus.example', 'Kart-e-Se, Kabul', 'Supplements and first-aid products.'),
  ('Nawbahar Laboratories', 'Mina Azizi', '+93 700 111 204', 'trade@nawbahar.example', 'Jalalabad Road, Kabul', 'Local generic manufacturer.');

insert into public.medicines (
  brand_name, generic_name, dosage_form, strength, category_id, default_supplier_id,
  sku, barcode, unit, default_selling_price, default_cost_price, reorder_threshold
)
select v.brand_name, v.generic_name, v.dosage_form, v.strength,
  (select id from public.medicine_categories where name = v.category_name),
  (select id from public.suppliers where name = v.supplier_name),
  v.sku, v.barcode, v.unit, v.selling_price, v.cost_price, v.reorder_threshold
from (values
  ('Panadol', 'Paracetamol', 'Tablet', '500 mg', 'Pain Relief', 'Kabul Medical Distributors', 'MED-001', '8901000000011', 'box', 85.00, 60.00, 20),
  ('Brufen', 'Ibuprofen', 'Tablet', '400 mg', 'Pain Relief', 'Aryana Pharma Supply', 'MED-002', '8901000000028', 'box', 95.00, 68.00, 15),
  ('Diclofenac Gel', 'Diclofenac', 'Gel', '1%', 'Pain Relief', 'Nawbahar Laboratories', 'MED-003', '8901000000035', 'tube', 120.00, 82.00, 10),
  ('Amoxil', 'Amoxicillin', 'Capsule', '500 mg', 'Antibiotics', 'Kabul Medical Distributors', 'MED-004', '8901000000042', 'box', 180.00, 130.00, 12),
  ('Azithro', 'Azithromycin', 'Tablet', '500 mg', 'Antibiotics', 'Aryana Pharma Supply', 'MED-005', '8901000000059', 'strip', 150.00, 105.00, 10),
  ('Cefixime', 'Cefixime', 'Capsule', '400 mg', 'Antibiotics', 'Kabul Medical Distributors', 'MED-006', '8901000000066', 'box', 240.00, 175.00, 8),
  ('Cetirizine', 'Cetirizine', 'Tablet', '10 mg', 'Cold and Flu', 'Aryana Pharma Supply', 'MED-007', '8901000000073', 'strip', 45.00, 28.00, 18),
  ('Cough Relief', 'Dextromethorphan', 'Syrup', '100 ml', 'Cold and Flu', 'Nawbahar Laboratories', 'MED-008', '8901000000080', 'bottle', 110.00, 75.00, 12),
  ('ORS Plus', 'Oral rehydration salts', 'Powder', '21 g', 'Digestive Health', 'HealthPlus Wholesale', 'MED-009', '8901000000097', 'sachet', 25.00, 14.00, 30),
  ('Omeprazole', 'Omeprazole', 'Capsule', '20 mg', 'Digestive Health', 'Kabul Medical Distributors', 'MED-010', '8901000000103', 'strip', 70.00, 46.00, 15),
  ('Antacid Suspension', 'Aluminium hydroxide', 'Suspension', '200 ml', 'Digestive Health', 'Aryana Pharma Supply', 'MED-011', '8901000000110', 'bottle', 130.00, 88.00, 10),
  ('Vitamin C', 'Ascorbic acid', 'Tablet', '500 mg', 'Vitamins and Supplements', 'HealthPlus Wholesale', 'MED-012', '8901000000127', 'bottle', 160.00, 110.00, 12),
  ('Vitamin D3', 'Cholecalciferol', 'Softgel', '1000 IU', 'Vitamins and Supplements', 'HealthPlus Wholesale', 'MED-013', '8901000000134', 'bottle', 210.00, 150.00, 10),
  ('Iron Plus', 'Ferrous sulfate', 'Tablet', '65 mg', 'Vitamins and Supplements', 'Nawbahar Laboratories', 'MED-014', '8901000000141', 'box', 115.00, 78.00, 10),
  ('Adhesive Bandage', 'Sterile bandage', 'Strip', 'Assorted', 'First Aid', 'HealthPlus Wholesale', 'MED-015', '8901000000158', 'pack', 60.00, 35.00, 20),
  ('Antiseptic Solution', 'Povidone iodine', 'Solution', '100 ml', 'First Aid', 'Nawbahar Laboratories', 'MED-016', '8901000000165', 'bottle', 90.00, 56.00, 12)
) as v(brand_name, generic_name, dosage_form, strength, category_name, supplier_name, sku, barcode, unit, selling_price, cost_price, reorder_threshold);

-- Two received, one ordered, and one draft purchase order exercise all main states.
insert into public.purchase_orders (id, order_number, supplier_id, status, subtotal, total_amount, notes, created_by, ordered_at, received_at, created_at)
select v.id, v.order_number, (select id from public.suppliers where name = v.supplier_name), v.status::public.purchase_order_status,
  v.subtotal, v.subtotal, v.notes, p.id, v.ordered_at, v.received_at, v.created_at
from (values
  ('10000000-0000-0000-0000-000000000001'::uuid, 'PO-DEMO-1001', 'Kabul Medical Distributors', 'received', 7900.00, 'Regular medicine replenishment.', now() - interval '18 days', now() - interval '15 days', now() - interval '20 days'),
  ('10000000-0000-0000-0000-000000000002'::uuid, 'PO-DEMO-1002', 'HealthPlus Wholesale', 'received', 6000.00, 'Supplements and first aid restock.', now() - interval '10 days', now() - interval '8 days', now() - interval '12 days'),
  ('10000000-0000-0000-0000-000000000003'::uuid, 'PO-DEMO-1003', 'Aryana Pharma Supply', 'ordered', 4450.00, 'Expected this week.', now() - interval '2 days', null::timestamptz, now() - interval '3 days'),
  ('10000000-0000-0000-0000-000000000004'::uuid, 'PO-DEMO-1004', 'Nawbahar Laboratories', 'draft', 1960.00, 'Review prices before ordering.', null::timestamptz, null::timestamptz, now() - interval '1 day')
) as v(id, order_number, supplier_name, status, subtotal, notes, ordered_at, received_at, created_at)
cross join lateral (select id from public.profiles where is_active order by case role when 'admin' then 0 when 'pharmacist' then 1 else 2 end, created_at limit 1) p;

insert into public.purchase_order_items (id, purchase_order_id, medicine_id, ordered_quantity, received_quantity, unit_cost, intended_selling_price)
select v.id, v.order_id, m.id, v.ordered_quantity, v.received_quantity, v.unit_cost, v.selling_price
from (values
  ('20000000-0000-0000-0000-000000000001'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'MED-001', 50, 50, 60.00, 85.00),
  ('20000000-0000-0000-0000-000000000002'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'MED-004', 30, 30, 130.00, 180.00),
  ('20000000-0000-0000-0000-000000000003'::uuid, '10000000-0000-0000-0000-000000000002'::uuid, 'MED-012', 20, 20, 110.00, 160.00),
  ('20000000-0000-0000-0000-000000000004'::uuid, '10000000-0000-0000-0000-000000000002'::uuid, 'MED-015', 40, 40, 35.00, 60.00),
  ('20000000-0000-0000-0000-000000000005'::uuid, '10000000-0000-0000-0000-000000000003'::uuid, 'MED-002', 25, 0, 68.00, 95.00),
  ('20000000-0000-0000-0000-000000000006'::uuid, '10000000-0000-0000-0000-000000000003'::uuid, 'MED-007', 60, 0, 28.00, 45.00),
  ('20000000-0000-0000-0000-000000000007'::uuid, '10000000-0000-0000-0000-000000000004'::uuid, 'MED-008', 20, 0, 75.00, 110.00),
  ('20000000-0000-0000-0000-000000000008'::uuid, '10000000-0000-0000-0000-000000000004'::uuid, 'MED-014', 10, 0, 78.00, 115.00)
) as v(id, order_id, sku, ordered_quantity, received_quantity, unit_cost, selling_price)
join public.medicines m on m.sku = v.sku;

insert into public.inventory_batches (
  medicine_id, supplier_id, purchase_order_item_id, batch_number, expiry_date,
  cost_price, selling_price, initial_quantity, current_quantity, received_at
)
select m.id, s.id, v.purchase_item_id, v.batch_number, current_date + v.expiry_days,
  v.cost_price, v.selling_price, v.quantity, v.quantity, now() - v.received_days * interval '1 day'
from (values
  ('MED-001', 'Kabul Medical Distributors', '20000000-0000-0000-0000-000000000001'::uuid, 'PAN-2401', 25, 60.00, 85.00, 50, 15),
  ('MED-001', 'Kabul Medical Distributors', null::uuid, 'PAN-2402', 360, 61.00, 85.00, 35, 5),
  ('MED-004', 'Kabul Medical Distributors', '20000000-0000-0000-0000-000000000002'::uuid, 'AMX-2401', 180, 130.00, 180.00, 30, 15),
  ('MED-012', 'HealthPlus Wholesale', '20000000-0000-0000-0000-000000000003'::uuid, 'VTC-2401', 70, 110.00, 160.00, 20, 8),
  ('MED-015', 'HealthPlus Wholesale', '20000000-0000-0000-0000-000000000004'::uuid, 'BND-2401', 400, 35.00, 60.00, 40, 8),
  ('MED-002', 'Aryana Pharma Supply', null::uuid, 'IBU-2401', 240, 68.00, 95.00, 18, 18),
  ('MED-003', 'Nawbahar Laboratories', null::uuid, 'DIC-2401', 120, 82.00, 120.00, 12, 12),
  ('MED-005', 'Aryana Pharma Supply', null::uuid, 'AZI-2401', 35, 105.00, 150.00, 10, 10),
  ('MED-006', 'Kabul Medical Distributors', null::uuid, 'CEF-2401', 500, 175.00, 240.00, 6, 6),
  ('MED-007', 'Aryana Pharma Supply', null::uuid, 'CET-2401', 250, 28.00, 45.00, 25, 25),
  ('MED-008', 'Nawbahar Laboratories', null::uuid, 'COU-2401', 150, 75.00, 110.00, 9, 9),
  ('MED-009', 'HealthPlus Wholesale', null::uuid, 'ORS-2401', 80, 14.00, 25.00, 45, 45),
  ('MED-010', 'Kabul Medical Distributors', null::uuid, 'OMP-2401', 270, 46.00, 70.00, 22, 22),
  ('MED-011', 'Aryana Pharma Supply', null::uuid, 'ANT-2401', 20, 88.00, 130.00, 7, 7),
  ('MED-013', 'HealthPlus Wholesale', null::uuid, 'VTD-2401', 365, 150.00, 210.00, 14, 14),
  ('MED-014', 'Nawbahar Laboratories', null::uuid, 'IRN-2401', 90, 78.00, 115.00, 8, 8),
  ('MED-016', 'Nawbahar Laboratories', null::uuid, 'ANT-SEC-01', 300, 56.00, 90.00, 16, 16)
) as v(sku, supplier_name, purchase_item_id, batch_number, expiry_days, cost_price, selling_price, quantity, received_days)
join public.medicines m on m.sku = v.sku
join public.suppliers s on s.name = v.supplier_name;

insert into public.inventory_adjustments (medicine_id, inventory_batch_id, adjustment_type, quantity_change, reason, reference_type, reference_id, performed_by, created_at)
select b.medicine_id, b.id, 'receive', b.initial_quantity, 'Demo opening stock received',
  case when b.purchase_order_item_id is null then 'opening_stock' else 'purchase_order' end,
  po_item.purchase_order_id, p.id, b.received_at
from public.inventory_batches b
left join public.purchase_order_items po_item on po_item.id = b.purchase_order_item_id
cross join lateral (select id from public.profiles where is_active order by case role when 'admin' then 0 when 'pharmacist' then 1 else 2 end, created_at limit 1) p;

insert into public.sales (id, sale_number, status, subtotal, discount_amount, total_amount, amount_paid, payment_method, cashier_id, completed_at, created_at)
select v.id, v.sale_number, 'completed', v.subtotal, v.discount, v.subtotal - v.discount,
  v.subtotal - v.discount, v.payment_method::public.payment_method, p.id,
  now() - v.age_days * interval '1 day', now() - v.age_days * interval '1 day'
from (values
  ('30000000-0000-0000-0000-000000000001'::uuid, 'SAL-DEMO-1001', 170.00, 0.00, 'cash', 0),
  ('30000000-0000-0000-0000-000000000002'::uuid, 'SAL-DEMO-1002', 180.00, 10.00, 'card', 1),
  ('30000000-0000-0000-0000-000000000003'::uuid, 'SAL-DEMO-1003', 185.00, 0.00, 'cash', 2),
  ('30000000-0000-0000-0000-000000000004'::uuid, 'SAL-DEMO-1004', 185.00, 0.00, 'other', 3),
  ('30000000-0000-0000-0000-000000000005'::uuid, 'SAL-DEMO-1005', 280.00, 15.00, 'cash', 4),
  ('30000000-0000-0000-0000-000000000006'::uuid, 'SAL-DEMO-1006', 270.00, 0.00, 'card', 5),
  ('30000000-0000-0000-0000-000000000007'::uuid, 'SAL-DEMO-1007', 325.00, 0.00, 'cash', 6),
  ('30000000-0000-0000-0000-000000000008'::uuid, 'SAL-DEMO-1008', 120.00, 5.00, 'cash', 0)
) as v(id, sale_number, subtotal, discount, payment_method, age_days)
cross join lateral (select id from public.profiles where is_active order by case role when 'cashier' then 0 when 'pharmacist' then 1 else 2 end, created_at limit 1) p;

insert into public.sale_items (sale_id, medicine_id, inventory_batch_id, quantity, unit_price, cost_price_snapshot, line_total)
select v.sale_id, m.id, b.id, v.quantity, b.selling_price, b.cost_price, b.selling_price * v.quantity
from (values
  ('30000000-0000-0000-0000-000000000001'::uuid, 'MED-001', 'PAN-2401', 2),
  ('30000000-0000-0000-0000-000000000002'::uuid, 'MED-004', 'AMX-2401', 1),
  ('30000000-0000-0000-0000-000000000003'::uuid, 'MED-002', 'IBU-2401', 1),
  ('30000000-0000-0000-0000-000000000003'::uuid, 'MED-007', 'CET-2401', 2),
  ('30000000-0000-0000-0000-000000000004'::uuid, 'MED-008', 'COU-2401', 1),
  ('30000000-0000-0000-0000-000000000004'::uuid, 'MED-009', 'ORS-2401', 3),
  ('30000000-0000-0000-0000-000000000005'::uuid, 'MED-012', 'VTC-2401', 1),
  ('30000000-0000-0000-0000-000000000005'::uuid, 'MED-015', 'BND-2401', 2),
  ('30000000-0000-0000-0000-000000000006'::uuid, 'MED-010', 'OMP-2401', 2),
  ('30000000-0000-0000-0000-000000000006'::uuid, 'MED-011', 'ANT-2401', 1),
  ('30000000-0000-0000-0000-000000000007'::uuid, 'MED-013', 'VTD-2401', 1),
  ('30000000-0000-0000-0000-000000000007'::uuid, 'MED-014', 'IRN-2401', 1),
  ('30000000-0000-0000-0000-000000000008'::uuid, 'MED-003', 'DIC-2401', 1)
) as v(sale_id, sku, batch_number, quantity)
join public.medicines m on m.sku = v.sku
join public.inventory_batches b on b.medicine_id = m.id and b.batch_number = v.batch_number;

update public.inventory_batches b
set current_quantity = b.current_quantity - sold.quantity
from (
  select inventory_batch_id, sum(quantity)::integer as quantity
  from public.sale_items
  group by inventory_batch_id
) sold
where b.id = sold.inventory_batch_id;

insert into public.inventory_adjustments (medicine_id, inventory_batch_id, adjustment_type, quantity_change, reason, reference_type, reference_id, performed_by, created_at)
select i.medicine_id, i.inventory_batch_id, 'sale', -i.quantity,
  'Completed demo sale ' || s.sale_number, 'sale', s.id, s.cashier_id, s.completed_at
from public.sale_items i
join public.sales s on s.id = i.sale_id;

commit;

-- Expected result: 6 categories, 4 suppliers, 16 medicines, 17 batches,
-- 4 purchase orders, 8 completed sales, and matching inventory audit rows.
