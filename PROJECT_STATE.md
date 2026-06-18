# Project State

## Current Phase

Phase 3: Medicine Catalog and Inventory MVP.

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
- `/dashboard`
- `/medicines` provides the completed catalog and inventory lookup MVP
- `/sales`
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
- shadcn/ui button, card, input, label, select, dialog, table, badge, textarea, Sonner, skeleton, and confirmation dialog
- Shared page header, stat card, empty state, loading state, and error state

## Current Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` reserved for future server-only administration

See `.env.example`. Never expose the service-role key in browser code.

## Current Supabase Setup State

- The initial migration is in `supabase/migrations/202606180001_initial_schema.sql`.
- Local seed data is in `supabase/seed.sql`.
- Existing RLS already supports this phase:
  - All active authenticated roles can read medicines, categories, batches, and settings.
  - Only Admin and Pharmacist can create or update medicines and categories.
  - Cashier mutation attempts remain blocked by RLS even if UI controls are bypassed.
- No new SQL or RLS migration was required for Phase 3.
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
- Sales, supplier, purchase, and report workflows remain placeholders.
- Transactional FEFO sales, purchase receiving, and stock adjustments are deferred.
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

## Next Recommended Prompt

Apply and verify the Supabase migration with Admin, Pharmacist, and Cashier users. Then build supplier CRUD and purchase-order receiving with transactional inventory batch creation and inventory adjustment records.
