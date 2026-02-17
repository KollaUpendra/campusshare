import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const myRentals = await db.booking.findMany({
            where: {
                borrowerId: session.user.id,
                status: { in: ["PENDING", "ACCEPTED", "COMPLETED", "pending", "accepted", "completed"] }
            },
            include: {
                item: {
                    select: {
                        title: true,
                        image: true, // Legacy thumbnail
                        images: true, // New images array
                        owner: {
                            select: { name: true, image: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const formatted = myRentals.map(b => ({
            id: b.id,
            itemId: b.itemId,
            itemTitle: b.item.title,
            itemImage: b.item.images?.[0] || b.item.image,
            ownerName: b.item.owner.name,
            ownerImage: b.item.owner.image,
            date: b.date,
            timeSlot: b.timeSlot,
            status: b.status,
            createdAt: b.createdAt
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        console.error("[MY_RENTALS_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
