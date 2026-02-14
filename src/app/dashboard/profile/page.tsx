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
import { User, LogOut, Settings, Package, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ItemCard from "@/components/items/ItemCard";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const { user } = session;

    // Fetch User's Items
    let myItems: any[] = [];
    let myBookings: any[] = [];

    try {
        myItems = await db.item.findMany({
            where: { ownerId: user.id },
            include: {
                availability: true,
                owner: { select: { name: true, image: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        // Fetch User's Bookings (Items they want to borrow)
        myBookings = await db.booking.findMany({
            where: { borrowerId: user.id },
            include: {
                item: {
                    include: { owner: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("Profile Page Data Fetch Error:", error);
        // Fallback to empty arrays is handled by initialization
    }

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
                        <div className="inline-block px-3 py-1 bg-secondary rounded-full text-xs font-medium uppercase tracking-wider">
                            {user.role || "Student"}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    {/* We need a client component for SignOut logic since it uses hooks */}
                    <SignOutButton />
                </div>
            </div>

            {/* My Listings */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        My Listings
                    </h3>
                    <Button size="sm" asChild>
                        <Link href="/post-item">List New Item</Link>
                    </Button>
                </div>

                {myItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 border rounded-lg bg-muted/20 text-muted-foreground">
                        You haven&apos;t listed any items yet.
                    </div>
                )}
            </div>

            {/* My Bookings */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    My Requests
                </h3>
                {myBookings.length > 0 ? (
                    <div className="space-y-3">
                        {myBookings.map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                <div>
                                    <h4 className="font-medium">{booking.item.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Requested for: {booking.date}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Owner: {booking.item.owner.name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                                        ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 border rounded-lg bg-muted/20 text-muted-foreground">
                        You haven&apos;t made any booking requests.
                    </div>
                )}
            </div>
        </div>
    );
}
