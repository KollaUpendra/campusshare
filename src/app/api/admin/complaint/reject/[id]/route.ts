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

        if (!["OPEN", "UNDER_REVIEW"].includes(complaint.status)) {
            return new NextResponse("Complaint cannot be rejected in current status", { status: 400 });
        }

        await db.$transaction(async (tx: any) => {
            await tx.complaint.update({
                where: { id: complaintId },
                data: {
                    status: "REJECTED",
                    adminNotes: adminNotes || "Rejected by admin",
                    resolutionAction: "NONE"
                }
            });

            await tx.adminActionLog.create({
                data: {
                    adminId: session.user.id,
                    actionType: "REJECT_COMPLAINT",
                    complaintId,
                    notes: adminNotes || "Complaint rejected"
                }
            });
        });

        return NextResponse.json({ message: "Complaint rejected" });
    } catch (error) {
        console.error("[ADMIN_COMPLAINT_REJECT]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
