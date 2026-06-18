# Project State

## Current Phase

Phase 2 — Authentication and role-based access.

Last updated: June 18, 2026.

## Completed Features

- Next.js 16 App Router, strict TypeScript, Tailwind CSS 4, and shadcn/ui foundation
- Typed Supabase browser, server, and session proxy clients
- TanStack Query provider and responsive application shell
- Initial normalized database migration, seed data, Auth profile trigger, and RLS policies
- Supabase email/password login and logout
- Server-protected dashboard layout with active profile loading
- Server-side role guards for restricted pages
- Role-aware desktop and mobile navigation
- Access-denied page for inactive, missing-profile, and unauthorized users
- Admin settings page with profile and basic pharmacy settings
- Auth loading, pending, and beginner-friendly error states

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

The `medicine_inventory_summary` view provides total stock, saleable stock, and nearest valid expiry per medicine.

## Current Routes and Pages

- `/` redirects to `/dashboard`
- `/login`
- `/dashboard`
- `/medicines`
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
- Query provider
- Button, card, skeleton, and confirm dialog primitives
- Page header, statistic card, empty state, loading state, error state, and placeholder page

## Current Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — reserved for future server-only administration

See `.env.example`. Never expose the service-role key in browser code.

## Current Supabase Setup State

- The initial migration is in `supabase/migrations/202606180001_initial_schema.sql`.
- Local seed data is in `supabase/seed.sql`.
- New Auth users receive an active Cashier profile by default.
- Login and logout use Supabase Auth.
- Every dashboard route requires a valid session and active profile.
- Restricted pages validate roles on the server.
- Navigation filtering is only a UI convenience; RLS remains the database enforcement layer.
- User invitation and role-management UI are intentionally deferred.
- The migration has not yet been confirmed as applied to a linked Supabase project.

## Latest Test and Build Status

- `npm run lint` — passed on June 18, 2026
- `npm run typecheck` — passed on June 18, 2026
- `npm run build` — passed on June 18, 2026
- Protected application routes are dynamically server-rendered as expected.
- Live role testing still requires the migration and test users in a connected Supabase project.

## Current Known Issues

- Authentication requires valid Supabase credentials and the applied database migration.
- Password recovery and Admin user invitation/role-management UI are not implemented.
- Dashboard values and feature pages still use placeholder data.
- Transactional sales, FEFO stock deduction, purchase receiving, and stock adjustment functions are deferred.
- Database types must be regenerated after future schema changes.
- `npm install` reports two moderate transitive dependency audit findings; do not apply a forced breaking downgrade.

## Important Decisions

- Authenticate and load profiles on the server before rendering protected pages.
- Apply route-level server guards in addition to hiding navigation links.
- Admin sees all navigation items.
- Pharmacist sees Dashboard, Medicines, Sales, Suppliers, Purchases, and Reports.
- Cashier sees Dashboard, Sales, and read-only-oriented Medicine lookup.
- Settings is Admin-only.
- RLS is the real authorization boundary.
- Staff creation and role changes remain outside this phase until a safe Admin workflow is built.

## Next Recommended Prompt

Apply and verify the Supabase migration with all three roles, then implement the medicine catalog with Cashier read-only lookup and Admin/Pharmacist management.
