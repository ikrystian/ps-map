"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Briefcase } from "lucide-react"
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
              Tu rozwiązujemy Twoje problemy prawne
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 mb-32 justify-center"
            >
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/dodaj-sprawe">
                  <Home className="mr-2 h-5 w-5" />
                  Sprawy prywatne
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link href="/dodaj-sprawe">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Sprawy firmowe
                </Link>
              </Button>
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
