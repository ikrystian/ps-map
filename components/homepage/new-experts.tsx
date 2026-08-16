"use client"

import type { LawFirm } from "@/types/lawfirms"
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"
import { EXPERT_AVATAR_FALLBACK } from "@/lib/expert-avatar"
import Link from "next/link"
import { useRef } from "react"

interface NewExpertsProps {
  newLawFirms: LawFirm[]
}



const getFirmImage = (firm: LawFirm, index: number) => {
  if (firm.logo && (firm.logo.startsWith("http") || firm.logo.startsWith("/uploads") || firm.logo.startsWith("/generate") || firm.logo.startsWith("/api/files"))) {
    return firm.logo
  }
}

export function NewExperts({ newLawFirms }: NewExpertsProps) {
  const sliderRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.firstElementChild?.getBoundingClientRect().width || 300
      const gap = 24
      sliderRef.current.scrollBy({
        left: -(cardWidth + gap),
        behavior: "smooth"
      })
    }
  }

  const scrollRight = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.firstElementChild?.getBoundingClientRect().width || 300
      const gap = 24
      sliderRef.current.scrollBy({
        left: cardWidth + gap,
        behavior: "smooth"
      })
    }
  }



  const experts = newLawFirms && newLawFirms.length > 0 ? newLawFirms : []

  return (
    <section className="py-12 lg:py-20 xl:py-24 bg-darker text-foreground overflow-hidden border-t border-border/60">
      <div className="container mx-auto px-4 max-w-7xl relative">

        {/* Title row with modern line design */}
        <div className="flex items-center justify-between gap-6 mb-4 lg:mb-16 px-1">
          <h2 className="font-playfair text-2xl md:text-3xl lg:text-[34px] font-normal text-foreground tracking-wide sm:whitespace-nowrap">
            Nowi eksperci już dostępni
          </h2>
          <div className="hidden md:block flex-grow border-t border-border/80" />
        </div>

        {/* Carousel / Slider Container */}
        <div className="relative w-full px-1">

          {/* Left Arrow Button */}
          <button
            onClick={scrollLeft}
            className="absolute -left-4 lg:-left-12 xl:-left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-primary-dark hover:bg-primary-dark flex items-center justify-center text-white transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer shadow-lg z-30"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Slider content area */}
          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-none py-4 snap-x snap-proximity touch-pan-y touch-pan-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {experts.map((firm, index) => {
              const profession = firm.expertiseCategory?.nazwa || firm.categories?.[0]?.nazwa || ""
              const voivodeship = firm.voivodeship?.nazwa;

              return (
                <Link
                  href={`/ekspert/${firm.slug}?src=home-new`}
                  key={firm.id}
                  className="w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] shrink-0 snap-start flex flex-col bg-card rounded-2xl overflow-hidden border border-border/60 shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
                >
                  {/* Image Section */}
                  <div className="relative h-[140px] md:h-[290px] w-full overflow-hidden bg-background">
                    {/* Gold emblem badge top-left */}
                    <div className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-card/95 border border-[#cda567]/60 flex items-center justify-center shadow-lg">
                      <svg className="w-[18px] h-[18px] text-[#cda567]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.86 11.18c-.46-1.58-1.5-2.88-2.92-3.66-.46-.25-1-.18-1.39.17l-1.92 1.76c-.34.31-.85.38-1.26.17l-1.96-1.01c-.55-.28-1.22.04-1.34.65l-.54 2.76c-.08.41.13.82.5 1.01l2.09 1.07c.33.17.48.56.35.91l-.99 2.65c-.19.51.13 1.08.68 1.15h4.15c.42 0 .79-.27.92-.67l1.78-5.34c.26-.78.36-1.61.27-2.43zM12 9.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                      </svg>
                    </div>

                    {/* Expert Portrait */}
                    <img
                      src={getFirmImage(firm as LawFirm, index) || EXPERT_AVATAR_FALLBACK}
                      alt={firm.nazwa}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Dark bottom-fade gradient blending into the card background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent to-[96%]" />
                  </div>

                  {/* Center floating up-right diagonal arrow button */}
                  <span
                    className="absolute top-[118px] md:top-[268px] left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-primary-dark hover:bg-primary-dark flex items-center justify-center text-white border-4 border-border transition-transform duration-300 hover:scale-110 shadow-lg z-20"
                    title="Zobacz profil"
                  >
                    <ArrowUpRight className="w-5 h-5 text-foreground" />
                  </span>

                  {/* Content Section */}
                  <div className="pt-8 pb-3 md:pb-6 px-2 md:px-4 flex flex-col items-center text-center flex-grow">
                    {/* Profession Subtitle */}
                    <span className="text-[11px] font-bold text-muted-foreground tracking-[0.18em] uppercase block">
                      {profession}
                    </span>

                    {/* Name */}
                    <h3 className=" font-medium text-[18px] leading-tight text-foreground mb-2 max-w-[90%] line-clamp-2 min-h-[2.8rem] flex items-center justify-center group-hover:text-primary-dark transition-colors duration-200">
                      <span>
                        {firm.nazwa}
                      </span>
                    </h3>

                    {/* Location details */}
                    <p className="text-[11px] font-semibold text-[#cda567] tracking-wider mt-1">
                      {firm.miasto}, {voivodeship}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={scrollRight}
            className="absolute -right-4 lg:-right-12 xl:-right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-primary-dark hover:bg-primary-dark flex items-center justify-center text-white transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer shadow-lg z-30"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

        </div>
      </div>
    </section>
  )
}
