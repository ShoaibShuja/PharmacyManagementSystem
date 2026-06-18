# Pharmacy Management System: Client Guide

## Project Overview

This single-location pharmacy system manages medicines, stock, sales, suppliers, purchase orders, expiry warnings, low-stock warnings, and basic reports.

Staff can now sign in, manage medicines and suppliers, order and receive stock, monitor daily activity, process sales, and issue receipts.

## User Roles

### Admin

Admin users can access all current pages and can manage medicines, categories, suppliers, purchase orders, and sales.

### Pharmacist

Pharmacists can manage medicines, categories, suppliers, purchase orders, and sales. They cannot access sensitive Admin settings or manage staff roles.

### Cashier

Cashiers can search medicines and view availability, prices, batches, and expiry dates. They cannot change medicine or category records.

Cashiers can create sales and view their own completed sale history.

Cashiers cannot open Supplier or Purchase Order management.

## Signing In and Out

1. Open the application.
2. Enter the staff email and password.
3. Select **Sign in**.
4. To sign out, use the sign-out button in the top-right corner.

Always sign out on a shared pharmacy computer.

## Dashboard

The Dashboard is the first page after signing in.

Admin and Pharmacist users can see:

- Today's completed sales total
- Today's completed transaction count
- Number of active medicines
- Number of low-stock medicines
- Number of batches with expiry warnings
- Seven-day sales trend
- Recent completed sales
- Low-stock medicine list
- Batch expiry warning list
- A notification area summarizing current inventory alerts

Cashiers see a simpler dashboard focused on their own sales, recent transactions, the active medicine count, and a shortcut to medicine lookup.

### Changing the Expiry Warning Window

On the expiry warning card, select:

- **30 days**
- **60 days**
- **90 days**

This changes the current dashboard view only. It does not change the permanent expiry setting.

### Understanding Dashboard Alerts

- **Low stock:** Saleable stock is at or below the medicine reorder threshold.
- **Expiry warning:** A stocked batch is already expired or expires inside the selected window.
- **Today's sales:** Includes completed sales only. Draft or voided sales are not counted.

If the pharmacy has no medicines, batches, or completed sales, the Dashboard shows clear empty messages instead of sample data.

## Medicine Catalog

Open **Medicines** from the menu.

The page shows:

- Active medicine count
- Low-stock medicine count
- Medicines with expiry alerts
- Brand and generic names
- Category and dosage details
- Saleable stock quantity
- Reorder threshold
- Nearest batch expiry
- Default selling price

Red or orange labels identify expired or soon-to-expire stock. A yellow label identifies low stock.

## Adding a Medicine

Admin and Pharmacist users can:

1. Open **Medicines**.
2. Select **Add medicine**.
3. Enter the brand name and dosage form.
4. Add the generic name, strength, category, unit, SKU, or barcode when available.
5. Enter default cost and selling prices.
6. Enter the reorder threshold.
7. Select **Add medicine**.

A new medicine starts with zero stock. Stock is added when a purchase order is confirmed as delivered.

## Editing a Medicine

1. Find the medicine.
2. Select the edit icon or **Edit** button.
3. Change the required information.
4. Select **Save changes**.

Changing default prices does not change prices already saved on existing inventory batches.

## Deactivating or Restoring a Medicine

Use deactivation when a medicine should no longer appear in the active catalog.

1. Find the medicine.
2. Select the archive icon.
3. Confirm **Deactivate**.

The medicine is kept for historical records. To restore it, change the status filter to **Inactive**, select **Restore**, and confirm.

## Medicine Categories

Admin and Pharmacist users can select **Add category** on the Medicines page. Enter a clear name, such as Pain Relief, Antibiotics, or Vitamins.

Categories can be used in medicine forms, search, and filters.

## Searching and Filtering Medicines

The search box finds medicines by:

- Brand name
- Generic name
- Category
- Batch number

Filters are available for:

- Low stock
- Expiry alerts
- Category
- Active or inactive status

Select **Clear** to return to the normal active medicine list.

## Viewing Medicine and Batch Details

Select a medicine name or **View**.

The detail window shows:

- Saleable stock
- Default selling price
- Nearest expiry date
- Category
- Reorder threshold
- SKU and barcode
- Every received batch, its expiry date, remaining quantity, and selling price

Cashiers can use this view for read-only availability checks.

## Processing a Sale

Admin, Pharmacist, and Cashier users can process sales.

1. Open **Sales**.
2. Select **New sale**.
3. Search by medicine name, generic name, barcode, or SKU.
4. Select a medicine to add one unit to the cart.
5. Use the plus and minus buttons or quantity field to adjust the quantity.
6. Enter an optional discount.
7. Select **Cash**, **Card**, or **Other**.
8. Review the subtotal and total.
9. Select **Complete sale**.

The system prevents a cart quantity above the currently available, non-expired stock. The database checks stock again when the sale is completed.

### How Stock Is Deducted

The system uses the batch with the earliest expiry date first. If one batch does not have enough stock, the remaining quantity is taken from the next valid batch.

Sale completion is one protected database transaction. It:

- Checks the signed-in staff account
- Locks the required batches
- Checks stock again
- Creates the completed sale
- Creates batch-level sale items
- Decreases batch quantities
- Records inventory adjustment entries

If any step fails, none of the sale or stock changes are saved.

### Discounts

The discount is a simple amount applied to the whole sale. It cannot be negative or greater than the subtotal.

### Receipts

After completing a sale, the receipt opens automatically.

You can:

- Select **Print** for a browser print view
- Select **Download PDF** for a digital receipt
- Close the receipt and continue with another sale

The receipt contains the pharmacy details, receipt number, date, payment method, medicine lines, allocated batch numbers, subtotal, discount, and total.

## Sales History

1. Open **Sales**.
2. Select **History**.
3. Select **View** beside a sale.

Admin and Pharmacist users can see all permitted completed sales. Cashiers see only their own completed sales.

The history currently shows the latest 50 completed sales.

## How Stock and Expiry Work

Stock is stored in separate batches because each delivery can have a different batch number, cost, selling price, and expiry date.

- **Total stock** includes all remaining batch quantities.
- **Saleable stock** excludes expired batches.
- **Low stock** appears when saleable stock is at or below the medicine reorder threshold.
- **Expiring soon** uses the number of warning days saved in application settings.
- **Expired stock** should not be sold.

Batch editing and stock correction are not available yet. Purchase delivery is the supported way to add ordered stock. Do not change batch quantities directly in the database unless a qualified developer is correcting a confirmed setup problem.

## Supplier Management

Admin and Pharmacist users can manage suppliers.

### Adding a Supplier

1. Open **Suppliers**.
2. Select **Add supplier**.
3. Enter the supplier name.
4. Add the contact person, phone, email, address, and notes when available.
5. Select **Add supplier**.

### Editing or Deactivating a Supplier

1. Find the supplier.
2. Select the edit button.
3. Change the details or set the status to **Inactive**.
4. Select **Save changes**.

Inactive suppliers stay in old purchase records but cannot be selected for new orders.

### Supplier Search and History

Use the search box to find a supplier by name, contact person, phone, or email.

Select a supplier to see:

- Contact details
- Notes
- Number of purchase orders
- Delivered purchase value
- Purchase-order history

## Purchase Orders

Admin and Pharmacist users can use purchase orders to restock inventory.

### Creating a Purchase Order

1. Open **Purchases**.
2. Select **Create order**.
3. Select an active supplier.
4. Add an optional expected delivery date.
5. Add one or more medicines.
6. Enter the quantity, cost price, and intended selling price for each medicine.
7. Add optional notes.
8. Select **Create draft**.

Each medicine can appear only once on the same order.

### Sending an Order

1. Open a Draft purchase order.
2. Check the supplier, medicines, quantities, and prices.
3. Select **Mark ordered**.
4. Confirm the action.

An Ordered purchase cannot be edited. It can be delivered or cancelled.

### Confirming Delivery and Adding Stock

1. Open an Ordered purchase.
2. Select **Confirm delivery**.
3. Enter the physical batch number printed on every medicine.
4. Enter the expiry date for every batch.
5. Check all details carefully.
6. Select **Add stock and deliver**.

The system then:

- Creates a separate inventory batch for every order item
- Adds the full ordered quantity to available stock
- Saves the supplier, cost price, selling price, batch number, and expiry date
- Updates the received quantity and delivery time
- Updates the medicine default supplier and latest default prices
- Creates an inventory adjustment record
- Marks the order as **Delivered**

The database performs all delivery steps together. If one item fails, no stock is added. A Delivered order cannot be delivered again.

### Cancelling an Order

Draft and Ordered purchases can be cancelled. Delivered purchases cannot be cancelled.

## Reports

Reports and exports remain planned for a later phase.

## Connecting Supabase

1. Create a Supabase project.
2. Run the following migrations in filename order:
   - `supabase/migrations/202606180001_initial_schema.sql`
   - `supabase/migrations/202606190001_complete_sale_rpc.sql`
   - `supabase/migrations/202606190002_purchase_order_workflow.sql`
3. Optionally run `supabase/seed.sql`.
4. Copy `.env.example` to `.env.local`.
5. Add the Supabase project URL and anonymous key.
6. Create the pharmacy owner in Supabase Authentication.
7. Promote the owner to Admin using the SQL in `supabase/README.md`.
8. Keep public sign-up disabled.

Never place the service-role key in browser code.

## Running and Maintaining the Project

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Configure `.env.local`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

After changes, run:

```text
npm run lint
npm run typecheck
npm run build
```

Back up Supabase before major production changes and regenerate database types after schema changes.

## Deployment

Deploy to Vercel and add the same public Supabase environment variables in the Vercel project settings. Do not add service-role credentials to public variables.

## Common Problems

### Medicines do not load

Confirm the Supabase URL and anonymous key are correct. Confirm the migration was applied and the signed-in user has an active profile.

### Add or edit is not available

Cashiers have read-only access. Sign in as an Admin or Pharmacist.

### A new medicine shows zero stock

This is expected. Create a purchase order, mark it Ordered, and confirm delivery with batch and expiry details.

### A purchase order cannot be delivered

Confirm the order is currently **Ordered**, not Draft, Cancelled, or already Delivered. Confirm every item has a unique batch number and an expiry date that is not in the past.

### A supplier is missing from a new purchase order

Open Suppliers and confirm the supplier status is **Active**.

### A medicine is missing

Clear the search and filters. Check the **Inactive** status filter if the medicine was deactivated.

### Permission denied

Confirm the staff profile has the correct active role. Do not disable Row Level Security.

### Sale says there is insufficient stock

Another sale may have used the stock after it was added to the cart. Reload the POS and use the current available quantity.

### Print receipt does not open

Allow pop-ups for the pharmacy website, then select **Print** again.

### Sale history is empty for a Cashier

Cashiers see only sales completed by their own account.

## Change History

### Phase 0: Foundation

- Created the application shell, responsive navigation, placeholder pages, and reusable UI states.

### Phase 1: Database Foundation

- Added pharmacy tables, staff roles, constraints, indexes, profile automation, and role-based RLS.

### Phase 2: Authentication and Access

- Added secure sign-in, sign-out, protected pages, profile loading, role-specific menus, and access messages.

### Phase 3: Medicine Catalog and Inventory MVP

- Added medicine and category creation.
- Added medicine editing, deactivation, and restoration.
- Added batch-aware stock and expiry display.
- Added low-stock and expiry warnings.
- Added search, filters, responsive layouts, details, validation, confirmations, and feedback.
- Added read-only medicine lookup for Cashiers.

### Phase 4: MVP Dashboard and Alert System

- Added daily sales, medicine, low-stock, and expiry summary cards.
- Added a seven-day sales trend and recent sales list.
- Added low-stock and batch expiry warning tables.
- Added 30, 60, and 90-day expiry views.
- Added in-app inventory alert summaries.
- Added a simplified sales-focused Cashier dashboard.
- Added clear empty, loading, and error states.

### Phase 5: Sales and POS MVP

- Added medicine search and a fast sale cart.
- Added stock-aware quantity controls, discounts, totals, and payment methods.
- Added atomic FEFO stock deduction and inventory adjustment records.
- Added completed sale history and sale detail views.
- Added printable and PDF receipts.
- Added Admin, Pharmacist, and Cashier sale support.

### Phase 6: Supplier Management and Purchase Orders

- Added supplier creation, editing, search, contact details, notes, status, and purchase history.
- Added purchase-order drafts with multiple medicine items, quantities, and prices.
- Added Draft, Ordered, Delivered, and Cancelled workflow states.
- Added protected delivery confirmation with batch number and expiry entry.
- Added atomic inventory batch creation, stock increases, price updates, and adjustment records.
- Kept Cashiers excluded from supplier and purchase management.
