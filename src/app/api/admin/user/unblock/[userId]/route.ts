import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

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

        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        if (!user.isBlocked) {
            return new NextResponse("User is not blocked", { status: 400 });
        }

        await db.$transaction(async (tx: any) => {
            await tx.user.update({
                where: { id: userId },
                data: { isBlocked: false }
            });

            await tx.adminActionLog.create({
                data: {
                    adminId: session.user.id,
                    actionType: "UNBLOCK_USER",
                    targetUserId: userId,
                    notes: `Unblocked by ${session.user.name || session.user.email}`
                }
            });
        });

        return NextResponse.json({ message: "User unblocked", isBlocked: false });
    } catch (error) {
        console.error("[ADMIN_UNBLOCK_USER]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
