import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, Award, TrendingUp, Shield, Heart, Zap, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">O Prosta Sprawa</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Łączymy osoby potrzebujące pomocy prawnej z najlepszymi kancelariami w Polsce
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Nasza Misja</h2>
              <p className="text-lg leading-relaxed max-w-3xl mx-auto">
                Demokratyzujemy dostęp do usług prawnych, umożliwiając każdemu znalezienie odpowiedniej
                pomocy prawnej w przystępnej cenie. Wspieramy rozwój kancelarii prawnych poprzez
                nowoczesne narzędzia marketingowe i dostęp do klientów z całej Polski.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                <p className="text-muted-foreground">Aktywnych Kancelarii</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">5000+</div>
                <p className="text-muted-foreground">Rozwiązanych Spraw</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <p className="text-muted-foreground">Zadowolonych Klientów</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Dostępność Platformy</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Our Story */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Nasza Historia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-relaxed">
              Prosta Sprawa powstała z frustracji związanej z tradycyjnym procesem szukania pomocy prawnej.
              Założyciele platformy, po własnych doświadczeniach z trudnościami w znalezieniu odpowiedniej
              kancelarii, postanowili stworzyć rozwiązanie, które uprości ten proces.
            </p>
            <p className="leading-relaxed">
              W 2023 roku uruchomiliśmy beta wersję platformy z 50 kancelariami i pierwszymi setkami klientów.
              Szybko okazało się, że nasz model spotkał się z ogromnym zainteresowaniem zarówno klientów,
              jak i prawników.
            </p>
            <p className="leading-relaxed">
              Dziś Prosta Sprawa to największa polska platforma łącząca klientów z kancelariami prawnymi.
              Obsługujemy wszystkie 16 województw, oferując dostęp do szerokiego spektrum specjalizacji
              prawnych - od prawa rodzinnego, przez prawo pracy, aż po złożone sprawy korporacyjne.
            </p>
          </CardContent>
        </Card>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Nasze Wartości</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  Wszystkie kancelarie są weryfikowane. Twoje dane są chronione najwyższymi standardami
                  bezpieczeństwa zgodnie z RODO.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Transparentność</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Jasne ceny, szczegółowe profile kancelarii, prawdziwe opinie klientów.
                  Żadnych ukrytych kosztów.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Szybkość</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pierwsze oferty już po kilku godzinach. Uproszczony proces pozwala zaoszczędzić
                  czas i energię.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Jakość</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Współpracujemy tylko z wykwalifikowanymi prawnikami z aktualnym prawem wykonywania
                  zawodu.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Dopasowanie</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Zaawansowany system dopasowuje Twoją sprawę do kancelarii z odpowiednią
                  specjalizacją i doświadczeniem.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Rozwój</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Stale rozwijamy platformę, dodajemy nowe funkcje i usprawnienia na podstawie
                  opinii użytkowników.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How We Help */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Dla Klientów</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Bezpłatne publikowanie spraw prawnych</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Otrzymywanie ofert od specjalistów w danej dziedzinie</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Porównywanie cen i warunków współpracy</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Dostęp do opinii i ocen kancelarii</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Bezpieczna komunikacja z prawnikami</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Oszczędność czasu i pieniędzy</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Dla Kancelarii</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Dostęp do tysiączy potencjalnych klientów</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Sprawny system zarządzania ofertami</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Narzędzia do budowania marki i pozycjonowania</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Statystyki i analizy efektywności</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Blog prawniczy do publikacji artykułów</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Wsparcie marketingowe i techniczne</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Technology */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Nowoczesna Technologia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-relaxed">
              Nasza platforma została zbudowana w oparciu o najnowsze technologie webowe, zapewniając
              szybkość, bezpieczeństwo i łatwość użytkowania. Wykorzystujemy:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Szyfrowanie SSL/TLS</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Bezpieczne przechowywanie danych</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Szybkie wyszukiwanie i filtrowanie</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Responsywny design (mobile-first)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Automatyczne backupy</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Integracje z systemami płatności</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Nasz Zespół</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-relaxed">
              Za sukcesem Prosta Sprawa stoi zespół pasjonatów łączących doświadczenie prawnicze,
              technologiczne i biznesowe. Wspólnie pracujemy nad tym, by platforma była coraz lepsza
              i lepiej odpowiadała na potrzeby naszych użytkowników.
            </p>
            <p className="leading-relaxed">
              W naszym zespole są: prawnicy, developerzy, specjaliści od UX/UI, marketerzy oraz
              zespół obsługi klienta, który jest dostępny od poniedziałku do piątku w godzinach 9:00-17:00.
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Dołącz do Tysięcy Zadowolonych Użytkowników</h2>
              <p className="text-lg mb-6 opacity-90">
                Bez względu na to, czy szukasz pomocy prawnej, czy chcesz rozwijać swoją kancelarię -
                jesteśmy tu dla Ciebie.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <a href="/dodaj-sprawe">Dodaj sprawę</a>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <a href="/kontakt">Skontaktuj się z nami</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
