"use client"

import ParticlesBackground from "@/components/ParticlesBackground"
import { Badge } from "@/components/ui/badge"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { motion } from "framer-motion"
import { ArrowRight, Briefcase, ChevronDown, ShieldCheck, Users } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-image pt-16">
      {/* Overlay for depth and readability */}
      <div className="absolute inset-0 bg-[#141414]/60 backdrop-blur-[1px] z-0" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-1/4 w-[60%] h-[60%] bg-primary/20 rounded-full blur-[160px] animate-pulse z-0" />
      <div className="absolute bottom-1/4 -right-1/4 w-[60%] h-[60%] bg-teal-500/10 rounded-full blur-[160px] animate-pulse z-0" />

      <ParticlesBackground />

      <div className="container mx-auto px-4 relative z-10 py-12">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <Badge variant="outline" className="px-5 py-2 border-primary/40 text-primary-foreground bg-primary/5 backdrop-blur-md rounded-full text-xs font-semibold tracking-widest uppercase">
              Twoje wsparcie prawne w zasięgu ręki
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl sm:text-7xl md:text-9xl tracking-tight font-medium mb-8 font-playfair text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
          >
            Prosta Sprawa
          </motion.h1>

          {/* Subtitle & Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-light mb-6 font-playfair text-neutral-200">
              Rozwiązujemy Twoje <span className="italic font-bold text-white underline decoration-primary/50 underline-offset-8">problemy prawne</span> w kilku krokach.
            </h2>
            <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-sans">
              Dodaj sprawę i otrzymaj oferty od zweryfikowanych prawników.
              Szybko, bezpiecznie i na Twoich zasadach.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-6 mb-20 justify-center items-center px-4"
          >
            <Link href="/kategorie?tab=private" className="group">
              <button className="flex items-center justify-center min-w-[280px] h-[72px] bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/30 text-white font-medium text-lg rounded-2xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-white/5">
                Sprawy prywatne
                <ArrowRight className="ml-3 h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </Link>

            <Link href="/kategorie?tab=business" className="group">
              <button className="flex items-center justify-center min-w-[280px] h-[72px] bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/30 text-white font-medium text-lg rounded-2xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-white/5">
                Sprawy firmowe
                <ArrowRight className="ml-3 h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </Link>
          </motion.div>

          {/* Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
            className="flex flex-wrap justify-center gap-x-12 gap-y-6 pt-12 border-t border-white/5"
          >
            <div className="flex items-center gap-3 group">
              <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold leading-none">1000+</p>
                <p className="text-sm text-neutral-500 uppercase tracking-widest mt-1">Ekspertów</p>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="bg-teal-500/10 p-2 rounded-lg group-hover:bg-teal-500/20 transition-colors">
                <ShieldCheck className="h-5 w-5 text-teal-500" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold leading-none">100%</p>
                <p className="text-sm text-neutral-500 uppercase tracking-widest mt-1">Bezpieczeństwa</p>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="bg-secondary/10 p-2 rounded-lg group-hover:bg-secondary/20 transition-colors">
                <ArrowRight className="h-5 w-5 text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold leading-none">98%</p>
                <p className="text-sm text-neutral-500 uppercase tracking-widest mt-1">Skuteczności</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom radial fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#121212] to-transparent z-10" />
    </section>
  )
}
