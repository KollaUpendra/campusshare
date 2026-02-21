# CampusShare — System Architecture

## 1. Framework Overview

| Property | Value |
|---|---|
| **Framework** | Next.js 16.1.6 |
| **React** | 19.2.3 |
| **Router** | App Router (`src/app/`) |
| **Pages Router** | Not used |
| **Hybrid Routing** | No — App Router only |
| **Language** | TypeScript 5.x (strict mode) |
| **Module Resolution** | Bundler (`tsconfig.json`) |
| **Path Alias** | `@/*` → `./src/*` |

---

## 2. Rendering Strategy

| Strategy | Usage |
|---|---|
| **Server Components (RSC)** | Default for all pages under `src/app/`. Pages like `dashboard/page.tsx`, `admin/*`, `profile/*` are server-rendered. |
| **Client Components** | Marked with `"use client"` — all interactive components (`AddItemForm`, `BookingRequestButton`, `EditProfileDialog`, `AuthGuard`, `PublicGuard`, `AppShell`, `Header`, `BottomNav`, etc.) |
| **Server Actions** | Not used — all mutations go through REST API Route Handlers |
| **SSG (Static Generation)** | Landing page (`/`) — no dynamic data |
| **SSR (Dynamic Rendering)** | Dashboard, profile, admin pages — all fetch data at request time via API calls |
| **ISR** | Not configured (`appIsrStatus: false` in `next.config.mjs`) |
| **CSR** | Client components fetch data via `fetch()` in `useEffect` hooks |
| **Edge Runtime** | Not used |

---

## 3. Middleware

**File:** `src/middleware.ts`

- **Engine:** `next-auth/middleware` (`withAuth` wrapper)
- **Strategy:** JWT-based route protection
- **Protected Paths:** `/dashboard/:path*`, `/admin/:path*`, `/post-item`, `/app/:path*`
- **RBAC:** Admin routes (`/admin/*`) require `token.role === "admin"`
- **Redirect:** Non-admins accessing `/admin` → redirected to `/`
- **Auth Bypass:** `/api/auth/*` routes always allowed (prevents redirect loops)
- **Sign-in Page:** `/` (landing page)

---

## 4. Authentication Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Browser    │────►│  Google OAuth 2.0 │────►│  NextAuth.js │
│  (SignIn)    │     │  (Provider)       │     │  (v4.24.13)  │
└──────────────┘     └──────────────────┘     └──────┬───────┘
                                                      │
                                              ┌───────▼───────┐
                                              │ PrismaAdapter  │
                                              │ (Account/User) │
                                              └───────┬───────┘
                                                      │
                                              ┌───────▼───────┐
                                              │  PostgreSQL    │
                                              │  (Supabase)    │
                                              └───────────────┘
```

| Property | Detail |
|---|---|
| **Provider** | Google OAuth 2.0 |
| **Adapter** | `@auth/prisma-adapter` → Prisma/PostgreSQL |
| **Session Strategy** | JWT (30-day expiry) |
| **Token Enrichment** | `jwt` callback fetches `role`, `coins`, `year`, `branch`, `section`, `address`, `phoneNumber` from DB on every token refresh |
| **Domain Restriction** | Removed (was `ALLOWED_DOMAIN=@vnrvjiet.in`) — currently allows any email |
| **Blocked User Check** | `signIn` callback queries DB for `isBlocked` flag |
| **Custom Pages** | Sign-in: `/auth/signin` |

---

## 5. Request Lifecycle

```
Browser Request
    │
    ▼
┌─────────────────────────┐
│  Next.js Middleware       │
│  (src/middleware.ts)      │
│  • JWT token validation   │
│  • RBAC (admin check)     │
│  • Redirect if unauthed   │
└────────────┬──────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌────────┐     ┌──────────────┐
│ Page   │     │  API Route   │
│ (RSC)  │     │  Handler     │
└───┬────┘     └──────┬───────┘
    │                 │
    ▼                 ▼
┌────────────┐  ┌──────────────┐
│ Client     │  │ getServer    │
│ Component  │  │ Session()    │
│ (useEffect │  │ → Auth Check │
│  → fetch)  │  └──────┬───────┘
└────────────┘         │
                       ▼
                ┌──────────────┐
                │ Prisma ORM   │
                │ → PostgreSQL │
                │   (Supabase) │
                └──────────────┘
                       │
                       ▼
                ┌──────────────┐
                │ JSON Response│
                └──────────────┘
```

---

## 6. Component Hierarchy

```
<html>
  <body>
    <DevToolsHider />           ← Hides React DevTools in production
    <Providers>                 ← SessionProvider (NextAuth)
      <ProfileCompletionCheck/> ← Prompts incomplete profiles
      <AppShell>                ← Layout wrapper (conditionally renders Header/BottomNav)
        <Header />              ← Top nav (logo, notifications, user menu)
        <main>{children}</main> ← Page content
        <BottomNav />           ← Mobile bottom navigation
      </AppShell>
      <Toaster />               ← Toast notification system
    </Providers>
  </body>
</html>
```

### Layout Hierarchy

| Path | Layout | Purpose |
|---|---|---|
| `/` | Root `layout.tsx` | Global shell (Providers, AppShell, Toaster) |
| `/admin/*` | `admin/layout.tsx` | Admin navigation sidebar (`AdminNav`) |
| All other routes | Root layout only | No nested layouts |

---

## 7. State Management

| Pattern | Usage |
|---|---|
| **React Context** | NextAuth `SessionProvider` for auth state |
| **Server State** | `useEffect` + `fetch()` pattern in client components |
| **Client State** | React `useState` / `useReducer` in individual components |
| **No Global Store** | No Redux, Zustand, React Query, or SWR detected |
| **Form State** | `react-hook-form` + `zod` for form validation |

---

## 8. API Layer

| Property | Detail |
|---|---|
| **Type** | Next.js App Router Route Handlers (`src/app/api/`) |
| **Protocol** | REST |
| **Format** | JSON |
| **Auth** | `getServerSession(authOptions)` in every handler |
| **ORM** | Prisma Client (singleton via `src/lib/db.ts`) |
| **Transactions** | `db.$transaction()` for atomic multi-table operations |
| **No tRPC** | Not used |
| **No GraphQL** | Not used |
| **External APIs** | Cloudinary (image upload signing) |

---

## 9. Image Optimization

| Property | Detail |
|---|---|
| **Next.js Image** | Used via `next/image` |
| **Remote Patterns** | `lh3.googleusercontent.com` (Google profile pics), `res.cloudinary.com` (uploaded images) |
| **Upload Service** | Cloudinary (`next-cloudinary` v6.17.5) |
| **Signing** | Server-side Cloudinary signature via `/api/sign-cloudinary` |

---

## 10. Infrastructure Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   Browser   │──────►│  Next.js Server  │──────►│  Supabase       │
│   (Client)  │◄──────│  (Node.js)       │◄──────│  PostgreSQL     │
└─────────────┘       └────────┬─────────┘       └─────────────────┘
                               │
                      ┌────────┴────────┐
                      │                 │
                      ▼                 ▼
              ┌──────────────┐  ┌──────────────┐
              │  Google      │  │  Cloudinary   │
              │  OAuth 2.0   │  │  (CDN/Images) │
              └──────────────┘  └──────────────┘
```

---

## 11. Caching Strategy

| Layer | Strategy |
|---|---|
| **ISR** | Disabled (`appIsrStatus: false`) |
| **HTTP Cache** | Not configured (no `Cache-Control` headers set) |
| **Prisma Query Cache** | None (queries hit DB directly) |
| **CDN** | Cloudinary handles image CDN |
| **Lazy Expiration** | `processExpirations()` runs on every `GET /api/items` call to expire stale bookings |

---

## 12. Build Configuration

| Property | Value |
|---|---|
| **Build Command** | `prisma generate && next build` |
| **Dev Command** | `next dev` |
| **Start Command** | `next start` |
| **PostInstall** | `prisma generate` |
| **Output Mode** | Default (`.next/` directory — not standalone) |
| **TypeScript Target** | ES2017 |
| **Strict Mode** | Enabled |
