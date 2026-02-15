import db from "@/lib/db";

/**
 * Checks for expired bookings and items and updates their status.
 * intended to be called periodically or on key API hits.
 */
export async function processExpirations() {
    try {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // 1. Expire Items not booked by date
        // Find items with specific date < today AND status is available/active
        // Note: Prisma filter limitations with string dates might require fetching candidates first or raw query.
        // For safety and simplicity in this setup, we'll fetch potentially expired active items.
        // Optimization: In a real app, use a cron job with raw SQL.

        /* 
         * Logic:
         * If Item.date < today AND Item.status IN ['active', 'AVAILABLE']
         * -> Set Item.status = 'EXPIRED'
         */

        // This is a "Lazy" check. We mainly care about ensuring invalid items aren't booked.
        // The GET /items API already filters them out visually.
        // But for DB consistency:

        // 2. Complete Accepted Bookings that have passed
        // If Booking.date < today AND Booking.status = 'ACCEPTED'
        // -> Booking.status = 'COMPLETED'
        // -> Item.status = 'COMPLETED'

        const expiredAcceptedBookings = await db.booking.findMany({
            where: {
                status: "ACCEPTED",
                date: { lt: todayStr }
            }
        });

        for (const booking of expiredAcceptedBookings) {
            await db.$transaction([
                db.booking.update({
                    where: { id: booking.id },
                    data: { status: "COMPLETED" }
                }),
                db.item.update({
                    where: { id: booking.itemId },
                    data: { status: "COMPLETED" }
                })
            ]);
        }

        // 3. Expire Pending Bookings that have passed
        // If Booking.date < today AND Booking.status = 'PENDING'
        // -> Booking.status = 'EXPIRED' (or CANCELLED/REJECTED)
        // -> Item.status = 'EXPIRED' (if it was reserved) or 'AVAILABLE' (if generally available)
        // Per requirements: "If time passes and booking not accepted: item.status = EXPIRED"

        const expiredPendingBookings = await db.booking.findMany({
            where: {
                status: { in: ["pending", "PENDING"] },
                date: { lt: todayStr }
            }
        });

        for (const booking of expiredPendingBookings) {
            await db.$transaction([
                db.booking.update({
                    where: { id: booking.id },
                    data: { status: "EXPIRED" } // Using EXPIRED as status for clarity
                }),
                db.item.update({
                    where: { id: booking.itemId },
                    data: { status: "EXPIRED" }
                })
            ]);
        }

    } catch (error) {
        console.error("[PROCESS_EXPIRATIONS]", error);
    }
}
