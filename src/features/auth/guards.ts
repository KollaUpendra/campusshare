/**
 * @file guards.ts
 * @description Reusable auth & authorization guard helpers for API routes.
 * Returns null if the check passes, or a NextResponse error if it fails.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import db from "@/infrastructure/db/client";

export interface AuthResult {
    session: any;
    userId: string;
}

/**
 * Validates that the request has an authenticated session.
 * Returns { session, userId } on success, or a NextResponse error.
 */
export async function requireAuth(): Promise<AuthResult | NextResponse> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    return { session, userId: session.user.id };
}

/**
 * Checks that the user is not blocked. Call AFTER requireAuth.
 * Returns the full user record on success, or a NextResponse error.
 */
export async function requireActiveUser(userId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, isBlocked: true, coins: true, pendingFine: true, name: true, role: true }
    });

    if (!user) {
        return new NextResponse("User not found", { status: 404 });
    }

    if (user.isBlocked) {
        return new NextResponse("Your account has been blocked by admin", { status: 403 });
    }

    return user;
}

/**
 * Checks that the user has admin role. Call AFTER requireAuth.
 * Returns a NextResponse error if not admin, or null if OK.
 */
export function requireAdmin(session: any): NextResponse | null {
    if (session.user?.role !== "admin") {
        return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }
    return null;
}
