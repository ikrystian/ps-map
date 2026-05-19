"use client"

import React, { useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react"
import type { LawFirm } from "@/types/lawfirms"

interface NewExpertsProps {
  newLawFirms: LawFirm[]
}

// Premium curated portrait headshots matching the high-end mockup design
const PORTRAITS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600", // Iwona Maria Blackova style
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600", // Konstanty style
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600", // Jan Nowacki style
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600", // Emily Porter style
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600", 
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600", 
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600", 
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600"
]

const getFirmImage = (firm: LawFirm, index: number) => {
  if (firm.logo && (firm.logo.startsWith("http") || firm.logo.startsWith("/uploads"))) {
    return firm.logo
  }
  return PORTRAITS[index % PORTRAITS.length]
}

const getVoivodeshipForCity = (city: string): string => {
  const c = city.toLowerCase().trim()
  if (c.includes("mikołajk")) return "Warmińsko-Mazurskie"
  if (c.includes("kielce")) return "Świętokrzyskie"
  if (c.includes("kraków") || c.includes("krakow")) return "Małopolskie"
  if (c.includes("warszaw")) return "Mazowieckie"
  if (c.includes("pozna") || c.includes("wielkopolsk")) return "Wielkopolskie"
  if (c.includes("gdańsk") || c.includes("gdansk") || c.includes("gdyn") || c.includes("sopot")) return "Pomorskie"
  if (c.includes("wrocław") || c.includes("wroclaw")) return "Dolnośląskie"
  if (c.includes("łódź") || c.includes("lodz")) return "Łódzkie"
  if (c.includes("szczecin")) return "Zachodniopomorskie"
  if (c.includes("rzeszów") || c.includes("rzeszow")) return "Podkarpackie"
  if (c.includes("katowic") || c.includes("gliwic") || c.includes("sosnow")) return "Śląskie"
  if (c.includes("lublin")) return "Lubelskie"
  if (c.includes("białystok") || c.includes("bialystok")) return "Podlaskie"
  if (c.includes("bydgoszcz") || c.includes("toruń") || c.includes("torun")) return "Kujawsko-Pomorskie"
  if (c.includes("opol")) return "Opolskie"
  if (c.includes("zielona góra") || c.includes("zielonagora") || c.includes("gorzów") || c.includes("gorzow")) return "Lubuskie"
  return "Świętokrzyskie" // default fallback
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

  // Fallback data in case the database doesn't have enough entries or is loading
  const fallbackExperts = [
    {
      id: "fallback-1",
      slug: "iwona-maria-blackova",
      nazwa: "Iwona Maria Blackova",
      miasto: "Mikołajki",
      categories: [{ id: "c1", nazwa: "Radca Prawny" }],
      voivodeship: { id: "v1", nazwa: "Warmińsko-Mazurskie" }
    },
    {
      id: "fallback-2",
      slug: "konstanty-kownacki-matuszak",
      nazwa: "Konstanty Kownacki -Matuszak",
      miasto: "Kielce",
      categories: [{ id: "c2", nazwa: "Komornik" }],
      voivodeship: { id: "v2", nazwa: "Świętokrzyskie" }
    },
    {
      id: "fallback-3",
      slug: "jan-nowacki",
      nazwa: "Jan Nowacki",
      miasto: "Kraków",
      categories: [{ id: "c3", nazwa: "Prawnik" }],
      voivodeship: { id: "v3", nazwa: "Małopolskie" }
    },
    {
      id: "fallback-4",
      slug: "emily-porter",
      nazwa: "Emily Porter",
      miasto: "Kielce",
      categories: [{ id: "c4", nazwa: "Adwokat" }],
      voivodeship: { id: "v4", nazwa: "Świętokrzyskie" }
    }
  ]

  const experts = newLawFirms && newLawFirms.length > 0 ? newLawFirms : fallbackExperts

  return (
    <section className="py-20 bg-[#121212] text-white overflow-hidden border-t border-zinc-900/60">
      <div className="container mx-auto px-4 max-w-7xl relative">
        
        {/* Title row with modern line design */}
        <div className="flex items-center justify-between gap-6 mb-16 px-1">
          <h2 className="font-playfair text-2xl md:text-3xl lg:text-[34px] font-normal text-white tracking-wide whitespace-nowrap">
            Nowi eksperci już dostępni
          </h2>
          <div className="hidden md:block flex-grow border-t border-zinc-800/80" />
        </div>

        {/* Carousel / Slider Container */}
        <div className="relative w-full px-1">
          
          {/* Left Arrow Button */}
          <button 
            onClick={scrollLeft}
            className="absolute -left-4 lg:-left-12 xl:-left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-[#008073] hover:bg-[#006f63] flex items-center justify-center text-white transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer shadow-lg z-30"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Slider content area */}
          <div className="overflow-hidden">
            <div 
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-none py-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {experts.map((firm, index) => {
                const profession = firm.categories?.[0]?.nazwa || "Prawnik"
                const voivodeship = firm.voivodeship?.nazwa || getVoivodeshipForCity(firm.miasto)

                return (
                  <div
                    key={firm.id}
                    className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] shrink-0 snap-start flex flex-col bg-[#1d1d1f] rounded-2xl overflow-hidden border border-zinc-800/60 shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
                  >
                    {/* Image Section */}
                    <div className="relative h-[290px] w-full overflow-hidden bg-zinc-950">
                      {/* Gold emblem badge top-left */}
                      <div className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-[#161616]/95 border border-[#cda567]/60 flex items-center justify-center shadow-lg">
                        <svg className="w-[18px] h-[18px] text-[#cda567]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.86 11.18c-.46-1.58-1.5-2.88-2.92-3.66-.46-.25-1-.18-1.39.17l-1.92 1.76c-.34.31-.85.38-1.26.17l-1.96-1.01c-.55-.28-1.22.04-1.34.65l-.54 2.76c-.08.41.13.82.5 1.01l2.09 1.07c.33.17.48.56.35.91l-.99 2.65c-.19.51.13 1.08.68 1.15h4.15c.42 0 .79-.27.92-.67l1.78-5.34c.26-.78.36-1.61.27-2.43zM12 9.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                        </svg>
                      </div>

                      {/* Expert Portrait */}
                      <img
                        src={getFirmImage(firm as LawFirm, index)}
                        alt={firm.nazwa}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Dark bottom-fade gradient blending into the card background */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f] via-[#1d1d1f]/20 to-transparent to-[96%]" />
                    </div>

                    {/* Center floating up-right diagonal arrow button (Placed outside the overflow-hidden container to prevent clipping) */}
                    <Link 
                      href={`/ekspert/${firm.slug}`}
                      className="absolute top-[268px] left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-[#008073] hover:bg-[#006f63] flex items-center justify-center text-white border-4 border-[#1d1d1f] transition-transform duration-300 hover:scale-110 shadow-lg z-20"
                      title="Zobacz profil"
                    >
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </Link>

                    {/* Content Section */}
                    <div className="pt-8 pb-6 px-4 flex flex-col items-center text-center flex-grow">
                      {/* Profession Subtitle */}
                      <span className="text-[11px] font-bold text-zinc-400 tracking-[0.18em] uppercase mb-2 block">
                        {profession}
                      </span>
                      
                      {/* Name */}
                      <h3 className="font-sans font-medium text-[18px] leading-tight text-white mb-2 max-w-[90%] line-clamp-2 min-h-[2.8rem] flex items-center justify-center group-hover:text-[#008073] transition-colors duration-200">
                        <Link href={`/ekspert/${firm.slug}`}>
                          {firm.nazwa}
                        </Link>
                      </h3>

                      {/* Location details */}
                      <p className="text-[11px] font-semibold text-[#cda567] tracking-wider uppercase mt-1">
                        {firm.miasto}, {voivodeship}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Arrow Button */}
          <button 
            onClick={scrollRight}
            className="absolute -right-4 lg:-right-12 xl:-right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-[#008073] hover:bg-[#006f63] flex items-center justify-center text-white transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer shadow-lg z-30"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

        </div>
      </div>
    </section>
  )
}
