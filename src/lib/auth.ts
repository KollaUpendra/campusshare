/**
 * @file auth.ts
 * @description Configuration for NextAuth.js authentication in the CampusShare platform.
 * @module Lib/Auth
 * 
 * Key Components:
 * - GoogleProvider: Used for Google OAuth sign-in.
 * - PrismaAdapter: Connects NextAuth to the Prisma database.
 * - Callbacks: Handles custom logic for signIn, jwt, and session management.
 * 
 * Dependencies:
 * - next-auth
 * - @auth/prisma-adapter
 * - @/lib/db (Prisma Client)
 * 
 * Environment Variables:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - ALLOWED_DOMAIN (optional, defaults to @yourcollege.edu)
 * 
 * Notes:
 * - Uses "jwt" strategy to ensure role propagation to middleware.
 */

import { NextAuthOptions } from "next-auth"
import type { Adapter } from "next-auth/adapters"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import db from "@/lib/db"
import CredentialsProvider from "next-auth/providers/credentials"

// Limit sign-ins to a specific domain for campus security
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || "@yourcollege.edu";

/**
 * NextAuth configuration object.
 * Defines providers, adapters, and callback logic for authentication flows.
 */
// Debugging environment
console.log(`[Auth] Initializing NextAuth. NODE_ENV=${process.env.NODE_ENV}`);

// Detect if running on HTTPS (production)
const useSecureCookies = (process.env.NEXTAUTH_URL ?? '').startsWith('https://');
const cookiePrefix = useSecureCookies ? '__Secure-' : '';

export const authOptions: NextAuthOptions = {
    // connect to Prisma DB for user/session storage
    adapter: PrismaAdapter(db) as Adapter,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    cookies: {
        sessionToken: {
            name: `${cookiePrefix}next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: useSecureCookies,
            },
        },
    },
    providers: [
        /**
         * Google OAuth Provider
         * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
         */
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        /**
         * Credentials Provider (Development/Test Only)
         * Allows bypassing Google OAuth for E2E testing.
         */
        CredentialsProvider({
            name: "Testing Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                role: { label: "Role", type: "text" },
                id: { label: "ID", type: "text" },
            },
            async authorize(credentials) {
                // ONLY allow in development or test environment
                if (process.env.NODE_ENV === "production") return null;

                if (!credentials?.email || !credentials?.id) return null;

                // Return a mock user object
                return {
                    id: credentials.id,
                    email: credentials.email,
                    name: "Test User",
                    role: credentials.role || "student",
                    image: "https://github.com/shadcn.png",
                };
            },
        }),
    ],
    callbacks: {
        /**
         * SignIn Callback
         * Controls whether a user is allowed to sign in.
         * 
         * @param {object} user - The user object returned by the provider.
         * @returns {Promise<boolean>} True if sign-in is allowed, false otherwise.
         */
        async signIn({ user, account }) {
            // Allow Credentials Provider (Testing) to bypass domain check
            if (account?.provider === "credentials") {
                return true;
            }

            // Ensure no quotes from env var and default to vnrvjiet.in if missing
            const allowedDomain = (process.env.ALLOWED_DOMAIN || "@vnrvjiet.in").replace(/^['"]|['"]$/g, '').toLowerCase();
            const userEmail = user.email?.toLowerCase();

            console.log(`[Auth] SignIn Check: Email=${user.email}, AllowedDomain=${allowedDomain}`);

            // DOMAIN RESTRICTION LOGIC
            // Only allow emails from the specified academic domain.
            if (userEmail?.endsWith(allowedDomain)) {
                return true;
            }

            console.warn(`[Auth] Access Denied: ${user.email} does not match domain ${allowedDomain}`);
            return false; // Rejects login for external emails
        },

        /**
         * JWT Callback
         * logic to attach custom claims (like user role) to the JWT.
         * 
         * @param {object} token - The JWT token.
         * @param {object} user - The user object (only available on initial sign-in).
         * @returns {Promise<object>} The modified token.
         */
        async jwt({ token, user }) {
            try {
                // On initial sign-in, `user` is provided by the adapter/provider.
                if (user) {
                    token.id = user.id;
                    // Assign default role if not present
                    token.role = (user as { role?: string }).role || "student";
                }

                // RE-FETCH ROLE IF MISSING
                // If the token exists but lacks a role (edge case: manual invalidation),
                // fetch it from the database to ensure consistency.
                // Optimization: We check !token.role to avoid hitting the DB on every single request.
                if (!token.role && token.id) {
                    const dbUser = await db.user.findUnique({
                        where: { id: token.id as string },
                        select: { role: true },
                    });
                    token.role = dbUser?.role || "student";
                }
            } catch (error) {
                console.error("JWT Callback Error:", error);
                // Don't crash, just return the token as-is or with safe defaults
                token.role = token.role || "student";
            }
            return token;
        },

        /**
         * Session Callback
         * Exposes the user's ID and Role to the client-side session object.
         * 
         * @param {object} session - The session object to be returned to the client.
         * @param {object} token - The JWT token containing the user's claims.
         * @returns {Promise<object>} The modified session object.
         */
        async session({ session, token }) {
            try {
                if (session.user) {
                    session.user.id = token.id as string;
                    session.user.role = token.role as string;
                }
            } catch (error) {
                console.error("Session Callback Error:", error);
            }
            return session;
        },
    },
    // pages: {
    //     signIn: '/api/auth/signin',
    //     error: '/api/auth/error',
    // },
}
