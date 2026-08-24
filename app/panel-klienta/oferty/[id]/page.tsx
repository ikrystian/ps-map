"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { motion } from "framer-motion"

export default function ClientOfferDetailsPage() {
  return (
    <div className="relative space-y-8">
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
          title="Szczegóły Oferty"
          subtitle="Szczegółowe informacje o wybranej ofercie od eksperta prawnego."
          titleClassName="text-foreground text-3xl sm:text-4xl"
        />
      </motion.div>
    </div>
  )
}
