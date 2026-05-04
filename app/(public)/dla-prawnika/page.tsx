"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  TrendingUp,
  Award,
  Shield,
  Phone,
  Mail,
  ArrowRight,
  FileText,
  UserPlus,
  CheckCircle,
  Rocket,
  Calculator,
  Package,
  ChevronRight,
  MapPin,
  Star,
  Plus,
  Briefcase,
  PlusCircle,
  HandHelping,
  ClipboardCheck,
  ArrowUpRight,
} from "lucide-react";

export default function ForLawyersPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Specjalista prawa");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
  };

  return (
    <div className="min-h-screen bg-[#1a1a17] text-white">
      <section
        id="top-dla-prawnika"
        className="relative bg-[#141414] py-24 md:py-32 overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-6xl font-playfair mb-8 text-white leading-tight">
                Znajdź eksperta
              </h1>
              <p className="text-[#a1a1a1] text-sm md:text-base leading-relaxed mb-10 max-w-lg">
                Naszym głównym celem jest zwiększenie dostępności bezpłatnej
                pomocy i informacji prawnej oraz promocja ekspertów z całej
                Polski. Pragniemy aby za pośrednictwem serwisu prostasprawa.pl
                każdy mógł szybko i bezproblemowo znaleźć odpowiedź na nurtujący
                go problem lub prawnika, który zajmie się kompleksowo jego
                zagadnieniem.
              </p>
              <Button
                asChild
                className="bg-[#00897b] hover:bg-[#00796b] text-white px-10 py-6 h-auto text-base rounded-md font-medium transition-all duration-300"
              >
                <Link href="/szukaj-prawnika">Dowiedz się więcej</Link>
              </Button>
            </div>

            <div className="relative flex justify-center md:justify-end">
              {/* Gold Logo Watermark */}
              <div className="absolute top-1/2 left-0 md:-left-20 -translate-y-1/2 rotate-[-15deg] opacity-60 select-none pointer-events-none">
                <svg
                  viewBox="0 0 200 200"
                  className="w-[300px] h-[300px] md:w-[450px] md:h-[450px]"
                >
                  <defs>
                    <linearGradient
                      id="goldGradientHero"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#C5A059" />
                      <stop offset="50%" stopColor="#F7E0A3" />
                      <stop offset="100%" stopColor="#8C6A2E" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="0,0 80,0 100,60 120,0 200,0 100,200"
                    fill="url(#goldGradientHero)"
                  />
                </svg>
              </div>

              {/* Image Container */}
              <div className="relative z-10 w-full max-w-md md:max-w-lg overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <Image
                  src="/sam.jpeg"
                  alt="Ekspert"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA: Jak działa nasza aplikacja? */}
      <section
        id="how-it-works"
        className="relative bg-[#111111] py-24 md:py-32 overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-playfair text-center mb-24 text-white">
            Jak działa nasza aplikacja?
          </h2>

          <div className="relative max-w-6xl mx-auto">
            {/* Dashed Path (Desktop) */}
            <div className="absolute top-[15%] left-0 w-full hidden md:block pointer-events-none">
              <svg
                width="100%"
                height="120"
                viewBox="0 0 1200 120"
                fill="none"
                className="opacity-20"
              >
                <circle cx="20" cy="60" r="4" fill="white" />
                <path
                  d="M24 60 C 150 60, 250 10, 400 60 C 550 110, 650 10, 800 60 C 950 110, 1050 30, 1150 50"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                />
              </svg>
              <div className="absolute right-0 top-[35px] text-white/30">
                <MapPin className="w-8 h-8" strokeWidth={1} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group">
                <span className="text-5xl font-playfair text-white/5 mb-2 transition-colors duration-500 group-hover:text-white/10">
                  01
                </span>
                <div className="w-28 h-28 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl transition-all duration-500 group-hover:border-[#00897b]/50 group-hover:shadow-[#00897b]/20 group-hover:-translate-y-1">
                  <PlusCircle
                    className="w-12 h-12 text-[#00897b]"
                    strokeWidth={1}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white tracking-wide">
                  Dodaj sprawę
                </h3>
                <p className="text-[#888888] text-xs leading-relaxed max-w-[260px]">
                  Dzięki naszej platformie masz bezpośredni dostęp do szerokiej
                  sieci doświadczonych prawników i ekspertów z całej kraju.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group">
                <span className="text-5xl font-playfair text-white/5 mb-2 transition-colors duration-500 group-hover:text-white/10">
                  02
                </span>
                <div className="w-28 h-28 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl transition-all duration-500 group-hover:border-[#00897b]/50 group-hover:shadow-[#00897b]/20 group-hover:-translate-y-1">
                  <HandHelping
                    className="w-12 h-12 text-[#00897b]"
                    strokeWidth={1}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white tracking-wide">
                  Otrzymaj oferty
                </h3>
                <p className="text-[#888888] text-xs leading-relaxed max-w-[260px]">
                  Nasz portal umożliwia dodawanie sprawy całkowicie za darmo.
                  Wystarczy kilka kliknięć, aby opisać Twoją sytuację.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group">
                <span className="text-5xl font-playfair text-white/5 mb-2 transition-colors duration-500 group-hover:text-white/10">
                  03
                </span>
                <div className="w-28 h-28 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl transition-all duration-500 group-hover:border-[#00897b]/50 group-hover:shadow-[#00897b]/20 group-hover:-translate-y-1">
                  <ClipboardCheck
                    className="w-12 h-12 text-[#00897b]"
                    strokeWidth={1}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white tracking-wide">
                  Sprawa rozwiązana
                </h3>
                <p className="text-[#888888] text-xs leading-relaxed max-w-[260px]">
                  Prosta Sprawa to miejsce gdzie wszystko załatwisz online, bez
                  konieczności wychodzenia z domu czy tracenia czasu na dojazdy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="check-experts" className="container mx-auto px-4 py-20">
        <div className="relative bg-[#00897b] rounded-[2rem] md:rounded-[3rem] overflow-hidden min-h-[450px] flex items-center shadow-2xl">
          {/* Dotted Poland Map Background */}
          <div className="absolute right-[-10%] top-[-20%] bottom-[-20%] w-full md:w-[70%] opacity-30 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="dotPatternMap" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                  <circle cx="1.5" cy="1.5" r="1.2" fill="white" />
                </pattern>
              </defs>
              <path 
                d="M80,20 L120,22 L150,35 L175,60 L185,90 L180,130 L160,165 L130,185 L100,190 L70,185 L40,165 L20,130 L15,90 L25,60 L50,35 Z" 
                fill="url(#dotPatternMap)"
                transform="scale(1.2) translate(-20, -10)"
              />
            </svg>
          </div>

          <div className="container mx-auto px-6 md:px-16 relative z-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="max-w-lg text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-playfair text-white mb-8 md:mb-12 leading-tight">
                  Sprawdź dostępność ekspertów w Twoim mieście
                </h2>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-[#00897b] px-12 py-7 h-auto text-lg rounded-xl bg-transparent transition-all duration-300 font-medium border-2">
                  <Link href="/szukaj-prawnika">Sprawdź</Link>
                </Button>
              </div>

              <div className="relative flex justify-center md:justify-end pt-10 md:pt-0">
                {/* Phone Mockup */}
                <div className="relative w-72 h-[520px] bg-[#141414] rounded-[3rem] border-[8px] border-[#222] shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden transform rotate-[-4deg] md:rotate-[-8deg] hover:rotate-0 transition-transform duration-700">
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#222] rounded-b-3xl z-30" />
                  
                  {/* Content Area */}
                  <div className="h-full flex flex-col">
                    {/* Image Header */}
                    <div className="relative h-[60%] w-full overflow-hidden">
                      <Image 
                        src="/sam.jpeg" 
                        alt="Ekspert" 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                      
                      {/* Top Brain/Logo Icon */}
                      <div className="absolute top-12 left-8 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <div className="text-[#C5A059] w-5 h-5">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Action Button (Overlapping) */}
                    <div className="flex justify-center -mt-7 relative z-20">
                      <div className="w-14 h-14 rounded-full bg-[#00897b] flex items-center justify-center shadow-xl border-4 border-[#141414]">
                        <ArrowUpRight className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Info Area */}
                    <div className="flex-1 p-8 text-center flex flex-col justify-center">
                      <span className="text-[10px] text-[#555] font-black tracking-[0.2em] uppercase mb-2">Prawnik</span>
                      <h3 className="text-white text-2xl font-bold tracking-tight">Jan Nowacki</h3>
                      <div className="mt-2 text-[#777] text-xs font-medium">
                        Kraków,<br />Małopolskie
                      </div>
                      
                      {/* Rating stars */}
                      <div className="flex justify-center gap-1.5 mt-5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 text-[#00897b] fill-[#00897b]" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA 1: Hero – Załóż konto eksperta */}
      <section className="py-20 md:py-28 bg-[#1a1a17]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-[10px] uppercase tracking-widest text-[#6b6b60] mb-4 font-medium">
              Znajdź nowych klientów
            </p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-0">
              Załóż konto <span className="font-extrabold">eksperta</span> i
              dodaj ogłoszenie
            </h1>
          </div>

          {/* Form card */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#242420] rounded-2xl p-6 md:p-8 mb-4">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs text-[#8a8a7d]">
                  Wysłane zgłoszenia
                </span>
                <span className="text-xs text-[#00897b] hover:underline cursor-pointer">
                  Od czego zależy cena?
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-0">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6b6b60] mb-2 block">
                    Kim jesteś?
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#1a1a17] border border-[#3e3e38] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00897b] transition-colors appearance-none"
                  >
                    <option>Specjalista prawa</option>
                    <option>Ekspert dla firm</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6b6b60] mb-2 block">
                    Kategorie
                  </label>
                  <select className="w-full bg-[#1a1a17] border border-[#3e3e38] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00897b] transition-colors appearance-none">
                    <option>Adwokat</option>
                    <option>Radca prawny</option>
                    <option>Notariusz</option>
                    <option>Doradca podatkowy</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6b6b60] mb-2 block">
                    Lokalizacja
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Wpisz miasto lub miejscowość"
                      className="flex-1 bg-[#1a1a17] border border-[#3e3e38] rounded-lg px-4 py-3 text-sm text-white placeholder-[#6b6b60] focus:outline-none focus:border-[#00897b] transition-colors"
                    />
                    <Button
                      asChild
                      className="bg-[#00897b] hover:bg-[#00796b] text-white rounded-lg px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 h-auto"
                    >
                      <Link href="/rejestracja/kancelaria">Załóż profil</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 quick links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  icon: <Rocket className="h-5 w-5 text-[#00897b]" />,
                  title: "Oferta na start",
                  sub: "Dowiedz się więcej",
                  href: "/cennik",
                },
                {
                  icon: <Calculator className="h-5 w-5 text-[#00897b]" />,
                  title: "Ile kosztuje ogłoszenie",
                  sub: "Dowiedz się więcej",
                  href: "/cennik",
                },
                {
                  icon: <Package className="h-5 w-5 text-[#00897b]" />,
                  title: "Potrzebujesz ogłoszeń?",
                  sub: "Zaoszczędź kupując pakiety",
                  href: "/sklep/punkty",
                },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="bg-[#242420] hover:bg-[#2a2a26] border border-[#2e2e2a] hover:border-[#00897b]/30 rounded-xl p-4 flex items-center gap-3 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1a1a17] border border-[#3e3e38] flex items-center justify-center flex-shrink-0 group-hover:border-[#00897b]/50 transition-all duration-200">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {item.title}
                    </div>
                    <div className="text-xs text-[#6b6b60]">{item.sub}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#6b6b60] ml-auto group-hover:text-[#00897b] transition-colors duration-200" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA 2: Wypróbuj ProstaSprawa.pl od 0 zł */}
      <section className="bg-[#222220] py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-widest text-[#6b6b60] mb-4 font-medium">
              Zyskaj klientów
            </p>
            <h2 className="text-3xl md:text-5xl font-serif">
              Wypróbuj <span className="font-bold">ProstaSprawa.pl</span> od 0
              zł
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {[
              {
                title1: "Zwiększ",
                title2: "zasięg",
                icon: (
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className="w-16 h-16 text-[#00897b]"
                  >
                    <path d="M50,10 C30,10 15,25 15,45 C15,55 20,65 30,72 L50,90 L70,72 C80,65 85,55 85,45 C85,25 70,10 50,10 Z" />
                    <path
                      d="M35,42 L45,52 L65,32"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
              },
              {
                title1: "Buduj",
                title2: "markę",
                icon: (
                  <div className="relative w-16 h-16 text-[#00897b]">
                    <MapPin className="w-10 h-10 absolute bottom-0 left-2" />
                    <div className="absolute top-0 right-0 border-2 border-[#00897b] rounded-md p-1">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                ),
              },
              {
                title1: "Zdobywaj",
                title2: "więcej spraw",
                icon: (
                  <div className="relative w-16 h-16 text-[#00897b]">
                    <div className="flex flex-col gap-2 pt-2">
                      <div className="h-1.5 w-12 bg-current rounded-full" />
                      <div className="h-1.5 w-8 bg-current rounded-full" />
                      <div className="h-1.5 w-10 bg-current rounded-full" />
                    </div>
                    <Plus className="w-7 h-7 absolute bottom-0 right-0 stroke-[3]" />
                  </div>
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#1a1a17] rounded-sm p-12 flex flex-col items-center text-center hover:bg-[#252525] transition-colors duration-300"
              >
                <h3 className="text-2xl font-serif mb-1">{item.title1}</h3>
                <h3 className="text-2xl font-serif mb-12">{item.title2}</h3>
                <div className="flex items-center justify-center h-20">
                  {item.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              asChild
              className="bg-[#00897b] hover:bg-[#00796b] text-white px-12 py-6 text-base rounded-md font-medium transition-all duration-300 h-auto"
            >
              <Link href="/rejestracja/kancelaria">Zarejestruj się</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEKCJA 3: Jak założyć konto? */}
      <section className="py-20 md:py-28 bg-[#1a1a17]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-[10px] uppercase tracking-widest text-[#6b6b60] mb-4 font-medium">
              Prosta sprawa!
            </p>
            <h2 className="text-3xl md:text-5xl font-bold">
              Jak założyć konto?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-14">
            {[
              {
                num: "01",
                icon: (
                  <FileText
                    className="h-10 w-10 text-[#00897b]"
                    strokeWidth={1.2}
                  />
                ),
                title: "Wypełnij formularz rejestracyjny",
                desc: "Podaj dane kontaktowe, wybierz specjalizacje i dodaj podstawowe informacje o swojej działalności.",
              },
              {
                num: "02",
                icon: (
                  <UserPlus
                    className="h-10 w-10 text-[#00897b]"
                    strokeWidth={1.2}
                  />
                ),
                title: "Uzupełnij profil",
                desc: "Dodaj opis, zdjęcia, filmy, doświadczenie, lokalizacje, w których świadczysz usługi. Im bardziej kompletny profil tym większa szansa na pozyskanie klientów.",
              },
              {
                num: "03",
                icon: (
                  <CheckCircle
                    className="h-10 w-10 text-[#00897b]"
                    strokeWidth={1.2}
                  />
                ),
                title: "Zacznij otrzymywać sprawy",
                desc: "Po zatwierdzeniu profilu zobaczysz sprawy dopasowane do Twojej specjalizacji. Składaj oferty i zdobywaj nowych klientów.",
              },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <span className="text-6xl font-bold text-[#2e2e2a] mb-4 leading-none">
                  {step.num}
                </span>
                <div className="w-20 h-20 bg-[#242420] rounded-xl flex items-center justify-center mb-5 border border-[#2e2e2a]">
                  {step.icon}
                </div>
                <h3 className="text-base font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-[#6b6b60] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              asChild
              className="bg-[#00897b] hover:bg-[#00796b] text-white rounded-lg px-8 py-5 text-sm font-semibold h-auto transition-all duration-200 gap-2"
            >
              <Link href="/dodaj-sprawe">
                Dodaj sprawę
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEKCJA 4: Jak to działa? */}
      <section className="py-20 md:py-28 bg-[#222220] relative overflow-hidden">
        {/* Large decorative V logo watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end opacity-5 pointer-events-none select-none">
          <svg
            viewBox="0 0 200 200"
            className="w-[600px] h-[600px]"
            fill="currentColor"
          >
            <polygon
              points="0,0 80,0 100,60 120,0 200,0 100,200"
              className="text-[#00897b]"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-[10px] uppercase tracking-widest text-[#6b6b60] mb-4 font-medium">
              Prosta Sprawa
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Jak to działa?
            </h2>
            <p className="text-sm text-[#8a8a7d] max-w-2xl mx-auto leading-relaxed">
              Dodaj swoją sprawę bez zbędnych formalności, czekaj na ofertę i
              wybierz tę, która najlepiej odpowiada Twoim potrzebom.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              {[
                {
                  num: "01.",
                  title: "ZAŁÓŻ PROFIL EKSPERTA",
                  desc: "Przedstaw swoje doświadczenie oraz specjalizacje.",
                },
                {
                  num: "02.",
                  title: "SPRAWY DOPASOWANE DO TWOICH USŁUG",
                  desc: "Użytkownicy zgłaszają problemy, a Ty możesz na nie odpowiadać.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-[#1a1a17] border border-[#2e2e2a] rounded-xl p-6 hover:border-[#00897b]/30 transition-all duration-200"
                >
                  <div className="text-[#00897b] text-lg font-bold mb-1">
                    {item.num}
                  </div>
                  <div className="text-xs font-bold tracking-wide mb-2 text-white/90">
                    {item.title}
                  </div>
                  <p className="text-xs text-[#6b6b60] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Center: phone mockup */}
            <div className="hidden md:flex items-center justify-center">
              <div className="w-32 h-64 bg-[#1a1a17] border-2 border-[#3e3e38] rounded-3xl flex flex-col items-center justify-start pt-4 gap-2 shadow-2xl relative overflow-hidden">
                <div className="w-10 h-1.5 bg-[#3e3e38] rounded-full" />
                <div className="w-20 h-20 rounded-full bg-[#00897b]/10 border border-[#00897b]/30 flex items-center justify-center mt-2">
                  <Briefcase
                    className="h-8 w-8 text-[#00897b]"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="text-[8px] text-[#6b6b60] font-semibold mt-1">
                  PRAWNIK
                </div>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="h-2 w-2 text-[#00897b] fill-current"
                    />
                  ))}
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#00897b] flex items-center justify-center">
                    <CheckCircle
                      className="h-4 w-4 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              {[
                {
                  num: "03.",
                  title: "SKŁADAJ OFERTY I ZDOBYWAJ KLIENTÓW",
                  desc: "Sam decydujesz, które sprawy chcesz obsługiwać.",
                },
                {
                  num: "04.",
                  title: "ZARABIAJ I ZBUDUJ SWOJĄ MARKĘ",
                  desc: "Otrzymuj wynagrodzenie, zdobywaj opinie, zwiększaj swoją widoczność.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-[#1a1a17] border border-[#2e2e2a] rounded-xl p-6 hover:border-[#00897b]/30 transition-all duration-200"
                >
                  <div className="text-[#00897b] text-lg font-bold mb-1">
                    {item.num}
                  </div>
                  <div className="text-xs font-bold tracking-wide mb-2 text-white/90">
                    {item.title}
                  </div>
                  <p className="text-xs text-[#6b6b60] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              className="bg-[#00897b] hover:bg-[#00796b] text-white rounded-lg px-8 py-5 text-sm font-semibold h-auto transition-all duration-200"
            >
              <Link href="/jak-to-dziala">Sprawdź jak to działa</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEKCJA 5: Dlaczego warto? */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Dark dramatic background */}
        <div className="absolute inset-0 bg-[#111110]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,_rgba(255,255,255,0.08)_0%,_transparent_70%)]" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-gradient-to-l from-white/20 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-[10px] uppercase tracking-widest text-[#6b6b60] mb-4 font-medium">
              Prosta Sprawa
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Dlaczego warto?
            </h2>
            <p className="text-sm text-[#8a8a7d] max-w-2xl mx-auto leading-relaxed">
              Dodaj swoją sprawę bez zbędnych formalności, czekaj na ofertę i
              wybierz tę, która najlepiej odpowiada Twoim potrzebom.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: "Nowi klienci bez inwestycji w reklamę",
                desc: "Użytkownicy sami zgłaszają sprawy.",
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: "Elastyczność przy wyborze zleceń",
                desc: "Wybierasz tylko te zlecenia, które Ci odpowiadają.",
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Budowanie wizerunku eksperta",
                desc: "Zbieraj opinie i publikuj artykuły aby zwiększyć swoją rozpoznawalność.",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Proste i bezpieczne rozliczenia",
                desc: "Pieniądze trafiają do Ciebie po akceptacji oferty przez klienta.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-xl bg-[#00897b]/10 border border-[#00897b]/20 flex items-center justify-center text-[#00897b] mb-5 group-hover:bg-[#00897b]/20 transition-all duration-200">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6b6b60] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA banner */}
          <div className="max-w-4xl mx-auto text-center py-10 border-t border-[#2e2e2a]">
            <h3 className="text-xl md:text-2xl font-bold mb-8 text-white">
              Zarejestruj się i zacznij zdobywać nowych klientów już dziś!
            </h3>
            <Button
              asChild
              className="bg-[#00897b] hover:bg-[#00796b] text-white px-10 py-5 text-base rounded-md font-medium h-auto transition-all duration-300"
            >
              <Link href="/rejestracja/kancelaria">Zarejestruj się</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEKCJA 6: CTA Text + Kontakt */}
      <section className="py-20 bg-[#1a1a17]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* CTA text */}
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-[#6b6b60] uppercase tracking-widest mb-4">
                Szukasz klientów? Dołącz do sprawdzonego rozwiązania.
              </p>
              <p className="text-sm text-[#8a8a7d] leading-relaxed max-w-2xl mx-auto">
                Na prostasprawa.pl klienci prywatni i firmy każdego dnia
                zgłaszają sprawy, w których potrzebują profesjonalnej pomocy.
                Jako prawnik, doradca lub księgowy możesz szybko i wygodnie
                pozyskiwać nowe zlecenia bez inwestycji w reklamę.
                <br />
                <br />
                Zarejestruj się, uzupełnij profil i zacznij otrzymywać sprawy
                dopasowane do Twojej specjalizacji. Odpowiadasz tylko na te
                zapytania, które Cię interesują – pełna kontrola, realne
                zlecenia, nowi klienci.
              </p>
            </div>

            {/* Contact + Newsletter grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Masz pytania? */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Masz pytania?
                </h2>
                <p className="text-sm text-[#8a8a7d] mb-6 leading-relaxed">
                  Chętnie pomożemy na każdym etapie współpracy.
                  <br />
                  Jesteśmy dostępni od poniedziałku do piątku od 9:00 – 22:00.
                </p>
                <div className="flex flex-col gap-4">
                  <a
                    href="tel:+48534888555"
                    className="flex items-center gap-3 text-sm text-white hover:text-[#00897b] transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#242420] border border-[#3e3e38] flex items-center justify-center group-hover:border-[#00897b]/50 transition-all duration-200 flex-shrink-0">
                      <Phone className="h-4 w-4 text-[#00897b]" />
                    </div>
                    +48 534 888 555
                  </a>
                  <a
                    href="mailto:kontakt@prostasprawa.pl"
                    className="flex items-center gap-3 text-sm text-white hover:text-[#00897b] transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#242420] border border-[#3e3e38] flex items-center justify-center group-hover:border-[#00897b]/50 transition-all duration-200 flex-shrink-0">
                      <Mail className="h-4 w-4 text-[#00897b]" />
                    </div>
                    kontakt@prostasprawa.pl
                  </a>
                </div>
              </div>

              {/* Newsletter */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Bądź na bieżąco
                </h2>
                <p className="text-sm text-[#8a8a7d] mb-6 leading-relaxed">
                  Otrzymuj informacje o nowych rozwiązaniach dla firm i
                  ekspertów.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Twój e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 bg-[#242420] border border-[#3e3e38] rounded-lg px-4 py-3 text-sm text-white placeholder-[#6b6b60] focus:outline-none focus:border-[#00897b] transition-colors"
                  />
                  <Button
                    type="submit"
                    className="bg-[#00897b] hover:bg-[#00796b] text-white rounded-lg px-5 py-3 text-sm font-semibold h-auto whitespace-nowrap transition-all duration-200"
                  >
                    Zapisz się
                  </Button>
                </form>
                <p className="text-[10px] text-[#6b6b60] mt-3 leading-relaxed">
                  Wyrażam zgodę na otrzymywanie maili marketingowo-handlowych od
                  Grupy Pracu S.A.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
