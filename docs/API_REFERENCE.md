# CampusShare — Public API Reference

> **Base URL**: `http://localhost:3000` (development)  
> **Auth**: All protected endpoints require a valid NextAuth session cookie (JWT strategy).

---

## Table of Contents

- [Authentication](#authentication)
- [Items](#items)
  - [List Items](#list-items)
  - [Create Item](#create-item)
  - [Update Item (PUT)](#update-item-put)
  - [Delete Item (Query)](#delete-item-query)
  - [Get Item by ID](#get-item-by-id)
  - [Patch Item by ID](#patch-item-by-id)
  - [Delete Item by ID](#delete-item-by-id)
- [Bookings](#bookings)
  - [Create Booking](#create-booking)
  - [List Bookings](#list-bookings)
  - [Update Booking Status](#update-booking-status)
- [Notifications](#notifications)
  - [List Notifications](#list-notifications)
- [Common Error Responses](#common-error-responses)

---

## Authentication

All authentication is handled by NextAuth via the catch-all route:

```
GET/POST  /api/auth/[...nextauth]
```

This route handles sign-in, sign-out, session management, and OAuth callbacks. The application uses **Google OAuth** with a domain restriction (`ALLOWED_DOMAIN` env var).

**Session format** (available via `useSession()` or `getServerSession()`):
```json
{
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@yourcollege.edu",
    "image": "https://lh3.googleusercontent.com/...",
    "role": "student"
  }
}
```

---

## Items

### List Items

Retrieves all active rental items with optional text search.

```
GET /api/items
```

**Auth**: Not required

**Query Parameters**:

| Param   | Type   | Required | Description                                         |
|---------|--------|----------|-----------------------------------------------------|
| `query` | string | No       | Case-insensitive search against title and description|

**Response** `200 OK`:
```json
[
  {
    "id": "clx123...",
    "title": "Lab Coat",
    "description": "White lab coat, size M",
    "price": 50,
    "status": "active",
    "ownerId": "clx456...",
    "createdAt": "2026-02-10T08:00:00.000Z",
    "updatedAt": "2026-02-10T08:00:00.000Z",
    "availability": [
      { "id": "clx789...", "itemId": "clx123...", "dayOfWeek": "Monday" },
      { "id": "clx790...", "itemId": "clx123...", "dayOfWeek": "Wednesday" }
    ],
    "owner": {
      "name": "Jane Smith",
      "image": "https://lh3.googleusercontent.com/..."
    }
  }
]
```

---

### Create Item

Creates a new rental item listing.

```
POST /api/items
```

**Auth**: Required

**Request Body**:
```json
{
  "title": "Scientific Calculator",
  "description": "Casio FX-991EX, perfect for engineering exams",
  "price": 30,
  "availability": ["Monday", "Tuesday", "Friday"]
}
```

| Field          | Type     | Required | Validation                                      |
|----------------|----------|----------|-------------------------------------------------|
| `title`        | string   | Yes      | Must be non-empty                               |
| `description`  | string   | No       | Free text                                       |
| `price`        | number   | Yes      | Must be a positive number                       |
| `availability` | string[] | Yes      | Array of day names ("Monday" through "Sunday")  |

**Response** `200 OK`:
```json
{
  "id": "clx123...",
  "title": "Scientific Calculator",
  "description": "Casio FX-991EX, perfect for engineering exams",
  "price": 30,
  "status": "active",
  "ownerId": "clx456...",
  "createdAt": "2026-02-10T08:00:00.000Z",
  "updatedAt": "2026-02-10T08:00:00.000Z"
}
```

**Errors**: `400` Missing fields · `401` Unauthorized · `500` Server error

---

### Update Item (PUT)

Full update of an item (title, description, price, availability). Uses a transaction to atomically replace availability records.

```
PUT /api/items
```

**Auth**: Required (owner only)

**Request Body**:
```json
{
  "id": "clx123...",
  "title": "Scientific Calculator (Updated)",
  "description": "Casio FX-991EX, recently serviced",
  "price": 25,
  "availability": ["Monday", "Wednesday", "Thursday"]
}
```

| Field          | Type     | Required | Validation                                                |
|----------------|----------|----------|-----------------------------------------------------------|
| `id`           | string   | Yes      | Must be an existing item ID owned by the caller           |
| `title`        | string   | Yes      | Must be non-empty                                         |
| `description`  | string   | No       | Free text                                                 |
| `price`        | number   | Yes      | Must be positive                                          |
| `availability` | string[] | Yes      | Valid day names only; invalid days return 400              |

**Response** `200 OK`: Updated item object (without availability — fetch via GET to see new availability).

**Errors**: `400` Missing/invalid fields · `401` Unauthorized · `403` Not the owner · `404` Item not found · `500` Server error

---

### Delete Item (Query)

Deletes an item using a query parameter. Used by the `EditItemActions` component.

```
DELETE /api/items?id={itemId}
```

**Auth**: Required (owner only)

**Query Parameters**:

| Param | Type   | Required | Description    |
|-------|--------|----------|----------------|
| `id`  | string | Yes      | Item ID to delete |

**Response** `200 OK`: `"Deleted"` (plain text)

**Errors**: `400` Missing ID · `401` Unauthorized · `403` Not the owner · `404` Item not found · `500` Server error

---

### Get Item by ID

Fetches a single item with its availability schedule and owner info.

```
GET /api/items/{id}
```

**Auth**: Not required

**Path Parameters**:

| Param | Type   | Description    |
|-------|--------|----------------|
| `id`  | string | Item ID        |

**Response** `200 OK`:
```json
{
  "id": "clx123...",
  "title": "Lab Coat",
  "description": "White lab coat, size M",
  "price": 50,
  "status": "active",
  "ownerId": "clx456...",
  "createdAt": "2026-02-10T08:00:00.000Z",
  "updatedAt": "2026-02-10T08:00:00.000Z",
  "availability": [
    { "id": "clx789...", "itemId": "clx123...", "dayOfWeek": "Monday" }
  ],
  "owner": {
    "id": "clx456...",
    "name": "Jane Smith",
    "image": "https://lh3.googleusercontent.com/..."
  }
}
```

**Errors**: `404` Item not found · `500` Server error

---

### Patch Item by ID

Partial update of an item. Supports updating title, description, price, status, and/or availability.

```
PATCH /api/items/{id}
```

**Auth**: Required (owner only)

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 40,
  "status": "inactive",
  "availability": ["Monday", "Friday"]
}
```

> **Note**: When `availability` is provided, it performs a **full replacement** (deletes all existing availability records and creates new ones).

**Response** `200 OK`: Updated item object.

**Errors**: `401` Unauthorized · `403` Not the owner · `404` Item not found · `500` Server error

---

### Delete Item by ID

Deletes an item by its ID in the URL path.

```
DELETE /api/items/{id}
```

**Auth**: Required (owner only)

**Response** `200 OK`: `"Item deleted"` (plain text)

**Errors**: `401` Unauthorized · `403` Not the owner · `404` Item not found · `500` Server error

---

## Bookings

### Create Booking

Creates a new booking request for an item. The booking starts in `"pending"` status. A notification is automatically created for the item owner.

```
POST /api/bookings
```

**Auth**: Required

**Request Body**:
```json
{
  "itemId": "clx123...",
  "date": "2026-03-15"
}
```

| Field    | Type   | Required | Validation                                            |
|----------|--------|----------|-------------------------------------------------------|
| `itemId` | string | Yes      | Must reference an existing item                       |
| `date`   | string | Yes      | Format: `YYYY-MM-DD`; must match regex `^\d{4}-\d{2}-\d{2}$` |

**Business Rules**:
1. User cannot book their own item → `400`
2. Item must be available on the requested day of week → `400`
3. No existing pending/accepted booking for the same item+date → `409`

**Response** `200 OK`:
```json
{
  "id": "clxbooking...",
  "itemId": "clx123...",
  "borrowerId": "clx789...",
  "date": "2026-03-15",
  "status": "pending",
  "createdAt": "2026-02-12T10:00:00.000Z"
}
```

**Side Effects**: Creates a `Notification` record for the item owner:
> "New booking request for {item.title} on {date} ({dayOfWeek}) by {user.name}"

**Errors**: `400` Missing fields / self-booking / unavailable day · `401` Unauthorized · `404` Item not found · `409` Already booked · `500` Server error

---

### List Bookings

Retrieves bookings for the authenticated user.

```
GET /api/bookings
```

**Auth**: Required

**Query Parameters**:

| Param  | Type   | Required | Values                       | Description                                     |
|--------|--------|----------|------------------------------|-------------------------------------------------|
| `type` | string | No       | `"incoming"` or omit         | `"incoming"`: requests for user's items. Default: user's own booking requests. |

**Response** `200 OK` (default — user's bookings):
```json
[
  {
    "id": "clxbooking...",
    "status": "pending",
    "date": "2026-03-15",
    "itemId": "clx123...",
    "borrowerId": "clx789...",
    "createdAt": "2026-02-12T10:00:00.000Z",
    "item": {
      "id": "clx123...",
      "title": "Lab Coat",
      "price": 50,
      "owner": { "name": "Jane Smith", "image": "..." }
    }
  }
]
```

**Response** `200 OK` (type=incoming):
```json
[
  {
    "id": "clxbooking...",
    "status": "pending",
    "date": "2026-03-15",
    "item": { "id": "clx123...", "title": "Lab Coat", "price": 50 },
    "borrower": {
      "name": "John Doe",
      "email": "john@yourcollege.edu",
      "image": "..."
    }
  }
]
```

---

### Update Booking Status

Allows the item owner to accept or reject a booking request. Creates a notification for the borrower.

```
PATCH /api/bookings/{id}
```

**Auth**: Required (item owner only)

**Request Body**:
```json
{
  "status": "accepted"
}
```

| Field    | Type   | Required | Values                        |
|----------|--------|----------|-------------------------------|
| `status` | string | Yes      | `"accepted"` or `"rejected"` |

**Response** `200 OK`: Updated booking object.

**Side Effects**: Creates a `Notification` record for the borrower:
> "Your booking request for {item.title} has been {status}."

**Errors**: `400` Invalid status · `401` Unauthorized · `403` Not the item owner · `404` Booking not found · `500` Server error

---

## Notifications

### List Notifications

Retrieves the most recent 20 notifications for the authenticated user, ordered by newest first.

```
GET /api/notifications
```

**Auth**: Required

**Response** `200 OK`:
```json
[
  {
    "id": "clxnotif...",
    "userId": "clx789...",
    "message": "Your booking request for Lab Coat has been accepted.",
    "isRead": false,
    "createdAt": "2026-02-12T11:00:00.000Z"
  }
]
```

> **Note**: Currently returns **all** notifications (both read and unread). The `isRead` field exists in the schema but there is no endpoint to mark notifications as read.

---

## Common Error Responses

All error responses are plain text (not JSON).

| Status | Meaning                          | When                                        |
|--------|----------------------------------|---------------------------------------------|
| `400`  | Bad Request                      | Missing required fields, invalid input       |
| `401`  | Unauthorized                     | No valid session / not logged in             |
| `403`  | Forbidden                        | Authenticated but not the resource owner     |
| `404`  | Not Found                        | Resource ID doesn't exist                    |
| `409`  | Conflict                         | Duplicate booking for same item + date       |
| `500`  | Internal Server Error            | Unhandled server exception                   |

### Error Response Format

```
HTTP/1.1 400 Bad Request
Content-Type: text/plain

Missing required fields
```

> **Note**: The API currently returns plain text error messages, not structured JSON error objects. For production, consider migrating to:
> ```json
> { "error": { "code": "MISSING_FIELDS", "message": "Missing required fields" } }
> ```
