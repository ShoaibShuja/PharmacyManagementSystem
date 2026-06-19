# Pharmacy Management System

A production-oriented, single-branch pharmacy operations system for medicines,
batch inventory, sales, suppliers, purchase orders, expiry monitoring, low-stock
alerts, staff roles, and basic reports.

The product is designed for local pharmacy owners and staff. It deliberately
excludes patient records, prescriptions, insurance, accounting, multi-branch
management, and other clinical or enterprise features.

## Current Status

The application code, database migrations, documentation, linting, type checks,
and production build are complete. Before real pharmacy use, deploy to staging,
apply all migrations, and complete the live role and transaction checklist in
[`docs/MANUAL_QA_CHECKLIST.md`](docs/MANUAL_QA_CHECKLIST.md).

## Tech Stack

- Next.js App Router and TypeScript
- Tailwind CSS and shadcn/ui
- Supabase PostgreSQL, Auth, and Row Level Security
- TanStack Query
- React Hook Form and Zod
- Recharts
- jsPDF
- Vercel

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project
- A Vercel account for hosted deployment

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   copy .env.example .env.local
   ```

3. Set the Supabase URL and publishable key in `.env.local`.
4. Apply the database migrations as described in
   [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

## Environment Variables

| Variable | Required | Exposure | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Browser-safe | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Browser-safe | Preferred Supabase public key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Alternative only | Browser-safe | Legacy fallback when no publishable key is available |

Configure one public key variable, not both. The current application does not
require an application URL, service-role key, database password, or Supabase
access token at runtime.

Never prefix a secret with `NEXT_PUBLIC_`.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

Run lint, typecheck, and build before every release.

## Supabase Setup

Apply these migrations in filename order:

1. `202606180001_initial_schema.sql`
2. `202606190001_complete_sale_rpc.sql`
3. `202606190002_purchase_order_workflow.sql`
4. `202606190003_admin_settings.sql`
5. `202606190004_production_hardening.sql`

The migrations create the schema, RLS policies, Auth profile trigger, atomic
sale workflow, atomic purchase receiving workflow, role-management function,
and production hardening.

Public sign-up must remain disabled. Create staff in Supabase Authentication,
then assign roles as documented in [`supabase/README.md`](supabase/README.md).

## Deployment

Use [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the complete Supabase and
Vercel deployment procedure, environment setup, post-deploy verification, and
rollback guidance.

## Documentation

- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): technical deployment and release guide
- [`docs/CLIENT_GUIDE.md`](docs/CLIENT_GUIDE.md): beginner-friendly user manual
- [`docs/MANUAL_QA_CHECKLIST.md`](docs/MANUAL_QA_CHECKLIST.md): staging and release checklist
- [`PROJECT_STATE.md`](PROJECT_STATE.md): current implementation state and limitations
- [`supabase/README.md`](supabase/README.md): database-specific setup notes

## Security Notes

- Authorization is enforced through server route guards and Supabase RLS.
- Stock-changing sales and purchase receiving use protected database functions.
- The publishable or anon key is intentionally public and is safe only when RLS
  remains enabled and correctly tested.
- Do not expose the service-role key, database password, access tokens, or user
  passwords in source code, browser variables, logs, screenshots, or support messages.
