# CampusShare — API Reference

## Authentication

All API endpoints (except `/api/auth/*` and `GET /api/items`) require authentication via NextAuth JWT session.  
Each handler calls `getServerSession(authOptions)` and returns `401 Unauthorized` if no session exists.

### Base URL
```
http://localhost:3000/api
```

---

## Auth Routes

### `GET/POST /api/auth/[...nextauth]`
NextAuth catch-all handler. Manages sign-in, sign-out, session, CSRF, callbacks.

---

## Items API

### `POST /api/items` — Create Item
| Property | Detail |
|---|---|
| **Auth** | Required (student/admin) |
| **Blocked Check** | Yes |

**Request Body:**
```json
{
  "title": "Graphing Calculator",
  "description": "TI-84 Plus in great condition",
  "price": 50,
  "availability": ["Monday", "Wednesday", "Friday"],
  "images": ["https://res.cloudinary.com/..."],
  "category": "Electronics",
  "condition": "Like New",
  "type": "Rent",
  "rentCoins": 50,
  "date": "2026-03-01",
  "timeSlot": "Morning",
  "rentalDuration": "1 week",
  "availableFrom": "2026-03-01",
  "availableUntil": "2026-06-30"
}
```

**Response (201):**
```json
{
  "id": "clxx123...",
  "title": "Graphing Calculator",
  "price": 50,
  "status": "active",
  "ownerId": "user_id",
  "images": ["https://res.cloudinary.com/..."],
  ...
}
```

**Validations:**
- `title` required, max 200 chars
- `price` required
- `availability` required, array of valid day names
- `description` max 2000 chars

---

### `GET /api/items` — List Items
| Property | Detail |
|---|---|
| **Auth** | Not required |
| **Query Params** | `query` (optional search string) |

**Side Effect:** Calls `processExpirations()` on every request.

**Response:** Array of items with `status IN ['active', 'AVAILABLE']`, filtered by date expiry. Includes `availability[]` and `owner { name, image }`.

---

### `PUT /api/items` — Update Item
| Property | Detail |
|---|---|
| **Auth** | Required (owner only) |

**Request Body:** Same fields as POST, plus `id` (required) and `status`.

---

### `DELETE /api/items?id=xxx` — Delete Item
| Property | Detail |
|---|---|
| **Auth** | Required (owner only) |

---

### `GET /api/items/[id]` — Get Single Item
| Property | Detail |
|---|---|
| **Auth** | Not required |

**Response:** Item with `availability[]` and `owner { id, name, image }`.

---

### `PATCH /api/items/[id]` — Patch Item
| Property | Detail |
|---|---|
| **Auth** | Required (owner only) |

**Request Body:** `{ title, description, price, availability, status }`

---

### `DELETE /api/items/[id]` — Delete Item by Path
| Property | Detail |
|---|---|
| **Auth** | Required (owner only) |

---

## Bookings API

### `POST /api/bookings` — Create Booking Request
| Property | Detail |
|---|---|
| **Auth** | Required |
| **Blocked Check** | Yes |

**Request Body:**
```json
{
  "itemId": "clxx123...",
  "date": "2026-03-15",
  "startDate": "2026-03-15",
  "endDate": "2026-03-17",
  "timeSlot": "Afternoon"
}
```

**Validations:**
- Cannot book own item
- Item must be `active` or `AVAILABLE`
- Date format: `YYYY-MM-DD`
- Day-of-week must match item availability
- No overlapping bookings
- Total price = `item.price × number_of_days`

**Side Effects:**
- Creates Booking (status: `PENDING`)
- Updates Item status → `PENDING`
- Creates Notification for owner

---

### `GET /api/bookings` — List User Bookings
| Property | Detail |
|---|---|
| **Auth** | Required |
| **Query Params** | `type=incoming` (requests for my items) or default (my booking requests) |

---

### `PATCH /api/bookings/[id]` — Update Booking Status (Legacy)
| Property | Detail |
|---|---|
| **Auth** | Required (item owner only) |

**Request Body:** `{ "status": "accepted" | "rejected" }`

---

### `POST /api/bookings/[id]/accept` — Accept Booking
| Property | Detail |
|---|---|
| **Auth** | Required (item owner only) |
| **Blocked Check** | Yes |

**Request Body (optional):** `{ "pickupLocation": "Library entrance" }`

**Side Effects:**
- Booking status → `ACCEPTED`
- Notification to borrower with pickup info

---

### `POST /api/bookings/[id]/reject` — Reject Booking
| Property | Detail |
|---|---|
| **Auth** | Required (item owner only) |
| **Blocked Check** | Yes |

**Side Effects:**
- Booking → `REJECTED`
- Item → `AVAILABLE`
- Notification to borrower

---

### `POST /api/bookings/[id]/pay` — Pay for Booking
| Property | Detail |
|---|---|
| **Auth** | Required (borrower only) |

**Preconditions:** Booking must be `ACCEPTED`. Borrower must have sufficient coins.

**Atomic Transaction:**
1. Deduct coins from borrower
2. Fetch system service charge %
3. Credit owner (cost − service charge)
4. Create Transaction record (`RENT_PAYMENT` or `PURCHASE`)
5. Booking → `COMPLETED`
6. Item → `BOOKED` (rent) or `sold` (sell)
7. Notify owner

**Response:**
```json
{
  "id": "booking_id",
  "status": "COMPLETED",
  ...
}
```

---

### `POST /api/bookings/[id]/status` — Update Booking Status (Return Flow)
| Property | Detail |
|---|---|
| **Auth** | Required (borrower or owner) |

**Request Body:**
```json
{ "status": "RECEIVED" }
```
or
```json
{ "status": "RETURN_FLOW", "action": "conf_returned" | "conf_received" }
```

**Status Transitions:**
- `RECEIVED` — borrower confirms receipt (requires `COMPLETED` status)
- `RETURN_FLOW` + `conf_returned` — borrower confirms return
- `RETURN_FLOW` + `conf_received` — owner confirms receipt of returned item
- Both confirmed → `SUCCESSFUL` (item → `active` for Rent type)

---

## Complaints API

### `POST /api/complaints` — File Complaint
| Property | Detail |
|---|---|
| **Auth** | Required (booking participant) |
| **Blocked Check** | Yes |

**Request Body:**
```json
{
  "bookingId": "clxx...",
  "description": "Item was damaged when received"
}
```

**Validations:**
- Booking must be `ACCEPTED` or `COMPLETED`
- No duplicate complaints per user per booking
- Description max 2000 chars

---

## Transactions API

### `POST /api/transactions/buy` — Direct Purchase
| Property | Detail |
|---|---|
| **Auth** | Required |

**Request Body:** `{ "itemId": "clxx..." }`

**Atomic Transaction:**
1. Verify item is `active` and type `Sell`
2. Deduct buyer coins
3. Calculate service charge
4. Credit seller (minus service charge)
5. Item → `sold`
6. Create Transaction record

---

## Notifications API

### `GET /api/notifications` — Get Recent Notifications
| Property | Detail |
|---|---|
| **Auth** | Required |
| **Limit** | 20 most recent |

---

## User API

### `PUT /api/user/profile` — Update Profile
| Property | Detail |
|---|---|
| **Auth** | Required |

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "CS student",
  "phoneNumber": "9876543210",
  "year": "3rd Year",
  "branch": "CSE",
  "section": "A",
  "address": "Room 101, Hostel Block A",
  "image": "https://res.cloudinary.com/..."
}
```

### `POST /api/user/deposits` — Request Deposit/Withdrawal
| Property | Detail |
|---|---|
| **Auth** | Required |

**Request Body (Withdrawal):**
```json
{
  "amount": 100,
  "upiId": "user@upi",
  "type": "WITHDRAWAL"
}
```

**Request Body (Deposit):**
```json
{
  "amount": 100,
  "transactionId": "TXN123456",
  "type": "DEPOSIT"
}
```

### `GET /api/user/deposits` — List My Deposit Requests

### `GET /api/user/my-rentals` — List My Active Rentals

---

## Owner API

### `GET /api/owner/bookings` — List Incoming Bookings for My Items

---

## Cloudinary API

### `POST /api/sign-cloudinary` — Sign Upload
**Request Body:** `{ "paramsToSign": { ... } }`  
**Response:** `{ "signature": "abc123..." }`

---

## Admin API

> All admin routes require `session.user.role === "admin"`.

### `GET /api/admin/analytics` — Platform Metrics
**Response:**
```json
{
  "users": { "total": 150, "blocked": 3, "active": 147 },
  "bookings": { "activeRentals": 12, "pending": 5, "completed": 45, "cancelled": 2 },
  "disputes": { "open": 3, "resolved": 10 },
  "items": { "total": 200, "available": 85 }
}
```

### `GET /api/admin/users` — List All Users (with counts)
### `PATCH /api/admin/users` — Toggle Role or Block
**Body:** `{ "userId": "...", "action": "toggleRole" | "toggleBlock" }`

### `POST /api/admin/user/block/[userId]` — Block User
### `POST /api/admin/user/unblock/[userId]` — Unblock User
### `POST /api/admin/users/block` — Bulk Block

### `GET /api/admin/bookings` — List All Bookings
### `GET /api/admin/items` — List All Items
### `GET /api/admin/complaints` — List All Complaints

### `GET /api/admin/settings` — Get System Settings
### `PATCH /api/admin/settings` — Update Service Charges
**Body:** `{ "rentPercent": 5, "sellPercent": 10 }`

### `GET /api/admin/deposits?status=PENDING&type=WITHDRAWAL` — List Deposit Requests
### `PUT /api/admin/deposits/[id]` — Approve/Reject Deposit
**Body:** `{ "status": "APPROVED" | "REJECTED", "adminMessage": "..." }`

### `POST /api/admin/booking/rollback/[bookingId]` — Rollback Booking
Atomically: Refund renter, deduct owner, booking → `CANCELLED`, item → `AVAILABLE`, complaints → `ACTION_TAKEN`.

### `POST /api/admin/complaint/fine/[complaintId]` — Apply Fine
**Body:** `{ "fineCoins": 50 }`  
Atomically: Deduct from borrower (or add to `pendingFine`), credit owner, create FINE transaction.

### `POST /api/admin/complaint/verify/[id]` — Verify Complaint
### `POST /api/admin/complaint/reject/[id]` — Reject Complaint

### `GET /api/admin/transactions/incomplete` — List Incomplete Transactions
