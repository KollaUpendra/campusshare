export const dynamic = "force-dynamic";

import db from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Package, CalendarCheck, Ban } from "lucide-react";

export default async function AdminDashboard() {
    const userCount = await db.user.count();
    const blockedCount = await db.user.count({ where: { isBlocked: true } });
    const itemCount = await db.item.count();
    const bookingCount = await db.booking.count();
    const pendingBookings = await db.booking.count({ where: { status: "pending" } });

    const recentUsers = await db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
    });

    const recentBookings = await db.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            item: { select: { title: true } },
            borrower: { select: { name: true, email: true } },
        },
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount}</div>
                        {blockedCount > 0 && (
                            <p className="text-xs text-destructive mt-1">{blockedCount} blocked</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{itemCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bookingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Ban className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">{pendingBookings}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Users */}
            <div className="space-y-3">
                <h3 className="text-lg font-bold">Recent Users</h3>
                <div className="border rounded-lg bg-card">
                    {recentUsers.length === 0 && (
                        <p className="p-4 text-muted-foreground text-center">No users yet</p>
                    )}
                    {recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border-b last:border-0">
                            <div>
                                <p className="font-medium text-sm">{user.name || "Unnamed"}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                                    {user.role}
                                </Badge>
                                {user.isBlocked && (
                                    <Badge variant="destructive" className="text-xs">Blocked</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="space-y-3">
                <h3 className="text-lg font-bold">Recent Bookings</h3>
                <div className="border rounded-lg bg-card">
                    {recentBookings.length === 0 && (
                        <p className="p-4 text-muted-foreground text-center">No bookings yet</p>
                    )}
                    {recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border-b last:border-0">
                            <div>
                                <p className="font-medium text-sm">{booking.item.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    by {booking.borrower.name || booking.borrower.email} · {booking.date}
                                </p>
                            </div>
                            <Badge
                                variant={
                                    booking.status === "accepted"
                                        ? "default"
                                        : booking.status === "rejected"
                                            ? "destructive"
                                            : "secondary"
                                }
                                className="text-xs"
                            >
                                {booking.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
