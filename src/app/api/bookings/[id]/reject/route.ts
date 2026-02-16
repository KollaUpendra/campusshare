import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Blocked-user guard
        const user = await db.user.findUnique({ where: { id: session.user.id }, select: { isBlocked: true } });
        if (user?.isBlocked) return new NextResponse("Your account has been blocked by admin", { status: 403 });

        const { id: bookingId } = await props.params;

        // Fetch Booking
        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: { item: true }
        });

        if (!booking) {
            return new NextResponse("Booking not found", { status: 404 });
        }

        // Verify Owner
        if (booking.item.ownerId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        if (booking.status !== "pending" && booking.status !== "PENDING") {
            return new NextResponse("Can only reject pending bookings", { status: 400 });
        }

        // --- ATOMIC REJECTION ---
        const result = await db.$transaction(async (tx: any) => {
            // 1. Update Booking -> REJECTED
            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: { status: "REJECTED" }
            });

            // 2. Update Item -> AVAILABLE (Make it public again)
            await tx.item.update({
                where: { id: booking.itemId },
                data: { status: "AVAILABLE" }
            });

            // 3. Notify Renter
            await tx.notification.create({
                data: {
                    userId: booking.borrowerId,
                    message: `Your booking for ${booking.item.title} was rejected.`
                }
            });

            return updatedBooking;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("[BOOKING_REJECT]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
