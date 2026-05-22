"use client"

import { motion } from "framer-motion"

// Custom high-fidelity white stroke line-art SVG icons matching the design exactly
const IconLawyer = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-20 h-20 text-neutral-400 group-hover:text-white transition-colors duration-350"
  >
    {/* Head */}
    <circle cx="50" cy="26" r="7.5" />
    
    {/* Collar & Tie */}
    <path d="M46 33.5 L50 38 L54 33.5" />
    <path d="M50 38 L50 44" />
    
    {/* Shoulders */}
    <path d="M34 46 C34 39 40 35 50 35 C60 35 66 39 66 46" />
    
    {/* Podium */}
    <path d="M32 46 H68" />
    <path d="M36 46 L38 65 H62 L64 46" />
    <path d="M42 46 V65" />
    <path d="M58 46 V65" />
    <path d="M28 65 H72" />
    
    {/* Microphones */}
    <path d="M38 46 L42 39" />
    <circle cx="42" cy="39" r="0.75" fill="currentColor" />
    <path d="M62 46 L58 39" />
    <circle cx="58" cy="39" r="0.75" fill="currentColor" />
    
    {/* Soundwaves Left */}
    <path d="M24 32 C21 36 21 42 24 46" />
    <path d="M18 28 C13 34 13 44 18 50" />
    <path d="M12 24 C5 32 5 46 12 54" />
    
    {/* Soundwaves Right */}
    <path d="M76 32 C79 36 79 42 76 46" />
    <path d="M82 28 C87 34 87 44 82 50" />
    <path d="M88 24 C95 32 95 46 88 54" />
  </svg>
)

const IconRunning = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-20 h-20 text-neutral-400 group-hover:text-white transition-colors duration-350"
  >
    {/* Clock top-left */}
    <circle cx="28" cy="24" r="8" />
    <path d="M28 20 V24 H32" />
    
    {/* Speed lines */}
    <path d="M14 34 H36" />
    <path d="M10 42 H34" />
    <path d="M12 50 H28" />
    <path d="M16 58 H32" />
    
    {/* Running figure */}
    <circle cx="68" cy="24" r="5" />
    <path d="M68 29 L58 42" />
    <path d="M64 32 L74 36 L80 32" />
    <path d="M62 34 L52 38 L48 48" />
    
    {/* Briefcase */}
    <rect x="42" y="48" width="12" height="9" rx="1" />
    <path d="M46 48 V46 H50 V48" />
    
    {/* Legs */}
    <path d="M58 42 L66 52 L58 62" />
    <path d="M58 42 L48 46 L52 56" />
  </svg>
)

const IconCompare = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-20 h-20 text-neutral-400 group-hover:text-white transition-colors duration-350"
  >
    {/* Monitor screen */}
    <rect x="20" y="20" width="60" height="42" rx="2" />
    
    {/* Stand */}
    <path d="M44 62 L40 72 H60 L56 62" />
    <path d="M34 72 H66" />
    
    {/* Document inside */}
    <rect x="28" y="26" width="30" height="30" rx="0.5" />
    <path d="M34 32 H52" />
    <path d="M34 38 H48" />
    <path d="M34 44 H44" />
    <path d="M34 50 H38" />
    
    {/* Checkmark circle badge */}
    <circle cx="68" cy="52" r="10" fill="#121212" stroke="currentColor" strokeWidth="1.25" />
    <path d="M64 52 L67 55 L73 49" />
  </svg>
)

const IconSecurity = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-20 h-20 text-neutral-400 group-hover:text-white transition-colors duration-350"
  >
    {/* Document */}
    <path d="M26 72 V22 H54 L64 32 V72 Z" />
    <path d="M54 22 V32 H64" />
    
    {/* Text lines */}
    <path d="M32 36 H46" />
    <path d="M32 44 H56" />
    <path d="M32 52 H46" />
    <path d="M32 60 H40" />
    
    {/* Shield */}
    <path d="M50 50 H74 C74 62 70 70 62 76 C54 70 50 62 50 50 Z" fill="#121212" stroke="currentColor" strokeWidth="1.25" />
    
    {/* Keyhole */}
    <circle cx="62" cy="59" r="2.5" />
    <path d="M60.5 61.5 L63.5 61.5 L65 67.5 H59 Z" />
  </svg>
)

const IconFlexibility = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-20 h-20 text-neutral-400 group-hover:text-white transition-colors duration-350"
  >
    {/* Scale */}
    <path d="M50 18 V50" />
    <path d="M44 50 H56" />
    <circle cx="50" cy="24" r="2" />
    <path d="M30 24 H70" />
    
    {/* Left pan */}
    <path d="M30 24 L24 38 M30 24 L36 38" />
    <path d="M22 38 H38 C38 42 22 42 22 38 Z" />
    
    {/* Right pan */}
    <path d="M70 24 L64 38 M70 24 L76 38" />
    <path d="M62 38 H78 C78 42 62 42 62 38 Z" />
    
    {/* Handshake */}
    <path d="M20 70 L32 58 L38 64 L26 76" />
    <path d="M80 70 L68 58 L62 64 L74 76" />
    <path d="M38 64 C42 60 48 60 52 64" />
    <path d="M44 65 L54 65 C56 65 58 67 58 69" />
    <path d="M43 69 L53 69" />
    <path d="M42 73 L51 73" />
  </svg>
)

const IconConvenience = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-20 h-20 text-neutral-400 group-hover:text-white transition-colors duration-350"
  >
    {/* Clock circle */}
    <circle cx="44" cy="46" r="28" />
    
    {/* Clock ticks */}
    <path d="M44 18 V22" />
    <path d="M72 46 H68" />
    <path d="M44 74 V70" />
    <path d="M16 46 H20" />
    
    {/* Clock hands */}
    <path d="M44 46 H34" />
    <path d="M44 46 V32" />
    
    {/* Gavel */}
    <path d="M60 58 L78 76" strokeWidth="2.5" />
    <path d="M48 54 L62 40 L66 44 L52 58 Z" fill="#121212" stroke="currentColor" strokeWidth="1.25" />
    <path d="M55 47 L59 51" />
    
    {/* Sound block */}
    <path d="M64 78 C64 76 84 76 84 78 C84 80 64 80 64 78 Z" fill="#121212" stroke="currentColor" strokeWidth="1.25" />
  </svg>
)

const benefits = [
  {
    icon: IconLawyer,
    title: (
      <>
        Dostęp do<br />doświadczonych prawników
      </>
    )
  },
  {
    icon: IconRunning,
    title: (
      <>
        Szybki proces<br />zgłoszenia sprawy
      </>
    )
  },
  {
    icon: IconCompare,
    title: (
      <>
        Porównywanie<br />ofert
      </>
    )
  },
  {
    icon: IconSecurity,
    title: (
      <>
        Bezpieczeństwo<br />i poufność
      </>
    )
  },
  {
    icon: IconFlexibility,
    title: (
      <>
        Elastyczność<br />w wyborze prawnika
      </>
    )
  },
  {
    icon: IconConvenience,
    title: (
      <>
        Wygoda i oszczędność<br />czasu
      </>
    )
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
}

export function BenefitsSection() {
  return (
    <section className="py-20 md:py-24 bg-[#121212] border-b border-neutral-900/40 select-none overflow-hidden relative z-10">
      <div className="container mx-auto px-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-y-16 gap-x-6 justify-center items-start"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div 
                key={index} 
                variants={itemVariants} 
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="mb-6 transition-transform duration-300 ease-out group-hover:scale-108">
                  <Icon />
                </div>
                <h3 className="text-xs md:text-sm font-medium tracking-wide text-neutral-300 group-hover:text-white leading-relaxed max-w-[180px] transition-colors duration-300 font-sans">
                  {benefit.title}
                </h3>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
