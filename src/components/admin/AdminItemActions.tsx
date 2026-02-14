"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Power, Trash2 } from "lucide-react";

interface AdminItemActionsProps {
    itemId: string;
    currentStatus: string;
}

export default function AdminItemActions({ itemId, currentStatus }: AdminItemActionsProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleToggleStatus = async () => {
        setLoading("toggle");
        try {
            const res = await fetch("/api/admin/items", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId }),
            });

            if (!res.ok) {
                alert(await res.text());
                return;
            }

            router.refresh();
        } catch {
            alert("Network error");
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to permanently delete this item?")) return;

        setLoading("delete");
        try {
            const res = await fetch(`/api/admin/items?itemId=${itemId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                alert(await res.text());
                return;
            }

            router.refresh();
        } catch {
            alert("Network error");
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
                onClick={handleDelete}
                disabled={loading !== null}
            >
                {loading === "delete" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <><Trash2 className="h-3 w-3 mr-1" /> Delete</>
                )}
            </Button>
        </div>
    );
}
