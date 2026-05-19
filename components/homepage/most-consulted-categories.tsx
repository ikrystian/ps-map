"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"
import type { LawFirm } from "@/types/lawfirms"
import type { Category } from "@/types/categories"

interface MostConsultedCategoriesProps {
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

const PORTRAITS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=500", // Marcin Andrzej Wesołowski type
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=500", // Anna Lewandowska type
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=500"  // Joahim Mogba type
]

export function MostConsultedCategories({ categories, lawFirms }: MostConsultedCategoriesProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? CATEGORY_TABS.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIdx((prev) => (prev === CATEGORY_TABS.length - 1 ? 0 : prev + 1))
  }

  // Returns 3 law firms dynamically based on keywords. If not enough exist, falls back to rotating standard firms
  const getCategoryFirms = (catIdx: number) => {
    if (!lawFirms || lawFirms.length === 0) return []

    const tab = CATEGORY_TABS[catIdx]
    const filtered = lawFirms.filter((firm) => {
      if (!firm.categories) return false
      return firm.categories.some((cat) => 
        tab.keywords.some((kw) => cat.nazwa.toLowerCase().includes(kw))
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
    if (firm.logo && (firm.logo.startsWith("http") || firm.logo.startsWith("/uploads"))) {
      return firm.logo
    }
    if (firm.zdjecieGlowne && (firm.zdjecieGlowne.startsWith("http") || firm.zdjecieGlowne.startsWith("/uploads"))) {
      return firm.zdjecieGlowne
    }
    return PORTRAITS[index % PORTRAITS.length]
  }

  const getProfessionTitle = (firm: LawFirm) => {
    const name = firm.nazwa.toLowerCase()
    if (name.includes("radca")) return "RADCA PRAWNY"
    if (name.includes("kancelaria")) return "KANCELARIA"
    if (name.includes("aplikant")) return "APLIKANT"
    if (name.includes("doradca")) return "DORADCA PRAWNY"
    return "ADWOKAT"
  }

  return (
    <section className="py-20 bg-[#0d0d0d] text-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Title Header with elegant horizontal line separator */}
        <div className="flex items-center gap-6 mb-12">
          <h2 className="text-xl md:text-2xl font-serif font-light text-zinc-100 whitespace-nowrap">
            Najczęściej konsultowane kategorie
          </h2>
          <div className="flex-grow border-t border-zinc-800/80" />
        </div>

        {/* 6 Category Tabs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {CATEGORY_TABS.map((tab, idx) => {
            const isActive = activeIdx === idx
            return (
              <button
                key={tab.id}
                onClick={() => setActiveIdx(idx)}
                className={`flex flex-col items-center justify-center p-4 text-center h-[140px] rounded-2xl cursor-pointer select-none transition-all duration-300 shadow-md ${
                  isActive 
                    ? "bg-[#0da192] text-white border border-transparent scale-[1.03]" 
                    : "bg-[#1c1c1e] text-zinc-300 border border-zinc-800/60 hover:bg-[#222225] hover:border-zinc-700/80 hover:text-white"
                }`}
              >
                <div className="mb-4">
                  {tab.icon(
                    `w-9 h-9 transition-colors duration-300 ${
                      isActive ? "text-white" : "text-[#0da192]"
                    }`
                  )}
                </div>
                <span className="text-[10px] font-bold tracking-wider leading-tight">
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
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
            >
              {getCategoryFirms(activeIdx).map((firm, index) => (
                <div
                  key={`${firm.id}-${index}`}
                  className="flex flex-col h-full bg-[#1c1c1e] rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  {/* Image Container with Rating Overlay */}
                  <div className="relative h-60 w-full overflow-hidden aspect-[4/3] bg-zinc-900">
                    <img
                      src={getFirmImage(firm, index)}
                      alt={firm.nazwa}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Bottom-fade black gradient to blend image into card background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-[#1c1c1e]/10 to-transparent to-50%" />

                    {/* Rating Badge Overlay */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2.5 z-10 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/5">
                      <div className="bg-[#0da192] text-white font-extrabold text-[13px] px-2.5 py-1.5 rounded-lg leading-none">
                        {firm.avgRating > 0 ? firm.avgRating.toFixed(1).replace('.', ',') : "5,0"}
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                          ))}
                        </div>
                        <span className="text-[10px] text-zinc-300 font-semibold mt-1">
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
                      <h3 className="text-[19px] font-bold text-white mb-2 line-clamp-1 group-hover:text-[#0da192] transition-colors duration-200">
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
                    <div className="flex justify-between items-center w-full pt-4 border-t border-zinc-800/80">
                      <div className="flex gap-2">
                        {/* Circular Phone Action */}
                        <a 
                          href={firm.numerTelefonu ? `tel:${firm.numerTelefonu}` : "tel:+48123456789"} 
                          className="w-10 h-10 rounded-full bg-[#0da192] hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                          title="Zadzwoń do kancelarii"
                        >
                          <Phone className="w-4.5 h-4.5 text-white fill-white" />
                        </a>
                        
                        {/* Circular Email Action */}
                        <a 
                          href={firm.emailKontakt ? `mailto:${firm.emailKontakt}` : "mailto:kontakt@prostasprawa.pl"} 
                          className="w-10 h-10 rounded-full bg-[#0da192] hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                          title="Wyślij e-mail"
                        >
                          <Mail className="w-4.5 h-4.5 text-white" />
                        </a>
                        
                        {/* Circular Website Action */}
                        {(firm.stronaWww || firm.id.charCodeAt(0) % 2 === 0) && (
                          <a 
                            href={firm.stronaWww || "https://prostasprawa.pl"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-[#0da192] hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                            title="Odwiedź stronę www"
                          >
                            <Globe className="w-4.5 h-4.5 text-white" />
                          </a>
                        )}
                      </div>
                      
                      {/* Square Profile Navigation Link */}
                      <Link 
                        href={`/ekspert/${firm.slug}`}
                        className="w-10 h-10 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                        title="Zobacz pełny profil"
                      >
                        <ArrowUpRight className="w-5 h-5 text-white" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
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
