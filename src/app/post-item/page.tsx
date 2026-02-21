/**
 * @file page.tsx
 * @description Page for listing a new rental item.
 * @module App/PostItem
 * 
 * Functionality:
 * - Wraps the AddItemForm component.
 * - Provides a "Back" button to return to the home page.
 */

import AddItemForm from "@/components/items/AddItemForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PostItemPage() {
    const cloudinaryConfig = {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
        apiKey: process.env.CLOUDINARY_API_KEY!,
    };

    return (
        <div className="max-w-2xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8 pt-4">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shadow-sm hover:bg-muted" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Post an Item</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Fill out the details below to list your item on CampusShare.</p>
                </div>
            </div>
            <AddItemForm cloudinaryConfig={cloudinaryConfig} />
        </div>
    );
}
