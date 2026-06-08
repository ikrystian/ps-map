"use client"

import {
  FaFacebook as Facebook,
  FaInstagram as Instagram,
  FaLinkedin as Linkedin,
  FaTwitter as Twitter,
  FaYoutube as Youtube
} from "react-icons/fa"
import { Mail, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, Fragment } from "react"

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

export default function PublicFooter() {
  const [blogCategories, setBlogCategories] = useState<{ id: string; nazwa: string; slug: string }[]>([])

  useEffect(() => {
    const fetchBlogCategories = async () => {
      try {
        const response = await fetch("/api/blog/categories")
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

  return (
    <footer id="public-footer" className="relative overflow-hidden shadow-lg bg-[#141414] text-neutral-300 border-t border-neutral-900">
      {/* Labyrinth background pattern overlay */}
      <div className="absolute inset-0 opacity-100 z-10 pointer-events-none" />

      {/* Main footer content wrapper */}
      <div className="relative container mx-auto px-4 pt-16 pb-8 z-20">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-4 xl:gap-8 lg:gap-12">

          {/* Column 1: Logo & About (~35% / 4 cols) */}
          <div className="space-y-4 lg:col-span-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/white-logo.png"
                alt="Prosta Sprawa"
                width={160}
                height={40}
                className="brightness-200"
              />
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed font-light max-w-sm">
              Prostasprawa.pl to nowoczesny portal, który łączy osoby potrzebujące pomocy prawnej z doświadczonymi specjalistami. Oferujemy szybki i bezpieczny dostęp do porad prawnych, umożliwiając łatwe znalezienie odpowiedniego prawnika w różnych dziedzinach prawa.
            </p>
          </div>

          {/* Column 2: Menu (~20% / 2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="font-playfair text-white text-lg font-normal tracking-wide mb-4">
              Menu
            </h3>
            <ul className="space-y-2 text-sm font-light text-neutral-400">
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
              <Link href="/Regulamin" className=" hover:text-[#d7b56d] transition-colors flex items-center">

                <span>Regulamin</span>
              </Link>
            </ul>
          </div>

          {/* Column 3: Prosta sprawa (~20% / 3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="font-playfair text-white text-lg font-normal tracking-wide mb-4">
              Prosta sprawa
            </h3>
            <ul className="space-y-2 text-xs md:text-sm font-light">
              <li>
                <Link href="/blog" className="text-neutral-400 hover:text-[#d7b56d] transition-colors flex items-center">
                  <GoldCheck />
                  <span>Artykuły</span>
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="text-neutral-400 hover:text-[#d7b56d] transition-colors flex items-center">
                  <GoldCheck />
                  <span>Ranking eksperta</span>
                </Link>
              </li>
              <li>
                <Link href="/z-nami-wygrywasz" className="text-neutral-400 hover:text-[#d7b56d] transition-colors flex items-center">
                  <GoldCheck />
                  <span>Z nami wygrywasz</span>
                </Link>
              </li>
              <li>
                <Link href="/logowanie" className="text-neutral-400 hover:text-[#d7b56d] transition-colors flex items-center">
                  <GoldCheck />
                  <span>Logowanie</span>
                </Link>
              </li>
              <li>
                <Link href="/rejestracja" className="text-neutral-400 hover:text-[#d7b56d] transition-colors flex items-center">
                  <GoldCheck />
                  <span>Rejestracja</span>
                </Link>
              </li>
              <li>
                <Link href="/polityka-prywatnosci" className="text-neutral-400 hover:text-[#d7b56d] transition-colors font-medium">
                  <GoldCheck />
                  Prywatność
                </Link>
              </li>

            </ul>
          </div>

          {/* Column 4: Kontakt (~25% / 3 cols) */}
          <div className="space-y-3 lg:col-span-3">
            <h3 className="font-playfair text-white text-lg font-normal tracking-wide mb-4">
              Kontakt
            </h3>

            <div className="flex items-center gap-2 text-xs md:text-sm font-light text-neutral-400">
              <Mail className="h-4 w-4 text-[#d7b56d] flex-shrink-0" />
              <a href="mailto:biuro@prostasprawa.pl" className="hover:text-white transition-colors">
                biuro@prostasprawa.pl
              </a>
            </div>

            <div className="text-xs text-neutral-400 font-light space-y-1 pt-1 leading-relaxed">
              <p>Polska Grupa Identyfikacji Firm Sp. z o.o.</p>
              <p>ul. Langiewicza 16/1, 25-118 Kielce</p>
              <p>KRS: 0000768233, NIP: 9592020878,</p>
              <p>REGON: 382403289</p>
            </div>

            <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-[#d7b56d] pt-2">
              <Phone className="h-4 w-4 text-[#d7b56d] flex-shrink-0" />
              <a href="tel:+48571500055" className="hover:underline">
                +48 571 - 500 - 055
              </a>
            </div>
          </div>

        </div>

        {/* Horizontal Category Tag Ribbon ("Artykuły branżowe") */}
        {blogCategories.length > 0 && (
          <div className="mt-12 pt-6 border-t border-neutral-900">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm md:text-xs text-neutral-500 justify-start items-center">
              <span className="font-medium text-neutral-400 mr-1">Artykuły branżowe:</span>
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
        <div className="mt-6 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p className="font-light">
            2024 © ProstaSprawa.pl
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </Link>
            <Link
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <Youtube className="h-4 w-4" />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
