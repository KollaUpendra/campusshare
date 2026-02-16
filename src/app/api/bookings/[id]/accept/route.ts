import { NextResponse } from "next/server";
import db from "@/infrastructure/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Blocked-user guard for owner
        const owner = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true, isBlocked: true, coins: true } });
        if (!owner) return new NextResponse("User not found", { status: 404 });
        if (owner.isBlocked) return new NextResponse("Your account has been blocked by admin", { status: 403 });

        const { id: bookingId } = await props.params;

        // Fetch Booking with Item and Borrower — use SELECT FOR UPDATE pattern via transaction
        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: {
                item: true,
                borrower: true
            }
        });

        if (!booking) {
            return new NextResponse("Booking not found", { status: 404 });
        }

        // Verify Owner
        if (booking.item.ownerId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // Verify Status — prevents double acceptance
        if (booking.status !== "pending" && booking.status !== "PENDING") {
            return new NextResponse("Booking is not pending", { status: 400 });
        }

        const item = booking.item;
        const rentCost = (item as any).rentCoins || 0;
        const renter = booking.borrower;

        const body = await req.json().catch(() => ({}));
        const { pickupLocation } = body;

        // --- ATOMIC TRANSACTION: STATUS UPDATE ONLY ---
        const result = await db.$transaction(async (tx) => {
            // 1. Update Booking Status -> ACCEPTED & Save Pickup Loc
            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: { 
                    status: "ACCEPTED",
                    pickupLocation: pickupLocation || null
                } as any
            });

            // 2. Notify Renter
            await tx.notification.create({
                data: {
                    userId: renter.id,
                    message: `Your request for ${item.title} has been ACCEPTED! Pickup: ${pickupLocation || 'Contact Owner'}. Please proceed to Pay.`
                }
            });

            return updatedBooking;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("[BOOKING_ACCEPT]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
