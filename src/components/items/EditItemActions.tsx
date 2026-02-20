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
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EditItemActions({ itemId }: { itemId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/items?id=${itemId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast({
                title: "Success",
                description: "Item deleted successfully.",
            });
            router.push("/");
            router.refresh();
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete item",
            });
        } finally {
            setIsDeleting(false);
            setOpen(false);
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
                onClick={() => setOpen(true)}
                disabled={isDeleting}
            >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this item? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Item
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
