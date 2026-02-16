import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import db from "@/infrastructure/db/client";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const body = await req.json();
        const { itemId } = body;

        if (!itemId) {
            return new NextResponse("Missing itemId", { status: 400 });
        }

        const item = await db.item.findUnique({ where: { id: itemId } });
        if (!item) {
            return new NextResponse("Item not found", { status: 404 });
        }

        const newStatus = item.status === "active" ? "inactive" : "active";
        const updated = await db.item.update({
            where: { id: itemId },
            data: { status: newStatus },
        });

        return NextResponse.json({ status: updated.status });
    } catch (error) {
        console.error("[ADMIN_ITEMS_PATCH]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get("itemId");

        if (!itemId) {
            return new NextResponse("Missing itemId", { status: 400 });
        }

        await db.item.delete({ where: { id: itemId } });

        return NextResponse.json({ deleted: true });
    } catch (error) {
        console.error("[ADMIN_ITEMS_DELETE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
