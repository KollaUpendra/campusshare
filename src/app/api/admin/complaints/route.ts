import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import db from "@/infrastructure/db/client";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const complaints = await db.complaint.findMany({
            include: {
                booking: {
                    include: {
                        item: { select: { title: true } },
                        borrower: { select: { name: true, email: true } }
                    }
                },
                complainer: {
                    select: { name: true, email: true, image: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(complaints);
    } catch (error) {
        console.error("[ADMIN_COMPLAINTS_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
