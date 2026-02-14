/**
 * @file next-auth.d.ts
 * @description Type definitions to extend NextAuth's default Session and JWT types.
 * @module Types/NextAuth
 * 
 * Purpose:
 * - Adds `id` and `role` properties to the `Session.user` object.
 * - Adds `id` and `role` properties to the `JWT` token.
 * 
 * This allows strict typing when accessing `session.user.role` or `token.role` in the app.
 */

import { DefaultSession } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    /**
     * Extended Session User type.
     */
    interface Session {
        user: {
            id: string
            role: string
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    /**
     * Extended JWT type.
     */
    interface JWT extends DefaultJWT {
        id: string
        role: string
    }
}

