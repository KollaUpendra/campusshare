# 🧪 TEST SUMMARY — CampusShare Platform

**Generated**: 2026-02-12T18:59:00+05:30  
**Agent**: Local CI/CD Testing Agent  
**Repository**: `campus-share-platform`  

---

## Stack Profile

| Component       | Version / Config         |
|-----------------|--------------------------|
| Framework       | Next.js 16.1.6 (Turbopack) |
| Language        | TypeScript 5             |
| ORM / Database  | Prisma 5.10.2 / SQLite   |
| Styling         | Tailwind CSS 3.4         |
| Authentication  | NextAuth 4.24            |
| E2E Testing     | Playwright 1.58          |
| Linter          | ESLint 9 + Next Config   |

---

## Overall Results

| Check                  | Status | Details                                  |
|------------------------|--------|------------------------------------------|
| TypeScript (`tsc`)     | ✅ PASS | 0 errors                                 |
| ESLint                 | ⚠️ WARN | 0 errors, **10 warnings**                |
| Production Build       | ❌ FAIL | 1 type error blocks build                |
| Prisma Schema Push     | ❌ FAIL | 3 schema validation errors               |
| Playwright E2E         | ⚠️ PARTIAL | **2 passed**, **3 failed** (5 total)  |

---

## TypeScript Type Check

```
npx tsc --noEmit
```
**Result**: ✅ **PASS** — 0 errors, 0 warnings

---

## ESLint Results

```
npm run lint
```
**Result**: ⚠️ **10 warnings, 0 errors**

| # | Rule | File | Line | Description |
|---|------|------|------|-------------|
| 1 | `@typescript-eslint/no-unused-vars` | (API route) | 78 | `'e'` defined but never used |
| 2 | `@typescript-eslint/no-unused-vars` | (API route) | 26 | `'req'` defined but never used |
| 3 | `@typescript-eslint/no-unused-vars` | (bookings page) | 43 | `'session'` assigned but never used |
| 4 | `react-hooks/exhaustive-deps` | (bookings page) | 57 | useEffect missing deps: `fetchBookings`, `router` |
| 5 | `@typescript-eslint/no-unused-vars` | (bookings page) | 89 | `'error'` defined but never used |
| 6 | `@next/next/no-img-element` | (component) | 155 | Use `<Image />` instead of `<img>` |
| 7 | `@typescript-eslint/no-unused-vars` | (component) | 19 | `'LogOut'` defined but never used |
| 8 | `@typescript-eslint/no-unused-vars` | (component) | 19 | `'Settings'` defined but never used |
| 9 | `@typescript-eslint/no-unused-vars` | (component) | 36 | `'error'` defined but never used |
| 10 | `@next/next/no-img-element` | (component) | 49 | Use `<Image />` instead of `<img>` |

---

## Production Build

```
npm run build
```
**Result**: ❌ **FAIL**

**Error**: `Property 'createMany' does not exist on type 'AvailabilityDelegate<DefaultArgs>'`  
**File**: `src/app/api/items/route.ts:209`  
**Cause**: SQLite Prisma connector does not support `createMany()`

---

## Prisma Schema Validation

```
npx prisma db push
```
**Result**: ❌ **FAIL** — 3 errors

| Line | Field | Error |
|------|-------|-------|
| 28 | `refresh_token` | `@db.Text` not supported for SQLite |
| 29 | `access_token` | `@db.Text` not supported for SQLite |
| 33 | `id_token` | `@db.Text` not supported for SQLite |

---

## Playwright E2E Tests

```
npx playwright test --project=chromium --reporter=list
```
**Result**: ⚠️ **2 passed, 3 failed** (9.3s)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | `example.spec.ts` › has title | ✅ PASS | 493ms |
| 2 | `example.spec.ts` › get started link | ✅ PASS | 1.1s |
| 3 | Admin Protection › Student cannot access admin dashboard | ❌ FAIL | 0ms |
| 4 | Admin Protection › Admin can access admin dashboard | ❌ FAIL | 0ms |
| 5 | Booking Flow › User can browse, view item, and request it | ❌ FAIL | 0ms |

> **Note**: Tests 3-5 failed instantly (0ms) — they crashed during `beforeAll` hooks because the database has no schema applied. The `test-utils.ts` tries to create users/items via Prisma, which fails without a working database.

---

## Deprecation Warnings

| Warning | Details |
|---------|---------|
| `middleware` convention | Deprecated in Next.js 16. Replace with `proxy`. See [migration guide](https://nextjs.org/docs/messages/middleware-to-proxy) |

---

## Verdict

> **🔴 NOT READY FOR PRODUCTION** — The build fails and integration tests crash. Two critical blockers must be resolved before deployment.
