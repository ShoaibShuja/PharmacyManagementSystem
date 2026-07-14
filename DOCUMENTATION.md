# Darman Pharmacy Management System Guide

## Project Overview

Darman helps one pharmacy manage medicines, stock, suppliers, purchase orders,
sales, expiry warnings, low-stock warnings, and reports. It is designed for
simple daily pharmacy work. It does not manage prescriptions, patient records,
insurance, full accounting, or multiple branches.

## Important Folders

| Folder | What it does |
| --- | --- |
| `app/` | The pages people use, such as Dashboard, Medicines, Sales, and Reports. |
| `components/` | Reusable parts of pages, including forms, tables, buttons, and menus. |
| `lib/` | Shared system rules and secure database connections. |
| `supabase/` | Database setup, security rules, and sample data. |
| `public/` | Images, logos, and other public files. |
| `docs/` | User guides, deployment notes, and testing checklists. |
| `scripts/` | Developer tools that prepare documents or other project files. |

## Who Uses the System

| Role | Main access |
| --- | --- |
| Admin | Full access, including settings and staff roles. |
| Pharmacist | Medicines, stock, sales, suppliers, purchases, reports, and view-only settings. |
| Cashier | Sales and medicine availability only. |

## Logging In

Open the pharmacy website, enter the email and password given by the Admin,
and select **Sign in**. Use **Sign out** before leaving a shared computer.
Cashiers open **Sales** first; Admins and Pharmacists open the **Dashboard**.

## Dashboard

The Dashboard shows today's sales, active medicines, low stock, and expiry
warnings. Review it at the start of each day. Select an alert or list item to
open the related record.

## System Sections

### Medicines

Open **Medicines** to add, edit, search, filter, or deactivate medicines.
Enter the name, category, price, reorder level, and barcode or SKU if used.
New medicines have zero stock until a delivery is received. Deactivate old
medicines instead of deleting them.

### Stock, Low Stock, and Expiry

Stock is added when a purchase order is delivered. Every received item needs a
batch number and expiry date. The system sells the earliest-expiring valid
batch first. Check low-stock and expiry warnings daily, and do not sell expired
stock.

### Sales

Open **Sales**, search for a medicine by name, barcode, SKU, or batch, then add
it to the cart. Check quantity, discount, and payment method before completing
the sale. The system reduces stock automatically. Print or download the receipt
PDF if needed, then select **Start next sale**.

### Suppliers

Open **Suppliers** to add or update a supplier's contact details and notes.
Keep suppliers active when they can still receive purchase orders. Cashiers do
not have access to this section.

### Purchase Orders

Open **Purchases** to create a draft order with medicines, quantities, costs,
and intended selling prices. Mark it **Ordered** after sending it to the
supplier. When goods arrive, confirm delivery once and enter a batch number and
expiry date for each item. Delivery adds stock automatically.

### Reports

Open **Reports** for sales, inventory, expiry, and purchase information. Choose
a date range or filter, then export the visible result as CSV for Excel or PDF
for printing.

### Search and Lists

Use the search boxes to find medicines, batches, receipts, suppliers, and
purchase orders. Clear filters if something appears missing. Use page controls,
sorting, or a larger row count for longer lists.

## Editable Settings

Only Admins can change the pharmacy name, address, phone number, currency,
receipt message, expiry-warning period, and other staff members' roles.
Pharmacists can view pharmacy settings. An Admin cannot change their own role.

## Do Not Change Without Developer Help

Do not change database tables, security permissions, Supabase settings,
migration files, environment variables, stock rules, payment calculations, or
role permissions. These changes can expose data or make stock records wrong.

## Basic Maintenance

- Review low-stock and expiry warnings every day.
- Receive each supplier delivery through its purchase order.
- Give every staff member a separate account and remove access when they leave.
- Back up the Supabase project and test updates before using them live.
- Follow `docs/MANUAL_QA_CHECKLIST.md` after important updates.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| Cannot sign in | Check the email and password; ask an Admin to confirm the account is active. |
| Cannot edit something | Check your role. Cashiers have limited access. |
| Stock is zero | Receive the relevant purchase order with a batch and expiry date. |
| Sale cannot finish | Refresh the Sales page. Another sale may have used the remaining stock. |
| Cannot receive an order | The order must be **Ordered**, not cancelled or already delivered. |
| Report is empty | Check the dates, filters, and your role permission. |
| PDF or CSV will not download | Allow downloads or pop-ups in the browser, then try again. |
| Permission denied | Ask an Admin to check your active role. Do not turn off security settings. |

## Future Upgrade Ideas

Possible future improvements include better large-data reporting, approved
document uploads, automated backups, and more operational dashboard views.
Keep future work focused on pharmacy operations unless the product scope is
formally changed.
