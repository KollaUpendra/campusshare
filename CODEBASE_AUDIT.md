# CODEBASE_AUDIT.md — CampusShare Platform

**Date:** 2026-02-15  
**Project Type:** Next.js 16 App Router (Frontend + Backend monolith)  
**Stack:** React 19, Prisma 5, NextAuth v4, TailwindCSS 3, Cloudinary, Zod, shadcn/ui  
**Database:** PostgreSQL (Supabase)

---

## 1. Folder Structure Tree

```
campus-share-platform/
├── prisma/
│   ├── schema.prisma          # 231 lines — 10 models
│   ├── seed.ts                # DB seeder
│   └── dev.db                 # ⚠ LEFTOVER SQLite file (project uses PostgreSQL)
├── public/
│   ├── icons/
│   ├── manifest.json
│   ├── file.svg, globe.svg, next.svg, vercel.svg, window.svg
├── scripts/                   # 8 dev/debug scripts (NOT used in production)
│   ├── antigravity_test.ts
│   ├── cleanup.ts
│   ├── debug-auth.ts
│   ├── fetch-page.ts
│   ├── test-db-connection.ts
│   ├── test-db.ts
│   ├── verify-all-env.ts
│   └── verify-db.js
├── src/
│   ├── app/                   # Next.js App Router pages + API routes
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # CSS variables + Tailwind
│   │   ├── error.tsx, loading.tsx, not-found.tsx
│   │   ├── admin/             # Admin pages
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── bookings/page.tsx
│   │   │   ├── items/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   └── dashboard/     # ⚠ EMPTY DIR
│   │   ├── api/               # 29 API route files
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── admin/ (analytics, bookings, complaints, items, users)
│   │   │   ├── bookings/ (CRUD + accept/pay/reject)
│   │   │   ├── complaints/route.ts
│   │   │   ├── items/route.ts, items/[id]/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   ├── owner/bookings/route.ts
│   │   │   ├── sign-cloudinary/route.ts
│   │   │   ├── transactions/buy/route.ts
│   │   │   ├── user/my-rentals/route.ts, user/profile/route.ts
│   │   │   └── wishlist/route.ts
│   │   ├── dashboard/bookings/page.tsx
│   │   ├── items/[id]/page.tsx, items/[id]/edit/page.tsx
│   │   ├── my-items/page.tsx
│   │   ├── post-item/page.tsx
│   │   ├── privacy/page.tsx, terms/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── search/page.tsx
│   │   ├── transactions/page.tsx
│   │   └── wishlist/page.tsx
│   ├── components/
│   │   ├── admin/             # AdminItemActions, AdminUserActions, BlockUserButton
│   │   ├── auth/              # LoginButton, Providers, SignOutButton
│   │   ├── items/             # AddItemForm, BookingRequestButton, EditItemActions, ItemCard
│   │   ├── layout/            # BottomNav, DevToolsHider, Header
│   │   ├── profile/           # EditProfileDialog
│   │   └── ui/                # badge, button, card, dialog, input, label, popover, separator, textarea
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── db.ts              # Prisma singleton
│   │   ├── guards.ts          # Auth/RBAC guards
│   │   ├── scheduler.ts       # Expiration processor
│   │   └── utils.ts           # cn() utility
│   ├── middleware.ts           # Route protection + RBAC
│   └── types/
│       └── next-auth.d.ts     # Session/JWT type extensions
├── tests/                     # Playwright E2E tests
│   ├── admin-protection.spec.ts
│   ├── booking-flow.spec.ts
│   ├── example.spec.ts
│   ├── item-management.spec.ts
│   └── test-utils.ts
├── docs/
│   ├── API_REFERENCE.md
│   └── ARCHITECTURE.md
├── ─── ROOT JUNK FILES ───
│   ├── build-full.log, build-log.txt, build-log-2.txt
│   ├── build-output.txt, build_output.txt, build-verify.log
│   ├── server-debug.log ... server-debug-13.log (12 files)
│   ├── push_error.log
│   ├── lint-log.txt
│   ├── test-log.txt, test-failure.log
│   ├── test-booking-debug.txt, test-server-log.txt
│   ├── playwright-output.txt
│   ├── verify_output.txt
│   ├── CLEANUP_CONFIRMATION.md, CLEANUP_REPORT.md
│   ├── ERROR_ANALYSIS.md, TEST_REPORT.md, TEST_SUMMARY.md
│   ├── README_FEATURE.md
│   └── deploy_local.bat
└── config files
    ├── package.json, package-lock.json
    ├── tsconfig.json, tsconfig.tsbuildinfo
    ├── next.config.mjs, eslint.config.mjs
    ├── tailwind.config.js, postcss.config.js
    ├── components.json, playwright.config.ts
    └── .env, .gitignore
```

---

## 2. Unused Files (Confirmed)

| File | Reason |
|---|---|
| `src/components/admin/AdminUserActions.tsx` | Never imported by any page — orphaned component |
| `src/app/admin/dashboard/` (empty dir) | Empty directory, no files inside |
| `prisma/dev.db` | Leftover SQLite file; project uses PostgreSQL/Supabase |

---

## 3. Possibly Unused Files (DO NOT DELETE)

| File | Reason for caution |
|---|---|
| `src/lib/scheduler.ts` | Only imported by `api/items/route.ts` — called lazily on API hit. May be intentional design. |
| `src/components/ui/separator.tsx` | Only imported by `profile/page.tsx` — still used. |
| `public/file.svg, globe.svg, window.svg, vercel.svg` | Default Next.js SVGs — may be referenced in future or by next.js internals. Mark as low priority. |
| `scripts/*` | All 8 scripts are dev/debug utilities excluded from `tsconfig.json`. Not used in production but intentionally kept for development. |
| `deploy_local.bat` | Local dev convenience script — not referenced anywhere but intentionally created. |

---

## 4. Duplicate / Overlapping Files

| Files | Issue |
|---|---|
| `scripts/test-db.ts` and `scripts/test-db-connection.ts` and `scripts/verify-db.js` | Three scripts that all test DB connectivity. `test-db-connection.ts` is the most complete. |
| `build-output.txt` and `build_output.txt` | Nearly identical names, both contain build logs |
| `CLEANUP_CONFIRMATION.md` and `CLEANUP_REPORT.md` | Both are old cleanup reports from previous sessions |
| `TEST_REPORT.md` and `TEST_SUMMARY.md` | Both contain test results from previous sessions |
| `BlockUserButton.tsx` vs `AdminUserActions.tsx` | Both implement block/unblock user. `BlockUserButton` is used; `AdminUserActions` is orphaned and has more features (role toggle). |

---

## 5. Dead Exports

| File | Export | Issue |
|---|---|
| `src/lib/auth.ts` | `cookiePrefix` | Declared but only used internally (not exported, but `const` leaks scope) |
| No other dead exports found | — | All exported functions/components are imported by at least one consumer |

---

## 6. Circular Dependencies

**None detected.** The dependency graph is clean:
```
middleware.ts → next-auth/middleware
auth.ts → db.ts
guards.ts → auth.ts, db.ts
scheduler.ts → db.ts
All API routes → guards.ts, db.ts, auth.ts, scheduler.ts
All pages → db.ts, auth.ts, components
All components → ui/* components, lib/utils.ts
```

---

## 7. Oversized Files (>400 lines)

| File | Lines | Issue |
|---|---|
| `src/components/items/AddItemForm.tsx` | 376 | Approaching limit — contains form logic, validation schema, image upload handling, and JSX. Consider splitting if it grows further. |

No files exceed 400 lines currently; `AddItemForm.tsx` is the closest at 376.

---

## 8. Mixed Responsibility Files

| File | Issue |
|---|---|
| `src/app/page.tsx` | Contains `getItems()` data-fetching function alongside page component. Minor — accepted pattern for Next.js Server Components. |
| `src/app/layout.tsx` | Import of `DevToolsHider` is placed between JSDoc comment and function definition (line 56). Cosmetic issue only. |

---

## 9. Misplaced Files

| File | Issue |
|---|---|
| `prisma/dev.db` | SQLite DB file in a PostgreSQL project — leftover from early development |
| 20+ log/build/test files at root | Should be gitignored and removed |
| `README_FEATURE.md` | Should be in `docs/` or removed if superseded by `PROJECT_DOCUMENTATION.md` |

---

## 10. Environment / Config Scattering

| Issue | Details |
|---|---|
| `components.json` references `tailwind.config.ts` | Actual file is `tailwind.config.js` (not `.ts`). shadcn/ui CLI may fail. |
| `.env` file present and .gitignored | ✅ Correct |
| `ALLOWED_DOMAIN` env var | Referenced in `scripts/verify-all-env.ts` as required but not used in `auth.ts` (domain restriction was removed). Minor inconsistency. |

---

## 11. Inconsistent Naming

| Issue | Files |
|---|---|
| Component files use PascalCase | ✅ Correct for React/Next.js ecosystem |
| Config files use kebab-case + dot notation | ✅ Correct |
| No naming violations found | The codebase follows Next.js conventions consistently |

---

## 12. Test Coverage Gaps

| Area | Coverage |
|---|---|
| E2E (Playwright) | 4 test files: admin-protection, booking-flow, example, item-management |
| Unit Tests | **None** — no unit tests exist |
| API Route Tests | **None** — all 29 API routes lack unit/integration tests |
| Component Tests | **None** — no component-level tests |
| `lib/scheduler.ts` | Not tested at all |
| `lib/guards.ts` | Not tested at all |

---

## 13. Build Risks

| Risk | Details |
|---|---|
| `tailwind-animate` in dependencies | Listed but never configured in `tailwind.config.js` plugins array. Unused dependency. |
| `nodemailer` in dependencies | Listed but never imported in any source file. Unused dependency. |
| `autoprefixer` in dependencies (not devDependencies) | Should be in `devDependencies` |
| `postcss` in dependencies (not devDependencies) | Should be in `devDependencies` |
| `tailwindcss` in dependencies (not devDependencies) | Should be in `devDependencies` |
| `.next/` directory committed | Present locally but .gitignored — OK |

---

## 14. Root-Level Junk Files (Total: ~27 files)

### Log Files (12)
`server-debug.log`, `server-debug-2.log` through `server-debug-13.log` (missing 6)

### Build Output Files (6)
`build-full.log`, `build-log.txt`, `build-log-2.txt`, `build-output.txt`, `build_output.txt`, `build-verify.log`

### Test Output Files (5)
`lint-log.txt`, `test-log.txt`, `test-failure.log`, `test-booking-debug.txt`, `test-server-log.txt`, `playwright-output.txt`, `verify_output.txt`

### Old Report Files (5)
`CLEANUP_CONFIRMATION.md`, `CLEANUP_REPORT.md`, `ERROR_ANALYSIS.md`, `TEST_REPORT.md`, `TEST_SUMMARY.md`

### Misc (1)
`push_error.log`
