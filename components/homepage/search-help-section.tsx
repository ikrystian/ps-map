"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"

const PillarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-16 h-16 text-[#0da192]">
    {/* Greek/Roman style law pillar */}
    <path d="M4 4h16M5 7h14" strokeLinecap="round" />
    <line x1="8" y1="7" x2="8" y2="17" strokeLinecap="round" />
    <line x1="12" y1="7" x2="12" y2="17" strokeLinecap="round" />
    <line x1="16" y1="7" x2="16" y2="17" strokeLinecap="round" />
    <path d="M5 17h14M3 20h18" strokeLinecap="round" />
  </svg>
)

const UserPlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-16 h-16 text-[#0da192]">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8.5" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="20" y1="8" x2="20" y2="14" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="17" y1="11" x2="23" y2="11" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-16 h-16 text-[#0da192]">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DoubleCheckmarkLogo = () => (
  <div className="flex items-center mr-3 relative w-8 h-8 scale-95">
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      {/* First checkmark in gold */}
      <path
        d="M 4 17 L 10 23 L 16 11"
        stroke="#eab308"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Second checkmark in teal, overlapping beautifully */}
      <path
        d="M 10 17 L 16 23 L 26 11"
        stroke="#0da192"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
)

export function SearchHelpSection() {
  const router = useRouter()

  const steps = [
    {
      number: "01",
      icon: <PillarIcon />,
      title: (
        <>
          Kompleksowa
          <br />
          obsługa ekspertów
        </>
      ),
      description: "Dzięki naszej platformie masz bezpośredni dostęp do szerokiej sieci doświadczonych prawników i ekspertów z całego kraju."
    },
    {
      number: "02",
      icon: <UserPlusIcon />,
      title: (
        <>
          Proces dodawania
          <br />
          Twojej sprawy
        </>
      ),
      description: "Nasz portal umożliwia dodawanie sprawy całkowicie za darmo. Wystarczy kilka kliknięć, aby opisać Twoją sytuację."
    },
    {
      number: "03",
      icon: <HomeIcon />,
      title: (
        <>
          Załatwianie spraw bez
          <br />
          wychodzenia z domu
        </>
      ),
      description: "Prosta Sprawa to miejsce gdzie wszystko załatwisz online, bez konieczności wychodzenia z domu czy tracenia czasu na dojazdy."
    }
  ]

  return (
    <section className="relative bg-[#2C2B29] text-white py-24 px-4 select-none overflow-hidden border-t border-b border-neutral-900/10">
      {/* Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight text-center leading-tight mb-5 font-sans">
          Powiedz nam <span className="font-playfair font-bold italic text-white normal-case">jakiej pomocy</span> szukasz
        </h2>
        <p className="text-sm md:text-base text-[#A8A7A4] font-normal leading-relaxed text-center mb-6 max-w-2xl mx-auto font-sans tracking-wide">
          Dodaj swoją sprawę bez zbędnych formalności, czekaj na ofertę i wybierz tę, która najlepiej odpowiada Twoim potrzebom.
        </p>

        {/* Steps Grid */}
        <div className="relative w-full grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          {/* Connecting SVG Dotted Wave Line (Visible on Desktop only) */}
          <div className="absolute inset-0 pointer-events-none z-0 hidden md:block w-full h-[150px] top-[90px]">
            <svg
              className="w-full h-full"
              viewBox="0 0 1200 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              {/* Solid Starting Dot */}
              <circle cx="20" cy="70" r="5" fill="rgba(255, 255, 255, 0.45)" />

              {/* Dotted Sine Wave Path */}
              <path
                d="M 20 70 C 100 50, 120 40, 200 42 C 280 44, 320 75, 400 75 C 480 75, 520 48, 600 48 C 680 48, 720 75, 800 75 C 880 75, 920 42, 1000 42 C 1080 42, 1120 55, 1160 50"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="2.5"
                strokeDasharray="6 8"
                fill="none"
              />

              {/* Location Pin Icon at the End (Tilted) */}
              <g transform="translate(1148, 38) rotate(20 12 12)">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </g>
            </svg>
          </div>

          {/* Cards */}
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative flex flex-col items-center text-center z-10 group"
            >
              {/* Outline Number */}
              <span
                className="font-playfair text-[56px] font-light text-transparent select-none mb-3 block leading-none"
                style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.28)" }}
              >
                {step.number}
              </span>

              {/* Card Shape */}
              <div className="w-36 h-36 rounded-xl bg-[#121212]/60  border border-[#333230] flex items-center justify-center shadow-[0_12px_30px_-5px_rgba(0,0,0,0.5)] mb-8 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:border-[#0da192]/30">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-white text-[22px] font-semibold tracking-wide leading-tight mb-4 font-sans max-w-[280px]">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[#A8A7A4] text-xs md:text-sm font-normal leading-relaxed max-w-[320px] font-sans">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="mt-8 flex justify-center items-center w-full"
        >
          <Link href="/logowanie">
            <InteractiveHoverButton >Dodaj sprawę</InteractiveHoverButton>
          </Link>

        </motion.div>
      </div>
    </section>
  )
}
