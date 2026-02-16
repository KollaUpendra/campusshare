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

        const ownerBookings = await db.booking.findMany({
            where: {
                item: {
                    ownerId: session.user.id
                }
            },
            include: {
                item: {
                    select: { title: true, image: true, images: true }
                },
                borrower: {
                    select: { name: true, image: true, email: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const formatted = ownerBookings.map(b => ({
            id: b.id,
            itemId: b.itemId,
            itemTitle: b.item.title,
            itemImage: b.item.images?.[0] || b.item.image,
            borrowerName: b.borrower.name,
            borrowerImage: b.borrower.image,
            borrowerEmail: b.borrower.email,
            date: b.date,
            timeSlot: b.timeSlot,
            status: b.status,
            createdAt: b.createdAt
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        console.error("[OWNER_BOOKINGS_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
