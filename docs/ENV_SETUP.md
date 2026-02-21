# CampusShare — Environment Setup

## Prerequisites

| Software | Minimum Version | Purpose |
|---|---|---|
| Node.js | 18.17+ (20.x recommended) | Runtime |
| npm | 9+ | Package manager |
| Git | 2.x | Version control |
| PostgreSQL | 15+ | Database (or use Supabase) |

---

## Environment Variables

> **File:** `.env` (root of project — NOT committed to git)

| Variable | Required | Purpose | Used In |
|---|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection (pooled via PgBouncer) | `prisma/schema.prisma`, all API routes via `db.ts` |
| `DIRECT_URL` | ✅ | Direct PostgreSQL connection (for migrations) | `prisma/schema.prisma` |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID | `src/lib/auth.ts` |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret | `src/lib/auth.ts` |
| `NEXTAUTH_SECRET` | ✅ | JWT signing secret | NextAuth internals |
| `NEXTAUTH_URL` | ✅ | Base URL of the application | NextAuth internals, cookie settings |
| `ALLOWED_DOMAIN` | ❌ | Email domain restriction (currently unused) | `src/lib/auth.ts` (logic removed) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary account cloud name | `src/app/api/sign-cloudinary/route.ts` |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key | Server-side signing |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret | `src/app/api/sign-cloudinary/route.ts` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name (client-side) | `next-cloudinary` widget |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | ✅ | Cloudinary API key (client-side) | `next-cloudinary` widget |

### Example `.env`
```env
DATABASE_URL="postgresql://user:password@host:6543/dbname?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/dbname"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-client-secret"
NEXTAUTH_SECRET="generate-a-secure-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
ALLOWED_DOMAIN="@yourcollege.edu"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your-api-key"
```

> ⚠️ **Security:** The actual `.env` file in the repository contains real credentials. Rotate all secrets before production deployment.

---

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/KollaUpendra/campusshare.git
cd campusshare
```

### 2. Install Dependencies
```bash
npm install
```
> This automatically runs `prisma generate` via the `postinstall` script.

### 3. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Set Up Database

**Option A: Use Supabase (recommended)**
1. Create a Supabase project at https://supabase.com
2. Get the connection strings from Dashboard → Settings → Database
3. Set `DATABASE_URL` (pooled, port 6543) and `DIRECT_URL` (direct, port 5432)

**Option B: Local PostgreSQL**
```bash
createdb campusshare
# Set DATABASE_URL and DIRECT_URL in .env pointing to localhost
```

### 5. Run Migrations
```bash
npx prisma db push
```
> This syncs the Prisma schema with the database without creating migration files.

### 6. (Optional) Seed Database
```bash
npx tsx prisma/seed.ts
```

### 7. Start Development Server
```bash
npm run dev
```
> App runs at http://localhost:3000

### 8. Set Up Google OAuth
1. Go to https://console.cloud.google.com
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

### 9. Set Up Cloudinary
1. Create account at https://cloudinary.com
2. Get Cloud Name, API Key, API Secret from Dashboard
3. Set values in `.env` (both server and `NEXT_PUBLIC_` client variables)

---

## Build & Run Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Production build (`prisma generate && next build`) |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma db push` | Sync schema to database |
| `npx prisma generate` | Regenerate Prisma client |

---

## Configuration Files

| File | Purpose |
|---|---|
| `next.config.mjs` | Next.js config (image remotePatterns, devIndicators) |
| `tsconfig.json` | TypeScript config (strict, ES2017, path aliases) |
| `tailwind.config.js` | Tailwind CSS config (shadcn-ui design tokens) |
| `postcss.config.js` | PostCSS (Tailwind + Autoprefixer) |
| `eslint.config.mjs` | ESLint v10 flat config with `eslint-config-next` |
| `components.json` | shadcn/ui component configuration |
| `playwright.config.ts` | Playwright E2E test configuration |
| `prisma/schema.prisma` | Database schema |

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `PrismaClientInitializationError` | Run `npx prisma generate` and restart dev server |
| Google sign-in redirect loop | Verify `NEXTAUTH_URL` matches your dev URL exactly |
| Image upload fails | Check all 5 Cloudinary env variables are set |
| "Unknown field" Prisma errors | Run `npx prisma db push` then `npx prisma generate` |
| Port 3000 in use | Use `npm run dev -- -p 3001` |
