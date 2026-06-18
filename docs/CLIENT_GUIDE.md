# Pharmacy Management System — Client Guide

## Project Overview

This system is being built for one pharmacy location. It will help pharmacy staff manage medicines, stock, sales, suppliers, purchase orders, expiry dates, low-stock warnings, and basic reports.

The project now has its database design and security rules. The database must still be connected to a Supabase project before the screens can use real pharmacy data.

## What Is Available Now

- A clean dashboard layout
- A desktop sidebar and mobile menu
- Pages for medicines, sales, suppliers, purchases, reports, and settings
- A login screen design
- Empty, loading, and error messages that will help users understand what is happening
- Database tables for medicines, stock batches, sales, suppliers, purchases, settings, and staff roles
- Security rules that limit what each staff role can read or change

These pages are placeholders. They do not save real data yet.

## How Stock Is Stored

Each medicine has a main catalog record. Actual stock is stored in batches because different deliveries can have different batch numbers, costs, selling prices, and expiry dates.

The system can calculate:

- Total stock for a medicine
- Stock that is not expired and can be sold
- The nearest expiry date

This avoids mixing new stock with old or expired stock.

## User Roles

### Admin

The Admin has full database access through the application. They can manage staff roles, medicines, stock, suppliers, purchases, sales, reports, and settings.

### Pharmacist

The Pharmacist can manage medicines, stock, sales, suppliers, and purchase orders. They cannot change staff roles or sensitive application settings.

### Cashier

The Cashier can check medicine and batch availability and create their own draft sales. They cannot change medicines, stock, suppliers, purchases, users, or settings.

## Connecting the Database

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Open `supabase/migrations/202606180001_initial_schema.sql` from this project.
4. Copy the full SQL file into the SQL Editor and run it once.
5. Optionally run `supabase/seed.sql` to add example medicine categories.
6. Add the Supabase project URL and anonymous key to `.env.local`.
7. Create the pharmacy owner in Supabase Authentication.
8. Run the Admin update shown in `supabase/README.md`.

Do not place the service-role key in any browser file.

## Planned User Manual

The following instructions will be added as each feature is completed:

- How to sign in safely
- How to add and edit medicines
- How to receive and adjust stock
- How to process a sale and print a receipt
- How to manage suppliers
- How to create and receive purchase orders
- How to check low-stock warnings
- How to check expiry warnings
- How to export reports
- How to change simple pharmacy settings

## Running the Project

1. Install Node.js 20 or newer.
2. Open a terminal in the project folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`.
5. Add the Supabase project URL and public anonymous key when a Supabase project is created.
6. Run `npm run dev`.
7. Open `http://localhost:3000`.

## Deployment

Deployment is planned for Vercel. Before deployment, the Supabase project must be connected and the same environment variables must be added in Vercel.

Detailed deployment and redeployment instructions will be added before the production release.

## Project Maintenance

- Keep `.env.local` private.
- Never place the Supabase service-role key in browser code.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` after changes.
- Back up the Supabase database before major production changes.

## Common Problems

### The application says Supabase variables are missing

Copy `.env.example` to `.env.local` and enter the correct Supabase project URL and anonymous key.

### A feature page is empty

This is expected during the foundation stage. Business features will be added one phase at a time.

### A new staff user is shown as Cashier

This is expected. New users receive the safest role automatically. An Admin must promote a user to Pharmacist or Admin.

### The database says permission denied

Check that the user is signed in, has an active profile, and has the correct role. Do not disable Row Level Security to bypass the problem.

### The application does not start

Run `npm install`, then run `npm run dev` again. Check that a supported Node.js version is installed.

## Change History

### Phase 0 — Foundation

- Created the application layout and mobile navigation.
- Added all main placeholder pages.
- Prepared Supabase connection files.
- Added shared loading, error, empty, confirmation, page heading, and statistic components.
- Prepared the project for future authentication and pharmacy features.

### Phase 1 — Database Foundation

- Added staff profiles and Admin, Pharmacist, and Cashier roles.
- Added medicine categories, medicines, suppliers, stock batches, sales, purchase orders, stock adjustments, and pharmacy settings.
- Added database checks to prevent invalid quantities and negative money values.
- Added security rules for each staff role.
- Added automatic Cashier profiles for new Supabase Auth users.
- Added safe example medicine categories for local development.
