/**
 * @file ItemCard.tsx
 * @description UI Component for displaying valid rental items in a grid.
 * @module Components/Items/ItemCard
 */

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

/**
 * Props for the ItemCard component.
 * Represents the data structure of an item as returned by the API/Prisma.
 */
interface ItemCardProps {
    item: {
        id: string;
        title: string;
        description: string;
        price: number;
        owner: {
            name: string | null;
            image: string | null;
        };
        availability: {
            dayOfWeek: string;
        }[];
    };
}

/**
 * ItemCard Component
 * 
 * Displays a summary of a rental item in a card format.
 * - Shows title, price, owner, and available days.
 * - Links to the full item details page.
 */
export default function ItemCard({ item }: ItemCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold line-clamp-1">{item.title}</CardTitle>
                    <span className="font-bold text-primary">₹{item.price}/day</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-1 mt-1">
                    <User className="h-3 w-3" />
                    <span>{item.owner.name || "Unknown Owner"}</span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
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
