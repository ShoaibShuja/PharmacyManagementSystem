# Project State

## Current Phase

Phase 5: Sales and POS MVP.

Last updated: June 19, 2026.

## Completed Features

- Next.js 16 App Router, strict TypeScript, Tailwind CSS 4, and shadcn/ui foundation
- Typed Supabase browser, server, and session proxy clients
- TanStack Query provider and responsive application shell
- Normalized database migration, seed data, Auth profile trigger, and RLS policies
- Email/password login, logout, protected routes, and role-aware navigation
- Medicine catalog with responsive desktop table and mobile cards
- Add and edit medicine forms using React Hook Form and Zod
- Medicine deactivation and restoration with confirmation
- Medicine category creation, display, search, and filtering
- Stock quantity, reorder threshold, default price, and nearest expiry display
- Low-stock, expiring-soon, and expired-stock indicators
- Search by brand, generic name, category, and batch number
- Filters for low stock, expiry alerts, category, and status
- Medicine detail dialog with read-only batch inventory
- TanStack Query fetching, cache invalidation, mutations, loading, error, and empty states
- Toast feedback for medicine and category mutations
- Cashier read-only medicine lookup; Admin and Pharmacist management controls
- Role-aware dashboard for Admin, Pharmacist, and Cashier
- Daily completed-sales total and transaction count
- Active medicine, low-stock, and expiry-warning summary cards
- Seven-day completed-sales trend chart using Recharts
- Recent completed sales list with RLS-aware visibility
- In-app inventory notification area for low-stock and expiry warnings
- Low-stock table derived from saleable non-expired batch quantities
- Batch-level expiry warning table with 30, 60, and 90-day windows
- Dashboard loading, error, and new-pharmacy empty states
- Fast medicine search by brand, generic name, barcode, and SKU in the POS
- Sale cart with add, remove, increment, decrement, and direct quantity entry
- Client stock limits and database-authoritative stock validation
- FEFO batch allocation using earliest non-expired inventory first
- Atomic PostgreSQL sale completion, sale item creation, stock deduction, and inventory adjustment logging
- Subtotal, sale-level discount, total, and Cash/Card/Other payment methods
- Completed sale receipt view with batch-level line items
- Printable receipt and downloadable PDF receipt using jsPDF
- RLS-aware sales history and sale detail receipt view
- Admin, Pharmacist, and Cashier sale creation support

## Current Database Tables

- `profiles`
- `medicine_categories`
- `suppliers`
- `medicines`
- `inventory_batches`
- `sales`
- `sale_items`
- `purchase_orders`
- `purchase_order_items`
- `inventory_adjustments`
- `app_settings`

The `medicine_inventory_summary` view remains available. The catalog currently calculates batch-aware warning state in the client from RLS-protected medicine, category, batch, and settings queries.

## Current Routes and Pages

- `/` redirects to `/dashboard`
- `/login`
- `/dashboard` provides the completed MVP operations dashboard
- `/medicines` provides the completed catalog and inventory lookup MVP
- `/sales` provides the completed POS, checkout, receipt, and sales history MVP
- `/suppliers`
- `/purchases`
- `/reports`
- `/settings`
- `/unauthorized`

## Current Components

- Role-aware sidebar, mobile navigation, and authenticated header
- Login form and logout action
- Auth server helpers and role guards
- Query provider and global toast provider
- Medicine catalog, medicine form dialog, category dialog, and medicine detail dialog
- Dashboard view, sales trend chart, metric cards, alert area, recent sales, low-stock list, and expiry warning list
- POS medicine grid, cart, checkout summary, sales history, receipt dialog, print view, and PDF receipt
- shadcn/ui button, card, input, label, select, dialog, table, badge, textarea, Sonner, skeleton, and confirmation dialog
- Shared page header, stat card, empty state, loading state, and error state

## Current Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` reserved for future server-only administration

See `.env.example`. Never expose the service-role key in browser code.

## Current Supabase Setup State

- The initial migration is in `supabase/migrations/202606180001_initial_schema.sql`.
- The transactional sale migration is in `supabase/migrations/202606190001_complete_sale_rpc.sql`.
- Local seed data is in `supabase/seed.sql`.
- RLS and the transactional function support this phase:
  - All active authenticated roles can read medicines, categories, batches, and settings.
  - Only Admin and Pharmacist can create or update medicines and categories.
  - Cashier mutation attempts remain blocked by RLS even if UI controls are bypassed.
  - Admin and Pharmacist dashboard sales queries can read all sales.
  - Cashier dashboard sales queries return only that Cashier's sales.
  - Admin and Pharmacist can read all sales history.
  - Cashiers can read only their own sales and sale items.
  - `public.complete_sale` accepts active Admin, Pharmacist, and Cashier users.
  - Direct browser batch updates remain blocked for Cashiers.
  - The security-definer function performs validated sale writes and stock changes atomically.
- Apply both migrations in filename order.
- The migration has not yet been confirmed as applied to a linked Supabase project.

## Latest Test and Build Status

- `npm run lint`: passed June 19, 2026
- `npm run typecheck`: passed June 19, 2026
- `npm run build`: passed June 19, 2026
- Live role and mutation testing still requires an applied migration and Admin, Pharmacist, and Cashier test users.

## Current Known Issues

- Supabase migration and role behavior are not confirmed against a live linked project.
- New medicines have zero stock until batch receiving or stock adjustment workflows are implemented.
- Inventory batches are read-only in the medicine catalog during this phase.
- Password recovery and Admin user management are not implemented.
- Supplier, purchase, and report workflows remain placeholders.
- Dashboard expiry windows are view filters and do not change the persistent application setting.
- Transactional purchase receiving and manual stock adjustments are deferred.
- Live stock-decrease verification requires the migration, valid Supabase credentials, test users, and stocked non-expired batches.
- Receipt PDFs use a compact fixed receipt page and may continue onto the printable receipt more cleanly for unusually large carts.
- Database types must be regenerated after future schema changes.
- Two moderate transitive npm audit findings remain; do not force a breaking downgrade.

## Important Decisions

- Preserve batch-normalized inventory. Do not store editable stock directly on medicines.
- Deactivate medicines instead of hard deleting them so historical references remain valid.
- Use the application expiry alert setting for warning calculations.
- Treat expired batch quantities as total stock but exclude them from saleable stock.
- Keep batch inventory read-only until receiving and adjustment operations are transactional and auditable.
- Use server route authentication, role-aware UI, and RLS as the authorization boundary.
- Keep Cashier access read-only for medicine lookup.
- Derive dashboard inventory warnings from active medicines and current batch quantities.
- Exclude expired batch quantities from saleable stock.
- Use completed sales only for dashboard totals, trends, and recent sales.
- Keep the chart to a simple seven-day trend and avoid advanced forecasting.
- Keep Cashier dashboard sales-focused and hide management alert tables.
- Complete sales only through the transactional `complete_sale` database function.
- Lock batches during checkout and allocate sale quantities by expiry date, received date, and batch ID.
- Store one sale item per allocated inventory batch so cost, price, and traceability remain accurate.
- Recalculate subtotal and validate discount inside PostgreSQL instead of trusting client totals.
- Record every stock deduction in `inventory_adjustments`.
- Keep receipts anonymous and do not create patient or customer records.

## Next Recommended Prompt

Apply both migrations and verify POS stock deduction with Admin, Pharmacist, and Cashier users. Then build supplier CRUD and purchase-order receiving with transactional inventory batch creation and inventory adjustment records.
