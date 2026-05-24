"use client"

import Link from "next/link"
import ParticlesBackground from "@/components/ParticlesBackground"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative flex justify-center items-center from-primary/10 via-background to-secondary/10 h-[80vh] hero-image overflow-hidden">
      <div>
        <ParticlesBackground />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-6xl md:text-8xl tracking-tight font-medium mb-6 font-playfair"
            >
              Prosta Sprawa
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-4xl font-semibold mb-16 font-playfair"
            >

              Tu rozwiązujemy Twoje problemy prawne!

            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl font-semibold mb-16 font-playfair"
            >
              Opisz i dodaj swoją sprawę. Znajdź prawnika
              Wybierz najlepszą dla siebie ofertę!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 mb-32 justify-center px-4"
            >
              <Link
                href="/kategorie/#sprawy-prywatne"
                className="flex items-center justify-center min-w-[280px] h-[72px] bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md border border-white/15 hover:border-white/30 text-white font-medium text-base md:text-lg uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-[1.02] text-center shadow-lg cursor-pointer"
              >
                Sprawy prywatne
              </Link>
              <Link
                href="/kategorie/#sprawy-firmowe"
                className="flex items-center justify-center min-w-[280px] h-[72px] bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md border border-white/15 hover:border-white/30 text-white font-medium text-base md:text-lg uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-[1.02] text-center shadow-lg cursor-pointer"
              >
                Sprawy firmowe
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 font-playfair"
            >
              Zmieniamy grę w świecie prawa!
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  )
}
