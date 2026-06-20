# Darman Manual QA Checklist

Run this checklist against a fresh staging Supabase project after applying every
migration in filename order. Use separate Admin, Pharmacist, and Cashier users.

## Setup and Security

- [ ] Public sign-up is disabled in Supabase Authentication.
- [ ] All five migrations apply successfully to an empty project.
- [ ] The application works with `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [ ] The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` also works when used alone.
- [ ] No service-role key is present in browser environment variables or bundles.
- [ ] Unauthenticated visits to every protected route redirect to `/login`.
- [ ] Admin can open every application route.
- [ ] Pharmacist cannot manage users or edit pharmacy settings.
- [ ] Cashier cannot open `/suppliers`, `/purchases`, `/reports`, or `/settings`.
- [ ] Direct browser writes to batches, sales, sale items, purchase records, and
      inventory adjustments are rejected by RLS.
- [ ] Direct profile inserts and direct role updates are rejected.
- [ ] Browser responses include frame, content-type, referrer, and permissions
      security headers.

## Authentication and Roles

- [ ] Valid users can sign in and sign out.
- [ ] Invalid credentials show a useful message without exposing technical data.
- [ ] Inactive users are denied access.
- [ ] Users without a valid profile are denied access.
- [ ] Admin can change another user's role.
- [ ] Admin cannot change their own role.
- [ ] Role changes affect route access and navigation after authorization refresh.
- [ ] Cashier sales history contains only that Cashier's sales.

## Dashboard

- [ ] Admin and Pharmacist see pharmacy-wide completed-sales totals.
- [ ] Cashier sees only permitted sales data.
- [ ] Seven-day trend totals match completed sales.
- [ ] Low-stock counts use non-expired saleable stock.
- [ ] Expired batches are excluded from saleable stock.
- [ ] The 30, 60, and 90-day expiry filters show the correct batches.
- [ ] Empty, loading, and failed-query states are readable and actionable.
- [ ] Dashboard links open Sales and Medicines correctly.

## Medicines and Inventory

- [ ] Admin and Pharmacist can add and edit medicines.
- [ ] Cashier can view medicines but cannot see management actions.
- [ ] Required fields and invalid numbers show clear validation messages.
- [ ] Duplicate SKU, barcode, or category values show a useful error.
- [ ] Medicine deactivation requires confirmation and preserves history.
- [ ] Restoring an inactive medicine returns it to active search results.
- [ ] Search finds brand, generic, SKU, barcode, category, and batch values.
- [ ] Stock, low-stock, expiry, category, status, sorting, and pagination filters work.
- [ ] Batch details show accurate quantity, cost, price, and expiry values.
- [ ] Direct batch insert, update, and delete attempts fail.

## Sales and POS

- [ ] Medicine search finds name, generic name, SKU, and barcode.
- [ ] Only active medicines with non-expired stock can be sold.
- [ ] Cart quantity cannot exceed currently visible saleable stock.
- [ ] Discount cannot be negative or exceed subtotal.
- [ ] Cash, Card, and Other payment methods complete successfully.
- [ ] Completing a sale creates one sale and the expected batch-level sale items.
- [ ] FEFO uses the earliest-expiring valid batch first.
- [ ] A sale spanning multiple batches records each allocation correctly.
- [ ] Stock decreases exactly once and an adjustment is written for each allocation.
- [ ] Two concurrent sales cannot oversell the same stock.
- [ ] Insufficient stock rolls back the entire sale.
- [ ] A failed sale does not create partial sale, item, or adjustment records.
- [ ] Receipt totals, batches, pharmacy details, print view, and PDF are correct.
- [ ] Sales history search, payment filter, sorting, and pagination work.
- [ ] Reports and global search refresh after a completed sale.

## Suppliers

- [ ] Admin and Pharmacist can add and edit suppliers.
- [ ] Invalid email addresses show a validation message.
- [ ] Inactive suppliers remain visible in history and cannot be used for new orders.
- [ ] Search, status filter, sorting, pagination, details, and purchase history work.
- [ ] Staff avoid creating a second supplier record for the same business.
- [ ] Direct supplier deletion is rejected.

## Purchase Orders and Receiving

- [ ] A draft requires an active supplier and at least one active medicine.
- [ ] Duplicate medicines on one order are rejected.
- [ ] Quantities must be whole numbers greater than zero.
- [ ] Cost and selling prices cannot be negative.
- [ ] Expected delivery dates in the past are rejected by UI and database.
- [ ] Draft to Ordered requires confirmation.
- [ ] Draft and Ordered cancellation require confirmation.
- [ ] Delivered orders cannot be cancelled or delivered again.
- [ ] Delivery requires one batch number and expiry date for every item.
- [ ] Past expiry dates are rejected by UI and database.
- [ ] Case-insensitive duplicate batch numbers for one medicine are rejected.
- [ ] Delivery creates all batches, updates received quantities, and marks the
      order Delivered in one transaction.
- [ ] Delivery updates medicine default supplier and latest default prices.
- [ ] Delivery creates one inventory adjustment for every received item.
- [ ] A failure on any delivery item rolls back the entire delivery.
- [ ] Two users cannot receive the same order twice.
- [ ] Direct purchase-order and purchase-item writes are rejected.

## Reports and Exports

- [ ] Sales report date filtering and totals match completed sales.
- [ ] Inventory report totals exclude expired stock from saleable quantity.
- [ ] Inventory estimated cost matches batch quantity multiplied by batch cost.
- [ ] Expiry report groups are mutually exclusive.
- [ ] Purchase report status and supplier filters are correct.
- [ ] Search works within all four report types.
- [ ] CSV files contain the visible rows, UTF-8 text, and expected headings.
- [ ] PDF files contain pharmacy name, filters, summary, rows, and page numbers.
- [ ] Export buttons are disabled when no rows are visible.

## Settings

- [ ] Admin can update pharmacy name, address, phone, currency, receipt footer,
      and expiry warning days.
- [ ] Pharmacist sees the same values in read-only mode.
- [ ] Cashier cannot open Settings.
- [ ] Invalid currency codes and expiry-day values show clear messages.
- [ ] Settings changes refresh Dashboard, Medicines, Sales, and Reports.
- [ ] User-role changes require confirmation.
- [ ] No incomplete upload or document-management controls appear in Settings.

## Responsive and Accessibility

- [ ] Test at 375 px, 768 px, 1024 px, and 1440 px widths.
- [ ] No page has unintended horizontal scrolling.
- [ ] Mobile navigation opens, closes, and identifies the current page.
- [ ] Tables switch to readable cards or remain safely scrollable on small screens.
- [ ] Dialogs fit within the viewport and remain scrollable.
- [ ] Keyboard focus is visible on links, buttons, fields, and dialog controls.
- [ ] Icon-only actions have accessible names or tooltips.
- [ ] Loading, empty, error, and confirmation states remain understandable without color.

## Deployment

- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] Vercel environment variables match staging.
- [ ] Production database backups and restore steps are documented and tested.
- [ ] Supabase logs are reviewed after role, sale, and receiving tests.
- [ ] CSV and PDF downloads work in supported desktop browsers.
