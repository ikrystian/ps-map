"use client"

import {
  FaFacebook as Facebook,
  FaInstagram as Instagram,
  FaLinkedin as Linkedin,
} from "react-icons/fa"

interface PanelFooterProps {
  className?: string
  id?: string
}

export function PanelFooter({ className = "", id }: PanelFooterProps) {
  return (
    <div className={className} id={id}>
      {/* Partners banner */}
      <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl bg-card border border-zinc-800/30 bg-card/30 backdrop-blur-sm border border-border/40 p-5 w-full mx-auto mb-6">
        <span className="text-sm font-medium text-zinc-400">Nasi partnerzy:</span>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {/* IdentyfikacjaFirm */}
          <a
            href="https://identyfikacjafirm.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
          >
            <div className="flex flex-col items-start leading-none">
              <span className="text-md font-bold text-white tracking-tight">
                Identyfikacja<span className="font-extrabold text-zinc-300">Firm</span>
              </span>
            </div>
          </a>

          {/* Divider between partners */}
          <div className="hidden sm:block h-4 w-px bg-zinc-800/80" />

          {/* 4Connection */}
          <a
            href="https://4connection.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
          >
            <span className="text-md font-bold text-white tracking-tight">
              4<span className="font-semibold text-zinc-300">Connection</span>
            </span>
          </a>
          <div className="hidden sm:block h-4 w-px bg-zinc-800/80" />

          <a href="https://bpcoders.pl" target="_blank" rel="noopener noreferrer">
            <span className="text-md font-bold text-white tracking-tight">
              BP<span className="font-semibold text-zinc-300">Coders</span>
            </span>
          </a>
        </div>
      </div>

      {/* Separator line */}
      <div className="border-t border-zinc-800/40 my-6 max-w-3xl mx-auto" />

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
