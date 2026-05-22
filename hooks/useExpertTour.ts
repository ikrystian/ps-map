"use client"

import { useCallback, useEffect, useState } from "react"

export interface TourStep {
  element?: string
  intro: string
  title?: string
  position?: "top" | "bottom" | "left" | "right" | "auto"
}

const TOUR_KEY_PREFIX = "expert_tour_seen_"

export function useExpertTour(pageKey: string) {
  const [tourSeen, setTourSeen] = useState(true) // start as true to avoid flash
  const [introLoaded, setIntroLoaded] = useState(false)

  useEffect(() => {
    // Check if introjs is loaded
    const checkIntro = () => {
      if (typeof window !== "undefined" && (window as any).introJs) {
        setIntroLoaded(true)
      }
    }

    checkIntro()
    // Poll for introjs load if not ready yet
    const interval = setInterval(() => {
      if ((window as any).introJs) {
        setIntroLoaded(true)
        clearInterval(interval)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem(`${TOUR_KEY_PREFIX}${pageKey}`)
      setTourSeen(!!seen)
    }
  }, [pageKey])

  const markAsSeen = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${TOUR_KEY_PREFIX}${pageKey}`, "1")
      setTourSeen(true)
    }
  }, [pageKey])

  const resetTour = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`${TOUR_KEY_PREFIX}${pageKey}`)
      setTourSeen(false)
    }
  }, [pageKey])

  const startTour = useCallback(
    (steps: TourStep[], onComplete?: () => void) => {
      if (typeof window === "undefined" || !(window as any).introJs) return

      const introJs = (window as any).introJs

      const intro = introJs()
      intro.setOptions({
        steps: steps.map((step) => ({
          element: step.element ? document.querySelector(step.element) : undefined,
          intro: step.intro,
          title: step.title,
          position: step.position || "auto",
        })),
        nextLabel: "Dalej →",
        prevLabel: "← Wstecz",
        doneLabel: "Zakończ",
        skipLabel: "Pomiń",
        showProgress: true,
        showBullets: true,
        exitOnOverlayClick: false,
        disableInteraction: false,
        scrollToElement: true,
        scrollPadding: 30,
        overlayOpacity: 0.5,
      })

      intro.oncomplete(() => {
        markAsSeen()
        onComplete?.()
      })

      intro.onexit(() => {
        markAsSeen()
      })

      intro.start()
    },
    [markAsSeen]
  )

  return {
    tourSeen,
    introLoaded,
    startTour,
    resetTour,
    markAsSeen,
  }
}
