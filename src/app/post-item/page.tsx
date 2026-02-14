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
    return (
        <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">List an Item</h1>
            </div>
            <AddItemForm />
        </div>
    );
}
