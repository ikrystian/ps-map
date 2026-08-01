"use client"

import { Fragment, useEffect, useState } from "react"
import {
  FaFacebook as Facebook,
  FaInstagram as Instagram,
  FaLinkedin as Linkedin,
} from "react-icons/fa"
import {
  PreviewLinkCard,
  PreviewLinkCardTrigger,
  PreviewLinkCardContent,
  PreviewLinkCardImage,
} from "@/components/animate-ui/components/radix/preview-link-card"

interface PanelFooterProps {
  className?: string
  id?: string
}

type PartnerLogo = {
  id: string
  name: string
  imageUrl: string
  linkUrl: string | null
}

export function PanelFooter({ className = "", id }: PanelFooterProps) {
  const [logos, setLogos] = useState<PartnerLogo[]>([])

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const res = await fetch("/api/partner-logos")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setLogos(data)
          }
        }
      } catch (error) {
        console.error("Error fetching partner logos:", error)
      }
    }

    fetchLogos()
  }, [])

  return (
    <div className={className} id={id}>
      {/* Partners banner */}
      {logos.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-6 shadow-lg rounded-xl bg-card/30 backdrop-blur-sm border border-border/40 p-5 w-full mx-auto mb-6">
          <span className="hidden sm:block text-sm font-medium text-zinc-400">Nasi partnerzy:</span>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {logos.map((logo, idx) => {
              const image = (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo.imageUrl}
                  alt={logo.name}
                  title={logo.name}
                  className="h-8 w-auto max-w-[140px] object-contain"
                />
              )

              return (
                <Fragment key={logo.id}>
                  {idx > 0 && <div className="hidden sm:block h-4 w-px bg-zinc-800/80" />}
                  {logo.linkUrl ? (
                    <PreviewLinkCard href={logo.linkUrl}>
                      <PreviewLinkCardTrigger
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center transition-opacity hover:opacity-80"
                      >
                        {image}
                      </PreviewLinkCardTrigger>
                      <PreviewLinkCardContent className="z-50 zp-1 bg-zinc-900/90 border-zinc-800 backdrop-blur-md rounded-lg shadow-xl">
                        <PreviewLinkCardImage
                          alt={logo.name}
                          className="w-[240px] h-[135px] object-cover rounded"
                        />
                      </PreviewLinkCardContent>
                    </PreviewLinkCard>
                  ) : (
                    <div className="flex items-center">{image}</div>
                  )}
                </Fragment>
              )
            })}
          </div>
        </div>
      )}

      {/* Separator line */}
      <div className="border-t border-zinc-800/40 my-3 max-w-3xl mx-auto" />

      {/* Bottom Copyright and Social Links */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-zinc-500">
        <span>2026 © ProstaSprawa.pl</span>
        <div className="flex gap-2">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800/80 hover:text-white border border-zinc-800/20 transition-all"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800/80 hover:text-white border border-zinc-800/20 transition-all"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800/80 hover:text-white border border-zinc-800/20 transition-all"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

