# Staging QA Results

## Release

- Date: June 19, 2026
- Source baseline: `86be52f`
- Supabase project: `PharmacyManagementSystem`
- Supabase project reference: `mpgqrilrlpwqkjrmmzxf`
- Vercel project: `pharmacy-management-system`
- Staging URL: `https://pharmacy-management-system-delta-pied.vercel.app`
- Test users: separate active Admin, Pharmacist, and Cashier accounts
- Additional denial tests: one inactive account and one account without a profile

Do not use the staging accounts or data for real pharmacy operations.

## Release-Blocking Defects Found and Fixed

### Protected workflow RPCs rejected valid staff

Status: Fixed and passed after a fresh database reset.

The PL/pgSQL functions used a variable named `current_role`. PostgreSQL treated
that name as the `CURRENT_ROLE` keyword, so valid Admin, Pharmacist, and Cashier
users were rejected by purchase, receiving, sale, and role-change functions.

The variable was renamed to `current_app_role` in migrations:

- `202606190001_complete_sale_rpc.sql`
- `202606190002_purchase_order_workflow.sql`
- `202606190003_admin_settings.sql`

The fresh staging database was reset and all five migrations were applied again
in filename order before the acceptance data was recreated.

### Receipts lost fully consumed batch numbers

Status: Fixed, redeployed, and passed.

The Sales page loaded only batches with remaining stock. Historical receipt
items referencing a fully consumed batch therefore displayed `Batch Unknown`.
The receipt query now loads historical batches while the POS continues to
filter saleable stock in application logic.

Retest evidence:

- Receipt `S-20260619-172116-52236C`
- `3 × 10.00 · Batch FEFO-EARLY-215108`
- `2 × 11.00 · Batch FEFO-LATE-215108`

## Requested Acceptance Evidence

| Area | Result | Evidence |
| --- | --- | --- |
| Five migrations | Pass | Remote migration history contains `202606180001` through `202606190004` in order. |
| Public signup | Pass | Direct signup returned HTTP 422 with `signup_disabled`. |
| Publishable key | Pass | Staging application authenticated all three active roles. |
| Legacy anon key | Pass | Direct password authentication succeeded using the legacy anon key alone. |
| Admin routes | Pass | Admin opened Dashboard, Medicines, Sales, Suppliers, Purchases, Reports, and Settings. |
| Pharmacist permissions | Pass | Operational routes opened; Settings displayed all pharmacy fields disabled with `View only`; user management was absent. |
| Cashier permissions | Pass | Sidebar contained only Dashboard, Medicines, and Sales. Restricted routes redirected to `/unauthorized?reason=role`. |
| Inactive account | Pass | Redirected to `/unauthorized?reason=inactive` with an actionable message. |
| Missing profile | Pass | Redirected to `/unauthorized?reason=profile` with an actionable message. |
| RLS transactional writes | Pass | Direct batch insert, direct sale insert, and Cashier supplier insert returned HTTP 403. Unauthorized updates changed zero rows. |
| FEFO allocation | Pass | A five-unit sale consumed 3 units from `FEFO-EARLY-215108`, then 2 units from `FEFO-LATE-215108`; the later batch retained 2 units. |
| Concurrent sales | Pass | Two simultaneous four-unit requests against five units produced one four-unit sale; final stock was 1. |
| Insufficient-stock rollback | Pass | A three-unit request against two units failed. Stock remained 2 with no sale item or sale adjustment. |
| Purchase receiving rollback | Pass | A two-item delivery containing one duplicate batch failed. The order stayed Ordered with zero received quantities and no new batches or adjustments. |
| Duplicate-delivery prevention | Pass | Re-receiving a Delivered order returned HTTP 400 and did not add another batch. |
| Role changes | Pass | Admin changed another user through the confirmation dialog and restored the role. Admin self-role change returned HTTP 400. |
| Cashier sale visibility | Pass | Cashier queries returned only sales belonging to that Cashier. |
| Dashboard totals | Pass | Dashboard displayed 2 completed transactions and USD 87.00. |
| Receipt details | Pass | FEFO receipt showed both batches, subtotal USD 52.00, discount USD 1.00, and total USD 51.00. |
| Receipt PDF | Pass | `S-20260619-172116-52236C.pdf` downloaded with a non-zero file size. |
| Reports | Pass | Sales, inventory, expiry, and purchase totals matched staging data. |
| CSV export | Pass | Export contained the expected heading and both receipt rows. |
| PDF report export | Pass | Export began with `%PDF-` and contained 5,940 bytes. |
| Responsive layouts | Pass | Six operational pages had no document-level horizontal overflow at 375, 768, 1024, and 1440 px. |
| Mobile navigation | Pass | Drawer opened with role-aware routes and closed with `aria-expanded=false`. |
| Security headers | Pass | Frame, content-type, referrer, and permissions headers were present. |
| Pharmacy settings | Pass | Admin saved the staging pharmacy name, phone, address, and receipt footer. |

## Remaining Operational Production Tasks

These are not staging code defects:

- choose and verify the production Supabase backup and restore policy;
- review production Supabase logs after the production smoke test;
- configure the final production Auth URL if it differs from staging;
- rotate or remove staging credentials when QA access is no longer required.

## Validation

- `npm run lint`: passed
- `npm run typecheck`: passed
- Vercel production build for the staging project: passed
- Final local `npm run build`: recorded in `PROJECT_STATE.md`
