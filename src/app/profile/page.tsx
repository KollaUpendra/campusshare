import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import Image from "next/image";
import { User, Coins, Phone, FileText, Settings, History } from "lucide-react";
import Link from "next/link";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import { Button } from "@/components/ui/button";
import SignOutButton from "@/components/auth/SignOutButton";
import DepositRequestDialog from "@/components/profile/DepositRequestDialog";
import DepositCoinsDialog from "@/components/profile/DepositCoinsDialog";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const userData = await (db.user.findUnique({
        where: { id: session.user.id }
    }) as any);

    if (!userData) {
        return <div>User not found</div>;
    }

    // Explicitly cast to any to bypass stale TS errors in editor
    const user = userData as any;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
            {/* Header / Profile Card */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card border rounded-xl shadow-sm relative">
                {/* User Image */}
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                    {user.image ? (
                        <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
                    ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                            <User className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-3 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        <EditProfileDialog user={user} />
                    </div>
                    <p className="text-muted-foreground">{user.email}</p>
                    
                    {/* Role Badge */}
                    <div className="flex justify-center md:justify-start">
                         <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            {user.role || "student"}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                        {user.phoneNumber && (
                            <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                <span>{user.phoneNumber}</span>
                            </div>
                        )}
                        {user.bio && (
                            <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span className="max-w-[300px] truncate">{user.bio}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Actions & Balances */}
                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                    
                    {/* Balance Card */}
                    <div className="flex flex-col items-center gap-1 min-w-[140px] bg-yellow-50/50 p-3 rounded-xl border border-yellow-100">
                        <div className="flex items-center gap-2 text-2xl font-bold text-yellow-600">
                            <Coins className="h-6 w-6" />
                            <span>{user.coins.toFixed(0)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Available Balance</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 w-full">
                        <DepositCoinsDialog />
                        <DepositRequestDialog />
                        
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                            <Link href="/profile/payments">
                                <History className="mr-2 h-4 w-4" />
                                Payment History
                            </Link>
                        </Button>

                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                            <Link href="/transactions">
                                <Settings className="mr-2 h-4 w-4" />
                                Transactions
                            </Link>
                        </Button>

                        <SignOutButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
