"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface BlockUserButtonProps {
    userId: string;
    isBlocked: boolean;
}

export default function BlockUserButton({ userId, isBlocked }: BlockUserButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const toggleBlock = async () => {
        if (!confirm(`Are you sure you want to ${isBlocked ? "unblock" : "block"} this user?`)) return;
        
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
            router.refresh();
        } catch (error) {
            alert("Error updating user");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button 
            variant={isBlocked ? "outline" : "destructive"} 
            size="sm" 
            onClick={toggleBlock} 
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isBlocked ? "Unblock" : "Block")}
        </Button>
    );
}
