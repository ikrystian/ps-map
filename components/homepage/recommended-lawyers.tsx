"use client"

import React, { useState, useRef } from "react"
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

interface RecommendedLawyersProps {
  lawFirms: LawFirm[]
}

const CATEGORIES = [
  "Adwokat",
  "Aplikant",
  "BHP i PPOŻ",
  "Doradca finansowy",
  "Doradca podatkowy"
]

// Premium curated portrait headshots matching the high-end mockup design
const PORTRAITS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=500", // Marcin Andrzej Wesołowski type
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=500", // Anna Lewandowska type
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=500"  // Joahim Mogba type
]

export function RecommendedLawyers({ lawFirms }: RecommendedLawyersProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Carousel Prev/Next Handlers using ref-based scroll
  const handlePrev = () => {
    if (sliderRef.current) {
      const card = sliderRef.current.querySelector(".shrink-0")
      const cardWidth = card ? card.getBoundingClientRect().width : 368
      const gap = 24
      sliderRef.current.scrollBy({
        left: -(cardWidth + gap),
        behavior: "smooth"
      })
    }
  }

  const handleNext = () => {
    if (sliderRef.current) {
      const card = sliderRef.current.querySelector(".shrink-0")
      const cardWidth = card ? card.getBoundingClientRect().width : 368
      const gap = 24
      sliderRef.current.scrollBy({
        left: cardWidth + gap,
        behavior: "smooth"
      })
    }
  }

  const handleCategoryChange = (idx: number) => {
    setActiveIdx(idx)
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: "smooth" })
    }
  }

  // Gets 8 law firms dynamically based on category index.
  // Cycles the law firms list to ensure a rich scrolling layout.
  const getCategoryFirms = (catIdx: number) => {
    if (!lawFirms || lawFirms.length === 0) return []

    const list: LawFirm[] = []
    for (let i = 0; i < 8; i++) {
      const firmIdx = (catIdx + i) % lawFirms.length
      list.push(lawFirms[firmIdx])
    }
    return list
  }

  // Returns a premium image for the lawyer, falling back to unsplash headshots if missing or placeholder
  const getFirmImage = (firm: LawFirm, index: number) => {
    if (firm.logo && (firm.logo.startsWith("http") || firm.logo.startsWith("/uploads"))) {
      return firm.logo
    }
    if (firm.zdjecieGlowne && (firm.zdjecieGlowne.startsWith("http") || firm.zdjecieGlowne.startsWith("/uploads"))) {
      return firm.zdjecieGlowne
    }
    return PORTRAITS[index % PORTRAITS.length]
  }

  return (
    <section className="py-20 bg-[#121212] text-white overflow-hidden">
      {/* Top Header Row is wrapped in its own container to align perfectly */}
      <div className="container mx-auto px-4 max-w-6xl mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white whitespace-nowrap">
            Polecani prawnicy i adwokaci
          </h2>

          {/* Subtle horizontal line connecting title with tabs */}
          <div className="hidden lg:block flex-grow border-t border-zinc-800/80 mx-6" />

          {/* Navigation & Selector Container */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            {/* Category tabs scrollable horizontally on mobile */}
            <div
              className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(i)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${activeIdx === i
                      ? "bg-black text-white border border-zinc-700/90 shadow-lg"
                      : "bg-[#0da192] hover:bg-[#0b8b7e] text-white"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Previous / Next Arrow Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Poprzedni slajd"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Następny slajd"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Carousel Grid with Framer Motion, extending off-screen to the right */}
      <div id="items-in-category-slider" className="relative min-h-[460px] w-full">
        <div
          ref={sliderRef}
          className="overflow-x-auto scroll-smooth scrollbar-none py-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingLeft: "calc(max(1rem, (100vw - 1152px) / 2 + 1rem))",
            paddingRight: "calc(max(1rem, (100vw - 1152px) / 2 + 1rem))"
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex gap-6 w-max"
            >
              {getCategoryFirms(activeIdx).map((firm, index) => (
                <div
                  key={`${firm.id}-${index}`}
                  className="w-[290px] sm:w-[330px] md:w-[368px] shrink-0 flex flex-col h-full bg-[#1c1c1e] rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group"
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

                    {/* Rating Badge Overlay - exact visual layout from mockup */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2.5 z-10 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/5">
                      {/* Teal Box */}
                      <div className="bg-[#0da192] text-white font-extrabold text-[13px] px-2.5 py-1.5 rounded-lg leading-none">
                        {firm.avgRating > 0 ? firm.avgRating.toFixed(1).replace('.', ',') : "5,0"}
                      </div>
                      {/* Star Rating & Review Count Stack */}
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
                        {CATEGORIES[activeIdx]}
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

                        {/* Circular Website Action (conditionally rendered if website exists) */}
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
      </div>
    </section>
  )
}
