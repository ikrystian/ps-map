"use client"

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import * as React from "react"

/**
 * Wyciszamy w dev ostrzeżenia, których źródłem nie jest nasz kod — inaczej
 * zagłuszają prawdziwe błędy w konsoli. Filtrujemy po treści komunikatu, więc
 * zwykłe błędy hydratacji nadal się pokazują.
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const IGNORED_MESSAGES = [
    // next-themes wstrzykuje <script> do drzewa, żeby ustawić motyw przed paint.
    "Encountered a script tag",
    // Bitdefender (TrafficLight / Anti-tracker) dopisuje bis_skin_checked="1"
    // do każdego <div> zanim React zdąży zhydratyzować stronę, przez co React
    // widzi rozjazd na kilkuset elementach naraz. Atrybut nie istnieje w HTML-u
    // ani w naszym kodzie — jeśli jest w komunikacie, winne jest rozszerzenie.
    "bis_skin_checked",
  ]

  const origError = console.error
  let noticeShown = false

  console.error = (...args: unknown[]) => {
    const message = args.reduce<string>(
      (acc, arg) => (typeof arg === "string" ? `${acc} ${arg}` : acc),
      ""
    )

    if (IGNORED_MESSAGES.some((needle) => message.includes(needle))) {
      if (!noticeShown) {
        noticeShown = true
        origError.call(
          console,
          "[dev] Wyciszono ostrzeżenie spoza naszego kodu (rozszerzenie " +
            "przeglądarki lub skrypt zewnętrzny). Prawdziwych błędów hydratacji " +
            "szukaj w trybie incognito z wyłączonymi rozszerzeniami."
        )
      }
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
