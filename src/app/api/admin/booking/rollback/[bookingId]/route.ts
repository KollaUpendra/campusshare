import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import db from "@/infrastructure/db/client";

/**
 * POST /admin/booking/rollback/[bookingId]
 * 
 * Atomic rollback: refund renter, deduct owner, create refund transactions,
 * booking→CANCELLED, associated complaint→ACTION_TAKEN.
 * Prevents double rollback via status check.
 */
export async function POST(
    req: Request,
    props: { params: Promise<{ bookingId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { bookingId } = await props.params;

        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: {
                item: true,
                borrower: true
            }
        });

        if (!booking) return new NextResponse("Booking not found", { status: 404 });

        // Prevent double rollback
        if (booking.status === "CANCELLED") {
            return new NextResponse("Booking has already been rolled back", { status: 400 });
        }

        // Only rollback ACCEPTED or COMPLETED bookings (coins were transferred)
        if (!["ACCEPTED", "COMPLETED", "accepted", "completed"].includes(booking.status)) {
            return new NextResponse("Can only rollback accepted or completed bookings", { status: 400 });
        }

        const rentCost = (booking.item as any).rentCoins || 0;
        const renter = booking.borrower;
        const ownerId = booking.item.ownerId;

        // Atomic rollback transaction
        const result = await db.$transaction(async (tx: any) => {
            // 1. Refund Renter
            const updatedRenter = await tx.user.update({
                where: { id: renter.id },
                data: { coins: { increment: rentCost } }
            });

            // 2. Deduct Owner (protect against negative — set to 0 minimum)
            const owner = await tx.user.findUnique({ where: { id: ownerId }, select: { coins: true } });
            const ownerNewCoins = Math.max(0, (owner?.coins || 0) - rentCost);
            const updatedOwner = await tx.user.update({
                where: { id: ownerId },
                data: { coins: ownerNewCoins }
            });

            // 3. Create Refund Transaction — Renter Credit
            await tx.transaction.create({
                data: {
                    amount: rentCost,
                    type: "REFUND",
                    fromUserId: ownerId,
                    toUserId: renter.id,
                    itemId: booking.itemId,
                    referenceId: bookingId,
                    balanceAfter: updatedRenter.coins,
                    status: "COMPLETED"
                }
            });

            // 4. Create Refund Transaction — Owner Debit
            await tx.transaction.create({
                data: {
                    amount: -rentCost,
                    type: "REFUND",
                    fromUserId: ownerId,
                    toUserId: renter.id,
                    itemId: booking.itemId,
                    referenceId: bookingId,
                    balanceAfter: updatedOwner.coins,
                    status: "COMPLETED"
                }
            });

            // 5. Booking → CANCELLED
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: "CANCELLED" }
            });

            // 6. Item → AVAILABLE (reset to marketplace)
            await tx.item.update({
                where: { id: booking.itemId },
                data: { status: "AVAILABLE" }
            });

            // 7. Any associated complaints → ACTION_TAKEN
            await tx.complaint.updateMany({
                where: { bookingId, status: { notIn: ["REJECTED", "ACTION_TAKEN"] } },
                data: { status: "ACTION_TAKEN", resolutionAction: "ROLLBACK" }
            });

            // 8. Admin Action Log
            await tx.adminActionLog.create({
                data: {
                    adminId: session.user.id,
                    actionType: "ROLLBACK",
                    targetUserId: renter.id,
                    bookingId,
                    coinsChanged: rentCost,
                    notes: `Rollback: ${rentCost} coins refunded to renter, deducted from owner`
                }
            });

            // 9. Notify both parties
            await tx.notification.create({
                data: { userId: renter.id, message: `Admin has rolled back your booking for ${booking.item.title}. ${rentCost} coins refunded.` }
            });
            await tx.notification.create({
                data: { userId: ownerId, message: `Admin has rolled back the booking for ${booking.item.title}. ${rentCost} coins deducted.` }
            });

            return { message: "Booking rolled back successfully", coinsRefunded: rentCost };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("[ADMIN_BOOKING_ROLLBACK]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
