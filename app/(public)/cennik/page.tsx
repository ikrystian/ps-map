import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Zap, TrendingUp, Building2, Rocket, DollarSign, Users, MapPin, Briefcase } from "lucide-react"

export default function PricingPage() {
  const packages = [
    {
      name: "Podstawowy",
      icon: Zap,
      price: "440",
      period: "/rok",
      monthlyPrice: "37",
      description: "Idealne rozwiązanie dla młodych kancelarii rozpoczynających działalność",
      popular: false,
      features: [
        { text: "5 spraw miesięcznie", included: true },
        { text: "3 kategorie spraw", included: true },
        { text: "1 województwo", included: true },
        { text: "Profil kancelarii", included: true },
        { text: "Podstawowe statystyki", included: true },
        { text: "Wsparcie e-mail", included: true },
        { text: "Priorytetowe wyszukiwanie", included: false },
        { text: "Osobisty opiekun", included: false },
        { text: "Blog prawniczy", included: false },
        { text: "Artykuły sponsorowane", included: false },
      ],
      bonuses: [],
    },
    {
      name: "Standard",
      icon: TrendingUp,
      price: "880",
      period: "/rok",
      monthlyPrice: "73",
      description: "Najlepszy wybór dla rozwijających się kancelarii",
      popular: true,
      features: [
        { text: "15 spraw miesięcznie", included: true },
        { text: "5 kategorii spraw", included: true },
        { text: "3 województwa", included: true },
        { text: "Profil kancelarii", included: true },
        { text: "Zaawansowane statystyki", included: true },
        { text: "Wsparcie priorytetowe", included: true },
        { text: "Priorytetowe wyszukiwanie", included: true },
        { text: "2h osobistego opiekuna/miesiąc", included: true },
        { text: "Blog prawniczy", included: true },
        { text: "Artykuły sponsorowane", included: false },
      ],
      bonuses: ["100 punktów gratis"],
    },
    {
      name: "Premium",
      icon: Building2,
      price: "1320",
      period: "/rok",
      monthlyPrice: "110",
      description: "Dla kancelarii stawiających na profesjonalizm i widoczność",
      popular: false,
      features: [
        { text: "30 spraw miesięcznie", included: true },
        { text: "10 kategorii spraw", included: true },
        { text: "5 województw", included: true },
        { text: "Profil kancelarii Premium", included: true },
        { text: "Pełne statystyki i analizy", included: true },
        { text: "Dedykowane wsparcie", included: true },
        { text: "Priorytetowe wyszukiwanie", included: true },
        { text: "5h osobistego opiekuna/miesiąc", included: true },
        { text: "Blog prawniczy", included: true },
        { text: "Artykuły sponsorowane", included: true },
      ],
      bonuses: ["250 punktów gratis", "Wsparcie marketingowe"],
    },
    {
      name: "Biznes",
      icon: Rocket,
      price: "1980",
      period: "/rok",
      monthlyPrice: "165",
      description: "Kompleksowe rozwiązanie dla dużych kancelarii i firm",
      popular: false,
      features: [
        { text: "Nielimitowane sprawy", included: true },
        { text: "Wszystkie kategorie", included: true },
        { text: "Cała Polska (16 województw)", included: true },
        { text: "Profil kancelarii VIP", included: true },
        { text: "Zaawansowane AI analizy", included: true },
        { text: "Dedykowany opiekun 24/7", included: true },
        { text: "Najwyższy priorytet", included: true },
        { text: "10h osobistego opiekuna/miesiąc", included: true },
        { text: "Blog prawniczy PRO", included: true },
        { text: "Artykuły sponsorowane", included: true },
      ],
      bonuses: ["500 punktów gratis", "Dostęp do SkillLawFocus", "Dedykowany account manager"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cennik dla Kancelarii</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Wybierz pakiet dopasowany do potrzeb Twojej kancelarii. Bez ukrytych kosztów, zawsze z VAT.
          </p>
        </div>

        {/* For Clients Info */}
        <Card className="mb-12 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 text-center">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                Dla klientów korzystanie z platformy jest całkowicie bezpłatne!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {packages.map((pkg) => {
            const Icon = pkg.icon
            return (
              <Card
                key={pkg.name}
                className={`relative flex flex-col ${
                  pkg.popular ? "border-primary shadow-lg scale-105" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Najpopularniejszy
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  </div>
                  <CardDescription className="min-h-[60px]">{pkg.description}</CardDescription>
                  <div className="pt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{pkg.price}</span>
                      <span className="text-lg text-muted-foreground">zł</span>
                      <span className="text-sm text-muted-foreground">{pkg.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      ~{pkg.monthlyPrice} zł/miesiąc
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Cena brutto (z VAT 23%)</p>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? "" : "text-muted-foreground line-through"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {pkg.bonuses.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-semibold mb-2 text-primary">Bonusy:</p>
                      <ul className="space-y-1">
                        {pkg.bonuses.map((bonus, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            {bonus}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    asChild
                  >
                    <a href="/rejestracja">Wybierz pakiet</a>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Punkty Promocyjne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Kupuj punkty do promowania swojego profilu i zwiększ widoczność w wyszukiwarkach.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>100 punktów</span>
                  <span className="font-semibold">49 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>250 punktów</span>
                  <span className="font-semibold">99 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>500 punktów</span>
                  <span className="font-semibold">179 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>1000 punktów</span>
                  <span className="font-semibold">299 zł</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Okres Rozliczeniowy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Dostępne są różne okresy subskrypcji:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Roczna</p>
                    <p className="text-sm text-muted-foreground">Najkorzystniejsza (ceny powyżej)</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Półroczna</p>
                    <p className="text-sm text-muted-foreground">+10% do ceny rocznej</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Miesięczna</p>
                    <p className="text-sm text-muted-foreground">+20% do ceny rocznej</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Co zawierają pakiety?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Automatyczne dopasowanie do spraw</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">System wiadomości z klientami</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Zarządzanie ofertami</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Certyfikaty i dokumenty</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">System opinii i ocen</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Faktury VAT</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Najczęściej zadawane pytania</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Czy mogę zmienić pakiet w trakcie trwania subskrypcji?</h3>
              <p className="text-muted-foreground">
                Tak, możesz w każdej chwili przejść na wyższy pakiet. Różnica w cenie zostanie
                proporcjonalnie przeliczona.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Co się stanie z niewykorzystanymi sprawami?</h3>
              <p className="text-muted-foreground">
                Niewykorzystane limity spraw nie przechodzą na kolejny miesiąc. Zalecamy dopasowanie
                pakietu do rzeczywistych potrzeb.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Jak działają punkty promocyjne?</h3>
              <p className="text-muted-foreground">
                Punkty możesz wykorzystać do wyróżnienia profilu w wynikach wyszukiwania, promowania
                artykułów na blogu czy zwiększenia pozycji ogłoszenia.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Czy ceny zawierają VAT?</h3>
              <p className="text-muted-foreground">
                Tak, wszystkie podane ceny są cenami brutto zawierającymi VAT 23%. Po opłaceniu
                otrzymasz automatycznie wygenerowaną fakturę VAT.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Jakie metody płatności są dostępne?</h3>
              <p className="text-muted-foreground">
                Akceptujemy płatności przez: PayU (karty, BLIK, przelewy), Przelewy24, PayPal oraz
                tradycyjne przelewy bankowe.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Nie jesteś pewien, który pakiet wybrać?</h2>
              <p className="text-lg mb-6 opacity-90">
                Skontaktuj się z nami, a pomożemy dobrać najlepsze rozwiązanie dla Twojej kancelarii.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <a href="/kontakt">Skontaktuj się</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <a href="/rejestracja">Rozpocznij za darmo</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
