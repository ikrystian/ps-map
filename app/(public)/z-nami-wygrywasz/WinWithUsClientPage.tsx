"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

// High-fidelity elegant gold checkmark with a metallic 3D gradient matching the premium brand aesthetic
const PremiumGoldCheckmark = () => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-36 h-36 md:w-52 md:h-52 transition-transform duration-500 hover:scale-110 select-none pointer-events-none"
  >
    <defs>
      {/* 3D Metallic Gold Gradients */}
      <linearGradient id="goldMetallicGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFECA1" />
        <stop offset="25%" stopColor="#D4AF37" />
        <stop offset="50%" stopColor="#AA7C11" />
        <stop offset="75%" stopColor="#F3E5AB" />
        <stop offset="100%" stopColor="#A67C1E" />
      </linearGradient>

      <linearGradient id="goldMetallicInnerGrad" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5A3E00" />
        <stop offset="50%" stopColor="#FFF6CE" />
        <stop offset="100%" stopColor="#9E7815" />
      </linearGradient>

      {/* Elegant dark drop shadow to stand out against the background and image */}
      <filter id="goldDropShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.65" />
      </filter>
    </defs>

    {/* Primary Gold Checkmark with deep shadow */}
    <path
      d="M 32 82 L 62 112 L 128 42"
      stroke="url(#goldMetallicGrad)"
      strokeWidth="18"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#goldDropShadow)"
    />

    {/* Inner highlighting core line for the glossy 3D polished look */}
    <path
      d="M 32 82 L 62 112 L 128 42"
      stroke="url(#goldMetallicInnerGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-90"
    />
  </svg>
)

// Icon 1: Circular Plus Sign in Cyan/Teal
const Step1Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#0da192" strokeWidth="1.75" className="w-8 h-8">
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="16" strokeLinecap="round" />
    <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round" />
  </svg>
)

// Icon 2: Hand holding a checkmark in Cyan/Teal
const Step2Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#0da192" strokeWidth="1.75" className="w-8 h-8">
    {/* Hand offering shape */}
    <path d="M18 11h-4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h4.5a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1-1.5 1.5H9l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Floating checkmark above hand */}
    <path d="M12 4l3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Icon 3: Clipboard with a checkmark in Cyan/Teal
const Step3Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#0da192" strokeWidth="1.75" className="w-8 h-8">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="9 13 11 15 15 11" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Icon 4: Poland Map outline in Cyan/Teal
const PolandIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.25" className="w-20 h-20 text-[#0da192]">
    {/* High quality recognizable stylized outline map of Poland */}
    <path
      d="M 50 15 
         C 53 15, 57 14, 60 16 
         C 63 17, 65 19, 68 18 
         C 71 18, 73 17, 75 19 
         C 77 21, 75 24, 78 26 
         C 80 27, 85 27, 86 29 
         C 88 31, 88 35, 87 38 
         C 86 40, 84 41, 85 43 
         C 86 45, 89 47, 88 50 
         C 88 53, 85 55, 85 57 
         C 85 60, 88 62, 87 65 
         C 86 67, 83 67, 82 70 
         C 81 72, 82 76, 80 78 
         C 78 80, 74 80, 72 82 
         C 70 84, 69 87, 66 87 
         C 63 87, 60 85, 58 85 
         C 55 85, 52 87, 50 87 
         C 47 87, 44 87, 41 85 
         C 39 84, 38 82, 35 82 
         C 33 82, 30 84, 27 82 
         C 25 81, 25 77, 23 75 
         C 21 74, 18 73, 17 71 
         C 15 68, 17 65, 16 62 
         C 15 60, 12 58, 12 56 
         C 12 53, 15 51, 15 48 
         C 15 45, 13 42, 14 39 
         C 15 36, 19 35, 20 32 
         C 21 30, 21 26, 23 24 
         C 25 22, 28 23, 30 21 
         C 32 19, 33 16, 36 15 
         C 39 14, 43 16, 46 15 
         Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// Icon 5: Brand/Map Pin + Star bubble in Cyan/Teal
const BrandIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.25" className="w-20 h-20 text-[#0da192]">
    {/* Map path line at the bottom */}
    <path d="M 20 75 L 80 75" strokeLinecap="round" />
    {/* Map pin */}
    <path d="M 38 65 C 38 53, 48 53, 48 41 C 48 34, 43 29, 38 29 C 33 29, 28 34, 28 41 C 28 53, 38 53, 38 65 Z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="38" cy="41" r="3.5" fill="currentColor" />
    {/* Speech bubble/badge with star on the right */}
    <path d="M 54 36 L 74 36 C 77 36, 79 38, 79 41 L 79 57 C 79 60, 77 62, 74 62 L 63 62 L 55 70 L 55 62 L 54 62 C 51 62, 49 60, 49 57 L 49 49" strokeLinecap="round" strokeLinejoin="round" />
    {/* Star inside badge */}
    <path d="M 64 43 L 66.5 48 L 72 48 L 68 51.5 L 69.5 57 L 64 53.5 L 58.5 57 L 60 51.5 L 56 48 L 61.5 48 Z" fill="currentColor" />
  </svg>
)

// Icon 6: Cases/List + Plus in Cyan/Teal
const CasesIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.75" className="w-20 h-20 text-[#0da192]">
    {/* Three horizontal list lines */}
    <line x1="20" y1="32" x2="80" y2="32" strokeLinecap="round" />
    <line x1="20" y1="47" x2="62" y2="47" strokeLinecap="round" />
    <line x1="20" y1="62" x2="48" y2="62" strokeLinecap="round" />
    {/* Plus symbol on the bottom right */}
    <path d="M 72 54 L 72 74 M 62 64 L 82 64" strokeLinecap="round" />
  </svg>
)

// Icon 7: Dotted Poland map watermark
const DottedPolandMap = () => (
  <svg viewBox="0 0 100 100" className="w-[300px] h-[300px] text-teal-300/35 pointer-events-none z-0">
    <defs>
      <pattern id="dotPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.7" fill="currentColor" />
      </pattern>
    </defs>
    <path
      d="M 50 15 
         C 53 15, 57 14, 60 16 
         C 63 17, 65 19, 68 18 
         C 71 18, 73 17, 75 19 
         C 77 21, 75 24, 78 26 
         C 80 27, 85 27, 86 29 
         C 88 31, 88 35, 87 38 
         C 86 40, 84 41, 85 43 
         C 86 45, 89 47, 88 50 
         C 88 53, 85 55, 85 57 
         C 85 60, 88 62, 87 65 
         C 86 67, 83 67, 82 70 
         C 81 72, 82 76, 80 78 
         C 78 80, 74 80, 72 82 
         C 70 84, 69 87, 66 87 
         C 63 87, 60 85, 58 85 
         C 55 85, 52 87, 50 87 
         C 47 87, 44 87, 41 85 
         C 39 84, 38 82, 35 82 
         C 33 82, 30 84, 27 82 
         C 25 81, 25 77, 23 75 
         C 21 74, 18 73, 17 71 
         C 15 68, 17 65, 16 62 
         C 15 60, 12 58, 12 56 
         C 12 53, 15 51, 15 48 
         C 15 45, 13 42, 14 39 
         C 15 36, 19 35, 20 32 
         C 21 30, 21 26, 23 24 
         C 25 22, 28 23, 30 21 
         C 32 19, 33 16, 36 15 
         C 39 14, 43 16, 46 15 
         Z"
      fill="url(#dotPattern)"
    />
  </svg>
)

const ChevronUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
    <polyline points="18 15 12 9 6 15" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export default function WinWithUsPage() {
  const router = useRouter()

  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
  })

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans overflow-x-hidden relative flex flex-col justify-between">

      {/* SECTION 1: Jak działa Prosta Sprawa */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 md:py-24 flex-1 flex flex-col justify-center border-b border-neutral-900/60">
        {/* Background Cinematic Glows */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-neutral-800/10 to-transparent blur-[140px] pointer-events-none z-0" />

        {/* UPPER SECTION: Centered Header & Intro */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-4">
            PROSTA SPRAWA
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight leading-tight mb-6 font-sans">
            Jak działa Prosta Sprawa
          </h1>
          <p className="text-sm md:text-base text-neutral-400 font-normal leading-relaxed">
            Naszym głównym celem jest zwiększenie dostępności bezpłatnej pomocy i informacji prawnej oraz promocja ekspertów z całej Polski. Pragniemy aby za pośrednictwem serwisu prostasprawa.pl każdy mógł szybko i bezproblemowo znaleźć odpowiedź na nurtujący go problem lub prawnika, który zajmie się kompleksowo jego zagadnieniem.
          </p>
        </div>

        {/* LOWER SECTION: Two Column split (Text & CTA on left, Image on right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 lg:gap-20 items-center relative z-10">

          {/* Left Column: Title, paragraph, CTA button */}
          <div className="md:col-span-6 flex flex-col items-start text-left">
            <h2 className="text-2xl md:text-4xl font-semibold text-white tracking-tight mb-6 font-sans">
              Znajdź eksperta
            </h2>
            <p className="text-sm md:text-base text-neutral-400 font-normal leading-relaxed mb-10 max-w-xl">
              Naszym głównym celem jest zwiększenie dostępności bezpłatnej pomocy i informacji prawnej oraz promocja ekspertów z całej Polski. Pragniemy aby za pośrednictwem serwisu prostasprawa.pl każdy mógł szybko i bezproblemowo znaleźć odpowiedź na nurtujący go problem lub prawnika, który zajmie się kompleksowo jego zagadnieniem.
            </p>
            <button
              onClick={() => router.push("/szukaj-prawnika")}
              className="bg-[#0da192] hover:bg-[#00897b] text-white font-medium py-3.5 px-8 rounded-md transition-all duration-300 text-sm tracking-wide shadow-[0_4px_20px_rgba(13,161,146,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center"
            >
              Dowiedz się więcej
            </button>
          </div>

          {/* Right Column: Premium Background image of smiling lawyer */}
          <div className="md:col-span-6 flex justify-center items-center relative">
            <div className="relative w-full max-w-[460px] aspect-[4/3] rounded-lg overflow-hidden shadow-2xl border border-neutral-800/80 group">
              <img
                src="/images/s-nami-hero.png"
                alt="Znajdź Eksperta - Prosta Sprawa"
                className="w-full h-full object-contain transition-transform duration-700"
              />
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: Jak działa nasza aplikacja? */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col items-center">
        {/* Background Cinematic Glows */}
        <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none z-0" />

        {/* Section Header */}
        <h2 className="text-3xl md:text-[38px] font-semibold text-white tracking-tight text-center leading-tight mb-20 md:mb-28 font-sans relative z-10">
          Jak działa nasza aplikacja?
        </h2>

        {/* 3 Step columns with dynamic timeline connector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 lg:gap-12 w-full relative z-10">

          {/* High-Fidelity Wavy Dashed Line Timeline Connector (shown on desktop/tablet) */}
          <svg viewBox="0 0 1000 120" fill="none" className="absolute top-[50px] left-0 w-full h-[80px] hidden md:block z-0 pointer-events-none opacity-40">
            {/* The start circle on the far left */}
            <circle cx="50" cy="70" r="4.5" fill="#a3a3a3" />

            {/* Smooth Bézier splined dashed path threading exactly through the tops of the step card circles */}
            <path
              d="M 50 70 C 100 65, 150 40, 220 40 C 290 40, 320 80, 360 80 C 400 80, 430 40, 500 40 C 570 40, 600 80, 640 80 C 680 80, 710 40, 780 40 C 850 40, 890 60, 920 60"
              stroke="#a3a3a3"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              fill="none"
            />

            {/* Gray map pin icon at the end of the timeline on the far right */}
            <g transform="translate(930, 45) scale(1.1)">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                stroke="#a3a3a3"
                strokeWidth="1.75"
                fill="none"
              />
            </g>
          </svg>

          {/* Step 01 */}
          <div className="flex flex-col items-center text-center group cursor-pointer relative z-10">
            <span className="text-[34px] font-light text-neutral-600 mb-3 tracking-wider font-sans group-hover:text-[#0da192]/60 transition-colors duration-300">
              01
            </span>
            <div className="w-24 h-24 rounded-lg bg-[#1e1e1e] border border-neutral-800/80 flex items-center justify-center mb-6 shadow-xl group-hover:border-[#0da192]/40 group-hover:bg-[#222222] transition-all duration-300">
              <Step1Icon />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3.5 tracking-wide">
              Dodaj sprawę
            </h3>
            <p className="text-xs md:text-sm text-neutral-400 font-normal leading-relaxed max-w-[260px] px-2 group-hover:text-neutral-300 transition-colors duration-300">
              Dzięki naszej platformie masz bezpośredni dostęp do szerokiej sieci doświadczonych prawników i ekspertów z całego kraju.
            </p>
          </div>

          {/* Step 02 */}
          <div className="flex flex-col items-center text-center group cursor-pointer relative z-10">
            <span className="text-[34px] font-light text-neutral-600 mb-3 tracking-wider font-sans group-hover:text-[#0da192]/60 transition-colors duration-300">
              02
            </span>
            <div className="w-24 h-24 rounded-lg bg-[#1e1e1e] border border-neutral-800/80 flex items-center justify-center mb-6 shadow-xl group-hover:border-[#0da192]/40 group-hover:bg-[#222222] transition-all duration-300">
              <Step2Icon />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3.5 tracking-wide">
              Otrzymaj oferty
            </h3>
            <p className="text-xs md:text-sm text-neutral-400 font-normal leading-relaxed max-w-[260px] px-2 group-hover:text-neutral-300 transition-colors duration-300">
              Nasz portal umożliwia dodawanie sprawy całkowicie za darmo. Wystarczy kilka kliknięć, aby opisać swój przypadek.
            </p>
          </div>

          {/* Step 03 */}
          <div className="flex flex-col items-center text-center group cursor-pointer relative z-10">
            <span className="text-[34px] font-light text-neutral-600 mb-3 tracking-wider font-sans group-hover:text-[#0da192]/60 transition-colors duration-300">
              03
            </span>
            <div className="w-24 h-24 rounded-lg bg-[#1e1e1e] border border-neutral-800/80 flex items-center justify-center mb-6 shadow-xl group-hover:border-[#0da192]/40 group-hover:bg-[#222222] transition-all duration-300">
              <Step3Icon />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3.5 tracking-wide">
              Sprawa rozwiązana
            </h3>
            <p className="text-xs md:text-sm text-neutral-400 font-normal leading-relaxed max-w-[260px] px-2 group-hover:text-neutral-300 transition-colors duration-300">
              Prosta Sprawa to miejsce, gdzie wszystko załatwisz online, bez konieczności wychodzenia z domu czy tracenia czasu na dojazdy.
            </p>
          </div>

        </div>

        {/* Action Button CTA at the bottom */}
        <div className="mt-20 md:mt-24 flex justify-center items-center w-full relative z-10">
          <button
            onClick={() => router.push("/rejestracja")}
            className="bg-[#0da192] hover:bg-[#00897b] text-white font-medium py-3.5 px-12 rounded-md transition-all duration-300 text-sm tracking-wide shadow-[0_4px_20px_rgba(13,161,146,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center"
          >
            Załóż bezpłatne konto
          </button>
        </div>


      </section>

      {/* SECTION: Dlaczego eksperci wybierają ProstaSprawa? */}
      <section className="relative z-10 w-full bg-[#181816] border-t border-neutral-900/60 py-20 md:py-24 overflow-hidden">
        {/* Background Cinematic Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-[#0da192]/5 to-transparent blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center">

          <h2 className="text-2xl md:text-[28px] font-normal text-white tracking-tight text-center mb-16 font-sans">
            Dlaczego eksperci wybierają ProstaSprawa?
          </h2>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">

            {/* Card 1: Szybkość i wygoda */}
            <div className="bg-[#131313] border border-neutral-800/40 rounded-sm p-10 flex flex-col items-center justify-between text-center min-h-[320px] transition-all duration-300 hover:border-[#0da192]/30 hover:bg-[#181818] shadow-xl group cursor-pointer">
              <div className="flex flex-col items-center mt-2">
                <span className="text-lg md:text-[20px] font-normal text-neutral-200 tracking-wide leading-snug">Szybkość</span>
                <span className="text-lg md:text-[20px] font-normal text-neutral-200 tracking-wide leading-snug mt-1">i wygoda</span>
              </div>
              <div className="mb-4 transition-transform duration-500 group-hover:scale-105">
                <PolandIcon />
              </div>
            </div>

            {/* Card 2: Sprawdzeni Wykonawcy */}
            <div className="bg-[#131313] border border-neutral-800/40 rounded-sm p-10 flex flex-col items-center justify-between text-center min-h-[320px] transition-all duration-300 hover:border-[#0da192]/30 hover:bg-[#181818] shadow-xl group cursor-pointer">
              <div className="flex flex-col items-center mt-2">
                <span className="text-lg md:text-[20px] font-normal text-neutral-200 tracking-wide leading-snug">Sprawdzeni</span>
                <span className="text-lg md:text-[20px] font-normal text-neutral-200 tracking-wide leading-snug mt-1">Wykonawcy</span>
              </div>
              <div className="mb-4 transition-transform duration-500 group-hover:scale-105">
                <BrandIcon />
              </div>
            </div>

            {/* Card 3: Rzetelne opinie */}
            <div className="bg-[#131313] border border-neutral-800/40 rounded-sm p-10 flex flex-col items-center justify-between text-center min-h-[320px] transition-all duration-300 hover:border-[#0da192]/30 hover:bg-[#181818] shadow-xl group cursor-pointer">
              <div className="flex flex-col items-center mt-2">
                <span className="text-lg md:text-[20px] font-normal text-neutral-200 tracking-wide leading-snug">Rzetelne</span>
                <span className="text-lg md:text-[20px] font-normal text-neutral-200 tracking-wide leading-snug mt-1">opinie</span>
              </div>
              <div className="mb-4 transition-transform duration-500 group-hover:scale-105">
                <CasesIcon />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: Twoje dane są bezpieczne! */}
      <section className="relative z-10 w-full bg-black border-t border-neutral-900/60 py-20 md:py-16 overflow-hidden" id="section-your-data">
        {/* Background Cinematic Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-r from-teal-900/5 to-transparent blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

          {/* Left Column: Text & CTA */}
          <div className="md:col-span-6 flex flex-col items-start text-left">
            <h2 className="text-3xl md:text-[44px] font-semibold text-white tracking-tight leading-tight mb-6 font-sans">
              Twoje dane<br />są bezpieczne!
            </h2>
            <p className="text-xs md:text-sm text-neutral-400 font-normal leading-relaxed mb-10 max-w-md">
              Wszystkie dane są chronione zgodnie z obowiązującymi przepisami.<br />
              Korzystasz z ProstaSprawa.pl z pełną prywatnością i spokojem.
            </p>
            <button
              onClick={() => router.push("/polityka-prywatnosci")}
              className="bg-[#0da192] hover:bg-[#00897b] text-white font-medium py-3 px-8 rounded-md transition-all duration-300 text-sm tracking-wide shadow-[0_4px_20px_rgba(13,161,146,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center"
            >
              Czytaj więcej
            </button>
          </div>

          {/* Right Column: Premium Glowing Security Image */}
          <div className="md:col-span-6 flex justify-center items-center relative">

          </div>

        </div>
      </section>

      {/* SECTION: Sprawdź dostępność ekspertów */}
      <section className="relative z-10 w-full bg-[#121212] py-24 md:py-32 px-6 relative overflow-visible border-t border-neutral-900/60">
        <div className="relative w-full max-w-5xl mx-auto bg-[#0b9083] rounded-2xl p-8 md:p-14 overflow-visible shadow-2xl">
          {/* Poland Watermark Map */}
          <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none z-0">
            <DottedPolandMap />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

            {/* Left Column: Title & Button */}
            <div className="col-span-12 md:col-span-7 flex flex-col justify-center items-start text-left z-10">
              <h2 className="text-2xl md:text-[34px] font-normal leading-snug text-white tracking-wide mb-8 font-sans">
                Sprawdź dostępność ekspertów<br />w Twoim mieście
              </h2>
              <button
                onClick={() => router.push("/szukaj-prawnika")}
                className="border border-white/60 hover:border-white text-white hover:bg-white/10 px-8 py-3 rounded-md transition-all duration-300 text-sm font-medium tracking-wide cursor-pointer"
              >
                Sprawdź
              </button>
            </div>

            {/* Right Column: Overlay tilted iPhone */}
            <div className="col-span-12 md:col-span-5 relative flex justify-center md:justify-end z-10">
              <div className="relative w-[180px] h-[340px] md:w-[190px] md:h-[370px] md:-mt-24 md:-mb-24 mt-4 select-none pointer-events-none">
                <div className="relative w-full h-full bg-[#1a1a1a] rounded-[36px] border-[5px] border-[#2d2d2d] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col p-2 rotate-[10deg] transform-gpu">
                  {/* Glass Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-20" />

                  {/* Dynamic Island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-black rounded-full z-30" />

                  {/* Content screen */}
                  <div className="absolute inset-[3px] bg-[#131313] rounded-[28px] overflow-hidden flex flex-col justify-between p-4 z-10">

                    {/* Lawyer Avatar */}
                    <div className="flex-1 flex flex-col items-center justify-center pt-2">
                      <div className="w-20 h-20 rounded-full bg-[#222] border-2 border-[#2d2d2d] flex items-center justify-center mb-3 overflow-hidden relative shadow-md">
                        <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16 text-neutral-400">
                          {/* Stylized hair */}
                          <path d="M 25 40 C 25 20, 75 20, 75 40 Z" fill="#3a2a20" />
                          {/* Face */}
                          <circle cx="50" cy="45" r="22" fill="#e8c39e" />
                          {/* Glasses */}
                          <path d="M 38 42 H 48 M 52 42 H 62" stroke="#222" strokeWidth="2.5" />
                          <circle cx="43" cy="42" r="5" stroke="#222" strokeWidth="2" />
                          <circle cx="57" cy="42" r="5" stroke="#222" strokeWidth="2" />
                          {/* Body */}
                          <path d="M 25 80 C 25 60, 75 60, 75 80 Z" fill="#1e293b" />
                        </svg>
                      </div>

                      {/* Arrow Icon Button inside green circle */}
                      <div className="w-7 h-7 rounded-full bg-[#0da192] flex items-center justify-center shadow-[0_0_12px_rgba(13,161,146,0.5)] mb-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3.5 h-3.5">
                          <polyline points="18 15 12 9 6 15" className="rotate-90 transform origin-center" />
                        </svg>
                      </div>
                    </div>

                    {/* Details at bottom */}
                    <div className="text-center pb-2 flex flex-col items-center">
                      <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-1">
                        PRAWNIK
                      </span>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        Jan Nowacki
                      </h4>
                      <p className="text-[9px] text-[#eab308] font-medium tracking-wide mt-1 uppercase font-sans">
                        Kraków
                      </p>
                      <p className="text-[8px] text-[#eab308]/70 font-normal tracking-wide mt-0.5 font-sans">
                        Małopolska
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION: Najczęściej zadawane pytania */}
      <section className="relative z-10 w-full bg-[#121212] py-20 md:py-24 px-6 relative overflow-hidden border-t border-neutral-900/60">
        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col">

          {/* Header & Divider line */}
          <div className="flex items-center w-full mb-12">
            <h2 className="text-xl md:text-2xl font-normal text-white tracking-wide shrink-0 font-sans">
              Najczęściej zadawane pytania
            </h2>
            <div className="flex-1 h-[1px] bg-neutral-800/80 ml-6" />
          </div>

          {/* Accordion loop */}
          {[
            {
              q: "Jak działa prostasprawa.pl?",
              a: "Dodajesz swoją sprawę poprzez prosty formularz. Otrzymujesz oferty od ekspertów - prawników, doradców, księgowych - i sam wybierasz, z kim chcesz współpracować."
            },
            {
              q: "Ile kosztuje dodanie sprawy?",
              a: "Dodanie sprawy jest całkowicie bezpłatne. Płacisz tylko wtedy, gdy zdecydujesz się skorzystać z oferty jednego z ekspertów."
            },
            {
              q: "Czy mogę wybrać więcej niż jedną ofertę?",
              a: "Nie. Po zaakceptowaniu jednej oferty, sprawa zostaje zamknięta dla innych ekspertów. Możesz jednak ponownie dodać sprawę, jeśli współpraca nie dojdzie do skutku."
            },
            {
              q: "Czy moje dane są bezpieczne?",
              a: "Tak. Twoje dane są chronione zgodnie z RODO. Nie udostępniamy ich żadnym podmiotom zewnętrznym. Masz pełną kontrolę nad tym, co i komu udostępniasz."
            }
          ].map((item, idx) => {
            const isOpen = !!openFaq[idx]
            return (
              <div key={idx} className="w-full mb-4">
                {/* Accordion Header */}
                <div
                  onClick={() => toggleFaq(idx)}
                  className="bg-[#0da192] text-white px-5 py-4 flex items-center justify-between font-normal text-sm md:text-base tracking-wide rounded-t-sm cursor-pointer hover:bg-[#0b9083] transition-colors duration-200 select-none"
                >
                  <span className="font-sans">{item.q}</span>
                  <span className="text-white/80">
                    {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </span>
                </div>

                {/* Accordion Body */}
                <div
                  className={`bg-[#131313] border-x border-b border-[#0da192]/20 rounded-b-sm overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[200px] p-5 opacity-100" : "max-h-0 p-0 opacity-0 pointer-events-none"
                    }`}
                >
                  <p className="text-xs md:text-sm text-neutral-400 font-normal leading-relaxed font-sans">
                    {item.a}
                  </p>
                </div>
              </div>
            )
          })}

        </div>
      </section>

    </div>
  )
}
