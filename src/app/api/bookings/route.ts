import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { itemId, date } = body;

        if (!itemId || !date) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const item = await db.item.findUnique({
            where: { id: itemId }
        });

        if (!item) {
            return new NextResponse("Item not found", { status: 404 });
        }

        if (item.ownerId === session.user.id) {
            return new NextResponse("Cannot book your own item", { status: 400 });
        }

        // Check if already booked for that date
        const existingBooking = await db.booking.findFirst({
            where: {
                itemId,
                date,
                status: { not: "rejected" } // Only prevent if accepted or pending
            }
        });

        if (existingBooking) {
            return new NextResponse("Item already booked for this date", { status: 409 });
        }

        const newBooking = await db.booking.create({
            data: {
                itemId,
                borrowerId: session.user.id,
                date,
                status: "pending"
            }
        });

        // Create Notification for Owner
        await db.notification.create({
            data: {
                userId: item.ownerId,
                message: `New booking request for ${item.title} on ${date} by ${session.user.name || "a user"}`
            }
        });

        return NextResponse.json(newBooking);
    } catch (error) {
        console.error("[BOOKING_POST]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // 'my-bookings' (items I booked) or 'incoming' (requests for my items)

        if (type === 'incoming') {
            const bookings = await db.booking.findMany({
                where: {
                    item: {
                        ownerId: session.user.id
                    }
                },
                include: {
                    item: true,
                    borrower: {
                        select: { name: true, email: true, image: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(bookings);
        } else {
            // Default: My Bookings (items I requested)
            const bookings = await db.booking.findMany({
                where: {
                    borrowerId: session.user.id
                },
                include: {
                    item: {
                        include: {
                            owner: { select: { name: true, image: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(bookings);
        }

    } catch (error) {
        console.error("[BOOKINGS_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
