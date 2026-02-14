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
    const where: any = { status: "active" };
    
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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <ItemCard key={item.id} item={item} isWishlisted={wishlistSet.has(item.id)} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-muted-foreground">
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
