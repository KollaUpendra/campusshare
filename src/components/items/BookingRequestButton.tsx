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
}

export default function BookingRequestButton({ itemId, price, availableDays }: BookingRequestButtonProps) {
    const [date, setDate] = useState<Date>();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    // Helper to check if a date is valid based on availableDays
    const isDateDisabled = (date: Date) => {
        const dayName = format(date, "EEEE"); // "Monday", "Tuesday"...
        // Disable pure past dates (today is OK for now)
        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
        // Disable if day of week not in availability
        return !availableDays.includes(dayName);
    };

    const handleBooking = async () => {
        if (!date) return;
        if (!session) {
            // Redirect to login or show alert
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

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button className="w-full" size="lg">
                    Request for ₹{price}
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
                    {/* Simplified Date Input for Minimal Dependencies if Calendar component missing, 
                        BUT assuming user has basic shadcn setup. 
                        If Calendar is missing, we fallback to native input. 
                        Let's use native input for robustness unless we verify Calendar exists.
                        Wait, I didn't verify UI folder for Calendar... 
                        I'll use a safer HTML date input approach to avoid missing component errors 
                        since I only saw basic UI components.
                    */}
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
                                const [y, m, d] = val.split('-').map(Number);
                                const localDate = new Date(y, m - 1, d);
                                setDate(localDate);
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
                        onClick={handleBooking}
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
