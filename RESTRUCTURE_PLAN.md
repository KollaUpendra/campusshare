# RESTRUCTURE_PLAN.md — CampusShare Platform

## Chosen Architecture: Next.js App Router (Feature-Colocation)

### Why This Fits

The project already follows the **Next.js App Router convention** with feature-colocation:

- **Pages** are organized by route in `src/app/`
- **API routes** are co-located under `src/app/api/`
- **Components** are grouped by domain: `admin/`, `auth/`, `items/`, `layout/`, `profile/`, `ui/`
- **Library code** is centralized in `src/lib/`
- **Types** are in `src/types/`
- **Middleware** is at `src/middleware.ts` (framework requirement)

This is the **idiomatic structure for Next.js App Router projects** and should NOT be restructured.

### Alternatives Rejected

| Architecture | Reason for Rejection |
|---|---|
| **Feature-based (everything per feature)** | Would break Next.js file-system routing. Pages MUST be in `app/`. |
| **Layer-based (controllers/services/repositories)** | Overkill for a Next.js App Router project which uses route handlers as controllers. |
| **Domain-Driven Design** | Too much ceremony for a single-domain campus rental platform. |
| **Monorepo (nx/turborepo)** | Single project — no need for workspace splitting. |

### What DOES Need Reorganization

Only **minor adjustments** within the existing structure:

1. **Remove empty `admin/dashboard/` directory** — unused, creates confusion
2. **No file moves needed** — all files are correctly placed per Next.js conventions

### Migration Safety

Since we are NOT moving any source files, there are **zero import breakage risks**.

The only changes are:
- Deleting junk files (logs, build outputs)
- Deleting orphaned component (`AdminUserActions.tsx`)
- Deleting leftover `prisma/dev.db`
- Minor config fixes
