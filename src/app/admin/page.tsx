import db from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, Package, FileText, Coins } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const userCount = await db.user.count();
    const itemCount = await db.item.count();
    const transactionCount = await db.transaction.count();
    const totalVolume = await db.transaction.aggregate({
        _sum: {
            amount: true
        },
        where: {
            amount: { gt: 0 } // Only sum credits to avoid cancelling out debits
        }
    });

    // Calculate Total Income (Platform Fees)
    const totalIncome = await db.transaction.aggregate({
        _sum: {
            platformFee: true
        }
    });

    // Fetch System Settings
    const systemSettings = await db.systemSettings.findFirst();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/users" className="block transition-transform hover:scale-105">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userCount}</div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/items" className="block transition-transform hover:scale-105">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{itemCount}</div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/transactions" className="block transition-transform hover:scale-105">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{transactionCount}</div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/transactions" className="block transition-transform hover:scale-105">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                            <Coins className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalVolume._sum.amount?.toFixed(0) || 0}</div>
                        </CardContent>
                    </Card>
                </Link>

                {/* New Total Income Card */}
                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-900">Total Income</CardTitle>
                        <Coins className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">
                            ₹{totalIncome._sum?.platformFee?.toFixed(2) || "0.00"}
                        </div>
                        <p className="text-xs text-green-600 mt-1">Platform Fees Collected</p>
                    </CardContent>
                </Card>
                <Link href="/admin/settings/service-charges" className="block transition-transform hover:scale-105">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Service Charges</CardTitle>
                            <Coins className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-sm mt-2">
                                {systemSettings ? (
                                    <div className="flex flex-col">
                                        <span>Rent: {systemSettings.rentServiceChargePercent}%</span>
                                        <span>Sell: {systemSettings.sellServiceChargePercent}%</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">Configure</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>


        </div>
    );
}
