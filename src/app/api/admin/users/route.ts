import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import db from "@/infrastructure/db/client";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const users = await db.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                isBlocked: true,
                coins: true,
                pendingFine: true,
                createdAt: true,
                _count: {
                    select: {
                        items: true,
                        bookings: true,
                        complaints: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("[ADMIN_USERS_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const body = await req.json();
        const { userId, action } = body; // action: 'toggleRole' | 'toggleBlock'

        if (!userId || !action) {
            return new NextResponse("Missing userId or action", { status: 400 });
        }

        // Prevent admin from modifying themselves
        if (userId === session.user.id) {
            return new NextResponse("Cannot modify your own account", { status: 400 });
        }

        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        if (action === "toggleRole") {
            const newRole = user.role === "admin" ? "student" : "admin";
            const updated = await db.user.update({
                where: { id: userId },
                data: { role: newRole },
            });
            return NextResponse.json({ role: updated.role });
        }

        if (action === "toggleBlock") {
            const updated = await db.user.update({
                where: { id: userId },
                data: { isBlocked: !user.isBlocked },
            });
            return NextResponse.json({ isBlocked: updated.isBlocked });
        }

        return new NextResponse("Invalid action", { status: 400 });
    } catch (error) {
        console.error("[ADMIN_USERS_PATCH]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
