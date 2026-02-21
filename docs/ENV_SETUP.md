# CampusShare — Environment Setup

> All secrets are loaded from `.env` at the project root. **Never commit `.env` to version control.**

---

## Environment Variables

| Variable | Required | Purpose | Used In |
|---|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection via PgBouncer (port 6543) | `prisma/schema.prisma`, all API routes via `@/lib/db` |
| `DIRECT_URL` | ✅ | Direct PostgreSQL connection (port 5432) for migrations | `prisma/schema.prisma` (Prisma migrate) |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID | `src/lib/auth.ts` |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret | `src/lib/auth.ts` |
| `NEXTAUTH_SECRET` | ✅ | JWT signing secret (must be strong in production) | NextAuth internals |
| `NEXTAUTH_URL` | ✅ | Application base URL (e.g., `http://localhost:3000`) | NextAuth callback URLs, cookie prefix logic |
| `ALLOWED_DOMAIN` | ❌ | Email domain filter (currently unused — open registration) | `src/lib/auth.ts` (referenced but disabled) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name (server-side) | `src/app/api/sign-cloudinary/route.ts` |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key (server-side) | `src/app/api/sign-cloudinary/route.ts` |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret (server-side signing) | `src/app/api/sign-cloudinary/route.ts` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name (client-side) | `src/components/items/AddItemForm.tsx` |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | ✅ | Cloudinary API key (client-side) | `src/components/items/AddItemForm.tsx` |

---

## `.env` Template

```env
# === Database (Supabase PostgreSQL) ===
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres"

# === Google OAuth ===
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-client-secret"

# === NextAuth ===
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# === Email Domain Filter (optional — currently disabled in code) ===
ALLOWED_DOMAIN="@yourcollege.edu"

# === Cloudinary (Server-side) ===
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# === Cloudinary (Client-side — exposed to browser) ===
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your-api-key"
```

---

## Local Development Setup

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** (comes with Node.js)
- **PostgreSQL** database (Supabase recommended, or local PostgreSQL)
- **Google Cloud Console** project with OAuth 2.0 credentials
- **Cloudinary** account

### Step-by-Step

```bash
# 1. Clone the repository
git clone https://github.com/KollaUpendra/campusshare.git
cd campusshare

# 2. Install dependencies
npm install
# This also runs `prisma generate` via the postinstall script

# 3. Create .env file
cp .env.example .env   # Or create manually using the template above

# 4. Set up database
npx prisma db push     # Push schema to database (uses DIRECT_URL)
# OR
npx prisma migrate deploy   # Run migrations if they exist

# 5. (Optional) Seed the database
npx prisma db seed

# 6. Start development server
npm run dev
# App available at http://localhost:3000
```

### Alternative: Using the batch launcher (Windows)

```bash
deploy_local.bat
# Runs npm install + npm run dev automatically
```

### npm Scripts

| Script | Command | Purpose |
|---|---|---|
| `postinstall` | `prisma generate` | Auto-generates Prisma Client after `npm install` |
| `dev` | `next dev` | Start dev server with hot-reload |
| `build` | `prisma generate && next build` | Production build |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run ESLint checks |

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Create **OAuth 2.0 Client ID** (type: Web Application)
5. Set **Authorized redirect URIs:**
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

---

## Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. From the Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
3. Set both server-side and client-side variables in `.env`

---

## Database Setup (Supabase)

1. Create project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **Database**
3. Copy:
   - **Connection string (Pooler):** Use for `DATABASE_URL` (port 6543, append `?pgbouncer=true`)
   - **Connection string (Direct):** Use for `DIRECT_URL` (port 5432)
4. Run `npx prisma db push` to create tables

---

## Prisma Commands Reference

```bash
npx prisma generate        # Generate Prisma Client
npx prisma db push          # Push schema changes to DB
npx prisma db pull          # Pull schema from existing DB
npx prisma migrate dev      # Create and apply migration
npx prisma migrate deploy   # Apply pending migrations
npx prisma studio           # Open visual DB editor (localhost:5555)
npx prisma db seed          # Run seed script
```
