"use client"

import { expertAvatar } from "@/lib/expert-avatar"
import { cn, stripHtmlTags } from "@/lib/utils"
import type { LawFirm } from "@/types"
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react"
import Link from "next/link"
import { useRef } from "react"

interface CategoryPromotedExpertsSliderProps {
  experts: LawFirm[]
  categoryName: string
}

const getOpinieText = (count: number) => {
  if (count === 1) return "opinia"
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) {
    return "opinie"
  }
  return "opinii"
}

export function CategoryPromotedExpertsSlider({
  experts,
  categoryName,
}: CategoryPromotedExpertsSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)

  if (!experts || experts.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    const el = sliderRef.current
    if (!el) return
    const cardWidth = el.firstElementChild?.getBoundingClientRect().width || 280
    const gap = 20
    el.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    })
  }

  return (
    <div className="mt-10 pt-10 border-t border-neutral-900/60" id="category-promoted-experts">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#121211] via-[#0c0c0b]/90 to-[#0e0e0d] border border-neutral-800/40 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-sm">
        {/* Decorative Background Glows */}
        <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-[#0da192]/5 blur-[100px] pointer-events-none" />
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-neutral-800/40 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0da192]/20 to-primary/10 flex items-center justify-center border border-[#0da192]/20 shadow-inner">
            <Sparkles className="w-5 h-5 text-[#0da192]" />
          </div>
          <div>
            <h2 className="font-playfair text-xl md:text-2xl font-bold text-white tracking-tight">
              Promowani eksperci w kategorii: {categoryName}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Eksperci, którzy wyróżnili swój profil w tej kategorii
            </p>
          </div>
        </div>

        {/* Slider */}
        <div className="relative z-10 px-1">
          {experts.length > 1 && (
            <button
              type="button"
              onClick={() => scroll("left")}
              className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] items-center justify-center text-white transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer shadow-lg z-30"
              aria-label="Poprzedni ekspert"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div
            ref={sliderRef}
            className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-proximity touch-pan-y touch-pan-x"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {experts.map((firm) => (
              <Link
                key={firm.id}
                href={`/ekspert/${firm.slug}?src=category-promoted`}
                className="w-[260px] sm:w-[290px] shrink-0 snap-start flex flex-col bg-[#18181a] rounded-2xl border border-neutral-800/60 overflow-hidden hover:border-[#0da192]/50 hover:shadow-xl hover:shadow-[#0da192]/5 transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-40 w-full overflow-hidden bg-zinc-900">
                  <img
                    src={expertAvatar(firm.logo)}
                    alt={firm.nazwa}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18181a] via-[#18181a]/10 to-transparent to-[85%]" />

                  {/* Badge "Promowany ekspert" */}
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#0da192]/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                    <Sparkles className="w-3 h-3" />
                    Promowany
                  </div>

                  {firm.reviewCount > 0 && (
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/50 border border-white/10">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-white">
                        {firm.avgRating > 0 ? firm.avgRating.toFixed(1).replace(".", ",") : "5,0"}
                      </span>
                      <span className="text-[10px] text-zinc-300">
                        ({firm.reviewCount} {getOpinieText(firm.reviewCount)})
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="text-[15px] font-bold font-playfair text-white line-clamp-1 group-hover:text-[#0da192] transition-colors duration-200">
                      {firm.nazwa}
                    </h3>
                    {firm.zweryfikowana && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#0da192] flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {firm.miasto}
                      {firm.voivodeship?.nazwa ? `, ${firm.voivodeship.nazwa}` : ""}
                    </span>
                  </p>

                  {firm.opis && (
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-3">
                      {stripHtmlTags(firm.opis)}
                    </p>
                  )}

                  <div className="mt-auto pt-3 border-t border-neutral-800/60 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-white transition-colors">
                      Zobacz profil
                    </span>
                    <span
                      className={cn(
                        "w-8 h-8 rounded-lg bg-[#0da192] group-hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200",
                        "group-hover:scale-105"
                      )}
                    >
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {experts.length > 1 && (
            <button
              type="button"
              onClick={() => scroll("right")}
              className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] items-center justify-center text-white transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer shadow-lg z-30"
              aria-label="Następny ekspert"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
