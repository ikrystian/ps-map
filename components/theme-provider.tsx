"use client"

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import * as React from "react"

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const origError = console.error
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    ) {
      return
    }
    origError.apply(console, args)
  }
}

/**
 * vanilla-cookieconsent nie czyta klasy `.dark` — ma własny przełącznik
 * `.cc--darkmode` na <html>. Trzymamy go w zgodzie z motywem aplikacji.
 */
function CookieConsentThemeSync() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    document.documentElement.classList.toggle(
      "cc--darkmode",
      resolvedTheme === "dark"
    )
  }, [resolvedTheme])

  return null
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <CookieConsentThemeSync />
      {children}
    </NextThemesProvider>
  )
}
