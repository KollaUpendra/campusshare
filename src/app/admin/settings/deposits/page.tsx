import DepositManagement from "@/components/admin/DepositManagement";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDepositsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/");
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/settings">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
                    <p className="text-sm text-muted-foreground">Manage user coin-to-cash redemption requests.</p>
                </div>
            </div>

            <DepositManagement />
        </div>
    );
}
