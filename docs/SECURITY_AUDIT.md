# CampusShare — Security Audit

> **Audit Date:** 2026-02-21 | **Scope:** Full codebase review

---

## Executive Summary

| Category | Risk Level | Details |
|---|---|---|
| Authentication | 🟡 Medium | JWT-based, Google OAuth — solid pattern but relies on undiscoverable issues |
| Authorization | 🟢 Low | Consistent admin role checks, blocked-user guards in most routes |
| Secret Exposure | 🔴 Critical | `.env` with real credentials committed to repository |
| API Validation | 🟡 Medium | Partial — Zod on frontend forms, but server-side validation is incomplete |
| XSS / CSRF | 🟢 Low | React JSX auto-escaping, CSRF managed by NextAuth |
| Rate Limiting | 🔴 Critical | Not implemented on any endpoint |
| File Upload | 🟡 Medium | Cloudinary-based (no server-side file handling) but signed uploads help |

---

## 1. Authentication Security

### Strengths ✅

- **NextAuth v4** — well-maintained library with proven security model
- **JWT strategy** — tokens are signed with `NEXTAUTH_SECRET`
- **Blocked user check** — on every sign-in AND every JWT refresh
- **Server-side auth** — all API routes use `getServerSession(authOptions)` (not client-side checks)
- **Secure cookie detection** — `__Secure-` prefix when HTTPS detected
- **Custom sign-in page** — prevents default NextAuth pages from exposing internals

### Issues ⚠️

| Issue | Severity | Location | Details |
|---|---|---|---|
| Weak `NEXTAUTH_SECRET` | 🔴 Critical | `.env` line 5 | Value is `"super_secret_for_testing"` — must be changed for production |
| DB query on every request | 🟡 Medium | `auth.ts` JWT callback | Token refreshes always query DB — could be a DoS vector under load |
| No session invalidation | 🟡 Medium | `auth.ts` | When user is blocked, existing JWT sessions remain valid until expiry (30 days) |
| No account lockout | 🟡 Medium | `auth.ts` | No rate limiting on failed sign-in attempts (though Google OAuth mitigates this) |

### Recommendations

1. **Replace `NEXTAUTH_SECRET`** with `openssl rand -base64 32`
2. **Add token-level blocked check**: Periodically re-check `isBlocked` in JWT callback (currently done, ✅)
3. **Reduce JWT maxAge** from 30 days to 7 days for faster blocked-user enforcement

---

## 2. Authorization Enforcement

### Strengths ✅

- **Middleware RBAC** on `/admin/*` routes — non-admin users redirected
- **Admin layout guard** — server-side `getServerSession()` + role check
- **API route authorization** — all admin API routes check `session.user.role === "admin"`
- **Item ownership** — delete/edit operations verify `ownerId === session.user.id`
- **Booking ownership** — accept/reject verify item owner, pay verifies borrower
- **Blocked user guards** — in booking create, accept, reject, complaint create routes
- **Self-modification prevention** — admin cannot modify own account

### Issues ⚠️

| Issue | Severity | Location | Details |
|---|---|---|---|
| Missing blocked-user guard | 🟡 Medium | `POST /api/bookings/[id]/pay` | No `isBlocked` check before payment |
| Missing blocked-user guard | 🟡 Medium | `POST /api/bookings/[id]/status` | No `isBlocked` check for status updates |
| Missing blocked-user guard | 🟡 Medium | `PUT /api/user/profile` | Blocked users can still update profile |
| Inconsistent status casing | 🟡 Medium | Multiple routes | `"pending"` vs `"PENDING"`, `"active"` vs `"AVAILABLE"` — could bypass status checks |

---

## 3. Secret Exposure Risk

### 🔴 CRITICAL: Credentials in `.env`

The `.env` file contains **real production credentials** that are committed alongside the codebase. While `.gitignore` should exclude `.env`, the following secrets were found:

| Secret | Risk |
|---|---|
| `DATABASE_URL` with password | Full database access |
| `GOOGLE_CLIENT_SECRET` | OAuth impersonation |
| `CLOUDINARY_API_SECRET` | Image upload/deletion abuse |
| `NEXTAUTH_SECRET` | JWT forging capability |

### Recommendations

1. **Immediately rotate** all secrets if the repository has ever been public
2. **Add `.env` to `.gitignore`** (verify it's listed)
3. **Use environment variable injection** (Vercel env vars, Docker secrets, etc.)
4. **Never hardcode secrets** — use runtime environment variable access only

---

## 4. Insecure API Route Analysis

| Route | Issue | Severity |
|---|---|---|
| `GET /api/items` | Publicly accessible (intentional) — but calls `processExpirations()` on every request | 🟡 Medium — DoS via repeated GET |
| `POST /api/bookings/[id]/pay` | Writes to filesystem: `require("fs").writeFileSync("payment_error_log.txt", ...)` | 🔴 Critical — server-side file write, potential path traversal |
| `POST /api/bookings/[id]/status` | Uses `$executeRawUnsafe` and `$queryRawUnsafe` | 🟡 Medium — parameterized but raw SQL |
| `PATCH /api/bookings/[id]` | Legacy route — does NOT use atomic transactions | 🟡 Medium — race condition potential |

### Critical Finding: File Write in Payment Route

```typescript
// src/app/api/bookings/[id]/pay/route.ts line 155
require("fs").writeFileSync("payment_error_log.txt", error?.stack || String(error));
```

This writes error details to the server's filesystem. In production:
- Creates a disk-based log outside of proper logging infrastructure
- Could cause disk space issues under repeated errors
- **Should be removed** and replaced with structured logging

---

## 5. Input Validation

### Current State

| Layer | Validation | Details |
|---|---|---|
| **Client (Forms)** | ✅ Zod schemas | `AddItemForm` uses `zodResolver` with `react-hook-form` |
| **Server (API)** | ⚠️ Partial | Manual checks (`if (!field)`) — no Zod or schema validation on most API routes |

### Missing Validation

| Route | Missing Validation |
|---|---|
| `POST /api/items` | No price range validation (negative prices possible) |
| `POST /api/bookings` | Date format checked but no future-date enforcement |
| `PUT /api/user/profile` | No sanitization on `bio`, `address`, `name` fields |
| `POST /api/user/deposits` | No maximum amount limit |
| `POST /api/complaints` | Description length checked (2000 chars) ✅ |
| `POST /api/admin/complaint/fine` | `fineCoins` validated as positive ✅ |

### Recommendations

1. **Add Zod validation** to all API route handlers (server-side)
2. **Validate numeric ranges** — price, coins, fine amounts
3. **Sanitize text inputs** — prevent stored XSS via `bio`, `description`, etc.
4. **Enforce date constraints** — bookings should be for future dates only

---

## 6. XSS / CSRF Risks

### XSS

- **React auto-escaping** — JSX expressions are escaped by default ✅
- **No `dangerouslySetInnerHTML`** found in codebase ✅
- **User-generated content** (descriptions, bios) rendered via JSX — safe ✅
- **Image URLs** — loaded via Next.js `<Image>` component with allowed domains ✅

### CSRF

- **NextAuth CSRF protection** — built-in token verification on auth endpoints ✅
- **API routes** — use `getServerSession()` (not just cookie-based) ✅
- **No custom CSRF tokens** on non-auth API routes — potential risk for browser-initiated POST/PUT/DELETE requests

### Recommendation

- Consider adding `SameSite=Strict` cookie attributes in production
- Ensure API routes are only called from the application origin

---

## 7. Rate Limiting

**Status:** Not Found in Codebase

No rate limiting middleware, API throttling, or request counting is implemented.

### Risk Scenarios

| Scenario | Impact |
|---|---|
| Repeated `GET /api/items` | CPU spike (runs `processExpirations()` each time) |
| Repeated `POST /api/bookings` | Spam booking requests |
| Repeated `POST /api/complaints` | Rapid complaint filing (mitigated by one-per-booking limit) |
| Brute-force JWT forging | Mitigated by Google OAuth (no password-based login) |

### Recommendation

Implement rate limiting at the middleware or API route level:
```typescript
// Example with a simple in-memory store
const rateLimiter = new Map();
// Or use packages: express-rate-limit, next-rate-limit, upstash/ratelimit
```

---

## 8. File Upload Safety

| Aspect | Status | Details |
|---|---|---|
| **Upload method** | Cloudinary direct upload | No server-side file handling ✅ |
| **Signed uploads** | Yes | `/api/sign-cloudinary` generates signed params ✅ |
| **File type restriction** | Not Found in Codebase | No explicit MIME type or extension validation |
| **File size limit** | Not Found in Codebase | Relies on Cloudinary's default limits |
| **URL validation** | Not Found in Codebase | User-submitted Cloudinary URLs stored directly |

### Recommendations

1. **Add MIME type validation** in the signing endpoint
2. **Set max file size** in Cloudinary upload presets
3. **Validate Cloudinary URLs** before storing in database (verify they match expected pattern)

---

## 9. Testing

### Current Test Suite

| File | Type | Coverage |
|---|---|---|
| `tests/example.spec.ts` | Playwright E2E | Basic page load test |
| `tests/item-management.spec.ts` | Playwright E2E | Item CRUD operations |
| `tests/booking-flow.spec.ts` | Playwright E2E | Booking creation flow |
| `tests/admin-protection.spec.ts` | Playwright E2E | Admin route protection |
| `tests/test-utils.ts` | Utility | Test helper functions |

### How to Run Tests

```bash
# Install Playwright browsers
npx playwright install --with-deps

# Run all tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run specific test
npx playwright test tests/item-management.spec.ts

# View HTML report
npx playwright show-report
```

### Coverage Gaps

| Area | Test Coverage |
|---|---|
| API route unit tests | ❌ None |
| Authentication flow | ❌ Not tested |
| Payment/transaction logic | ❌ Not tested |
| Admin actions (fine, rollback) | ❌ Not tested |
| Blocked user behavior | ❌ Not tested |
| Edge cases (insufficient coins, concurrent bookings) | ❌ Not tested |
| Database constraints/integrity | ❌ Not tested |

### Recommendations

1. **Add API integration tests** using a test framework (e.g., Vitest + Supertest)
2. **Add unit tests** for `processExpirations()`, `isProfileComplete()`
3. **Add authentication mocking** for Playwright tests
4. **Add transaction consistency tests** (concurrent payments, race conditions)
5. **Target 80%+ code coverage** for API routes

---

## 10. Backup & Recovery

**Status:** Not Found in Codebase

No backup scripts, database dump automation, or recovery procedures exist.

### Proposed Backup Plan

| Component | Strategy | Frequency |
|---|---|---|
| **Database** | Supabase automatic backups (included in Pro plan) | Daily |
| **Database (manual)** | `pg_dump` via `DIRECT_URL` | Weekly |
| **Cloudinary images** | Cloudinary stores with redundancy | Auto |
| **Application code** | Git repository | Every commit |
| **Environment config** | Encrypted backup of `.env` (not in Git) | On change |

### Recovery Procedure

```bash
# 1. Restore database from backup
pg_restore -h host -p 5432 -U user -d campusshare backup.dump

# 2. Verify Prisma schema matches
npx prisma db pull
npx prisma generate

# 3. Deploy application
npm install
npm run build
npm start

# 4. Verify application health
curl https://yourdomain.com/api/auth/session
```

---

## Risk Summary Matrix

| Risk | Severity | Likelihood | Impact | Mitigation Priority |
|---|---|---|---|---|
| Secrets in `.env` committed | 🔴 Critical | High | Full system compromise | **Immediate** |
| Weak NEXTAUTH_SECRET | 🔴 Critical | High | JWT forgery | **Immediate** |
| No rate limiting | 🔴 High | Medium | DoS, spam | **High** |
| `fs.writeFileSync` in pay route | 🔴 High | Medium | Server filesystem abuse | **High** |
| Raw SQL in status route | 🟡 Medium | Low | SQL injection (mitigated by params) | Medium |
| Missing server-side validation | 🟡 Medium | Medium | Data corruption | Medium |
| Missing blocked-user guards | 🟡 Medium | Low | Unauthorized actions | Medium |
| No backup strategy | 🟡 Medium | Low | Data loss | Medium |
| No unit/integration tests | 🟡 Medium | Medium | Regression bugs | Medium |
