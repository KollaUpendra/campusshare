export const dynamic = "force-dynamic";

import db from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export default async function AdminBookingsPage() {
    const bookings = await db.booking.findMany({
        include: {
            item: {
                select: {
                    title: true,
                    owner: { select: { name: true, email: true } },
                },
            },
            borrower: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const pendingCount = bookings.filter((b) => b.status === "pending").length;
    const acceptedCount = bookings.filter((b) => b.status === "accepted").length;
    const rejectedCount = bookings.filter((b) => b.status === "rejected").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-2">
                <h1 className="text-2xl font-bold tracking-tight">Booking Overview</h1>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">🕓 {pendingCount} Pending</Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">✅ {acceptedCount} Accepted</Badge>
                    <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">❌ {rejectedCount} Rejected</Badge>
                </div>
            </div>

            <div className="bg-card rounded-[2rem] border-0 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/30 text-muted-foreground border-b">
                            <tr>
                                <th className="text-left p-4 px-6 font-semibold tracking-wide">Item</th>
                                <th className="text-left p-4 px-6 font-semibold tracking-wide">Owner</th>
                                <th className="text-left p-4 px-6 font-semibold tracking-wide">Borrower</th>
                                <th className="text-left p-4 px-6 font-semibold tracking-wide">Date</th>
                                <th className="text-left p-4 px-6 font-semibold tracking-wide">Status</th>
                                <th className="text-left p-4 px-6 font-semibold tracking-wide">Requested</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                                        No bookings yet
                                    </td>
                                </tr>
                            )}
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4 px-6 font-medium text-foreground whitespace-nowrap">{booking.item.title}</td>
                                    <td className="p-4 px-6 whitespace-nowrap">
                                        <div>
                                            <p className="font-medium text-foreground">{booking.item.owner.name || "Unnamed"}</p>
                                            <p className="text-xs text-muted-foreground">{booking.item.owner.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 px-6 whitespace-nowrap">
                                        <div>
                                            <p className="font-medium text-foreground">{booking.borrower.name || "Unnamed"}</p>
                                            <p className="text-xs text-muted-foreground">{booking.borrower.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 px-6 text-muted-foreground whitespace-nowrap">{booking.date}</td>
                                    <td className="p-4 px-6 whitespace-nowrap">
                                        <Badge
                                            variant="secondary"
                                            className={`tracking-wide font-medium ${booking.status === "accepted"
                                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                    : booking.status === "rejected"
                                                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                                                        : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                                }`}
                                        >
                                            {booking.status.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="p-4 px-6 text-xs text-muted-foreground whitespace-nowrap">
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
