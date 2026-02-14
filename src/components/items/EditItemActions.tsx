/**
 * @file EditItemActions.tsx
 * @description Action buttons for item owners (Edit/Delete).
 * @module Components/Items/EditItemActions
 * 
 * Functionality:
 * - Provides navigation to the Edit page.
 * - Handles item deletion with confirmation.
 * - Restricted to item owners (usually handled by parent page logic).
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

export default function EditItemActions({ itemId }: { itemId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/items?id=${itemId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            router.push("/");
            router.refresh();
        } catch (error) {
            alert("Failed to delete item");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push(`/items/${itemId}/edit`)}
            >
                Edit Item
            </Button>
            <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
            >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
        </div>
    );
}
