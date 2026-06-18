# Pharmacy Management System — Client Guide

## Project Overview

This single-location pharmacy system will manage medicines, stock, sales, suppliers, purchase orders, expiry warnings, low-stock warnings, and basic reports.

The database, staff roles, sign-in, sign-out, and page access rules are prepared. Pharmacy feature pages remain placeholders until later phases.

## User Roles

### Admin

Admin users can access Dashboard, Medicines, Sales, Suppliers, Purchases, Reports, and Settings.

### Pharmacist

Pharmacists can access Dashboard, Medicines, Sales, Suppliers, Purchases, and Reports. They cannot access sensitive Settings or manage staff roles.

### Cashier

Cashiers can access Dashboard, Sales, and Medicine lookup. They cannot edit medicine records, stock, suppliers, purchases, users, or settings.

## Signing In

1. Open the application.
2. Enter the email address created for your staff account.
3. Enter your password.
4. Select **Sign in**.

The application checks the account and staff profile before opening the dashboard. Incorrect details show a simple error message.

## Signing Out

Select the sign-out icon in the top-right corner. The application closes the session and returns to the login page.

Always sign out on a shared pharmacy computer.

## Access Messages

- **Inactive account:** Ask the pharmacy Admin to restore access.
- **Missing profile:** Confirm the database migration was applied and the user has a `profiles` record.
- **Role restriction:** Return to the dashboard and use the menu pages available for that role.

Do not disable Row Level Security to bypass access errors.

## How Stock Is Stored

The medicine catalog stores the medicine identity and default prices. Actual stock is stored in separate batches because deliveries can have different batch numbers, costs, selling prices, and expiry dates.

The system can calculate total stock, saleable non-expired stock, and the nearest valid expiry date.

## Connecting Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/202606180001_initial_schema.sql` in the Supabase SQL Editor.
3. Optionally run `supabase/seed.sql`.
4. Copy `.env.example` to `.env.local`.
5. Add the Supabase project URL and anonymous key.
6. Create the pharmacy owner in Supabase Authentication.
7. Promote the owner to Admin using the SQL in `supabase/README.md`.
8. Keep public sign-up disabled in Supabase Authentication settings.

Never place the service-role key in browser code.

## Planned User Manual

Instructions will be added as features are completed:

- Adding and editing medicines
- Receiving and correcting stock
- Processing sales and printing receipts
- Managing suppliers
- Creating and receiving purchase orders
- Checking low-stock and expiry warnings
- Exporting reports
- Changing pharmacy settings

## Running the Project

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Configure `.env.local`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

## Maintenance

- Keep `.env.local` private.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` after changes.
- Back up Supabase before major production changes.
- Regenerate database types after schema changes.

## Common Problems

### Login returns to the login page

Confirm the Supabase URL and anonymous key are correct. Confirm the user exists in Supabase Authentication and has an active `profiles` row.

### Permission denied

Confirm the signed-in user has the correct active role. Do not create public policies.

### A feature page is empty

The business feature is still planned. Authentication and access control are complete, but medicine, stock, sales, and purchase workflows are not.

## Deployment

Deployment is planned for Vercel. Add the same Supabase public environment variables in Vercel before deploying. Detailed deployment instructions will be added during production hardening.

## Change History

### Phase 0 — Foundation

- Created the application shell, responsive navigation, placeholder pages, and reusable UI states.

### Phase 1 — Database Foundation

- Added pharmacy tables, staff roles, constraints, indexes, profile automation, and role-based RLS.

### Phase 2 — Authentication and Access

- Connected email/password login and secure sign-out.
- Protected application pages from signed-out users.
- Loaded the current staff profile and role on the server.
- Added role-specific menus and server route guards.
- Added Admin profile and pharmacy settings display.
- Added clear loading, sign-in error, inactive-account, and access-denied messages.
