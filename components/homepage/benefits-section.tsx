"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const benefits = [
  {
    icon: "/images/ikonki_home-02.svg",
    title: (
      <>
        Dostęp do<br />doświadczonych prawników
      </>
    )
  },
  {
    icon: "/images/ikonki_home-03.svg",
    title: (
      <>
        Szybki proces<br />zgłoszenia sprawy
      </>
    )
  },
  {
    icon: "/images/ikonki_home-04.svg",
    title: (
      <>
        Porównywanie<br />ofert
      </>
    )
  },
  {
    icon: "/images/ikonki_home-05.svg",
    title: (
      <>
        Bezpieczeństwo<br />i poufność
      </>
    )
  },
  {
    icon: "/images/ikonki_home-06.svg",
    title: (
      <>
        Elastyczność<br />w wyborze prawnika
      </>
    )
  },
  {
    icon: "/images/ikonki_home-07.svg",
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

const BenefitIcon = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <div className="transition-transform duration-300 ease-out group-hover:scale-110">
      <Image
        src={src}
        alt={alt}
        width={100}
        height={100}
        className="w-30 h-30 transition-all duration-300 group-hover:brightness-0 group-hover:invert"
      />
    </div>
  )
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
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <BenefitIcon src={benefit.icon} alt={`Krok ${index + 1}`} />
              <h3 className="text-xs md:text-sm font-medium tracking-wide text-neutral-300 group-hover:text-white leading-relaxed max-w-[180px] transition-colors duration-300 font-sans">
                {benefit.title}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
