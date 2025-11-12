"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  MapPin,
  Star,
  CheckCircle2,
  Shield,
  Clock,
  Scale,
  Lock,
  Users,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Building2,
  UserCheck,
  Home,
  Briefcase
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import PublicHeader from "@/components/PublicHeader"

interface LawFirm {
  id: string
  nazwa: string
  nazwaFirmy: string
  logo?: string
  opis?: string
  miasto: string
  voivodeship: {
    nazwa: string
  }
  zweryfikowana: boolean
  categories: Array<{
    nazwa: string
    slug: string
  }>
  avgRating: number
  reviewCount: number
}

interface Category {
  id: string
  nazwa: string
  slug: string
  opis?: string
  aktywna: boolean
}

export default function HomePage() {
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([])
  const [newLawFirms, setNewLawFirms] = useState<LawFirm[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured law firms
        const firmsResponse = await fetch("/api/law-firms?limit=6&verifiedOnly=true")
        if (firmsResponse.ok) {
          const firmsData = await firmsResponse.json()
          setLawFirms(firmsData.lawFirms)
        }

        // Fetch new law firms
        const newFirmsResponse = await fetch("/api/law-firms?limit=8")
        if (newFirmsResponse.ok) {
          const newFirmsData = await newFirmsResponse.json()
          setNewLawFirms(newFirmsData.lawFirms)
        }

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories")
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.filter((cat: Category) => cat.aktywna))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper to get private categories
  const privateCategories = categories.filter(cat =>
    !cat.nazwa.toLowerCase().includes('firmow') &&
    !cat.nazwa.toLowerCase().includes('biznes')
  ).slice(0, 6)

  // Helper to get business categories
  const businessCategories = categories.filter(cat =>
    cat.nazwa.toLowerCase().includes('firmow') ||
    cat.nazwa.toLowerCase().includes('biznes') ||
    cat.nazwa.toLowerCase().includes('gospodarc')
  ).slice(0, 6)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter subscription
    console.log("Newsletter subscription:", email)
    setEmail("")
  }

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* SECTION 1: Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Prosta Sprawa
            </h1>
            <p className="text-3xl md:text-5xl font-semibold mb-4">
              Tu rozwiązujemy Twoje problemy prawne
            </p>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Opisz i dodaj swoją sprawę. Znajdź prawnika
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/dodaj-sprawe">
                  <Home className="mr-2 h-5 w-5" />
                  Sprawy prywatne
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link href="/dodaj-sprawe">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Sprawy firmowe
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Benefits Icons */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dostęp do doświadczonych prawników</h3>
              <p className="text-muted-foreground">
                Szeroka sieć zweryfikowanych ekspertów z całego kraju
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Szybki proces zgłoszenia sprawy</h3>
              <p className="text-muted-foreground">
                Opisz swoją sprawę w kilka minut i otrzymaj oferty
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Porównywanie ofert</h3>
              <p className="text-muted-foreground">
                Otrzymaj wiele ofert i wybierz najlepszą dla siebie
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bezpieczeństwo i poufność</h3>
              <p className="text-muted-foreground">
                Twoje dane są chronione zgodnie z najwyższymi standardami
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Elastyczność w wyborze prawnika</h3>
              <p className="text-muted-foreground">
                Wybierz prawnika, który najlepiej odpowiada Twoim potrzebom
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wygoda i oszczędność czasu</h3>
              <p className="text-muted-foreground">
                Wszystko online, bez wychodzenia z domu
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: How to Get Help - Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powiedz nam jakiej pomocy szukasz
            </h2>
            <p className="text-xl text-muted-foreground">
              Dodaj swoją sprawę bez zbędnych formalności, czekaj na ofertę i wybierz tę,
              która najlepiej odpowiada Twoim potrzebom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="relative">
              <div className="absolute -top-6 left-8">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  01
                </div>
              </div>
              <CardHeader className="pt-10">
                <CardTitle>Kompleksowa obsługa ekspertów</CardTitle>
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
                <CardTitle>Proces dodawania Twojej sprawy</CardTitle>
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
                <CardTitle>Załatwianie spraw bez wychodzenia z domu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Prosta Sprawa to miejsce gdzie wszystko załatwisz online,
                  bez konieczności wychodzenia z domu czy tracenia czasu na dojazdy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 4: Categories Grids */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          {/* Private Categories */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Kategorie spraw prywatnych</h2>
              <Button asChild variant="outline">
                <Link href="/kategorie">
                  Zobacz wszystkie
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {privateCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={`/kategorie/${category.slug}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Scale className="h-5 w-5 mr-2 text-primary" />
                        {category.nazwa}
                      </CardTitle>
                      {category.opis && (
                        <CardDescription>{category.opis}</CardDescription>
                      )}
                    </CardHeader>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* Business Categories */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Kategorie spraw firmowych</h2>
              <Button asChild variant="outline">
                <Link href="/kategorie">
                  Zobacz wszystkie
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={`/kategorie/${category.slug}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-primary" />
                        {category.nazwa}
                      </CardTitle>
                      {category.opis && (
                        <CardDescription>{category.opis}</CardDescription>
                      )}
                    </CardHeader>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Recommended Lawyers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Polecani prawnicy i adwokaci
            </h2>
            <p className="text-xl text-muted-foreground">
              Najwyżej oceniani eksperci gotowi pomóc w Twojej sprawie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {lawFirms.slice(0, 3).map((firm) => (
              <Card key={firm.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      {firm.logo && (
                        <AvatarImage src={firm.logo} alt={firm.nazwa} />
                      )}
                      <AvatarFallback className="text-lg">
                        {firm.nazwa.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{firm.nazwa}</CardTitle>
                        {firm.zweryfikowana && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {firm.miasto}, {firm.voivodeship.nazwa}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{firm.avgRating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({firm.reviewCount} opinii)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {firm.opis && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {firm.opis}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {firm.categories.slice(0, 3).map((cat) => (
                      <Badge key={cat.slug} variant="secondary">
                        {cat.nazwa}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/kancelaria/${firm.id}`}>
                      Zobacz profil
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Most Consulted Categories */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Najczęściej konsultowane kategorie
            </h2>
            <p className="text-xl text-muted-foreground">
              Sprawdź ekspertów w najpopularniejszych kategoriach prawnych
            </p>
          </div>

          <div className="space-y-8 max-w-6xl mx-auto">
            {categories.slice(0, 3).map((category) => (
              <div key={category.id}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold">{category.nazwa}</h3>
                  <Button asChild variant="ghost">
                    <Link href={`/kategorie/${category.slug}`}>
                      Zobacz więcej
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {lawFirms.slice(0, 3).map((firm) => (
                    <Card key={firm.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {firm.logo && (
                              <AvatarImage src={firm.logo} alt={firm.nazwa} />
                            )}
                            <AvatarFallback>
                              {firm.nazwa.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{firm.nazwa}</CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {firm.miasto}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{firm.avgRating.toFixed(1)}</span>
                        </div>
                        <Button asChild size="sm" className="w-full">
                          <Link href={`/kancelaria/${firm.id}`}>
                            Zobacz profil
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Expert CTA with Background */}
      <section className="py-24 bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Daj się poznać jako ekspert prawa
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Zyskaj dostęp do narzędzi które pomogą Ci skuteczniej docierać do osób
              poszukujących pomocy prawnej. Stwórz profil i zdobądź nowych klientów!
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href="/rejestracja/kancelaria">
                <UserCheck className="mr-2 h-5 w-5" />
                Dołącz jako ekspert
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 8: New Experts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nowi eksperci już dostępni
            </h2>
            <p className="text-xl text-muted-foreground">
              Poznaj najnowszych prawników na naszej platformie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newLawFirms.map((firm) => (
              <Card key={firm.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 mb-3">
                      {firm.logo && (
                        <AvatarImage src={firm.logo} alt={firm.nazwa} />
                      )}
                      <AvatarFallback className="text-xl">
                        {firm.nazwa.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg mb-1">{firm.nazwa}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {firm.miasto}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">
                        {firm.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/kancelaria/${firm.id}`}>
                      Zobacz profil
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: How It Works */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Jak to działa?
            </h2>
            <p className="text-xl text-muted-foreground">
              Prosta Sprawa łączy klientów z ekspertami prawnymi
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* For Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Home className="h-6 w-6 mr-2 text-primary" />
                  Dla użytkowników
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      1
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Opisz swoją sprawę</h4>
                    <p className="text-sm text-muted-foreground">
                      Wypełnij prosty formularz i opisz swoją sytuację prawną.
                      To zajmuje tylko kilka minut.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      2
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Otrzymaj oferty</h4>
                    <p className="text-sm text-muted-foreground">
                      Prawnicy zainteresowani Twoją sprawą przygotują dla Ciebie oferty.
                      Porównaj je i wybierz najlepszą.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      3
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Współpracuj z ekspertem</h4>
                    <p className="text-sm text-muted-foreground">
                      Nawiąż kontakt z wybranym prawnikiem i rozwiąż swoją sprawę
                      z pomocą profesjonalisty.
                    </p>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href="/dodaj-sprawe">
                    Dodaj sprawę
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* For Experts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Building2 className="h-6 w-6 mr-2 text-secondary" />
                  Dla ekspertów
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                      1
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Stwórz profil</h4>
                    <p className="text-sm text-muted-foreground">
                      Zarejestruj swoją kancelarię i stwórz profesjonalny profil.
                      Pokaż swoje doświadczenie i specjalizacje.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                      2
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Przeglądaj sprawy</h4>
                    <p className="text-sm text-muted-foreground">
                      Otrzymuj powiadomienia o nowych sprawach w Twoich kategoriach.
                      Wybieraj te, które Cię interesują.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                      3
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Zdobywaj klientów</h4>
                    <p className="text-sm text-muted-foreground">
                      Składaj oferty i zdobywaj nowych klientów.
                      Rozwijaj swoją praktykę i buduj reputację.
                    </p>
                  </div>
                </div>

                <Button asChild variant="secondary" className="w-full">
                  <Link href="/dla-prawnika">
                    Dowiedz się więcej
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 10: Latest Articles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ostatnie artykuły
            </h2>
            <Button asChild variant="outline">
              <Link href="/blog">
                Zobacz wszystkie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted" />
                <CardHeader>
                  <Badge className="w-fit mb-2">Poradnik</Badge>
                  <CardTitle className="line-clamp-2">
                    Artykuł przykładowy {i}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/blog">
                      Czytaj więcej
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: Cities List */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Znajdź usługi w swoim mieście
            </h2>
            <p className="text-xl text-muted-foreground">
              Eksperci prawni dostępni w całej Polsce
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Warszawa", "Kraków", "Wrocław", "Poznań",
                "Gdańsk", "Szczecin", "Łódź", "Katowice",
                "Lublin", "Białystok", "Gdynia", "Rzeszów"
              ].map((city) => (
                <Button
                  key={city}
                  asChild
                  variant="outline"
                  className="justify-start"
                >
                  <Link href={`/szukaj-prawnika?miasto=${city}`}>
                    <MapPin className="h-4 w-4 mr-2" />
                    {city}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: Newsletter */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Zapisz się do newslettera
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Otrzymuj porady prawne, aktualności i informacje o nowych ekspertach
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Twój adres email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" size="lg">
                Zapisz się
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 13: Footer - Basic Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Prosta Sprawa</h3>
              <p className="text-sm text-muted-foreground">
                Platforma łącząca klientów z ekspertami prawnymi w całej Polsce
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Dla klientów</h4>
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
                <li>
                  <Link href="/jak-to-dziala" className="text-muted-foreground hover:text-foreground">
                    Jak to działa
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Dla prawników</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/dla-prawnika" className="text-muted-foreground hover:text-foreground">
                    Dla prawnika
                  </Link>
                </li>
                <li>
                  <Link href="/cennik" className="text-muted-foreground hover:text-foreground">
                    Cennik
                  </Link>
                </li>
                <li>
                  <Link href="/rejestracja/kancelaria" className="text-muted-foreground hover:text-foreground">
                    Rejestracja kancelarii
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">O nas</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/o-nas" className="text-muted-foreground hover:text-foreground">
                    O nas
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/kontakt" className="text-muted-foreground hover:text-foreground">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link href="/polityka-prywatnosci" className="text-muted-foreground hover:text-foreground">
                    Polityka prywatności
                  </Link>
                </li>
                <li>
                  <Link href="/regulamin" className="text-muted-foreground hover:text-foreground">
                    Regulamin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Prosta Sprawa. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
