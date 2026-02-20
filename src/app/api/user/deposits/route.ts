import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { amount, upiId, message } = await req.json();
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || !upiId) {
      return new NextResponse("Amount and UPI ID are required", { status: 400 });
    }

    // Check user balance
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true }
    });

    if (!user || user.coins < withdrawAmount) {
      return new NextResponse("Insufficient balance for withdrawal", { status: 400 });
    }

    const depositRequest = await db.depositRequest.create({
      data: {
        userId: session.user.id,
        amount: withdrawAmount,
        upiId,
        message,
        status: "PENDING",
      },
    });

    return NextResponse.json(depositRequest);
  } catch (error) {
    console.error("[DEPOSIT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const deposits = await db.depositRequest.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(deposits);
  } catch (error) {
    console.error("[DEPOSIT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
