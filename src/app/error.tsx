"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[GlobalError]", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-4xl font-extrabold text-destructive mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
                An unexpected error occurred. Please try again or go back to the home page.
            </p>
            <div className="flex gap-3">
                <Button onClick={reset}>Try Again</Button>
                <Button variant="outline" asChild>
                    <a href="/">Back to Home</a>
                </Button>
            </div>
        </div>
    );
}
