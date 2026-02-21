"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface ItemCardProps {
    item: {
        id: string;
        title: string;
        description: string;
        price: number;
        images: string[];
        owner: {
            name: string | null;
            image: string | null;
        };
        availability: {
            dayOfWeek: string;
        }[];
    };
    isWishlisted?: boolean;
    showEditButton?: boolean;
}

export default function ItemCard({ item, showEditButton = false }: ItemCardProps) {
    const { data: session } = useSession();



    return (
        <Card className="overflow-hidden flex flex-col h-full group border-0 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-3xl hover:-translate-y-1">
            <div className="relative w-full aspect-[4/3] bg-muted/50 overflow-hidden">
                {item.images && item.images.length > 0 ? (
                    <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground/60 bg-gradient-to-br from-muted to-muted/30">
                        <span className="text-xs font-medium tracking-wide">No Image</span>
                    </div>
                )}
                {/* Price Tag Overlay */}
                <div className="absolute top-3 right-3 bg-accent/90 backdrop-blur-md text-accent-foreground px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-accent/20">
                    ₹{item.price}
                </div>
            </div>
            <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl font-bold line-clamp-1 leading-tight">{item.title}</CardTitle>
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                        {item.owner.image ? (
                            <Image src={item.owner.image} alt={item.owner.name || "Owner"} width={20} height={20} className="object-cover" />
                        ) : (
                            <User className="h-3 w-3" />
                        )}
                    </div>
                    <span className="font-medium">{item.owner.name || "Unknown Owner"}</span>
                </div>
            </CardHeader>
            <CardContent className="p-5 pt-3 flex-grow space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.availability.map((a) => (
                        <Badge key={a.dayOfWeek} variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-muted/80 text-muted-foreground border-transparent">
                            {a.dayOfWeek.slice(0, 3)}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-5 pt-0 gap-3">
                {showEditButton ? (
                    <>
                        <Button asChild className="flex-1 rounded-xl shadow-none hover:bg-secondary/20" variant="outline" size="sm">
                            <Link href={`/items/${item.id}/edit`}>Edit</Link>
                        </Button>
                        <Button asChild className="flex-1 rounded-xl shadow-md hover:shadow-lg transition-all" size="sm">
                            <Link href={`/items/${item.id}`}>View</Link>
                        </Button>
                    </>
                ) : (
                    <Button asChild className="w-full rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary text-primary-foreground" size="default">
                        <Link href={`/items/${item.id}`}>View Details</Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
