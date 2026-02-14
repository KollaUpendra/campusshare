"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Heart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface ItemCardProps {
    item: {
        id: string;
        title: string;
        description: string;
        price: number;
        image: string | null;
        owner: {
            name: string | null;
            image: string | null;
        };
        availability: {
            dayOfWeek: string;
        }[];
    };
    isWishlisted?: boolean;
}

export default function ItemCard({ item, isWishlisted = false }: ItemCardProps) {
    const [wishlisted, setWishlisted] = useState(isWishlisted);
    const { data: session } = useSession();

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            alert("Please sign in to add to wishlist");
            return;
        }

        const newState = !wishlisted;
        setWishlisted(newState); // Optimistic update

        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId: item.id }),
            });
        } catch (error) {
            console.error("Failed to toggle wishlist", error);
            setWishlisted(!newState); // Revert on error
        }
    };

    return (
        <Card className="overflow-hidden flex flex-col h-full group">
            <div className="relative w-full aspect-video bg-muted">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <span className="text-xs">No Image</span>
                    </div>
                )}
                
                <button 
                    onClick={toggleWishlist}
                    className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background text-red-500 shadow-sm transition-colors"
                >
                    <Heart className="h-4 w-4" fill={wishlisted ? "currentColor" : "none"} />
                </button>
            </div>
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold line-clamp-1">{item.title}</CardTitle>
                    <span className="font-bold text-primary">₹{item.price}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-1 mt-1">
                    <User className="h-3 w-3" />
                    <span>{item.owner.name || "Unknown Owner"}</span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {item.description}
                </p>
                <div className="flex flex-wrap gap-1">
                    {item.availability.map((a) => (
                        <Badge key={a.dayOfWeek} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {a.dayOfWeek.slice(0, 3)}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full" size="sm">
                    <Link href={`/items/${item.id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
