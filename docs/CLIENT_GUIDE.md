# Pharmacy Management System: Client Guide

## Project Overview

This single-location pharmacy system manages medicines, stock, sales, suppliers, purchase orders, expiry warnings, low-stock warnings, and basic reports.

Staff can now sign in and use the Medicine Catalog. Other business workflows will be added in later phases.

## User Roles

### Admin

Admin users can access all current pages and can add, edit, deactivate, and restore medicines and categories.

### Pharmacist

Pharmacists can manage medicines and categories. They cannot access sensitive Admin settings or manage staff roles.

### Cashier

Cashiers can search medicines and view availability, prices, batches, and expiry dates. They cannot change medicine or category records.

## Signing In and Out

1. Open the application.
2. Enter the staff email and password.
3. Select **Sign in**.
4. To sign out, use the sign-out button in the top-right corner.

Always sign out on a shared pharmacy computer.

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

A new medicine starts with zero stock. Stock is stored in delivery batches and will be added through purchase receiving or inventory adjustment workflows in a later phase.

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

## How Stock and Expiry Work

Stock is stored in separate batches because each delivery can have a different batch number, cost, selling price, and expiry date.

- **Total stock** includes all remaining batch quantities.
- **Saleable stock** excludes expired batches.
- **Low stock** appears when saleable stock is at or below the medicine reorder threshold.
- **Expiring soon** uses the number of warning days saved in application settings.
- **Expired stock** should not be sold.

Batch editing and stock correction are not available yet. Do not change batch quantities directly in the database unless a qualified developer is correcting a confirmed setup problem.

## Suppliers, Purchases, Sales, and Reports

These workflows remain planned:

- Supplier management
- Purchase orders and receiving stock
- Inventory corrections
- Sales and receipt processing
- Reports and exports

## Connecting Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/202606180001_initial_schema.sql` in the SQL Editor.
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

This is expected. Medicine details and inventory batches are separate. Purchase receiving and stock adjustment tools are planned for a later phase.

### A medicine is missing

Clear the search and filters. Check the **Inactive** status filter if the medicine was deactivated.

### Permission denied

Confirm the staff profile has the correct active role. Do not disable Row Level Security.

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
