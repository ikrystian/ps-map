"use client"

import Hotjar from "@hotjar/browser"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import * as CookieConsent from "vanilla-cookieconsent"

/**
 * Hotjar — analityka zachowań użytkowników (mapy ciepła, nagrania sesji).
 *
 * Skrypt ładuje się WYŁĄCZNIE po wyrażeniu zgody na analityczne pliki cookies
 * (kategoria "analytics" w banerze zgód — patrz `components/CookieConsent.tsx`).
 * Hotjar zapisuje pliki cookies i rejestruje zachowanie w serwisie, więc zgodnie
 * z art. 173 Prawa telekomunikacyjnego oraz art. 6 ust. 1 lit. a RODO wymaga
 * uprzedniej zgody użytkownika.
 *
 * Identyfikator można nadpisać zmienną `NEXT_PUBLIC_HOTJAR_SITE_ID`.
 */
const SITE_ID = Number(process.env.NEXT_PUBLIC_HOTJAR_SITE_ID || 6752978)
const HOTJAR_VERSION = 6

export function HotjarAnalytics() {
  const pathname = usePathname()
  const [isInitialized, setIsInitialized] = useState(false)

  // Inicjalizacja po uzyskaniu zgody (również gdy użytkownik zmieni ją później).
  useEffect(() => {
    if (!SITE_ID || Number.isNaN(SITE_ID) || isInitialized) return

    const initIfConsented = () => {
      if (!CookieConsent.acceptedCategory("analytics")) return
      if (Hotjar.isReady()) {
        setIsInitialized(true)
        return
      }

      try {
        Hotjar.init(SITE_ID, HOTJAR_VERSION)
        setIsInitialized(true)
      } catch (error) {
        console.error("Hotjar init error:", error)
      }
    }

    // Zgoda zapisana w poprzedniej wizycie jest dostępna od razu; dla nowej
    // decyzji użytkownika czekamy na zdarzenia banera zgód.
    initIfConsented()
    window.addEventListener("cc:onConsent", initIfConsented)
    window.addEventListener("cc:onChange", initIfConsented)

    return () => {
      window.removeEventListener("cc:onConsent", initIfConsented)
      window.removeEventListener("cc:onChange", initIfConsented)
    }
  }, [isInitialized])

  // Nawigacja klienta (App Router) nie przeładowuje strony — Hotjar musi zostać
  // poinformowany o zmianie adresu, inaczej nagra całą sesję jako jeden widok.
  useEffect(() => {
    if (!isInitialized || !pathname || !Hotjar.isReady()) return
    Hotjar.stateChange(pathname)
  }, [isInitialized, pathname])

  return null
}
