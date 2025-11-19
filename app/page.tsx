"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
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
  Briefcase,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import PublicHeader from "@/components/PublicHeader"
import { toast } from "sonner"
import PublicFooter from "@/components/PublicFooter"
import { LawFirmCardWrapper } from "@/components/law-firm-card-wrapper"
import type { LawFirm } from "@/types/lawfirms"
import type { Category } from "@/types/categories"

export default function HomePage() {
  const { data: session } = useSession()
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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Nie udało się zapisać do newslettera")
      }

      toast.success("Dziękujemy za zapis do newslettera!")
      setEmail("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
    }
  }

  return (
    <div className="min-h-screen">
      <PublicHeader
        isAuthenticated={!!session}
        userRole={session?.user?.role as "CLIENT" | "LAW_FIRM" | "ADMIN" | null}
        userName={session?.user?.name}
        userImage={session?.user?.image}
      />

      {/* SECTION 1: Hero Section */}
      <section className="relative from-primary/10 via-background to-secondary/10 py-20 md:py-32 hero-image">
        <div className="con1tainer mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
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

      {/* SECTION 4: Categories Grid */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Wybierz kategorię prawną
            </h2>
            <p className="text-xl text-muted-foreground">
              Znajdź eksperta w wybranej dziedzinie prawa
            </p>
          </div>

          {/* Desktop Grid Layout */}
          <div
            className="hidden lg:grid grid-cols-6 grid-rows-3 gap-4 max-w-7xl mx-auto mb-8 min-h-[600px]"
            style={{
              gridTemplateAreas: `
                "first second fourth sixth eighth nineth"
                "first third fourth seventh eighth tenth"
                ". . . . . ."
              `
            }}
          >
            {/* First */}
            {categories[0] && (
              <Link
                href={`/kategorie/${categories[0].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:first]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-xl font-bold text-center">{categories[0].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Second */}
            {categories[1] && (
              <Link
                href={`/kategorie/${categories[1].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:second]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[1].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Third */}
            {categories[2] && (
              <Link
                href={`/kategorie/${categories[2].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:third]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[2].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Fourth */}
            {categories[3] && (
              <Link
                href={`/kategorie/${categories[3].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:fourth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-xl font-bold text-center">{categories[3].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Sixth */}
            {categories[4] && (
              <Link
                href={`/kategorie/${categories[4].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:sixth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[4].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Seventh */}
            {categories[5] && (
              <Link
                href={`/kategorie/${categories[5].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:seventh]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[5].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Eighth */}
            {categories[6] && (
              <Link
                href={`/kategorie/${categories[6].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:eighth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-xl font-bold text-center">{categories[6].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Nineth */}
            {categories[7] && (
              <Link
                href={`/kategorie/${categories[7].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:nineth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[7].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Tenth */}
            {categories[8] && (
              <Link
                href={`/kategorie/${categories[8].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:tenth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[8].nazwa}</h3>
                </div>
              </Link>
            )}
          </div>

          {/* Tablet Grid Layout (3 columns) */}
          <div className="hidden md:grid lg:hidden grid-cols-3 gap-4 mb-8">
            {categories.slice(0, 9).map((category, index) => (
              <Link
                key={category.id}
                href={`/kategorie/${category.slug}`}
                className="relative overflow-hidden rounded-lg group aspect-video"
                style={{
                  backgroundImage: `url(https://images.unsplash.com/photo-${index % 2 === 0 ? '1589829545856-d10d557cf95f' : '1450101499163-c8848c66ca85'}?w=800&q=80)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{category.nazwa}</h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Grid Layout (1 column) */}
          <div className="grid md:hidden grid-cols-1 gap-4 mb-8">
            {categories.slice(0, 9).map((category, index) => (
              <Link
                key={category.id}
                href={`/kategorie/${category.slug}`}
                className="relative overflow-hidden rounded-lg group aspect-video"
                style={{
                  backgroundImage: `url(https://images.unsplash.com/photo-${index % 2 === 0 ? '1589829545856-d10d557cf95f' : '1450101499163-c8848c66ca85'}?w=800&q=80)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-xl font-bold text-center">{category.nazwa}</h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/kategorie">
                Zobacz wszystkie kategorie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 4B: Business Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kategorie dla firm i przedsiębiorców
            </h2>
            <p className="text-xl text-muted-foreground">
              Profesjonalna obsługa prawna dla biznesu
            </p>
          </div>

          {/* Desktop Grid Layout */}
          <div
            className="hidden lg:grid grid-cols-6 grid-rows-3 gap-4 max-w-7xl mx-auto mb-8 min-h-[600px]"
            style={{
              gridTemplateAreas: `
                "first second fourth sixth eighth nineth"
                "first third fourth seventh eighth tenth"
                ". . . . . ."
              `
            }}
          >
            {/* First */}
            {categories[9] && (
              <Link
                href={`/kategorie/${categories[9].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:first]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-xl font-bold text-center">{categories[9].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Second */}
            {categories[10] && (
              <Link
                href={`/kategorie/${categories[10].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:second]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[10].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Third */}
            {categories[11] && (
              <Link
                href={`/kategorie/${categories[11].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:third]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[11].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Fourth */}
            {categories[12] && (
              <Link
                href={`/kategorie/${categories[12].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:fourth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-xl font-bold text-center">{categories[12].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Sixth */}
            {categories[13] && (
              <Link
                href={`/kategorie/${categories[13].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:sixth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[13].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Seventh */}
            {categories[14] && (
              <Link
                href={`/kategorie/${categories[14].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:seventh]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[14].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Eighth */}
            {categories[15] && (
              <Link
                href={`/kategorie/${categories[15].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:eighth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-xl font-bold text-center">{categories[15].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Nineth */}
            {categories[16] && (
              <Link
                href={`/kategorie/${categories[16].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:nineth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[16].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Tenth */}
            {categories[17] && (
              <Link
                href={`/kategorie/${categories[17].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:tenth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[17].nazwa}</h3>
                </div>
              </Link>
            )}
          </div>

          {/* Tablet Grid Layout (3 columns) */}
          <div className="hidden md:grid lg:hidden grid-cols-3 gap-4 mb-8">
            {categories.slice(9, 18).map((category, index) => (
              <Link
                key={category.id}
                href={`/kategorie/${category.slug}`}
                className="relative overflow-hidden rounded-lg group aspect-video"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-${index % 2 === 0 ? '1507679799987-c73779587ccf' : '1553877522-43269d4ea984'}?w=800&q=80)`
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{category.nazwa}</h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Grid Layout (1 column) */}
          <div className="grid md:hidden grid-cols-1 gap-4 mb-8">
            {categories.slice(9, 18).map((category, index) => (
              <Link
                key={category.id}
                href={`/kategorie/${category.slug}`}
                className="relative overflow-hidden rounded-lg group aspect-video"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-${index % 2 === 0 ? '1507679799987-c73779587ccf' : '1553877522-43269d4ea984'}?w=800&q=80)`
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-xl font-bold text-center">{category.nazwa}</h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/kategorie">
                Zobacz wszystkie kategorie biznesowe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
              <Link key={firm.id} href={`/kancelaria/${firm.slug}`}>
                <LawFirmCardWrapper pakietSubskrypcji={firm.pakietSubskrypcji}>
                  <Card className={`hover:shadow-lg transition-shadow ${firm.pakietSubskrypcji === "BIZNES" ? "border-0" : ""}`}>
                    {/* Obrazek na całą szerokość karty */}
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      {firm.logo ? (
                        <img
                          src={firm.logo}
                          alt={firm.nazwa}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                          <span className="text-4xl font-bold text-muted-foreground">
                            {firm.nazwa.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <CardTitle className="text-lg">{firm.nazwa}</CardTitle>
                          {firm.zweryfikowana && (
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                          {firm.pakietSubskrypcji === "BIZNES" && (
                            <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Biznes
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-center text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {firm.miasto}{firm.voivodeship?.nazwa && `, ${firm.voivodeship.nazwa}`}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{firm.avgRating.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">
                            ({firm.reviewCount} opinii)
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {firm.opis && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 text-center">
                          {firm.opis}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        {firm.categories.slice(0, 3).map((cat) => (
                          <Badge key={cat.slug} variant="secondary">
                            {cat.nazwa}
                          </Badge>
                        ))}
                      </div>
                      <Button asChild className="w-full">
                        <span>
                          Zobacz profil
                        </span>
                      </Button>
                    </CardContent>
                  </Card>
                </LawFirmCardWrapper>
              </Link>
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
                     <Link key={firm.id} href={`/kancelaria/${firm.slug}`}>
                       <LawFirmCardWrapper pakietSubskrypcji={firm.pakietSubskrypcji} className="rounded-lg h-full">
                         <Card className={`hover:shadow-lg transition-shadow h-full ${firm.pakietSubskrypcji === "BIZNES" ? "border-0" : ""}`}>
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
                               <div className="flex-1">
                                 <div className="flex items-center gap-2">
                                   <CardTitle className="text-base">{firm.nazwa}</CardTitle>
                                   {firm.pakietSubskrypcji === "BIZNES" && (
                                     <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                       <Sparkles className="w-3 h-3 mr-1" />
                                       Biznes
                                     </Badge>
                                   )}
                                 </div>
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
                               <span>
                                 Zobacz profil
                               </span>
                             </Button>
                           </CardContent>
                         </Card>
                       </LawFirmCardWrapper>
                     </Link>
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
              <Link key={firm.id} href={`/kancelaria/${firm.slug}`}>
                <LawFirmCardWrapper pakietSubskrypcji={firm.pakietSubskrypcji} className="rounded-lg h-full">
                  <Card className={`hover:shadow-lg transition-shadow h-full ${firm.pakietSubskrypcji === "BIZNES" ? "border-0" : ""}`}>
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
                        <div className="flex items-center gap-2 justify-center mb-1">
                          <CardTitle className="text-lg">{firm.nazwa}</CardTitle>
                          {firm.pakietSubskrypcji === "BIZNES" && (
                            <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Biznes
                            </Badge>
                          )}
                        </div>
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
                        <span>
                          Zobacz profil
                        </span>
                      </Button>
                    </CardContent>
                  </Card>
                </LawFirmCardWrapper>
              </Link>
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

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                "Augustów", "Baranowo", "Bartoszyce", "Bełchatów", "Biała Podlaska",
                "Białogard", "Białystok", "Bielawa", "Bielsko-Biała", "Biłgoraj",
                "Braniewo", "Brodnica", "Brzeg", "Brzesko", "Brzeziny",
                "Busko-Zdrój", "Bydgoszcz", "Bytom", "Bytów", "Chełm",
                "Chełmno", "Chojnice", "Chorzów", "Cieszyn", "Ciechanów",
                "Czarnków", "Częstochowa", "Czyżew", "Dąbrowa Górnicza", "Dębica",
                "Dzierżoniów", "Elbląg", "Ełk", "Gdańsk", "Gdynia",
                "Giżycko", "Gliwice", "Głogów", "Gniezno", "Goleniów",
                "Gorlice", "Gorzów Wielkopolski",
                "Gostynin", "Grajewo", "Grodzisk Mazowiecki", "Grudziądz", "Gryfice",
                "Gryfino", "Hajnówka", "Iława", "Inowrocław", "Jarocin",
                "Jarosław", "Jastrzębie-Zdrój", "Jasło", "Jawor", "Jaworzno",
                "Jedlińsk", "Jelenia Góra", "Kalisz", "Kamień Pomorski", "Katowice",
                "Kędzierzyn-Koźle", "Kępno", "Kielce", "Kluczbork", "Kłodzko",
                "Knurów", "Kołobrzeg", "Koło", "Konin", "Końskie",
                "Koszalin", "Kozienice", "Kraków", "Kraśnik", "Krosno",
                "Kutno", "Legnica", "Leszno", "Lidzbark Warmiński", "Limanowa",
                "Lubań", "Lubin", "Lublin", "Lubliniec", "Luboń",
                "Łańcut", "Łask", "Łęczyca", "Łomża", "Łowicz",
                "Łódź", "Łuków", "Malbork", "Marki", "Mielec",
                "Mikołów", "Miłosław", "Mińsk Mazowiecki", "Mława", "Mogilno",
                "Mragowo", "Mysłowice", "Myszków", "Nakło nad Notecią", "Nowa Dęba",
                "Nowa Ruda", "Nowa Sól", "Nowe Miasto Lubawskie", "Nowy Dwór Mazowiecki", "Nowy Sącz",
                "Nowy Targ", "Nysa", "Oborniki", "Olecko", "Oleśnica",
                "Olkusz", "Olsztyn", "Opole", "Opole Lubelskie", "Orneta",
                "Ostrołęka", "Ostrowiec Świętokrzyski", "Ostrów Mazowiecka", "Ostrów Wielkopolski", "Oświęcim",
                "Pabianice", "Pajęczno", "Piaseczno", "Piła", "Pińczów",
                "Piotrków Trybunalski", "Pisz", "Płock", "Płońsk", "Poniatowa",
                "Poznań", "Proszowice", "Pruszcz Gdański", "Pruszków", "Przemyśl",
                "Przeworsk", "Przasnysz", "Puck", "Puławy", "Pułtusk",
                "Raciąż", "Racibórz", "Radom", "Radomsko", "Radzymin",
                "Rawa Mazowiecka", "Reda", "Ropczyce", "Ruda Śląska", "Rumia",
                "Rybnik", "Ryki", "Rzeszów", "Sanok", "Sandomierz",
                "Sejny", "Siedlce", "Siemianowice Śląskie", "Sieradz", "Siemiatycze",
                "Skierniewice", "Słubice", "Słupca", "Słupsk", "Sokołów Podlaski",
                "Sopot", "Sosnowiec", "Stalowa Wola", "Starachowice", "Stargard",
                "Starogard Gdański", "Staszów", "Stawiski", "Śrem", "Środa Wielkopolska",
                "Świdnica", "Świdnik", "Świebodzice", "Świebodzin", "Świecie",
                "Świętochłowice", "Świnoujście", "Szczecin", "Szczecinek", "Szczytno",
                "Szprotawa", "Sztum", "Tarnobrzeg", "Tarnów", "Tarnowskie Góry",
                "Tczew", "Tomaszów Lubelski", "Tomaszów Mazowiecki", "Toruń", "Trzebinia",
                "Turek", "Tychowo", "Tychy", "Ustka", "Wadowice",
                "Wałbrzych", "Wałcz", "Warszawa", "Wąbrzeźno", "Wąchock",
                "Węgorzewo", "Węgrów", "Wieliczka", "Wieluń", "Wieruszów",
                "Włocławek", "Włodawa", "Włoszczowa", "Wodzisław Śląski", "Wołomin",
                "Wołów", "Września", "Wrocław", "Wschowa", "Wysokie Mazowieckie",
                "Zabrze", "Zakopane", "Zambrów", "Zamość", "Zduńska Wola",
                "Zgorzelec", "Zielona Góra", "Ziębice", "Złotoryja", "Złotów",
                "Żary", "Żnin", "Żory", "Żuromin", "Żyrardów"
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
                <PublicFooter />

    </div>

  )
}
