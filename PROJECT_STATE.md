# Project State

Last updated: July 14, 2026.

## Current Phase

Phase 23 complete: release-candidate maintenance, including dashboard visual refinement, persistent dark mode, sidebar account controls, demo-data seed updates, and final technical/academic documentation.

The core single-branch Pharmacy Management System MVP is feature-complete and ready for controlled deployment after the release checklist is completed.

## Current Branch

- `main`, aligned with `origin/main`
- Latest commit: `0901fc7` - final documents, diagrams, dashboard styling, and dark mode
- Current uncommitted change: this project-state update only

## Completed Work

- Role-based authentication and access for Admin, Pharmacist, and Cashier.
- Medicine catalog, category management, batch-aware inventory, low-stock, and expiry warnings.
- POS with FEFO allocation, atomic sale completion, receipts, and PDF output.
- Supplier management, purchase orders, and atomic delivery receiving.
- Dashboard, reports, CSV/PDF export, global search, filtering, and pagination.
- Pharmacy settings and protected Admin user-role management.
- Responsive app shell, Darman branding, persistent light/dark mode, and cashier-first navigation.
- Deployment, manual QA, staging evidence, client guide, data-flow diagrams, ERDs, and university proposal documents.

## Recently Changed Files

Latest commit mainly changed:

- Dashboard and theme UI: `app/globals.css`, `app/layout.tsx`, `components/dashboard/*`, `components/providers/theme-provider.tsx`, and layout navigation/header components.
- New reusable layout components: `components/layout/account-controls.tsx` and `components/layout/theme-toggle.tsx`.
- Demo reset data: `supabase/seed.sql`.
- Documentation: `docs/CLIENT_GUIDE.md`, data-flow/ERD assets under `docs/`, proposal documents, and generation scripts.

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
- The most recently recorded `lint`, `typecheck`, and production build passed on June 28, 2026. Run them again before deployment because the July 14 UI update occurred afterward.

## Next Recommended Step

Run `npm run lint`, `npm run typecheck`, and `npm run build` against the latest commit. Then follow `docs/MANUAL_QA_CHECKLIST.md` using three role-specific accounts, confirm all five migrations on the target Supabase project, set the two public environment variables, and deploy through the documented Vercel process.
