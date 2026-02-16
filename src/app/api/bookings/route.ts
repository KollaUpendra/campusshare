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
import db from "@/infrastructure/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";

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
        const { itemId, date, startDate, endDate, timeSlot } = body;

        if (!itemId) {
            return new NextResponse("Missing Item ID", { status: 400 });
        }

        // Fetch User
        const renter = await db.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, coins: true, name: true, isBlocked: true }
        });

        if (!renter) return new NextResponse("User not found", { status: 404 });
        if (renter.isBlocked) return new NextResponse("Your account has been blocked", { status: 403 });

        // Fetch Item
        const item = await db.item.findUnique({
            where: { id: itemId },
            include: { availability: true }
        });

        if (!item) return new NextResponse("Item not found", { status: 404 });
        if (item.ownerId === renter.id) return new NextResponse("Cannot book your own item", { status: 400 });

        // Status Check
        if (item.status !== 'active' && item.status !== 'AVAILABLE') {
            return new NextResponse("Item is not available", { status: 400 });
        }

        let bookingStartDate = startDate || date;
        let bookingEndDate = endDate || date;
        let totalPrice = item.price;
        let diffDays = 1;

        // Validation based on Type
        if (item.type === 'Rent') {
            if (!bookingStartDate) return new NextResponse("Start Date is required for rentals", { status: 400 });
            
            // Validate date format (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(bookingStartDate)) return new NextResponse("Invalid start date format", { status: 400 });
            if (bookingEndDate && !dateRegex.test(bookingEndDate)) return new NextResponse("Invalid end date format", { status: 400 });

            // If only one date provided, treat end = start
            if (!bookingEndDate) bookingEndDate = bookingStartDate;

            const startObj = new Date(bookingStartDate);
            const endObj = new Date(bookingEndDate);

            if (endObj < startObj) return new NextResponse("End date cannot be before start date", { status: 400 });

            // Calculate duration in days
            const diffTime = Math.abs(endObj.getTime() - startObj.getTime());
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive (1 day minimum)
            
            totalPrice = item.price * diffDays;

            // Check Availability for range (basic check: check start day)
            // Ideally we check every day in range, but for MVP checking start is okay or we check intersection
            const dayOfWeek = startObj.toLocaleDateString('en-US', { weekday: 'long' });

            // Availability Check (If restricted)
            if (item.availability.length > 0) {
                 const isAvailableDay = item.availability.some(a => a.dayOfWeek === dayOfWeek);
                 if (!isAvailableDay) return new NextResponse(`Item is not available on ${dayOfWeek}s`, { status: 400 });
            }

            // Expiry Check
            if ((item as any).availableUntil && (item as any).availableUntil < new Date().toISOString().split('T')[0]) {
                 return new NextResponse("This item's availability has expired", { status: 400 });
            }

            // Double Booking Check (Simple Overlap)
            // Check if any booking exists that overlaps with [start, end]
            // Existing Start <= New End AND Existing End >= New Start
            const overlap = await db.booking.findFirst({
                where: {
                    itemId,
                    status: { notIn: ["rejected", "REJECTED", "CANCELLED"] },
                    OR: [
                         // Case A: Single date legacy booking overlaps
                         {
                            date: {
                                gte: bookingStartDate,
                                lte: bookingEndDate
                            }
                         },
                         // Case B: Range booking overlaps
                         {
                            startDate: { lte: bookingEndDate },
                            endDate: { gte: bookingStartDate }
                         }
                    ]
                } as any
            });
            
            if (overlap) return new NextResponse("Item already booked for these dates", { status: 409 });
        
        } else {
            // Sell: No date needed, but we can set today's date for record
            bookingStartDate = new Date().toISOString().split('T')[0];
            bookingEndDate = bookingStartDate;
        }

        // --- CREATE BOOKING (PENDING) ---
        // We do NOT deduct coins here. Payment happens after approval.
        
        const result = await db.$transaction(async (tx) => {
            // 1. Create Booking
            const booking = await tx.booking.create({
                data: {
                    itemId,
                    borrowerId: renter.id,
                    date: bookingStartDate, // Backward compat
                    startDate: bookingStartDate,
                    endDate: bookingEndDate,
                    totalPrice: totalPrice,
                    timeSlot: timeSlot || null,
                    status: "PENDING"
                } as any
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
                    message: `New ${item.type} request for ${item.title} (${diffDays} days) by ${renter.name || "a user"}`
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
