/**
 * @file route.ts
 * @description NextAuth API Route Handler.
 * @module App/API/Auth
 * 
 * Purpose:
 * - Handles all authentication requests (SignIn, SignOut, Session, etc.).
 * - dynamic route `[...nextauth]` captures all auth-related paths.
 */

import NextAuth from "next-auth"
import { authOptions } from "@/config/auth.config"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
