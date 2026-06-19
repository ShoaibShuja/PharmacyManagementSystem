# Project State

## Current Phase

Phase 7: Basic Reporting and Exports.

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
- Supplier list, search, active/inactive filtering, contact details, notes, and purchase history
- Supplier creation and editing with React Hook Form and Zod validation
- Purchase-order list, search, status filtering, responsive views, and detail dialog
- Draft purchase-order creation with multiple medicines, quantities, cost prices, and intended selling prices
- Draft to Ordered status transition and Draft/Ordered cancellation
- Delivery confirmation with required batch number and expiry date for every item
- Atomic purchase receiving with duplicate-delivery prevention
- Inventory batch creation, received-quantity updates, delivery timestamp, and inventory adjustment logging
- Latest received cost, intended selling price, and default supplier updates on medicine records
- Admin and Pharmacist supplier and purchase access; Cashier access remains blocked by routes, navigation, and RLS
- Sales report with date range, sales total, transaction count, discount total, and top-selling medicines
- Inventory report with current stock, saleable stock, low-stock filtering, reorder levels, and estimated cost value
- Batch-level expiry report for expired, 0–30, 31–60, and 61–90 day windows
- Purchase report with status and supplier filters, delivered-order count, and delivered value
- CSV export for the currently visible report and filters
- Paginated landscape PDF export using jsPDF with pharmacy name, generation date, summaries, and visible rows
- Readable report filenames containing report type, active filter, or selected date range
- Report loading, error, and filter-specific empty states

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
- `/suppliers` provides completed supplier management and purchase history
- `/purchases` provides completed purchase ordering and delivery receiving
- `/reports` provides sales, inventory, expiry, and purchase reports with CSV and PDF export
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
- Supplier management, supplier form dialog, and supplier detail/history dialog
- Purchase-order management, creation form, order detail, status actions, and delivery form
- Reporting workspace, report filter controls, responsive report tables, summary metrics, and export utilities
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
- The transactional purchase workflow migration is in `supabase/migrations/202606190002_purchase_order_workflow.sql`.
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
  - Supplier and purchase-order table policies permit only active Admin and Pharmacist users.
  - `public.create_purchase_order` validates and creates the order and all items atomically.
  - `public.set_purchase_order_status` permits only Draft to Ordered and Draft/Ordered to Cancelled transitions.
  - `public.receive_purchase_order` locks the order, requires Ordered status, rejects repeat delivery, creates batches, updates stock metadata, and records adjustments atomically.
- Apply all three migrations in filename order.
- The migration has not yet been confirmed as applied to a linked Supabase project.

## Latest Test and Build Status

- `npm run lint`: passed June 19, 2026
- `npm run typecheck`: passed June 19, 2026
- `npm run build`: passed June 19, 2026
- CSV generation test: passed June 19, 2026 with UTF-8 BOM, expected headers, and expected row count
- PDF generation test: passed June 19, 2026 with a valid PDF document and readable filename
- Browser verification was attempted June 19, 2026, but the local server could not authenticate because the current public Supabase environment values were missing.
- Live delivered-stock verification requires applying the new migration to a configured Supabase project.
- Live role and mutation testing still requires an applied migration and Admin, Pharmacist, and Cashier test users.

## Current Known Issues

- Supabase migration and role behavior are not confirmed against a live linked project.
- New medicines have zero stock until a purchase order is delivered or a future manual stock adjustment is added.
- Inventory batches remain read-only outside the protected purchase receiving workflow.
- Password recovery and Admin user management are not implemented.
- Reports are client-aggregated from RLS-protected operational tables; very large future datasets may require database reporting functions or pagination.
- Dashboard expiry windows are view filters and do not change the persistent application setting.
- Manual stock adjustments are deferred.
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
- Preserve supplier and purchase history by using active/inactive suppliers instead of deletion.
- Keep purchase orders immutable after they are marked Ordered.
- Receive all items on an order together for the MVP; partial receiving remains unused.
- Require physical batch numbers and non-expired expiry dates before delivery can add stock.
- Update medicine default cost, intended selling price, and default supplier from the latest delivery without changing historical batches.
- Treat the database order lock and Ordered status check as the duplicate-delivery guard.
- Keep reports operational and basic; do not add accounting ledgers, profit-and-loss statements, tax filing, or forecasting.
- Estimate inventory value from each stocked batch's current quantity multiplied by its saved cost price.
- Keep expiry windows mutually exclusive so each batch appears once in the 30, 60, or 90-day grouping.
- Export only the report rows currently visible under the active filters.
- Load jsPDF dynamically only when a PDF export is requested.

## Next Recommended Prompt

Apply all three migrations and verify the complete workflow against a live Supabase project, including report totals and exported files. Then build Admin user management and password recovery or a focused manual inventory adjustment workflow.
