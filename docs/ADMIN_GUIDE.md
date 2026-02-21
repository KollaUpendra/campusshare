# CampusShare — Admin Guide

## Overview

Admin users have elevated permissions to moderate the platform, manage users, handle disputes, control financial settings, and oversee the entire marketplace. Admin access is determined by the `role` field in the `User` table (value: `"admin"`).

---

## Accessing Admin Panel

**URL:** `/admin`

**Requirements:**
- Must be signed in with a Google account
- User's `role` must be `"admin"` in the database
- Middleware enforces RBAC — non-admins are redirected to `/`

### Setting Up Initial Admin
Since there's no self-service admin promotion, set the first admin via Prisma Studio or SQL:
```bash
npx prisma studio
# Find the user → Set role to "admin"
```
Or via SQL:
```sql
UPDATE "User" SET "role" = 'admin' WHERE "email" = 'admin@example.com';
```

---

## Admin Dashboard (`/admin/dashboard`)

Displays platform-wide metrics:
- **Users:** Total, active, blocked
- **Bookings:** Active rentals, pending, completed, cancelled
- **Disputes:** Open, resolved
- **Items:** Total listed, currently available

Data sourced from `GET /api/admin/analytics`.

---

## User Management (`/admin/users`)

### View All Users
- Name, email, role, blocked status, coin balance, pending fines
- Item/booking/complaint counts per user

### Actions
| Action | API | Effect |
|---|---|---|
| **Toggle Role** | `PATCH /api/admin/users` `{ action: "toggleRole" }` | Promote student → admin or demote admin → student |
| **Toggle Block** | `PATCH /api/admin/users` `{ action: "toggleBlock" }` | Block or unblock user. Blocked users cannot sign in, post items, or make bookings |
| **Block User** | `POST /api/admin/user/block/[userId]` | Directly block a user |
| **Unblock User** | `POST /api/admin/user/unblock/[userId]` | Directly unblock a user |

### Safety Guards
- Admins cannot modify their own account
- Blocked users' existing JWTs remain valid until expiry (30 days); however, the `signIn` callback prevents re-authentication

---

## Booking Management (`/admin/bookings`)

### View All Bookings
- Item title, borrower info, owner info, status, dates, total price
- Sorted by newest first

### Rollback a Booking
**Route:** `POST /api/admin/booking/rollback/[bookingId]`

**Preconditions:** Booking must be `ACCEPTED` or `COMPLETED`

**Atomic Operations:**
1. Refund coins to renter
2. Deduct coins from owner (minimum 0)
3. Create REFUND transaction record
4. Booking → `CANCELLED`
5. Item → `AVAILABLE`
6. Associated complaints → `ACTION_TAKEN`
7. Admin action logged
8. Both parties notified

> ⚠️ Double-rollback prevention: Already `CANCELLED` bookings cannot be rolled back again.

---

## Item Management (`/admin/items`)

### View All Items
- All items across the platform regardless of status
- Full item details with owner info

### Actions
- Admin can manage item visibility via the admin item actions component
- Delete problematic listings

---

## Complaint Management

### View Complaints (`GET /api/admin/complaints`)
- All complaints with booking details, item title, borrower info, complainer info
- Status: `OPEN`, `UNDER_REVIEW`, `RESOLVED`, `ACTION_TAKEN`, `REJECTED`

### Verify Complaint (`POST /api/admin/complaint/verify/[id]`)
- Mark complaint as under review / verified

### Reject Complaint (`POST /api/admin/complaint/reject/[id]`)
- Close complaint as unfounded

### Apply Fine (`POST /api/admin/complaint/fine/[complaintId]`)
**Request:** `{ "fineCoins": 50 }`

**Atomic Operations:**
1. Deduct fine from borrower's coins (as much as available)
2. Remaining amount added to `pendingFine` field
3. Credit deducted amount to item owner
4. Create FINE transaction record
5. Complaint → `ACTION_TAKEN`, resolution → `FINE`
6. Admin action logged
7. Fined user notified

---

## Financial Management

### System Settings (`/admin/settings`)

#### Service Charges (`/admin/settings/service-charges`)
**Route:** `GET/PATCH /api/admin/settings`

Configure platform-wide service charge percentages:
- **Rent Service Charge %** — Deducted from rental payments before crediting owner
- **Sell Service Charge %** — Deducted from purchase payments before crediting seller

**Example:** If rent charge is 5% and rental costs 100 coins:
- Borrower pays: 100 coins
- Owner receives: 95 coins
- Platform fee: 5 coins (tracked in `Transaction.platformFee`)

#### Deposit Management (`/admin/settings/deposits`)
**Route:** `GET /api/admin/deposits`, `PUT /api/admin/deposits/[id]`

Process user deposit and withdrawal requests:

| Request Type | Admin Action | Effect |
|---|---|---|
| **DEPOSIT** (user wants to add coins) | APPROVE | Increment user's coin balance, create DEPOSIT transaction |
| **DEPOSIT** | REJECT | No coin change, user notified |
| **WITHDRAWAL** (user wants to cash out) | APPROVE | Decrement user's coin balance (with balance check), create WITHDRAWAL transaction |
| **WITHDRAWAL** | REJECT | No coin change, user notified |

**Safety:** Withdrawal approval re-checks user balance at time of approval.

---

## Transaction Monitoring

### All Transactions (`/admin/transactions`)
- View all platform transactions (payments, refunds, fines, deposits, withdrawals)

### Incomplete Transactions (`/admin/transactions/incomplete`)
**Route:** `GET /api/admin/transactions/incomplete`
- Identify transactions that may have failed mid-process

---

## Admin Navigation

| URL | Page | Purpose |
|---|---|---|
| `/admin` | Admin Home | Redirect/overview |
| `/admin/dashboard` | Dashboard | Platform metrics |
| `/admin/users` | Users | User management |
| `/admin/items` | Items | Item oversight |
| `/admin/bookings` | Bookings | Booking management & rollback |
| `/admin/settings` | Settings | Configuration overview |
| `/admin/settings/service-charges` | Service Charges | Fee configuration |
| `/admin/settings/deposits` | Deposits | Deposit/withdrawal processing |
| `/admin/transactions` | Transactions | Transaction history |
| `/admin/transactions/incomplete` | Incomplete | Failed transaction monitor |

---

## Admin Action Logging

All admin actions are recorded in the `AdminActionLog` table:

| Field | Content |
|---|---|
| `adminId` | Admin who performed the action |
| `actionType` | `ROLLBACK`, `FINE`, `APPROVE_WITHDRAWAL`, `REJECT_WITHDRAWAL`, `APPROVE_DEPOSIT`, `REJECT_DEPOSIT` |
| `targetUserId` | User affected |
| `bookingId` | Related booking (if any) |
| `complaintId` | Related complaint (if any) |
| `coinsChanged` | Amount of coins involved |
| `notes` | Human-readable description |
| `createdAt` | Timestamp |

---

## Common Admin Workflows

### Handling a Complaint
```
1. Go to Admin → Bookings or check complaint list
2. Review complaint details and booking history
3. Choose action:
   a. REJECT complaint (unfounded)
   b. VERIFY complaint (needs investigation)
   c. APPLY FINE (coins deduction + transfer)
   d. ROLLBACK booking (full refund + cancel)
4. Both parties are auto-notified
```

### Onboarding a New Admin
```
1. User signs up normally via Google
2. Existing admin goes to /admin/users
3. Find the user → Click "Toggle Role"
4. User now has admin access on next page load
```

### Processing Withdrawals
```
1. Go to Admin → Settings → Deposits
2. Filter by status=PENDING, type=WITHDRAWAL
3. Verify UPI ID and amount
4. Click APPROVE or REJECT with admin message
5. If approved: coins deducted, transaction recorded, user notified
6. If rejected: user notified with reason
```
