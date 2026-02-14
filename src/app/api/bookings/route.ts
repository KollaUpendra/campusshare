/**
 * @file route.ts
 * @description API Handler for Booking management.
 * @module App/API/Bookings
 * 
 * Supported Methods:
 * - GET: Fetch bookings (incoming or outgoing).
 * - POST: Create a new booking request.
 */

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST Handler for Bookings
 * Creates a new booking request for an item.
 * 
 * Validations:
 * - User must be authenticated.
 * - Required fields: itemId, date.
 * - Date format must be YYYY-MM-DD.
 * - User cannot book their own item.
 * - Item must be available on the requested day of the week.
 * - Prevent double booking (item already booked for that date).
 * 
 * Side Effects:
 * - Creates a new Booking record with status "pending".
 * - Creates a Notification for the item owner.
 * 
 * @param {Request} req - The HTTP request object containing { itemId, date }.
 * @returns {NextResponse} JSON response of the created booking or error message.
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { itemId, date } = body;

        if (!itemId || !date) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return new NextResponse("Invalid date format. Use YYYY-MM-DD", { status: 400 });
        }

        // Get day of week from date
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

        const item = await db.item.findUnique({
            where: { id: itemId },
            include: { availability: true } // Include availability to check
        });

        if (!item) {
            return new NextResponse("Item not found", { status: 404 });
        }

        if (item.ownerId === session.user.id) {
            return new NextResponse("Cannot book your own item", { status: 400 });
        }

        // Check if item is available on this day of the week
        const isAvailableDay = item.availability.some(a => a.dayOfWeek === dayOfWeek);
        if (!isAvailableDay) {
            return new NextResponse(`Item is not available on ${dayOfWeek}s`, { status: 400 });
        }

        // Check if already booked for that date
        const existingBooking = await db.booking.findFirst({
            where: {
                itemId,
                date,
                status: { not: "rejected" } // Only prevent if accepted or pending
            }
        });

        if (existingBooking) {
            return new NextResponse("Item already booked for this date", { status: 409 });
        }

        const newBooking = await db.booking.create({
            data: {
                itemId,
                borrowerId: session.user.id,
                date,
                status: "pending"
            }
        });

        // Create Notification for Owner
        await db.notification.create({
            data: {
                userId: item.ownerId,
                message: `New booking request for ${item.title} on ${date} (${dayOfWeek}) by ${session.user.name || "a user"}`
            }
        });

        return NextResponse.json(newBooking);
    } catch (error) {
        console.error("[BOOKING_POST]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


/**
 * GET Handler for Bookings
 * Retrieves bookings for the current user.
 * 
 * Query Params:
 * - type: "incoming" | undefined
 *   - "incoming": Returns bookings *for* the user's items (user is the owner).
 *   - undefined (default): Returns bookings *by* the user (user is the borrower).
 * 
 * @param {Request} req - The HTTP request object.
 * @returns {NextResponse} JSON list of bookings.
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // 'my-bookings' (items I booked) or 'incoming' (requests for my items)

        if (type === 'incoming') {
            const bookings = await db.booking.findMany({
                where: {
                    item: {
                        ownerId: session.user.id
                    }
                },
                include: {
                    item: true,
                    borrower: {
                        select: { name: true, email: true, image: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(bookings);
        } else {
            // Default: My Bookings (items I requested)
            const bookings = await db.booking.findMany({
                where: {
                    borrowerId: session.user.id
                },
                include: {
                    item: {
                        include: {
                            owner: { select: { name: true, image: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(bookings);
        }

    } catch (error) {
        console.error("[BOOKINGS_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
