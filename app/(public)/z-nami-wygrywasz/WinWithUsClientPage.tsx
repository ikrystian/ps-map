"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function WinWithUsClientPage() {
  return (
    <section className="min-h-[calc(100vh-65px)] bg-[#121212] flex items-center justify-center py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects to match the premium theme */}
      <div className="absolute top-1/4 left-1/10 w-[400px] h-[400px] bg-emerald-950/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Title, Description, CTA Button */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-6 xl:col-span-5 flex flex-col items-start text-left"
          >
            {/* Title */}
            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl text-white font-light tracking-tight leading-tight mb-8">
              Dlaczego <span className="font-bold">ProstaSprawa.pl</span>?
            </h1>

            {/* Description */}
            <p className="text-neutral-400 font-sans text-sm sm:text-base leading-relaxed mb-10 max-w-xl">
              Naszym głównym celem jest zwiększenie dostępności bezpłatnej pomocy
              i informacji prawnej oraz promocja ekspertów z całej Polski. Pragniemy
              aby za pośrednictwem serwisu prostasprawa.pl każdy mógł szybko
              i bezproblemowo znaleźć odpowiedź na nurtujący go problem lub
              prawnika, który zajmie się kompleksowo jego zagadnieniem.
            </p>

            {/* CTA Button */}
            <Link href="/rejestracja">
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "#247e5d" }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#1e6b4f] text-white font-medium px-10 py-3 rounded-lg shadow-lg hover:shadow-emerald-950/25 transition-all duration-300 cursor-pointer font-sans text-base tracking-wide"
              >
                Dołącz
              </motion.button>
            </Link>
          </motion.div>

          {/* Right Column: Statistics / Benefits Section */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-12 lg:gap-16">
            
            {/* Benefit Item 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex gap-6 items-start group"
            >
              {/* Icon 1: Custom SVG matching Growth Chart & User */}
              <div className="flex-shrink-0 text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300 pt-1">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 56 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-14 h-14 md:w-16 md:h-16"
                >
                  {/* Bars of the chart */}
                  <line x1="12" y1="40" x2="12" y2="28" />
                  <line x1="20" y1="40" x2="20" y2="20" />
                  <line x1="28" y1="40" x2="28" y2="14" />
                  {/* Horizontal baseline */}
                  <line x1="6" y1="40" x2="36" y2="40" />
                  
                  {/* Line graph line with arrow */}
                  <path d="M12 24L20 16L28 10L38 15" />
                  <path d="M32 10H38V16" />

                  {/* Circular User Avatar Overlay */}
                  <circle cx="43" cy="38" r="9" fill="#121212" className="fill-[#121212] group-hover:fill-[#1a1a1a] transition-colors duration-300" />
                  <circle cx="43" cy="38" r="9" />
                  <circle cx="43" cy="34" r="2.5" />
                  <path d="M37 43C37 40.5 40 39.5 43 39.5C46 39.5 49 40.5 49 43" />
                </svg>
              </div>

              {/* Text Block 1 */}
              <div className="flex-1 text-left">
                {/* Header */}
                <h3 className="font-playfair text-xl sm:text-2xl text-white font-light leading-snug">
                  <span className="font-bold">18 mln</span> użytkowników
                </h3>
                {/* Highlight line */}
                <p className="text-neutral-200 font-sans text-sm sm:text-base font-medium mt-1 mb-2 leading-relaxed">
                  miesięcznie odwiedza nasze serwisy.
                </p>
                {/* Paragraph */}
                <p className="text-neutral-400 font-sans text-sm sm:text-base leading-relaxed">
                  Od ponad 10 lat aktywnie wpływamy na rynek usług prawnych w Polsce!
                  Każdy nasz użytkownik może zostać Twoim klientem.
                </p>
              </div>
            </motion.div>

            {/* Benefit Item 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="flex gap-6 items-start group"
            >
              {/* Icon 2: Custom SVG matching Document & Search */}
              <div className="flex-shrink-0 text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300 pt-1">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 56 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-14 h-14 md:w-16 md:h-16"
                >
                  {/* Document container */}
                  <rect x="10" y="8" width="30" height="40" rx="3" />
                  {/* Text lines in document */}
                  <line x1="16" y1="16" x2="30" y2="16" />
                  <line x1="16" y1="24" x2="34" y2="24" />
                  <line x1="16" y1="32" x2="26" y2="32" />
                  <line x1="16" y1="40" x2="22" y2="40" />

                  {/* Magnifying Glass Overlay */}
                  <circle cx="43" cy="38" r="8" fill="#121212" className="fill-[#121212] group-hover:fill-[#1a1a1a] transition-colors duration-300" />
                  <circle cx="43" cy="38" r="8" />
                  <line x1="48.5" y1="43.5" x2="53" y2="48" />
                </svg>
              </div>

              {/* Text Block 2 */}
              <div className="flex-1 text-left">
                {/* Header */}
                <h3 className="font-playfair text-xl sm:text-2xl text-white font-light leading-snug">
                  <span className="font-bold">Ponad 150 osób</span> dziennie
                </h3>
                {/* Highlight line */}
                <p className="text-neutral-200 font-sans text-sm sm:text-base font-medium mt-1 mb-2 leading-relaxed">
                  szuka w naszym serwisie porady prawnej lub odpowiedniego
                  Prawnika, który kompleksowo pokieruje daną kwestią.
                </p>
                {/* Paragraph */}
                <p className="text-neutral-400 font-sans text-sm sm:text-base leading-relaxed">
                  Możliwość zadania bezpłatnego pytania oraz intuicyjna, prosta w obsłudze
                  wyszukiwarka ułatwiają podjęcie świadomej decyzji, w wyborze
                  odpowiedniej ścieżki działania.
                </p>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  )
}
