"use client"

import { SiteLogo } from "@/components/site-logo"
import {
  FaFacebook as Facebook,
  FaInstagram as Instagram,
  FaLinkedin as Linkedin,
  FaTwitter as Twitter,
  FaYoutube as Youtube
} from "react-icons/fa"
import { Mail, Phone, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, Fragment } from "react"
import { openCookiePreferences } from "@/components/CookieConsent"

// Inline lightweight gold checkmark SVG matching the mockup spec
const GoldCheck = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="#d7b56d"
    strokeWidth="3.5"
    className="w-3 h-3 inline-block mr-2 text-[#d7b56d] align-middle select-none pointer-events-none"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const defaultSocialLinks = {
  facebook: "https://facebook.com",
  twitter: "https://twitter.com",
  linkedin: "https://linkedin.com",
  youtube: "https://youtube.com",
  instagram: "https://instagram.com",
}

function formatDeployTime(isoString: string): string {
  if (!isoString) return ""
  try {
    const date = new Date(isoString)
    return date.toLocaleString("pl-PL", {
      timeZone: "Europe/Warsaw",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

export default function PublicFooter() {
  const [blogCategories, setBlogCategories] = useState<{ id: string; nazwa: string; slug: string }[]>([])
  const [copyrightText, setCopyrightText] = useState("2026 © ProstaSprawa.pl")
  const [socialLinks, setSocialLinks] = useState(defaultSocialLinks)

  const deployTime = formatDeployTime(process.env.DEPLOY_TIME || "")

  useEffect(() => {
    const fetchBlogCategories = async () => {
      try {
        const response = await fetch("/api/blog/categories?public=true")
        if (response.ok) {
          const data = await response.json()
          setBlogCategories(data)
        }
      } catch (error) {
        console.error("Error fetching blog categories for footer:", error)
      }
    }
    fetchBlogCategories()
  }, [])

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          if (data.footerCopyrightText !== undefined) {
            setCopyrightText(data.footerCopyrightText)
          }
          // Pusty string oznacza celowo ukrytą ikonę, brak klucza — wartość domyślną
          setSocialLinks(prev => ({
            facebook: data.footerSocialFacebook ?? prev.facebook,
            twitter: data.footerSocialTwitter ?? prev.twitter,
            linkedin: data.footerSocialLinkedin ?? prev.linkedin,
            youtube: data.footerSocialYoutube ?? prev.youtube,
            instagram: data.footerSocialInstagram ?? prev.instagram,
          }))
        }
      } catch (error) {
        console.error("Error fetching footer settings:", error)
      }
    }
    fetchFooterSettings()
  }, [])

  const socialIcons = [
    { key: "facebook", href: socialLinks.facebook, Icon: Facebook },
    { key: "twitter", href: socialLinks.twitter, Icon: Twitter },
    { key: "linkedin", href: socialLinks.linkedin, Icon: Linkedin },
    { key: "youtube", href: socialLinks.youtube, Icon: Youtube },
    { key: "instagram", href: socialLinks.instagram, Icon: Instagram },
  ]

  return (
    <footer id="public-footer" className="relative overflow-hidden shadow-lg bg-background text-foreground/80 border-t border-border">
      {/* Labyrinth background pattern overlay */}
      <div className="absolute inset-0 opacity-100 z-10 pointer-events-none" />

      {/* Main footer content wrapper */}
      <div className="relative container mx-auto px-4 pt-16 pb-8 z-20">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-4 xl:gap-8 lg:gap-12">

          {/* Column 1: Logo & About (~35% / 4 cols) */}
          <div className="space-y-4 col-span-2 lg:col-span-4">
            <Link href="/" className="inline-block">
              <SiteLogo width={160} height={40} />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed font-light max-w-sm">
              Prostasprawa.pl to nowoczesny portal, który łączy osoby potrzebujące pomocy prawnej z doświadczonymi specjalistami. Oferujemy szybki i bezpieczny dostęp do porad prawnych, umożliwiając łatwe znalezienie odpowiedniego prawnika w różnych dziedzinach prawa.
            </p>
          </div>

          {/* Column 2: Menu (~20% / 2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="font-playfair text-foreground text-lg font-normal tracking-wide mb-4">
              Menu
            </h3>
            <ul className="space-y-2 text-sm font-light text-muted-foreground">
              <li>
                <Link href="/kategorie" className="hover:text-[#d7b56d] transition-colors">
                  Sprawy prywatne
                </Link>
              </li>
              <li>
                <Link href="/kategorie" className="hover:text-[#d7b56d] transition-colors">
                  Sprawy firmowe
                </Link>
              </li>
              <li>
                <Link href="/dla-prawnika" className="hover:text-[#d7b56d] transition-colors">
                  Dla prawnika
                </Link>
              </li>
              <li>
                <Link href="/o-nas" className="hover:text-[#d7b56d] transition-colors">
                  O nas
                </Link>
              </li>
              <li>
                <Link href="/polityka-prywatnosci" className="hover:text-[#d7b56d] transition-colors">
                  Zgody
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-[#d7b56d] transition-colors">
                  Kontakt
                </Link>
              </li>
              <Link href="/regulamin" className=" hover:text-[#d7b56d] transition-colors flex items-center">

                <span>Regulamin</span>
              </Link>
            </ul>
          </div>

          {/* Column 3: Prosta sprawa (~20% / 3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="font-playfair text-foreground text-lg font-normal tracking-wide mb-4">
              Prosta sprawa
            </h3>
            <ul className="space-y-2 text-xs md:text-sm font-light">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-secondary transition-colors flex items-center">
                  <GoldCheck />
                  <span>Artykuły</span>
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="text-muted-foreground hover:text-secondary transition-colors flex items-center">
                  <GoldCheck />
                  <span>Ranking eksperta</span>
                </Link>
              </li>
              <li>
                <Link href="/z-nami-wygrywasz" className="text-muted-foreground hover:text-secondary transition-colors flex items-center">
                  <GoldCheck />
                  <span>Z nami wygrywasz</span>
                </Link>
              </li>
              <li>
                <Link href="/logowanie" className="text-muted-foreground hover:text-secondary transition-colors flex items-center">
                  <GoldCheck />
                  <span>Logowanie</span>
                </Link>
              </li>
              <li>
                <Link href="/rejestracja" className="text-muted-foreground hover:text-secondary transition-colors flex items-center">
                  <GoldCheck />
                  <span>Rejestracja</span>
                </Link>
              </li>
              <li>
                <Link href="/polityka-prywatnosci" className="text-muted-foreground hover:text-secondary transition-colors font-medium">
                  <GoldCheck />
                  Prywatność
                </Link>
              </li>
              <li>
                <Link href="/reklama" className="text-muted-foreground hover:text-secondary transition-colors font-medium">
                  <GoldCheck />
                  Reklama
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Kontakt (~25% / 3 cols) */}
          <div className="space-y-3 col-span-2 lg:col-span-3">
            <h3 className="font-playfair text-foreground text-lg font-normal tracking-wide mb-4">
              Kontakt
            </h3>

            <div>Polska Grupa Identyfikacji Firm Sp. z o.o.</div>
            <div className="text-xs text-muted-foreground font-light space-y-1 pt-1 leading-relaxed">
              NIP: 9592020678
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm font-light text-muted-foreground">
              <Mail className="h-4 w-4 text-[#d7b56d] flex-shrink-0" />
              <a href="mailto:bok@prostasprawa.pl" className="hover:text-foreground transition-colors">
                bok@prostasprawa.pl
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-[#d7b56d] pt-2">
              <Phone className="h-4 w-4 text-[#d7b56d] flex-shrink-0" />
              <a href="tel:+48534888555" className="hover:underline">
                +48 534 888 555
              </a>
            </div>
          </div>

        </div>

        {/* Horizontal Category Tag Ribbon ("Artykuły branżowe") */}
        {blogCategories.length > 0 && (
          <div className="mt-12 pt-6 border-t border-border">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm md:text-xs text-muted-foreground justify-start items-center">
              <span className="font-medium text-muted-foreground mr-1">Artykuły branżowe:</span>
              {blogCategories.map((category, index) => (
                <Fragment key={category.id}>
                  <Link href={`/blog?category=${category.slug}`} className="hover:text-[#d7b56d] transition-colors">
                    {category.nazwa}
                  </Link>
                  {index < blogCategories.length - 1 && (
                    <span className="text-neutral-700 select-none">·</span>
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Sub-footer bottom bar */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="font-light">
              {copyrightText}
            </p>
            <button
              type="button"
              id="cookies"
              onClick={openCookiePreferences}
              className="font-light hover:text-[#d7b56d] transition-colors"
            >
              Ustawienia cookies
            </button>
            {deployTime && (
              <span className="font-light text-neutral-600" title="Data ostatniej aktualizacji strony">
                Aktualizacja: {deployTime}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {socialIcons
              .filter(({ href }) => href)
              .map(({ key, href, Icon }) => (
                <Link
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
