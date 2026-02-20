import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status, adminMessage } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const depositRequest = await db.depositRequest.findUnique({
      where: { id: id },
    });

    if (!depositRequest) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (depositRequest.status !== "PENDING") {
      return new NextResponse("Request already processed", { status: 400 });
    }

    // Transactional update
    const result = await db.$transaction(async (tx) => {
      const updatedRequest = await tx.depositRequest.update({
        where: { id: id },
        data: {
          status,
          adminMessage,
        },
      });

      if (status === "APPROVED") {
        // Double check user balance again at time of approval
        const user = await tx.user.findUnique({
          where: { id: depositRequest.userId },
          select: { coins: true }
        });

        if (!user || user.coins < depositRequest.amount) {
          throw new Error("Insufficient user balance at time of approval");
        }

        // Update user coins (DECREMENT for withdrawal)
        await tx.user.update({
          where: { id: depositRequest.userId },
          data: {
            coins: {
              decrement: depositRequest.amount,
            },
          },
        });

        // Add to Transaction table (Debit from user perspective)
        await tx.transaction.create({
          data: {
            amount: depositRequest.amount,
            type: "WITHDRAWAL",
            status: "COMPLETED",
            fromUserId: depositRequest.userId, // Money leaving user
            referenceId: updatedRequest.id,
          },
        });
      }

      // 1. Create Admin Action Log
      await tx.adminActionLog.create({
        data: {
          adminId: session.user.id,
          actionType: status === "APPROVED" ? "APPROVE_WITHDRAWAL" : "REJECT_WITHDRAWAL",
          targetUserId: depositRequest.userId,
          notes: `Withdrawal of ₹${depositRequest.amount}. Admin message: ${adminMessage || "None"}`,
        },
      });

      // 2. Create Notification for User
      await tx.notification.create({
        data: {
          userId: depositRequest.userId,
          message: status === "APPROVED" 
            ? `Your withdrawal request of ₹${depositRequest.amount} has been approved and processed! ${adminMessage ? `Message: ${adminMessage}` : ""}`
            : `Your withdrawal request of ₹${depositRequest.amount} was rejected. ${adminMessage ? `Reason: ${adminMessage}` : ""}`,
        },
      });

      return updatedRequest;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[ADMIN_DEPOSITS_PUT]", error);
    if (error.message === "Insufficient user balance at time of approval") {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
