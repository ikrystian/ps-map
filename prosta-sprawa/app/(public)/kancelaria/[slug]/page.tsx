"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Award,
  Clock,
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  CheckCircle2,
  Heart,
  Share2,
  MessageSquare,
  Briefcase,
  GraduationCap,
} from "lucide-react"

interface LawFirm {
  id: string
  nazwa: string
  nazwaFirmy: string
  nip: string
  typ: string
  opis?: string
  logo?: string
  zdjecieGlowne?: string
  galeriaZdjec?: string[]
  filmYouTube?: string
  okladkaFilmu?: string
  kolejnoscMultimedia?: string
  imieKontakt: string
  nazwiskoKontakt: string
  stanowisko?: string
  numerTelefonu: string
  numerTelefonu2?: string
  emailKontakt: string
  adres: string
  kodPocztowy: string
  miasto: string
  stronaWww?: string
  linkLinkedIn?: string
  linkFacebook?: string
  linkInstagram?: string
  linkTwitter?: string
  statusGodzinyOtwarcia: boolean
  godzinyOtwarcia?: Record<string, string>
  edukacja?: Array<{
    uczelnia: string
    wydzial: string
    rokOd: number
    rokDo: number
  }>
  oirpMiasto?: string
  oirpWpis?: string
  oirpStatus: boolean
  oraMiasto?: string
  oraWpis?: string
  oraStatus: boolean
  unikatowyOpisUslugi?: string
  slowaKluczowe?: string[]
  callaPolska: boolean
  onlineOnly: boolean
  typOferty: string
  zweryfikowana: boolean
  wyswietleniaProfilu: number
  zlozoneOferty: number
  wygraneOferty: number
  konwersja: number
  avgRating: number
  reviewCount: number
  voivodeship: {
    nazwa: string
  }
  voivodeships: Array<{
    voivodeship: {
      nazwa: string
    }
  }>
  categories: Array<{
    category: {
      nazwa: string
      slug: string
    }
  }>
  services: Array<{
    id: string
    nazwaUslugi: string
    opisUslugi: string
    cenaOd?: number
    cenaDo?: number
    jednostka: string
  }>
  certificates: Array<{
    id: string
    nazwaCertyfikatu: string
    wydawca: string
    dataUzyskania: string
    dataWaznosci?: string
    numerCertyfikatu?: string
    skanCertyfikatu: string
  }>
  blogPosts: Array<{
    id: string
    tytul: string
    slug: string
    tresc: string
    obrazekWyrozniajacy?: string
    dataPublikacji: string
  }>
  reviews: Array<{
    id: string
    ocenaOgolna: number
    profesjonalizm?: number
    komunikacja?: number
    terminowosc?: number
    stosunekJakosci?: number
    tytulOpinii: string
    trescOpinii: string
    polecam: boolean
    anonimowa: boolean
    odpowiedz?: string
    dataOdpowiedzi?: string
    createdAt: string
    client: {
      imie: string
      nazwisko: string
    }
  }>
}

const lawFirmTypeLabels: Record<string, string> = {
  OSOBA_FIZYCZNA: "Osoba fizyczna",
  SPOLKA_CYWILNA: "Spółka cywilna",
  SPOLKA_PARTNERSKA: "Spółka partnerska",
  SPOLKA_KOMANDYTOWA: "Spółka komandytowa",
  SPOLKA_JAWNA: "Spółka jawna",
  SPOLKA_ZOO: "Spółka z o.o.",
  INNY: "Inny",
}

const serviceUnitLabels: Record<string, string> = {
  ZA_USLUGE: "za usługę",
  ZA_GODZINE: "za godzinę",
  RYCZALT: "ryczałt",
  DO_UZGODNIENIA: "do uzgodnienia",
}

export default function LawFirmProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const fetchLawFirm = async () => {
      try {
        // API endpoint obsługuje zarówno ID jak i slug/NIP
        const response = await fetch(`/api/law-firms/${params.slug}`)

        if (!response.ok) {
          throw new Error("Nie udało się pobrać danych kancelarii")
        }

        const data = await response.json()
        setLawFirm(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.slug) {
      fetchLawFirm()
    }
  }, [params.slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ładowanie profilu kancelarii...</p>
        </div>
      </div>
    )
  }

  if (error || !lawFirm) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Błąd</CardTitle>
            <CardDescription>{error || "Nie znaleziono kancelarii"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} variant="outline">
              Powrót do strony głównej
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Image */}
      {lawFirm.zdjecieGlowne && (
        <div className="relative h-64 md:h-96 w-full">
          <Image
            src={lawFirm.zdjecieGlowne}
            alt={lawFirm.nazwa}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            {lawFirm.logo && (
              <div className="relative h-32 w-32 rounded-lg overflow-hidden border-2 border-border bg-card flex-shrink-0">
                <Image
                  src={lawFirm.logo}
                  alt={lawFirm.nazwa}
                  fill
                  className="object-contain p-2"
                />
              </div>
            )}

            {/* Header Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold">{lawFirm.nazwa}</h1>
                    {lawFirm.zweryfikowana && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Zweryfikowana
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground mb-3">{lawFirm.nazwaFirmy}</p>

                  {/* Rating */}
                  {lawFirm.reviewCount > 0 && (
                    <div className="flex items-center gap-3 mb-3">
                      {renderStars(Math.round(lawFirm.avgRating))}
                      <span className="font-semibold">{lawFirm.avgRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({lawFirm.reviewCount} {lawFirm.reviewCount === 1 ? "opinia" : "opinii"})
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{lawFirm.miasto}, {lawFirm.voivodeship.nazwa}</span>
                  </div>

                  {/* Type */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{lawFirmTypeLabels[lawFirm.typ] || lawFirm.typ}</span>
                  </div>

                  {/* Słowa kluczowe */}
                  {lawFirm.slowaKluczowe && lawFirm.slowaKluczowe.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {lawFirm.slowaKluczowe.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Kontakt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">O nas</TabsTrigger>
                <TabsTrigger value="services">Usługi</TabsTrigger>
                <TabsTrigger value="reviews">Opinie</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                {/* Description */}
                {lawFirm.opis && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Opis kancelarii</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{lawFirm.opis}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Unique Service Description */}
                {lawFirm.unikatowyOpisUslugi && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Zakres usług</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{lawFirm.unikatowyOpisUslugi}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Specializations */}
                {lawFirm.categories.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Specjalizacje</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {lawFirm.categories.map((cat) => (
                          <Badge key={cat.category.slug} variant="secondary">
                            {cat.category.nazwa}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Education */}
                {lawFirm.edukacja && lawFirm.edukacja.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Wykształcenie
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {lawFirm.edukacja.map((edu, index) => (
                          <div key={index} className="border-l-2 border-primary pl-4">
                            <p className="font-semibold">{edu.uczelnia}</p>
                            <p className="text-muted-foreground">{edu.wydzial}</p>
                            <p className="text-sm text-muted-foreground">
                              {edu.rokOd} - {edu.rokDo}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Certificates */}
                {lawFirm.certificates.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Certyfikaty
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {lawFirm.certificates.map((cert) => (
                          <div key={cert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                            <Award className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <p className="font-semibold">{cert.nazwaCertyfikatu}</p>
                              <p className="text-sm text-muted-foreground">
                                Wydawca: {cert.wydawca}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Data uzyskania: {formatDate(cert.dataUzyskania)}
                              </p>
                              {cert.numerCertyfikatu && (
                                <p className="text-sm text-muted-foreground">
                                  Nr: {cert.numerCertyfikatu}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Gallery */}
                {lawFirm.galeriaZdjec && lawFirm.galeriaZdjec.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Galeria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {lawFirm.galeriaZdjec.map((img, index) => (
                          <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                            <Image src={img} alt={`Galeria ${index + 1}`} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-4">
                {lawFirm.services.length > 0 ? (
                  lawFirm.services.map((service) => (
                    <Card key={service.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{service.nazwaUslugi}</CardTitle>
                        <CardDescription>{service.opisUslugi}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            {serviceUnitLabels[service.jednostka]}
                          </span>
                          {service.cenaOd && service.cenaDo ? (
                            <span className="font-semibold text-lg">
                              {formatCurrency(service.cenaOd)} - {formatCurrency(service.cenaDo)}
                            </span>
                          ) : service.cenaOd ? (
                            <span className="font-semibold text-lg">
                              od {formatCurrency(service.cenaOd)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Cena do uzgodnienia</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Brak zdefiniowanych usług
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4">
                {lawFirm.reviews.length > 0 ? (
                  lawFirm.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{review.tytulOpinii}</CardTitle>
                            <CardDescription>
                              {review.anonimowa
                                ? "Anonim"
                                : `${review.client.imie} ${review.client.nazwisko}`}{" "}
                              • {formatDate(review.createdAt)}
                            </CardDescription>
                          </div>
                          {renderStars(review.ocenaOgolna)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="whitespace-pre-wrap">{review.trescOpinii}</p>

                        {(review.profesjonalizm || review.komunikacja || review.terminowosc || review.stosunekJakosci) && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {review.profesjonalizm && (
                              <div>
                                <span className="text-muted-foreground">Profesjonalizm:</span>
                                <div className="flex items-center gap-1 mt-1">
                                  {renderStars(review.profesjonalizm)}
                                </div>
                              </div>
                            )}
                            {review.komunikacja && (
                              <div>
                                <span className="text-muted-foreground">Komunikacja:</span>
                                <div className="flex items-center gap-1 mt-1">
                                  {renderStars(review.komunikacja)}
                                </div>
                              </div>
                            )}
                            {review.terminowosc && (
                              <div>
                                <span className="text-muted-foreground">Terminowość:</span>
                                <div className="flex items-center gap-1 mt-1">
                                  {renderStars(review.terminowosc)}
                                </div>
                              </div>
                            )}
                            {review.stosunekJakosci && (
                              <div>
                                <span className="text-muted-foreground">Stosunek jakości do ceny:</span>
                                <div className="flex items-center gap-1 mt-1">
                                  {renderStars(review.stosunekJakosci)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {review.odpowiedz && (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="font-semibold mb-2">Odpowiedź kancelarii:</p>
                            <p className="text-sm">{review.odpowiedz}</p>
                            {review.dataOdpowiedzi && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDate(review.dataOdpowiedzi)}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Brak opinii
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Blog Tab */}
              <TabsContent value="blog" className="space-y-4">
                {lawFirm.blogPosts.length > 0 ? (
                  lawFirm.blogPosts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{post.tytul}</CardTitle>
                        <CardDescription>
                          {post.dataPublikacji && formatDate(post.dataPublikacji)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3">{post.tresc}</p>
                        <Button variant="link" className="p-0 mt-2">
                          Czytaj więcej
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Brak artykułów
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Dane kontaktowe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Adres</p>
                    <p className="text-sm text-muted-foreground">
                      {lawFirm.adres}<br />
                      {lawFirm.kodPocztowy} {lawFirm.miasto}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Telefon</p>
                    <p className="text-sm text-muted-foreground">{lawFirm.numerTelefonu}</p>
                    {lawFirm.numerTelefonu2 && (
                      <p className="text-sm text-muted-foreground">{lawFirm.numerTelefonu2}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{lawFirm.emailKontakt}</p>
                  </div>
                </div>

                {lawFirm.stronaWww && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Strona WWW</p>
                        <a
                          href={lawFirm.stronaWww}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {lawFirm.stronaWww}
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Opening Hours */}
            {lawFirm.statusGodzinyOtwarcia && lawFirm.godzinyOtwarcia && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Godziny otwarcia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(lawFirm.godzinyOtwarcia).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="capitalize">{day}</span>
                        <span className="text-muted-foreground">{hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Media */}
            {(lawFirm.linkLinkedIn || lawFirm.linkFacebook || lawFirm.linkInstagram || lawFirm.linkTwitter) && (
              <Card>
                <CardHeader>
                  <CardTitle>Social media</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {lawFirm.linkLinkedIn && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={lawFirm.linkLinkedIn} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {lawFirm.linkFacebook && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={lawFirm.linkFacebook} target="_blank" rel="noopener noreferrer">
                          <Facebook className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {lawFirm.linkInstagram && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={lawFirm.linkInstagram} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {lawFirm.linkTwitter && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={lawFirm.linkTwitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Area */}
            {lawFirm.voivodeships.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Obszar działania</CardTitle>
                </CardHeader>
                <CardContent>
                  {lawFirm.callaPolska ? (
                    <Badge variant="secondary">Cała Polska</Badge>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {lawFirm.voivodeships.map((v, index) => (
                        <Badge key={index} variant="outline">
                          {v.voivodeship.nazwa}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {lawFirm.onlineOnly && (
                    <Badge variant="secondary" className="mt-2">
                      Online only
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statystyki</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wyświetlenia profilu</span>
                  <span className="font-medium">{lawFirm.wyswietleniaProfilu}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Złożone oferty</span>
                  <span className="font-medium">{lawFirm.zlozoneOferty}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wygrane oferty</span>
                  <span className="font-medium">{lawFirm.wygraneOferty}</span>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">Potrzebujesz pomocy prawnej?</h3>
                <p className="text-sm mb-4 opacity-90">
                  Skontaktuj się z {lawFirm.nazwa} i uzyskaj profesjonalną pomoc
                </p>
                <Button variant="secondary" className="w-full">
                  Wyślij wiadomość
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
