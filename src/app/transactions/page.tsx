import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const { user } = session;

    // Fetch transactions
    const userData = await db.user.findUnique({
        where: { id: user.id },
        include: {
            sentTransactions: {
                orderBy: { createdAt: "desc" },
                include: { item: true, toUser: { select: { name: true, email: true } } }
            },
            receivedTransactions: {
                orderBy: { createdAt: "desc" },
                include: { item: true, fromUser: { select: { name: true, email: true } } }
            }
        }
    });

    if (!userData) {
        return <div>User not found</div>;
    }

    // Merge and sort transactions
    const transactions = [
        ...userData.sentTransactions
            .filter((t: any) => t.amount < 0) // Only show debits (money leaving)
            .map((t: any) => ({ ...t, direction: 'out', amount: Math.abs(t.amount) })),
        
        ...userData.receivedTransactions
            .filter((t: any) => t.amount > 0) // Only show credits (money entering)
            .map((t: any) => ({ ...t, direction: 'in' }))
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/profile">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <History className="h-6 w-6" />
                    Transaction History
                </h1>
            </div>

            {transactions.length > 0 ? (
                <div className="space-y-3">
                    {transactions.map((t) => (
                        <Card key={t.id} className="overflow-hidden">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                                        t.direction === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {t.direction === 'in' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {t.item ? t.item.title : "System Transfer"}
                                        </p>
                                        <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:gap-2">
                                            <span>
                                                {new Date(t.createdAt).toLocaleDateString()} at {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>
                                                {t.direction === 'in' 
                                                    ? `From: ${t.fromUser?.name || 'Unknown'}` 
                                                    : `To: ${t.toUser?.name || 'Unknown'}`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${t.direction === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.direction === 'in' ? '+' : '-'}₹{t.amount}
                                    </p>
                                    <Badge variant="outline" className="text-[10px] mt-1 capitalize">
                                        {t.type.toLowerCase().replace('_', ' ')}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/20 text-muted-foreground">
                    <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No transactions found.</p>
                </div>
            )}
        </div>
    );
}
