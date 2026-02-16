import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

/**
 * GET /admin/analytics
 * 
 * Returns aggregated platform metrics:
 * - total users, blocked users
 * - active rentals, completed bookings, pending bookings
 * - open disputes, resolved disputes
 * - total coins in circulation
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const [
            totalUsers,
            blockedUsers,
            activeRentals,
            pendingBookings,
            completedBookings,
            cancelledBookings,
            openDisputes,
            resolvedDisputes,
            totalItems,
            availableItems,
        ] = await Promise.all([
            db.user.count(),
            db.user.count({ where: { isBlocked: true } }),
            db.booking.count({ where: { status: { in: ["ACCEPTED", "accepted"] } } }),
            db.booking.count({ where: { status: { in: ["PENDING", "pending"] } } }),
            db.booking.count({ where: { status: { in: ["COMPLETED", "completed"] } } }),
            db.booking.count({ where: { status: "CANCELLED" } }),
            db.complaint.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
            db.complaint.count({ where: { status: { in: ["RESOLVED", "ACTION_TAKEN"] } } }),
            db.item.count(),
            db.item.count({ where: { status: { in: ["active", "AVAILABLE"] } } }),
        ]);

        return NextResponse.json({
            users: {
                total: totalUsers,
                blocked: blockedUsers,
                active: totalUsers - blockedUsers
            },
            bookings: {
                activeRentals,
                pending: pendingBookings,
                completed: completedBookings,
                cancelled: cancelledBookings
            },
            disputes: {
                open: openDisputes,
                resolved: resolvedDisputes
            },
            items: {
                total: totalItems,
                available: availableItems
            }
        });
    } catch (error) {
        console.error("[ADMIN_ANALYTICS]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
