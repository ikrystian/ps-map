"use client"

import {
  hasMarketingConsent,
  initFacebookPixel,
  initLinkedInInsight,
  trackFacebookPageView,
} from "@/lib/marketing-pixels"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface MarketingPixelsProps {
  /** Puste = Meta Pixel wyłączony w /admin/settings albo bez poprawnego ID. */
  facebookPixelId: string
  /** Puste = LinkedIn Insight Tag wyłączony w /admin/settings albo bez poprawnego ID. */
  linkedinPartnerId: string
  linkedinRegistrationConversionId: string
}

/**
 * Meta Pixel i LinkedIn Insight Tag. Skrypty ładują się WYŁĄCZNIE po zgodzie na
 * marketingowe pliki cookies (kategoria "marketing" w `components/CookieConsent.tsx`),
 * także gdy użytkownik wyrazi ją później. Wycofanie zgody czyści ich cookies
 * i przeładowuje stronę (autoClear w banerze), więc skrypty znikają.
 */
export function MarketingPixels({
  facebookPixelId,
  linkedinPartnerId,
  linkedinRegistrationConversionId,
}: MarketingPixelsProps) {
  const pathname = usePathname()
  const [isInitialized, setIsInitialized] = useState(false)
  const lastTrackedPath = useRef<string | null>(null)
  const isAdminArea = pathname?.startsWith("/admin") ?? false

  useEffect(() => {
    if (isInitialized || isAdminArea) return
    if (!facebookPixelId && !linkedinPartnerId) return

    const initIfConsented = () => {
      if (!hasMarketingConsent()) return
      try {
        if (facebookPixelId) initFacebookPixel(facebookPixelId)
        if (linkedinPartnerId) initLinkedInInsight(linkedinPartnerId, linkedinRegistrationConversionId)
        lastTrackedPath.current = window.location.pathname
        setIsInitialized(true)
      } catch (error) {
        console.error("Marketing pixels init error:", error)
      }
    }

    // Zgoda z poprzedniej wizyty jest dostępna od razu; na nową decyzję czekamy.
    initIfConsented()
    window.addEventListener("cc:onConsent", initIfConsented)
    window.addEventListener("cc:onChange", initIfConsented)

    return () => {
      window.removeEventListener("cc:onConsent", initIfConsented)
      window.removeEventListener("cc:onChange", initIfConsented)
    }
  }, [isInitialized, isAdminArea, facebookPixelId, linkedinPartnerId, linkedinRegistrationConversionId])

  // App Router nie przeładowuje strony — Meta Pixel trzeba poinformować o kolejnym widoku.
  // Pierwszy widok liczy już snippet przy inicjalizacji.
  useEffect(() => {
    if (!isInitialized || !pathname || pathname === lastTrackedPath.current) return
    lastTrackedPath.current = pathname
    trackFacebookPageView()
  }, [isInitialized, pathname])

  return null
}
