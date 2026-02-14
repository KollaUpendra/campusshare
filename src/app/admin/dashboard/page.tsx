/**
 * @file page.tsx
 * @description Admin Dashboard Page (~Protected by middleware).
 * @module App/Admin/Dashboard
 * 
 * Functionality:
 * - Displays platform statistics (total users, items, bookings).
 * - Lists recently registered users.
 * - Server Component: fetches data directly from DB.
 * - Access restricted to users with "admin" role (enforced by middleware).
 */

export const dynamic = "force-dynamic";

import db from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, CalendarCheck } from "lucide-react";

export default async function AdminDashboard() {
    const userCount = await db.user.count();
    const itemCount = await db.item.count();
    const bookingCount = await db.booking.count();

    const recentUsers = await db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount}</div>
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
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold">Recent Users</h3>
                <div className="border rounded-lg bg-card">
                    {recentUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-4 border-b last:border-0">
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
