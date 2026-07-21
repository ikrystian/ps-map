"use client"

import Script from "next/script"

interface GoogleAnalyticsProps {
  gaId?: string
  enabled?: boolean
}

export function GoogleAnalytics({ gaId, enabled }: GoogleAnalyticsProps) {
  if (!enabled || !gaId || !gaId.trim()) {
    return null
  }

  const cleanGaId = gaId.trim()

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${cleanGaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${cleanGaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
