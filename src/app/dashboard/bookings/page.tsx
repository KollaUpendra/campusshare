/**
 * @file page.tsx
 * @description Dashboard Bookings Page.
 * @module App/Dashboard/Bookings
 * 
 * Functionality:
 * - Displays "My Requests" (outgoing) and "Incoming Requests" tabs.
 * - Allows item owners to accept/reject incoming booking requests.
 * - Uses optimistic UI updates for status changes.
 * - Redirects unauthenticated users to sign-in.
 */

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Booking = {
    id: string;
    status: "pending" | "accepted" | "rejected" | "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
    date: string;
    item: {
        id: string;
        title: string;
        price: number;
        owner: { name: string; image: string };
    };
    borrower?: {
        name: string;
        email: string;
        image: string;
    };
};

export default function BookingsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
    const [pickupLocation, setPickupLocation] = useState("");
    const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(0);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
            return;
        }
        if (status === "authenticated") {
            fetchBookings();
        }
    }, [status, activeTab, router]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const type = activeTab === "incoming" ? "incoming" : "my-bookings";
            const res = await fetch(`/api/bookings?type=${type}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (bookingId: string, action: "accepted" | "rejected") => {
        if (action === "accepted") {
            setActiveBookingId(bookingId);
            setPickupLocation("Main Gate"); // Default
            setPickupDialogOpen(true);
            return;
        }

        // Reject Logic
        if (!confirm(`Are you sure you want to reject this request?`)) return;
        await processBooking(bookingId, "rejected");
    };

    const confirmAccept = async () => {
        if (!activeBookingId) return;
        await processBooking(activeBookingId, "accepted", pickupLocation);
        setPickupDialogOpen(false);
    };

    const confirmPayment = async () => {
        if (!activeBookingId) return;
        try {
            const res = await fetch(`/api/bookings/${activeBookingId}/pay`, { method: "POST" });
            if (!res.ok) throw new Error(await res.text());

            // Success
            setPaymentDialogOpen(false);
            fetchBookings(); // Refresh list
            router.refresh();
            fetchBookings(); // Refresh list
            router.refresh();
            alert("Payment Successful!");
        } catch (e) {
            alert(e instanceof Error ? e.message : "Payment failed");
        }
    };

    const processBooking = async (bookingId: string, action: "accepted" | "rejected", location?: string) => {
        try {
            const endpoint = action === "accepted" ? "accept" : "reject";
            const body = action === "accepted" ? { pickupLocation: location } : {};

            const res = await fetch(`/api/bookings/${bookingId}/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to update");
            }

            const newStatus = action === "accepted" ? "ACCEPTED" : "REJECTED";
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus as any } : b));
        } catch (error) {
            alert(`Failed to ${action}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    if (status === "loading") return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 pb-20">
            <h1 className="text-2xl font-bold">Bookings</h1>

            <div className="flex p-1 bg-muted rounded-lg">
                <button
                    onClick={() => setActiveTab("outgoing")}
                    className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                        activeTab === "outgoing" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    My Requests
                </button>
                <button
                    onClick={() => setActiveTab("incoming")}
                    className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                        activeTab === "incoming" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Incoming Requests
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No bookings found.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                <Link href={`/items/${booking.item.id}`} className="hover:underline">
                                    <CardTitle className="text-base truncate">{booking.item.title}</CardTitle>
                                </Link>
                                <Badge variant={
                                    (booking.status === "accepted" || booking.status === "ACCEPTED") ? "default" :
                                        (booking.status === "rejected" || booking.status === "REJECTED") ? "destructive" : "secondary"
                                }>
                                    {booking.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 text-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="font-medium">{booking.date}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-medium">₹{booking.item.price}</span>
                                </div>

                                {activeTab === "incoming" && booking.borrower && (
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 overflow-hidden">
                                            {booking.borrower.image && <img src={booking.borrower.image} alt={booking.borrower.name} />}
                                        </div>
                                        <span className="text-muted-foreground">Requested by {booking.borrower.name}</span>
                                    </div>
                                )}

                                {activeTab === "incoming" && (booking.status === "pending" || booking.status === "PENDING") && (
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            onClick={() => handleAction(booking.id, "accepted")}
                                        >
                                            <Check className="h-4 w-4 mr-1" /> Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={() => handleAction(booking.id, "rejected")}
                                        >
                                            <X className="h-4 w-4 mr-1" /> Reject
                                        </Button>
                                    </div>
                                )}

                                {activeTab === "outgoing" && (booking.status === "accepted" || booking.status === "ACCEPTED") && (
                                    <div className="mt-4">
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700"
                                            size="sm"
                                            onClick={() => {
                                                setActiveBookingId(booking.id);
                                                setPaymentAmount(booking.item.price);
                                                setPaymentDialogOpen(true);
                                            }}
                                        >
                                            Pay Now (₹{booking.item.price})
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={pickupDialogOpen} onOpenChange={setPickupDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Accept Request</DialogTitle>
                        <DialogDescription>
                            Where should the borrower pick up this item?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="location" className="text-right">
                                Location
                            </Label>
                            <Input
                                id="location"
                                value={pickupLocation}
                                onChange={(e) => setPickupLocation(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. Main Gate, Library"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={confirmAccept}>Confirm & Accept</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Confirmation Dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to pay <strong>₹{paymentAmount}</strong> for this booking?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={confirmPayment}>
                            Confirm Payment (₹{paymentAmount})
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
