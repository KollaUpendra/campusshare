/**
 * @file SignOutButton.tsx
 * @description Dedicated sign-out button component with destructive styling.
 * @module Components/Auth/SignOutButton
 *
 * Purpose:
 * - Provides a clearly-styled sign-out action for use on the Profile page.
 * - Redirects to the home page after sign-out via the `callbackUrl` option.
 * - Separated from LoginButton because the Profile page (a Server Component)
 *   needs a small client island for the sign-out interaction.
 */

"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
    return (
        <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            onClick={() => signOut({ callbackUrl: "/" })}
        >
            <LogOut className="h-4 w-4" />
            Sign Out
        </Button>
    );
}
