"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BlockUserButtonProps {
    userId: string;
    isBlocked: boolean;
}

export default function BlockUserButton({ userId, isBlocked }: BlockUserButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleBlockAction = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/users/block", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, isBlocked: !isBlocked }),
            });

            if (!res.ok) {
                throw new Error("Failed to update user");
            }
            
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error updating user",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const actionText = isBlocked ? "Unblock" : "Block";
    const descriptionText = isBlocked 
        ? "This will restore the user's access to the platform. They will be able to log in again." 
        : "This will immediately prevent the user from logging in. Their existing sessions may be invalidated.";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant={isBlocked ? "outline" : "destructive"} 
                    size="sm"
                >
                    {isBlocked ? <CheckCircle className="h-4 w-4 mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
                    {actionText}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{actionText} User</DialogTitle>
                    <DialogDescription>
                        {descriptionText}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <p className="text-sm font-medium text-destructive">
                        Are you sure you want to proceed?
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button 
                        variant={isBlocked ? "default" : "destructive"} 
                        onClick={handleBlockAction} 
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Confirm {actionText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
