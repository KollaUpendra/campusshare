"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from 'next/image';

const CATEGORIES = ["Electronics", "Books", "Stationery", "Clothing", "Sports", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];
const TYPES = ["Rent", "Sell"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "Price must be a valid number greater than 0",
    }),
    category: z.string(),
    condition: z.string(),
    type: z.string(),
    images: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddItemFormProps {
    initialData?: {
        id: string;
        title: string;
        description: string;
        price: number;
        image?: string | null;
        images?: string[];
        category?: string;
        condition?: string;
        type?: string;
        availability: { dayOfWeek: string }[];
    };
    cloudinaryConfig: {
        cloudName: string;
        apiKey: string;
    };
}

export default function AddItemForm({ initialData, cloudinaryConfig }: AddItemFormProps) {
    const [selectedDays, setSelectedDays] = useState<string[]>(initialData?.availability.map(a => a.dayOfWeek) || []);
    // Initialize images from legacy 'image' or new 'images' array
    const [imageUrls, setImageUrls] = useState<string[]>(
        initialData?.images && initialData.images.length > 0 
            ? initialData.images 
            : (initialData?.image ? [initialData.image] : [])
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            title: initialData.title,
            description: initialData.description,
            price: initialData.price.toString(),
            category: initialData.category || "Other",
            condition: initialData.condition || "Good",
            type: initialData.type || "Rent",
            images: initialData.images || (initialData.image ? [initialData.image] : []),
        } : {
            category: "Other",
            condition: "Good",
            type: "Rent",
            images: [],
        },
    });

    const listingType = watch("type");

    const onSubmit = async (data: FormData) => {
        if (selectedDays.length === 0 && listingType === "Rent") {
            alert("Please select at least one available day for rentals");
            return;
        }

        setIsSubmitting(true);
        try {
            const url = "/api/items";
            const method = initialData ? "PUT" : "POST";

            const payload = {
                id: initialData?.id, // Only for PUT
                title: data.title,
                description: data.description,
                price: parseFloat(data.price),
                images: imageUrls,
                image: imageUrls[0] || null, // Main image for backward compat
                category: data.category,
                condition: data.condition,
                type: data.type,
                availability: listingType === "Rent" ? selectedDays : [], // Availability only for rentals
            };

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to save item");
            }

            router.push(initialData ? `/items/${initialData.id}` : "/");
            router.refresh(); // Refresh server components
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Something went wrong";
            alert(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (imageUrls.length + files.length > 5) {
            alert("You can upload a maximum of 5 images.");
            return;
        }

        setIsSubmitting(true);
        try {
            const newUrls: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                const timestamp = Math.round(new Date().getTime() / 1000);

                // 1. Get signature from backend
                const signResponse = await fetch("/api/sign-cloudinary", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        paramsToSign: {
                            timestamp,
                            folder: "campusshare-products",
                        }
                    }),
                });
                const { signature } = await signResponse.json();

                // 2. Upload to Cloudinary
                formData.append("file", file);
                formData.append("api_key", cloudinaryConfig.apiKey);
                formData.append("timestamp", timestamp.toString());
                formData.append("signature", signature);
                formData.append("folder", "campusshare-products");

                const uploadResponse = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );
                const data = await uploadResponse.json();

                if (data.secure_url) {
                    newUrls.push(data.secure_url);
                }
            }

            const updatedUrls = [...imageUrls, ...newUrls];
            setImageUrls(updatedUrls);
            setValue("images", updatedUrls);

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Image upload failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        const updatedUrls = imageUrls.filter((_, index) => index !== indexToRemove);
        setImageUrls(updatedUrls);
        setValue("images", updatedUrls);
    };

    const toggleDay = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h1 className="text-2xl font-bold text-center">{initialData ? "Edit Item" : "List New Item"}</h1>

            {/* Image Upload Section */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Product Images (Max 5)</label>
                <div className="border border-dashed rounded-lg p-4">
                    <div className="flex flex-wrap gap-4 mb-4">
                        {imageUrls.map((url, index) => (
                            <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                                <Image
                                    src={url}
                                    alt={`Product ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 h-5 w-5 flex items-center justify-center text-xs"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {imageUrls.length < 5 && (
                            <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg border cursor-pointer hover:bg-muted/80 relative">
                                <span className="text-2xl text-muted-foreground">+</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    title="Upload images"
                                />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Upload up to 5 images. First image will be the main thumbnail.
                    </p>
                </div>
            </div>

            {/* Basic Info */}
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
                    placeholder="Describe condition, details, etc."
                    className="w-full p-3 border rounded-lg bg-background min-h-[100px]"
                />
                {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
            </div>

            {/* Category & Condition & Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select {...register("category")} className="w-full p-3 border rounded-lg bg-background">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Condition</label>
                    <select {...register("condition")} className="w-full p-3 border rounded-lg bg-background">
                        {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Listing Type</label>
                    <select {...register("type")} className="w-full p-3 border rounded-lg bg-background">
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                    {listingType === "Rent" ? "Price per Day (Coins)" : "Selling Price (Coins)"}
                </label>
                <input
                    {...register("price")}
                    type="number"
                    step="0.01"
                    placeholder="50"
                    className="w-full p-3 border rounded-lg bg-background"
                />
                {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
            </div>

            {/* Availability (Only if Rent) */}
            {listingType === "Rent" && (
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
                </div>
            )}

            <Button type="submit" size="lg" className="w-full font-bold mt-4" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    initialData ? "Update Item" : "List Item"
                )}
            </Button>
        </form>
    );
}
