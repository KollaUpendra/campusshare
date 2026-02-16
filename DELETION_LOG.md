# DELETION_LOG.md — CampusShare Platform

**Date:** 2026-02-15

## Root-Level Log Files (12 files)
| File | Reason | Proof |
|---|---|---|
| `server-debug.log` | Debug log output | Not imported, not in config, not in scripts |
| `server-debug-2.log` | Debug log output | Same |
| `server-debug-3.log` | Debug log output | Same |
| `server-debug-4.log` | Debug log output | Same |
| `server-debug-5.log` | Debug log output | Same |
| `server-debug-7.log` | Debug log output | Same |
| `server-debug-8.log` | Debug log output | Same |
| `server-debug-9.log` | Debug log output | Same |
| `server-debug-10.log` | Debug log output | Same |
| `server-debug-11.log` | Debug log output | Same |
| `server-debug-12.log` | Debug log output | Same |
| `server-debug-13.log` | Debug log output | Same |

## Root-Level Build/Test Output Files (14 files)
| File | Reason | Proof |
|---|---|---|
| `build-full.log` | Build output log | Not referenced anywhere |
| `build-log.txt` | Build output log | Not referenced anywhere |
| `build-log-2.txt` | Build output log | Not referenced anywhere |
| `build-output.txt` | Build output log | Not referenced anywhere |
| `build_output.txt` | Build output log (duplicate name) | Not referenced anywhere |
| `build-verify.log` | Build verification log | Not referenced anywhere |
| `push_error.log` | Git push error log | Not referenced anywhere |
| `lint-log.txt` | Lint output | Not referenced anywhere |
| `test-log.txt` | Test output | Not referenced anywhere |
| `test-failure.log` | Test failure output | Not referenced anywhere |
| `test-booking-debug.txt` | Booking debug output | Not referenced anywhere |
| `test-server-log.txt` | Server test output | Not referenced anywhere |
| `playwright-output.txt` | Playwright output | Not referenced anywhere |
| `verify_output.txt` | Verification output | Not referenced anywhere |

## Old Report Files (6 files)
| File | Reason | Proof |
|---|---|---|
| `CLEANUP_CONFIRMATION.md` | Old cleanup report | Superseded by this audit |
| `CLEANUP_REPORT.md` | Old cleanup report | Superseded by this audit |
| `ERROR_ANALYSIS.md` | Old error analysis | Superseded by this audit |
| `TEST_REPORT.md` | Old test report | Superseded by this audit |
| `TEST_SUMMARY.md` | Old test summary | Superseded by this audit |
| `README_FEATURE.md` | Old feature readme | Superseded by `PROJECT_DOCUMENTATION.md` |

## Orphaned Source Files (1 file)
| File | Reason | Proof |
|---|---|---|
| `src/components/admin/AdminUserActions.tsx` | Never imported by any file | `grep "AdminUserActions" src/` returned only self-reference |

## Leftover Files (1 file)
| File | Reason | Proof |
|---|---|---|
| `prisma/dev.db` | SQLite DB in a PostgreSQL project | `schema.prisma` specifies `provider = "postgresql"` |

## Empty Directories (1)
| Directory | Reason | Proof |
|---|---|---|
| `src/app/admin/dashboard/` | Empty directory, 0 files | `find` returned 0 results |

## Duplicate Scripts (2 files)
| File | Reason | Proof |
|---|---|---|
| `scripts/test-db.ts` | Simpler duplicate of `test-db-connection.ts` | Both test DB connectivity; `test-db-connection.ts` is more complete |
| `scripts/verify-db.js` | JS version of same DB test | Same functionality as `test-db-connection.ts` |

**Total deleted: 36 files + 1 directory**
