/**
 * @file route.ts
 * @description API Handler for User Notifications.
 * @module App/API/Notifications
 * 
 * Supported Methods:
 * - GET: Fetch recent notifications for the logged-in user.
 */

import { NextResponse } from "next/server";
import db from "@/infrastructure/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";

/**
 * GET Handler for Notifications
 * Retrieves notifications for the current user.
 * 
 * Limitations:
 * - Currently limits to the most recent 20 notifications.
 * - Ordered by newest first.
 * 
 * @param {Request} req - The HTTP request object.
 * @returns {NextResponse} JSON list of notifications.
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const notifications = await db.notification.findMany({
            where: {
                userId: session.user.id,
                // Optional: filter unread only?
                // isRead: false 
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 20 // Limit to recent 20
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("[NOTIFICATIONS_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
