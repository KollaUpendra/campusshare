import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
