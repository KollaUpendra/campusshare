import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import { History, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DepositHistory from "@/components/profile/DepositHistory";

export default async function PaymentHistoryPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const userData = await (db.user.findUnique({
        where: { id: session.user.id },
        include: {
            depositRequests: {
                orderBy: { createdAt: "desc" },
                take: 50
            }
        } as any
    }) as any);

    if (!userData) {
        return <div className="p-8 text-center">User not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/profile">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <History className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">Payment History</h1>
                    </div>
                </div>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <p className="text-muted-foreground mb-6">
                    Track your coin redemption requests and their current status below.
                </p>
                <DepositHistory deposits={userData.depositRequests} />
            </div>

            <div className="flex justify-center">
                <Button variant="outline" asChild>
                    <Link href="/profile">Back to Profile</Link>
                </Button>
            </div>
        </div>
    );
}
