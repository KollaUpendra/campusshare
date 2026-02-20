"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Power, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminItemActionsProps {
    itemId: string;
    currentStatus: string;
}

export default function AdminItemActions({ itemId, currentStatus }: AdminItemActionsProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleToggleStatus = async () => {
        setLoading("toggle");
        try {
            const res = await fetch("/api/admin/items", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId }),
            });

            if (!res.ok) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: await res.text(),
                });
                return;
            }

            router.refresh();
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Network error",
            });
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async () => {
        setIsConfirmOpen(false);
        setLoading("delete");
        try {
            const res = await fetch(`/api/admin/items?itemId=${itemId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: await res.text(),
                });
                return;
            }

            toast({
                title: "Success",
                description: "Item deleted successfully.",
            });
            router.refresh();
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Network error",
            });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                disabled={loading !== null}
            >
                {loading === "toggle" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <><Power className="h-3 w-3 mr-1" /> {currentStatus === "active" ? "Deactivate" : "Activate"}</>
                )}
            </Button>

            <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsConfirmOpen(true)}
                disabled={loading !== null}
            >
                {loading === "delete" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <><Trash2 className="h-3 w-3 mr-1" /> Delete</>
                )}
            </Button>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete this item? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={loading !== null}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading !== null}>
                            {loading === "delete" && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
