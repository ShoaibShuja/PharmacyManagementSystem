# Project State

## Current Phase

Phase 15: Final Monograph Proposal.

Last updated: June 28, 2026.

## Completed Features

- Next.js 16 App Router, strict TypeScript, Tailwind CSS 4, and shadcn/ui foundation
- Darman product branding with a generated medicine logo and matching browser and installable-app icons
- Solid application navbar background for clear separation from scrolling content
- Responsive medicine filter layout with viewport-contained, solid-background dropdown menus
- Cashier-first workflow with role-aware landing, prioritized New Sale navigation, scanner-friendly barcode entry, lazy sales history, mobile checkout, and one-click next-sale reset
- Inline medicine-card quantity controls for adding or subtracting sale items before checkout
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
- Complete editable multi-page Data Flow Diagram added for the system context,
  Level 1 processes, atomic FEFO sales, purchase receiving, reporting, search,
  settings, and role management
- Advanced five-page DFD added using the official draw.io Data Flow Diagram
  library with numbered processes, identified external entities and data
  stores, labeled flows, balanced process inputs/outputs, and validated DFD
  connection rules
- Advanced six-page ERD added using the official draw.io Entity Relation
  library with conceptual entities and attributes, existence-dependent
  associative entities, complete physical columns and constraints, row-anchored
  crow's-foot relationships, cardinality/modality, and entity data lineage
- Fixed six-page ERD set added in `docs/diagrams/Fixed ERD/` with wider
  readable table layouts, horizontal field labels, matching SVG sources, and
  WebP exports for every page
- Fixed light-mode DFD WebP export set added in `docs/diagrams/Fixed DFD/`
  from the advanced five-page DFD
- Refined proposal generated in `docs/Refined Proposals/` with the fixed DFD
  and ERD diagrams and no appendix section
- New complete six-page ERD set added in `docs/diagrams/New ERD/` with a
  conceptual Chen-style page, row-anchored physical data-model pages, technical
  data types, nullability, constraints, cardinality/modality labels, and
  matching SVG/WebP exports
- Final university-ready monograph proposal generated in
  `docs/final proposal/Darman_Pharmacy_Management_System_Final_Proposal.docx`
  using the fixed light-mode DFD exports and the new complete ERD exports

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

- `/` redirects Cashiers to `/sales` and Admin or Pharmacist users to `/dashboard`
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
- Cashier-first POS medicine grid, barcode scan-to-add, desktop cart, mobile checkout dialog, lazy sales history, next-sale receipt action, print view, and PDF receipt
- Supplier management, supplier form dialog, and supplier detail/history dialog
- Purchase-order management, creation form, order detail, status actions, and delivery form
- Reporting workspace, report filter controls, responsive report tables, summary metrics, and export utilities
- Shared list search, pagination, and list-loading components
- Pharmacy settings form and user-role management
- shadcn/ui button, card, input, label, select, dialog, table, badge, textarea, Sonner, skeleton, and confirmation dialog
- Shared page header, stat card, empty state, loading state, and error state
- Technical architecture diagram in
  `docs/diagrams/darman-data-flow-diagram.drawio`
- Advanced formal DFD in
  `docs/diagrams/darman-advanced-data-flow-diagram.drawio`
- Advanced conceptual and physical ERD in
  `docs/diagrams/ERD/darman-advanced-entity-relationship-diagram.drawio`
- Fixed readable ERD source and WebP exports in
  `docs/diagrams/Fixed ERD/`
- Fixed light-mode DFD source copy and WebP exports in
  `docs/diagrams/Fixed DFD/`
- New complete ERD source, SVG pages, and WebP exports in
  `docs/diagrams/New ERD/`
- Final monograph proposal DOCX, preview HTML, and embedded proposal assets in
  `docs/final proposal/`

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

- Monograph proposal generation passed on June 23, 2026:
  - generated `docs/proposal/Darman_Pharmacy_Management_System_Proposal.docx`;
  - generated `docs/proposal/Darman_Pharmacy_Management_System_Proposal.pdf`;
  - embedded 11 validated DFD and ERD figures;
  - confirmed a 12-week timeline and USD 230 direct student budget;
  - validated DOCX structure, media, headings, tables, TOC field, and page footer;
  - validated the 41-page PDF signature, text, page count, images, representative
    cover, cost-table, and landscape-diagram layouts.
  - `npm run lint`, `npm run typecheck`, and `npm run build` passed after the
    proposal and documentation updates.
- Data Flow Diagram passed XML parsing, duplicate-ID, dangling-edge,
  edge-geometry, and vertex-overlap checks on June 23, 2026
- Advanced formal DFD passed XML parsing, official DFD-symbol checks,
  duplicate-ID checks, labeled-flow checks, process input/output checks,
  prohibited entity/store-flow checks, and shape-overlap checks on June 23,
  2026
- Advanced ERD passed XML parsing, Entity Relation library coverage,
  row-to-row relationship anchoring, orthogonal routing, crow's-foot
  cardinality/modality, complete table-height, dangling-edge, duplicate-ID,
  and table-overlap checks on June 23, 2026
- Fixed readable ERD generation passed on June 23, 2026:
  - generated `docs/diagrams/Fixed ERD/darman-fixed-entity-relationship-diagram.drawio`;
  - exported six readable WebP pages and six matching SVG previews;
  - validated XML parsing, six Draw.io pages, WebP dimensions, and removal of
    the previous vertical table-row text settings.
  - `npm run lint`, `npm run typecheck`, and `npm run build` passed after the
    fixed ERD generation and documentation updates.
- Fixed DFD WebP export generation passed on June 23, 2026:
  - generated five light-mode WebP pages in `docs/diagrams/Fixed DFD/`;
  - copied the editable advanced DFD source into the same folder;
  - validated XML parsing, five Draw.io pages, and WebP dimensions.
  - `npm run lint`, `npm run typecheck`, and `npm run build` passed after the
    fixed DFD export and documentation updates.
- Refined proposal generation passed on June 23, 2026:
  - generated `docs/Refined Proposals/Darman_Pharmacy_Management_System_Refined_Proposal.docx`;
  - generated `docs/Refined Proposals/Darman_Pharmacy_Management_System_Refined_Proposal.pdf`;
  - replaced the proposal DFD and ERD figures with the fixed diagram exports;
  - removed Appendix A from the refined HTML and DOCX content;
  - validated DOCX signature, PDF signature, 29-page PDF output, fixed diagram
    assets, and absence of the appendix heading.
  - `npm run lint`, `npm run typecheck`, and `npm run build` passed after the
    refined proposal and documentation updates.
- New complete ERD generation passed on June 28, 2026:
  - generated `docs/diagrams/New ERD/darman-complete-entity-relationship-diagram.drawio`;
  - exported six matching SVG pages and six WebP pages;
  - validated XML parsing, six Draw.io pages, 305 vertices, 51 relationships,
    and WebP dimensions through the local Node/sharp export path;
  - visually checked the conceptual and physical exports for horizontal text,
    light-mode colors, row-level relationship anchors, and readable table rows.
  - `npm run lint`, `npm run typecheck`, and `npm run build` passed after the
    new ERD generation and documentation updates.
- Final monograph proposal generation passed on June 28, 2026:
  - generated `docs/final proposal/Darman_Pharmacy_Management_System_Final_Proposal.docx`;
  - generated final proposal preview HTML and diagram assets in
    `docs/final proposal/`;
  - embedded 11 fixed DFD and new ERD diagram assets;
  - replaced the final DOCX dynamic table-of-contents field with a static
    contents page to avoid Microsoft Word field-update prompts;
  - removed final-mode non-splitting table-row markers so proposal tables can
    paginate normally in Microsoft Word;
  - recreated Section 7 as plain Word paragraphs with no tables between
    Section 7 and Section 8 to avoid Microsoft Word scroll skips;
  - added a Word-compatible final proposal variant at
    `docs/final proposal/Darman_Pharmacy_Management_System_Final_Proposal_Word_Compatible.docx`
    with portrait-only sections and smaller diagram placement;
  - validated DOCX ZIP signature, file size, embedded media, absence of
    DOCX field codes, external relationships, `headerReference`,
    `footerReference`, header files, and footer files, and confirmed Sections
    7 and 8 are present in the document XML and through a read-only Microsoft
    Word COM open test.
  - `npm run lint`, `npm run typecheck`, and `npm run build` passed after the
    final proposal and documentation updates.
- draw.io Desktop CLI is not installed in the current environment. The fixed
  ERD WebP exports were generated through the local scripted SVG-to-WebP path,
  the new complete ERD WebP exports were generated through the local
  scripted SVG-to-WebP path,
  the fixed DFD WebP exports were generated through the local scripted image
  conversion path, and the `.drawio` sources remain ready for draw.io Desktop
  or diagrams.net.
- Pre-checkout medicine quantity controls passed lint, typecheck, and production build on June 21, 2026; authenticated responsive interaction remains a staging smoke-test item
- Cashier-first sales workflow: lint, typecheck, production build, POS focus, lazy history, and 375 px mobile checkout checks passed June 21, 2026; role-specific landing and 768 px checkout remain staging smoke-test items
- Medicine filter dropdown overflow and background validation passed lint, typecheck, and production build on June 21, 2026
- Solid navbar background validation passed lint, typecheck, and production build on June 21, 2026
- Darman branding validation passed lint, typecheck, production build, metadata/icon checks, console checks, and a 375 px overflow check on June 21, 2026

- `npm run lint`: passed June 28, 2026 after final proposal updates
- `npm run typecheck`: passed June 28, 2026 after final proposal updates
- `npm run build`: passed June 28, 2026 after final proposal updates
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

- Keep the academic proposal source in `scripts/generate-proposal.mjs` so the
  DOCX and PDF share the same content, costs, timeline, diagrams, and wording.
- Use `scripts/generate-proposal.mjs --final` for the final monograph proposal
  DOCX in `docs/final proposal/`; this mode uses fixed DFD diagrams, new ERD
  diagrams, and no DOCX header or footer references.
- Use a student out-of-pocket estimate of USD 230. Treat development labor as
  an academic contribution and list production hosting as an optional future
  operating cost.
- Use editable placeholders for university, faculty, department, student,
  student ID, supervisor, and submission date on the proposal cover.
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
