import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, bio, phoneNumber, image, year, branch, section, address } = body;

        const updatedUser = await db.user.update({
            where: { id: session.user.id },
            data: {
                name,
                bio,
                phoneNumber,
                year,
                branch,
                section,
                address,
                // Only update image if provided (handled by separate upload logic usually, 
                // but user might send Cloudinary URL here)
                ...(image ? { image } : {})
            }
        });

        return NextResponse.json({ message: "Profile updated", user: updatedUser });

    } catch (error: any) {
        if (error.code === 'P2025') {
            return new NextResponse("User record not found. Please sign out and sign in again.", { status: 404 });
        }
        console.error("[PROFILE_UPDATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
