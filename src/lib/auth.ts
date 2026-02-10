import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import db from "@/lib/db"

const ALLOWED_DOMAIN = "@yourcollege.edu"; // Change this to your campus domain

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db) as any,
    session: {
        // BUG FIX: Changed from "database" to "jwt".
        // With "database" strategy, NextAuth does NOT create JWTs, so
        // req.nextauth.token in middleware is always null/undefined.
        // This caused token.role to be undefined for ALL users, meaning
        // even admins were redirected away from /admin routes.
        // With "jwt" strategy, the token is available in middleware and
        // the jwt callback below embeds the user's role into it.
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            // FR-01: Domain Validation Logic
            if (user.email?.endsWith(ALLOWED_DOMAIN)) {
                return true;
            }
            // Allow localhost debugging with specific test email if needed
            // if (process.env.NODE_ENV === "development") return true 

            return false; // Rejects login for external emails
        },
        async jwt({ token, user }) {
            // On initial sign-in, `user` is provided by the adapter.
            // We read the role from the database and embed it in the JWT.
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || "student";
            }
            // On subsequent requests, if role is missing (e.g. old tokens),
            // look it up from the database to stay in sync.
            if (!token.role && token.id) {
                const dbUser = await db.user.findUnique({
                    where: { id: token.id as string },
                    select: { role: true },
                });
                token.role = dbUser?.role || "student";
            }
            return token;
        },
        async session({ session, token }) {
            // With JWT strategy, the session callback receives `token` (not `user`).
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/api/auth/signin',
        error: '/api/auth/error',
    },
}
