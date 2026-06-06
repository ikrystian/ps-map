"use client"

import { MagicCard } from "@/components/magic-card"
import React from "react"

interface LawFirmCardWrapperProps {
  children: React.ReactNode
  pakietSubskrypcji?: string
  className?: string
}

/**
 * Komponent owijający karty eksperta
 * Automatycznie stosuje Magic Card dla ekspertów o pakiecie BIZNES
 */
export function LawFirmCardWrapper({
  children,
  pakietSubskrypcji,
  className = "",
}: LawFirmCardWrapperProps) {
  if (pakietSubskrypcji === "BIZNES") {
    return (
      <MagicCard
        className={`h-full rounded-lg ${className}`}
        gradientFrom="#FFE066"
        gradientTo="#F5AF19"
        gradientSize={200}
      >
        {children}
      </MagicCard>
    )
  }

  if (pakietSubskrypcji === "PREMIUM") {
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

  if (pakietSubskrypcji === "STANDARD") {
    return (
      <MagicCard
        className={`h-full rounded-lg ${className}`}
        gradientFrom="#3B82F6"
        gradientTo="#06B6D4"
        gradientSize={200}
      >
        {children}
      </MagicCard>
    )
  }

  return <>{children}</>
}
