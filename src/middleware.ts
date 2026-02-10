import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

        // FR-02: Role-Based Access Control
        // auth.ts uses strategy: "jwt", so token is always available here
        // with the user's role embedded via the jwt callback.
        if (isAdminRoute && token?.role !== "admin") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // Returns true if user is logged in
        },
    }
);

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/post-item"] };

