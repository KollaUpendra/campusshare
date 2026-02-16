/**
 * @file Header.tsx
 * @description Global application header component.
 * @module Components/Layout/Header
 * 
 * Functionality:
 * - Displays the logo/brand.
 * - Shows user authentication state.
 * - Provides access to notifications and profile.
 */

'use client'

import Link from "next/link"
import { Bell, User as UserIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { LoginButton } from "@/features/auth/components/LoginButton"

/**
 * Header Component
 * 
 * Displays the top navigation bar.
 * - Handles user session state (logged in vs logged out).
 * - Shows Notifications bell and User Avatar if authenticated.
 * - Shows "Sign In" button if unauthenticated.
 * - Sticky positioning at the top of the viewport.
 */
export default function Header() {
    const { data: session } = useSession()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <span>CampusShare</span>
                </Link>

                <div className="flex items-center gap-2">
                    {session ? (
                        <>
                            <div className="hidden md:flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                                <span>🪙</span>
                                <span>{(session.user as any).coins?.toFixed(0) || 0}</span>
                            </div>

                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 border border-background"></span>
                                <span className="sr-only">Notifications</span>
                            </Button>
                            
                            <Link href="/profile">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border">
                                    {session.user?.image ? (
                                        <Image src={session.user.image} alt={session.user.name || "User"} width={32} height={32} className="h-full w-full object-cover" />
                                    ) : (
                                        <UserIcon className="h-5 w-5 text-primary" />
                                    )}
                                </div>
                            </Link>
                        </>
                    ) : (
                        <LoginButton />
                    )}
                </div>
            </div>
        </header>
    )
}
