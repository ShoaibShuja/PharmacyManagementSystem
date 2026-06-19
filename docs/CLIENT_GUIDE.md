# Pharmacy Management System: Client User Manual

## Project Overview

This single-location pharmacy system manages medicines, stock, sales, suppliers, purchase orders, expiry warnings, low-stock warnings, and basic reports.

Staff can now sign in, manage medicines and suppliers, order and receive stock, monitor daily activity, process sales, and issue receipts.

This system is for pharmacy business operations only. It does not store patient
medical records, prescriptions, insurance claims, or clinical information.

## Before First Use

The person deploying the system should complete `docs/DEPLOYMENT.md` and the
full staging checklist before staff enter real stock.

Before daily use:

1. Confirm each staff member has their own login.
2. Confirm the pharmacy name, currency, phone, address, and receipt note.
3. Add medicine categories, medicines, and suppliers.
4. Add opening stock through delivered purchase orders.
5. Test one small sale and verify the receipt and remaining stock.

## User Roles

### Admin

Admin users can access all current pages and can manage medicines, categories, suppliers, purchase orders, and sales.

### Pharmacist

Pharmacists can manage medicines, categories, suppliers, purchase orders, and sales. They can review pharmacy settings but cannot change them or manage staff roles.

### Cashier

Cashiers can search medicines and view availability, prices, batches, and expiry dates. They cannot change medicine or category records.

Cashiers can create sales and view their own completed sale history.

Cashiers cannot open Supplier or Purchase Order management.

Do not share one Cashier account between staff. Separate accounts make sales
history and access reviews more reliable.

## Signing In and Out

1. Open the application.
2. Enter the staff email and password.
3. Select **Sign in**.
4. To sign out, use the sign-out button in the top-right corner.

Always sign out on a shared pharmacy computer.

If a password is forgotten, ask the Admin or technical maintainer to reset it
from Supabase. Password recovery is not available inside the application.

## Global Search

Use the search button in the top bar to quickly find pharmacy records.

1. Select **Search medicines, sales, and more**.
2. Type at least two characters.
3. Select a result to open the correct page with the search already filled in.

All users can search:

- Medicines by name, generic name, strength, SKU, or barcode
- Sales they are allowed to view by receipt number or payment type

Admin and Pharmacist users can also search:

- Suppliers by name, contact person, phone, or email
- Purchase orders by order number or status

Cashiers do not receive supplier or purchase-order results.

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
- Sorting by name, stock quantity, or nearest expiry

Use **Rows** at the bottom of the list to show 10, 25, or 50 medicines at a time. Use the arrow buttons to move between pages.

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

Sales history loads the latest 250 completed sales.

Use the Sales History search to find:

- Receipt numbers
- Medicine names
- Batch numbers

You can also filter by Cash, Card, or Other payment and sort by newest, oldest, or highest total. Use the controls at the bottom to change page size or move between pages.

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

You can sort suppliers by name, number of orders, or delivered purchase value. Long lists are divided into pages.

Select a supplier to see:

- Contact details
- Notes
- Number of purchase orders
- Delivered purchase value
- Purchase-order history

## Purchase Orders

Admin and Pharmacist users can use purchase orders to restock inventory.

Use the purchase search box to find an order by order number, supplier, or medicine. You can filter by status, sort by date or value, and change the number of rows shown per page.

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

Admin and Pharmacist users can open **Reports**. Cashiers cannot access business reports.

The report page has four sections:

- Sales
- Inventory
- Expiry
- Purchases

Each report section also has a search box:

- Sales: receipt number or payment type
- Inventory: medicine name
- Expiry: medicine or batch number
- Purchases: order number or supplier

### Sales Report

1. Open **Reports**.
2. Select **Sales**.
3. Choose a start date and end date.

The report shows:

- Completed sales in the selected date range
- Total sales
- Number of transactions
- Total discounts
- Top-selling medicines by quantity

### Inventory Report

Select **Inventory** to see:

- Current total stock
- Saleable, non-expired stock
- Reorder threshold
- Low-stock status
- Estimated stock cost value

Use the filter to show all medicines, low-stock medicines, or medicines with available stock.

The stock value is an estimate. It uses each remaining batch quantity multiplied by that batch's saved cost price. It is not a full accounting valuation.

### Expiry Report

Select **Expiry** to review stocked batches in these groups:

- Expired
- Expiring within 30 days
- Expiring in 31–60 days
- Expiring in 61–90 days

Each batch appears in only one group. The report also shows the batch number, quantity, expiry date, and estimated cost value.

### Purchase Report

Select **Purchases** to review purchase orders.

You can filter by:

- Draft
- Ordered
- Delivered
- Cancelled
- Supplier

The summary shows the visible order count, delivered order count, and delivered purchase value.

### Exporting a Report

The export uses the currently selected report and active filters.

To export:

1. Select the report and filters.
2. Select **CSV** for a spreadsheet-compatible file.
3. Select **PDF** for a formatted printable report.

PDF reports include the pharmacy name, generation date, report summary, table rows, and page numbers. Filenames include the report type and date range or active filter.

If there are no visible records, export buttons are disabled.

## Settings

Admin and Pharmacist users can open **Settings**.

### Pharmacy Profile Settings

The pharmacy profile contains:

- Pharmacy name
- Address
- Phone
- Currency code
- Receipt footer note
- Default expiry warning days

Admin users can change these details:

1. Open **Settings**.
2. Update the required fields.
3. Select **Save pharmacy settings**.

Use a three-letter currency code such as USD, AFN, or PKR. The expiry-warning
number controls the default dashboard warning window.

Pharmacists can review these details but see a **View only** label.

### User Roles

Admin users can view staff profiles that already exist in Supabase
Authentication.

To change a role:

1. Open **Settings**.
2. Find the user under **Users and roles**.
3. Select Admin, Pharmacist, or Cashier.
4. Read the confirmation.
5. Select **Change role**.

An Admin cannot change their own role. This protects the pharmacy from
accidentally losing Admin access.

The Settings page does not create login accounts, send invitations, reset
passwords, or deactivate users. Use the Supabase Dashboard for those account
tasks.

### Private Document Storage

File uploads are not enabled in the application. Receipts already download
directly as PDF files.

An optional private Supabase Storage bucket named `pharmacy-documents` is
documented in `supabase/README.md` for a future purchase-document workflow.
Keep it private and do not store patient or prescription files.

## Connecting Supabase

1. Create a Supabase project.
2. Run the following migrations in filename order:
   - `supabase/migrations/202606180001_initial_schema.sql`
   - `supabase/migrations/202606190001_complete_sale_rpc.sql`
   - `supabase/migrations/202606190002_purchase_order_workflow.sql`
   - `supabase/migrations/202606190003_admin_settings.sql`
   - `supabase/migrations/202606190004_production_hardening.sql`
3. Optionally run `supabase/seed.sql`.
4. Copy `.env.example` to `.env.local`.
5. Add the Supabase project URL and publishable key. The app also accepts the
   older anonymous-key variable name during migration from an existing setup.
6. Create the pharmacy owner in Supabase Authentication.
7. Promote the owner to Admin using the SQL in `supabase/README.md`.
8. Keep public sign-up disabled.

Never place the service-role key in browser code.

After staging setup, follow `docs/MANUAL_QA_CHECKLIST.md` with separate Admin,
Pharmacist, and Cashier test accounts before using the system with real stock.

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

Deployment is a technical maintenance task. Follow `docs/DEPLOYMENT.md`.

The application requires the Supabase project URL and publishable key. It does
not require a service-role key or application URL variable.

Do not add database passwords, service-role keys, access tokens, or staff
passwords to Vercel public variables.

## Common Mistakes to Avoid

- Do not create a sale before receiving non-expired stock.
- Do not reuse a physical batch number for the same medicine.
- Do not confirm delivery until every batch number and expiry date has been checked.
- Do not deactivate a supplier before creating an order that still needs that supplier.
- Do not use discounts greater than the sale subtotal.
- Do not change database stock quantities manually.
- Do not disable RLS to solve a permission problem.
- Do not share Admin credentials with Cashiers.
- Do not use real patient names or prescription information in notes.
- Do not treat estimated inventory value as a full accounting report.

## Daily Maintenance

At the start of the day:

1. Review low-stock and expiry warnings.
2. Confirm staff can sign in with the correct roles.
3. Check that the previous day's sales appear in Reports.

During the day:

1. Receive stock only from an Ordered purchase order.
2. Check batch numbers and expiry dates before confirming delivery.
3. Sign out when changing staff on a shared computer.

At the end of the day:

1. Review completed sales and unusual discounts.
2. Export important sales or inventory reports when needed.
3. Report incorrect stock immediately. Manual stock correction is not available
   in the current version.

## Technical Maintenance

The technical maintainer should:

- keep Supabase and Vercel account access secure;
- verify database backups according to the Supabase plan;
- test changes in staging before production;
- run `npm run lint`, `npm run typecheck`, and `npm run build`;
- create a new migration for every database change;
- never edit migrations already applied to production;
- regenerate `lib/supabase/database.types.ts` after schema changes;
- repeat the relevant parts of `docs/MANUAL_QA_CHECKLIST.md`;
- keep this guide and `PROJECT_STATE.md` current.

## Requesting Future Changes

When requesting a change, provide:

1. The page or workflow involved.
2. The user role affected.
3. What currently happens.
4. What should happen instead.
5. A sample medicine, sale, supplier, or order when helpful.
6. A screenshot with private information removed.
7. Whether the change is required for all users or only one role.

Do not send passwords, private keys, database credentials, or real patient data.

Future work should remain within pharmacy operations. Requests for patient
records, prescription management, insurance, clinical decision tools,
multi-branch management, or full accounting require a separate product review.

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

### A report is empty

Change the date range or report filter. Reports only include records visible under the selected filters.

### A downloaded CSV opens with incorrect characters

Use a current version of Excel, LibreOffice, or Google Sheets. The export includes UTF-8 formatting for medicine and supplier names.

### A PDF report does not download

Confirm the browser allows downloads from the pharmacy website, then try again.

### Search returns no results

Check spelling and clear any page filters. Global search requires at least two characters. Cashiers cannot search supplier or purchase-order records.

### A list item seems missing

Check the search box, filters, and current page. Select **Rows 50** to show more records at once or use the next-page arrow.

### Pharmacy settings cannot be edited

Only Admin users can edit pharmacy settings. Pharmacists can review them in
view-only mode.

### A staff member is missing from User Management

Create the login account in Supabase Authentication first. The profile is
created automatically and will then appear in Settings.

### A role change is rejected

Confirm you are signed in as an active Admin. You cannot change your own role.

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

### Phase 7: Basic Reporting and Exports

- Added sales reports with date filters, totals, discounts, and top-selling medicines.
- Added inventory reports with low-stock filtering and estimated stock value.
- Added expired and 30, 60, and 90-day expiry reports.
- Added purchase reports with status and supplier filters.
- Added CSV and paginated PDF export for the currently visible report.

### Phase 8: Search, Filtering, and List Usability

- Added a role-aware global search for medicines, sales, suppliers, and purchase orders.
- Added shared search, pagination, page-size, and loading patterns.
- Added sorting and paging to medicine, supplier, purchase, and sales-history lists.
- Added medicine and batch search to sales history.
- Added text search to all report sections.
- Preserved responsive mobile cards and scroll-safe report tables.

### Phase 9: Admin Settings Foundation

- Added editable pharmacy name, address, phone, currency, receipt note, and expiry-warning settings.
- Added Pharmacist read-only access to pharmacy profile settings.
- Added Admin staff-profile and role management for existing Auth users.
- Added protected role changes and blocked Admin self-demotion.
- Added optional private Supabase Storage setup guidance without adding unnecessary file uploads.

### Phase 10: Production Hardening and QA

- Blocked direct browser changes to stock batches, sales records, purchase
  records, and inventory adjustment logs.
- Kept medicine, supplier, and category history safe by blocking hard deletion.
- Added stronger batch-number and purchase-date checks.
- Added clearer permission, duplicate-record, and connection error messages.
- Improved cache refresh after sales, medicine, supplier, purchase, and settings changes.
- Added page titles and browser security headers.
- Removed deferred document-storage information from the operational Settings page.
- Added a complete staging QA checklist for every core module and user role.
