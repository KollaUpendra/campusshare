import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import db from "@/infrastructure/db/client";
import { redirect } from "next/navigation";
import ItemCard from "@/features/items/components/ItemCard";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/");
    }

    const wishlistItems = await db.wishlist.findMany({
        where: { userId: session.user.id },
        include: {
            item: {
                include: {
                    owner: {
                        select: { name: true, image: true }
                    },
                    availability: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    const items = wishlistItems.map(w => w.item);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
            
            {items.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl">
                    <p className="text-muted-foreground text-lg">Your wishlist is empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => (
                        <ItemCard key={item.id} item={item} isWishlisted={true} />
                    ))}
                </div>
            )}
        </div>
    );
}
