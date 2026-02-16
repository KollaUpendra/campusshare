import { NextResponse } from "next/server";
import db from "@/infrastructure/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { itemId } = body;

        if (!itemId) {
            return new NextResponse("Missing Item ID", { status: 400 });
        }

        const existing = await db.wishlist.findUnique({
            where: {
                userId_itemId: {
                    userId: session.user.id,
                    itemId
                }
            }
        });

        if (existing) {
            await db.wishlist.delete({
                where: {
                    userId_itemId: {
                        userId: session.user.id,
                        itemId
                    }
                }
            });
            return NextResponse.json({ message: "Removed from wishlist", isWishlisted: false });
        } else {
            await db.wishlist.create({
                data: {
                    userId: session.user.id,
                    itemId
                }
            });
            return NextResponse.json({ message: "Added to wishlist", isWishlisted: true });
        }

    } catch (error: unknown) {
        console.error("[WISHLIST_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const wishlist = await db.wishlist.findMany({
            where: { userId: session.user.id },
            select: { itemId: true }
        });

        return NextResponse.json(wishlist.map(w => w.itemId));

    } catch (error: unknown) {
        console.error("[WISHLIST_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
