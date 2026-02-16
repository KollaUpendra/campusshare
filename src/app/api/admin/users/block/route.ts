import { NextResponse } from "next/server";
import db from "@/infrastructure/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { userId, isBlocked } = body;

        if (!userId) {
            return new NextResponse("Missing User ID", { status: 400 });
        }

        await db.user.update({
            where: { id: userId },
            data: { isBlocked }
        });

        return NextResponse.json({ message: "User updated" });

    } catch (error: unknown) {
        console.error("[ADMIN_BLOCK_USER]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
