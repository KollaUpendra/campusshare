import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, description, price, availability } = body;

        if (!title || !price || !availability || !Array.isArray(availability)) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const newItem = await db.item.create({
            data: {
                title,
                description,
                price,
                ownerId: session.user.id,
                availability: {
                    create: availability.map((day: string) => ({ dayOfWeek: day }))
                }
            }
        });

        return NextResponse.json(newItem);
    } catch (error) {
        console.error("[ITEMS_POST]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query");

        const items = await db.item.findMany({
            where: {
                status: "active",
                ...(query ? {
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } },
                    ]
                } : {})
            },
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

        return NextResponse.json(items);
    } catch (error) {
        console.error("[ITEMS_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
