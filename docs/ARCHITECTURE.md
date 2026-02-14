# CampusShare — Architecture Documentation

> **Version**: 0.1.0 · **Last Updated**: February 2026 · **Stack**: Next.js 16 / React 19 / Prisma / SQLite / NextAuth

---

## Table of Contents

1. [High-Level Architecture Summary](#1-high-level-architecture-summary)
2. [Module-Level Documentation](#2-module-level-documentation)
3. [Class & Function Reference](#3-class--function-reference)
4. [Data Flow Explanation](#4-data-flow-explanation)
5. [Error Handling Strategy](#5-error-handling-strategy)
6. [Performance Notes](#6-performance-notes)
7. [Known Limitations](#7-known-limitations)

---

## 1. High-Level Architecture Summary

CampusShare is a **campus rental and lending platform** built as a mobile-first Next.js application. It allows authenticated college students to list items for rent and request to borrow items from peers, with an owner-approval workflow.

### Tech Stack

| Layer          | Technology                        | Why                                                                 |
|----------------|-----------------------------------|---------------------------------------------------------------------|
| Framework      | Next.js 16 (App Router)           | Server Components for SEO + fast initial loads; API routes for REST  |
| UI             | React 19, TailwindCSS, shadcn/ui  | Component-level styling with design tokens; accessible primitives   |
| Auth           | NextAuth v4 (JWT strategy)        | Google OAuth with domain restriction; JWT enables middleware RBAC   |
| ORM            | Prisma 5.10                       | Type-safe DB queries; schema-as-code; migration support             |
| Database       | SQLite (file-based)               | Zero-config dev setup; single-file deployment for prototyping       |
| Validation     | Zod + react-hook-form             | Schema-based form validation on the client                          |
| Testing        | Playwright                        | E2E tests across Chromium, Firefox, WebKit, and mobile viewports    |

### System Topology

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Header  │  │ BottomNav│  │ ItemCard │  │BookingBtn  │  │
│  │(session) │  │ (routes) │  │ (server) │  │ (client)   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (fetch / SSR)
┌────────────────────────▼────────────────────────────────────┐
│                     NEXT.JS SERVER                          │
│                                                             │
│  ┌─────────────────┐   ┌──────────────────────────────────┐ │
│  │   Middleware     │   │          API Routes              │ │
│  │  (RBAC guard)   │   │  /api/items   /api/bookings      │ │
│  │                 │   │  /api/notifications               │ │
│  └────────┬────────┘   └──────────────┬───────────────────┘ │
│           │                           │                     │
│  ┌────────▼───────────────────────────▼───────────────────┐ │
│  │                    Prisma Client                       │ │
│  │              (Singleton via globalThis)                │ │
│  └────────────────────────┬──────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ SQL
                   ┌────────▼────────┐
                   │   SQLite DB     │
                   │  prisma/dev.db  │
                   └─────────────────┘
```

### Project Structure

```
campus-share-platform/
├── prisma/
│   └── schema.prisma          # Data models & relations
├── public/                    # Static assets (icons, manifest)
├── src/
│   ├── app/                   # Next.js App Router pages & API
│   │   ├── api/               # REST API endpoints
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   ├── items/         # Item CRUD (GET/POST/PUT/DELETE)
│   │   │   │   └── [id]/      # Single-item ops (GET/PATCH/DELETE)
│   │   │   ├── bookings/      # Booking management (GET/POST)
│   │   │   │   └── [id]/      # Booking status updates (PATCH)
│   │   │   └── notifications/ # User notifications (GET)
│   │   ├── admin/dashboard/   # Admin-only stats page
│   │   ├── dashboard/         # User dashboard
│   │   │   ├── bookings/      # Booking management tab view
│   │   │   └── profile/       # User profile & listings
│   │   ├── items/[id]/        # Item detail page
│   │   │   └── edit/          # Item edit page (owner only)
│   │   ├── post-item/         # New item listing form
│   │   ├── search/            # Dedicated search page
│   │   ├── layout.tsx         # Root layout (providers, shell)
│   │   ├── page.tsx           # Homepage (item grid + search)
│   │   ├── loading.tsx        # Global loading skeleton
│   │   └── globals.css        # Design tokens (light/dark)
│   ├── components/
│   │   ├── auth/              # Authentication UI
│   │   │   ├── Providers.tsx   # SessionProvider wrapper
│   │   │   ├── LoginButton.tsx # Sign in/out toggle
│   │   │   └── SignOutButton.tsx # Destructive sign-out
│   │   ├── items/             # Item-related UI
│   │   │   ├── ItemCard.tsx    # Grid card (server component)
│   │   │   ├── AddItemForm.tsx # Create/edit form (Zod + RHF)
│   │   │   ├── BookingRequestButton.tsx  # Date picker + booking
│   │   │   └── EditItemActions.tsx       # Edit/delete buttons
│   │   ├── layout/            # Shell components
│   │   │   ├── Header.tsx      # Top nav (session-aware)
│   │   │   └── BottomNav.tsx   # Mobile bottom navigation
│   │   └── ui/                # shadcn/ui primitives
│   │       ├── button.tsx, card.tsx, badge.tsx, popover.tsx
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config (Google, JWT, RBAC)
│   │   ├── db.ts              # PrismaClient singleton
│   │   └── utils.ts           # Tailwind class merge utility
│   ├── middleware.ts          # Route protection & RBAC
│   └── types/
│       └── next-auth.d.ts     # Extended Session & JWT types
├── tests/                     # Playwright E2E tests
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.mjs            # Image remote patterns
```

---

## 2. Module-Level Documentation

### 2.1 `prisma/schema.prisma` — Data Model

Defines 7 models across two concerns:

**NextAuth Adapter Models** (managed by `@auth/prisma-adapter`):
| Model               | Purpose                                                  |
|----------------------|----------------------------------------------------------|
| `Account`            | OAuth provider linkage (Google tokens, refresh tokens)   |
| `Session`            | Server-side session records (unused with JWT strategy)   |
| `VerificationToken`  | Email verification tokens (unused — OAuth-only flow)     |

**Core Application Models**:
| Model          | Purpose                                                        | Key Fields                                   |
|----------------|----------------------------------------------------------------|----------------------------------------------|
| `User`         | Platform user; owns items and bookings                         | `role` ("student"/"admin"), `email` (unique)  |
| `Item`         | Rental listing; belongs to a User                              | `status` ("active"/"inactive"), `price`       |
| `Availability` | Day-of-week schedule for an Item                               | `dayOfWeek` ("Monday"…"Sunday")              |
| `Booking`      | Borrow request linking a borrower to an Item on a specific date| `status` ("pending"/"accepted"/"rejected")   |
| `Notification` | In-app message for a User                                      | `isRead`, `message`                          |

**Key Relationships**:
```
User ──1:N──▶ Item ──1:N──▶ Availability
                │
                └──1:N──▶ Booking ◀──N:1── User (borrower)
User ──1:N──▶ Notification
```

**Design Decisions**:
- `Booking.date` is stored as a `String` ("YYYY-MM-DD"), not a `DateTime`. This avoids timezone conversion issues when the platform operates in a single-campus context where calendar dates matter more than exact timestamps.
- `Availability` uses a compound unique constraint `[itemId, dayOfWeek]` to prevent duplicate day entries.
- All cascading deletes (`onDelete: Cascade`) ensure orphan cleanup when a user or item is removed.

---

### 2.2 `src/lib/` — Core Libraries

#### `auth.ts` — Authentication Configuration

**Why JWT strategy over Database strategy**: The `"jwt"` session strategy is critical because Next.js middleware (`middleware.ts`) needs to read the user's role from `req.nextauth.token` to enforce RBAC. The `"database"` strategy does not populate this token in middleware, making role checks impossible at the edge. This was a deliberate architectural choice to enable efficient admin route protection without a database roundtrip on every request.

**Domain Restriction**: The `signIn` callback restricts logins to emails matching `ALLOWED_DOMAIN` (defaults to `@yourcollege.edu`). This ensures only campus members can access the platform. The check happens server-side before any user record is created.

**Role Propagation**: The `jwt` callback attaches `user.role` to the token on initial sign-in. It includes a fallback DB lookup (`!token.role && token.id`) for edge cases where the token might lose its role claim (e.g., manual token invalidation). The `!token.role` guard ensures this DB hit doesn't happen on every request — only when the role is genuinely missing.

#### `db.ts` — Database Connection

Implements the **singleton pattern** for PrismaClient to prevent the "10 PrismaClient instances" warning during Next.js hot-reloads in development. In production, `globalThis.prisma` is not set, so each cold start creates exactly one client.

#### `utils.ts` — Utility Functions

Exports `cn()` — a composition of `clsx` (conditional class names) and `tailwind-merge` (deduplication of conflicting Tailwind classes). Used throughout all UI components.

---

### 2.3 `src/middleware.ts` — Route Protection

The middleware intercepts requests matching three route patterns:
- `/dashboard/:path*` — requires authentication (any role)
- `/admin/:path*` — requires authentication **and** `role === "admin"`
- `/post-item` — requires authentication (any role)

**How it works**: `withAuth` from `next-auth/middleware` wraps the middleware function. The `authorized` callback checks for a valid JWT token (basic auth gate). Inside the middleware body, an additional check on `token.role` implements RBAC for admin routes, redirecting non-admins to `/`.

**Why middleware over server-side checks**: Middleware runs at the edge before the page handler executes, providing faster unauthorized redirects and preventing any server component code from running for unauthenticated users. API routes still perform their own auth checks as a defense-in-depth measure.

---

### 2.4 `src/app/api/` — API Routes

See the companion [API Reference](./API_REFERENCE.md) for full endpoint documentation. Summary:

| Route Group     | Methods         | Auth Required | Description                          |
|-----------------|-----------------|---------------|--------------------------------------|
| `/api/auth/*`   | GET, POST       | No            | NextAuth handler (sign-in, sign-out) |
| `/api/items`    | GET, POST, PUT, DELETE | Varies  | Item CRUD operations                 |
| `/api/items/[id]`| GET, PATCH, DELETE | Varies     | Single-item operations               |
| `/api/bookings` | GET, POST       | Yes           | Create/list booking requests         |
| `/api/bookings/[id]` | PATCH      | Yes (owner)   | Accept/reject bookings               |
| `/api/notifications` | GET        | Yes           | Fetch user notifications             |

**Authorization Pattern**: Every protected API route follows the same pattern:
```typescript
const session = await getServerSession(authOptions);
if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
}
```
For owner-only operations, an additional ownership check compares `item.ownerId` against `session.user.id`.

---

### 2.5 `src/app/` — Pages (Server & Client Components)

| Page                        | Type    | Purpose                                                    |
|-----------------------------|---------|------------------------------------------------------------|
| `page.tsx` (Home)           | Server  | Fetches active items from DB; renders searchable grid      |
| `search/page.tsx`           | Client  | Full-screen search UI; redirects to Home with query param  |
| `post-item/page.tsx`        | Server  | Wrapper for AddItemForm; protected by middleware           |
| `items/[id]/page.tsx`       | Server  | Item detail view; owner sees Edit, others see Book button  |
| `items/[id]/edit/page.tsx`  | Server  | Edit form pre-populated from DB; ownership-guarded         |
| `dashboard/bookings/page.tsx` | Client | Tabbed view (outgoing/incoming requests); optimistic UI   |
| `dashboard/profile/page.tsx`  | Server | User info, listings, and booking history                  |
| `admin/dashboard/page.tsx`  | Server  | Platform stats (users/items/bookings); admin-only          |
| `layout.tsx`                | Server  | Root layout: HTML shell, fonts, Providers, Header, BottomNav|
| `loading.tsx`               | Server  | Skeleton shimmer matching Home layout for route transitions|

**Server vs Client Component Decision**:
- **Server Components** are used when the page needs direct DB access or has no interactive state (Home, Profile, Admin, Item Details).
- **Client Components** are used when the page needs `useState`, `useEffect`, or browser APIs (Search, Bookings dashboard, Header, BottomNav).

---

### 2.6 `src/components/` — Reusable Components

#### Auth Components

| Component        | Type   | Purpose                                                      |
|------------------|--------|--------------------------------------------------------------|
| `Providers.tsx`  | Client | Wraps app in `SessionProvider` for client-side `useSession`  |
| `LoginButton.tsx`| Client | Tri-state button: Loading → Sign In → Sign Out               |
| `SignOutButton.tsx`| Client| Destructive sign-out with redirect to `/`                   |

#### Item Components

| Component                | Type   | Purpose                                                      |
|--------------------------|--------|--------------------------------------------------------------|
| `ItemCard.tsx`           | Server | Card displaying item summary (title, price, owner, days)     |
| `AddItemForm.tsx`        | Client | Zod-validated form for create/edit; manages availability days |
| `BookingRequestButton.tsx`| Client| Date picker in popover; validates against item availability  |
| `EditItemActions.tsx`    | Client | Edit navigation + delete with confirmation dialog            |

#### Layout Components

| Component        | Type   | Purpose                                                      |
|------------------|--------|--------------------------------------------------------------|
| `Header.tsx`     | Client | Sticky top nav; session-aware (avatar/bell vs Sign In)       |
| `BottomNav.tsx`  | Client | Fixed bottom nav for mobile; highlights active route         |

#### UI Primitives (`ui/`)

Standard shadcn/ui components built on Radix UI and CVA (class-variance-authority):
- **`button.tsx`** — 6 variants (default, destructive, outline, secondary, ghost, link) × 4 sizes
- **`card.tsx`** — Composable Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter
- **`badge.tsx`** — 4 variants for status indicators
- **`popover.tsx`** — Radix-based popover used by BookingRequestButton

---

### 2.7 `src/types/next-auth.d.ts` — Type Augmentation

Extends NextAuth's default `Session` and `JWT` types with `id` and `role` fields. This enables strict TypeScript checking when accessing `session.user.role` or `token.role` throughout the application, preventing runtime errors from accessing undefined properties.

---

## 3. Class & Function Reference

### Core Functions

| Function / Export         | File                      | Purpose                                                        |
|---------------------------|---------------------------|----------------------------------------------------------------|
| `authOptions`             | `lib/auth.ts`             | NextAuth configuration object (providers, callbacks, strategy) |
| `db` (default export)     | `lib/db.ts`               | Singleton PrismaClient instance                                |
| `cn(...inputs)`           | `lib/utils.ts`            | Merges Tailwind class names with conflict resolution           |
| `prismaClientSingleton()` | `lib/db.ts`               | Factory function for PrismaClient (internal)                   |

### Auth Callbacks

| Callback     | File           | Logic                                                            |
|--------------|----------------|------------------------------------------------------------------|
| `signIn`     | `lib/auth.ts`  | Domain-gate: rejects emails not ending with `ALLOWED_DOMAIN`     |
| `jwt`        | `lib/auth.ts`  | Attaches `id` and `role` to JWT; lazy DB fallback for missing role|
| `session`    | `lib/auth.ts`  | Exposes `id` and `role` on the client-side session object        |

### API Route Handlers

| Handler   | File                            | Auth  | Ownership | Side Effects           |
|-----------|---------------------------------|-------|-----------|------------------------|
| `POST`    | `api/items/route.ts`            | Yes   | —         | Creates Item + Availability |
| `GET`     | `api/items/route.ts`            | No    | —         | —                      |
| `PUT`     | `api/items/route.ts`            | Yes   | Yes       | Transaction: update + replace availability |
| `DELETE`  | `api/items/route.ts`            | Yes   | Yes       | Cascading delete       |
| `GET`     | `api/items/[id]/route.ts`       | No    | —         | —                      |
| `PATCH`   | `api/items/[id]/route.ts`       | Yes   | Yes       | Optional availability replace |
| `DELETE`  | `api/items/[id]/route.ts`       | Yes   | Yes       | Cascading delete       |
| `POST`    | `api/bookings/route.ts`         | Yes   | —         | Creates Booking + Notification |
| `GET`     | `api/bookings/route.ts`         | Yes   | —         | —                      |
| `PATCH`   | `api/bookings/[id]/route.ts`    | Yes   | Yes¹      | Creates Notification   |

¹ PATCH on bookings checks ownership of the **item** associated with the booking, not the booking itself.

### Component Functions

| Function             | Component                    | Purpose                                                |
|----------------------|------------------------------|--------------------------------------------------------|
| `isDateDisabled()`   | `BookingRequestButton.tsx`   | Checks if date is in the past or not in available days |
| `handleBooking()`    | `BookingRequestButton.tsx`   | Sends POST to `/api/bookings` with selected date       |
| `onSubmit()`         | `AddItemForm.tsx`            | Sends POST or PUT to `/api/items` based on edit mode   |
| `toggleDay()`        | `AddItemForm.tsx`            | Toggles day selection in availability array            |
| `handleDelete()`     | `EditItemActions.tsx`        | Sends DELETE to `/api/items?id=...` with confirmation  |
| `fetchBookings()`    | `BookingsPage`               | Fetches bookings from API based on active tab          |
| `handleAction()`     | `BookingsPage`               | PATCH booking status with optimistic UI update         |

---

## 4. Data Flow Explanation

### 4.1 Authentication Flow

```
User clicks "Sign In"
    │
    ▼
LoginButton calls signIn() ──▶ NextAuth /api/auth/signin
    │
    ▼
Google OAuth consent screen
    │
    ▼
Google returns profile + tokens
    │
    ▼
signIn callback: email.endsWith(ALLOWED_DOMAIN)?
    ├── No  ──▶ Rejected (login denied)
    └── Yes ──▶ PrismaAdapter creates/updates User, Account records
                    │
                    ▼
              jwt callback: token.id = user.id, token.role = user.role
                    │
                    ▼
              session callback: session.user.id/role = token.id/role
                    │
                    ▼
              Client receives session ──▶ Header shows avatar & bell
```

### 4.2 Booking Lifecycle

```
Borrower views Item Detail page
    │
    ▼
BookingRequestButton: select date, validate availability
    │
    ▼
POST /api/bookings { itemId, date: "YYYY-MM-DD" }
    │
    ▼
Server validates:
    ├── Is user authenticated?
    ├── Does item exist?
    ├── Is user NOT the owner? (can't book own item)
    ├── Is the day-of-week in item availability?
    └── Is there no existing pending/accepted booking for that date?
    │
    ▼
Creates Booking (status: "pending")
Creates Notification for item owner
    │
    ▼
Owner sees "Incoming Requests" tab in /dashboard/bookings
    │
    ▼
Owner clicks Accept or Reject
    │
    ▼
PATCH /api/bookings/{id} { status: "accepted" | "rejected" }
    │
    ▼
Server validates ownership (item.ownerId === session.user.id)
Updates Booking status
Creates Notification for borrower
    │
    ▼
Borrower sees updated status in "My Requests" tab
```

### 4.3 Item CRUD Flow

```
POST (Create):
  AddItemForm ──POST /api/items──▶ Create Item + Availability records

PUT (Update):
  AddItemForm (with initialData) ──PUT /api/items──▶ Transaction:
      1. Update Item fields
      2. Delete all existing Availability for item
      3. Create new Availability records

PATCH (Partial Update via [id]):
  /api/items/[id] ──▶ Update Item; optionally deleteMany + create Availability

DELETE:
  EditItemActions ──DELETE /api/items?id=...──▶ Cascade deletes
  (Availability, Bookings all removed via Prisma cascade)
```

### 4.4 Search Flow

```
Homepage (Server Component):
  URL: /?query=calculator
    │
    ▼
  getItems(query) ──▶ Prisma.findMany({
      where: {
          status: "active",
          OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } }
          ]
      }
  })
    │
    ▼
  Renders ItemCard grid (server-rendered HTML)

Search Page (Client Component):
  User types query ──▶ Form submits ──▶ router.push(`/?query=...`)
  ──▶ Next.js navigates to Home with query param (triggers server re-render)
```

---

## 5. Error Handling Strategy

### API Routes — Layered Defense

Every API route handler follows a **consistent three-layer pattern**:

```
Layer 1: Authentication check
    └── Returns 401 "Unauthorized" if no session

Layer 2: Input validation & business rules
    ├── Returns 400 for missing/invalid fields
    ├── Returns 404 if resource not found
    ├── Returns 403 if not the resource owner
    └── Returns 409 for conflict (e.g., double booking)

Layer 3: Catch-all try/catch
    └── Returns 500 "Internal Server Error"
    └── Logs error with tagged prefix (e.g., "[BOOKING_POST]")
```

**Error Logging Convention**: All `console.error` calls use a bracketed tag like `[ITEMS_POST]`, `[BOOKING_PATCH]`. This makes it trivial to grep server logs for errors from specific endpoints.

### Client Components — User Feedback

- **`alert()`** is used for error messages (booking failures, delete failures). This is a conscious trade-off: simple and universally supported, but not ideal for production UX.
- **`confirm()`** is used for destructive actions (delete item, accept/reject booking) to prevent accidental operations.
- **Optimistic UI**: The Bookings dashboard updates local state immediately on accept/reject, providing instant feedback. If the API call fails, it shows an alert but does **not** revert the optimistic update — a known UX limitation.

### Server Components — Graceful Degradation

- Homepage `getItems()` catches all errors and returns an empty array, ensuring the page always renders (with a "No items found" message) rather than throwing a 500.
- Item detail page uses `notFound()` from Next.js, which renders the nearest `not-found.tsx` boundary.
- Edit page uses `redirect()` for unauthorized access, silently steering users away.

---

## 6. Performance Notes

### Database

- **PrismaClient Singleton** (`db.ts`): Prevents connection pool exhaustion during development hot-reloads. A single client instance is reused across all requests within a process.
- **Selective Includes**: All Prisma queries use `select` and `include` to fetch only necessary relations. Owner data is consistently limited to `{ name, image }` to avoid over-fetching.
- **Transaction for PUT**: Item updates use `db.$transaction()` to atomically replace availability records, preventing inconsistent state if the process crashes mid-update.

### Rendering

- **Server Components by Default**: The Homepage, Item Detail, Profile, and Admin pages are all Server Components, meaning zero client-side JavaScript is shipped for their rendering logic. Only interactive islands (forms, buttons) are client components.
- **Streaming with Loading Skeleton**: `loading.tsx` provides an instant skeleton UI during route transitions, leveraging Next.js streaming to show content progressively.
- **Sticky Search Header**: Uses `backdrop-blur-sm` with `bg-muted/30` for a performant glassmorphism effect that's GPU-accelerated.

### Bundle Size

- **Lucide Icons**: Tree-shakeable — only the specific icons used are bundled (`Search`, `PlusCircle`, `Bell`, etc.).
- **shadcn/ui**: Components are copied into the project (not imported from a package), so they're fully tree-shaken and customizable.
- **date-fns**: Used for date formatting only (`format` function), keeping the import surface minimal.

### Mobile Optimization

- **Viewport Configuration**: `maximumScale: 1` and `userScalable: false` prevent zoom on mobile, creating a native-app feel.
- **Safe Area Insets**: `.pb-safe` CSS class uses `env(safe-area-inset-bottom)` for iPhone notch compatibility.
- **Bottom Navigation**: Fixed positioning with `-mt-6` "Post" button creates a prominent FAB (floating action button) pattern.

---

## 7. Known Limitations

### Data Layer

| Limitation | Impact | Mitigation Path |
|------------|--------|-----------------|
| **SQLite in production** | No concurrent writes; file-based DB not suitable for multi-instance deployments | Migrate to PostgreSQL by changing `datasource.provider` in schema.prisma |
| **No pagination** | All active items loaded at once on homepage | Add cursor-based pagination with `take`/`skip` or `cursor` in Prisma queries |
| **String-based dates** | `Booking.date` is a string, not a DateTime; no native date range queries | Migrate to `DateTime` field with proper timezone handling |
| **No image storage** | Items have no image field; only user avatars from Google | Add image upload via S3/Cloudinary with URL storage in Item model |

### Authentication & Security

| Limitation | Impact | Mitigation Path |
|------------|--------|-----------------|
| **No API rate limiting** | Endpoints vulnerable to abuse/DDoS | Add rate limiting middleware (e.g., `upstash/ratelimit`) |
| **No CSRF protection on API routes** | API routes rely on session cookies only | Add CSRF tokens or use `SameSite=Strict` cookies |
| **Domain restriction is env-configurable** | Misconfigured `ALLOWED_DOMAIN` could open access | Add startup validation for the domain value |
| **Alert-based auth prompts** | `alert("Please sign in")` is poor UX | Replace with toast notifications or redirect to sign-in |

### UX & Features

| Limitation | Impact | Mitigation Path |
|------------|--------|-----------------|
| **No real-time notifications** | Users must refresh to see new notifications | Add WebSocket/SSE or polling with SWR |
| **Optimistic UI without rollback** | Failed booking actions leave stale UI state | Add `onError` rollback in `handleAction()` |
| **`confirm()` / `alert()` dialogs** | Browser-native dialogs; not customizable | Replace with shadcn/ui `AlertDialog` component |
| **Notification bell has no route** | Bell icon in Header is decorative; clicking does nothing | Add notification dropdown or `/dashboard/notifications` page |
| **No cancellation flow** | Borrowers cannot cancel their own pending bookings | Add DELETE endpoint for bookings (borrower-only) |
| **Search is title/description only** | No category, price range, or availability filters | Extend search with faceted filters |
| **Hard-coded categories** | Search page has static category list | Move to DB-backed categories or tags |

### Infrastructure

| Limitation | Impact | Mitigation Path |
|------------|--------|-----------------|
| **No CI/CD pipeline** | Manual build/deploy | Add GitHub Actions for lint, build, test on push |
| **No error monitoring** | Server errors only in `console.error` | Integrate Sentry or similar APM |
| **No logging framework** | All logging via `console.*` | Add structured logging (e.g., Pino) |
| **E2E tests are scaffolded only** | `example.spec.ts` tests Playwright.dev, not the app | Write app-specific E2E test suites |

---

## Appendix: Environment Variables

| Variable             | Required | Default              | Purpose                              |
|----------------------|----------|----------------------|--------------------------------------|
| `GOOGLE_CLIENT_ID`   | Yes      | —                    | Google OAuth client ID               |
| `GOOGLE_CLIENT_SECRET`| Yes     | —                    | Google OAuth client secret           |
| `ALLOWED_DOMAIN`     | No       | `@yourcollege.edu`   | Email domain restriction for sign-in |
| `NEXTAUTH_SECRET`    | Yes      | —                    | JWT signing secret                   |
| `NEXTAUTH_URL`       | Yes      | —                    | Canonical URL of the application     |
| `DATABASE_URL`       | No       | `file:./dev.db`      | Prisma database connection string    |
