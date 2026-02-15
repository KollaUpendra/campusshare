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
        const { itemId, date, timeSlot } = body;

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

        // Fetch User with Coins
        const renter = await db.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, coins: true, name: true, isBlocked: true }
        });

        if (!renter) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Blocked-user guard
        if (renter.isBlocked) {
            return new NextResponse("Your account has been blocked by admin", { status: 403 });
        }

        // Fetch Item
        const item = await db.item.findUnique({
            where: { id: itemId },
            include: { availability: true }
        });

        if (!item) {
            return new NextResponse("Item not found", { status: 404 });
        }

        if (item.ownerId === renter.id) {
            return new NextResponse("Cannot book your own item", { status: 400 });
        }

        // Check if item is available on this day of the week
        const isAvailableDay = item.availability.some(a => a.dayOfWeek === dayOfWeek);
        if (!isAvailableDay) {
            return new NextResponse(`Item is not available on ${dayOfWeek}s`, { status: 400 });
        }

        // Status Check
        if (item.status !== 'active' && item.status !== 'AVAILABLE') {
            return new NextResponse("Item is not available for booking", { status: 400 });
        }

        // Expiry Check
        if (item.date && item.date < new Date().toISOString().split('T')[0]) {
            return new NextResponse("This item's rental period has expired", { status: 400 });
        }

        // --- COIN & WALLET CHECK ---
        const rentCost = (item as any).rentCoins || 0;
        const requiredBalance = rentCost + 500;

        if ((renter.coins || 0) < requiredBalance) {
            return new NextResponse("Minimum balance of 500 coins must remain after booking", { status: 402 });
        }

        // Check if already booked for that date
        const existingBooking = await db.booking.findFirst({
            where: {
                itemId,
                date,
                status: { notIn: ["rejected", "REJECTED", "CANCELLED"] }
            }
        });

        if (existingBooking) {
            return new NextResponse("Item already booked for this date", { status: 409 });
        }

        // --- ATOMIC CREATION & STATUS UPDATE ---
        const result = await db.$transaction(async (tx) => {
            // 1. Create Booking
            const booking = await tx.booking.create({
                data: {
                    itemId,
                    borrowerId: renter.id,
                    date,
                    timeSlot: timeSlot || null,
                    status: "PENDING"
                }
            });

            // 2. Update Item Status -> PENDING (hides from marketplace)
            await tx.item.update({
                where: { id: itemId },
                data: { status: "PENDING" }
            });

            // 3. Create Notification for Owner
            await tx.notification.create({
                data: {
                    userId: item.ownerId,
                    message: `New booking request for ${item.title} on ${date} (${dayOfWeek}) by ${renter.name || "a user"}`
                }
            });

            return booking;
        });

        return NextResponse.json(result);
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
