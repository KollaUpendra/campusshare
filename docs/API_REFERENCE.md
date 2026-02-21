# CampusShare — API Reference

> **Base URL:** `http://localhost:3000/api` | **Auth:** NextAuth JWT via `getServerSession(authOptions)`

---

## Authentication

### `GET|POST /api/auth/[...nextauth]`

NextAuth catch-all handler. Manages OAuth sign-in, sign-out, session, CSRF, and callback flows.

- **Provider:** Google OAuth
- **Login URL:** `/api/auth/signin` (redirects to `/auth/signin` custom page)
- **Callback URL:** `/api/auth/callback/google`
- **Session URL:** `/api/auth/session`

---

## Items

### `GET /api/items`

Fetch active rental/sell items with optional search.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | Query string | No | Search term (title/description) |

**Auth:** Not required (public)  
**Side Effects:** Calls `processExpirations()` to expire stale bookings  

**Response:**
```json
[
  {
    "id": "clxyz...",
    "title": "Graphing Calculator",
    "description": "TI-84 Plus, great condition",
    "price": 50,
    "status": "active",
    "type": "Rent",
    "category": "Electronics",
    "condition": "Used",
    "images": ["https://res.cloudinary.com/.../image.jpg"],
    "rentCoins": 0,
    "date": null,
    "timeSlot": null,
    "availableFrom": null,
    "availableUntil": null,
    "rentalDuration": null,
    "availability": [{ "dayOfWeek": "Monday" }, { "dayOfWeek": "Wednesday" }],
    "owner": { "name": "John", "image": "https://..." },
    "createdAt": "2026-02-01T00:00:00.000Z"
  }
]
```

---

### `POST /api/items`

Create a new item listing.

**Auth:** Required (any authenticated user)  
**Blocked User Check:** Yes

**Request Body:**
```json
{
  "title": "Camping Tent",
  "description": "4-person tent, waterproof",
  "price": 100,
  "type": "Rent",
  "category": "Sports",
  "condition": "Like New",
  "images": ["https://res.cloudinary.com/.../image.jpg"],
  "availability": ["Monday", "Tuesday", "Saturday"],
  "availableFrom": "2026-03-01",
  "availableUntil": "2026-06-30"
}
```

**Response:** `201` — Created item object  
**Errors:** `400` (missing fields), `401` (unauthorized), `403` (blocked)

---

### `PUT /api/items`

Update an existing item.

**Auth:** Required (owner only)  

**Request Body:**
```json
{
  "id": "clxyz...",
  "title": "Updated Title",
  "description": "Updated description",
  "price": 75,
  "category": "Electronics",
  "condition": "Good",
  "images": ["https://..."],
  "availability": ["Monday", "Friday"],
  "availableFrom": "2026-04-01",
  "availableUntil": "2026-07-31"
}
```

---

### `DELETE /api/items`

Delete an item listing.

**Auth:** Required (owner only)  

**Request Body:**
```json
{ "id": "clxyz..." }
```

---

### `GET /api/items/[id]`

Fetch single item details.

**Auth:** Not required  
**Response:** Full item object with owner, availability, and bookings

### `DELETE /api/items/[id]`

Delete a specific item by ID.

**Auth:** Required (owner only)

---

## Bookings

### `POST /api/bookings`

Create a new booking request.

**Auth:** Required  
**Blocked User Check:** Yes  

**Request Body:**
```json
{
  "itemId": "clxyz...",
  "date": "2026-03-15",
  "timeSlot": "10:00-12:00",
  "startDate": "2026-03-15",
  "endDate": "2026-03-17"
}
```

**Validations:**
- Date format must be `YYYY-MM-DD`
- Cannot book own item
- Item must be `active` or `AVAILABLE`
- User must not already have pending booking for same item + date
- Checks profile completion (`isProfileComplete()`)
- Minimum balance check (50 coins)

**Side Effects:** Creates notification for item owner, updates item status to `PENDING`

**Response:** `201` — Booking object  
**Errors:** `400` (validation), `401`, `403` (blocked), `409` (duplicate)

---

### `GET /api/bookings`

Fetch bookings for current user.

**Auth:** Required  

| Parameter | Type | Description |
|---|---|---|
| `type` | Query | `"incoming"` — bookings FOR user's items; omit for bookings BY user |

---

### `POST /api/bookings/[id]/accept`

Owner accepts a pending booking.

**Auth:** Required (item owner only)  
**Blocked User Check:** Yes  

**Request Body:**
```json
{ "pickupLocation": "Library entrance" }
```

**Side Effects:** Booking → `ACCEPTED`, notification sent to borrower

---

### `POST /api/bookings/[id]/reject`

Owner rejects a pending booking.

**Auth:** Required (item owner only)  
**Blocked User Check:** Yes  

**Side Effects (atomic):** Booking → `REJECTED`, Item → `AVAILABLE`, notification to borrower

---

### `POST /api/bookings/[id]/pay`

Borrower pays for an accepted booking (coin transfer).

**Auth:** Required (borrower only)  

**Process (atomic `$transaction`):**
1. Deduct cost from borrower
2. Calculate service charge from `SystemSettings`
3. Credit owner (cost − service charge)
4. Create `Transaction` record (type: `RENT_PAYMENT` or `PURCHASE`)
5. Booking → `COMPLETED`
6. Item → `BOOKED` (rent) or `sold` (sell)
7. Notify owner

**Errors:** `400` (insufficient coins, wrong booking state)

---

### `POST /api/bookings/[id]/status`

Manage post-payment booking lifecycle.

**Auth:** Required (borrower or owner depending on action)  

**Request Body:**
```json
{ "status": "RECEIVED" | "RETURN_FLOW", "action": "conf_returned" | "conf_received" }
```

**Status Transitions:**
- `RECEIVED` — Borrower confirms item receipt (from `COMPLETED`)
- `RETURN_FLOW` with `conf_returned` — Borrower confirms returned
- `RETURN_FLOW` with `conf_received` — Owner confirms received back
- When both flags true → `SUCCESSFUL`, item → `active`

---

### `PATCH /api/bookings/[id]`

Legacy accept/reject handler (uses `status: "accepted" | "rejected"`).

**Auth:** Required (item owner only)

---

## Transactions

### `POST /api/transactions/buy`

Direct purchase of a "Sell" type item.

**Auth:** Required  

**Request Body:**
```json
{ "itemId": "clxyz..." }
```

**Process (atomic):**
1. Verify item is `active` and type `Sell`
2. Check buyer has enough coins
3. Deduct from buyer, credit seller (minus service charge)
4. Item → `sold`
5. Create `PURCHASE` transaction record

---

## Complaints

### `POST /api/complaints`

File a complaint against a booking.

**Auth:** Required (borrower or owner of the booking)  
**Blocked User Check:** Yes  

**Request Body:**
```json
{
  "bookingId": "clxyz...",
  "description": "Item was damaged when received"
}
```

**Validations:**
- Booking must be `ACCEPTED` or `COMPLETED`
- Max 2000 character description
- One complaint per user per booking

---

## Notifications

### `GET /api/notifications`

Fetch latest 20 notifications for current user.

**Auth:** Required  
**Response:** Array of `{ id, message, isRead, createdAt }`

---

## User

### `PUT /api/user/profile`

Update user profile fields.

**Auth:** Required  

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "CS student",
  "phoneNumber": "+91...",
  "year": "3rd",
  "branch": "CSE",
  "section": "A",
  "address": "Room 204, Hostel B",
  "image": "https://res.cloudinary.com/..."
}
```

---

### `GET /api/user/deposits`

Fetch user's deposit/withdrawal requests.

**Auth:** Required

### `POST /api/user/deposits`

Submit a deposit or withdrawal request.

**Auth:** Required  

**Request Body (Withdrawal):**
```json
{ "amount": 50, "upiId": "user@upi", "type": "WITHDRAWAL" }
```

**Request Body (Deposit):**
```json
{ "amount": 100, "transactionId": "TXN123", "type": "DEPOSIT", "message": "Payment via UPI" }
```

---

### `GET /api/user/my-rentals`

Fetch user's active rental bookings (as borrower).

**Auth:** Required  
**Response:** Formatted list with item title, image, owner info, status

---

### `GET /api/owner/bookings`

Fetch bookings for items owned by current user.

**Auth:** Required

---

### `POST /api/sign-cloudinary`

Generate a signed upload URL for Cloudinary.

**Auth:** Required  
**Response:** `{ signature, timestamp, cloud_name, api_key }`

---

## Admin Endpoints

> All admin endpoints require `session.user.role === "admin"`

### `GET /api/admin/analytics`

Platform metrics: user counts, booking stats, dispute counts, item stats.

---

### `GET /api/admin/bookings`

All bookings with item and borrower details.

---

### `GET /api/admin/users`

All users with counts of items, bookings, complaints.

### `PATCH /api/admin/users`

Toggle user role or block status.

**Request Body:**
```json
{ "userId": "clxyz...", "action": "toggleRole" | "toggleBlock" }
```

**Safety:** Cannot modify own account.

---

### `POST /api/admin/user/block/[userId]`

Block a specific user.

### `POST /api/admin/user/unblock/[userId]`

Unblock a specific user.

---

### `GET /api/admin/complaints`

All complaints with booking, item, and complainer details.

### `POST /api/admin/complaint/verify/[id]`

Mark complaint as under review.

### `POST /api/admin/complaint/reject/[id]`

Reject a complaint.

### `POST /api/admin/complaint/fine/[complaintId]`

Apply a coin fine to the borrower.

**Request Body:**
```json
{ "fineCoins": 25 }
```

**Process (atomic):**
1. Deduct from borrower (up to available coins)
2. Remaining becomes `pendingFine`
3. Credit owner
4. Create `FINE` transaction
5. Complaint → `ACTION_TAKEN`
6. Admin action logged

---

### `POST /api/admin/booking/rollback/[bookingId]`

Fully reverse a booking transaction.

**Process (atomic):**
1. Refund renter (increment coins)
2. Deduct from owner (protect against negative)
3. Create `REFUND` transaction
4. Booking → `CANCELLED`
5. Item → `AVAILABLE`
6. Related complaints → `ACTION_TAKEN`
7. Admin action logged
8. Both parties notified

---

### `GET /api/admin/deposits`

All deposit/withdrawal requests.

| Parameter | Type | Description |
|---|---|---|
| `status` | Query | Filter by status (`PENDING`, `APPROVED`, `REJECTED`) |
| `type` | Query | Filter by type (`DEPOSIT`, `WITHDRAWAL`) |

### `PATCH /api/admin/deposits/[id]`

Approve or reject a deposit/withdrawal request.

---

### `GET /api/admin/items`

All items for admin oversight.

---

### `GET /api/admin/settings`

Get platform service charge percentages.

### `PATCH /api/admin/settings`

Update service charge percentages.

**Request Body:**
```json
{ "rentPercent": 5, "sellPercent": 10 }
```

---

### `GET /api/admin/transactions/incomplete`

Fetch incomplete/pending transactions for admin review.
