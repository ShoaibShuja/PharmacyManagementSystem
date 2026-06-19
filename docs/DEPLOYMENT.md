# Deployment Guide

This guide deploys the Pharmacy Management System with Supabase and Vercel.
Complete the process in a staging environment before using real pharmacy data.

## Deployment Readiness

The codebase is build-ready. Production use is approved only after:

- all five database migrations apply successfully;
- Admin, Pharmacist, and Cashier access is tested;
- sale and purchase receiving transactions are tested with real staging data;
- direct unauthorized database writes are rejected by RLS;
- backups and recovery responsibility are assigned.

Use `docs/MANUAL_QA_CHECKLIST.md` for the complete release test.

## Required Accounts

- A GitHub, GitLab, Bitbucket, or Azure DevOps repository
- A Supabase account
- A Vercel account

## Required Runtime Environment Variables

| Variable | Required | Where to find it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project settings, API section |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase project settings, API keys |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Legacy alternative only | Older Supabase project API settings |

Use either the publishable key or the legacy anon key. Do not configure both.

The application does not currently use:

- an application URL environment variable;
- `SUPABASE_SERVICE_ROLE_KEY`;
- a database password;
- a Supabase access token;
- Storage credentials.

The final Vercel URL must still be entered in Supabase Auth URL Configuration.
That is a Supabase setting, not an application environment variable.

## 1. Create the Supabase Project

1. Sign in to Supabase.
2. Create a new project in the intended production organization.
3. Choose a region close to the pharmacy.
4. Generate and securely store the database password.
5. Wait for project provisioning to finish.
6. Record the project reference, project URL, and publishable key.

Do not place the database password in this repository or Vercel.

## 2. Apply Database Migrations

Apply the migrations to staging first, then production.

### Recommended: Supabase CLI

Install and authenticate the Supabase CLI, then run from the repository root:

```bash
npx supabase login
npx supabase init
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Run `supabase init` only when `supabase/config.toml` does not already exist.
Review the migration list before confirming. The CLI applies files from
`supabase/migrations` in filename order.

### Alternative: Supabase SQL Editor

Open the SQL Editor and run each complete file in this exact order:

1. `supabase/migrations/202606180001_initial_schema.sql`
2. `supabase/migrations/202606190001_complete_sale_rpc.sql`
3. `supabase/migrations/202606190002_purchase_order_workflow.sql`
4. `supabase/migrations/202606190003_admin_settings.sql`
5. `supabase/migrations/202606190004_production_hardening.sql`

Do not combine, reorder, or partially rerun migration files.

The optional `supabase/seed.sql` adds example medicine categories only. Do not
run it if the client wants to start with an empty category list.

## 3. Verify Database and RLS

In Supabase Table Editor, confirm these tables exist:

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

Also confirm:

- RLS is enabled on every application table.
- Anonymous users have no table access.
- Authenticated access is controlled by the migration policies.
- `complete_sale`, `create_purchase_order`, `set_purchase_order_status`,
  `receive_purchase_order`, and `change_user_role` exist.
- Direct browser writes to transactional and audit tables are blocked.

Do not disable RLS to fix a permission problem. Correct the user profile, role,
or migration instead.

## 4. Configure Supabase Authentication

The application uses email and password sign-in.

1. Open Authentication settings.
2. Keep the Email provider enabled.
3. Disable public user sign-up.
4. Create staff accounts from Authentication > Users.
5. Use real staff email addresses and temporary strong passwords.
6. Require staff to keep credentials private.

### Configure Application URLs

In Authentication > URL Configuration:

- Set **Site URL** to the final production URL, for example
  `https://pharmacy.example.com`.
- Add `http://localhost:3000` as a development redirect URL if local testing is required.
- Add the stable Vercel production URL or custom domain.
- Add preview URLs only when a preview deployment uses a separate staging database.

The current application does not provide password recovery, invitations, or
public registration. Manage those account tasks in the Supabase Dashboard.

### Create the First Admin

After creating the owner account, run:

```sql
update public.profiles
set role = 'admin'
where email = 'owner@example.com';
```

Verify that exactly one intended profile was updated. Sign in as the owner and
use Settings to assign Pharmacist or Cashier roles to other existing users.

Never change the current Admin's own role during setup.

## 5. Storage Configuration

Supabase Storage is not required for the current application. Receipts and
reports are generated directly in the browser.

Do not create a bucket unless the client has approved a future document
workflow. If a private `pharmacy-documents` bucket is later required, use the
optional SQL and policies in `supabase/README.md`.

Never make pharmacy business documents public. Do not store patient,
prescription, insurance, or clinical files in this product.

## 6. Prepare the Git Repository

Before deployment:

```bash
npm install
npm run lint
npm run typecheck
npm run build
git status
```

Confirm:

- `.env.local` is not tracked;
- no passwords, tokens, private keys, or service-role keys are committed;
- all intended migrations and documentation are committed;
- the production branch contains the reviewed release.

## 7. Create the Vercel Project

1. Push the repository to the chosen Git provider.
2. Sign in to Vercel.
3. Select **Add New Project**.
4. Import the repository.
5. Confirm Vercel detects Next.js.
6. Keep the project root as the repository root.
7. Keep the standard install and build commands unless the project requires a
   deliberate change.

## 8. Configure Vercel Environment Variables

In Vercel Project Settings > Environment Variables, add:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Apply them to Production. For Preview deployments, either:

- use a separate staging Supabase project; or
- do not allow staff to enter production data from preview deployments.

Do not add:

- the Supabase database password;
- `SUPABASE_SERVICE_ROLE_KEY`;
- Supabase personal access tokens;
- staff passwords.

Public Supabase keys are browser-visible by design. RLS is the security boundary.

## 9. Deploy to Vercel

1. Select **Deploy**.
2. Wait for dependency installation, lint-compatible compilation, and the
   Next.js production build.
3. Open the assigned Vercel URL.
4. If a custom domain is required, add it in Vercel Project Settings > Domains.
5. Update the Supabase Auth Site URL after the final production domain is known.
6. Redeploy if environment variables changed after the first build.

Connected Git repositories create new deployments from future pushes. Review
preview deployments before merging to the production branch.

## 10. Post-Deployment Test

Complete `docs/MANUAL_QA_CHECKLIST.md`. At minimum:

1. Confirm unauthenticated protected routes redirect to Sign In.
2. Sign in as Admin, Pharmacist, and Cashier.
3. Confirm every role sees only permitted pages and actions.
4. Add a supplier and medicine.
5. Create an order, mark it Ordered, and receive it with a batch and expiry date.
6. Confirm stock increased once.
7. Complete a sale and confirm FEFO stock reduction.
8. Confirm a Cashier sees only their own sales history.
9. Verify low-stock and expiry alerts.
10. Export CSV and PDF reports.
11. Update pharmacy settings and verify receipt details.
12. Attempt prohibited direct writes and confirm RLS rejects them.
13. Test at mobile and desktop widths.
14. Review Supabase logs for unexpected authorization or database errors.

Do not enter real inventory until all critical checks pass.

## 11. Backup and Recovery

Before launch:

- identify who owns Supabase and Vercel billing and access;
- enable the backup option appropriate to the selected Supabase plan;
- record how to access Supabase database backups;
- test recovery with staging or a separate project;
- export important operational reports regularly;
- keep migration files and source code in version control.

Before applying future migrations, take or verify a current backup.

## 12. Updating the Application

For each release:

1. Make and review changes in a separate branch.
2. Add database changes as a new migration. Never rewrite applied migrations.
3. Run lint, typecheck, and build.
4. Test against staging.
5. Back up production before database changes.
6. Apply production migrations.
7. Deploy the reviewed application commit.
8. Repeat the affected sections of the manual QA checklist.
9. Update `PROJECT_STATE.md` and client documentation.

## 13. Rollback Guidance

For an application-only problem, use Vercel to redeploy the last known-good
deployment.

Database migrations may not be safely reversible. If a migration causes a
production issue:

1. stop data entry if consistency is at risk;
2. identify the failed migration and affected tables;
3. restore from a verified backup or apply a reviewed forward-fix migration;
4. do not delete migration history or manually weaken RLS;
5. rerun transaction and role tests before resuming operations.

## Official References

- [Supabase database migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Supabase CLI reference](https://supabase.com/docs/reference/cli/introduction)
- [Supabase Auth URL configuration](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Vercel Git deployments](https://vercel.com/docs/git)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
