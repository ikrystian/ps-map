import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Send,
  Shield,
  Star,
  TrendingUp,
  Users
} from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Jak to działa? Przewodnik po Platformie",
  description: "Dowiedz się, jak w prosty i bezpieczny sposób opublikować sprawę prawną lub dołączyć jako kancelaria i zdobywać zlecenia.",
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background-sec">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Jak to działa?</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Prosta Sprawa to najprostsza droga do znalezienia odpowiedniej pomocy prawnej.
            Zobacz, jak szybko możesz połączyć się z najlepszymi prawnikami w Polsce.
          </p>
        </div>

        {/* For Clients Process */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 text-lg px-4 py-2">Dla Klientów</Badge>
            <h2 className="text-3xl font-bold mb-4">W 5 prostych krokach do rozwiązania problemu prawnego</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Bezpłatnie, szybko i bez zobowiązań
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <div className="relative">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                      1
                    </div>
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Opisz swoją sprawę</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Wypełnij prosty formularz - opisz problem, podaj kategorię sprawy i preferowany budżet.
                    Zajmie Ci to maksymalnie 5 minut.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Min. 100 znaków opisu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Możliwość dodania dokumentów</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Określenie budżetu i terminu</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                <ArrowRight className="h-8 w-8 text-primary" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                      2
                    </div>
                    <Send className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Opublikuj sprawę</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Po publikacji Twoja sprawa trafia do kancelarii specjalizujących się w danej dziedzinie.
                    System automatycznie dobiera najlepsze dopasowanie.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Całkowicie bezpłatne</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Automatyczne dopasowanie</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Powiadomienia push i e-mail</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                <ArrowRight className="h-8 w-8 text-primary" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                      3
                    </div>
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Otrzymaj oferty</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Kancelarie zainteresowane Twoją sprawą złożą oferty. Zazwyczaj pierwsze propozycje
                    otrzymasz w ciągu kilku godzin.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Wiele ofert do porównania</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Szczegółowe informacje o cenie</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Profile i opinie kancelarii</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Steps 4-5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Step 4 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                    4
                  </div>
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Porównaj i wybierz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Sprawdź profile kancelarii, przeczytaj opinie, porównaj ceny i warunki.
                  Możesz zadawać pytania i negocjować warunki.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Bezpieczna komunikacja w systemie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Możliwość negocjacji</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Pełna przejrzystość kosztów</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 5 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                    5
                  </div>
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Zaakceptuj i współpracuj</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Akceptuj wybraną ofertę i rozpocznij współpracę. Po zakończeniu sprawy możesz
                  wystawić opinię o kancelarii.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Bezpośredni kontakt z prawnikiem</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Rozliczenia poza platformą</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>System opinii po zakończeniu</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* For Law Firms Process */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 text-lg px-4 py-2 bg-amber-500">Dla Kancelarii</Badge>
            <h2 className="text-3xl font-bold mb-4">Zdobywaj klientów i rozwijaj swoją praktykę</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Profesjonalne narzędzie dla prawników i kancelarii
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500 text-white font-bold text-xl">
                    1
                  </div>
                </div>
                <CardTitle>Zarejestruj się i wybierz pakiet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Stwórz konto, wypełnij profil kancelarii i wybierz odpowiedni pakiet subskrypcyjny
                  dopasowany do Twoich potrzeb.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500 text-white font-bold text-xl">
                    2
                  </div>
                </div>
                <CardTitle>Przeglądaj dopasowane sprawy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Otrzymuj powiadomienia o sprawach z Twojej specjalizacji. System automatycznie
                  dopasowuje sprawy do Twojego profilu.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500 text-white font-bold text-xl">
                    3
                  </div>
                </div>
                <CardTitle>Składaj oferty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Proponuj swoje usługi klientom. Określ cenę, termin realizacji i zakres pomocy prawnej.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500 text-white font-bold text-xl">
                    4
                  </div>
                </div>
                <CardTitle>Zdobywaj klientów</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gdy klient zaakceptuje Twoją ofertę, otrzymujesz pełny dostęp do kontaktu i możesz
                  rozpocząć współpracę.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Dlaczego warto?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Oszczędność czasu</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Zamiast dzwonić do dziesiątek kancelarii, otrzymujesz oferty w jednym miejscu.
                  Pierwsze propozycje już po kilku godzinach.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Bezpieczeństwo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Wszystkie kancelarie są weryfikowane. Sprawdzamy licencje zawodowe i uprawnienia.
                  Twoje dane są bezpieczne dzięki szyfrowaniu SSL.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Najlepsza cena</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Porównujesz wiele ofert i wybierasz najbardziej korzystną. Możliwość negocjacji
                  warunków współpracy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Opinie klientów</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sprawdź opinie innych klientów przed podjęciem decyzji. System ocen pomaga
                  wybrać najlepszych prawników.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Szeroki wybór</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ponad 1000 kancelarii z całej Polski. Wszystkie specjalizacje prawne - od prawa
                  rodzinnego po korporacyjne.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Łatwa komunikacja</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Wbudowany system wiadomości. Cała komunikacja w jednym miejscu, historia rozmów
                  zawsze dostępna.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              Często zadawane pytania
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Czy muszę płacić za korzystanie z platformy jako klient?</h3>
              <p className="text-muted-foreground">
                Nie, dla klientów korzystanie z Prosta Sprawa jest całkowicie bezpłatne.
                Płacisz tylko bezpośrednio kancelarii za świadczone usługi prawne.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Jak długo czeka się na pierwsze oferty?</h3>
              <p className="text-muted-foreground">
                Zazwyczaj pierwsze oferty pojawiają się w ciągu kilku godzin od publikacji sprawy.
                W pilnych przypadkach możesz oznaczyć sprawę jako "tryb pilny".
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Czy mogę negocjować cenę z kancelarią?</h3>
              <p className="text-muted-foreground">
                Tak, platforma umożliwia komunikację z kancelariami i negocjowanie warunków współpracy,
                w tym ceny i terminów realizacji.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Czy moje dane są bezpieczne?</h3>
              <p className="text-muted-foreground">
                Tak, stosujemy najwyższe standardy bezpieczeństwa zgodne z RODO. Wszystkie dane są
                szyfrowane, a dostęp do nich mają tylko wybrane przez Ciebie kancelarie.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Co jeśli nie będę zadowolony z usług kancelarii?</h3>
              <p className="text-muted-foreground">
                Możesz zgłosić problem poprzez system reklamacji lub bezpośrednio do organu
                samorządu zawodowego (okręgowa rada adwokacka/radców prawnych). Platforma pośredniczy
                w kontakcie, ale umowa jest zawierana bezpośrednio z kancelarią.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Gotowy, żeby rozpocząć?</h2>
              <p className="text-lg mb-6 opacity-90">
                Dołącz do tysięcy zadowolonych użytkowników i znajdź rozwiązanie swojego problemu prawnego już dziś!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <a href="/dodaj-sprawe">Dodaj sprawę bezpłatnie</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <a href="/rejestracja">Zarejestruj kancelarię</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
