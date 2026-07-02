"use client"

import type { LawFirm } from "@/types/lawfirms"
import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

const EXPERTS_COUNT = 24

const getFirmImage = (firm: LawFirm) => {
  if (firm.logo && (firm.logo.startsWith("http") || firm.logo.startsWith("/uploads") || firm.logo.startsWith("/generate") || firm.logo.startsWith("/api/files"))) {
    return firm.logo
  }
}

// Fisher-Yates — losowa kolejność ekspertów przy każdym wejściu na stronę
const shuffle = <T,>(items: T[]) => {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Sekcja "poziomej jazdy": pionowe przewijanie strony przesuwa ścieżkę
 * kart w poziomie. Sekcja dostaje wysokość równą nadmiarowi szerokości
 * ścieżki + wysokość okna, wewnętrzny kontener jest sticky, a ścieżka
 * jedzie w lewo proporcjonalnie do postępu. Na mobile — natywny
 * scroll poziomy zamiast przejmowania kółka.
 */
export function ExpertsShowcase() {
  const [experts, setExperts] = useState<LawFirm[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await fetch("/api/law-firms?limit=100&verifiedOnly=true")
        if (response.ok) {
          const data = await response.json()
          setExperts(shuffle<LawFirm>(data.lawFirms || []).slice(0, EXPERTS_COUNT))
        }
      } catch (error) {
        console.error("Error fetching showcase experts:", error)
      }
    }

    fetchExperts()
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track || experts.length === 0) return

    const isMobile = window.matchMedia("(max-width: 768px)")
    let travel = 0

    const onScroll = () => {
      if (isMobile.matches || travel === 0) return
      const rect = section.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, -rect.top / travel))
      track.style.transform = `translateX(${-progress * travel}px)`
      if (barRef.current) barRef.current.style.width = `${progress * 100}%`
    }

    const layout = () => {
      if (isMobile.matches) {
        section.style.height = ""
        track.style.transform = ""
        travel = 0
        return
      }
      travel = Math.max(0, track.scrollWidth - window.innerWidth)
      section.style.height = `${window.innerHeight + travel}px`
      onScroll()
    }

    // Pasek postępu przy natywnym przewijaniu (fallback mobilny)
    const onTrackScroll = () => {
      if (!isMobile.matches || !barRef.current) return
      const max = track.scrollWidth - track.clientWidth
      if (max > 0) barRef.current.style.width = `${(track.scrollLeft / max) * 100}%`
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", layout)
    isMobile.addEventListener("change", layout)
    track.addEventListener("scroll", onTrackScroll, { passive: true })
    layout()

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", layout)
      isMobile.removeEventListener("change", layout)
      track.removeEventListener("scroll", onTrackScroll)
    }
  }, [experts])

  if (experts.length === 0) return null

  return (
    <section
      ref={sectionRef}
      className="relative bg-darker border-t border-zinc-900/60"
      aria-label="Poznaj naszych ekspertów"
    >
      <div className="md:sticky md:top-0 md:h-screen md:overflow-hidden flex flex-col justify-center py-14 md:py-0">
        {/* Nagłówek z paskiem postępu */}
        <div className="container mx-auto px-4 max-w-7xl w-full flex items-end justify-between gap-8 mb-8 md:mb-12">
          <h2 className="font-playfair text-2xl md:text-3xl lg:text-[34px] font-normal text-white tracking-wide whitespace-nowrap">
            Poznaj naszych ekspertów
          </h2>
          <div className="hidden md:block relative flex-grow max-w-[280px] h-px bg-zinc-800 mb-2.5">
            <div ref={barRef} className="absolute -inset-y-px left-0 w-0 bg-[#008073]" />
          </div>
        </div>

        {/* Ścieżka kart — desktop: translateX sterowany scrollem, mobile: natywny scroll */}
        <div
          ref={trackRef}
          className="flex items-center gap-6 lg:gap-8 px-4 md:px-[6vw] w-auto md:w-max will-change-transform overflow-x-auto md:overflow-visible snap-x snap-proximity md:snap-none pb-6 md:pb-0 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {experts.map((firm, index) => {
            const profession = firm.expertiseCategory?.nazwa || firm.categories?.[0]?.nazwa || ""
            const voivodeship = firm.voivodeship?.nazwa

            return (
              <Link
                key={firm.id}
                href={`/ekspert/${firm.slug}`}
                className={cn(
                  "group shrink-0 snap-center flex flex-col bg-[#1d1d1f] rounded-2xl overflow-hidden border border-zinc-800/60 shadow-xl hover:shadow-2xl hover:border-zinc-700 transition-all duration-300",
                  // Naprzemienne szerokości kart dla rytmu, jak w galerii prac
                  index % 2 === 0 ? "w-[260px] md:w-[320px]" : "w-[230px] md:w-[270px]"
                )}
              >
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-zinc-950">
                  <img
                    src={getFirmImage(firm) || "/backgrounds/4.png"}
                    alt={firm.nazwa}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f] via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#008073] flex items-center justify-center text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="px-4 py-4 text-center">
                  {profession && (
                    <span className="text-[10px] font-bold text-zinc-400 tracking-[0.18em] uppercase block mb-1">
                      {profession}
                    </span>
                  )}
                  <h3 className="font-medium text-[16px] leading-tight text-white line-clamp-2 group-hover:text-[#008073] transition-colors duration-200">
                    {firm.nazwa}
                  </h3>
                  {firm.miasto && (
                    <p className="text-[11px] font-semibold text-[#cda567] tracking-wider mt-1.5">
                      {firm.miasto}
                      {voivodeship ? `, ${voivodeship}` : ""}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Podpowiedź kierunku na desktopie */}
        <div className="hidden md:block container mx-auto px-4 max-w-7xl w-full mt-8 text-xs text-zinc-600 tracking-widest uppercase">
          Przewijaj dalej, aby zobaczyć kolejnych ekspertów →
        </div>
      </div>
    </section>
  )
}
