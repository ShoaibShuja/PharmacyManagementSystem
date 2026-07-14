# Hotel Management System Guide

> Important: this repository currently contains a pharmacy-management application.
> This document is a simple hotel-operations guide requested for a future hotel
> version. A developer must build or confirm the matching hotel pages before it
> is used as instructions for a live hotel.

## 1. Overview and Project Folders

The system helps a hotel manage rooms, guests, bookings, payments, invoices,
and reports in one place.

| Folder | What it contains |
| --- | --- |
| `app/` | The screens visitors use, such as Dashboard, Rooms, Guests, and Bookings. |
| `components/` | Reusable page parts such as forms, tables, buttons, and menus. |
| `lib/` | Shared rules and connections used by the system. |
| `supabase/` | Database setup, security rules, and sample data. |
| `public/` | Images, logos, and other public files. |
| `docs/` | Guides, checklists, and deployment notes. |
| `scripts/` | Small developer tools for preparing files or documents. |

## 2. Who Uses the System

- **Owner/Admin:** manages staff, rooms, prices, settings, and reports.
- **Receptionist:** manages guests, bookings, check-in, checkout, and payments.
- **Housekeeping (if enabled):** views room status and marks rooms ready.

## 3. Logging In

Open the hotel website, enter your email and password, then select **Sign in**.
Use **Sign out** when leaving a shared computer. Ask the owner to create or
reset accounts; do not share passwords.

## 4. Dashboard

The Dashboard gives a quick daily view: arrivals, departures, occupied and
available rooms, unpaid balances, and recent bookings. Select a number or
alert to open its related list.

## 5. Managing Rooms

Open **Rooms** to add or update a room number, type, price, capacity, and
status. Mark a room unavailable when it needs repair. Do not delete rooms with
booking history; mark them inactive instead.

## 6. Managing Guests

Open **Guests** and select **Add guest**. Save the guest's name, phone, email,
and identification details required by your hotel. Search before adding a new
guest to avoid duplicates.

## 7. Creating and Editing Bookings

Open **Bookings** and select **New booking**. Choose the guest, room, arrival
and departure dates, number of guests, and agreed price. Confirm availability
before saving. Update or cancel a booking as soon as the guest's plan changes.

## 8. Availability Calendar

Open **Calendar** to see rooms by date. Available rooms are free to book;
occupied, reserved, and unavailable rooms should not be assigned to another
guest. Change the date range to plan ahead.

## 9. Check-in and Checkout

At arrival, open the booking, check the guest details, collect any required
payment, and select **Check in**. At departure, review extra charges and the
remaining balance, collect payment, select **Check out**, and send the room to
housekeeping or cleaning.

## 10. Invoices and Payment Status

Each booking should show its total, paid amount, and balance. Use clear payment
statuses such as **Unpaid**, **Partly paid**, and **Paid**. Record the payment
method and reference number where available. Never mark an invoice paid until
the payment is confirmed.

## 11. PDF Invoices

Open the booking or invoice and select **Download PDF** or **Print**. Check the
guest name, dates, room, charges, payments, and hotel details before giving it
to the guest.

## 12. Reports and CSV Export

Open **Reports** to review bookings, occupancy, revenue, payments, and unpaid
balances for a selected date range. Use **Export CSV** to download the current
filtered list for Excel or accounting review.

## 13. Search

Use search to find a guest, booking number, room number, phone number, or
invoice. Keep searches short and clear. If nothing appears, clear filters and
check the selected date range.

## 14. File Uploads

If file uploads are enabled, attach only useful booking files such as an ID
copy, booking confirmation, or payment proof. Check the file before uploading.
Do not upload passwords, bank logins, or unrelated personal files.

## 15. Email Notifications

If email notifications are enabled, the system can send booking confirmations,
payment receipts, and reminders. Confirm the guest email address before
sending. If email is not enabled, provide the PDF invoice or contact the guest
manually.

## 16. Settings You Can Edit

Owners can usually edit the hotel name, address, phone number, currency,
invoice note, check-in/out times, and staff roles. Receptionists should edit
only information they are permitted to change.

## 17. Do Not Change Without Developer Help

Do not change database settings, security permissions, payment rules, email
connection details, invoice numbering, or deployed environment settings. These
changes can expose data or stop bookings and invoices from working.

## 18. Basic Maintenance

- Review arrivals, departures, unpaid balances, and room status each day.
- Keep room prices and availability current.
- Create staff accounts individually and remove access when staff leave.
- Back up important business records as agreed with the owner or developer.
- Install updates only after a backup and a quick test.

## 19. Troubleshooting

| Problem | What to do |
| --- | --- |
| Cannot sign in | Check the email and password; ask the owner to reset access. |
| Room cannot be booked | Check the calendar, room status, and selected dates. |
| Guest or booking is missing | Clear filters and search by name, phone, room, or booking number. |
| Invoice is wrong | Correct the booking or payment before sharing a new PDF. |
| Page says permission denied | Sign in with the correct role; do not disable security settings. |
| PDF or CSV does not download | Allow downloads in the browser and try again. |

## 20. Future Upgrade Ideas

- Online booking website and channel-manager connection.
- Automated email or WhatsApp confirmations.
- Housekeeping task board and room-cleaning status.
- Multiple-language invoices and guest messages.
- Payment gateway connection and deposit collection.
- Occupancy and revenue forecasting.
