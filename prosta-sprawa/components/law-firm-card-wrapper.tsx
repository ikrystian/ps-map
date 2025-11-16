"use client"

import React from "react"
import { MagicCard } from "@/components/magic-card"
import { Card } from "@/components/ui/card"

interface LawFirmCardWrapperProps {
  children: React.ReactNode
  pakietSubskrypcji?: string
  className?: string
}

/**
 * Komponent owijający karty kancelarii
 * Automatycznie stosuje Magic Card dla kancelarii o pakiecie BIZNES
 */
export function LawFirmCardWrapper({
  children,
  pakietSubskrypcji,
  className = "",
}: LawFirmCardWrapperProps) {
  const isBiznesPlan = pakietSubskrypcji === "BIZNES"

  if (isBiznesPlan) {
    return (
      <MagicCard
        className={`h-full rounded-lg ${className}`}
        gradientFrom="#9E7AFF"
        gradientTo="#FE8BBB"
        gradientSize={200}
      >
        {children}
      </MagicCard>
    )
  }

  return <>{children}</>
}
