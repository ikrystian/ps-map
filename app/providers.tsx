"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
        storageKey="theme"
      >
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
