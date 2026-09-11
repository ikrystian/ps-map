"use client"

import Script from "next/script"
import { useEffect, useRef } from "react"

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

interface AdSenseUnitProps {
  enabled?: boolean
  clientId?: string
  slot?: string
  className?: string
  format?: string
}

export function AdSenseUnit({
  enabled,
  clientId,
  slot,
  className,
  format = "auto",
}: AdSenseUnitProps) {
  const pushedRef = useRef(false)
  const cleanClientId = clientId?.trim()
  const cleanSlot = slot?.trim()
  const shouldRender = Boolean(enabled && cleanClientId && cleanSlot)

  useEffect(() => {
    if (!shouldRender || pushedRef.current) return
    pushedRef.current = true
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (error) {
      console.error("Błąd inicjalizacji jednostki reklamowej AdSense:", error)
    }
  }, [shouldRender])

  if (!shouldRender) {
    return null
  }

  return (
    <div className={className}>
      <Script
        id="adsbygoogle-script"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cleanClientId}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={cleanClientId}
        data-ad-slot={cleanSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
