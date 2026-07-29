"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { LawFirm } from "@/types/lawfirms"
import { motion } from "framer-motion"
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star
} from "lucide-react"
import { useSession } from "next-auth/react"
import { EXPERT_AVATAR_FALLBACK } from "@/lib/expert-avatar"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

// Szerokość odniesienia pojedynczej zakładki i odstęp między nimi (gap-4)
// — na ich podstawie liczymy, ile kategorii zmieści się w jednym rzędzie.
const MIN_TAB_WIDTH = 150
const TAB_GAP = 16

const getOpinieText = (count: number) => {
  if (count === 1) return "opinia";
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    (lastTwoDigits < 10 || lastTwoDigits >= 20)
  ) {
    return "opinie";
  }
  return "opinii";
};

interface RecommendedLawyersProps {
  recommendedData?: Record<string, LawFirm[]>
  /**
   * Podkategorie kategorii wybranej przez administratora w ustawieniach
   * (drzewo z /admin/expertise-categories) — źródło zakładek sekcji.
   */
  recommendedCategories?: { id: string; nazwa: string }[]
  lawFirms: LawFirm[]
}

export function RecommendedLawyers({ recommendedData, recommendedCategories, lawFirms }: RecommendedLawyersProps) {
  const { status } = useSession()
  const isLoggedIn = status === "authenticated"
  const [activeIdx, setActiveIdx] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  // Widoczne okno zakładek: ile ich wchodzi w rząd i od której zaczynamy
  // Wartość startowa tylko do pierwszej klatki — zaraz zastąpi ją pomiar
  const [visibleCount, setVisibleCount] = useState(5)
  const [windowStart, setWindowStart] = useState(0)
  // Który przycisk strzałki jest aktualnie "kliknięty" — trzymamy stan chwilę
  // po kliknięciu (nie tylko na czas przytrzymania), żeby feedback był widoczny.
  const [clickedArrow, setClickedArrow] = useState<"prev" | "next" | null>(null)
  const clickedArrowTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flashArrowClick = (arrow: "prev" | "next") => {
    if (clickedArrowTimeout.current) clearTimeout(clickedArrowTimeout.current)
    setClickedArrow(arrow)
    clickedArrowTimeout.current = setTimeout(() => setClickedArrow(null), 0)
  }

  useEffect(() => {
    return () => {
      if (clickedArrowTimeout.current) clearTimeout(clickedArrowTimeout.current)
    }
  }, [])

  // Liczba kategorii zależy od konfiguracji administratora, więc pojemność
  // rzędu mierzymy z rzeczywistej szerokości kontenera zakładek.
  useEffect(() => {
    const element = tabsRef.current
    if (!element) return

    const measure = () => {
      const perRow = Math.floor((element.clientWidth + TAB_GAP) / (MIN_TAB_WIDTH + TAB_GAP))
      setVisibleCount(Math.max(1, perRow))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Zakładki pochodzą z konfiguracji administratora; gdy jej brak — z kategorii
  // wykupionych promocji, żeby opłacone wyróżnienia nie zniknęły ze strony.
  const categoriesList = recommendedCategories && recommendedCategories.length > 0
    ? recommendedCategories.map(c => c.nazwa)
    : Object.keys(recommendedData || {}).sort()

  // Bez skonfigurowanych kategorii albo bez jakichkolwiek ekspertów nie ma czego pokazać
  const hasAnyFirms =
    (lawFirms?.length ?? 0) > 0 ||
    Object.values(recommendedData || {}).some(list => list.length > 0)

  if (categoriesList.length === 0 || !hasAnyFirms) {
    return null
  }

  const safeActiveIdx = Math.min(activeIdx, categoriesList.length - 1)

  const maxWindowStart = Math.max(0, categoriesList.length - visibleCount)
  const safeWindowStart = Math.min(windowStart, maxWindowStart)
  const visibleCategories = categoriesList
    .slice(safeWindowStart, safeWindowStart + visibleCount)
    .map((nazwa, i) => ({ nazwa, index: safeWindowStart + i }))

  const handleCategoryChange = (idx: number) => {
    setActiveIdx(idx)

    // Wybrana kategoria musi być widoczna: wyjście poza prawą krawędź przesuwa
    // okno o tyle, by stała się ostatnią widoczną (i odwrotnie przy lewej).
    setWindowStart(() => {
      if (idx < safeWindowStart) return idx
      if (idx > safeWindowStart + visibleCount - 1) {
        return Math.min(idx - visibleCount + 1, maxWindowStart)
      }
      return safeWindowStart
    })

    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: "instant" })
    }
  }

  // Carousel Prev/Next Handlers that switch active category
  const handlePrev = () => {
    flashArrowClick("prev")
    const nextIdx = (safeActiveIdx - 1 + categoriesList.length) % categoriesList.length
    handleCategoryChange(nextIdx)
  }

  const handleNext = () => {
    flashArrowClick("next")
    const nextIdx = (safeActiveIdx + 1) % categoriesList.length
    handleCategoryChange(nextIdx)
  }

  // Gets law firms dynamically based on category index, displaying exactly 10 items.
  const getCategoryFirms = (catIdx: number) => {
    const currentCategory = categoriesList[catIdx]
    let list: LawFirm[] = []

    if (recommendedData && recommendedData[currentCategory]) {
      list = [...recommendedData[currentCategory]]
    }

    // Uzupełnij ekspertami z tej samej specjalizacji, zanim sięgniemy po dowolnych
    if (list.length < 4 && lawFirms && lawFirms.length > 0) {
      lawFirms
        .filter(firm => firm.expertiseCategory?.nazwa === currentCategory)
        .forEach(firm => {
          if (list.length < 4 && !list.some(f => f.id === firm.id)) {
            list.push(firm)
          }
        })
    }

    // Pad with other general lawFirms up to 4 items if we have fewer
    if (list.length < 4 && lawFirms && lawFirms.length > 0) {
      let i = 0
      while (list.length < 4 && i < lawFirms.length * 2) {
        const firmIdx = (catIdx + i) % lawFirms.length
        const firm = lawFirms[firmIdx]
        if (!list.some(f => f.id === firm.id)) {
          list.push(firm)
        }
        i++
      }
    }

    // Fallback if list is still empty or directly populated from fallback
    if (list.length === 0 && lawFirms && lawFirms.length > 0) {
      for (let i = 0; i < 4; i++) {
        const firmIdx = (catIdx + i) % lawFirms.length
        list.push(lawFirms[firmIdx])
      }
    }

    return list.slice(0, 4)
  }

  // Returns a premium image for the lawyer, falling back to unsplash headshots if missing or placeholder
  const getFirmImage = (firm: LawFirm, index: number) => {
    if (firm.logo && (firm.logo.startsWith("http") || firm.logo.startsWith("/uploads") || firm.logo.startsWith("/generate") || firm.logo.startsWith("/api/files"))) {
      return firm.logo
    }
    if (firm.zdjecieGlowne && (firm.zdjecieGlowne.startsWith("http") || firm.zdjecieGlowne.startsWith("/uploads") || firm.zdjecieGlowne.startsWith("/generate") || firm.zdjecieGlowne.startsWith("/api/files"))) {
      return firm.zdjecieGlowne
    }
    return EXPERT_AVATAR_FALLBACK
  }

  return (
    <section className="py-8 xl:py-24 text-white overflow-hidden bg-darker">
      {/* Top Header Row is wrapped in its own container to align perfectly */}
      <div className="container mx-auto px-4 max-w-8xl mb-12">
        <div className="mb-12">
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-2xl md:text-3xl  font-light text-zinc-100 sm:whitespace-nowrap font-playfair">
              Polecani prawnicy i adwokaci
            </h2>
            <div className="flex-grow border-t border-zinc-800/80" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Navigation & Selector Container */}
          <div className="flex gap-4 w-full">
            {/* Category tabs: only show the active category on mobile, all on desktop.
                Liczba zakładek zależy od konfiguracji admina, więc wiersz się zawija. */}
            <div ref={tabsRef} className="flex gap-4 flex-1 min-w-0 overflow-hidden">
              {visibleCategories.map(({ nazwa, index }) => (
                <button
                  key={nazwa}
                  onClick={() => handleCategoryChange(index)}
                  className={`recommended-lawyers-category-button whitespace-nowrap text-center flex-1 min-w-0 justify-center px-5 py-4 rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer ${safeActiveIdx === index
                    ? "bg-black text-white shadow-lg flex"
                    : "bg-[#0da192] hover:bg-[#0b8b7e] text-white hidden md:flex"
                    }`}
                >
                  {nazwa}
                </button>
              ))}
            </div>

            {/* Previous / Next Arrow Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0" id="main-arrows">
              <motion.button
                onClick={handlePrev}
                whileTap={{ scale: 0.85 }}
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer",
                  clickedArrow === "prev"
                    ? "bg-[#0b8b7e] ring-2 ring-white/40 scale-90"
                    : "bg-[#0da192] hover:bg-[#0b8b7e]"
                )}
                aria-label="Poprzedni slajd"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </motion.button>
              <motion.button
                onClick={handleNext}
                whileTap={{ scale: 0.85 }}
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer",
                  clickedArrow === "next"
                    ? "bg-[#0b8b7e] ring-2 ring-white/40 scale-90"
                    : "bg-[#0da192] hover:bg-[#0b8b7e]"
                )}
                aria-label="Następny slajd"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Carousel Grid with Framer Motion, extending off-screen to the right */}
      <div id="items-in-category-slider" className="relative px-4 container mx-auto min-h-[460px]">
        <div
          ref={sliderRef}
          className="item-in-category-slider w-full overflow-x-auto scrollbar-none snap-x snap-proximity scroll-smooth touch-pan-x"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="flex gap-4 w-max md:w-full">
            {getCategoryFirms(safeActiveIdx).map((firm, index) => {
              const ContactButton = ({ icon: Icon, href, title }: { icon: any, href: string, title: string }) => {
                const button = (
                  <a
                    href={isLoggedIn ? href : "#"}
                    onClick={(e) => {
                      if (!isLoggedIn) {
                        e.preventDefault()
                        e.stopPropagation()
                      }
                    }}
                    className={cn(
                      "w-10 h-10 rounded-full bg-[#0da192] flex items-center justify-center transition-all duration-200 shadow-md",
                      isLoggedIn ? "hover:bg-[#0b8b7e] hover:scale-105 active:scale-95" : "opacity-70 cursor-help"
                    )}
                    title={isLoggedIn ? title : undefined}
                  >
                    <Icon className={cn("w-4.5 h-4.5 text-white", Icon === Phone && "fill-white")} />
                  </a>
                )

                if (isLoggedIn) return button

                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {button}
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[#1a1a1a] border-zinc-800 text-white text-xs">
                      Informacja dostępna po zalogowaniu
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <Link
                  href={`/ekspert/${firm.slug}?src=home-recommended`}
                  key={`${firm.id}-${index}`}
                  className="w-[290px] sm:w-[340px] md:w-[calc(25%-12px)] shrink-0 snap-start flex flex-col h-full bg-[#1c1c1e] rounded-xl border border-white/15 overflow-hidden  hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Image Container with Rating Overlay */}
                  <div className="relative h-65 w-full overflow-hidden aspect-[6/2] bg-zinc-900">
                    <img
                      src={getFirmImage(firm, index)}
                      alt={firm.nazwa}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Bottom-fade black gradient to blend image into card background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f] via-[#1d1d1f]/20 to-transparent to-[96%]" />

                    {/* Rating Badge Overlay - exact visual layout from mockup */}
                    {firm.reviewCount > 0 && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2.5 z-10 p-2 rounded-xl border border-white/5">
                        {/* Teal Box */}
                        <div className="bg-[#0da192] text-white font-extrabold text-[13px] px-2.5 py-1.5 rounded-lg leading-none">
                          {firm.avgRating > 0 ? firm.avgRating.toFixed(1).replace('.', ',') : "5,0"}
                        </div>
                        {/* Star Rating & Review Count Stack */}
                        <div className="flex flex-col justify-center">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-3.5 h-3.5",
                                  i < Math.round(firm.avgRating || 5)
                                    ? "fill-[#f59e0b] text-[#f59e0b]"
                                    : "text-zinc-600 fill-none"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-zinc-300 font-semibold mt-1">
                            {firm.reviewCount} {getOpinieText(firm.reviewCount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content and Metadata */}
                  <div className="relative px-6 py-6 text-center flex-grow flex flex-col justify-between">
                    <div>
                      {/* Upper Case Category subtitle */}
                      <span className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase block mb-1.5">
                        {categoriesList[safeActiveIdx]}
                      </span>
                      {/* Lawyer / Firm Name */}
                      <h3 className="text-[19px] font-bold font-playfair text-white mb-2 line-clamp-1 group-hover:text-[#0da192] transition-colors duration-200">
                        <Link href={`/ekspert/${firm.slug}`}>
                          {firm.nazwa}
                        </Link>
                      </h3>
                      {/* Location text */}
                      <p className="text-xs text-[#C5A66F] flex items-center justify-center gap-1.5 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        {firm.miasto}{firm.voivodeship?.nazwa ? `, ${firm.voivodeship.nazwa}` : ", Świętokrzyskie"}
                      </p>
                    </div>

                    {/* Bottom Action Row with Circular and Square buttons */}
                    <div className="flex justify-center items-center w-full pt-4 border-t border-zinc-800/80">
                      <div className="flex gap-3">
                        {/* Circular Phone Action */}
                        <ContactButton
                          icon={Phone}
                          href={firm.numerTelefonu ? `tel:${firm.numerTelefonu}` : "tel:+48123456789"}
                          title="Zadzwoń do ekspercie"
                        />

                        {/* Circular Email Action */}
                        <ContactButton
                          icon={Mail}
                          href={firm.user?.email ? `mailto:${firm.user.email}` : "mailto:kontakt@prostasprawa.pl"}
                          title="Wyślij e-mail"
                        />

                        {/* Circular Website Action (conditionally rendered if website exists) */}
                        {(firm.stronaWww || firm.id.charCodeAt(0) % 2 === 0) && (
                          <ContactButton
                            icon={Globe}
                            href={firm.stronaWww || "https://prostasprawa.pl"}
                            title="Odwiedź stronę www"
                          />
                        )}
                      </div>

                      {/* Square Profile Navigation Link */}
                      <span
                        className="w-10 h-10 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] absolute right-0.25 bottom-0.25 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                        title="Zobacz pełny profil"
                      >
                        <ArrowUpRight className="w-5 h-5 text-white" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
