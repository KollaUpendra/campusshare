/**
 * @file routes.ts
 * @description Centralized route constants for the CampusShare platform.
 * 
 * Use these constants instead of hardcoding route strings to:
 * - Prevent typos in route paths
 * - Enable easy refactoring if routes change
 * - Provide a single source of truth for all navigation targets
 */

// ─── Public Routes ──────────────────────────────────────────────────────────

export const ROUTES = {
    HOME: "/",
    SEARCH: "/search",
    PRIVACY: "/privacy",
    TERMS: "/terms",

    // Item routes
    ITEMS: {
        DETAIL: (id: string) => `/items/${id}` as const,
        EDIT: (id: string) => `/items/${id}/edit` as const,
    },

    // Authenticated routes
    POST_ITEM: "/post-item",
    MY_ITEMS: "/my-items",
    PROFILE: "/profile",
    WISHLIST: "/wishlist",
    TRANSACTIONS: "/transactions",

    // Dashboard routes
    DASHBOARD: {
        BOOKINGS: "/dashboard/bookings",
    },

    // Admin routes
    ADMIN: {
        HOME: "/admin",
        USERS: "/admin/users",
        BOOKINGS: "/admin/bookings",
        ITEMS: "/admin/items",
    },
} as const;

// ─── API Routes ─────────────────────────────────────────────────────────────

export const API_ROUTES = {
    AUTH: {
        SIGNIN: "/api/auth/signin",
        SIGNOUT: "/api/auth/signout",
    },
    ITEMS: "/api/items",
    ITEM: (id: string) => `/api/items/${id}` as const,
    BOOKINGS: "/api/bookings",
    BOOKING: {
        ACCEPT: (id: string) => `/api/bookings/${id}/accept` as const,
        REJECT: (id: string) => `/api/bookings/${id}/reject` as const,
        PAY: (id: string) => `/api/bookings/${id}/pay` as const,
    },
    COMPLAINTS: "/api/complaints",
    NOTIFICATIONS: "/api/notifications",
    WISHLIST: "/api/wishlist",
    USER: {
        PROFILE: "/api/user/profile",
        MY_RENTALS: "/api/user/my-rentals",
    },
    TRANSACTIONS: {
        BUY: "/api/transactions/buy",
    },
    OWNER: {
        BOOKINGS: "/api/owner/bookings",
    },
    SIGN_CLOUDINARY: "/api/sign-cloudinary",
} as const;

// ─── Protected Routes (for reference / middleware) ──────────────────────────

export const PROTECTED_ROUTES = [
    "/dashboard/:path*",
    "/admin/:path*",
    "/post-item",
    "/profile",
    "/my-items",
    "/wishlist",
    "/transactions",
] as const;
