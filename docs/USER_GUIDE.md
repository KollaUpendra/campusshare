# CampusShare — User Guide

> A guide for students using the CampusShare platform.

---

## Getting Started

### 1. Sign Up / Sign In

1. Visit the CampusShare landing page
2. Click **"Start Sharing"** or **"Create Free Account"**
3. Sign in with your **Google account**
4. You'll receive **200 coins** as a welcome bonus

### 2. Complete Your Profile

After first sign-in, you'll be prompted to complete your profile. Required fields:

| Field | Purpose |
|---|---|
| Name | Display name |
| Year | Academic year (e.g., "3rd") |
| Branch | Department (e.g., "CSE") |
| Section | Class section (e.g., "A") |
| Address | Room/hostel for pickups |
| Phone Number | Contact for coordination |

> ⚠️ Profile must be complete before you can post items or create bookings.

---

## Dashboard

After sign-in, the dashboard (`/dashboard`) shows:
- **Item feed** — Browse all available items for rent or purchase
- **Search** — Filter items by title or description
- **Navigation** — Bottom nav bar for mobile (Dashboard, My Items, Post, Bookings, Profile)

---

## Browsing Items

### Search & Filter

- Use the search bar to find items by title or description
- Items display: image, title, price (in coins), owner, available days
- Click **"View Details"** to see full item information

### Item Detail Page (`/items/[id]`)

Shows:
- Full image gallery
- Title, description, price
- Category and condition
- Available days of the week
- Availability date range
- Owner information
- **"Book Now"** button (for rent items) or **"Buy Now"** button (for sell items)

---

## Posting an Item

1. Navigate to **Post Item** (via bottom nav or `/post-item`)
2. Fill in the form:
   - **Title** — Item name
   - **Description** — Detailed description
   - **Price** — Cost in coins (per day for rent / total for sell)
   - **Type** — Rent or Sell
   - **Category** — Electronics, Books, Sports, etc.
   - **Condition** — New, Like New, Good, Used
   - **Images** — Upload up to multiple photos (via Cloudinary)
   - **Available Days** — Days of the week the item is available
   - **Date Range** — Optional from/until dates
3. Click **Submit**

### Editing Items

- Go to **My Items** (`/my-items`)
- Click **"Edit"** on any item
- Update details and save

### Deleting Items

- From My Items, click on the item and use the delete option

---

## Booking an Item (Renting)

### As a Borrower

1. **Find an item** and click "View Details"
2. **Click "Book Now"**
3. Select your **booking date** and time slot
4. Submit the booking request
5. Wait for the **owner to accept**
6. Once accepted, **pay** the rental cost in coins
7. **Confirm receipt** when you receive the item
8. **Return the item** and confirm the return

### Booking Status Flow

| Status | What It Means |
|---|---|
| `PENDING` | Waiting for owner approval |
| `ACCEPTED` | Owner approved — proceed to pay |
| `COMPLETED` | Payment made successfully |
| `RECEIVED` | You confirmed you have the item |
| `RETURN_FLOW` | Return process in progress |
| `SUCCESSFUL` | Both parties confirmed return |
| `REJECTED` | Owner declined your request |
| `EXPIRED` | Booking date passed without action |
| `CANCELLED` | Admin cancelled/rolled back |

### As an Item Owner

1. Go to **Dashboard → Bookings** or check **Notifications**
2. Review incoming booking requests
3. **Accept** — Set a pickup location for the borrower
4. **Reject** — Decline the request
5. After borrower pays and uses the item:
   - **Confirm return received** when they return it

---

## Buying an Item

For items listed as **"Sell"** type:

1. Click **"Buy Now"** on the item detail page
2. Coins are deducted from your balance
3. Seller receives coins (minus platform service charge)
4. Item is marked as **sold**

---

## Coin Economy

| Action | Coins |
|---|---|
| Account creation | +200 (welcome bonus) |
| Renting out an item | +price (minus service charge) |
| Selling an item | +price (minus service charge) |
| Renting an item | −price |
| Buying an item | −price |
| Fine (by admin) | −fine amount |
| Deposit (admin approved) | +deposit amount |
| Withdrawal (admin approved) | −withdrawal amount |

### Service Charges

The platform deducts a configurable percentage from payments:
- **Rent service charge:** Configured by admin
- **Sell service charge:** Configured by admin

### Deposits & Withdrawals

1. Go to **Profile → Payments**
2. **Deposit:** Submit a UPI transaction ID for admin verification
3. **Withdrawal:** Submit your UPI ID and amount to withdraw

Requests go to `PENDING` status until approved by admin.

---

## Complaints

If you have an issue with a booking:

1. Navigate to the booking details
2. Click **"File Complaint"**
3. Describe the issue (max 2000 characters)
4. Admin will review and may:
   - **Fine the other party**
   - **Roll back the transaction** (refund)
   - **Reject the complaint**

---

## Notifications

- Bell icon in the header shows unread notifications
- Notifications are sent for:
  - Booking accepted/rejected
  - Payment received
  - Admin actions (fines, rollbacks)
  - Complaint resolutions

---

## Navigation

### Mobile Bottom Nav

| Tab | Route | Purpose |
|---|---|---|
| 🏠 Dashboard | `/dashboard` | Item feed |
| 📦 My Items | `/my-items` | Your listed items |
| ➕ Post | `/post-item` | Create new listing |
| 📋 Bookings | `/dashboard/bookings` | Your bookings |
| 👤 Profile | `/profile` | Account settings |

### Header

- **CampusShare logo** — links to home
- **Coin balance** — displayed on desktop
- **🔔 Notifications** — bell icon
- **Avatar** — links to profile

### Footer

- Privacy Policy (`/privacy`)
- Terms of Service (`/terms`)
