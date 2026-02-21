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

        // Calculate Cost dynamically based on days
        let cost = item.price;
        const bookingAny = booking as any;
        if (item.type === 'Rent' && bookingAny.startDate && bookingAny.endDate) {
            const start = new Date(bookingAny.startDate);
            const end = new Date(bookingAny.endDate);
            const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            cost = item.price * duration;
        } else if (bookingAny.totalPrice) {
            cost = bookingAny.totalPrice; // Fallback if saved
        }

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

            // Calculate Service Charge
            let settings: any = null;
            if ((tx as any).systemSettings) {
                settings = await (tx as any).systemSettings.findFirst();
            }
            const isSell = item.type === 'Sell';
            const serviceChargePercent = isSell
                ? (settings?.sellServiceChargePercent || 0)
                : (settings?.rentServiceChargePercent || 0);

            const serviceCharge = (cost * serviceChargePercent) / 100;
            const ownerPayout = cost - serviceCharge;

            // 2. Add to Owner (minus service charge)
            const updatedOwner = await tx.user.update({
                where: { id: item.ownerId },
                data: { coins: { increment: ownerPayout } }
            });

            // 3. Create Transaction Record
            await tx.transaction.create({
                data: {
                    amount: cost,
                    type: item.type === 'Sell' ? 'PURCHASE' : 'RENT_PAYMENT',
                    fromUserId: renter.id,
                    toUserId: item.ownerId,
                    itemId: item.id,
                    referenceId: bookingId,
                    platformFee: serviceCharge,
                    status: "COMPLETED"
                }
            });

            // 4. Update Booking Status -> COMPLETED (Atomic Check)
            // Use updateMany to ensure we only update if status is still ACCEPTED
            const updateResult = await tx.booking.updateMany({
                where: {
                    id: bookingId,
                    status: "ACCEPTED"
                },
                data: { status: "COMPLETED" }
            });

            if (updateResult.count === 0) {
                throw new Error("Booking is no longer in ACCEPTED state. Payment failed.");
            }

            // Return the updated booking structure (simulated since updateMany doesn't return it)
            const updatedBooking = { ...booking, status: "COMPLETED" };

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
                    message: `Payment received for ${item.title}! ${ownerPayout.toFixed(2)} coins added (after ${serviceChargePercent}% fee).`
                }
            });

            return updatedBooking;
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("[BOOKING_PAY]", error);
        require("fs").writeFileSync("payment_error_log.txt", error?.stack || String(error));
        return new NextResponse(`Internal Server Error: ${error?.message || "Unknown"}`, { status: 500 });
    }
}
