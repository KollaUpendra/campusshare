# CampusShare — Security Audit

## Executive Summary

CampusShare is a campus rental marketplace with authentication, virtual currency, and admin moderation. This audit identifies security risks derived strictly from code analysis.

---

## 1. Authentication Security

### ✅ Strengths
| Finding | Evidence |
|---|---|
| JWT session strategy with 30-day expiry | `auth.ts` line 51-52 |
| Blocked user check on sign-in | `auth.ts` line 78-87 |
| PrismaAdapter ties sessions to DB users | `auth.ts` line 49 |
| `NEXTAUTH_SECRET` used for JWT signing | `.env` line 5 |

### ⚠️ Risks
| Risk | Severity | Detail |
|---|---|---|
| Weak NEXTAUTH_SECRET | **HIGH** | Value is `"super_secret_for_testing"` — trivially guessable. Must be a cryptographically random string in production. |
| Domain restriction disabled | **MEDIUM** | `ALLOWED_DOMAIN` env var exists but sign-in callback allows any email. Anyone with a Google account can register. |
| JWT refreshes DB on every call | **LOW** | `jwt` callback queries DB every time, which is good for security (up-to-date roles/blocks) but impacts performance. |
| No session revocation | **LOW** | JWTs cannot be individually revoked. Blocking a user prevents new sign-ins but existing JWTs remain valid until expiry. |

---

## 2. Authorization Enforcement

### ✅ Strengths
| Finding | Evidence |
|---|---|
| Middleware-level RBAC for admin routes | `middleware.ts` line 40 |
| API-level session check in every handler | `getServerSession(authOptions)` pattern |
| Ownership verification before CRUD | Item/booking routes check `ownerId === session.user.id` |
| Blocked user guard on mutation APIs | Items POST, bookings, complaints all check `isBlocked` |
| Admin-only check on admin APIs | `session.user.role !== "admin"` → 403 |

### ⚠️ Risks
| Risk | Severity | Detail |
|---|---|---|
| `GET /api/items` has no auth | **LOW** | By design — public marketplace listing. |
| `GET /api/items/[id]` has no auth | **LOW** | By design — public item detail view. |
| Admin self-modification prevention only on PATCH | **LOW** | `PATCH /api/admin/users` prevents self-modification but other admin routes don't explicitly check. |

---

## 3. Secret Exposure Risk

| Risk | Severity | Detail | Mitigation |
|---|---|---|---|
| `.env` committed to repository | **CRITICAL** | File contains database URL, Google OAuth secrets, Cloudinary keys. If the repo is public, all secrets are compromised. | Add `.env` to `.gitignore` (it is listed), rotate ALL secrets immediately. |
| Cloudinary API secret in .env | **HIGH** | `CLOUDINARY_API_SECRET` exposed. | Rotate secret in Cloudinary dashboard. |
| Database password in connection string | **HIGH** | `CaNCnqGW8y7vBue0` visible. | Rotate Supabase password. |
| Console.log of Cloudinary secret length | **MEDIUM** | `sign-cloudinary/route.ts` logs `Secret exists: true` and `Secret length`. | Remove debug logs before production. |
| Payment error writes to file system | **MEDIUM** | `bookings/[id]/pay/route.ts` line 155: `require("fs").writeFileSync("payment_error_log.txt", ...)`. Writes error stack trace to disk. | Remove this debug code. |

---

## 4. Insecure API Routes

| Route | Risk | Detail |
|---|---|---|
| `POST /api/sign-cloudinary` | **HIGH** | No authentication check. Anyone can get a valid Cloudinary signature to upload files. Add session check. |
| `POST /api/bookings/[id]/status` | **MEDIUM** | Uses `db.$executeRawUnsafe()` with parameterized queries (safe from injection). However, raw SQL bypasses Prisma type safety. |
| `GET /api/items` | **LOW** | Calls `processExpirations()` on every request. A DDoS vector could trigger excessive DB writes. |

---

## 5. Input Validation

### ✅ Present Validations
| Endpoint | Validation |
|---|---|
| `POST /api/items` | Title max 200 chars, description max 2000 chars, valid day names, required fields |
| `POST /api/bookings` | Date format regex, date range validation, availability check, overlap check |
| `POST /api/complaints` | Description max 2000 chars, duplicate prevention |
| `PUT /api/admin/deposits/[id]` | Status must be `APPROVED` or `REJECTED` |

### ⚠️ Missing Validations
| Endpoint | Missing | Severity |
|---|---|---|
| `PUT /api/user/profile` | No length limits on any field. User could submit extremely long strings. | **MEDIUM** |
| `PUT /api/items` | No length limits on title/description (unlike POST). | **MEDIUM** |
| `POST /api/user/deposits` | Amount not validated for maximum value. | **LOW** |
| `PATCH /api/admin/settings` | `rentPercent` / `sellPercent` not validated for range (could be negative or >100). | **MEDIUM** |
| All API routes | No request body size limits beyond Next.js defaults. | **LOW** |

---

## 6. XSS / CSRF Risks

| Area | Status | Detail |
|---|---|---|
| **XSS** | **LOW RISK** | React auto-escapes JSX output. No `dangerouslySetInnerHTML` usage found. User-generated content (descriptions, messages) is rendered as text. |
| **CSRF** | **PROTECTED** | NextAuth uses CSRF tokens for auth endpoints. API routes use server-side session validation. |
| **Stored XSS** | **LOW RISK** | User inputs (titles, descriptions, bio) are stored and displayed but React escapes them on render. |

---

## 7. Rate Limiting

| Status | Detail |
|---|---|
| **Not Found in Codebase** | No rate limiting middleware or configuration exists. |
| **Risk** | **HIGH** — API endpoints can be called unlimited times. Particularly dangerous for: `POST /api/bookings` (spam booking requests), `GET /api/items` (triggers DB writes via `processExpirations`), `POST /api/complaints` (spam complaints). |
| **Recommendation** | Add rate limiting via middleware or use Vercel's built-in rate limiting. Consider `express-rate-limit` equivalent for Next.js. |

---

## 8. File Upload Safety

| Area | Status | Detail |
|---|---|---|
| **Upload mechanism** | Cloudinary client-side upload | Files uploaded directly to Cloudinary from browser, signed by server |
| **Signing endpoint** | `/api/sign-cloudinary` | **No auth check** — any client can request upload signatures |
| **File type validation** | **Not Found** | No server-side validation of file type, size, or content |
| **Recommendation** | Add `getServerSession()` check to signing endpoint. Configure Cloudinary upload preset with allowed formats and size limits. |

---

## 9. Financial Security (Coin Economy)

### ✅ Strengths
| Finding | Evidence |
|---|---|
| Atomic transactions for all coin transfers | All payment/refund/fine routes use `db.$transaction()` |
| Double-acceptance prevention | Booking accept checks `status !== "PENDING"` |
| Double-payment prevention | Pay route uses `booking.updateMany` with status filter |
| Insufficient balance checks | All payment routes verify `coins >= cost` |
| Service charge tracked | `platformFee` field in Transaction model |

### ⚠️ Risks
| Risk | Severity | Detail |
|---|---|---|
| No pessimistic locking | **MEDIUM** | Concurrent requests could read stale balance. Prisma's `decrement` helps but race conditions are possible. |
| Rollback uses `rentCoins` not actual paid amount | **MEDIUM** | `admin/booking/rollback` refunds `item.rentCoins` instead of the actual transaction amount. Could refund wrong amount. |
| Float arithmetic for currency | **LOW** | `coins` is `Float` type. Floating-point arithmetic can cause precision issues. Consider `Decimal` or integer cents. |

---

## 10. Testing

### Current Testing Setup
| Framework | Status | Config |
|---|---|---|
| Playwright (E2E) | Configured | `playwright.config.ts` |
| Unit Tests | **Not Found** | No Jest/Vitest configuration |
| API Tests | **Not Found** | No API test files |

### Test Files Found
```
tests/
└── (5 files — Playwright specs)
```

### Coverage Gaps
- No unit tests for business logic (coin calculations, expiration logic)
- No API integration tests
- No mock/stub infrastructure
- E2E tests likely cover happy paths only

---

## 11. Backup & Recovery

**Status:** Not Found in Codebase

No backup scripts, database dump utilities, or recovery documentation found.

### Recommended Backup Plan

1. **Database:** Enable Supabase's Point-in-Time Recovery (PITR) or schedule daily `pg_dump` exports.
2. **Images:** Cloudinary has built-in asset backup. Enable it in Cloudinary settings.
3. **Code:** Git repository is the code backup. Ensure push-to-remote is frequent.
4. **Recovery Steps:**
   - Restore PostgreSQL from backup: `pg_restore` or Supabase dashboard
   - Redeploy app from Git
   - No data migration needed (schema is in Prisma)

---

## Summary of Action Items

| Priority | Action |
|---|---|
| 🔴 Critical | Rotate `NEXTAUTH_SECRET` to cryptographically random value |
| 🔴 Critical | Verify `.env` is NOT committed to public repo; rotate all exposed secrets |
| 🔴 Critical | Add auth check to `/api/sign-cloudinary` |
| 🟠 High | Remove `require("fs").writeFileSync()` debug code from pay route |
| 🟠 High | Add rate limiting middleware |
| 🟠 High | Remove debug console.logs from Cloudinary signing |
| 🟡 Medium | Add input validation to `PUT /api/user/profile` |
| 🟡 Medium | Validate service charge % range in admin settings |
| 🟡 Medium | Fix rollback to use actual transaction amount |
| 🟢 Low | Consider `Decimal` type for coins instead of `Float` |
| 🟢 Low | Add unit tests for business logic |
| 🟢 Low | Set up database backup schedule |
