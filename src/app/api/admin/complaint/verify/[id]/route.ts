import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import db from "@/infrastructure/db/client";

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { id: complaintId } = await props.params;
        const body = await req.json().catch(() => ({}));
        const { adminNotes } = body as any;

        const complaint = await db.complaint.findUnique({ where: { id: complaintId } });
        if (!complaint) return new NextResponse("Complaint not found", { status: 404 });

        if (complaint.status !== "OPEN") {
            return new NextResponse("Complaint is not in OPEN status", { status: 400 });
        }

        await db.$transaction(async (tx: any) => {
            await tx.complaint.update({
                where: { id: complaintId },
                data: {
                    status: "UNDER_REVIEW",
                    adminNotes: adminNotes || "Under review by admin"
                }
            });

            await tx.adminActionLog.create({
                data: {
                    adminId: session.user.id,
                    actionType: "VERIFY_COMPLAINT",
                    complaintId,
                    notes: adminNotes || "Complaint marked as under review"
                }
            });
        });

        return NextResponse.json({ message: "Complaint verified and under review" });
    } catch (error) {
        console.error("[ADMIN_COMPLAINT_VERIFY]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
