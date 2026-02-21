/**
 * @file page.tsx
 * @description The Dashboard of the CampusShare platform (Item Feed).
 * @module App/Dashboard
 * 
 * Purpose:
 * - Displays a searchable list of available items for logged-in users.
 * - Provides a "Post Item" shortcut for mobile users.
 * 
 * Data Fetching:
 * - Server Component that fetches data directly from the DB.
 * - Supports URL-based search queries.
 */

export const dynamic = "force-dynamic";

import ItemCard from "@/components/items/ItemCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import db from "@/lib/db";
import AuthGuard from "@/components/auth/AuthGuard";

async function getItems(query?: string, category?: string, type?: string) {
    try {
        const where: any = { status: { in: ["active", "AVAILABLE"] } };

        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
            ];
        }

        if (category && category !== "All") {
            where.category = category;
        }

        if (type && type !== "All") {
            where.type = type;
        }

        const items = await db.item.findMany({
            where,
            include: {
                availability: true,
                owner: {
                    select: {
                        name: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return items;
    } catch (error) {
        console.error("Failed to fetch items:", error);
        return [];
    }
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ query?: string; category?: string; type?: string }> }) {
    const { query, category, type } = await searchParams;
    const items = await getItems(query, category, type);

    const CATEGORIES = ["All", "Electronics", "Books", "Stationery", "Clothing", "Sports", "Other"];
    const TYPES = ["All", "Rent", "Sell"];

    return (
        <AuthGuard>
            <div className="flex flex-col gap-6 pb-20">
                {/* Search & Filter Header */}
                <section className="sticky top-14 z-40 bg-background/80 pt-4 pb-4 backdrop-blur-xl border-b border-border/50 space-y-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <form className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
                        <div className="flex gap-2 w-full">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    name="query"
                                    defaultValue={query}
                                    placeholder="Search campus items..."
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-0 shadow-sm ring-1 ring-inset ring-border bg-card text-base focus:ring-2 focus:ring-inset focus:ring-primary transition-all"
                                />
                            </div>
                            <Button type="submit" size="lg" className="rounded-2xl h-[50px] px-6 shadow-md bg-primary text-primary-foreground hover:shadow-lg transition-all hidden sm:flex">
                                Search
                            </Button>
                            <Button type="submit" size="icon" className="rounded-2xl h-[50px] w-[50px] shadow-md bg-primary text-primary-foreground hover:shadow-lg transition-all sm:hidden">
                                <Search className="h-5 w-5" />
                                <span className="sr-only">Search</span>
                            </Button>
                        </div>

                        {/* Scrolling Filters */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                            {/* Category Chips */}
                            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide gap-2 items-center">
                                <span className="text-sm font-semibold text-muted-foreground mr-1 hidden sm:block">Category</span>
                                {CATEGORIES.map(c => (
                                    <label key={c} className="cursor-pointer shrink-0">
                                        <input type="radio" name="category" value={c} defaultChecked={(category || "All") === c} className="peer sr-only" />
                                        <span className="px-4 py-1.5 rounded-full text-sm font-medium border border-border bg-card text-muted-foreground peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary transition-colors shadow-sm whitespace-nowrap block hover:bg-muted">
                                            {c === "All" ? "All" : c}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <div className="hidden sm:block w-px h-6 bg-border mx-2"></div>

                            {/* Type Chips */}
                            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide gap-2 items-center">
                                <span className="text-sm font-semibold text-muted-foreground mr-1 hidden sm:block">Type</span>
                                {TYPES.map(t => (
                                    <label key={t} className="cursor-pointer shrink-0">
                                        <input type="radio" name="type" value={t} defaultChecked={(type || "All") === t} className="peer sr-only" />
                                        <span className="px-4 py-1.5 rounded-full text-sm font-medium border border-border bg-card text-muted-foreground peer-checked:bg-secondary peer-checked:text-secondary-foreground peer-checked:border-secondary transition-colors shadow-sm whitespace-nowrap block hover:bg-muted">
                                            {t === "All" ? "All" : t}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </form>
                </section>

                {/* Items Grid */}
                <section className="flex flex-wrap gap-5 justify-start max-w-4xl mx-auto w-full pt-2">
                    {items.length > 0 ? (
                        items.map((item) => (
                            <div key={item.id} className="w-full sm:w-[calc(50%-0.625rem)]">
                                <ItemCard item={item} />
                            </div>
                        ))
                    ) : (
                        <div className="w-full flex flex-col items-center justify-center mt-8 py-16 px-4 text-center bg-card rounded-[2rem] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-6 animate-in zoom-in duration-500">
                                <Search className="h-10 w-10 opacity-70" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-foreground">No items found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
                                We couldn't find anything matching your search. Try adjusting your filters to find what you're looking for.
                            </p>
                            {(query || category !== "All" || type !== "All") && (
                                <Button asChild variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary/5 border-2 h-12 px-6">
                                    <Link href="/dashboard">
                                        Clear all filters
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}
                </section>

                {/* FAB for Mobile Post */}
                <Link href="/post-item" className="md:hidden fixed bottom-24 right-6 z-50">
                    <Button size="icon" className="h-16 w-16 rounded-full shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all bg-primary">
                        <PlusCircle className="h-7 w-7" />
                        <span className="sr-only">Post Item</span>
                    </Button>
                </Link>
            </div>
        </AuthGuard>
    );
}
