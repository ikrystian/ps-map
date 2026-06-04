"use client"

import { EnhancedMessengerLayout } from "@/components/messages/EnhancedMessengerLayout"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export default function ClientMessagesPage() {
  return (
    <div className="relative w-full space-y-6 pb-12 min-h-screen overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#d7b56d]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#0da192]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Wiadomości"
          subtitle="Komunikuj się z ekspertami i kancelariami prawnymi bezpośrednio na platformie."
          titleClassName="text-white text-3xl sm:text-4xl"
        />
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d7b56d]/10 border border-[#d7b56d]/20 text-[#d7b56d] text-xs font-semibold tracking-wide">
          <Sparkles className="h-3 w-3 animate-pulse" />
          TWOJE KONWERSACJE
        </div>
      </motion.div>

      {/* Messenger Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10"
      >
        <EnhancedMessengerLayout />
      </motion.div>
    </div>
  )
}

