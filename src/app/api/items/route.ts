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
import db from "@/infrastructure/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";

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

        // Blocked-user guard
        const poster = await db.user.findUnique({ where: { id: session.user.id }, select: { isBlocked: true } });
        if (poster?.isBlocked) {
            return new NextResponse("Your account has been blocked by admin", { status: 403 });
        }

        const body = await req.json();
        const { title, description, price, availability, image, images, category, condition, type, rentCoins, date, timeSlot, rentalDuration, availableFrom, availableUntil } = body;

        if (!title || !price || !availability || !Array.isArray(availability)) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Input length limits to prevent abuse
        if (title.length > 200) {
            return new NextResponse("Title too long (max 200 chars)", { status: 400 });
        }
        if (description && description.length > 2000) {
            return new NextResponse("Description too long (max 2000 chars)", { status: 400 });
        }

        // Validate day names
        const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const invalidDays = availability.filter((day: string) => !validDays.includes(day));
        if (invalidDays.length > 0) {
            return new NextResponse(`Invalid days: ${invalidDays.join(", ")}`, { status: 400 });
        }

        // Use specific images array if provided, otherwise fallback to legacy image field if present
        const imageList = images && images.length > 0 ? images : (body.image ? [body.image] : []);
        const mainImage = imageList[0] || null;

        const itemData: any = {
            title: title.trim(),
            description: description?.trim() || "",
            price: parseFloat(price),
            ownerId: session.user.id,
            category: category || "Other",
            condition: condition || "Used",
            type: type || "Rent",
            status: "active",

            // New Fields for Time-Slot Renting
            rentCoins: rentCoins ? parseFloat(rentCoins) : 0,
            date: date || null,
            timeSlot: timeSlot || null,
            rentalDuration: rentalDuration || null,
            availableFrom: availableFrom || null,
            availableUntil: availableUntil || null,

            images: imageList,
            image: mainImage, // Keep backward compatibility for thumbnail
            availability: {
                create: availability.map((day: string) => ({ dayOfWeek: day }))
            }
        };

        const newItem = await db.item.create({
            data: itemData,
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
import { processExpirations } from "@/services/scheduler.service";

export async function GET(req: Request) {
    try {
        // Lazy cleanup check
        await processExpirations();

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query");

        // Marketplace Filter:
        // Return items ONLY IF:
        // item.status = AVAILABLE (or 'active' for legacy compatibility)
        // AND no PENDING booking exists (handled by checking item status if we update it on booking)
        // AND currentDateTime < rentalDateTime (if date is present)

        const items = await db.item.findMany({
            where: {
                // Support both legacy 'active' and new 'AVAILABLE' status
                status: { in: ["active", "AVAILABLE"] },
                ...(query ? {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
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

        // Filter out expired items (if date is present and passed)
        const now = new Date();
        const validItems = items.filter(item => {
            if (item.date) {
                const itemDate = new Date(item.date);
                // Check if date has passed (simple check, creating a date object at 00:00)
                // If itemDate < today (ignoring time), it's expired.
                // For simplicity, we compare ISO strings
                return (item as any).date >= now.toISOString().split('T')[0];
            }
            return true;
        });

        return NextResponse.json(validItems);
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
        const { id, title, description, price, image, images, category, condition, type, availability, status, rentalDuration, availableFrom, availableUntil } = body;

        if (!id) {
            return new NextResponse("Missing Item ID", { status: 400 });
        }

        // Check ownership
        const existingItem = await db.item.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        if (!existingItem) {
            return new NextResponse("Item not found", { status: 404 });
        }

        if (existingItem.ownerId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // Validate day names if availability is provided
        if (availability && Array.isArray(availability)) {
            const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            const invalidDays = availability.filter((day: string) => !validDays.includes(day));

            if (invalidDays.length > 0) {
                return new NextResponse(`Invalid days: ${invalidDays.join(", ")}`, { status: 400 });
            }
        }

        // Prepare update data
        const imageList = images && images.length > 0 ? images : (image ? [image] : []);
        const mainImage = imageList[0] || null;

        const updateData: any = {
            title,
            description,
            price: price ? parseFloat(price) : undefined,
            status,
            category,
            condition,
            type,
            rentalDuration,
            availableFrom,
            availableUntil,
            images: imageList,
            image: mainImage
        };

        // Remove undefined keys
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);


        // Transaction to update item and replace availability
        const updatedItem = await db.$transaction(async (tx) => {
            // Update basic fields
            const item = await tx.item.update({
                where: { id },
                data: updateData
            });

            // Update availability only if provided
            if (availability && Array.isArray(availability)) {
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
            }

            return item;
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error("[ITEMS_PUT]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
