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

        // Blocked-user guard
        const user = await db.user.findUnique({ where: { id: session.user.id }, select: { isBlocked: true } });
        if (user?.isBlocked) return new NextResponse("Your account has been blocked by admin", { status: 403 });

        const body = await req.json();
        const { bookingId, description } = body;

        if (!bookingId || !description) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        if (description.length > 2000) {
            return new NextResponse("Description too long (max 2000 chars)", { status: 400 });
        }

        // Fetch Booking
        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: { item: true }
        });

        if (!booking) {
            return new NextResponse("Booking not found", { status: 404 });
        }

        // Verify Participant (Borrower or Owner)
        if (booking.borrowerId !== session.user.id && booking.item.ownerId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // Verify Booking Status (Must be ACCEPTED or COMPLETED)
        if (!["ACCEPTED", "COMPLETED", "accepted", "completed"].includes(booking.status)) {
            return new NextResponse("Cannot complain about this booking stage", { status: 400 });
        }

        // Prevent duplicate complaints from same user on same booking
        const existing = await db.complaint.findFirst({
            where: { bookingId, complainerId: session.user.id }
        });
        if (existing) {
            return new NextResponse("You have already filed a complaint for this booking", { status: 409 });
        }

        // Create Complaint
        const complaint = await db.complaint.create({
            data: {
                bookingId,
                complainerId: session.user.id,
                description,
                status: "OPEN",
                resolutionAction: "NONE"
            }
        });

        return NextResponse.json(complaint);
    } catch (error) {
        console.error("[COMPLAINTS_POST]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
