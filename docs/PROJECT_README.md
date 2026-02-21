# CampusShare

A campus-exclusive rental and lending marketplace built with Next.js 16, React 19, PostgreSQL, and Cloudinary.

---

## What is CampusShare?

CampusShare enables students to rent, lend, and sell items to each other using a virtual coin economy. Every user starts with 200 coins and can earn more by listing items for rent or sale. The platform includes admin moderation, complaint handling, service charges, and a deposit/withdrawal system.

---

## Key Features

- **🔐 Google OAuth Authentication** — Campus email sign-in via NextAuth.js
- **📦 Item Marketplace** — List and browse items for rent or sale
- **📅 Booking System** — Date-range booking with availability checks and overlap prevention
- **💰 Coin Economy** — Virtual currency with service charges, fines, deposits, and withdrawals
- **🔄 Return Flow** — Dual-confirmation return process (borrower + owner)
- **📢 Complaints** — File and resolve disputes with admin moderation
- **👮 Admin Panel** — User management, booking rollbacks, fine system, analytics dashboard
- **📸 Image Uploads** — Cloudinary-powered image storage
- **🔔 Notifications** — Real-time action notifications
- **📱 Mobile Responsive** — Bottom navigation + responsive layout

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.1.6 (App Router) |
| **Frontend** | React 19, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Next.js API Routes (REST) |
| **Database** | PostgreSQL (Supabase) via Prisma ORM |
| **Auth** | NextAuth.js v4 (Google OAuth, JWT) |
| **Images** | Cloudinary |
| **Testing** | Playwright (E2E) |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/KollaUpendra/campusshare.git
cd campusshare

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your credentials (see docs/ENV_SETUP.md)

# 4. Push schema to database
npx prisma db push

# 5. Start development server
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
campusshare/
├── prisma/
│   └── schema.prisma         # Database schema (12 models)
├── src/
│   ├── app/
│   │   ├── api/               # REST API routes (30+ endpoints)
│   │   │   ├── auth/          # NextAuth handler
│   │   │   ├── items/         # CRUD for marketplace items
│   │   │   ├── bookings/      # Booking lifecycle (create/accept/reject/pay/status)
│   │   │   ├── admin/         # Admin-only endpoints
│   │   │   ├── complaints/    # Complaint filing
│   │   │   ├── transactions/  # Direct purchase
│   │   │   ├── notifications/ # User notifications
│   │   │   └── user/          # Profile & deposits
│   │   ├── admin/             # Admin panel pages
│   │   ├── dashboard/         # User dashboard & bookings
│   │   ├── profile/           # User profile pages
│   │   ├── auth/              # Sign-in page
│   │   ├── layout.tsx         # Root layout (Providers, AppShell)
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── admin/             # Admin UI components
│   │   ├── auth/              # Auth guards, login button
│   │   ├── items/             # Item card, forms
│   │   ├── layout/            # Header, BottomNav, AppShell
│   │   ├── profile/           # Profile dialogs
│   │   └── ui/                # shadcn/ui primitives
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── profile.ts         # Profile completion check
│   │   ├── scheduler.ts       # Booking expiration logic
│   │   └── utils.ts           # Tailwind merge utility
│   ├── types/
│   │   └── next-auth.d.ts     # Extended session types
│   └── middleware.ts          # Route protection & RBAC
├── tests/                     # Playwright E2E tests
├── docs/                      # Documentation (this folder)
└── public/                    # Static assets
```

---

## Documentation

Comprehensive project documentation is available in the `docs/` directory:

| Document | Content |
|---|---|
| [SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md) | Framework analysis, request flow, rendering strategy |
| [API_REFERENCE.md](docs/API_REFERENCE.md) | All REST endpoints with schemas & examples |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Prisma models, ERD diagram, data flow |
| [ENV_SETUP.md](docs/ENV_SETUP.md) | Environment variables & local setup |
| [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Vercel, VPS, Docker deployment instructions |
| [SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md) | Security analysis & recommendations |
| [TECH_STACK.md](docs/TECH_STACK.md) | Full dependency analysis |
| [USER_GUIDE.md](docs/USER_GUIDE.md) | End-user feature walkthrough |
| [ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) | Admin panel operations manual |

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open database GUI |
| `npx prisma db push` | Sync schema to database |

---

## Architecture Highlights

- **App Router** — All routing via `src/app/` directory
- **JWT Sessions** — 30-day token with role, coins, and profile data
- **Atomic Transactions** — All financial operations use `db.$transaction()`
- **Lazy Expiration** — Booking/item expiry checked on marketplace access
- **RBAC Middleware** — Admin routes protected at middleware level
- **Blocked User Guards** — Mutation APIs check `isBlocked` flag

---

## License

Not Found in Codebase.

---

## Contributors

Not Found in Codebase.
