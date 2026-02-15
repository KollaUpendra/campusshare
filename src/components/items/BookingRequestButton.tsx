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
    type?: string;
    currentRequest?: any; // Booking object
}

export default function BookingRequestButton({ itemId, price, availableDays, type = "Rent", currentRequest }: BookingRequestButtonProps) {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    const isDateDisabled = (d: Date) => {
        const dayName = format(d, "EEEE");
        if (d < new Date(new Date().setHours(0, 0, 0, 0))) return true;
        return !availableDays.includes(dayName);
    };

    const handlePay = async () => {
        if (!currentRequest) return;
        if (!confirm(`Confirm payment of ${price} coins?`)) return;

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

    const handleRequest = async (requestDate?: string) => {
        if (!session) {
            alert("Please sign in to book items");
            return;
        }

        setIsLoading(true);
        try {
            const body: any = { itemId };
            if (requestDate) {
                body.date = requestDate;
            } else if (type === "Sell") {
                // For sell, just send today's date or let backend handle
                // Backend expects date for Rent, optional/handled for Sell
                 body.date = new Date().toISOString().split("T")[0];
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
             return (
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg" onClick={handlePay} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Pay Now ({price} Coins)
                </Button>
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
                    Request for {price} Coins/Day
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
                <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Select Date</h4>
                        <p className="text-sm text-muted-foreground">
                            Pick an available day.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <input
                            type="date"
                            className="p-2 border rounded-md"
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val) {
                                    setDate(undefined);
                                    return;
                                }
                                setDate(new Date(val));
                            }}
                        />
                         {date && isDateDisabled(date) && (
                            <p className="text-xs text-red-500">
                                Not available on {format(date, "EEEE")}
                            </p>
                        )}
                        {date && !isDateDisabled(date) && (
                            <p className="text-xs text-green-600">
                                Available on {format(date, "EEEE")}
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={() => handleRequest(date ? format(date, "yyyy-MM-dd") : undefined)}
                        disabled={!date || isDateDisabled(date) || isLoading}
                        className="w-full"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Request"}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
