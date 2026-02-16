/**
 * @file route.ts
 * @description API Handler for individual Booking operations.
 * @module App/API/Bookings/[id]
 * 
 * Supported Methods:
 * - PATCH: Update booking status (accept/reject). Owner-only.
 * 
 * Side Effects:
 * - Creates a notification for the borrower upon status change.
 */

import { NextResponse } from "next/server";
import db from "@/infrastructure/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";

/**
 * PATCH Handler for Booking
 * Updates a booking's status to "accepted" or "rejected".
 * Only the owner of the item can update the booking status.
 * 
 * @param {Request} req - JSON payload { status: "accepted" | "rejected" }.
 * @param {object} params - Route params containing booking ID.
 * @returns {NextResponse} Updated booking object or error.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        if (!status || !["accepted", "rejected"].includes(status)) {
            return new NextResponse("Invalid status", { status: 400 });
        }

        const booking = await db.booking.findUnique({
            where: { id },
            include: { item: true }
        });

        if (!booking) {
            return new NextResponse("Booking not found", { status: 404 });
        }

        // Verify ownership
        if (booking.item.ownerId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // Prevent re-processing already finalized bookings
        if (booking.status !== "pending") {
            return new NextResponse(`Booking already ${booking.status}`, { status: 400 });
        }

        const updatedBooking = await db.booking.update({
            where: { id },
            data: { status }
        });

        await db.notification.create({
            data: {
                userId: booking.borrowerId,
                message: `Your booking request for ${booking.item.title} has been ${status}.`
            }
        });

        return NextResponse.json(updatedBooking);

    } catch (error) {
        console.error("[BOOKING_PATCH]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
