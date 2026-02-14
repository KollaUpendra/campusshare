/**
 * @file page.tsx
 * @description Dedicated Search Page.
 * @module App/Search
 * 
 * Functionality:
 * - Provides a full-screen search interface.
 * - Suggests popular categories.
 * - Redirects to the Home page with the selected query.
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/?query=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="max-w-md mx-auto pt-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Find Items</h1>
            <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="What aren you looking for?"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <Button type="submit" size="lg" className="w-full">Search</Button>
            </form>

            <div className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Categories</h3>
                <div className="flex flex-wrap gap-2">
                    {["Lab Coat", "Calculator", "Textbooks", "Charger", "Camera"].map(cat => (
                        <Button
                            key={cat}
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/?query=${cat}`)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
