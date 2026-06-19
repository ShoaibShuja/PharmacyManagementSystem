# Supabase Setup

For the complete production procedure, including Auth URL configuration,
Vercel environment variables, post-deploy testing, backups, and rollback, see
`docs/DEPLOYMENT.md`.

## Apply the schema

Use one of these supported methods:

1. Install the Supabase CLI, run `supabase init` when `config.toml` is missing,
   link the project, and run `supabase db push`.
2. Open the Supabase SQL Editor and run migrations in filename order:
   - `migrations/202606180001_initial_schema.sql`
   - `migrations/202606190001_complete_sale_rpc.sql`
   - `migrations/202606190002_purchase_order_workflow.sql`
   - `migrations/202606190003_admin_settings.sql`
   - `migrations/202606190004_production_hardening.sql`

For local development seed data, run `seed.sql` after the migration.

## Create the first Admin

Public registration must remain disabled. Create the first user from Supabase Authentication, then run:

```sql
update public.profiles
set role = 'admin'
where email = 'owner@example.com';
```

New Auth users receive the `cashier` role by default. An Admin must explicitly promote staff to `pharmacist` or `admin`.

The application can change roles for existing profiles after the Admin settings
migration is applied. Creating Auth users, sending invitations, resetting
passwords, and deactivating accounts remain Supabase Dashboard tasks.

## Optional private document bucket

The current application does not upload files. Receipts are generated and
downloaded directly in the browser. If a future purchase-document workflow needs
Storage, create a private bucket with this SQL:

```sql
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'pharmacy-documents',
  'pharmacy-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "pharmacy_documents_select_staff"
on storage.objects for select to authenticated
using (
  bucket_id = 'pharmacy-documents'
  and private.is_staff()
);

create policy "pharmacy_documents_insert_staff"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'pharmacy-documents'
  and private.is_staff()
);

create policy "pharmacy_documents_delete_admin"
on storage.objects for delete to authenticated
using (
  bucket_id = 'pharmacy-documents'
  and private.is_admin()
);
```

Keep the bucket private. Do not store patient or prescription files.

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
- Create, order, cancel, and receive purchase orders through the purchase workflow
  functions. Delivery locks the order, rejects duplicate receiving, creates
  inventory batches, updates received quantities and medicine defaults, and
  records inventory adjustments in one transaction.
- Change roles only through `public.change_user_role`. Direct profile updates
  are blocked, and an Admin cannot change their own role.
- Browser clients have read-only access to transactional stock, sales,
  purchase, and adjustment tables. Use the protected RPC workflows for changes.
- Batch numbers are case-insensitively unique per medicine.
