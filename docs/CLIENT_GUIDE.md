# Pharmacy Management System — Client Guide

## Project Overview

This system is being built for one pharmacy location. It will help pharmacy staff manage medicines, stock, sales, suppliers, purchase orders, expiry dates, low-stock warnings, and basic reports.

The project is currently in the foundation stage. The main screens and layout exist, but real pharmacy data and sign-in are not connected yet.

## What Is Available Now

- A clean dashboard layout
- A desktop sidebar and mobile menu
- Pages for medicines, sales, suppliers, purchases, reports, and settings
- A login screen design
- Empty, loading, and error messages that will help users understand what is happening

These pages are placeholders. They do not save real data yet.

## User Roles

### Admin

The Admin will have full access. They will manage staff users, medicines, stock, suppliers, purchases, sales, reports, and settings.

### Pharmacist

The Pharmacist will manage medicines, stock, sales, suppliers, and purchase orders. They will not manage staff users or sensitive system settings.

### Cashier

The Cashier will process sales and check medicine availability. They will not change medicine records, stock, suppliers, purchases, users, or settings.

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

### The application does not start

Run `npm install`, then run `npm run dev` again. Check that a supported Node.js version is installed.

## Change History

### Phase 0 — Foundation

- Created the application layout and mobile navigation.
- Added all main placeholder pages.
- Prepared Supabase connection files.
- Added shared loading, error, empty, confirmation, page heading, and statistic components.
- Prepared the project for future authentication and pharmacy features.
