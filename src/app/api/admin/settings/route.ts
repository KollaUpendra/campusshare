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

        // Find the single configuration row or create it

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
