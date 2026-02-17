/**
 * @file BookingRequestButton.tsx
 * @description Action button to initiate a booking request.
 * @module Components/Items/BookingRequestButton
 * 
 * Functionality:
 * - Opens a popover to select a booking date.
 * - Validates date against item availability.
 * - Sends booking request to API.
 * - Handles authentication check before booking.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface BookingRequestButtonProps {
    itemId: string;
    price: number;
    availableDays: string[];
    availableFrom?: string | null;
    availableUntil?: string | null;
    type?: string;
    currentRequest?: any; // Booking object
}

export default function BookingRequestButton({
    itemId,
    price,
    availableDays,
    availableFrom,
    availableUntil,
    type = "Rent",
    currentRequest
}: BookingRequestButtonProps) {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    // Helper to get local date string YYYY-MM-DD
    const getTodayString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };



    const handlePay = async () => {
        let confirmMsg = `Confirm payment of ${price} coins?`;
        if (currentRequest?.totalPrice) {
            confirmMsg = `Confirm payment of ${currentRequest.totalPrice} coins?`;
        }

        if (!confirm(confirmMsg)) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/bookings/${currentRequest.id}/pay`, {
                method: "POST",
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            alert("Payment successful!");
            router.push("/transactions");
            router.refresh();
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : "Payment failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequest = async (start?: string, end?: string) => {
        if (!session) {
            alert("Please sign in to book items");
            return;
        }

        setIsLoading(true);
        try {
            const body: any = { itemId };
            if (start) {
                body.startDate = start;
                body.endDate = end || start;
                body.date = start; // Legacy fallback
            } else if (type === "Sell") {
                const today = new Date().toISOString().split("T")[0];
                body.date = today;
                body.startDate = today;
            }

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            alert("Request sent successfully! Wait for owner approval.");
            setIsOpen(false);
            router.refresh();
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : "Failed to send request");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate total price preview
    const duration = startDate && endDate
        ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 1;
    const totalPrice = price * (duration > 0 ? duration : 1);


    // --- RENDER STATES ---

    if (currentRequest) {
        if (currentRequest.status === "PENDING" || currentRequest.status === "pending") {
            return (
                <Button className="w-full" size="lg" disabled>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Request Pending
                </Button>
            );
        }
        if (currentRequest.status === "ACCEPTED" || currentRequest.status === "accepted") {
            const payAmount = currentRequest.totalPrice || price;
            return (
                <>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg" onClick={handlePay} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Pay Now (₹{payAmount})
                    </Button>
                    {currentRequest.pickupLocation && (
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Pickup: <span className="font-medium text-foreground">{currentRequest.pickupLocation}</span>
                        </p>
                    )}
                </>
            );
        }
        if (currentRequest.status === "COMPLETED" || currentRequest.status === "completed") {
            return (
                <Button className="w-full" variant="secondary" size="lg" disabled>
                    {type === "Sell" ? "Purchased" : "Rented"}
                </Button>
            );
        }
    }

    // --- INITIAL REQUEST STATE ---

    if (type === "Sell") {
        return (
            <Button className="w-full" size="lg" onClick={() => handleRequest()} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Request to Buy
            </Button>
        );
    }

    // Rent Request
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button className="w-full" size="lg">
                    Request for ₹{price} /Day
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="center">
                <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Select Dates</h4>
                        <div className="text-sm text-muted-foreground">
                            {availableDays.length > 0 ? (
                                <p>Days: <span className="font-medium text-foreground">{availableDays.join(", ")}</span></p>
                            ) : (
                                <p>Days: <span className="font-medium text-foreground">Every Day</span></p>
                            )}

                            {(availableFrom || availableUntil) && (
                                <p className="text-xs mt-1">
                                    Range: {availableFrom ? new Date(availableFrom).toLocaleDateString() : 'Now'} - {availableUntil ? new Date(availableUntil).toLocaleDateString() : 'Indefinite'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-medium">Start</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-md text-sm"
                                min={getTodayString()}
                                max={availableUntil ? availableUntil : undefined}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) {
                                        setStartDate(undefined);
                                        return;
                                    }
                                    const [y, m, d] = val.split('-').map(Number);
                                    setStartDate(new Date(y, m - 1, d));
                                }}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium">End</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-md text-sm"
                                min={startDate ? format(startDate, "yyyy-MM-dd") : getTodayString()}
                                max={availableUntil ? availableUntil : undefined}
                                disabled={!startDate}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) {
                                        setEndDate(undefined);
                                        return;
                                    }
                                    const [y, m, d] = val.split('-').map(Number);
                                    setEndDate(new Date(y, m - 1, d));
                                }}
                            />
                        </div>
                    </div>

                    {(startDate && endDate) && (
                        <div className="bg-muted p-2 rounded-md text-sm text-center">
                            <p className="font-medium">Total: ₹{totalPrice}</p>
                            <p className="text-xs text-muted-foreground">For {duration} day{(duration > 1 ? 's' : '')}</p>
                        </div>
                    )}

                    <Button
                        onClick={() => handleRequest(
                            startDate ? format(startDate, "yyyy-MM-dd") : undefined,
                            endDate ? format(endDate, "yyyy-MM-dd") : (startDate ? format(startDate, "yyyy-MM-dd") : undefined)
                        )}
                        disabled={!startDate || isLoading}
                        className="w-full"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Request"}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );

}
