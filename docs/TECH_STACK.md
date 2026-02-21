# CampusShare — Technology Stack

## Overview

CampusShare is a full-stack Next.js application serving as a campus rental and lending marketplace with a virtual coin economy.

---

## Frontend

| Technology | Version | Purpose | Key Features Dependent |
|---|---|---|---|
| **React** | 19.2.3 | UI framework | All components, pages |
| **Next.js** | 16.1.6 | Full-stack React framework | App Router, API Routes, SSR, image optimization |
| **TypeScript** | 5.x | Type safety | Entire codebase |
| **Tailwind CSS** | 3.4.1 | Utility-first styling | All UI styling |
| **shadcn/ui** | (components) | Pre-built accessible components | Button, Card, Dialog, Input, Toast, Badge, Table, Popover, Separator, Label, Textarea |
| **Radix UI** | Various | Headless UI primitives | Popover, Slot, Toast, Icons |
| **Lucide React** | 0.563.0 | Icon library | All icons throughout the app |
| **class-variance-authority** | 0.7.1 | Component variant management | shadcn/ui Button, Badge variants |
| **clsx** | 2.1.1 | Conditional class names | `cn()` utility |
| **tailwind-merge** | 3.4.0 | Tailwind class deduplication | `cn()` utility |
| **tailwind-animate** | 0.2.10 | Animation utilities | Accordion animations |
| **date-fns** | 4.1.0 | Date formatting/manipulation | Booking date display, relative time |

---

## Backend Logic

| Technology | Version | Purpose | Key Features Dependent |
|---|---|---|---|
| **Next.js API Routes** | 16.1.6 | REST API handlers | All `src/app/api/` endpoints |
| **NextAuth.js** | 4.24.13 | Authentication framework | Google OAuth, JWT sessions, RBAC |
| **@auth/prisma-adapter** | 2.11.1 | NextAuth ↔ Prisma bridge | User/Account/Session persistence |
| **Prisma Client** | 5.10.2 | Database ORM | All database operations |
| **Zod** | 4.3.6 | Schema validation | Form validation (with react-hook-form) |
| **react-hook-form** | 7.71.1 | Form state management | AddItemForm, EditProfileDialog |
| **@hookform/resolvers** | 5.2.2 | Zod ↔ react-hook-form bridge | Form validation integration |
| **Cloudinary (SDK)** | 2.9.0 | Image upload signing | Server-side Cloudinary signature |
| **next-cloudinary** | 6.17.5 | Cloudinary upload widget | Client-side image uploads |

---

## Database

| Technology | Version | Purpose |
|---|---|---|
| **PostgreSQL** | 15+ | Relational database |
| **Supabase** | Cloud | Hosted PostgreSQL with PgBouncer |
| **Prisma** | 5.10.2 | ORM & schema management |

---

## Styling

| Technology | Purpose |
|---|---|
| **Tailwind CSS** | Utility-first CSS framework |
| **CSS Variables** | Design tokens (colors, border-radius) via HSL format |
| **shadcn/ui design system** | Semantic color tokens: `primary`, `secondary`, `destructive`, `muted`, `accent`, `popover`, `card` |
| **Inter font** | Google Font loaded via `next/font/google` |
| **PostCSS** | Build-time CSS processing |
| **Autoprefixer** | Vendor prefix automation |

---

## Authentication

| Technology | Purpose |
|---|---|
| **NextAuth.js v4** | Authentication framework |
| **Google OAuth 2.0** | Identity provider |
| **JWT** | Session token strategy (30-day expiry) |
| **PrismaAdapter** | Persistent user/account storage |
| **next-auth/middleware** | Route protection |

---

## Dev Tooling

| Tool | Version | Purpose |
|---|---|---|
| **TypeScript** | 5.x | Static type checking |
| **ESLint** | 10.x | Code linting |
| **eslint-config-next** | 0.2.4 | Next.js ESLint rules |
| **Playwright** | 1.58.2 | End-to-end testing |
| **Prisma Studio** | (bundled) | Database GUI (`npx prisma studio`) |
| **Prisma CLI** | 5.10.2 | Schema management, migrations |

---

## External Services

| Service | Purpose | Environment Variables |
|---|---|---|
| **Google Cloud Console** | OAuth 2.0 authentication | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **Supabase** | Hosted PostgreSQL database | `DATABASE_URL`, `DIRECT_URL` |
| **Cloudinary** | Image upload, storage, CDN | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_*` |

---

## Dependency Analysis

### Production Dependencies (24)

| Package | Why Used | Feature Dependency |
|---|---|---|
| `next` | Core framework | Everything |
| `react` / `react-dom` | UI rendering | Everything |
| `next-auth` | Auth | Sign-in, sign-out, session, RBAC |
| `@auth/prisma-adapter` | Auth persistence | User registration, session management |
| `@prisma/client` | DB queries | All data operations |
| `cloudinary` | Server signing | Image upload authentication |
| `next-cloudinary` | Client uploads | Image upload widget in forms |
| `zod` | Validation | Form input validation |
| `react-hook-form` | Forms | AddItemForm, EditProfileDialog |
| `@hookform/resolvers` | Form-Zod bridge | Form validation |
| `date-fns` | Dates | Date display, booking calculations |
| `lucide-react` | Icons | All UI icons |
| `@radix-ui/react-icons` | Radix icons | Supplementary icons |
| `@radix-ui/react-popover` | Popover component | Notification dropdown |
| `@radix-ui/react-slot` | Slot primitive | shadcn/ui Button |
| `@radix-ui/react-toast` | Toast primitive | Toast notifications |
| `class-variance-authority` | Variants | Component variant system |
| `clsx` | Classes | Conditional class merging |
| `tailwind-merge` | Classes | Tailwind class dedup |
| `tailwindcss` | Styling | All CSS |
| `tailwind-animate` | Animations | Accordion, transitions |
| `autoprefixer` | CSS | Vendor prefixes |
| `postcss` | CSS | Build pipeline |

### Dev Dependencies (6)

| Package | Why Used |
|---|---|
| `prisma` | CLI for schema management |
| `typescript` | Type checking |
| `@types/node` | Node.js type definitions |
| `@types/react` / `@types/react-dom` | React type definitions |
| `eslint` / `eslint-config-next` | Linting |
| `@playwright/test` | E2E testing |

---

## NOT Used

| Technology | Status |
|---|---|
| Redux / Zustand / MobX | Not used — no global state management |
| React Query / SWR | Not used — manual `useEffect` + `fetch` |
| tRPC | Not used — REST API routes |
| GraphQL | Not used — REST only |
| Styled Components / Emotion | Not used — Tailwind CSS |
| Jest / Vitest | Not used — only Playwright for E2E |
| Docker | Not configured |
| CI/CD | Not configured |
| Storybook | Not used |
| i18n | Not used — English only |
| PWA | Not configured |
| WebSockets | Not used — polling for notifications |
