/**
 * @file page.tsx
 * @description Edit Item Page — allows the item owner to modify their listing.
 * @module App/Items/Edit
 *
 * Functionality:
 * - Server Component that pre-fetches item data from the database.
 * - Verifies authentication and ownership before rendering the form.
 * - Reuses AddItemForm in "edit mode" by passing `initialData`.
 * - Redirects to sign-in if unauthenticated, or to home if not the owner.
 *
 * Security:
 * - Ownership check prevents unauthorized users from accessing the edit form,
 *   even if they guess the URL. This is a defense-in-depth measure alongside
 *   the API route's own ownership validation.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import AddItemForm from "@/components/items/AddItemForm";

export default async function EditItemPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const item = await db.item.findUnique({
        where: { id: params.id },
        include: { availability: true }
    });

    if (!item) {
        notFound();
    }

    if (item.ownerId !== session.user.id) {
        // Prevent unauthorized editing
        redirect("/");
    }

    const cloudinaryConfig = {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
        apiKey: process.env.CLOUDINARY_API_KEY!,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-center mb-6">Edit Item</h1>
            <AddItemForm initialData={item} cloudinaryConfig={cloudinaryConfig} />
        </div>
    );
}
