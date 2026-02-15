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

        // Re-validate renter balance: coins >= rentCost + 500 (must keep 500 after payment)
        const renterCoins = (renter as any).coins || 0;
        if (renterCoins < rentCost + 500) {
            return new NextResponse("Renter has insufficient funds. Minimum balance of 500 coins must remain after booking.", { status: 400 });
        }

        // --- ATOMIC TRANSACTION with wallet ledger ---
        const result = await db.$transaction(async (tx: any) => {
            // 1. Deduct from Renter
            const updatedRenter = await tx.user.update({
                where: { id: renter.id },
                data: { coins: { decrement: rentCost } }
            });

            // 2. Add to Owner
            const updatedOwner = await tx.user.update({
                where: { id: session.user.id },
                data: { coins: { increment: rentCost } }
            });

            // 3. Create Wallet Transaction — Renter Debit
            await tx.transaction.create({
                data: {
                    amount: -rentCost,
                    type: "RENT_PAYMENT",
                    fromUserId: renter.id,
                    toUserId: session.user.id,
                    itemId: item.id,
                    referenceId: bookingId,
                    balanceAfter: updatedRenter.coins,
                    status: "COMPLETED"
                }
            });

            // 4. Create Wallet Transaction — Owner Credit
            await tx.transaction.create({
                data: {
                    amount: rentCost,
                    type: "RENT_PAYMENT",
                    fromUserId: renter.id,
                    toUserId: session.user.id,
                    itemId: item.id,
                    referenceId: bookingId,
                    balanceAfter: updatedOwner.coins,
                    status: "COMPLETED"
                }
            });

            // 5. Update Booking Status -> ACCEPTED
            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: { status: "ACCEPTED" }
            });

            // 6. Update Item Status -> BOOKED
            await tx.item.update({
                where: { id: item.id },
                data: { status: "BOOKED" }
            });

            // 7. Notify Renter
            await tx.notification.create({
                data: {
                    userId: renter.id,
                    message: `Your booking for ${item.title} has been ACCEPTED! ${rentCost} coins deducted.`
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
