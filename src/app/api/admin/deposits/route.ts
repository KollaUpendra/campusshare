import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const deposits = await db.depositRequest.findMany({
      where: status ? { status } : {},
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(deposits);
  } catch (error) {
    console.error("[ADMIN_DEPOSITS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
