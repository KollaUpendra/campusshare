
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch bookings that are in a "PENDING_CONFIRMATION" state
        // We use raw SQL or Prisma findMany. Since status is just a string, findMany is fine if schema is updated, 
        // but to be safe with "outdated client" issues, we can use raw or just standard Prisma if we trust it partially.
        // Let's try standard Prisma first, if it fails we fallback to raw in a fix.
        // Actually, let's use raw `queryRaw` to be 100% safe given previous issues.
        
        const incompleteBookings = await db.$queryRaw`
            SELECT 
                b.id, 
                b.status, 
                b."createdAt", 
                i.title as "itemTitle", 
                u_owner.name as "ownerName", 
                u_borrower.name as "borrowerName"
            FROM "Booking" b
            JOIN "Item" i ON "b"."itemId" = i.id
            JOIN "User" u_owner ON "i"."ownerId" = u_owner.id
            JOIN "User" u_borrower ON "b"."borrowerId" = u_borrower.id
            WHERE b.status IN ('PENDING_OWNER_CONFIRMATION', 'PENDING_BORROWER_CONFIRMATION')
            ORDER BY b."createdAt" ASC
        `;

        return NextResponse.json(incompleteBookings);
    } catch (error) {
        console.error("[ADMIN_INCOMPLETE_TXNS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
