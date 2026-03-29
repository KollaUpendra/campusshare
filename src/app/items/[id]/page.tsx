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
import { User, Calendar, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BookingRequestButton from "@/components/items/BookingRequestButton";
import EditItemActions from "@/components/items/EditItemActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";

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

    let existingBooking = null;
    if (session?.user) {
        existingBooking = await db.booking.findFirst({
            where: {
                itemId: item.id,
                borrowerId: session.user.id,
                status: { notIn: ["REJECTED", "CANCELLED", "rejected", "cancelled"] }
            },
            orderBy: { createdAt: "desc" }
        });
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Image Gallery */}
            {item.images && item.images.length > 0 ? (
                 <div className="grid grid-cols-2 gap-2">
                    {item.images.map((img: string, idx: number) => (
                        <div key={idx} className={`relative w-full aspect-square rounded-xl overflow-hidden bg-muted ${idx === 0 ? "col-span-2 aspect-video" : ""}`}>
                            <Image
                                src={img}
                                alt={`${item.title} ${idx + 1}`}
                                fill
                                className="object-cover"
                                priority={idx === 0}
                            />
                        </div>
                    ))}
                 </div>
            ) : item.image ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            ) : null}

            <div className="space-y-4">
                <div>
                     <h1 className="text-3xl font-bold">{item.title}</h1>
                     <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge variant="outline">{item.condition}</Badge>
                        <Badge className={item.type === "Sell" ? "bg-green-600" : "bg-blue-600"}>
                            {item.type === "Sell" ? "For Sale" : "For Rent"}
                        </Badge>
                     </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{item.owner.name || "Unknown Owner"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-bold text-xl">
                        <IndianRupee className="h-5 w-5" />
                        <span>{item.price} {item.type === "Rent" ? "/day" : ""}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 border rounded-xl bg-card shadow-sm space-y-6">
                <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                </div>

                {item.type === "Rent" && (
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                             <Calendar className="h-4 w-4" />
                             Availability
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {item.availability && item.availability.length > 0 ? (
                                item.availability.map((a: { dayOfWeek: string }) => (
                                    <Badge key={a.dayOfWeek} variant="secondary">
                                        {a.dayOfWeek}
                                    </Badge>
                                ))
                            ) : (
                                <Badge variant="secondary">All Days of Week</Badge>
                            )}
                        </div>
                        {/* Type cast to handle new fields not yet in types */}
                        {(item as { availableFrom?: Date | string | null; availableUntil?: Date | string | null }).availableFrom && (item as { availableFrom?: Date | string | null; availableUntil?: Date | string | null }).availableUntil && (
                             <p className="text-sm text-muted-foreground mt-2">
                                From: {new Date((item as { availableFrom?: Date | string | null }).availableFrom!).toLocaleDateString()} — Until: {new Date((item as { availableUntil?: Date | string | null }).availableUntil!).toLocaleDateString()}
                             </p>
                        )}
                    </div>
                )}
            </div>

            <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t md:relative md:border-0 md:bg-transparent md:p-0 md:bottom-0 z-10">
                <div className="max-w-2xl mx-auto">
                    {isOwner ? (
                        <EditItemActions itemId={item.id} />
                    ) : (
                        <BookingRequestButton 
                            itemId={item.id} 
                            price={item.price} 
                            availableDays={item.availability.map((a: { dayOfWeek: string }) => a.dayOfWeek)}
                            availableFrom={(() => {
                                const val = (item as { availableFrom?: Date | string | null }).availableFrom;
                                if (val instanceof Date) return val.toISOString();
                                return val || null;
                            })()}
                            availableUntil={(() => {
                                const val = (item as { availableUntil?: Date | string | null }).availableUntil;
                                if (val instanceof Date) return val.toISOString();
                                return val || null;
                            })()}
                            type={item.type}
                            currentRequest={(existingBooking as any) || undefined}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
