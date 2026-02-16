/**
 * @file Providers.tsx
 * @description Global Context Providers wrapper.
 * @module Components/Auth/Providers
 * 
 * Purpose:
 * - Wraps the application with NextAuth's SessionProvider.
 * - Allows client-side access to the `useSession` hook.
 */

'use client'

import { SessionProvider } from "next-auth/react"

/**
 * Providers Component
 * 
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to be wrapped.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>
}
