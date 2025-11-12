"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Rocket,
  Calculator,
  Package,
  TrendingUp,
  Award,
  Briefcase,
  FileText,
  UserPlus,
  CheckCircle,
  Users,
  Target,
  Shield,
  DollarSign,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react"

export default function ForLawyersPage() {
  const [email, setEmail] = useState("")

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Newsletter signup logic here
    console.log("Newsletter signup:", email)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* SEKCJA 1 - Trzy boxy */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Box 1 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Rocket className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl">Oferta na start</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/cennik">
                    Dowiedz się więcej
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Box 2 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calculator className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl">Ile kosztuje ogłoszenie</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/cennik">
                    Dowiedz się więcej
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Box 3 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl">Potrzebujesz ogłoszeń?</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild className="w-full">
                  <Link href="/sklep/punkty">
                    Zaoszczędź kupując pakiety
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SEKCJA 2 - Wypróbuj ProstaSprawa.pl */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Zyskaj klientów
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Wypróbuj ProstaSprawa.pl
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Box 1 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Zwiększ zasięg</CardTitle>
                <CardDescription className="mt-4">
                  Dotrzij do szerszego grona potencjalnych klientów dzięki naszej platformie
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Box 2 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Buduj markę</CardTitle>
                <CardDescription className="mt-4">
                  Kreuj wizerunek eksperta poprzez opinie, artykuły i profesjonalny profil
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Box 3 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Zdobywaj więcej spraw</CardTitle>
                <CardDescription className="mt-4">
                  Otrzymuj dopasowane zlecenia i rozwijaj swoją działalność
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/rejestracja/kancelaria">
                Zarejestruj się
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEKCJA 3 - Jak założyć konto? */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Prosta sprawa!
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Jak założyć konto?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Krok 1 */}
            <Card className="relative">
              <div className="absolute -top-4 left-8">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">1</span>
                </div>
              </div>
              <CardHeader className="pt-12">
                <div className="flex justify-center mb-4">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-xl">Wypełnij formularz rejestracyjny</CardTitle>
                <CardDescription className="mt-4">
                  Podaj dane kontaktowe, wybierz specjalizacje i dodaj podstawowe informacje o swojej działalności.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Krok 2 */}
            <Card className="relative">
              <div className="absolute -top-4 left-8">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
              </div>
              <CardHeader className="pt-12">
                <div className="flex justify-center mb-4">
                  <UserPlus className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-xl">Uzupełnij profil</CardTitle>
                <CardDescription className="mt-4">
                  Dodaj opis, zdjęcia, filmy, doświadczenie, lokalizacje, w których świadczysz usługi. Im bardziej kompletny profil tym większa szansa na pozyskanie klientów.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Krok 3 */}
            <Card className="relative">
              <div className="absolute -top-4 left-8">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">3</span>
                </div>
              </div>
              <CardHeader className="pt-12">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-xl">Zacznij otrzymywać sprawy</CardTitle>
                <CardDescription className="mt-4">
                  Po zatwierdzeniu profilu zobaczysz sprawy dopasowane do Twojej specjalizacji. Składaj oferty i zdobywaj nowych klientów.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* SEKCJA 4 - Jak to działa? */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Prosta sprawa
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Jak to działa?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Dodaj swoją sprawę bez zbędnych formalności, czekaj na ofertę i wybierz tę, która najlepiej odpowiada Twoim potrzebom.
            </p>
            <Button size="lg" asChild>
              <Link href="/jak-to-dziala">
                Sprawdź jak to działa
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEKCJA 5 - Dlaczego warto? (z tłem) */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                Prosta sprawa
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Dlaczego warto?
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Dodaj swoją sprawę bez zbędnych formalności, czekaj na ofertę i wybierz tę, która najlepiej odpowiada Twoim potrzebom.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">
                        Nowi klienci bez inwestycji w reklamę
                      </CardTitle>
                      <CardDescription>
                        Użytkownicy sami zgłaszają sprawy.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Feature 2 */}
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">
                        Elastyczność przy wyborze zleceń
                      </CardTitle>
                      <CardDescription>
                        Wybierasz tylko te zlecenia, które Ci odpowiadają.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Feature 3 */}
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">
                        Budowanie wizerunku eksperta
                      </CardTitle>
                      <CardDescription>
                        Zbieraj opinie i publikuj artykuły aby zwiększyć swoją rozpoznawalność.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Feature 4 */}
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">
                        Proste i bezpieczne rozliczenia
                      </CardTitle>
                      <CardDescription>
                        Pieniądze trafiają do Ciebie po akceptacji oferty przez klienta.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA 6 - CTA i Kontakt */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Main CTA */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-3xl mb-4">
                  Szukasz klientów? Dołącz do sprawdzonego rozwiązania.
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Na prostasprawa.pl klienci prywatni i firmy każdego dnia zgłaszają sprawy, w których potrzebują profesjonalnej pomocy. Jako prawnik,
                  doradca lub księgowy możesz szybko i wygodnie pozyskiwać nowe zlecenia bez inwestycji w reklamę.
                  <br /><br />
                  Zarejestruj się, uzupełnij profil i zacznij otrzymywać sprawy dopasowane do Twojej specjalizacji. Odpowiadasz tylko na te zapytania,
                  które Cię interesują – pełna kontrola, realne zlecenia, nowi klienci.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" asChild>
                  <Link href="/rejestracja/kancelaria">
                    Zarejestruj się teraz
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Masz pytania? */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl mb-4">Masz pytania?</CardTitle>
                  <CardDescription className="text-base">
                    Chętnie pomożemy na każdym etapie współpracy.
                    <br />
                    Jesteśmy dostępni od poniedziałku do piątku od 9:00 - 22:00.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <a href="tel:+48534888555" className="hover:underline">
                      +48 534 888 555
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <a href="mailto:kontakt@prostasprawa.pl" className="hover:underline">
                      kontakt@prostasprawa.pl
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl mb-4">Bądź na bieżąco</CardTitle>
                  <CardDescription className="text-base">
                    Otrzymuj informacje o nowych rozwiązaniach dla firm i ekspertów.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Twój adres e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" className="w-full">
                      Zapisz się
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* O nas */}
            <div>
              <h3 className="font-semibold text-lg mb-4">ProstaSprawa.pl</h3>
              <p className="text-sm text-muted-foreground">
                Platforma łącząca klientów z profesjonalnymi prawnikami, doradcami i księgowymi.
              </p>
            </div>

            {/* Dla klientów */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Dla klientów</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/dodaj-sprawe" className="text-muted-foreground hover:text-foreground">
                    Dodaj sprawę
                  </Link>
                </li>
                <li>
                  <Link href="/szukaj-prawnika" className="text-muted-foreground hover:text-foreground">
                    Szukaj prawnika
                  </Link>
                </li>
                <li>
                  <Link href="/kategorie" className="text-muted-foreground hover:text-foreground">
                    Kategorie
                  </Link>
                </li>
              </ul>
            </div>

            {/* Dla prawników */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Dla prawników</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/rejestracja/kancelaria" className="text-muted-foreground hover:text-foreground">
                    Zarejestruj się
                  </Link>
                </li>
                <li>
                  <Link href="/cennik" className="text-muted-foreground hover:text-foreground">
                    Cennik
                  </Link>
                </li>
                <li>
                  <Link href="/jak-to-dziala" className="text-muted-foreground hover:text-foreground">
                    Jak to działa
                  </Link>
                </li>
              </ul>
            </div>

            {/* Informacje */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Informacje</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/o-nas" className="text-muted-foreground hover:text-foreground">
                    O nas
                  </Link>
                </li>
                <li>
                  <Link href="/kontakt" className="text-muted-foreground hover:text-foreground">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link href="/regulamin" className="text-muted-foreground hover:text-foreground">
                    Regulamin
                  </Link>
                </li>
                <li>
                  <Link href="/polityka-prywatnosci" className="text-muted-foreground hover:text-foreground">
                    Polityka prywatności
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 ProstaSprawa.pl. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
