"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import EditProfileDialog from "./EditProfileDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function ProfileCompletionCheck() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (session && session.user) {
            const user = session.user as any;
            const isIncomplete = !user.name || !user.year || !user.branch || !user.section || !user.address || !user.phoneNumber;
            
            if (isIncomplete) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        }
    }, [session]);

    if (!isOpen || !session?.user) return null;

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
            user={session.user as any} 
            forceOpen={true}
        />
    );
}
