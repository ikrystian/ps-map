"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Category } from "@/types/categories"
import type { LawFirm } from "@/types/lawfirms"
import { AnimatePresence, motion } from "framer-motion"
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
import Link from "next/link"
import { useState } from "react"

interface MostConsultedCategoriesProps {
  consultedData?: Record<string, LawFirm[]>
  categories: Category[]
  lawFirms: LawFirm[]
}

const CATEGORY_TABS = [
  {
    id: "alimenty-i-rozwody",
    title: "ALIMENTY I ROZWODY",
    keywords: ["rodzinne", "alimenty", "rozwod", "rozwody", "małżeńskie", "slub"],
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {/* Left user */}
        <circle cx="7" cy="8" r="3" />
        <path d="M2 19c0-3 3-5 5-5" />
        {/* Vertical dividing line */}
        <line x1="12" y1="4" x2="12" y2="20" strokeDasharray="3 3" />
        {/* Right user */}
        <circle cx="17" cy="8" r="3" />
        <path d="M22 19c0-3-3-5-5-5" />
      </svg>
    )
  },
  {
    id: "dlugi-windykacja-egzekucje",
    title: "DŁUGI, WINDYKACJA, EGZEKUCJE",
    keywords: ["dlugi", "windykacja", "egzekucja", "egzekucje", "komornik", "finansowe", "bankowe"],
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {/* Clock */}
        <path d="M12 2a8 8 0 1 0 5 14.2" />
        <polyline points="12 6 12 12 15 14" />
        {/* Stack of Coins */}
        <ellipse cx="18" cy="14" rx="3" ry="1.5" />
        <path d="M15 14v3c0 .8 1.3 1.5 3 1.5s3-.7 3-1.5v-3" />
        <path d="M15 17v3c0 .8 1.3 1.5 3 1.5s3-.7 3-1.5v-3" />
      </svg>
    )
  },
  {
    id: "dziedziczenie-spadki-testamenty",
    title: "DZIEDZICZENIE, SPADKI, TESTAMENTY",
    keywords: ["spadki", "spadek", "testament", "dziedziczenie", "sukcesja"],
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <circle cx="10" cy="13" r="2" />
        <path d="M9 15l-1.5 3 2.5-1.5 2.5 1.5-1.5-3" />
        <line x1="8" y1="18" x2="12" y2="18" />
      </svg>
    )
  },
  {
    id: "pozyczki-i-kredyty",
    title: "POŻYCZKI I KREDYTY",
    keywords: ["pozyczki", "pozyczka", "kredyt", "kredyty", "chf", "franki", "frankowe"],
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <circle cx="12" cy="14" r="3" />
        <path d="M12 12v4M10.5 13h3M10.5 15h3" />
      </svg>
    )
  },
  {
    id: "zatrudnienie-i-umowy",
    title: "ZATRUDNIENIE I UMOWY",
    keywords: ["umowy", "umowa", "praca", "zatrudnienie", "pracownicze", "pracodawca"],
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 14h2a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1z" />
        <path d="M18 14h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2" />
        <path d="M6 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2" />
        {/* Heart */}
        <path d="M12 5c-1.3-1.3-3.2-1.3-4.5 0s-1.3 3.2 0 4.5l4.5 4.5 4.5-4.5c1.3-1.3 1.3-3.2 0-4.5s-3.2-1.3-4.5 0z" />
      </svg>
    )
  },
  {
    id: "dotacje-unijne",
    title: "DOTACJE UNIJNE",
    keywords: ["dotacje", "unijne", "ue", "unia", "europejska", "rozwoj"],
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {/* Circle of stars */}
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        {/* Text EU in the center */}
        <text x="12" y="14.5" textAnchor="middle" fontSize="7" fontWeight="900" fill="currentColor" fontFamily="system-ui, sans-serif" letterSpacing="0.5">EU</text>
        {/* Small stars */}
        <circle cx="12" cy="5" r="0.75" fill="currentColor" />
        <circle cx="15.5" cy="6" r="0.75" fill="currentColor" />
        <circle cx="18" cy="8.5" r="0.75" fill="currentColor" />
        <circle cx="19" cy="12" r="0.75" fill="currentColor" />
        <circle cx="18" cy="15.5" r="0.75" fill="currentColor" />
        <circle cx="15.5" cy="18" r="0.75" fill="currentColor" />
        <circle cx="12" cy="19" r="0.75" fill="currentColor" />
        <circle cx="8.5" cy="18" r="0.75" fill="currentColor" />
        <circle cx="6" cy="15.5" r="0.75" fill="currentColor" />
        <circle cx="5" cy="12" r="0.75" fill="currentColor" />
        <circle cx="6" cy="8.5" r="0.75" fill="currentColor" />
        <circle cx="8.5" cy="6" r="0.75" fill="currentColor" />
      </svg>
    )
  }
]

export function MostConsultedCategories({ consultedData, categories, lawFirms }: MostConsultedCategoriesProps) {
  const { status } = useSession()
  const isLoggedIn = status === "authenticated"
  const [activeIdx, setActiveIdx] = useState(0)

  // Filtrujemy zakładki po aktywnych promocjach (jeśli przekazano dane)
  const activeTabs = consultedData
    ? CATEGORY_TABS.filter((tab) => consultedData[tab.id] && consultedData[tab.id].length > 0)
    : CATEGORY_TABS

  // Jeśli brak aktywnych promocji w trybie dynamicznym - ukrywamy blok
  if (consultedData && activeTabs.length === 0) {
    return null
  }

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? activeTabs.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIdx((prev) => (prev === activeTabs.length - 1 ? 0 : prev + 1))
  }

  // Returns law firms dynamically based on keywords/promotions.
  const getCategoryFirms = (catIdx: number) => {
    if (activeTabs.length === 0) return []
    const tab = activeTabs[catIdx]

    if (consultedData) {
      return consultedData[tab.id] || []
    }

    if (!lawFirms || lawFirms.length === 0) return []

    const filtered = lawFirms.filter((firm) => {
      if (!firm.categories) return false
      return firm.categories.some((cat) =>
        tab.keywords.some((kw) => cat.nazwa?.toLowerCase().includes(kw))
      )
    })

    if (filtered.length >= 3) {
      return filtered.slice(0, 3)
    }

    // Fallback rotating method to guarantee exactly 3 gorgeous profiles are always shown
    const list: LawFirm[] = []
    for (let i = 0; i < 3; i++) {
      const firmIdx = (catIdx * 1 + i) % lawFirms.length
      list.push(lawFirms[firmIdx])
    }
    return list
  }

  const getFirmImage = (firm: LawFirm, index: number) => {
    if (firm.logo && (firm.logo.startsWith("http") || firm.logo.startsWith("/uploads") || firm.logo.startsWith("/generate") || firm.logo.startsWith("/api/files"))) {
      return firm.logo
    }
    if (firm.zdjecieGlowne && (firm.zdjecieGlowne.startsWith("http") || firm.zdjecieGlowne.startsWith("/uploads") || firm.zdjecieGlowne.startsWith("/generate") || firm.zdjecieGlowne.startsWith("/api/files"))) {
      return firm.zdjecieGlowne
    }
  }

  const getProfessionTitle = (firm: LawFirm) => {
    const name = firm.nazwa.toLowerCase()
    if (name.includes("radca")) return "RADCA PRAWNY"
    if (name.includes("ekspert")) return "EKSPERT"
    if (name.includes("aplikant")) return "APLIKANT"
    if (name.includes("doradca")) return "DORADCA PRAWNY"
    return "ADWOKAT"
  }

  return (
    <section className="py-20 xl:py-24 bg-darker text-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-8xl">
        {/* Title Header with elegant horizontal line separator */}
        <div className="flex items-center gap-6 mb-12">
          <h2 className="text-xl md:text-3xl  font-light text-zinc-100 whitespace-nowrap font-playfair">
            Najczęściej konsultowane kategorie
          </h2>
          <div className="flex-grow border-t border-zinc-800/80" />
        </div>

        {/* 6 Category Tabs Grid / Scrollable Row */}
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 md:mb-12 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scroll-smooth custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
          {activeTabs.map((tab, idx) => {
            const isActive = activeIdx === idx
            return (
              <button
                key={tab.id}
                onClick={() => setActiveIdx(idx)}
                className={`flex flex-col items-center justify-center p-1 md:p-4 text-center h-[96px] md:h-[140px] rounded-2xl cursor-pointer select-none transition-all duration-300 shadow-md shrink-0 w-[124px] md:w-[150px] md:w-auto md:shrink ${isActive
                  ? "bg-[#0da192] text-white border border-transparent scale-[1.03]"
                  : "bg-[#1c1c1e] text-zinc-300 border border-zinc-800/60 hover:bg-[#222225] hover:border-zinc-700/80 hover:text-white"
                  }`}
              >
                <div className="mb-1 md:mb-4">
                  {tab.icon(
                    `w-9 h-9 transition-colors duration-300 ${isActive ? "text-white" : "text-[#0da192]"
                    }`
                  )}
                </div>
                <span className="text-sm font-bold tracking-wider leading-tight">
                  {tab.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* Law Firm Carousel Grid with Smooth Fade Animation */}
        <div className="relative min-h-[460px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-3 lf:grid-cols-4 gap-6 max-w-8xl mx-auto"
            >
              {getCategoryFirms(activeIdx).map((firm, index) => {
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
                      <TooltipContent side="top" className="bg-[#1a1a1a] border-zinc-800 text-white font-sans text-xs">
                        Informacja dostępna po zalogowaniu
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return (
                  <div
                    key={`${firm.id}-${index}`}
                    className="flex flex-col h-full bg-[#1c1c1e] rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group"
                  >
                    {/* Image Container with Rating Overlay */}
                    <div className="relative h-85 w-full overflow-hidden aspect-[5/2] bg-zinc-900">
                      <img
                        src={getFirmImage(firm, index)}
                        alt={firm.nazwa}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />


                      {/* Rating Badge Overlay */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2.5 z-10  backdrop-blur-md p-2 rounded-xl border border-white/5">
                        <div className="bg-[#0da192] text-white font-extrabold text-[13px] px-2.5 py-1.5 rounded-lg leading-none">
                          {firm.avgRating > 0 ? firm.avgRating.toFixed(1).replace('.', ',') : "5,0"}
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                            ))}
                          </div>
                          <span className="text-sm text-black font-semibold mt-1">
                            {firm.reviewCount || 11} opinii
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content and Metadata */}
                    <div className="p-6 text-center flex-grow flex flex-col justify-between">
                      <div>
                        {/* Upper Case Category subtitle */}
                        <span className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase block mb-1.5">
                          {getProfessionTitle(firm)}
                        </span>
                        {/* Lawyer / Firm Name */}
                        <h3 className="text-[19px] font-bold font-playfair text-white mb-2 line-clamp-1 group-hover:text-[#0da192] transition-colors duration-200">
                          <Link href={`/ekspert/${firm.slug}`}>
                            {firm.nazwa}
                          </Link>
                        </h3>
                        {/* Location text */}
                        <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5 mb-6">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          {firm.miasto}{firm.voivodeship?.nazwa ? `, ${firm.voivodeship.nazwa}` : ", Świętokrzyskie"}
                        </p>
                      </div>

                      {/* Bottom Action Row with Circular and Square buttons */}
                      <div className="flex justify-center items-center w-full pt-4 border-t border-zinc-800/80">
                        <div className="flex gap-2">
                          {/* Circular Phone Action */}
                          <ContactButton
                            icon={Phone}
                            href={firm.numerTelefonu ? `tel:${firm.numerTelefonu}` : "tel:+48123456789"}
                            title="Zadzwoń do ekspercie"
                          />

                          {/* Circular Email Action */}
                          <ContactButton
                            icon={Mail}
                            href={firm.emailKontakt ? `mailto:${firm.emailKontakt}` : "mailto:kontakt@prostasprawa.pl"}
                            title="Wyślij e-mail"
                          />

                          {/* Circular Website Action */}
                          {(firm.stronaWww || firm.id.charCodeAt(0) % 2 === 0) && (
                            <ContactButton
                              icon={Globe}
                              href={firm.stronaWww || "https://prostasprawa.pl"}
                              title="Odwiedź stronę www"
                            />
                          )}
                        </div>

                        {/* Square Profile Navigation Link */}
                        <Link
                          href={`/ekspert/${firm.slug}`}
                          className="w-10 h-10 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] absolute right-0 bottom-0 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                          title="Zobacz pełny profil"
                        >
                          <ArrowUpRight className="w-5 h-5 text-white" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows at the bottom center */}
        <div className="flex justify-center gap-4 mt-12">
          <button
            onClick={handlePrev}
            className="w-12 h-10 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Poprzednia kategoria"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-10 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Następna kategoria"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </section>
  )
}
