# CampusShare — Database Schema

## ORM & Database

| Property | Value |
|---|---|
| **ORM** | Prisma 5.10.2 |
| **Database** | PostgreSQL (Supabase) |
| **Schema File** | `prisma/schema.prisma` |
| **Connection** | Pooled via PgBouncer (`DATABASE_URL`, port 6543) |
| **Direct Connection** | `DIRECT_URL` (port 5432, for migrations) |

---

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Account : has
    User ||--o{ Session : has
    User ||--o{ Item : owns
    User ||--o{ Booking : "borrows"
    User ||--o{ Notification : receives
    User ||--o{ Transaction : "sends (from)"
    User ||--o{ Transaction : "receives (to)"
    User ||--o{ Complaint : files
    User ||--o{ AdminActionLog : "performs (admin)"
    User ||--o{ AdminActionLog : "target of"
    User ||--o{ DepositRequest : requests

    Item ||--o{ Availability : "available on"
    Item ||--o{ Booking : "booked via"
    Item ||--o{ Transaction : "involved in"

    Booking ||--o{ Complaint : "complained about"

    User {
        string id PK
        string name
        string email UK
        datetime emailVerified
        string image
        string role "default: student"
        boolean isBlocked "default: false"
        float pendingFine "default: 0"
        float coins "default: 200"
        string bio
        string phoneNumber
        string year
        string branch
        string section
        string address
        datetime createdAt
    }

    Account {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token
        string access_token
        int expires_at
        string token_type
        string scope
        string id_token
        string session_state
    }

    Session {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
    }

    Item {
        string id PK
        string title
        string description
        float price
        string status "default: active"
        string ownerId FK
        datetime createdAt
        datetime updatedAt
        string image
        string category "default: Other"
        string condition "default: Used"
        string[] images
        string type "default: Rent"
        string date
        float rentCoins "default: 0"
        string timeSlot
        string availableFrom
        string availableUntil
        string rentalDuration
    }

    Availability {
        string id PK
        string itemId FK
        string dayOfWeek
    }

    Booking {
        string id PK
        string itemId FK
        string borrowerId FK
        string date
        string status "default: pending"
        datetime createdAt
        string timeSlot
        string endDate
        string startDate
        float totalPrice
        string pickupLocation
        boolean isReceived "default: false"
        boolean isReturned "default: false"
    }

    Notification {
        string id PK
        string userId FK
        string message
        boolean isRead "default: false"
        datetime createdAt
    }

    Transaction {
        string id PK
        float amount
        string type
        string status "default: COMPLETED"
        string fromUserId FK
        string toUserId FK
        string itemId FK
        datetime createdAt
        float balanceAfter
        string referenceId
        float platformFee "default: 0"
    }

    Complaint {
        string id PK
        string bookingId FK
        string complainerId FK
        string description
        string status "default: OPEN"
        datetime createdAt
        string adminNotes
        string resolutionAction "default: NONE"
    }

    AdminActionLog {
        string id PK
        string adminId FK
        string actionType
        string targetUserId FK
        string bookingId
        string complaintId
        float coinsChanged
        string notes
        datetime createdAt
    }

    DepositRequest {
        string id PK
        string userId FK
        float amount
        string type "default: WITHDRAWAL"
        string upiId
        string transactionId
        string message
        string status "default: PENDING"
        string adminMessage
        datetime createdAt
        datetime updatedAt
    }

    SystemSettings {
        string id PK
        float rentServiceChargePercent "default: 0"
        float sellServiceChargePercent "default: 0"
        datetime updatedAt
    }
```

---

## Table Details

### User
| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String | PK, CUID | Auto-generated |
| name | String? | | Google profile name |
| email | String? | Unique | Google email |
| emailVerified | DateTime? | | Set by NextAuth |
| image | String? | | Google profile pic URL |
| role | String | Default: `"student"` | `"student"` or `"admin"` |
| isBlocked | Boolean | Default: `false` | Admin-toggled block |
| pendingFine | Float | Default: `0` | Unfulfilled fine amount |
| coins | Float | Default: `200.0` | Virtual currency balance |
| bio | String? | | User bio text |
| phoneNumber | String? | | Contact number |
| year | String? | | Academic year |
| branch | String? | | Academic branch |
| section | String? | | Academic section |
| address | String? | | Address |
| createdAt | DateTime | Default: `now()` | Registration timestamp |

### Item
| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String | PK, CUID | |
| title | String | Required | Max 200 chars (API-enforced) |
| description | String | Required | Max 2000 chars (API-enforced) |
| price | Float | Required | Per-day rental or sale price in coins |
| status | String | Default: `"active"` | `active`, `AVAILABLE`, `PENDING`, `BOOKED`, `sold`, `COMPLETED`, `EXPIRED` |
| ownerId | String | FK → User | Cascade delete |
| image | String? | | Legacy single image URL |
| images | String[] | | Array of Cloudinary URLs |
| category | String | Default: `"Other"` | Item category |
| condition | String | Default: `"Used"` | Item condition |
| type | String | Default: `"Rent"` | `"Rent"` or `"Sell"` |
| date | String? | | Specific date (YYYY-MM-DD) |
| rentCoins | Float | Default: `0` | Rental coin amount |
| timeSlot | String? | | Time slot for rental |
| availableFrom | String? | | Start of availability window |
| availableUntil | String? | | End of availability window |
| rentalDuration | String? | | Duration label |

### Booking
| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String | PK, CUID | |
| itemId | String | FK → Item | Cascade delete |
| borrowerId | String | FK → User | Cascade delete |
| date | String? | | Legacy single date |
| startDate | String? | | Rental start (YYYY-MM-DD) |
| endDate | String? | | Rental end (YYYY-MM-DD) |
| status | String | Default: `"pending"` | See Booking Status Flow below |
| totalPrice | Float? | | Calculated: price × days |
| timeSlot | String? | | Time slot |
| pickupLocation | String? | | Set on accept |
| isReceived | Boolean | Default: `false` | Return flow: borrower confirms |
| isReturned | Boolean | Default: `false` | Return flow: owner confirms |

### Booking Status Flow

```
PENDING → ACCEPTED → COMPLETED (Paid) → RECEIVED → RETURN_FLOW
                                                         │
                                    ┌────────────────────┤
                                    ▼                    ▼
                        PENDING_OWNER_     PENDING_BORROWER_
                        CONFIRMATION       CONFIRMATION
                                    │                    │
                                    └────────┬───────────┘
                                             ▼
                                        SUCCESSFUL
                                    (Item → active again)

PENDING → REJECTED (Item → AVAILABLE)
PENDING → EXPIRED (date passed)
ACCEPTED/COMPLETED → CANCELLED (admin rollback)
```

### Transaction
| Type Values | Description |
|---|---|
| `RENT_PAYMENT` | Renter pays for rental |
| `PURCHASE` | Buyer purchases item |
| `REFUND` | Admin rollback refund |
| `FINE` | Admin fine transfer |
| `WITHDRAWAL` | User coin withdrawal |
| `DEPOSIT` | User coin deposit |

### Indexes
| Table | Index | Type |
|---|---|---|
| Account | `[provider, providerAccountId]` | Unique composite |
| Session | `sessionToken` | Unique |
| User | `email` | Unique |
| Availability | `[itemId, dayOfWeek]` | Unique composite |
| DepositRequest | `userId` | Index |

---

## Data Flow

```
UI (Client Component)
    │
    ▼ fetch('/api/...')
API Route Handler
    │
    ▼ getServerSession() → Auth Check
    │
    ▼ db.model.findMany/create/update/delete
Prisma Client
    │
    ▼ SQL Query
PostgreSQL (Supabase)
    │
    ▼ Result rows
Prisma Client
    │
    ▼ Typed objects
API Route Handler
    │
    ▼ NextResponse.json()
UI (setState → re-render)
```

### Coin Transfer Flow (Payment)

```
Renter clicks "Pay"
    │
    ▼
POST /api/bookings/[id]/pay
    │
    ▼ db.$transaction()
    │   1. user.update(renter, decrement: cost)
    │   2. systemSettings.findFirst() → service charge %
    │   3. user.update(owner, increment: cost - serviceCharge)
    │   4. transaction.create(RENT_PAYMENT, platformFee: serviceCharge)
    │   5. booking.updateMany(status → COMPLETED)
    │   6. item.update(status → BOOKED or sold)
    │   7. notification.create(owner)
    │
    ▼ JSON response
```
