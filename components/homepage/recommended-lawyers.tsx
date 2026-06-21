"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
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
import { useRef, useState } from "react"

interface RecommendedLawyersProps {
  recommendedData?: Record<string, LawFirm[]>
  lawFirms: LawFirm[]
}

const CATEGORIES = [
  "Adwokat",
  "Aplikant",
  "BHP i PPOŻ",
  "Doradca finansowy",
  "Doradca podatkowy"
]

export function RecommendedLawyers({ recommendedData, lawFirms }: RecommendedLawyersProps) {
  const { status } = useSession()
  const isLoggedIn = status === "authenticated"
  const [activeIdx, setActiveIdx] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const categoriesList = recommendedData && Object.keys(recommendedData).length > 0
    ? Object.keys(recommendedData).sort()
    : CATEGORIES

  // Jeśli nie ma ani danych promocyjnych, ani ogólnych kancelarii, to ukrywamy cały blok
  if (
    (!recommendedData || Object.keys(recommendedData).length === 0) &&
    (!lawFirms || lawFirms.length === 0)
  ) {
    return null
  }

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

  // Gets law firms dynamically based on category index, displaying exactly 10 items.
  const getCategoryFirms = (catIdx: number) => {
    const currentCategory = categoriesList[catIdx]
    let list: LawFirm[] = []

    if (recommendedData && recommendedData[currentCategory]) {
      list = [...recommendedData[currentCategory]]
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
    return `https://images.unsplash.com/photo-${index % 2 === 0 ? "1560250097-0b93528c311a" : "1573496359142-b8d87734a5a2"}?auto=format&fit=crop&w=400&q=80`
  }

  return (
    <section className="py-8 xl:py-24 text-white overflow-hidden bg-card">
      {/* Top Header Row is wrapped in its own container to align perfectly */}
      <div className="container mx-auto px-4 max-w-8xl mb-12">
        <div className="mb-12">
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-xl md:text-3xl  font-light text-zinc-100 whitespace-nowrap font-playfair">
              Polecani prawnicy i adwokaci
            </h2>
            <div className="flex-grow border-t border-zinc-800/80" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Navigation & Selector Container */}
          <div className="flex gap-4 w-full">
            {/* Category tabs scrollable horizontally on mobile */}

            {categoriesList.map((cat, i) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(i)}
                className={`flex text-center flex-1 justify-center px-5 py-4 rounded-lg text-sm  font-semibold transition-all duration-200 cursor-pointer ${activeIdx === i
                  ? "bg-black text-white shadow-lg"
                  : "bg-[#0da192] hover:bg-[#0b8b7e] text-white"
                  }`}
              >
                {cat}
              </button>
            ))}

            {/* Previous / Next Arrow Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200 cursor-pointer"
                aria-label="Poprzedni slajd"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200 cursor-pointer"
                aria-label="Następny slajd"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Carousel Grid with Framer Motion, extending off-screen to the right */}
      <div id="items-in-category-slider" className="relative px-4 container mx-auto min-h-[460px]">
        <div
          ref={sliderRef}
          className="grid grid-cols-4 gap-4 w-full"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            // paddingLeft: "calc(max(1rem, (100vw - 1500px) / 2))",
            // paddingRight: "calc(max(1rem, (100vw - 1500px) / 2))"
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex gap-4 w-full"
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
                      <TooltipContent side="top" className="bg-[#1a1a1a] border-zinc-800 text-white text-xs">
                        Informacja dostępna po zalogowaniu
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return (
                  <div
                    key={`${firm.id}-${index}`}
                    className="w-full max-w-full shrink-0 flex flex-col h-full bg-[#1c1c1e] rounded-xl border border-white/15 overflow-hidden  hover:shadow-xl transition-all duration-300 group"
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
                      <div className="absolute bottom-4 left-4 flex items-center gap-2.5 z-10 p-2 rounded-xl border border-white/5">
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
                          <span className="text-sm text-zinc-300 font-semibold mt-1">
                            {firm.reviewCount || 11} opinii
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content and Metadata */}
                    <div className="relative px-6 py-6 text-center flex-grow flex flex-col justify-between">
                      <div>
                        {/* Upper Case Category subtitle */}
                        <span className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase block mb-1.5">
                          {categoriesList[activeIdx]}
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
                        <Link
                          href={`/ekspert/${firm.slug}`}
                          className="w-10 h-10 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] absolute right-0.25 bottom-0.25 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
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
      </div>
    </section>
  )
}
