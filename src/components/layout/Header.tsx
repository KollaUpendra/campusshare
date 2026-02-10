'use client'

import Link from "next/link"
import { Bell, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { LoginButton } from "@/components/auth/LoginButton"

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
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 border border-background"></span>
                                <span className="sr-only">Notifications</span>
                            </Button>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border">
                                {session.user?.image ? (
                                    <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="h-5 w-5 text-primary" />
                                )}
                            </div>
                        </>
                    ) : (
                        <LoginButton />
                    )}
                </div>
            </div>
        </header>
    )
}
