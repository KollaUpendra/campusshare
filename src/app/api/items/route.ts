/**
 * @file route.ts
 * @description API Handler for Item management.
 * @module App/API/Items
 * 
 * Supported Methods:
 * - GET: Fetch list of items (with search).
 * - POST: Create a new rental item.
 * - DELETE: Remove an item (owner only).
 */

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST Handler for Items
 * Creates a new rental item listing.
 * 
 * Validations:
 * - User must be authenticated.
 * - Required fields: title, price, availability array.
 * - Availability must contain valid day names (Monday, Tuesday, etc.).
 * 
 * @param {Request} req - The HTTP request object.
 * @returns {NextResponse} JSON response of the created item or error.
 */
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

/**
 * GET Handler for Items
 * Retrieves active rental items.
 * 
 * Query Params:
 * - query: string (optional) - Search term for title or description (case-insensitive).
 * 
 * Notes:
 * - Always includes 'availability' and 'owner' (name/image) in the response.
 * - Ordered by creation date (newest first).
 * 
 * @param {Request} req - The HTTP request object.
 * @returns {NextResponse} JSON list of items.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query");

        const items = await db.item.findMany({
            where: {
                status: "active",
                ...(query ? {
                    OR: [
                        { title: { contains: query } },
                        { description: { contains: query } },
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


/**
 * DELETE Handler for Items
 * Removes a rental item.
 * 
 * Security:
 * - User must be authenticated.
 * - User must be the owner of the item.
 * 
 * @param {Request} req - JSON payload not required, uses URL params.
 * @returns {NextResponse} Success message or error.
 */
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return new NextResponse("Missing Item ID", { status: 400 });
        }

        const item = await db.item.findUnique({ where: { id } });

        if (!item) {
            return new NextResponse("Item not found", { status: 404 });
        }

        if (item.ownerId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        await db.item.delete({ where: { id } });

        return new NextResponse("Deleted", { status: 200 });
    } catch (error) {
        console.error("[ITEMS_DELETE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { id, title, description, price, availability } = body;

        if (!id || !title || !price || !availability || !Array.isArray(availability)) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const existingItem = await db.item.findUnique({
            where: { id }
        });

        if (!existingItem) {
            return new NextResponse("Item not found", { status: 404 });
        }

        if (existingItem.ownerId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const invalidDays = availability.filter((day: string) => !validDays.includes(day));

        if (invalidDays.length > 0) {
            return new NextResponse(`Invalid days: ${invalidDays.join(", ")}`, { status: 400 });
        }

        // Transaction to update item and replace availability
        const updatedItem = await db.$transaction(async (tx) => {
            // Update basic fields
            const item = await tx.item.update({
                where: { id },
                data: {
                    title,
                    description,
                    price,
                }
            });

            // Delete existing availability
            await tx.availability.deleteMany({
                where: { itemId: id }
            });

            // Create new availability
            if (availability.length > 0) {
                await Promise.all(availability.map((day: string) =>
                    tx.availability.create({
                        data: {
                            itemId: id,
                            dayOfWeek: day
                        }
                    })
                ));
            }

            return item;
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error("[ITEMS_PUT]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
