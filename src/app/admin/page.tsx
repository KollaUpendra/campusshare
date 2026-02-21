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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/users" className="block group">
                    <Card className="rounded-[2rem] border-0 shadow-sm shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Users</CardTitle>
                            <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-foreground">{userCount}</div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/items" className="block group">
                    <Card className="rounded-[2rem] border-0 shadow-sm shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Items</CardTitle>
                            <div className="h-10 w-10 bg-purple-500/10 rounded-full flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                <Package className="h-5 w-5 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-foreground">{itemCount}</div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/transactions" className="block group">
                    <Card className="rounded-[2rem] border-0 shadow-sm shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Transactions</CardTitle>
                            <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                <FileText className="h-5 w-5 text-amber-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-foreground">{transactionCount}</div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/transactions" className="block group">
                    <Card className="rounded-[2rem] border-0 shadow-sm shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Volume</CardTitle>
                            <div className="h-10 w-10 bg-indigo-500/10 rounded-full flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                <Coins className="h-5 w-5 text-indigo-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-foreground">₹{totalVolume._sum.amount?.toFixed(0) || 0}</div>
                        </CardContent>
                    </Card>
                </Link>

                {/* New Total Income Card */}
                <Card className="rounded-[2rem] border-0 shadow-lg shadow-green-500/10 bg-gradient-to-br from-green-50 to-green-100/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-green-800">Total Income</CardTitle>
                        <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center shadow-inner">
                            <Coins className="h-5 w-5 text-green-700" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-green-900 tracking-tight">
                            ₹{totalIncome._sum?.platformFee?.toFixed(2) || "0.00"}
                        </div>
                        <p className="text-xs font-semibold text-green-700/80 mt-1 uppercase tracking-wider">Platform Fees Collected</p>
                    </CardContent>
                </Card>

                <Link href="/admin/settings/service-charges" className="block group">
                    <Card className="rounded-[2rem] border-0 shadow-sm shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">Service Charges</CardTitle>
                            <div className="h-10 w-10 bg-slate-500/10 rounded-full flex items-center justify-center group-hover:bg-slate-500/20 transition-colors">
                                <Coins className="h-5 w-5 text-slate-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold mt-1">
                                {systemSettings ? (
                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Rent</span>
                                            <span className="text-xl">{systemSettings.rentServiceChargePercent}%</span>
                                        </div>
                                        <div className="w-px bg-border my-1"></div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Sell</span>
                                            <span className="text-xl">{systemSettings.sellServiceChargePercent}%</span>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground font-normal text-sm">Tap to configure percentages</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>


        </div>
    );
}
