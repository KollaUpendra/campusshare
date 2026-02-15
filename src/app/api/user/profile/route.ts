import { NextResponse } from "next/server";
import db from "@/infrastructure/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { bio, phoneNumber, image } = body;

        await db.user.update({
            where: { id: session.user.id },
            data: {
                bio,
                phoneNumber,
                // Only update image if provided (handled by separate upload logic usually, 
                // but user might send Cloudinary URL here)
                ...(image ? { image } : {})
            }
        });

        return NextResponse.json({ message: "Profile updated" });

    } catch (error: unknown) {
        console.error("[PROFILE_UPDATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
