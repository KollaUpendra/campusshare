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


// ALLOWED_DOMAIN is read at runtime in the signIn callback below

/**
 * NextAuth configuration object.
 * Defines providers, adapters, and callback logic for authentication flows.
 */
// Log only in dev to avoid leaking env info in production
if (process.env.NODE_ENV !== 'production') {
    console.log(`[Auth] Initializing NextAuth. NODE_ENV=${process.env.NODE_ENV}`);
}

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


            // CHECK IF USER IS BLOCKED
            if (user.email) {
                const dbUser = await db.user.findUnique({
                    where: { email: user.email },
                    select: { isBlocked: true },
                });
                if (dbUser?.isBlocked) {
                    console.warn(`[Auth] Blocked user attempted login: ${user.email}`);
                    return false; // Denies login
                }
            }

            // Allow any email domain (removed restriction logic)
            return true;
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
                if (user) {
                    token.id = user.id;
                    token.role = (user as any).role || "student";
                }

                // Always fetch latest data (coins changes frequently)
                if (token.id) {
                    const dbUser = await db.user.findUnique({
                        where: { id: token.id as string },
                        select: { 
                            role: true, 
                            coins: true,
                            year: true,
                            branch: true,
                            section: true,
                            address: true,
                            phoneNumber: true,
                         },
                    });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.coins = dbUser.coins;
                        token.year = dbUser.year;
                        token.branch = dbUser.branch;
                        token.section = dbUser.section;
                        token.address = dbUser.address;
                        token.phoneNumber = dbUser.phoneNumber;
                    }
                }
            } catch (error) {
                console.error("JWT Callback Error:", error);
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                (session.user as any).coins = token.coins as number;
                (session.user as any).year = token.year;
                (session.user as any).branch = token.branch;
                (session.user as any).section = token.section;
                (session.user as any).address = token.address;
                (session.user as any).phoneNumber = token.phoneNumber;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        // error: '/api/auth/error',
    },
}
