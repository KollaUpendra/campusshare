"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, ShieldOff, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminUserActionsProps {
    userId: string;
    currentRole: string;
    isBlocked: boolean;
    isSelf: boolean;
}

export default function AdminUserActions({ userId, currentRole, isBlocked, isSelf }: AdminUserActionsProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleAction = async (action: "toggleRole" | "toggleBlock") => {
        setIsConfirmOpen(false);
        setLoading(action);
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action }),
            });

            if (!res.ok) {
                const msg = await res.text();
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: msg,
                });
                return;
            }

            toast({
                title: "Success",
                description: "User updated successfully.",
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

    if (isSelf) {
        return <Badge variant="outline">You</Badge>;
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction("toggleRole")}
                disabled={loading !== null}
            >
                {loading === "toggleRole" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : currentRole === "admin" ? (
                    <><ShieldOff className="h-3 w-3 mr-1" /> Demote</>
                ) : (
                    <><ShieldCheck className="h-3 w-3 mr-1" /> Make Admin</>
                )}
            </Button>

            <Button
                variant={isBlocked ? "default" : "destructive"}
                size="sm"
                onClick={() => {
                    if (!isBlocked) {
                        setIsConfirmOpen(true);
                    } else {
                        handleAction("toggleBlock");
                    }
                }}
                disabled={loading !== null}
            >
                {loading === "toggleBlock" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : isBlocked ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Unblock</>
                ) : (
                    <><Ban className="h-3 w-3 mr-1" /> Block</>
                )}
            </Button>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Block User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to block this user? They will not be able to log in to the platform.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={loading !== null}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleAction("toggleBlock")} disabled={loading !== null}>
                            {loading === "toggleBlock" && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            Confirm Block
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
