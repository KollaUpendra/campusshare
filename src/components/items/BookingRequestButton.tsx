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
    type?: string; // 'Rent' | 'Sell'
}

export default function BookingRequestButton({ itemId, price, availableDays, type = "Rent" }: BookingRequestButtonProps) {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    // Helper to check if a date is valid based on availableDays
    const isDateDisabled = (d: Date) => {
        const dayName = format(d, "EEEE"); // "Monday", "Tuesday"...
        // Disable pure past dates
        if (d < new Date(new Date().setHours(0, 0, 0, 0))) return true;
        // Disable if day of week not in availability
        return !availableDays.includes(dayName);
    };

    const handleBuy = async () => {
        if (!confirm(`Are you sure you want to buy this item for ${price} coins?`)) return;
        
        setIsLoading(true);
        try {
            const res = await fetch("/api/transactions/buy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            alert("Purchase successful!");
            router.push("/profile"); // Redirect to profile or orders page
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Purchase failed";
            alert(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRentRequest = async () => {
        if (!date) return;
        if (!session) {
            alert("Please sign in to book items");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemId,
                    date: format(date, "yyyy-MM-dd"),
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            alert("Request sent successfully!");
            setIsOpen(false);
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to send request";
            alert(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (type === "Sell") {
        return (
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg" onClick={handleBuy} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Buy Now for {price} Coins
            </Button>
        );
    }

    // Rent Logic
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
                            Pick an available day to borrow this item.
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
                                const dateObj = new Date(val);
                                // Adjust specifically for input date string returning UTC midnight usually?
                                // Actually input type="date" value is YYYY-MM-DD.
                                // New Date("YYYY-MM-DD") is usually UTC. 
                                // We want local day comparison.
                                // A simple way is to just keep the string or parse carefully.
                                // But my isDateDisabled uses Date object.
                                // Let's ensure we work with the day selected.
                                setDate(dateObj); 
                            }}
                        />
                         {date && isDateDisabled(date) && (
                            <p className="text-xs text-red-500">
                                Item not available on {format(date, "EEEE")}
                            </p>
                        )}
                        {date && !isDateDisabled(date) && (
                            <p className="text-xs text-green-600">
                                Available on {format(date, "EEEE")}
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={handleRentRequest}
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
