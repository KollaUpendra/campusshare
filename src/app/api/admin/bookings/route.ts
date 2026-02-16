import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const bookings = await db.booking.findMany({
            include: {
                item: {
                    select: { title: true, image: true, ownerId: true, owner: { select: { name: true } } }
                },
                borrower: {
                    select: { name: true, email: true, image: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("[ADMIN_BOOKINGS_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
