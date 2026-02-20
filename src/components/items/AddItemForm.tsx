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
            <div className="flex justify-center mb-6">
                <div className="bg-muted p-1 rounded-lg inline-flex">
                    <button
                        type="button"
                        onClick={() => setValue("type", "Sell")}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${listingType === "Sell"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Sell
                    </button>
                    <button
                        type="button"
                        onClick={() => setValue("type", "Rent")}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${listingType === "Rent"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Rent
                    </button>
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



            {/* Category & Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Price */}
            {/* Price & Rental Specifics */}
            <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                    {listingType === "Rent" ? "Rental Price per Day (₹)" : "Price (₹)"}
                </label>
                <input
                    {...register("price")}
                    type="number"
                    step="0.01"
                    placeholder={listingType === "Rent" ? "e.g. 500" : "e.g. 1500"}
                    className="w-full p-3 border rounded-lg bg-background"
                />
                {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
            </div>

            {listingType === "Rent" && (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Available From</label>
                        <input
                            {...register("availableFrom")}
                            type="date"
                            className="w-full p-3 border rounded-lg bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Available Until</label>
                        <input
                            {...register("availableUntil")}
                            type="date"
                            className="w-full p-3 border rounded-lg bg-background"
                        />
                    </div>
                </>
            )}



            {/* Image Upload Section */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Product Image</label>
                <div className="border border-dashed rounded-lg p-4">
                    <div className="flex flex-wrap justify-center gap-4 mb-4">
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
                        {imageUrls.length < 1 && (
                            <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg border cursor-pointer hover:bg-muted/80 relative">
                                <span className="text-2xl text-muted-foreground">+</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                    title="Upload images"
                                />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Upload an image of your product.
                    </p>
                </div>
            </div>

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
