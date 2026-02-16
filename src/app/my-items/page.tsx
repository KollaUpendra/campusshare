import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import db from "@/infrastructure/db/client";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ItemCard from "@/features/items/components/ItemCard";

export const dynamic = "force-dynamic";

export default async function MyItemsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/");
    }

    const { user } = session;

    let myItems: any[] = [];

    try {
        myItems = await db.item.findMany({
            where: { ownerId: user.id },
            include: {
                availability: true,
                owner: { select: { name: true, image: true } }
            },
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("My Items Data Fetch Error:", error);
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Package className="h-6 w-6" />
                    My Items
                </h1>
                <Button size="sm" asChild>
                    <Link href="/post-item">List New Item</Link>
                </Button>
            </div>

            {myItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myItems.map((item) => (
                        <ItemCard key={item.id} item={item} showEditButton={true} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border rounded-lg bg-muted/20 text-muted-foreground">
                    <p className="mb-4">You haven't listed any items yet.</p>
                    <Button variant="outline" asChild>
                        <Link href="/post-item">List Your First Item</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
