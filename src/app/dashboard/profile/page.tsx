/**
 * @file page.tsx
 * @description User Profile Page.
 * @module App/Dashboard/Profile
 * 
 * Functionality:
 * - Displays user info (avatar, name, email, role).
 * - Lists user's own items ("My Listings").
 * - Lists user's booking requests ("My Requests").
 * - Provides a Sign Out button.
 * - Server Component: fetches data directly from DB.
 */

export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import SignOutButton from "@/components/auth/SignOutButton";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const { user } = session;

    // Fetch User's Data with Transactions
    const userData = await db.user.findUnique({
        where: { id: user.id },
        include: {
            sentTransactions: {
                orderBy: { createdAt: "desc" },
                take: 5,
                include: { item: true, toUser: { select: { name: true } } }
            },
            receivedTransactions: {
                orderBy: { createdAt: "desc" },
                take: 5,
                include: { item: true, fromUser: { select: { name: true } } }
            }
        }
    });

    // Merge and sort transactions (Logic from transactions page)
    const recentTransactions = userData ? [
        ...userData.sentTransactions
            .filter((t: any) => t.amount < 0)
            .map((t: any) => ({ ...t, direction: 'out', amount: Math.abs(t.amount) })),
        
        ...userData.receivedTransactions
            .filter((t: any) => t.amount > 0)
            .map((t: any) => ({ ...t, direction: 'in' }))
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3) : [];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <h1 className="text-3xl font-bold">My Profile</h1>

            {/* Profile Header */}
            <div className="bg-card border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                <div className="h-24 w-24 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center border-2 border-primary/20 shrink-0">
                    {user.image ? (
                        <Image src={user.image} alt="Profile" width={96} height={96} className="h-full w-full object-cover" />
                    ) : (
                        <User className="h-10 w-10 text-primary" />
                    )}
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex gap-2 justify-center md:justify-start">
                        <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            {user.role || "Student"}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    {/* We need a client component for SignOut logic since it uses hooks */}
                    <div className="grid gap-2">
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

            {/* Recent Transactions Preview */}
            {recentTransactions.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">Recent Transactions</h3>
                    </div>
                    <div className="grid gap-3">
                        {recentTransactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                <div>
                                    <p className="font-medium text-sm">{t.item ? t.item.title : "System Transfer"}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`font-bold ${t.direction === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.direction === 'in' ? '+' : '-'}₹{t.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
