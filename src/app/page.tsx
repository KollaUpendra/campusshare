/**
 * @file page.tsx
 * @description The Homepage of the CampusShare platform.
 * @module App/Home
 * 
 * Purpose:
 * - Displays a searchable list of available items.
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
async function getItems(query?: string, category?: string, type?: string) {
  try {
    const where: any = { status: { in: ["active", "AVAILABLE"] } }; // Fix: include items set back to AVAILABLE after booking rejection

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

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home({ searchParams }: { searchParams: Promise<{ query?: string; category?: string; type?: string }> }) {
  const { query, category, type } = await searchParams;
  const items = await getItems(query, category, type);

  const session = await getServerSession(authOptions);
  const wishlistSet = new Set<string>();

  if (session?.user?.id) {
    const wishlist = await db.wishlist.findMany({
      where: { userId: session.user.id },
      select: { itemId: true }
    });
    wishlist.forEach(w => wishlistSet.add(w.itemId));
  }

  const CATEGORIES = ["All", "Electronics", "Books", "Stationery", "Clothing", "Sports", "Other"];
  const TYPES = ["All", "Rent", "Sell"];

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Search & Filter Header */}
      <section className="sticky top-14 z-40 bg-muted/30 pt-4 pb-2 backdrop-blur-sm space-y-2">
        <form className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              name="query"
              defaultValue={query}
              placeholder="Search items..."
              className="w-full pl-9 pr-4 py-2 rounded-full border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <select
              name="category"
              defaultValue={category}
              className="px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
            </select>

            <select
              name="type"
              defaultValue={type}
              className="px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {TYPES.map(t => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
            </select>

            <Button type="submit">Filter</Button>
          </div>
        </form>
      </section>

      {/* Items Grid */}
      <section className="flex flex-wrap gap-4 justify-start">
        {items.length > 0 ? (
          items.map((item) => (
            // Flex widths:
            // sm (2 cols): w-[calc(50%-0.5rem)] -> 100% - 1 gap (1*1rem) / 2
            // lg (3 cols): w-[calc(33.333%-0.67rem)] -> 100% - 2 gaps (2*1rem) / 3
            // Default (mobile): w-full, but user wants "side by side", so let's try to keep it responsive. 
            // If the user wants side-by-side on mobile too, we could use w-[calc(50%-0.5rem)].
            // Sticking to standard responsive behavior for now but using Flex as requested.
            <div key={item.id} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)]">
              <ItemCard item={item} isWishlisted={wishlistSet.has(item.id)} />
            </div>
          ))
        ) : (
          <div className="w-full text-center py-10 text-muted-foreground">
            <p>No items found.</p>
            {(query || category || type) && <p className="text-sm">Try broader search criteria.</p>}
          </div>
        )}
      </section>

      {/* FAB for Mobile Post */}
      <Link href="/post-item" className="md:hidden fixed bottom-20 right-4 z-50">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
          <PlusCircle className="h-6 w-6" />
          <span className="sr-only">Post Item</span>
        </Button>
      </Link>
    </div>
  );
}
