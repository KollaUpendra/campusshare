export const dynamic = "force-dynamic";

import db from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export default async function AdminBookingsPage() {
    const bookings = await db.booking.findMany({
        include: {
            item: { select: { title: true } },
            borrower: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const pendingCount = bookings.filter((b) => b.status === "pending").length;
    const acceptedCount = bookings.filter((b) => b.status === "accepted").length;
    const rejectedCount = bookings.filter((b) => b.status === "rejected").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Booking Overview</h1>
                <div className="flex gap-2">
                    <Badge variant="outline">🕓 {pendingCount} Pending</Badge>
                    <Badge variant="default">✅ {acceptedCount} Accepted</Badge>
                    <Badge variant="secondary">❌ {rejectedCount} Rejected</Badge>
                </div>
            </div>

            <div className="border rounded-lg bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="text-left p-3 font-medium">Item</th>
                                <th className="text-left p-3 font-medium">Borrower</th>
                                <th className="text-left p-3 font-medium">Date</th>
                                <th className="text-left p-3 font-medium">Status</th>
                                <th className="text-left p-3 font-medium">Requested</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                                        No bookings yet
                                    </td>
                                </tr>
                            )}
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="p-3 font-medium">{booking.item.title}</td>
                                    <td className="p-3">
                                        <div>
                                            <p>{booking.borrower.name || "Unnamed"}</p>
                                            <p className="text-xs text-muted-foreground">{booking.borrower.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-3">{booking.date}</td>
                                    <td className="p-3">
                                        <Badge
                                            variant={
                                                booking.status === "accepted"
                                                    ? "default"
                                                    : booking.status === "rejected"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
                                            {booking.status}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-xs text-muted-foreground">
                                        {new Date(booking.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
