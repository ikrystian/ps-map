"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Shield,
  Clock,
  CheckCircle2,
  Users,
  MapPin,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import PublicHeader from "@/components/PublicHeader"

export default function WinWithUsPage() {
  return (
    <div className="min-h-screen">

      {/* SEKCJA 1: Jak działa Prosta Sprawa */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Jak działa Prosta Sprawa
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Naszym głównym celem jest zwiększenie dostępności bezpłatnej pomocy i informacji prawnej
              oraz promocja ekspertów z całej Polski. Pragniemy aby za pośrednictwem serwisu
              prostasprawa.pl każdy mógł szybko i bezproblemowo znaleźć odpowiedź na nurtujący go
              problem lub prawnika, który zajmie się kompleksowo jego zagadnieniem
            </p>

            <Card className="mt-12 p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Znajdź eksperta</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Naszym głównym celem jest zwiększenie dostępności bezpłatnej pomocy i
                informacji prawnej oraz promocja ekspertów z całej Polski. Pragniemy aby za
                pośrednictwem serwisu prostasprawa.pl każdy mógł szybko
                i bezproblemowo znaleźć odpowiedź na nurtujący go problem lub prawnika, który
                zajmie się kompleksowo jego zagadnieniem.
              </p>
              <Button asChild size="lg">
                <Link href="/szukaj-prawnika">
                  Dowiedz się więcej
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* SEKCJA 2: Jak działa nasza aplikacja */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Jak działa nasza aplikacja?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="relative">
              <div className="absolute -top-6 left-8">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  01
                </div>
              </div>
              <CardHeader className="pt-10">
                <CardTitle>Dodaj sprawę</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Dzięki naszej platformie masz bezpośredni dostęp do szerokiej sieci
                  doświadczonych prawników i ekspertów z całego kraju.
                </p>
              </CardContent>
            </Card>

            <Card className="relative">
              <div className="absolute -top-6 left-8">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  02
                </div>
              </div>
              <CardHeader className="pt-10">
                <CardTitle>Otrzymaj oferty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nasz portal umożliwia dodawanie sprawy całkowicie za darmo.
                  Wystarczy kilka kliknięć, aby opisać Twoją sytuację.
                </p>
              </CardContent>
            </Card>

            <Card className="relative">
              <div className="absolute -top-6 left-8">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  03
                </div>
              </div>
              <CardHeader className="pt-10">
                <CardTitle>Sprawa rozwiązana</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Prosta Sprawa to miejsce gdzie wszystko załatwisz online,
                  bez konieczności wychodzenia z domu czy tracenia czasu na dojazdy.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/rejestracja">
                Załóż bezpłatne konto
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEKCJA 3: Twoje dane są bezpieczne */}
      <section className="py-24 bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="flex items-center justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Twoje dane są bezpieczne!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Wszystkie dane są chronione zgodnie z obowiązującymi przepisami.
              Korzystasz z ProstaSprawa.pl z pełną prywatnością i spokojem.
            </p>
          </div>
        </div>
      </section>

      {/* SEKCJA 4: Dlaczego eksperci wybierają ProstaSprawa */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Dlaczego eksperci wybierają ProstaSprawa?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Szybkość i wygoda</h3>
              <p className="text-muted-foreground">
                Wszystko online, bez zbędnych formalności i tracenia czasu
              </p>
            </Card>

            <Card className="text-center p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Sprawdzeni Wykonawcy</h3>
              <p className="text-muted-foreground">
                Weryfikowani eksperci z całej Polski gotowi do pomocy
              </p>
            </Card>

            <Card className="text-center p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Rzetelne opinie</h3>
              <p className="text-muted-foreground">
                System opinii pomaga budować zaufanie i reputację
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* SEKCJA 5: Sprawdź dostępność ekspertów */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Sprawdź dostępność ekspertów w Twoim mieście
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Znajdź prawnika w swojej okolicy i umów się na konsultację
            </p>
            <Button asChild size="lg">
              <Link href="/szukaj-prawnika">
                Sprawdź
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEKCJA 6: FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Najczęściej zadawane pytania
            </h2>

            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  Jak działa prostasprawa.pl?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Dodajesz swoją sprawę poprzez prosty formularz. Otrzymujesz oferty od ekspertów
                  – prawników, doradców, księgowych – i sam wybierasz, z kim chcesz współpracować.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  Ile kosztuje dodanie sprawy?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Dodanie sprawy jest całkowicie bezpłatne. Płacisz tylko wtedy, gdy zdecydujesz się
                  skorzystać z oferty jednego z ekspertów.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  Czy mogę wybrać więcej niż jedną ofertę?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Nie. Po zaakceptowaniu jednej oferty, sprawa zostaje zamknięta dla innych ekspertów.
                  Możesz jednak ponownie dodać sprawę, jeśli współpraca nie dojdzie do skutku.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  Czy moje dane są bezpieczne?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Tak. Twoje dane są chronione zgodnie z RODO. Nie udostępniamy ich żadnym podmiotom
                  zewnętrznym. Masz pełną kontrolę nad tym, co i komu udostępniasz.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  Jak przebiega płatność za usługę?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Po zaakceptowaniu oferty, otrzymasz dane do płatności – przelewem lub BLIKIEM.
                  Płatność trafia bezpośrednio do eksperta przed lub po zakończeniu usługi lub
                  zgodnie z warunkami oferty.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  Czy mogę negocjować warunki oferty?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Tak, możesz skontaktować się z ekspertem za pośrednictwem systemu wiadomości
                  przed podjęciem decyzji i omówić szczegóły.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  Czy mogę usunąć swoją sprawę?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Tak. W każdej chwili możesz zamknąć sprawę w swoim panelu użytkownika,
                  niezależnie od liczby otrzymanych ofert.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  Jak mogę ocenić eksperta?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Po zakończonej współpracy otrzymasz możliwość wystawienia opinii, która będzie
                  widoczna na profilu eksperta.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  Czy prostasprawa.pl bierze odpowiedzialność za jakość usług?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Nie ingerujemy w przebieg współpracy. Naszą rolą jest łączenie użytkowników
                  z ekspertami. Rekomendujemy wybór sprawdzonych specjalistów z dobrymi opiniami.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  Nie znalazłem odpowiedniego specjalisty. Co mogę zrobić?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Spróbuj zmienić kategorię lub lokalizację, albo skontaktuj się z nami – chętnie
                  pomożemy. Jesteśmy dostępni od poniedziałku do piątku w godzinach 9:00–22:00.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  )
}
