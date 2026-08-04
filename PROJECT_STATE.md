# Project State

Last updated: August 4, 2026.

## Current Phase

Phase 24 complete: cross-device reliability hardening for cached deployments, restricted browser storage, transient network failures, older JavaScript and CSS support, and application-level error recovery.

The core single-branch Pharmacy Management System MVP is feature-complete and ready for controlled deployment after the release checklist is completed.

## Current Branch

- `main`
- Latest commit before this phase: `646ac82` - fixed `DOCUMENTATION.md`
- Current uncommitted changes: Phase 24 reliability fixes and documentation

## Completed Work

- Role-based authentication and access for Admin, Pharmacist, and Cashier.
- Medicine catalog, category management, batch-aware inventory, low-stock, and expiry warnings.
- POS with FEFO allocation, atomic sale completion, receipts, and PDF output.
- Supplier management, purchase orders, and atomic delivery receiving.
- Dashboard, reports, CSV/PDF export, global search, filtering, and pagination.
- Pharmacy settings and protected Admin user-role management.
- Responsive app shell, Darman branding, persistent light/dark mode, and cashier-first navigation.
- Automatic one-time recovery when a device has stale Next.js assets after deployment.
- Safe theme behavior when browser storage is blocked or unavailable.
- Selective retry and reconnect recovery for transient client data-loading failures.
- Global error and not-found recovery pages, plus CSS color fallbacks for older browsers.
- Replaced unsupported `Array.prototype.toSorted()` and `.at()` calls with broadly compatible equivalents across navigation, inventory, suppliers, purchases, sales, dashboard, and reports.
- Deployment, manual QA, staging evidence, client guide, data-flow diagrams, ERDs, and university proposal documents.

## Recently Changed Files

- `app/layout.tsx` detects stale or missing Next.js chunks and performs one controlled refresh.
- `components/providers/theme-provider.tsx` tolerates unavailable browser storage.
- `components/providers/query-provider.tsx` retries transient network failures and refetches after reconnection.
- `app/global-error.tsx` and `app/not-found.tsx` provide recovery screens.
- `app/globals.css` includes legacy color fallbacks before OKLCH values.
- List sorting and dashboard array access no longer depend on newer JavaScript array methods that fail in older mobile browsers and webviews.
- `PROJECT_STATE.md` and `docs/CLIENT_GUIDE.md` document the changes.

## Database and Schema

Tables:

- `profiles`, `medicine_categories`, `suppliers`, `medicines`
- `inventory_batches`, `sales`, `sale_items`
- `purchase_orders`, `purchase_order_items`, `inventory_adjustments`
- `app_settings`

View and protected workflows:

- `medicine_inventory_summary`
- RPCs for sale completion, purchase creation/status/receiving, and user-role changes.

Migrations, all required in filename order:

1. `202606180001_initial_schema.sql`
2. `202606190001_complete_sale_rpc.sql`
3. `202606190002_purchase_order_workflow.sql`
4. `202606190003_admin_settings.sql`
5. `202606190004_production_hardening.sql`

No new migration was added in the latest commit. `supabase/seed.sql` was expanded with realistic reset/demo data; it is not a production migration.

## Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Legacy alternative: `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Configure one public key, not both. No service-role key or application URL is required by the current app. See `.env.example`.

## Security and RLS Status

- RLS and role-aware route/UI guards are implemented.
- Inventory, sales, purchase, and adjustment mutations use protected transactional RPCs; direct browser writes are removed.
- Profile creation is handled by an Auth trigger; role changes use the protected `change_user_role` RPC, with self-role changes blocked.
- Master records are deactivated instead of hard-deleted from the browser.
- Batch numbers are case-insensitively unique per medicine; purchase expected dates cannot be in the past.
- Staging verification on June 19, 2026 recorded successful role, RLS, FEFO, concurrency, rollback, receiving, receipt, report, export, and responsive checks. Reconfirm this before a production release.

## Documentation Status

Current and maintained:

- `docs/CLIENT_GUIDE.md` - beginner user and maintenance guide.
- `docs/DEPLOYMENT.md` - Supabase and Vercel deployment process.
- `docs/MANUAL_QA_CHECKLIST.md` and `docs/STAGING_QA_RESULTS.md` - QA evidence.
- `docs/diagrams/` and `docs/new docs/` - editable DFD and ERD sources and exported diagrams.
- `docs/final proposal/` - monograph proposal deliverables.

## Known Issues and Constraints

- Production deployment remains conditional on completing the release checklist with separate Admin, Pharmacist, and Cashier accounts.
- Reports are client-aggregated from RLS-protected operational data; high-volume deployments may need server/database reporting and pagination.
- No automated test suite is currently configured; validation relies on lint, type-checking, production builds, and the manual QA checklist.
- The application targets browsers supported by Next.js 16. Extremely old browsers and obsolete embedded webviews cannot be guaranteed; use a current Chrome, Edge, Firefox, or Safari release.

## Latest Test and Build Status

Passed on August 4, 2026:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

## Next Recommended Step

Deploy Phase 24 to Vercel, then test the deployed URL on the previously affected devices. Open it once normally, once in private browsing, switch themes, disconnect/reconnect the network, and verify role-specific navigation with Admin, Pharmacist, and Cashier accounts.
