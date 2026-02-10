"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "Price must be a valid number greater than 0",
    }),
});

type FormData = z.infer<typeof formSchema>;

export default function AddItemForm() {
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormData) => {
        if (selectedDays.length === 0) {
            alert("Please select at least one available day");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    price: parseFloat(data.price),
                    availability: selectedDays,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create item");
            }

            router.push("/");
            router.refresh(); // Refresh server components
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleDay = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-md mx-auto py-6">
            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Item Name</label>
                <input
                    {...register("title")}
                    placeholder="e.g., Lab Coat, Scientific Calculator"
                    className="w-full p-3 border rounded-lg bg-background"
                />
                {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <textarea
                    {...register("description")}
                    placeholder="Short description..."
                    className="w-full p-3 border rounded-lg bg-background min-h-[100px]"
                />
                {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">Price per day (₹)</label>
                <input
                    {...register("price")}
                    type="number"
                    step="0.01"
                    placeholder="50"
                    className="w-full p-3 border rounded-lg bg-background"
                />
                {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium">Available Days:</p>
                <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`px-3 py-2 rounded-full text-sm border transition-colors ${selectedDays.includes(day)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                                }`}
                        >
                            {day.slice(0, 3)}
                        </button>
                    ))}
                </div>
                {selectedDays.length === 0 && <p className="text-muted-foreground text-xs">Select at least one day.</p>}
            </div>

            <Button type="submit" size="lg" className="w-full font-bold mt-4" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                    </>
                ) : (
                    "List Item"
                )}
            </Button>
        </form>
    );
}
