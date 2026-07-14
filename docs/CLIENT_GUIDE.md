# Darman Pharmacy Management System: Client Guide

## What This System Does

Darman helps one pharmacy manage medicines, stock, suppliers, purchase orders,
sales, expiry warnings, low-stock warnings, and basic reports. It does not
manage prescriptions, patient records, insurance, accounting, loyalty points,
or multiple branches.

## Who Can Use It

| Role | Main access |
| --- | --- |
| Admin | Everything, including settings and staff roles. |
| Pharmacist | Medicines, stock, sales, suppliers, purchases, reports, and view-only settings. |
| Cashier | Sales and medicine availability only. |

Sign in with the email and password given by the Admin. Use **Sign out** before
leaving a shared computer. Cashiers open **Sales** first; Admins and Pharmacists
open the **Dashboard** first.

## Daily Work

### Dashboard

Use the Dashboard to check today's sales, active medicines, low stock, and
expiry warnings. Open an alert or list item to investigate it.

### Add or Update a Medicine

1. Open **Medicines** and select **Add medicine**.
2. Enter the brand name, generic name, category, barcode or SKU if used, price,
   and reorder level.
3. Save. New medicines have zero stock until a delivery is received.

Use search and filters to find medicines. Deactivate a medicine instead of
deleting it. Cashiers can view medicine availability but cannot change it.

### Manage Stock and Expiry

Stock is added by receiving a purchase order. Each received item needs a batch
number and expiry date. The system sells the earliest-expiring valid batch
first. Check Dashboard warnings and the **Medicines** filters every day. Do not
sell expired stock.

### Process a Sale

1. Open **Sales**, search by medicine name, barcode, SKU, or batch number.
2. Add items and set the quantity. The system prevents quantities above stock.
3. Apply a sale discount only when approved, choose the payment method, and
   complete the sale.
4. Print or download the receipt PDF if needed, then select **Start next sale**.

Completed sales deduct stock automatically. A Cashier sees only their own sales
history; Admins and Pharmacists can see the wider sales history.

### Suppliers and Purchase Orders

Open **Suppliers** to add or edit supplier contact details. Keep only active
suppliers available for new orders.

Open **Purchases** to create a draft order. Add medicines, quantities, costs,
and intended selling prices. Mark it **Ordered** when sent to the supplier.
When stock arrives, open the order and confirm delivery once, entering a batch
number and expiry date for every item. Delivery adds stock and cannot be
received twice.

### Low Stock and Expiry Warnings

Use the Dashboard and Medicines filters to review low stock, expired items, and
items expiring soon. Reorder low stock through a purchase order and remove
expired medicine from saleable stock according to your pharmacy procedure.

## Reports and Exports

Open **Reports** and select Sales, Inventory, Expiry, or Purchases. Set the
date range or filters, review the totals, then use **CSV** for Excel or **PDF**
for a printable report. Exports contain the currently visible filtered data.

## Search and Lists

Use the page search box to find names, receipts, batches, or suppliers. The
header search can find records allowed for your role. Clear filters if a record
appears missing. Use sorting, page controls, or a larger row count for long
lists.

## Settings

Only Admins can edit pharmacy name, address, phone, currency, receipt message,
and expiry-alert period. Pharmacists can view these settings. Admins can also
change another existing staff member's role; they cannot change their own role.

## File Uploads

File uploads are not part of the current system. Do not upload pharmacy
documents or store credentials in the application. Ask a developer before
adding a document workflow.

## Simple Maintenance

- Review low-stock and expiry warnings daily.
- Receive every supplier delivery through its purchase order.
- Use separate accounts for each staff member and remove access when staff leave.
- Back up and protect the Supabase project as described in `docs/DEPLOYMENT.md`.
- Apply updates only after a backup and the relevant checks in
  `docs/MANUAL_QA_CHECKLIST.md`.

## Deployment or Redeployment

The technical owner should follow `docs/DEPLOYMENT.md`. The live site needs:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the legacy anon key, not both)

Before going live, apply all five Supabase migrations in order, create Admin,
Pharmacist, and Cashier test accounts, and complete the manual QA checklist.
Never place a service-role key in the website environment.

## Common Problems

| Problem | What to do |
| --- | --- |
| Cannot sign in | Check the email and password. Ask an Admin to confirm the account is active. |
| Cannot edit a record | Check your role. Cashiers have read-only medicine access. |
| No stock is shown | Receive the relevant purchase order with a batch and expiry date. |
| Cannot complete a sale | Refresh the POS. Another sale may have used the available stock. |
| Cannot receive an order | It must be **Ordered**, not cancelled or already delivered. |
| A report is empty | Check its dates, filters, and your role permissions. |
| PDF or CSV does not download | Allow downloads or pop-ups in the browser and try again. |
| Permission denied | Do not disable security settings. Ask an Admin to check the active role. |

## Ask a Developer Before Changing

Do not change database tables, Supabase security/RLS policies, migration files,
environment variables, payment calculations, stock workflow rules, or user-role
permissions without developer help. These changes can expose data or make stock
incorrect.

## Future Upgrade Ideas

Useful future improvements include automated backups, high-volume server-side
reporting, approved document uploads, and further operational dashboards. Keep
future work within pharmacy operations and avoid patient records, prescriptions,
insurance, multi-branch management, loyalty programmes, full accounting, and
AI demand forecasting unless the product scope is formally changed.

## Change History

- **Phases 0-9:** foundation, roles, catalog, inventory, dashboard, POS,
  suppliers, purchases, reports, search, and settings.
- **Phases 10-13:** security hardening, deployment guidance, release review,
  and staging acceptance.
- **Phases 14-23:** diagrams and proposal documents, Darman branding,
  cashier-first sales, demo data, dashboard refinement, dark mode, and sidebar
  account controls.
