import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const settings = await db.systemSettings.findFirst();
        return NextResponse.json(settings || { rentServiceChargePercent: 0, sellServiceChargePercent: 0 });
    } catch (error) {
        console.error("[SETTINGS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { rentPercent, sellPercent } = body;

        // Upsert ensures we update if exists, or create if not
        const settings = await db.systemSettings.upsert({
            where: { id: "default-settings" }, // We'll manage a single row by fixing an ID or finding first
            update: {
                rentServiceChargePercent: parseFloat(rentPercent),
                sellServiceChargePercent: parseFloat(sellPercent),
            },
            create: {
                rentServiceChargePercent: parseFloat(rentPercent),
                sellServiceChargePercent: parseFloat(sellPercent),
            }
        });
        
        // Note: For 'upsert' to work with a fixed ID, we need to ensure findFirst logic in GET matches.
        // Better approach for single-row config:
        
        const existing = await db.systemSettings.findFirst();
        
        if (existing) {
             await db.systemSettings.update({
                where: { id: existing.id },
                data: {
                    rentServiceChargePercent: parseFloat(rentPercent),
                    sellServiceChargePercent: parseFloat(sellPercent),
                }
            });
        } else {
            await db.systemSettings.create({
                data: {
                    rentServiceChargePercent: parseFloat(rentPercent),
                    sellServiceChargePercent: parseFloat(sellPercent),
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[SETTINGS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
