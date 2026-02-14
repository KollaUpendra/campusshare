/**
 * @file middleware.ts
 * @description Next.js Middleware for protecting routes and enforcing role-based access control.
 * @module Middleware
 * 
 * Functionality:
 * - Protects specific routes (like /dashboard, /admin, /post-item).
 * - Enforces Role-Based Access Control (RBAC) on /admin routes.
 * - Redirects unauthorized users to the home page or login.
 * 
 * Dependencies:
 * - next-auth/middleware
 * - next/server
 */

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * Middleware function wrapped with `withAuth`.
 * Executes on every request matching the config matcher.
 * 
 * @param {NextRequestWithAuth} req - The incoming request object, augmented with NextAuth token.
 */
export default withAuth(
    function middleware(req) {
        // Retrieve the JWT token from the request
        const token = req.nextauth.token;
        const pathname = req.nextUrl.pathname;
        // Only log in development to avoid production noise
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Middleware] Processing: ${pathname}`);
        }

        const isAdminRoute = pathname.startsWith("/admin");

        // ROLE-BASED ACCESS CONTROL (RBAC)
        // Check if the user is trying to access an admin route.
        // We rely on the "jwt" strategy in auth.ts to populate `token.role`.
        if (isAdminRoute && token?.role !== "admin") {
            // Redirect non-admins to the home page
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            /**
             * Authorized Callback
             * Determines if the user is authenticated.
             * 
             * @param {object} params - The params object containing token and req.
             * @returns {boolean} True if the user is authorized, false otherwise.
             */
            authorized: ({ token, req }) => {
                // Allow auth routes to be accessed without a token to prevent redirect loops
                if (req.nextUrl.pathname.startsWith("/api/auth")) {
                    return true;
                }
                return !!token;
            },
        },
    }
);

/**
 * Middleware Configuration
 * Defines which paths should trigger the middleware.
 */
export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/post-item"] };

