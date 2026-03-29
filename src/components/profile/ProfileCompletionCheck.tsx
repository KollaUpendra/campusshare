"use client";

import { useSession } from "next-auth/react";
import EditProfileDialog from "./EditProfileDialog";

export default function ProfileCompletionCheck() {
    const { data: session } = useSession();
    if (!session?.user) return null;
    
    // Compute if profile is incomplete directly during render
    const user = session.user as { name?: string | null, year?: string | null, branch?: string | null, section?: string | null, address?: string | null, phoneNumber?: string | null };
    const isIncomplete = !user.name || !user.year || !user.branch || !user.section || !user.address || !user.phoneNumber;
    
    // If complete, we don't need to force the dialog open, or we don't render it at all
    if (!isIncomplete) return null;

    // We reuse EditProfileDialog but we need to control it externally or just render it.
    // Since EditProfileDialog manages its own state, we might need to modify it to accept `open` prop or just wrap it.
    // Actually, EditProfileDialog has a trigger. We want it to be open automatically.
    // Let's create a wrapper that forces it open.
    
    // Ideally, EditProfileDialog should accept `open` and `onOpenChange` props if we want to control it.
    // But currently it manages its own state.
    
    // Instead of reusing the exact dialog component which has a trigger button, 
    // let's pass a special prop or just modify EditProfileDialog to handle "forced open".
    
    // For now, let's render a specific Dialog that LOOKS like the edit dialog, or 
    // better yet, update EditProfileDialog to allow being controlled.
    
    // I will refactor EditProfileDialog slightly to accept optional open state, OR
    // I will just use the EditProfileDialog logic here.
    
    // Let's use the EditProfileDialog component but we need to trigger it.
    // Since we can't click the trigger programmatically easily without a ref, 
    // I will modify EditProfileDialog to accept `defaultOpen` or `forceOpen`.
    
    return (
        <EditProfileDialog 
            user={session.user as { id: string; role: string; coins: number; name: string | null; email: string | null; image: string | null; bio: string | null; phoneNumber: string | null; year: string | null; branch: string | null; section: string | null; address: string | null; }} 
            forceOpen={true}
        />
    );
}
