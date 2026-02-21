"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = ["Electronics", "Books", "Stationery", "Clothing", "Sports", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];


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
    availableFrom: z.string().optional(),
    availableUntil: z.string().optional(),
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
        availableFrom?: string | null;
        availableUntil?: string | null;
    };
    cloudinaryConfig: {
        cloudName: string;
        apiKey: string;
    };
}

export default function AddItemForm({ initialData, cloudinaryConfig }: AddItemFormProps) {
    // Initialize images from legacy 'image' or new 'images' array
    const [imageUrls, setImageUrls] = useState<string[]>(
        initialData?.images && initialData.images.length > 0
            ? initialData.images
            : (initialData?.image ? [initialData.image] : [])
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

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
            availableFrom: initialData.availableFrom || "",
            availableUntil: initialData.availableUntil || "",
        } : {
            category: "Other",
            condition: "Good",
            type: "Rent", // Default to Rent as per user preference likely
            images: [],
            availableFrom: "",
            availableUntil: "",
        },
    });

    const listingType = watch("type");

    const { data: session } = useSession();

    const onSubmit = async (data: FormData) => {
        if (!session) {
            toast({
                variant: "destructive",
                title: "Authentication Required",
                description: "Please sign in to post items",
            });
            return;
        }

        // Profile check handled globally by ProfileCompletionCheck

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
                availability: [], // Deprecated availability days
                availableFrom: listingType === "Rent" ? data.availableFrom : null,
                availableUntil: listingType === "Rent" ? data.availableUntil : null,
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
            toast({
                variant: "destructive",
                title: "Error",
                description: message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (imageUrls.length + files.length > 1) {
            toast({
                variant: "destructive",
                title: "Upload Limit",
                description: "You can only upload 1 image.",
            });
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
                } else {
                    console.error("Cloudinary upload failed", data);
                    toast({
                        variant: "destructive",
                        title: "Upload Failed",
                        description: "Upload failed. Please try again. " + (data.error?.message || ""),
                    });
                }
            }

            const updatedUrls = [...imageUrls, ...newUrls];
            setImageUrls(updatedUrls);
            setValue("images", updatedUrls);

        } catch (error) {
            console.error("Upload failed:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Image upload failed: " + (error instanceof Error ? error.message : "Unknown error"),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        const updatedUrls = imageUrls.filter((_, index) => index !== indexToRemove);
        setImageUrls(updatedUrls);
        setValue("images", updatedUrls);
    };



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">


            {/* Rent/Sell Toggle */}
            <div className="flex justify-center mb-8">
                <div className="bg-muted p-1.5 rounded-2xl inline-flex shadow-inner">
                    <button
                        type="button"
                        onClick={() => setValue("type", "Sell")}
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${listingType === "Sell"
                            ? "bg-background text-foreground shadow-md"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            }`}
                    >
                        Sell Item
                    </button>
                    <button
                        type="button"
                        onClick={() => setValue("type", "Rent")}
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${listingType === "Rent"
                            ? "bg-background text-foreground shadow-md"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            }`}
                    >
                        Rent Out
                    </button>
                </div>
            </div>



            {/* Basic Info */}
            <div className="bg-card p-6 sm:p-8 rounded-[2rem] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
                <h3 className="text-xl font-bold border-b pb-4">Basic Details</h3>

                <div className="space-y-3">
                    <label htmlFor="title" className="text-sm font-semibold">Item Name</label>
                    <input
                        {...register("title")}
                        placeholder="e.g., MacBook Pro M2, Concepts of Physics"
                        className="w-full p-4 rounded-xl border-0 ring-1 ring-inset ring-border bg-muted/50 focus:ring-2 focus:ring-inset focus:ring-primary transition-all"
                    />
                    {errors.title && <p className="text-destructive text-xs font-medium">{errors.title.message}</p>}
                </div>

                <div className="space-y-3">
                    <label htmlFor="description" className="text-sm font-semibold">Description</label>
                    <textarea
                        {...register("description")}
                        placeholder="Describe the item's condition, features, and any rules for renting..."
                        className="w-full p-4 rounded-xl border-0 ring-1 ring-inset ring-border bg-muted/50 focus:ring-2 focus:ring-inset focus:ring-primary transition-all min-h-[120px] resize-y"
                    />
                    {errors.description && <p className="text-destructive text-xs font-medium">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold">Category</label>
                        <select {...register("category")} className="w-full p-4 rounded-xl border-0 ring-1 ring-inset ring-border bg-muted/50 focus:ring-2 focus:ring-inset focus:ring-primary transition-all appearance-none cursor-pointer">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold">Condition</label>
                        <select {...register("condition")} className="w-full p-4 rounded-xl border-0 ring-1 ring-inset ring-border bg-muted/50 focus:ring-2 focus:ring-inset focus:ring-primary transition-all appearance-none cursor-pointer">
                            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-card p-6 sm:p-8 rounded-[2rem] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
                <h3 className="text-xl font-bold border-b pb-4">Pricing {listingType === "Rent" ? "& Availability" : ""}</h3>

                <div className="space-y-3">
                    <label htmlFor="price" className="text-sm font-semibold">
                        {listingType === "Rent" ? "Rental Price per Day (₹)" : "Selling Price (₹)"}
                    </label>
                    <div className="relative">
                        <span className="absolute left-5 top-[18px] text-muted-foreground font-semibold">₹</span>
                        <input
                            {...register("price")}
                            type="number"
                            step="0.01"
                            placeholder={listingType === "Rent" ? "e.g. 50" : "e.g. 1500"}
                            className="w-full p-4 pl-9 rounded-xl border-0 ring-1 ring-inset ring-border bg-muted/50 focus:ring-2 focus:ring-inset focus:ring-primary transition-all font-medium text-lg"
                        />
                    </div>
                    {errors.price && <p className="text-destructive text-xs font-medium">{errors.price.message}</p>}
                </div>

                {listingType === "Rent" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold">Available From</label>
                            <input
                                {...register("availableFrom")}
                                type="date"
                                className="w-full p-4 rounded-xl border-0 ring-1 ring-inset ring-border bg-muted/50 focus:ring-2 focus:ring-inset focus:ring-primary transition-all appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-semibold">Available Until</label>
                            <input
                                {...register("availableUntil")}
                                type="date"
                                className="w-full p-4 rounded-xl border-0 ring-1 ring-inset ring-border bg-muted/50 focus:ring-2 focus:ring-inset focus:ring-primary transition-all appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Image Upload Section */}
            <div className="bg-card p-6 sm:p-8 rounded-[2rem] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
                <h3 className="text-xl font-bold border-b pb-4">Product Image</h3>

                <div className="border-2 border-dashed border-border rounded-xl p-8 bg-muted/10 hover:bg-muted/30 transition-colors text-center group cursor-pointer relative overflow-hidden">
                    <div className="flex flex-wrap justify-center gap-4 relative z-10">
                        {imageUrls.map((url, index) => (
                            <div key={index} className="relative w-32 h-32 rounded-xl overflow-hidden border shadow-sm shadow-black/5">
                                <Image
                                    src={url}
                                    alt={`Product ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); removeImage(index); }}
                                    className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white rounded-full p-1.5 h-7 w-7 flex items-center justify-center text-sm shadow-sm transition-all hover:scale-105 z-20"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {imageUrls.length < 1 && (
                            <div className="w-full h-32 flex flex-col items-center justify-center space-y-3">
                                <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </div>
                                <div className="text-sm font-semibold">Click to upload image</div>
                                <div className="text-xs text-muted-foreground font-medium">Max file size 5MB</div>
                            </div>
                        )}
                    </div>
                    {imageUrls.length < 1 && (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                            title="Upload images"
                        />
                    )}
                </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-16 rounded-2xl text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1 mt-8 bg-primary text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                    </>
                ) : (
                    initialData ? "Update Item" : "List Item"
                )}
            </Button>
        </form>
    );
}
