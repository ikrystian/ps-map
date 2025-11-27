"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react"

export default function PublicFooter() {
  return (
    <footer id="public-footer" className="bg-black/[0.3] text-slate-300 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/white-logo.png"
                alt="Prosta Sprawa"
                width={180}
                height={45}
                className="brightness-200"
              />
            </Link>
            <p className="text-sm text-slate-400">
              Platforma łącząca klientów z najlepszymi prawnikami w Polsce.
              Znajdź specjalistę odpowiedniego dla Twojej sprawy.
            </p>
            <div className="flex gap-3">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 rounded-full hover:bg-primary transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 rounded-full hover:bg-primary transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 rounded-full hover:bg-primary transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 rounded-full hover:bg-primary transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Dla Klientów */}
          <div>
            <h3 className="text-white font-semibold mb-4">Dla Klientów</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/szukaj-prawnika" className="hover:text-primary transition-colors">
                  Szukaj Prawnika
                </Link>
              </li>
              <li>
                <Link href="/kategorie" className="hover:text-primary transition-colors">
                  Kategorie Spraw
                </Link>
              </li>
              <li>
                <Link href="/dodaj-sprawe" className="hover:text-primary transition-colors">
                  Dodaj Sprawę
                </Link>
              </li>
              <li>
                <Link href="/jak-to-dziala" className="hover:text-primary transition-colors">
                  Jak To Działa
                </Link>
              </li>
              <li>
                <Link href="/z-nami-wygrywasz" className="hover:text-primary transition-colors">
                  Z Nami Wygrywasz
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Dla Prawników */}
          <div>
            <h3 className="text-white font-semibold mb-4">Dla Prawników</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dla-prawnika" className="hover:text-primary transition-colors">
                  Dla Prawnika
                </Link>
              </li>
              <li>
                <Link href="/cennik" className="hover:text-primary transition-colors">
                  Cennik
                </Link>
              </li>
              <li>
                <Link href="/rejestracja/kancelaria" className="hover:text-primary transition-colors">
                  Zarejestruj Eksperta
                </Link>
              </li>
              <li>
                <Link href="/panel-eksperta" className="hover:text-primary transition-colors">
                  Panel Eksperta
                </Link>
              </li>
            </ul>
          </div>

          {/* Informacje */}
          <div>
            <h3 className="text-white font-semibold mb-4">Informacje</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/o-nas" className="hover:text-primary transition-colors">
                  O Nas
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-primary transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/regulamin" className="hover:text-primary transition-colors">
                  Regulamin
                </Link>
              </li>
              <li>
                <Link href="/polityka-prywatnosci" className="hover:text-primary transition-colors">
                  Polityka Prywatności
                </Link>
              </li>
              <li>
                <Link href="/dokumentacja" className="hover:text-primary transition-colors">
                  Dokumentacja
                </Link>
              </li>
            </ul>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:kontakt@prosta-sprawa.pl" className="hover:text-primary transition-colors">
                  kontakt@prosta-sprawa.pl
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+48123456789" className="hover:text-primary transition-colors">
                  +48 123 456 789
                </a>
              </div>
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>ul. Przykładowa 123<br />00-001 Warszawa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>
              © {new Date().getFullYear()} Prosta Sprawa. Wszelkie prawa zastrzeżone.
            </p>
            <p>
              Stworzone z ❤️ dla polskich prawników i ich klientów
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
