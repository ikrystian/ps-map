"use client"

import { cn } from "@/lib/utils"
import { ExternalLink, Megaphone } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

interface Ad {
  id: string
  name: string
  imageUrl: string | null
  linkUrl: string
  htmlContent: string | null
  location: string
}

interface AdBannerProps {
  location: "search_top" | "search_list_middle" | "category_top" | "category_sidebar"
  className?: string
}

export function AdBanner({ location, className }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)
  const [hideBanner, setHideBanner] = useState(false)
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchAd() {
      try {
        const response = await fetch(`/api/ads?location=${location}`)
        if (response.ok) {
          const data = await response.json()
          if (data.hideBanner) {
            setHideBanner(true)
          } else if (data.ad) {
            setAd(data.ad)
          }
        }
      } catch (err) {
        console.error("Failed to fetch advertisement", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAd()
  }, [location])

  // Obsługa śledzenia wyświetlenia za pomocą Intersection Observer
  useEffect(() => {
    if (!ad || hasTrackedImpression) return

    const currentRef = bannerRef.current
    if (!currentRef) return

    const trackImpression = async () => {
      setHasTrackedImpression(true)
      try {
        await fetch(`/api/ads/${ad.id}/track?type=impression`, {
          method: "POST",
        })
      } catch (err) {
        console.error("Failed to track ad impression", err)
      }
    }

    // Używamy Intersection Observer, aby zliczyć wyświetlenie dopiero, gdy baner pojawi się w 20% na ekranie
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackImpression()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.2 }
    )

    observer.observe(currentRef)

    return () => {
      observer.disconnect()
    }
  }, [ad, hasTrackedImpression])

  // Obsługa śledzenia kliknięcia
  const handleAdClick = async () => {
    if (!ad) return
    try {
      await fetch(`/api/ads/${ad.id}/track?type=click`, {
        method: "POST",
      })
    } catch (err) {
      console.error("Failed to track ad click", err)
    }
  }

  if (hideBanner) {
    return null
  }

  if (loading) {
    return (
      <div
        className={cn(
          "w-full bg-card/20 border border-border/40 rounded-lg animate-pulse",
          location === "category_sidebar" ? "h-[250px]" : "h-[90px]",
          className
        )}
      />
    )
  }

  // Zdefiniowanie stylów i tekstów dla placeholderów w zależności od umiejscowienia
  const getPlaceholderConfig = () => {
    switch (location) {
      case "category_sidebar":
        return {
          dimensions: "300 x 250 px",
          title: "Twoja reklama w sidebarze",
          description: "Dotrzyj do klientów przeglądających tę kategorię",
          containerClass: "h-[250px] flex-col p-4 text-center justify-center",
        }
      case "search_list_middle":
        return {
          dimensions: "728 x 90 px",
          title: "Reklama między wynikami",
          description: "Wyróżnij swoją ofertę w wynikach wyszukiwania",
          containerClass: "h-[100px] flex-col sm:flex-row gap-2 sm:gap-6 p-4 sm:px-6 items-center justify-between text-left",
        }
      case "category_top":
      case "search_top":
      default:
        return {
          dimensions: "970 x 90 px / 728 x 90 px",
          title: "Sponsorowany baner poziomy",
          description: "Zajmij najbardziej widoczne miejsce na stronie",
          containerClass: "h-[100px] flex-col sm:flex-row gap-2 sm:gap-6 p-4 sm:px-6 items-center justify-between text-left",
        }
    }
  }

  const placeholderConfig = getPlaceholderConfig()

  // Jeśli nie ma reklamy, wyświetlamy placeholder
  if (!ad) {
    return (
      <div
        className={cn(
          "relative overflow-hidden w-full rounded-xl border border-border/40 bg-gradient-to-br from-background to-background hover:border-primary/20 transition-all duration-300 group flex",
          placeholderConfig.containerClass,
          className
        )}
      >
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

        {/* Decorative ambient light */}
        <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all duration-300" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-card border border-border text-muted-foreground group-hover:text-primary group-hover:border-primary/20 transition-colors duration-300">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-foreground">{placeholderConfig.title}</h4>
              <span className="text-sm font-mono px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border/50">
                {placeholderConfig.dimensions}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{placeholderConfig.description}</p>
          </div>
        </div>

        <Link
          href="/reklama"
          className="relative z-10 mt-3 sm:mt-0 flex items-center justify-center gap-2 rounded-lg bg-card border border-border px-4 py-2 text-xs font-medium text-foreground/80 hover:text-foreground hover:bg-card hover:border-border transition-all duration-200"
        >
          <span>Zareklamuj się</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    )
  }

  // Jeśli jest reklama, renderujemy ją
  return (
    <div
      ref={bannerRef}
      className={cn(
        "relative overflow-hidden w-full rounded-xl border border-border bg-background flex items-center justify-center",
        location === "category_sidebar" ? "h-auto min-h-[250px]" : "h-auto min-h-[90px]",
        className
      )}
    >
      {ad.htmlContent ? (
        // Opcja 1: Wklejony kod HTML (np. skrypt Google AdSense)
        <div
          className="w-full h-full flex items-center justify-center"
          onClick={handleAdClick}
          dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
        />
      ) : ad.imageUrl ? (
        // Opcja 2: Grafika z linkiem
        <a
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleAdClick}
          className="relative block w-full h-full group"
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-200 z-10" />
          <img
            src={ad.imageUrl}
            alt={ad.name}
            className="w-full h-full object-cover max-h-[400px] rounded-xl"
          />
          <span className="absolute bottom-2 right-2 z-20 text-sm bg-black/60 backdrop-blur-xs text-muted-foreground px-1.5 py-0.5 rounded font-medium border border-border">
            Reklama
          </span>
        </a>
      ) : null}
    </div>
  )
}
