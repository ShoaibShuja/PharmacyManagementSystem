# Project State

## Current Phase

Phase 1 — Supabase database foundation.

Last updated: June 18, 2026.

## Completed Features

- Next.js 16 App Router project with strict TypeScript
- Tailwind CSS 4 theme and responsive base styles
- shadcn/ui-compatible configuration and starter UI primitives
- Supabase browser, server, and session proxy structure
- TanStack Query application provider
- Responsive application shell with sidebar, header, and mobile navigation
- Placeholder pages for authentication and core product areas
- Shared page header, statistic card, empty, loading, error, and confirmation components
- Environment variable example
- Initial Supabase SQL migration with normalized pharmacy tables
- Role helper functions and Auth profile trigger
- Row Level Security policies for Admin, Pharmacist, and Cashier
- Local development category seed data
- Typed Supabase clients using checked-in database types

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

The `medicine_inventory_summary` view provides total stock, saleable stock, and the nearest valid expiry date per medicine.

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

## Current Components

- Application sidebar, header, and mobile navigation
- Query provider
- Button, card, skeleton, and confirm dialog primitives
- Page header
- Statistic card
- Empty state
- Loading state
- Error state
- Placeholder page

## Current Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — reserved for server-only administrative operations

See `.env.example`. Never expose the service-role key in browser code.

## Current Supabase Setup State

- Browser, server, and session proxy clients are typed with the database schema.
- The initial migration is stored in `supabase/migrations/202606180001_initial_schema.sql`.
- Local non-user seed data is stored in `supabase/seed.sql`.
- New Auth users automatically receive a profile with the Cashier role.
- RLS is enabled on every application table.
- No public/anonymous table policies are present.
- The migration has not yet been applied to a linked Supabase project.
- Authentication UI and route protection remain placeholders.

## Latest Test and Build Status

- `npm run lint` — passed on June 18, 2026
- `npm run typecheck` — passed on June 18, 2026
- `npm run build` — passed on June 18, 2026
- Static migration structure check — passed: 11 tables, 11 RLS-enabled tables, and 40 policies
- Live SQL execution was not available because PostgreSQL, Docker, and the Supabase CLI are not installed locally.

## Current Known Issues

- Login form is not connected to Supabase Auth.
- Protected routes do not yet require a session.
- Navigation is not yet filtered by role.
- Dashboard values and all feature pages use placeholder data.
- The SQL migration still needs to be applied to a Supabase project.
- Transactional sale completion, FEFO stock deduction, purchase receiving, and stock adjustment functions are deferred to their feature phases.
- Checked-in database types must be regenerated after applying future schema changes.
- `npm install` reports two moderate dependency audit findings; review without applying forced breaking upgrades.

## Important Decisions

- Keep the installed Next.js 16 version because it satisfies the Next.js 14+ requirement.
- Use Next.js `proxy.ts` for Supabase session refresh.
- Use server and browser Supabase clients in separate modules.
- Keep the initial shell simple and light with an emerald primary color.
- Store stock, batch number, purchase cost, selling price, and expiry per inventory batch.
- Keep medicine-level prices as defaults for creating future batches.
- Use a security-invoker inventory summary view instead of duplicating stock totals on medicines.
- Default every newly created Auth user to Cashier; Admin promotion is an explicit setup action.
- Cashiers can read medicine and batch availability and create their own draft sales, but cannot edit medicine master data.
- Suppliers, purchases, stock corrections, and full sales access are restricted to Admin and Pharmacist.
- Only Admin can manage profiles, roles, and application settings.

## Next Recommended Prompt

Apply the migration to Supabase, then implement email/password authentication, protected routes, password recovery, Admin-controlled user management, and role-aware navigation.
