import db from "@/infrastructure/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, FileText, Coins } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const userCount = await db.user.count();
    const itemCount = await db.item.count();
    const transactionCount = await db.transaction.count();
    const totalVolume = await db.transaction.aggregate({
        _sum: { amount: true }
    });

    const recentUsers = await db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" }
    });

    const recentTransactions = await db.transaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            fromUser: { select: { name: true } },
            toUser: { select: { name: true } }
        }
    });

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{transactionCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVolume._sum.amount?.toFixed(0) || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Recent Users</h2>
                    <div className="border rounded-lg p-4 bg-card">
                        <ul className="space-y-4">
                            {recentUsers.map(u => (
                                <li key={u.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">{u.name}</p>
                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Recent Transactions</h2>
                    <div className="border rounded-lg p-4 bg-card">
                         <ul className="space-y-4">
                            {recentTransactions.map(t => (
                                <li key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-sm">{t.type}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {t.fromUser?.name || "System"} ➝ {t.toUser?.name || "System"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{t.amount}</p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
