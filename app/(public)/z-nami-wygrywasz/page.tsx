"use client"

import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Clock,
  CheckCircle2,
  Users,
  MapPin,
  ArrowRight,
  FileText,
  MessageSquare,
  ChevronRight,
  Star,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function WinWithUsPage() {
  return (
    <div className="min-h-screen bg-[#1a1a17] text-white">

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-[#6b6b60] uppercase tracking-widest">
          <span>Prosta Sprawa</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#00897b]">Z nami wygrywasz</span>
        </nav>
      </div>

      {/* SEKCJA 1: Hero – Jak działa Prosta Sprawa */}
      <section className="pt-10 pb-20 md:pb-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Jak działa Prosta Sprawa
            </h1>
            <p className="text-sm md:text-base text-[#8a8a7d] leading-relaxed max-w-2xl mx-auto">
              Naszym głównym celem jest zwiększenie dostępności bezpłatnej pomocy i informacji prawnej
              oraz promocja ekspertów z całej Polski. Pragniemy aby za pośrednictwem serwisu
              prostasprawa.pl każdy mógł szybko i bezproblemowo znaleźć odpowiedź na nurtujący go
              problem lub prawnika, który zajmie się kompleksowo jego zagadnieniem.
            </p>
          </div>

          {/* Expert finder card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#242420] rounded-2xl overflow-hidden grid md:grid-cols-2 gap-0">
              {/* Left: content */}
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Znajdź eksperta</h2>
                <p className="text-sm text-[#8a8a7d] leading-relaxed mb-6">
                  Naszym głównym celem jest zwiększenie dostępności bezpłatnej pomocy i
                  informacji prawnej oraz promocja ekspertów z całej Polski. Pragniemy aby za
                  pośrednictwem serwisu prostasprawa.pl każdy mógł szybko
                  i bezproblemowo znaleźć odpowiedź na nurtujący go problem lub prawnika, który
                  zajmie się kompleksowo jego zagadnieniem.
                </p>
                <div>
                  <Button
                    asChild
                    className="bg-[#00897b] hover:bg-[#00796b] text-white rounded-full px-6 text-sm font-semibold transition-all duration-200"
                  >
                    <Link href="/szukaj-prawnika">
                      Dowiedz się więcej
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              {/* Right: image */}
              <div className="relative min-h-[260px] md:min-h-0 bg-[#2e2e2a] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00897b]/20 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-[#2a2a26] flex items-center justify-center">
                    {/* Placeholder for expert photo */}
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-[#00897b]/20 flex items-center justify-center mx-auto mb-4 border-2 border-[#00897b]/40">
                        <Users className="h-12 w-12 text-[#00897b]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA 2: Jak działa nasza aplikacja? */}
      <section className="py-16 md:py-20 bg-[#1a1a17]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold">
              Jak działa nasza aplikacja?
            </h2>
          </div>

          <div className="max-w-5xl mx-auto relative">
            {/* Dashed connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-px border-t-2 border-dashed border-[#00897b]/30 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {/* Krok 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-2 border-[#2e2e2a] bg-[#242420] flex items-center justify-center text-[#00897b]">
                    <FileText className="h-7 w-7" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold text-[#6b6b60]">01</span>
                </div>
                <h3 className="text-base font-bold mb-3">Dodaj sprawę</h3>
                <p className="text-sm text-[#6b6b60] leading-relaxed">
                  Dzięki naszej platformie masz bezpośredni dostęp do szerokiej sieci
                  doświadczonych prawników i ekspertów z całego kraju. Opisz swoją sprawę
                  w kilku krokach.
                </p>
              </div>

              {/* Krok 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-2 border-[#2e2e2a] bg-[#242420] flex items-center justify-center text-[#00897b]">
                    <MessageSquare className="h-7 w-7" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold text-[#6b6b60]">02</span>
                </div>
                <h3 className="text-base font-bold mb-3">Otrzymaj oferty</h3>
                <p className="text-sm text-[#6b6b60] leading-relaxed">
                  Nasz portal umożliwia dodawanie sprawy całkowicie za darmo. Wystarczy kilka
                  kliknięć, aby opisać Twoją sytuację prawną i otrzymać oferty ekspertów.
                </p>
              </div>

              {/* Krok 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-2 border-[#2e2e2a] bg-[#242420] flex items-center justify-center text-[#00897b]">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold text-[#6b6b60]">03</span>
                </div>
                <h3 className="text-base font-bold mb-3">Sprawa rozwiązana</h3>
                <p className="text-sm text-[#6b6b60] leading-relaxed">
                  Prosta Sprawa to miejsce gdzie wszystko załatwisz online, bez konieczności
                  wychodzenia z domu czy tracenia czasu na dojazdy do kancelarii.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button
                asChild
                className="bg-[#00897b] hover:bg-[#00796b] text-white rounded-full px-8 text-sm font-semibold transition-all duration-200"
              >
                <Link href="/rejestracja">
                  Załóż bezpłatne konto
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA 3: Twoje dane są bezpieczne */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Dark overlay image background */}
        <div className="absolute inset-0 bg-[#111110]" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a17] via-transparent to-transparent" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300897b' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zM40 0h1v40h-1zM0 0v1h40V0zM0 40v1h40v-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Twoje dane<br />są bezpieczne!
              </h2>
              <p className="text-sm text-[#8a8a7d] leading-relaxed mb-8">
                Wszystkie dane są chronione zgodnie z obowiązującymi przepisami RODO.
                Korzystasz z ProstaSprawa.pl z pełną prywatnością i spokojem. Nie
                udostępniamy Twoich danych żadnym podmiotom zewnętrznym.
              </p>
              <Button
                asChild
                className="bg-[#00897b] hover:bg-[#00796b] text-white rounded-full px-6 text-sm font-semibold transition-all duration-200"
              >
                <Link href="/polityka-prywatnosci">
                  Czytaj więcej
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full border border-[#00897b]/20 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full border border-[#00897b]/30 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-[#00897b]/10 border border-[#00897b]/40 flex items-center justify-center">
                      <Shield className="h-12 w-12 text-[#00897b]" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
                {/* Decorative dots */}
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#00897b] animate-pulse" />
                <div className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-[#00897b]/60 animate-pulse" style={{ animationDelay: "0.5s" }} />
                <div className="absolute top-8 left-0 w-1 h-1 rounded-full bg-[#00897b]/40 animate-pulse" style={{ animationDelay: "1s" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA 4: Dlaczego eksperci wybierają ProstaSprawa */}
      <section className="py-16 md:py-20 bg-[#1a1a17]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">
              Dlaczego eksperci wybierają ProstaSprawa?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="bg-[#242420] rounded-2xl p-8 text-center group hover:bg-[#2a2a26] transition-all duration-200 border border-[#2e2e2a] hover:border-[#00897b]/30">
              <div className="flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#1a1a17] border border-[#3e3e38] flex items-center justify-center group-hover:border-[#00897b]/50 transition-all duration-200">
                  <Clock className="h-6 w-6 text-[#00897b]" />
                </div>
              </div>
              <h3 className="text-base font-bold mb-3">
                Szybkość<br />i wygoda
              </h3>
              <div className="w-8 h-px bg-[#00897b]/40 mx-auto mt-4" />
            </div>

            {/* Card 2 */}
            <div className="bg-[#242420] rounded-2xl p-8 text-center group hover:bg-[#2a2a26] transition-all duration-200 border border-[#2e2e2a] hover:border-[#00897b]/30">
              <div className="flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#1a1a17] border border-[#3e3e38] flex items-center justify-center group-hover:border-[#00897b]/50 transition-all duration-200">
                  <CheckCircle2 className="h-6 w-6 text-[#00897b]" />
                </div>
              </div>
              <h3 className="text-base font-bold mb-3">
                Sprawdzeni<br />Wykonawcy
              </h3>
              <div className="w-8 h-px bg-[#00897b]/40 mx-auto mt-4" />
            </div>

            {/* Card 3 */}
            <div className="bg-[#242420] rounded-2xl p-8 text-center group hover:bg-[#2a2a26] transition-all duration-200 border border-[#2e2e2a] hover:border-[#00897b]/30">
              <div className="flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#1a1a17] border border-[#3e3e38] flex items-center justify-center group-hover:border-[#00897b]/50 transition-all duration-200">
                  <Star className="h-6 w-6 text-[#00897b]" />
                </div>
              </div>
              <h3 className="text-base font-bold mb-3">
                Rzetelne<br />opinie
              </h3>
              <div className="w-8 h-px bg-[#00897b]/40 mx-auto mt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA 5: Sprawdź dostępność ekspertów – teal banner */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#00897b] rounded-2xl overflow-hidden relative">
              <div className="grid md:grid-cols-[1fr_auto] gap-0 items-center">
                <div className="p-8 md:p-10">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-6 leading-snug max-w-sm">
                    Sprawdź dostępność ekspertów<br />w Twoim mieście
                  </h2>
                  <Button
                    asChild
                    className="bg-white text-[#00897b] hover:bg-white/90 rounded-full px-6 text-sm font-semibold transition-all duration-200 shadow-md"
                  >
                    <Link href="/szukaj-prawnika">
                      Sprawdź
                    </Link>
                  </Button>
                </div>
                {/* Phone mockup placeholder */}
                <div className="hidden md:flex items-end justify-end pr-8 pb-0 h-full min-h-[200px]">
                  <div className="relative">
                    <div className="w-28 h-52 bg-[#006b62] rounded-3xl border-2 border-white/20 flex items-center justify-center shadow-2xl translate-y-4">
                      <div className="w-20 h-44 bg-[#00796b] rounded-2xl flex flex-col items-center justify-start pt-4 gap-2">
                        <div className="w-10 h-1.5 bg-white/30 rounded-full" />
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mt-2">
                          <MapPin className="h-7 w-7 text-white/70" />
                        </div>
                        <div className="w-12 h-1 bg-white/20 rounded-full mt-2" />
                        <div className="w-10 h-1 bg-white/15 rounded-full" />
                        <div className="w-11 h-1 bg-white/10 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA 6: FAQ */}
      <section className="py-16 md:py-20 bg-[#1a1a17]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-sm font-semibold text-[#6b6b60] uppercase tracking-widest mb-8">
              Najczęściej zadawane pytania
            </h2>

            <Accordion type="single" collapsible className="w-full space-y-2">
              {[
                {
                  q: "Jak działa prostasprawa.pl?",
                  a: "Dodajesz swoją sprawę poprzez prosty formularz. Otrzymujesz oferty od ekspertów – prawników, doradców, księgowych – i sam wybierasz, z kim chcesz współpracować.",
                },
                {
                  q: "Ile kosztuje dodanie sprawy?",
                  a: "Dodanie sprawy jest całkowicie bezpłatne. Płacisz tylko wtedy, gdy zdecydujesz się skorzystać z oferty jednego z ekspertów.",
                },
                {
                  q: "Czy mogę wybrać więcej niż jedną ofertę?",
                  a: "Nie. Po zaakceptowaniu jednej oferty, sprawa zostaje zamknięta dla innych ekspertów. Możesz jednak ponownie dodać sprawę, jeśli współpraca nie dojdzie do skutku.",
                },
                {
                  q: "Czy moje dane są bezpieczne?",
                  a: "Tak. Twoje dane są chronione zgodnie z RODO. Nie udostępniamy ich żadnym podmiotom zewnętrznym. Masz pełną kontrolę nad tym, co i komu udostępniasz.",
                },
                {
                  q: "Jak przebiega płatność za usługę?",
                  a: "Po zaakceptowaniu oferty, otrzymasz dane do płatności – przelewem lub BLIKIEM. Płatność trafia bezpośrednio do eksperta przed lub po zakończeniu usługi lub zgodnie z warunkami oferty.",
                },
                {
                  q: "Czy mogę negocjować warunki oferty?",
                  a: "Tak, możesz skontaktować się z ekspertem za pośrednictwem systemu wiadomości przed podjęciem decyzji i omówić szczegóły.",
                },
                {
                  q: "Czy mogę usunąć swoją sprawę?",
                  a: "Tak. W każdej chwili możesz zamknąć sprawę w swoim panelu użytkownika, niezależnie od liczby otrzymanych ofert.",
                },
                {
                  q: "Jak mogę ocenić eksperta?",
                  a: "Po zakończonej współpracy otrzymasz możliwość wystawienia opinii, która będzie widoczna na profilu eksperta.",
                },
                {
                  q: "Czy prostasprawa.pl bierze odpowiedzialność za jakość usług?",
                  a: "Nie ingerujemy w przebieg współpracy. Naszą rolą jest łączenie użytkowników z ekspertami. Rekomendujemy wybór sprawdzonych specjalistów z dobrymi opiniami.",
                },
                {
                  q: "Nie znalazłem odpowiedniego specjalisty. Co mogę zrobić?",
                  a: "Spróbuj zmienić kategorię lub lokalizację, albo skontaktuj się z nami – chętnie pomożemy. Jesteśmy dostępni od poniedziałku do piątku w godzinach 9:00–22:00.",
                },
              ].map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i + 1}`}
                  className="border border-[#2e2e2a] rounded-xl overflow-hidden bg-[#242420] data-[state=open]:border-[#00897b]/50 data-[state=open]:bg-[#00897b]"
                >
                  <AccordionTrigger className="px-5 py-4 text-sm font-semibold text-left hover:no-underline text-white/90 data-[state=open]:text-white [&>svg]:text-[#00897b] data-[state=open]:[&>svg]:text-white">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 text-sm bg-[#1a1a17] text-[#8a8a7d] leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  )
}
