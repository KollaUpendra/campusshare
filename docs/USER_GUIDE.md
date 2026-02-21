# CampusShare — User Guide

## Overview

CampusShare is a campus-exclusive platform where students can rent, lend, and sell items to each other using a virtual coin system. Every new user starts with **200 coins**.

---

## Getting Started

### 1. Sign In
1. Visit the CampusShare landing page
2. Click **"Start Sharing"** or **"Create Free Account"**
3. Sign in with your Google account
4. Your account is created automatically with 200 starting coins

### 2. Complete Your Profile
After first sign-in, you'll be prompted to complete your profile:
- **Name** — Your display name
- **Year** — Academic year (e.g., "3rd Year")
- **Branch** — Department (e.g., "CSE")
- **Section** — Class section
- **Address** — Hostel/dorm address
- **Phone Number** — Contact number

> ⚠️ Profile completion is mandatory before posting or booking items.

---

## Browsing Items

### Dashboard (`/dashboard`)
- View all available items on the marketplace
- Search by title or description
- Items show: title, price per day, category, condition, owner info, available days

### Item Detail (`/items/[id]`)
- Full item description
- Owner information
- Availability schedule (days of the week)
- Available dates
- Book or buy button

---

## Listing an Item

### Post a New Item (`/post-item`)
1. Navigate to **Post Item** (via bottom nav or menu)
2. Fill in:
   - **Title** — Item name (max 200 chars)
   - **Description** — Details (max 2000 chars)
   - **Type** — Rent or Sell
   - **Price** — Cost per day (Rent) or total price (Sell)
   - **Category** — Electronics, Books, Sports, etc.
   - **Condition** — New, Like New, Used
   - **Availability** — Select days of the week
   - **Date Range** — Optional start/end availability dates
   - **Images** — Upload photos via Cloudinary
3. Click **Submit**

### Managing Your Items (`/my-items`)
- View all items you've listed
- Edit item details
- Delete items
- See current status (active, pending, booked, sold)

---

## Booking an Item

### Renting
1. Find an item on the dashboard
2. Click **"Book"**
3. Select **start date** and **end date**
4. Confirm the booking request
5. Wait for owner to **accept or reject**

### Buying
1. Find a "Sell" type item
2. Click **"Buy"**
3. Coins are transferred immediately
4. Item is marked as sold

---

## Booking Lifecycle

```
You Request → PENDING
    │
    ├── Owner Rejects → REJECTED (done)
    │
    └── Owner Accepts → ACCEPTED
            │
            └── You Pay → COMPLETED
                    │
                    └── You Confirm Receipt → RECEIVED
                            │
                            └── Return Flow:
                                  You: "I returned it"
                                  Owner: "I received it back"
                                        │
                                        └── SUCCESSFUL ✅
```

---

## Coin Economy

| Action | Coins |
|---|---|
| New user signup | +200 coins |
| Rent an item (borrower) | −(price × days) |
| Item rented out (owner) | +(price × days − service charge) |
| Buy an item | −(item price) |
| Sell an item | +(item price − service charge) |
| Admin fine | −(fine amount) |
| Deposit request (approved) | +requested amount |
| Withdrawal request (approved) | −requested amount |

### Deposit & Withdrawal
- Navigate to **Profile → Deposits**
- **Deposit:** Submit a UPI transaction ID for admin verification
- **Withdrawal:** Submit your UPI ID for admin payout
- Requests go to admin queue → PENDING → APPROVED/REJECTED

---

## Complaints

If you have an issue with a rental:
1. Go to your booking
2. Click **"File Complaint"**
3. Describe the issue (max 2000 chars)
4. Admin will review and take action (warning, fine, rollback)

---

## Notifications

- Bell icon in the header shows unread notifications
- Notifications for:
  - New booking request (owner)
  - Booking accepted/rejected (borrower)
  - Payment received (owner)
  - Admin actions (fines, rollbacks)
  - Deposit/withdrawal status updates

---

## Navigation

| Icon | Page | Description |
|---|---|---|
| 🏠 Home | `/dashboard` | Item marketplace |
| ➕ Post | `/post-item` | List a new item |
| 📋 Bookings | `/dashboard/bookings` | My booking requests |
| 👤 Profile | `/profile` | My profile & settings |

---

## Route Map (User-Facing)

| URL | Purpose | Auth Required |
|---|---|---|
| `/` | Landing page | No |
| `/auth/signin` | Google sign-in | No |
| `/dashboard` | Item marketplace | Yes |
| `/items/[id]` | Item detail view | Yes |
| `/items/[id]/edit` | Edit your item | Yes (owner) |
| `/post-item` | Create new listing | Yes |
| `/my-items` | Your listed items | Yes |
| `/dashboard/bookings` | Your booking requests | Yes |
| `/owner/bookings` | Incoming booking requests | Yes |
| `/transactions` | Transaction history | Yes |
| `/profile` | Your profile | Yes |
| `/profile/edit` | Edit profile | Yes |
| `/profile/payments` | Payment & deposit history | Yes |
| `/search` | Search items | Yes |
| `/notifications` | Notification list | Yes |
