"use client"

import { EnhancedMessengerLayout } from "@/components/messages/EnhancedMessengerLayout"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { motion } from "framer-motion"

export default function LawFirmMessagesPage() {
  return (
    <div id="tour-messages-container" className="relative space-y-6 pb-12 min-h-screen overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Wiadomości"
          subtitle="Zarządzaj konwersacjami z klientami oraz wymieniaj dokumenty w czasie rzeczywistym."
        />

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

