"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react"
import {
  FaFacebook as Facebook,
  FaInstagram as Instagram,
  FaLinkedin as Linkedin,
  FaTwitter as Twitter,
  FaYoutube as Youtube,
} from "react-icons/fa"

import { ContactForm } from "@/components/ContactForm"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"

const GOLD = "#d7b56d"

const contactMethods = [
  {
    icon: Phone,
    label: "Zadzwoń do nas",
    value: "+48 534 888 555",
    href: "tel:+48534888555",
    hint: "Biuro Obsługi Klienta",
  },
  {
    icon: Mail,
    label: "Napisz e-mail",
    value: "bok@prostasprawa.pl",
    href: "mailto:bok@prostasprawa.pl",
    hint: "Odpowiadamy zwykle w ciągu 24 h",
  }
]

const openingHours = [
  { day: "Poniedziałek – Piątek", hours: "8:00 – 18:00" },
  { day: "Sobota", hours: "9:00 – 14:00" },
  { day: "Niedziela", hours: "Nieczynne" },
]

const socialLinks = [
  { key: "facebook", href: "https://facebook.com", Icon: Facebook, label: "Facebook" },
  { key: "linkedin", href: "https://linkedin.com", Icon: Linkedin, label: "LinkedIn" },
  { key: "instagram", href: "https://instagram.com", Icon: Instagram, label: "Instagram" },
  { key: "twitter", href: "https://twitter.com", Icon: Twitter, label: "X / Twitter" },
  { key: "youtube", href: "https://youtube.com", Icon: Youtube, label: "YouTube" },
]

const quickLinks = [
  {
    icon: HelpCircle,
    title: "Przeglądaj kategorie",
    desc: "Znajdź specjalistę w odpowiedniej dziedzinie prawa.",
    href: "/kategorie",
  },
  {
    icon: MessageSquare,
    title: "Jak to działa",
    desc: "Poznaj krok po kroku, jak znaleźć specjalistę.",
    href: "/jak-to-dziala",
  },
  {
    icon: ShieldCheck,
    title: "Polityka prywatności",
    desc: "Dowiedz się, jak chronimy Twoje dane.",
    href: "/polityka-prywatnosci",
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "easeOut" },
} as const

export default function ContactClientPage() {
  return (
    <>
      {/* Breadcrumbs banner */}
      <div
        className="relative w-full h-28 md:h-[140px] flex items-center bg-cover bg-center overflow-hidden border-b border-neutral-900/60"
        style={{ backgroundImage: "url('/images/lady-justice-banner.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/40" />
        <div className="container mx-auto px-4 relative z-10">
          <ResponsiveBreadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Kontakt" }]}
          />
        </div>
      </div>

      <div className="bg-[#121212]">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-10">
          <div
            className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
            style={{ backgroundColor: "rgba(215,181,109,0.07)" }}
          />
          <motion.div
            {...fadeUp}
            className="max-w-3xl mx-auto text-center relative z-10"
          >
            <p
              className="text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase mb-5"
              style={{ color: GOLD }}
            >
              Jesteśmy do Twojej dyspozycji
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl text-white font-light tracking-tight leading-tight mb-6">
              Skontaktuj się <span className="font-bold">z nami</span>
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Masz pytanie dotyczące platformy, znalezienia specjalisty albo współpracy?
              Wypełnij formularz lub skorzystaj z danych kontaktowych poniżej — nasze Biuro
              Obsługi Klienta chętnie pomoże w każdej sprawie.
            </p>
          </motion.div>
        </section>

        {/* Contact info + form */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: info */}
            <motion.div
              {...fadeUp}
              className="lg:col-span-5 flex flex-col gap-4"
            >
              {contactMethods.map(({ icon: Icon, label, value, href, hint }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-start gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition-all hover:border-[#d7b56d]/50 hover:bg-neutral-900/60"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#d7b56d]/10 text-[#d7b56d] transition-colors group-hover:bg-[#d7b56d]/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                      {label}
                    </p>
                    <p className="text-white font-medium break-words transition-colors group-hover:text-[#d7b56d]">
                      {value}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">{hint}</p>
                  </div>
                </a>
              ))}

              {/* Opening hours */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#d7b56d]/10 text-[#d7b56d]">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      Godziny pracy
                    </p>
                    <p className="text-white font-medium">Biuro Obsługi Klienta</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {openingHours.map(({ day, hours }) => (
                    <li
                      key={day}
                      className="flex items-center justify-between text-sm border-b border-neutral-800/60 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-neutral-400">{day}</span>
                      <span className="text-white font-medium">{hours}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <p className="text-xs uppercase tracking-wide text-neutral-500 mb-3">
                  Znajdź nas w sieci
                </p>
                <div className="flex items-center gap-3">
                  {socialLinks.map(({ key, href, Icon, label }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 transition-all hover:border-[#d7b56d]/50 hover:text-[#d7b56d]"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: form */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="lg:col-span-7"
            >
              <div className="mb-5 flex items-center gap-2 text-[#d7b56d]">
                <Send className="h-4 w-4" />
                <span className="text-xs font-semibold tracking-[0.18em] uppercase">
                  Wyślij wiadomość
                </span>
              </div>
              <ContactForm />
            </motion.div>
          </div>
        </section>

        {/* Quick help */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-10">
              <h2 className="font-playfair text-3xl sm:text-4xl text-white font-light">
                Zanim napiszesz — <span className="font-bold">może to pomoże</span>
              </h2>
              <p className="text-neutral-400 text-sm mt-3">
                Część odpowiedzi znajdziesz szybciej w naszych materiałach pomocy.
              </p>
            </motion.div>
            <motion.div
              {...fadeUp}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {quickLinks.map(({ icon: Icon, title, desc, href }) => (
                <Link
                  key={title}
                  href={href}
                  className="group rounded-xl border border-neutral-800 bg-neutral-900 p-6 transition-all hover:border-[#d7b56d]/50 hover:-translate-y-1"
                >
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#d7b56d]/10 text-[#d7b56d] transition-colors group-hover:bg-[#d7b56d]/20">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-white font-semibold text-lg mb-2 transition-colors group-hover:text-[#d7b56d]">
                    {title}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
                </Link>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
