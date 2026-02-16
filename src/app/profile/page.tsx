import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import Image from "next/image";
import { User, Coins, Phone, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import EditProfileDialog from "@/components/profile/EditProfileDialog";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/");
    }

    const userData = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
            items: {
                 where: { status: { not: "deleted" } }, // Assuming we don't hard delete
                 orderBy: { createdAt: "desc" }
            },
            sentTransactions: {
                orderBy: { createdAt: "desc" },
                take: 10,
                include: { item: true, toUser: true }
            },
            receivedTransactions: {
                 orderBy: { createdAt: "desc" },
                 take: 10,
                 include: { item: true, fromUser: true }
            }
        } as any
    });

    if (!userData) {
        return <div>User not found</div>;
    }

    // Explicitly cast to any to bypass stale TS errors in editor
    const user = userData as any;

    // Merge transactions for history
    const transactions = [
        ...user.sentTransactions.map((t: any) => ({ ...t, direction: 'out' })),
        ...user.receivedTransactions.map((t: any) => ({ ...t, direction: 'in' }))
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
            {/* Header / Profile Card */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card border rounded-xl shadow-sm relative">
                <div className="absolute top-4 right-4">
                    <EditProfileDialog user={user} />
                </div>
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20">
                    {user.image ? (
                        <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
                    ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                            <User className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mt-2">
                        {user.phoneNumber && (
                            <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                <span>{user.phoneNumber}</span>
                            </div>
                        )}
                         {user.bio && (
                            <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{user.bio}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 min-w-[120px]">
                    <div className="flex items-center gap-2 text-2xl font-bold text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                        <Coins className="h-6 w-6" />
                        <span>{user.coins.toFixed(0)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Available Balance</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* My Listings */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">My Listings</h2>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/post-item">List Item</Link>
                        </Button>
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            {user.items.length === 0 ? (
                                <div className="p-6 text-center text-muted-foreground">
                                    No items listed yet.
                                </div>
                            ) : (
                                <ul className="divide-y">
                                    {user.items.map((item: any) => (
                                        <li key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition">
                                            <div className="flex items-center gap-3">
                                                 {item.image && (
                                                    <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                                                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                                                    </div>
                                                 )}
                                                 <div>
                                                     <p className="font-medium">{item.title}</p>
                                                     <p className="text-xs text-muted-foreground">{item.status}</p>
                                                 </div>
                                            </div>
                                            <div className="text-right">
                                                 <p className="font-bold">{item.price}</p>
                                                 <Badge variant="secondary" className="text-[10px]">{item.type}</Badge>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction History */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Recent Transactions</h2>
                    <Card>
                        <CardContent className="p-0">
                             {transactions.length === 0 ? (
                                <div className="p-6 text-center text-muted-foreground">
                                    No transaction history.
                                </div>
                            ) : (
                                <ul className="divide-y">
                                    {transactions.map((t: any) => (
                                        <li key={t.id} className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {t.type === 'PURCHASE' ? (t.direction === 'out' ? 'Bought Item' : 'Sold Item') : t.type}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {t.item ? t.item.title : "System Transfer"}
                                                </p>
                                                 <p className="text-[10px] text-muted-foreground">
                                                    {new Date(t.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className={`font-bold ${t.direction === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                                {t.direction === 'in' ? '+' : '-'}{t.amount}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
