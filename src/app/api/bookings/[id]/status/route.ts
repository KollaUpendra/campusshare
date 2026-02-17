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

        const { id: bookingId } = await props.params;
        const body = await req.json();
        const { status, action } = body;

        if (!["RECEIVED", "RETURNED", "RETURN_FLOW", "PENDING_OWNER_CONFIRMATION", "PENDING_BORROWER_CONFIRMATION", "SUCCESSFUL"].includes(status)) {
            return new NextResponse("Invalid status", { status: 400 });
        }

        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: { item: true }
        });

        if (!booking) {
            return new NextResponse("Booking not found", { status: 404 });
        }

        // Authorization Checks & Updates
        if (status === "RECEIVED") {
            // Only Borrower can mark as Received (Initial Handover)
            if (booking.borrowerId !== session.user.id) {
                return new NextResponse("Only borrower can mark as received", { status: 403 });
            }
            if (booking.status !== "COMPLETED") {
                return new NextResponse("Booking must be COMPLETED (Paid) to mark as received", { status: 400 });
            }
            
            // This is the first step: Borrower says "I got it".
            // So we just update the status to RECEIVED.
            const updated = await db.booking.update({
                where: { id: bookingId },
                data: { status: "RECEIVED" }
            });
            return NextResponse.json(updated);
        }

        if (status === "RETURN_FLOW") {
            // Handle Return Confirmation Logic
            const isOwner = booking.item.ownerId === session.user.id;
            const isBorrower = booking.borrowerId === session.user.id;

            if (!isOwner && !isBorrower) {
                return new NextResponse("Unauthorized", { status: 403 });
            }

            // action is already extracted from body at the top

            let updateData: any = {};

            if (isBorrower && action === "conf_returned") {
                updateData.isReturned = true;
            } else if (isOwner && action === "conf_received") {
                updateData.isReceived = true;
            } else {
                return new NextResponse("Invalid action or role", { status: 400 });
            }

            // Perform Update using Raw SQL to bypass outdated Prisma Client
            const updateField = isBorrower && action === "conf_returned" ? "isReturned" : "isReceived";
            
            // We need to use raw query because Prisma Client might not be regenerated yet
            await db.$executeRawUnsafe(
                `UPDATE "Booking" SET "${updateField}" = true, "status" = 'RETURN_FLOW' WHERE "id" = $1`,
                bookingId
            );

            // Fetch the updated booking to check both flags
            const updatedBookings = await db.$queryRawUnsafe<any[]>(
                `SELECT * FROM "Booking" WHERE "id" = $1`,
                bookingId
            );
            const updated = updatedBookings[0];

            // Check conditions for new statuses
            let newStatus = "RETURN_FLOW"; // Default if intermediate
            
            if (updated.isReturned && updated.isReceived) {
                newStatus = "SUCCESSFUL";
            } else if (updated.isReturned && !updated.isReceived) {
                newStatus = "PENDING_OWNER_CONFIRMATION";
            } else if (!updated.isReturned && updated.isReceived) {
                newStatus = "PENDING_BORROWER_CONFIRMATION";
            }

            // Update status
             await db.$executeRawUnsafe(
                `UPDATE "Booking" SET "status" = $1 WHERE "id" = $2`,
                newStatus,
                bookingId
            );
            
            // If Successful and Rent, set item back to Active
            if (newStatus === "SUCCESSFUL" && booking.item.type === "Rent") {
                await db.item.update({
                    where: { id: booking.item.id },
                    data: { status: "active" }
                });
            }
            
            return NextResponse.json({ ...updated, status: newStatus });
        }
        
         if (status === "RETURNED") {
              return new NextResponse("Use RETURN_FLOW for return logic", { status: 400 });
         }

        return new NextResponse("Invalid Request", { status: 400 });

    } catch (error) {
        console.error("[BOOKING_STATUS]", error);
        return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : "Unknown"}`, { status: 500 });
    }
}
