/**
 * @file route.ts
 * @description API Handler for individual Item operations (CRUD by ID).
 * @module App/API/Items/[id]
 * 
 * Supported Methods:
 * - GET: Fetch a single item by ID.
 * - PATCH: Update an item (owner only). Supports availability re-creation.
 * - DELETE: Delete an item (owner only).
 */

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const item = await db.item.findUnique({
            where: { id: params.id },
            include: {
                availability: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                }
            }
        });

        if (!item) {
            return new NextResponse("Item not found", { status: 404 });
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error("[ITEM_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, description, price, availability, status } = body;

        const item = await db.item.findUnique({
            where: { id: params.id },
        });

        if (!item) {
            return new NextResponse("Item not found", { status: 404 });
        }

        if (item.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const updatedItem = await db.item.update({
            where: { id: params.id },
            data: {
                title,
                description,
                price,
                status,
                // Handle availability update if provided
                // This is complex with relation updates, simplest is deleteMany + create
                ...(availability ? {
                    availability: {
                        deleteMany: {},
                        create: availability.map((day: string) => ({ dayOfWeek: day }))
                    }
                } : {})
            }
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error("[ITEM_PATCH]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const item = await db.item.findUnique({
            where: { id: params.id },
        });

        if (!item) {
            return new NextResponse("Item not found", { status: 404 });
        }

        if (item.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await db.item.delete({
            where: { id: params.id },
        });

        return new NextResponse("Item deleted", { status: 200 });
    } catch (error) {
        console.error("[ITEM_DELETE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
