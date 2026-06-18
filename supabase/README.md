# Supabase Setup

## Apply the schema

Use one of these supported methods:

1. Install the Supabase CLI, link the project, and run `supabase db push`.
2. Open the Supabase SQL Editor and run migrations in filename order:
   - `migrations/202606180001_initial_schema.sql`
   - `migrations/202606190001_complete_sale_rpc.sql`

For local development seed data, run `seed.sql` after the migration.

## Create the first Admin

Public registration must remain disabled. Create the first user from Supabase Authentication, then run:

```sql
update public.profiles
set role = 'admin'
where email = 'owner@example.com';
```

New Auth users receive the `cashier` role by default. An Admin must explicitly promote staff to `pharmacist` or `admin`.

## Generate TypeScript types

The repository includes a checked-in database type file. Regenerate it after every schema change:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > lib/supabase/database.types.ts
```

Review the generated diff, then run `npm run typecheck`.

## Security

- Do not put the service-role key in browser code.
- Do not enable public table policies.
- Use the authenticated user session and RLS for application access.
- Complete sales only through `public.complete_sale`. It validates active staff,
  locks saleable batches, allocates stock by earliest expiry, writes sale records,
  decreases stock, and records inventory adjustments in one transaction.
