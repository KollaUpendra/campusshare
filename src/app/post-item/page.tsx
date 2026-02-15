/**
 * @file page.tsx
 * @description Page for listing a new rental item.
 * @module App/PostItem
 * 
 * Functionality:
 * - Wraps the AddItemForm component.
 * - Provides a "Back" button to return to the home page.
 */

import AddItemForm from "@/features/items/components/AddItemForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PostItemPage() {
    const cloudinaryConfig = {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
        apiKey: process.env.CLOUDINARY_API_KEY!,
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">Add an Item</h1>
            </div>
            <AddItemForm cloudinaryConfig={cloudinaryConfig} />
        </div>
    );
}
