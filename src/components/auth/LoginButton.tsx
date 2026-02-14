/**
 * @file LoginButton.tsx
 * @description Authentication button component.
 * @module Components/Auth/LoginButton
 * 
 * Functionality:
 * - Shows "Loading..." while session checks.
 * - Shows "Sign Out" if logged in.
 * - Shows "Sign In" if logged out.
 */

'use client'

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

/**
 * LoginButton Component
 * Toggles between Sign In and Sign Out based on session state.
 */
export function LoginButton() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <Button variant="ghost" size="sm" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </Button>
        )
    }

    if (session) {
        return (
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign Out
            </Button>
        )
    }

    return (
        <Button variant="default" size="sm" onClick={() => signIn()}>
            Sign In
        </Button>
    )
}
