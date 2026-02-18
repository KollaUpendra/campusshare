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
        const { itemId } = body;

        if (!itemId) {
            return new NextResponse("Missing Item ID", { status: 400 });
        }

        // Start Transaction
        const transactionResult = await db.$transaction(async (tx) => {
            // 1. Fetch Item and Buyer
            const item = await tx.item.findUnique({
                where: { id: itemId },
                include: { owner: true }
            });

            if (!item) {
                throw new Error("Item not found");
            }

            if (item.status !== "active") {
                throw new Error("Item is no longer available");
            }

            if (item.type !== "Sell") {
                throw new Error("Item is not for sale");
            }

            if (item.ownerId === session.user.id) {
                throw new Error("Cannot buy your own item");
            }

            const buyer = await tx.user.findUnique({
                where: { id: session.user.id }
            });

            if (!buyer) {
                throw new Error("Buyer not found");
            }

            if (buyer.coins < item.price) {
                throw new Error(`Insufficient coins. You need ${item.price} coins.`);
            }

            // 2. Process Transfers
            // Deduct from Buyer
            await tx.user.update({
                where: { id: buyer.id },
                data: { coins: { decrement: item.price } }
            });

            // Calculate Service Charge
            const settings = await tx.systemSettings.findFirst();
            const serviceChargePercent = settings?.sellServiceChargePercent || 0;
            const serviceCharge = (item.price * serviceChargePercent) / 100;
            const sellerPayout = item.price - serviceCharge;

            // Credit Owner (minus service charge)
            await tx.user.update({
                where: { id: item.ownerId },
                data: { coins: { increment: sellerPayout } }
            });

            // 3. Mark Item as Sold
            await tx.item.update({
                where: { id: item.id },
                data: { status: "sold" }
            });

            // 4. Create Transaction Record
            const transaction = await tx.transaction.create({
                data: {
                    amount: item.price,
                    type: "PURCHASE",
                    status: "COMPLETED",
                    fromUserId: buyer.id,
                    toUserId: item.ownerId,
                    itemId: item.id,
                    platformFee: serviceCharge,
                }
            });

            return transaction;
        });

        return NextResponse.json(transactionResult);

    } catch (error: unknown) {
        console.error("[TRANSACTION_BUY]", error);
        const message = error instanceof Error ? error.message : "Transaction failed";
        return new NextResponse(message, { status: 400 });
    }
}
