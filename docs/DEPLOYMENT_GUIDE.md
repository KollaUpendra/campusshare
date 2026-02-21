# CampusShare — Deployment Guide

## Deployment Options Overview

| Option | Recommended | Effort | Notes |
|---|---|---|---|
| **Vercel** | ✅ Yes | Low | Native Next.js platform, zero-config |
| **Node.js (VPS)** | ⚠️ Possible | Medium | Requires pm2 or systemd |
| **Docker** | ⚠️ Possible | Medium | No Dockerfile exists (must create) |
| **Static Export** | ❌ No | N/A | App uses server-side features (API routes, auth) |

---

## Option 1: Vercel (Recommended)

### Steps

1. **Push to GitHub** (if not already)
2. **Import project** at https://vercel.com/new
3. **Set Environment Variables** in Vercel Dashboard → Settings → Environment Variables:
   - All 12 variables from `.env` (see `ENV_SETUP.md`)
   - Set `NEXTAUTH_URL` to your production domain (e.g., `https://campusshare.vercel.app`)
4. **Deploy** — Vercel auto-detects Next.js and runs `npm run build`

### Vercel Configuration Notes

| Setting | Value |
|---|---|
| Framework Preset | Next.js (auto-detected) |
| Build Command | `prisma generate && next build` (from `package.json`) |
| Output Directory | `.next` (default) |
| Node.js Version | 20.x |
| Install Command | `npm install` (runs `postinstall` → `prisma generate`) |

### Google OAuth Redirect URI
Add production callback:
```
https://your-domain.vercel.app/api/auth/callback/google
```

### Post-Deploy Checklist
- [ ] Set `NEXTAUTH_URL` to production URL
- [ ] Add production callback URL to Google Cloud Console
- [ ] Verify Cloudinary upload works
- [ ] Rotate `NEXTAUTH_SECRET` from development value
- [ ] Test sign-in flow end-to-end

---

## Option 2: Node.js on VPS

### Requirements
- Node.js 20.x
- npm 9+
- PostgreSQL 15+ (or Supabase remote)
- Reverse proxy (nginx)
- Process manager (pm2)

### Steps

```bash
# 1. Clone and install
git clone <repo-url> /opt/campusshare
cd /opt/campusshare
npm ci --production

# 2. Set environment variables
cp .env.example .env
nano .env   # Set all production values

# 3. Build
npm run build

# 4. Start with pm2
npm install -g pm2
pm2 start npm --name campusshare -- start
pm2 save
pm2 startup
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name campusshare.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Option 3: Docker

> **No Dockerfile exists in the repository.** Below is a recommended Dockerfile.

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

> **Note:** To use standalone output, add `output: 'standalone'` to `next.config.mjs`.

---

## Required External Services

| Service | Purpose | Required |
|---|---|---|
| **Supabase / PostgreSQL** | Database | ✅ |
| **Google Cloud Console** | OAuth sign-in | ✅ |
| **Cloudinary** | Image storage & CDN | ✅ |

---

## Database Migrations

The project uses `prisma db push` (schema-push) rather than migration files:

```bash
# Sync schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

> ⚠️ For production, consider switching to `prisma migrate deploy` with proper migration files.

---

## Infrastructure Diagram

```
┌──────────┐      ┌──────────┐      ┌────────────────┐
│ Browser  │─────►│ CDN/Edge │─────►│  Next.js App   │
│ (Client) │◄─────│ (Vercel) │◄─────│  (Node.js)     │
└──────────┘      └──────────┘      └───────┬────────┘
                                            │
                          ┌─────────────────┤
                          │                 │
                          ▼                 ▼
                  ┌──────────────┐  ┌──────────────┐
                  │  PostgreSQL  │  │  Cloudinary   │
                  │  (Supabase)  │  │  (Images CDN) │
                  └──────────────┘  └──────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  Google OAuth│
                  │  (Identity)  │
                  └──────────────┘
```

---

## CI/CD

**Status:** Not Found in Codebase

No CI/CD pipeline configuration files (`.github/workflows/`, `vercel.json`, `Dockerfile`, `.gitlab-ci.yml`) were found.

### Recommended CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npx playwright test
      # Vercel auto-deploys from GitHub integration
```
