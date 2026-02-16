import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import db from "@/infrastructure/db/client";

/**
 * POST /admin/complaint/fine/[complaintId]
 * Body: { fineCoins: number }
 * 
 * Atomic fine: deduct from offender (renter/borrower), credit to other party.
 * If renter has insufficient coins, use pendingFine for the remainder.
 * Sets complaint → ACTION_TAKEN, resolutionAction → FINE.
 */
export async function POST(
    req: Request,
    props: { params: Promise<{ complaintId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { complaintId } = await props.params;
        const body = await req.json();
        const { fineCoins } = body;

        if (!fineCoins || fineCoins <= 0) {
            return new NextResponse("fineCoins must be a positive number", { status: 400 });
        }

        const complaint = await db.complaint.findUnique({
            where: { id: complaintId },
            include: {
                booking: {
                    include: {
                        item: true,
                        borrower: true
                    }
                }
            }
        });

        if (!complaint) return new NextResponse("Complaint not found", { status: 404 });

        // Prevent double fine
        if (complaint.status === "ACTION_TAKEN" && complaint.resolutionAction === "FINE") {
            return new NextResponse("Fine has already been applied to this complaint", { status: 400 });
        }

        const booking = complaint.booking;
        // The person being fined is the borrower (renter). Owner receives the fine.
        const finedUser = booking.borrower;
        const beneficiary = booking.item.ownerId;

        const finedUserCoins = (finedUser as any).coins || 0;
        const actualDeduction = Math.min(fineCoins, finedUserCoins);
        const pendingAmount = fineCoins - actualDeduction;

        const result = await db.$transaction(async (tx: any) => {
            // 1. Deduct from fined user (as much as possible)
            const updatedFined = await tx.user.update({
                where: { id: finedUser.id },
                data: {
                    coins: { decrement: actualDeduction },
                    pendingFine: { increment: pendingAmount }
                }
            });

            // 2. Credit to beneficiary (owner)
            const updatedBeneficiary = await tx.user.update({
                where: { id: beneficiary },
                data: { coins: { increment: actualDeduction } }
            });

            // 3. Wallet Transaction — Fine Debit
            await tx.transaction.create({
                data: {
                    amount: -actualDeduction,
                    type: "FINE",
                    fromUserId: finedUser.id,
                    toUserId: beneficiary,
                    referenceId: complaintId,
                    balanceAfter: updatedFined.coins,
                    status: "COMPLETED"
                }
            });

            // 4. Wallet Transaction — Fine Credit
            if (actualDeduction > 0) {
                await tx.transaction.create({
                    data: {
                        amount: actualDeduction,
                        type: "FINE",
                        fromUserId: finedUser.id,
                        toUserId: beneficiary,
                        referenceId: complaintId,
                        balanceAfter: updatedBeneficiary.coins,
                        status: "COMPLETED"
                    }
                });
            }

            // 5. Update Complaint
            await tx.complaint.update({
                where: { id: complaintId },
                data: {
                    status: "ACTION_TAKEN",
                    resolutionAction: "FINE",
                    adminNotes: `Fine of ${fineCoins} coins applied. Deducted: ${actualDeduction}, Pending: ${pendingAmount}`
                }
            });

            // 6. Admin Action Log
            await tx.adminActionLog.create({
                data: {
                    adminId: session.user.id,
                    actionType: "FINE",
                    targetUserId: finedUser.id,
                    bookingId: booking.id,
                    complaintId,
                    coinsChanged: fineCoins,
                    notes: `Fine: ${fineCoins} coins. Deducted: ${actualDeduction}. Pending: ${pendingAmount}`
                }
            });

            // 7. Notify fined user
            await tx.notification.create({
                data: {
                    userId: finedUser.id,
                    message: `Admin has applied a fine of ${fineCoins} coins. ${pendingAmount > 0 ? `${pendingAmount} coins added to pending fine.` : ''}`
                }
            });

            return {
                message: "Fine applied successfully",
                fineCoins,
                actualDeduction,
                pendingFine: pendingAmount
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("[ADMIN_COMPLAINT_FINE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
