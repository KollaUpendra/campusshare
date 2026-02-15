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

        // Fetch Booking
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

        // Verify User is the Borrower
        if (booking.borrowerId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // Verify Status
        if (booking.status !== "ACCEPTED") {
            return new NextResponse("Booking is not in ACCEPTED state", { status: 400 });
        }

        const item = booking.item;
        const cost = item.price; // Use item price (rent per day or sell price)
        
        // Renter/Buyer Balance Check
        const renter = await db.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, coins: true }
        });

        if (!renter) return new NextResponse("User not found", { status: 404 });

        if (renter.coins < cost) {
             return new NextResponse(`Insufficient coins. You need ${cost} coins.`, { status: 400 });
        }

        // --- ATOMIC TRANSACTION ---
        const result = await db.$transaction(async (tx) => {
            // 1. Deduct from Renter
            const updatedRenter = await tx.user.update({
                where: { id: renter.id },
                data: { coins: { decrement: cost } }
            });

            // 2. Add to Owner
            const updatedOwner = await tx.user.update({
                where: { id: item.ownerId },
                data: { coins: { increment: cost } }
            });

            // 3. Create Transaction Records
            // Debit
            await tx.transaction.create({
                data: {
                    amount: -cost,
                    type: item.type === 'Sell' ? 'PURCHASE' : 'RENT_PAYMENT',
                    fromUserId: renter.id,
                    toUserId: item.ownerId,
                    itemId: item.id,
                    referenceId: bookingId,
                    balanceAfter: updatedRenter.coins,
                    status: "COMPLETED"
                }
            });

            // Credit
            await tx.transaction.create({
                data: {
                    amount: cost,
                    type: item.type === 'Sell' ? 'PURCHASE' : 'RENT_PAYMENT',
                    fromUserId: renter.id,
                    toUserId: item.ownerId,
                    itemId: item.id,
                    referenceId: bookingId,
                    balanceAfter: updatedOwner.coins,
                    status: "COMPLETED"
                }
            });

            // 4. Update Booking Status -> COMPLETED
            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: { status: "COMPLETED" }
            });

            // 5. Update Item Status -> SOLD (if Sell) or BOOKED (if Rent)
            // Note: Currently 'Rent' items just toggle status, but usually 'BOOKED' is fine.
            // If selling, we mark as 'sold'.
            if (item.type === 'Sell') {
                await tx.item.update({
                    where: { id: item.id },
                    data: { status: "sold" }
                });
            } else {
                 await tx.item.update({
                    where: { id: item.id },
                    data: { status: "BOOKED" }
                });
            }

            // 6. Notify Owner
            await tx.notification.create({
                data: {
                    userId: item.ownerId,
                    message: `Payment received for ${item.title}! ${cost} coins added.`
                }
            });

            return updatedBooking;
        });

        return NextResponse.json(result);

    } catch (error: unknown) {
        console.error("[BOOKING_PAY]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
