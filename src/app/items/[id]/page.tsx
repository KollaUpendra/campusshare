/**
 * @file page.tsx
 * @description Dynamic Item Details Page (e.g., /items/123).
 * @module App/Items/Details
 * 
 * Functionality:
 * - Fetches specific item details from the DB.
 * - Displays item metadata (owner, price, description, availability).
 * - Shows "Edit" actions if the viewer is the owner.
 * - Shows "Book" actions if the viewer is not the owner.
 */

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import db from "@/lib/db";
import { User, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BookingRequestButton from "@/components/items/BookingRequestButton";
import EditItemActions from "@/components/items/EditItemActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Props = {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ItemDetailsPage(props: Props) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    const item = await db.item.findUnique({
        where: { id: params.id },
        include: {
            owner: {
                select: { name: true, image: true, email: true }
            },
            availability: true
        }
    });

    if (!item) {
        notFound();
    }

    const isOwner = session?.user?.id === item.ownerId;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">{item.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{item.owner.name || "Unknown Owner"}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-primary font-bold">
                        <DollarSign className="h-4 w-4" />
                        <span>{item.price}/day</span>
                    </div>
                </div>
            </div>

            <div className="p-6 border rounded-xl bg-card shadow-sm space-y-6">
                <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                </div>

                <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Available Days
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {item.availability.map((a) => (
                            <Badge key={a.dayOfWeek} variant="secondary">
                                {a.dayOfWeek}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:relative md:border-0 md:bg-transparent md:p-0">
                <div className="max-w-2xl mx-auto">
                    {isOwner ? (
                        <EditItemActions itemId={item.id} />
                    ) : (
                        <BookingRequestButton itemId={item.id} price={item.price} availableDays={item.availability.map(a => a.dayOfWeek)} />
                    )}
                </div>
            </div>
        </div>
    );
}
