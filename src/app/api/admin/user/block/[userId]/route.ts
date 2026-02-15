import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import db from "@/infrastructure/db/client";

export async function PATCH(
    req: Request,
    props: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { userId } = await props.params;

        if (userId === session.user.id) {
            return new NextResponse("Cannot modify your own account", { status: 400 });
        }

        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        if (user.isBlocked) {
            return new NextResponse("User is already blocked", { status: 400 });
        }

        await db.$transaction(async (tx: any) => {
            await tx.user.update({
                where: { id: userId },
                data: { isBlocked: true }
            });

            await tx.adminActionLog.create({
                data: {
                    adminId: session.user.id,
                    actionType: "BLOCK_USER",
                    targetUserId: userId,
                    notes: `Blocked by ${session.user.name || session.user.email}`
                }
            });
        });

        return NextResponse.json({ message: "User blocked", isBlocked: true });
    } catch (error) {
        console.error("[ADMIN_BLOCK_USER]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
