# Project State

## Current Phase

Phase 13: Staging Acceptance and Release-Blocker Fixes.

Last updated: June 21, 2026.

## Completed Features

- Next.js 16 App Router, strict TypeScript, Tailwind CSS 4, and shadcn/ui foundation
- Darman product branding with a generated medicine logo and matching browser and installable-app icons
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
- Role-aware global search command in the authenticated header
- Global search across medicines and permitted sales for all roles
- Global supplier and purchase-order search for Admin and Pharmacist users
- Search-result deep links that prefill the target page search
- Reusable list search input with clear action and accessible labels
- Reusable pagination with page size, range text, and previous/next controls
- Reusable list-focused loading skeleton
- Medicine sorting by name, stock quantity, and nearest expiry
- Supplier sorting by name, purchase count, and delivered value
- Purchase-order sorting by date and order value
- Searchable sales history by receipt number, medicine, and batch number
- Sales history payment filtering, sorting, and pagination
- Page-size controls for medicines, sales history, suppliers, and purchase orders
- Text search within sales, inventory, expiry, and purchase reports
- Existing responsive desktop tables and mobile cards preserved across management pages
- Admin pharmacy profile settings for name, address, phone, currency code, receipt footer, and expiry alert window
- React Hook Form and Zod validation for pharmacy settings
- Settings cache invalidation across dashboard, medicine, sales, and report views
- Pharmacist read-only access to pharmacy profile settings
- Admin user/profile list with role and active-status visibility
- Confirmed role changes for existing Admin, Pharmacist, and Cashier profiles
- Protected `public.change_user_role` database function
- Direct browser profile updates removed to prevent unsafe role changes
- Self-role changes blocked in both the UI and database
- Optional private Supabase Storage bucket guidance for future pharmacy documents
- File uploads intentionally deferred because no simple MVP document workflow requires them
- Transactional tables hardened so browser clients cannot directly mutate
  inventory batches, sales, sale items, purchase orders, purchase items, or
  inventory adjustments
- Direct profile inserts and browser-side hard deletion policies removed
- Case-insensitive batch-number uniqueness enforced per medicine
- Database validation added for purchase-order expected dates
- Supabase publishable-key environment naming supported with legacy anon-key fallback
- Security response headers added for framing, content sniffing, referrers, and
  browser permissions
- Shared user-friendly handling added for duplicate, permission, and network errors
- Sales, medicine, supplier, and purchase mutations now invalidate reports and
  global search consistently
- Missing route metadata added for sign-in, suppliers, purchases, reports,
  settings, and access-denied pages
- Deferred document-storage guidance removed from the user-facing Settings page
- Complete staging manual QA checklist added in `docs/MANUAL_QA_CHECKLIST.md`
- Final Supabase and Vercel deployment guide added in `docs/DEPLOYMENT.md`
- Root README replaced with project-specific setup, environment, deployment,
  security, and documentation guidance
- Client guide finalized with first-use steps, common mistakes, daily and
  technical maintenance, and a structured future-change request process
- Runtime environment contract reduced to the Supabase URL and one public key
- Deployment ownership, backup, post-deploy testing, update, and rollback
  procedures documented
- Final release candidate audit completed across routes, approved scope,
  excluded scope, role guards, transactional functions, usability states,
  environment configuration, and deployment documentation
- Fresh-checkout Supabase CLI instructions corrected to include initialization
- Next.js framework-identifying response header disabled
- Final beginner-facing release checklist added to the client guide
- Form fields, report filters, POS quantity controls, and icon-only management
  actions now expose explicit accessible names
- Stale Settings description removed after the deferred setup panel was removed
- Protected sale, purchase, receiving, and role-change RPCs now use an
  unambiguous application-role variable
- Historical receipts retain batch numbers after a batch reaches zero stock
- Fresh staging acceptance completed with role, RLS, transaction, receipt,
  export, and responsive evidence

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
- `/settings` provides Admin editing, Admin role management, and Pharmacist read-only pharmacy settings
- `/unauthorized`

## Current Components

- Darman-branded role-aware sidebar, mobile navigation, authenticated header, and global search command
- Login form and logout action
- Auth server helpers and role guards
- Query provider and global toast provider
- Medicine catalog, medicine form dialog, category dialog, and medicine detail dialog
- Dashboard view, sales trend chart, metric cards, alert area, recent sales, low-stock list, and expiry warning list
- POS medicine grid, cart, checkout summary, sales history, receipt dialog, print view, and PDF receipt
- Supplier management, supplier form dialog, and supplier detail/history dialog
- Purchase-order management, creation form, order detail, status actions, and delivery form
- Reporting workspace, report filter controls, responsive report tables, summary metrics, and export utilities
- Shared list search, pagination, and list-loading components
- Pharmacy settings form and user-role management
- shadcn/ui button, card, input, label, select, dialog, table, badge, textarea, Sonner, skeleton, and confirmation dialog
- Shared page header, stat card, empty state, loading state, and error state

## Current Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` supported as a legacy fallback

Configure either the publishable key or the legacy anon key, not both. The
current application does not require an application URL or service-role key.
See `.env.example`.

## Current Supabase Setup State

- The initial migration is in `supabase/migrations/202606180001_initial_schema.sql`.
- The transactional sale migration is in `supabase/migrations/202606190001_complete_sale_rpc.sql`.
- The transactional purchase workflow migration is in `supabase/migrations/202606190002_purchase_order_workflow.sql`.
- The Admin settings and role-management migration is in `supabase/migrations/202606190003_admin_settings.sql`.
- The production-hardening migration is in `supabase/migrations/202606190004_production_hardening.sql`.
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
  - `public.change_user_role` accepts only active Admin users and rejects self-role changes.
  - Direct profile updates are no longer available through RLS.
  - Admin users can still read all profiles; non-Admin users can read only their own profile.
- Apply all five migrations in filename order.
- All five migrations were applied successfully to staging on June 19, 2026.
- The fresh staging database was reset and reapplied after fixing the protected
  workflow role-variable collision.

## Production Readiness Status

**Release Candidate 1 passed release-critical staging acceptance after two
verified blockers were fixed. Production approval remains conditional on
production backup ownership and the production smoke test.**

All five migrations and the release-critical sections of
`docs/MANUAL_QA_CHECKLIST.md` passed with separate Admin, Pharmacist, and
Cashier staging accounts.

Critical release gates:

- establish Supabase backup and recovery ownership;
- deploy the reviewed commit with production Supabase variables.

## Final Release Candidate Review

### Included features confirmed

- Dashboard and analytics
- Batch-aware inventory management
- Sales and POS
- Expiry tracking
- Supplier management
- Purchase orders and atomic delivery receiving
- Low-stock alerts
- Admin, Pharmacist, and Cashier roles and permissions
- Medicine catalog
- Sales, inventory, expiry, and purchase reporting
- Global and page-level search, filters, sorting, and pagination

### Excluded scope confirmed absent

No application implementation was found for patient medical records, drug
interaction checking, prescription management, insurance claims,
multi-branch management, loyalty rewards, full accounting, telemedicine,
native mobile applications, AI forecasting, or SMS/email automation.

### Role review

- Admin routes and UI provide full current application management.
- Pharmacist routes permit operations but keep pharmacy settings read-only and
  hide user-role management.
- Cashier routes permit Dashboard, Medicines, and Sales only. Medicine
  management controls are hidden, restricted routes redirect, and RLS limits
  sales visibility to the Cashier's own records.
- Database functions re-check active roles independently of the frontend.

### Workflow review

Implementation paths were confirmed for login, medicine create/edit/search,
low-stock and expiry alerts, sale completion, FEFO stock reduction, receipt
generation, supplier create/edit, purchase creation and receiving, stock
increase, reports and exports, and settings updates.

Unauthenticated route redirects, invalid-login behavior, and authenticated
Admin, Pharmacist, and Cashier workflows were browser-tested. Transactional
RLS, FEFO, concurrency, and rollback paths were verified against staging.

## Deployment Steps

1. Create separate staging and production Supabase projects where practical.
2. Apply all five migrations in filename order.
3. Keep public sign-up disabled and create staff through Supabase Auth.
4. Promote the first owner profile to Admin.
5. Verify all application tables have RLS enabled.
6. Run the complete staging QA checklist.
7. Push the reviewed release to the production Git branch.
8. Import the repository into Vercel.
9. Configure `NEXT_PUBLIC_SUPABASE_URL` and one public Supabase key.
10. Deploy, set the final Vercel/custom URL in Supabase Auth URL Configuration,
    and complete post-deployment smoke testing.

See `docs/DEPLOYMENT.md` for commands, rollback guidance, and official references.

## Latest Test and Build Status

- Darman branding validation passed lint, typecheck, production build, metadata/icon checks, console checks, and a 375 px overflow check on June 21, 2026

- `npm run lint`: passed June 19, 2026 after staging fixes
- `npm run typecheck`: passed June 19, 2026 after staging fixes
- `npm run build`: passed June 19, 2026 after staging fixes
- Tracked-file secret scan and UTF-8 documentation scan: passed for RC1
- `.env.local` remains ignored and untracked
- Browser check: sign-in metadata, protected Settings redirect, and 375 px
  horizontal-overflow check passed June 19, 2026
- Final RC browser check: invalid credentials produced the correct beginner-friendly
  message; every protected route redirected to `/login`; 375 px sign-in layout
  had no horizontal overflow
- HTTP check: production-hardening security headers were present June 19, 2026
- Final RC HTTP check: `X-Powered-By` was removed and all configured security
  headers were present
- UTF-8 source audit found no malformed source or documentation text
- CSV generation test: passed June 19, 2026 with UTF-8 BOM, expected headers, and expected row count
- PDF generation test: passed June 19, 2026 with a valid PDF document and readable filename
- Fresh staging migration application: passed June 19, 2026
- Authenticated role, RLS, FEFO, concurrency, rollback, receiving, duplicate
  delivery, role-change, receipt, report, and export checks: passed June 19,
  2026
- Responsive checks at 375, 768, 1024, and 1440 px: passed June 19, 2026
- Staging Vercel deployment and Supabase Auth URL configuration: passed
- Detailed evidence: `docs/STAGING_QA_RESULTS.md`
- The npm advisory endpoint was unavailable during the final RC review. The two
  previously recorded moderate transitive findings remain the latest known result.

## Current Known Issues

- New medicines have zero stock until a purchase order is delivered or a future manual stock adjustment is added.
- Inventory batches remain read-only outside the protected purchase receiving workflow.
- Password recovery and Auth account creation are not implemented.
- Password recovery, Auth user creation, invitations, and account deactivation remain Supabase Dashboard tasks.
- Reports are client-aggregated from RLS-protected operational tables; very large future datasets may require database reporting functions or pagination.
- Global search intentionally caps each record type for small-to-medium pharmacy data and does not use an external search service.
- Dashboard expiry windows are view filters and do not change the persistent application setting.
- Manual stock adjustments are deferred.
- Live stock decrease, FEFO allocation, concurrent sale locking, and rollback
  are verified in staging.
- Receipt PDFs use a compact fixed receipt page and may continue onto the printable receipt more cleanly for unusually large carts.
- Database types must be regenerated after future schema changes.
- Two moderate transitive npm audit findings remain; do not force a breaking downgrade.
- Phase 10 database hardening is verified against the live staging project.
- The final production URL, production Auth URL, and production backup policy
  remain deployment-time responsibilities.

## Final Manual Testing Checklist

The full checklist is maintained in `docs/MANUAL_QA_CHECKLIST.md`. The June 19,
2026 staging evidence is recorded in `docs/STAGING_QA_RESULTS.md`.

Release-blocking checks:

- unauthenticated route redirects;
- Admin, Pharmacist, and Cashier route and RLS behavior;
- medicine creation, deactivation, search, stock, and expiry display;
- atomic purchase receiving, rollback, and duplicate protection;
- atomic FEFO sales, concurrency, insufficient-stock rollback, and receipts;
- supplier history and inactive-supplier behavior;
- report totals, search, CSV, and PDF exports;
- settings updates, role changes, and self-role blocking;
- mobile layouts, keyboard focus, loading, empty, error, and confirmation states;
- Vercel environment variables, Supabase logs, security headers, and backups.

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
- Keep shared list controls small and composable instead of introducing a heavy data-grid dependency.
- Use deferred client-side search for the current small-to-medium dataset size.
- Limit sales history to the latest 250 completed sales for responsive browser-side filtering.
- Preserve RLS as the global-search authorization boundary and do not request supplier or purchase data for Cashiers.
- Keep pagination local to visible filtered results and reset to the first page when search, filters, sorting, or page size changes.
- Keep Auth account lifecycle operations out of the browser until a server-only Admin API is deliberately introduced.
- Allow Admin role changes only through a security-definer function and block self-demotion.
- Let Pharmacists review pharmacy identity and receipt settings without granting update access.
- Keep Storage optional and private; do not add uploads until purchase documents have a defined workflow.
- Treat sales, purchase receiving, batch changes, and adjustment logging as
  RPC-only workflows. RLS must not expose direct browser writes.
- Keep physical batch numbers case-insensitively unique per medicine.
- Accept the current Supabase publishable-key name while retaining legacy
  anon-key compatibility during deployment transition.
- Keep deferred infrastructure guidance out of beginner-facing operational screens.

## Next Recommended Prompt

Review and commit the staging fixes, configure production backup ownership,
apply the five migrations to production, deploy the reviewed commit, and repeat
the production smoke-test subset of `docs/MANUAL_QA_CHECKLIST.md`.
