"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserCheck } from "lucide-react"
import { motion } from "framer-motion"

export function ExpertCTA() {
  return (
    <section className="py-24 bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center text-white"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Daj się poznać jako ekspert prawa
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Zyskaj dostęp do narzędzi które pomogą Ci skuteczniej docierać do osób
            poszukujących pomocy prawnej. Stwórz profil i zdobądź nowych klientów!
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link href="/rejestracja/kancelaria">
              <UserCheck className="mr-2 h-5 w-5" />
              Dołącz jako ekspert
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

