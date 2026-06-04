"use client"

import { ConsultationBooking } from "@/components/ekspert/ConsultationBooking"
import { ReviewsSection } from "@/components/ekspert/ReviewsSection"
import { BadgesSection } from "@/components/law-firm/BadgesSection"
import { PackageBadge } from "@/components/permissions"
import { AboutTab } from "@/components/ekspert/AboutTab"
import { ServicesTab } from "@/components/ekspert/ServicesTab"
import { BlogTab } from "@/components/ekspert/BlogTab"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Facebook,
  Globe,
  GraduationCap,
  Heart,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Share2,
  Star,
  Twitter,
  ZoomIn
} from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronDown } from "lucide-react"

// Client-side cache for city searches to avoid redundant api queries
const clientCitiesCache: Record<string, any[]> = {}

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
  pakietSubskrypcji: string | null
  voivodeship: {
    nazwa: string
  }
  voivodeships: Array<{
    voivodeship: {
      nazwa: string
    }
  }>
  cities: Array<{
    city: {
      nazwa: string
      voivodeship: {
        nazwa: string
      }
    }
  }>
  categories: Array<{
    id: string
    kolejnosc: number
    category: {
      nazwa: string
      slug: string
      opis?: string | null
      opisDodatkowy?: string | null
      ikona?: string | null
      typ: string
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
    wyswietlenia: number
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
      user?: {
        image?: string | null
      }
    }
  }>
  badges: Array<{
    id: string
    badge: {
      id: string
      name: string
      description: string
      imageUrl: string
      conditionType: string
      threshold: number
      createdAt: string
      updatedAt: string
    }
    awardedAt: string
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
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const isOwnProfile = !!(session?.user?.lawFirm?.id && lawFirm?.id && session.user.lawFirm.id === lawFirm.id)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("about")

  // Contact Form States
  const [contactForm, setContactForm] = useState({
    imieNazwisko: "",
    miasto: "",
    wojewodztwo: "",
    email: "",
    telefon: "",
    typSprawy: "prywatna",
    tresc: "",
    politykaPrivacy: false,
  })
  const [sendingContact, setSendingContact] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  const [cities, setCities] = useState<any[]>([])
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  // Dynamic fetch and caching for cities and postal codes
  useEffect(() => {
    const query = locationSearch.trim().toLowerCase()
    if (query.length < 2) {
      setCities([])
      setIsLoadingCities(false)
      return
    }

    if (clientCitiesCache[query]) {
      setCities(clientCitiesCache[query])
      setIsLoadingCities(false)
      return
    }

    setIsLoadingCities(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/cities?search=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            clientCitiesCache[query] = data
            setCities(data)
          }
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching cities:", error)
        }
      } finally {
        setIsLoadingCities(false)
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [locationSearch])

  // Helper function to strip HTML tags for blog excerpt
  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, "")
  }

  // Initialize active tab from URL and handle auto-opening of reviews tab
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam && ["about", "services", "reviews", "blog"].includes(tabParam)) {
      setActiveTab(tabParam)
    }

    if (searchParams.has("review")) {
      setActiveTab("reviews")
    }
  }, [searchParams])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update URL with new tab parameter
    const currentPath = window.location.pathname
    const newUrl = `${currentPath}?tab=${value}`
    router.push(newUrl, { scroll: false })
  }

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

        // Track profile view
        fetch(`/api/law-firms/${data.id}/view`, {
          method: "POST",
        }).catch(() => {
          // Ignore errors for view tracking
        })

        // Sprawdź czy kancelaria jest w ulubionych
        if (session?.user?.role === "CLIENT") {
          const favoriteResponse = await fetch(`/api/law-firms/${data.id}/favorite`)
          if (favoriteResponse.ok) {
            const favoriteData = await favoriteResponse.json()
            setIsFavorite(favoriteData.isFavorite)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.slug) {
      fetchLawFirm()
    }
  }, [params.slug, session])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contactForm.politykaPrivacy) {
      toast.error("Musisz zaakceptować politykę prywatności")
      return
    }

    setSendingContact(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lawFirmId: lawFirm?.id,
          ...contactForm,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się wysłać wiadomości")
      }

      toast.success("Twoja wiadomość została wysłana do kancelarii")
      setShowContactForm(false)

      // Reset formularza
      setContactForm({
        imieNazwisko: "",
        miasto: "",
        wojewodztwo: "",
        email: "",
        telefon: "",
        typSprawy: "prywatna",
        tresc: "",
        politykaPrivacy: false,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się wysłać wiadomości")
    } finally {
      setSendingContact(false)
    }
  }

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

  const handleToggleFavorite = async () => {
    if (!session?.user) {
      toast.error("Musisz być zalogowany, aby dodać kancelarię do ulubionych")
      router.push("/logowanie")
      return
    }

    if (session.user.role !== "CLIENT") {
      toast.error("Tylko klienci mogą dodawać kancelarie do ulubionych")
      return
    }

    if (!lawFirm) return

    setIsFavoriteLoading(true)

    try {
      const method = isFavorite ? "DELETE" : "POST"
      const response = await fetch(`/api/law-firms/${lawFirm.id}/favorite`, {
        method,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Wystąpił błąd")
      }

      setIsFavorite(!isFavorite)

      toast.success(
        isFavorite
          ? "Kancelaria została usunięta z Twojej listy ulubionych"
          : "Kancelaria została dodana do Twojej listy ulubionych"
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  const handleStartChat = async () => {
    if (!session?.user) {
      toast.error("Musisz być zalogowany, aby rozpocząć czat")
      router.push("/logowanie")
      return
    }

    if (session.user.role !== "CLIENT") {
      toast.error("Tylko klienci mogą rozpocząć czat z kancelariami")
      return
    }

    if (!lawFirm) return

    setIsStartingChat(true)

    try {
      // Pobierz ID użytkownika kancelarii
      const lawFirmUserResponse = await fetch(`/api/law-firms/${lawFirm.id}`)
      if (!lawFirmUserResponse.ok) {
        throw new Error("Nie udało się pobrać danych kancelarii")
      }

      const lawFirmData = await lawFirmUserResponse.json()

      // Utwórz lub pobierz konwersację
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lawFirmUserId: lawFirmData.userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się rozpocząć czatu")
      }

      const conversation = await response.json()

      // Przekieruj do panelu klienta z otwartą konwersacją
      router.push(`/panel-klienta/wiadomosci?conversationId=${conversation.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setIsStartingChat(false)
    }
  }

  const handleCopyUrl = () => {
    const currentUrl = window.location.href
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast.success("Link został skopiowany do schowka")
    }).catch(() => {
      toast.error("Nie udało się skopiować linku")
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= rating
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

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const youtubeVideoId = lawFirm?.filmYouTube ? getYouTubeVideoId(lawFirm.filmYouTube) : null

  return (
    <div className="min-h-screen bg-background-sec">
      {/* Header Image */}

      <div className="relative h-64 md:h-96 lg:h-128 w-full flex items-end overflow-hidden" id="kancelaria-header">
        {youtubeVideoId ? (
          <>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              className="absolute inset-0 w-full h-full object-cover z-[0] pointer-events-none"
              style={{
                width: '100vw',
                height: '56.25vw', // 16:9 aspect ratio
                minHeight: '100%',
                minWidth: '177.77vh', // 16:9 aspect ratio
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              allow="autoplay; encrypted-media"
              frameBorder="0"
            />
            <div className="absolute inset-0 bg-black/40 z-[-1]" />
          </>
        ) : lawFirm.zdjecieGlowne ? (
          <Image
            src={lawFirm.zdjecieGlowne}
            alt={lawFirm.nazwa}
            fill
            id="cover-photo"
            className="object-cover z-[2] opacity-75"
          />
        ) : (
          <div className={cn(
            "absolute inset-0 z-[5]",
            lawFirm.pakietSubskrypcji === "BIZNES" && "bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-background",
            lawFirm.pakietSubskrypcji === "PREMIUM" && "bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-background",
            lawFirm.pakietSubskrypcji === "STANDARD" && "bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-background",
            (!lawFirm.pakietSubskrypcji || lawFirm.pakietSubskrypcji === "PODSTAWOWY") && "bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10"
          )} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background/90 z-[5]" />
        <div className="container mx-auto px-4 py-8 pb-3 max-w-7xl">

          {/* Header Section */}
          <div className="relative z-[40]">

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              {lawFirm.logo && (
                <div className={cn(
                  "relative h-32 w-32 rounded-lg overflow-hidden bg-card flex-shrink-0",
                  lawFirm.pakietSubskrypcji === "BIZNES" && "p-[3px] animate-gradient-border",
                  lawFirm.pakietSubskrypcji === "PREMIUM" && "border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
                  lawFirm.pakietSubskrypcji === "STANDARD" && "border-2 border-blue-500",
                  (!lawFirm.pakietSubskrypcji || lawFirm.pakietSubskrypcji === "PODSTAWOWY") && "border-2 border-border"
                )}>
                  {lawFirm.pakietSubskrypcji === "BIZNES" && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-[length:200%_100%] animate-gradient" />
                  )}
                  <div className="relative h-full w-full rounded-lg bg-card overflow-hidden">
                    <Image
                      src={lawFirm.logo}
                      alt={lawFirm.nazwa}
                      id="logo-photo"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </div>
              )}

              {/* Header Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h1 className="text-xl md:text-2xl font-bold">{lawFirm.nazwa}</h1>
                      {lawFirm.zweryfikowana && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Zweryfikowana
                        </Badge>
                      )}
                      {lawFirm.pakietSubskrypcji && (
                        <PackageBadge
                          packageType={lawFirm.pakietSubskrypcji as "PODSTAWOWY" | "STANDARD" | "PREMIUM" | "BIZNES" | null}
                          size="lg"
                          className="shadow-md"
                        />
                      )}
                    </div>

                    <p className="text-lg text-muted-foreground">{lawFirm.nazwaFirmy}</p>


                    {/* Rating */}
                    {lawFirm.reviewCount > 0 && (
                      <div className="flex items-center gap-3">
                        {renderStars(Math.round(lawFirm.avgRating))}
                        <span className="font-semibold">{lawFirm.avgRating.toFixed(1)}</span>
                        <span className="text-muted-foreground">
                          ({lawFirm.reviewCount} {lawFirm.reviewCount === 1 ? "opinia" : "opinii"})
                        </span>
                      </div>
                    )}

                    {/* Open/Closed Status */}
                    {(() => {
                      if (!lawFirm.statusGodzinyOtwarcia || !lawFirm.godzinyOtwarcia) return null

                      const now = new Date()
                      const currentDay = now.getDay()
                      const currentTime = now.getHours() * 60 + now.getMinutes()

                      const dayMap: Record<number, string> = {
                        0: "niedziela",
                        1: "poniedzialek",
                        2: "wtorek",
                        3: "sroda",
                        4: "czwartek",
                        5: "piatek",
                        6: "sobota",
                      }

                      const todayKey = dayMap[currentDay]
                      const todayHours = lawFirm.godzinyOtwarcia[todayKey]

                      if (!todayHours || todayHours.toLowerCase() === "zamknięte" || todayHours.trim() === "") {
                        return (
                          <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                            <Clock className="w-3 h-3 mr-1" />
                            Zamknięte
                          </Badge>
                        )
                      }

                      const [from, to] = todayHours.split("-").map(t => t.trim())
                      if (!from || !to) return null

                      const [fromHour, fromMin] = from.split(":").map(Number)
                      const [toHour, toMin] = to.split(":").map(Number)

                      const fromTime = fromHour * 60 + fromMin
                      const toTime = toHour * 60 + toMin

                      const isOpen = currentTime >= fromTime && currentTime <= toTime

                      return isOpen ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                          <Clock className="w-3 h-3 mr-1" />
                          Otwarte
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                          <Clock className="w-3 h-3 mr-1" />
                          Zamknięte
                        </Badge>
                      )
                    })()}



                    {/* Słowa kluczowe */}
                    {lawFirm.slowaKluczowe && lawFirm.slowaKluczowe.length > 0 && (
                      <div className="mt-2">
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
                  <div className="flex gap-2 relative z-[199]" >
                    <Button
                      variant="outline"
                      size="icon"
                      className="add-to-favorites"
                      title={isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                      onClick={handleToggleFavorite}
                      disabled={isFavoriteLoading}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Udostępnij profil kancelarii</DialogTitle>
                          <DialogDescription>
                            Skopiuj link do profilu kancelarii
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Input
                              value={typeof window !== 'undefined' ? window.location.href : ''}
                              readOnly
                              className="flex-1"
                            />
                            <Button onClick={handleCopyUrl}>
                              Kopiuj
                            </Button>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                            Zamknij
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {session?.user?.role === "CLIENT" ? (
                      <Button onClick={handleStartChat} disabled={isStartingChat}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {isStartingChat ? "Przechodzę..." : "Rozpocznij czat"}
                      </Button>
                    ) : (
                      <Button>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Kontakt
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="container mx-auto px-4 py-8 max-w-7xl">


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className={cn("grid w-full", isOwnProfile ? "grid-cols-4" : "grid-cols-5")}>
                <TabsTrigger value="about">O nas</TabsTrigger>
                <TabsTrigger value="services">Usługi</TabsTrigger>
                {!isOwnProfile && <TabsTrigger value="consultations">Konsultacje</TabsTrigger>}
                <TabsTrigger value="reviews">Opinie</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                <AboutTab
                  lawFirm={lawFirm}
                  formatDate={formatDate}
                  setLightboxIndex={setLightboxIndex}
                  setLightboxOpen={setLightboxOpen}
                />
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-4">
                <ServicesTab lawFirm={lawFirm} />
              </TabsContent>

              {/* Consultations Tab */}
              {!isOwnProfile && (
                <TabsContent value="consultations">
                  <ConsultationBooking lawFirm={lawFirm} />
                </TabsContent>
              )}

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4">
                <ReviewsSection
                  reviews={lawFirm.reviews}
                  lawFirmId={lawFirm.id}
                  lawFirmName={lawFirm.nazwa}
                  lawFirmLogo={lawFirm.logo}
                  session={session}
                  onReviewSubmitted={async () => {
                    const firmResponse = await fetch(`/api/law-firms/${params.slug}`)
                    if (firmResponse.ok) {
                      const data = await firmResponse.json()
                      setLawFirm(data)
                    }
                  }}
                />
              </TabsContent>

              {/* Blog Tab */}
              <TabsContent value="blog" className="space-y-4">
                <BlogTab lawFirm={lawFirm} formatDate={formatDate} />
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
                      {session?.user ? (
                        <>
                          {lawFirm.adres}<br />
                          {lawFirm.kodPocztowy} {lawFirm.miasto}
                        </>
                      ) : (
                        "[dane ukryte]"
                      )}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Telefon</p>
                    {session?.user ? (
                      <>
                        <p className="text-sm text-muted-foreground">{lawFirm.numerTelefonu}</p>
                        {lawFirm.numerTelefonu2 && (
                          <p className="text-sm text-muted-foreground">{lawFirm.numerTelefonu2}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">[dane ukryte]</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {session?.user ? lawFirm.emailKontakt : "[dane ukryte]"}
                    </p>
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
                    {Object.entries(lawFirm.godzinyOtwarcia).map(([day, hours]) => {
                      const dayMap: Record<string, string> = {
                        poniedzialek: "Poniedziałek",
                        wtorek: "Wtorek",
                        sroda: "Środa",
                        czwartek: "Czwartek",
                        piatek: "Piątek",
                        sobota: "Sobota",
                        niedziela: "Niedziela",
                      }
                      const dayIndex: Record<string, number> = {
                        niedziela: 0,
                        poniedzialek: 1,
                        wtorek: 2,
                        sroda: 3,
                        czwartek: 4,
                        piatek: 5,
                        sobota: 6,
                      }
                      const today = new Date().getDay()
                      const isToday = dayIndex[day] === today
                      const isClosed = !hours || hours.trim() === "" || hours.toLowerCase() === "zamknięte"

                      return (
                        <div
                          key={day}
                          className={cn(
                            "flex justify-between text-sm py-1 px-2 rounded",
                            isToday && "bg-primary/10 font-medium"
                          )}
                        >
                          <span className="capitalize">{dayMap[day] || day}</span>
                          <span className={cn(
                            isClosed ? "text-muted-foreground italic" : "font-medium"
                          )}>
                            {isClosed ? "Zamknięte" : hours}
                          </span>
                        </div>
                      )
                    })}
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

            {/* Package Badge */}
            {lawFirm.pakietSubskrypcji && (() => {
              const pkg = lawFirm.pakietSubskrypcji;
              const cardClass =
                pkg === "BIZNES" ? "border-2 border-amber-500 bg-gradient-to-br from-[#1c1917] via-card to-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]" :
                  pkg === "PREMIUM" ? "border-2 border-purple-500 bg-gradient-to-br from-[#1e1b4b] via-card to-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.12)]" :
                    pkg === "STANDARD" ? "border-2 border-blue-500/70 bg-gradient-to-br from-[#172554] via-card to-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" :
                      "border border-neutral-850 bg-card";

              return (
                <Card className={cn("transition-all duration-300", cardClass)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-center">Plan subskrypcji</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-2">
                      <PackageBadge
                        packageType={lawFirm.pakietSubskrypcji as "PODSTAWOWY" | "STANDARD" | "PREMIUM" | "BIZNES" | null}
                        size="lg"
                        className="shadow-lg border-white/10"
                      />
                    </div>
                    {pkg === "BIZNES" && (
                      <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
                        Kancelaria z najwyższym pakietem - pełen dostęp do wszystkich funkcji
                      </p>
                    )}
                    {pkg === "PREMIUM" && (
                      <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
                        Zaawansowana kancelaria z rozszerzonymi funkcjami
                      </p>
                    )}
                    {pkg === "STANDARD" && (
                      <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
                        Kancelaria z pakietem standardowym
                      </p>
                    )}
                    {pkg === "PODSTAWOWY" && (
                      <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
                        Kancelaria z pakietem podstawowym
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Service Area */}
            {(lawFirm.voivodeships.length > 0 || lawFirm.cities.length > 0 || lawFirm.callaPolska) && (
              <Card className="overflow-hidden border-none shadow-sm bg-card">
                <CardHeader className="bg-card pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Obszar działania
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {lawFirm.callaPolska ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        <Globe className="h-3 w-3 mr-1" />
                        Cała Polska
                      </Badge>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Voivodeships */}
                      {lawFirm.voivodeships.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Województwa</p>
                          <div className="flex flex-wrap gap-1.5">
                            {lawFirm.voivodeships.map((v, index) => (
                              <Badge key={index} variant="outline" className="bg-background/50">
                                {v.voivodeship.nazwa}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cities */}
                      {lawFirm.cities.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Główne miasta</p>
                          <div className="flex flex-wrap gap-1.5">
                            {lawFirm.cities.map((c, index) => (
                              <Badge key={index} variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                                {c.city.nazwa}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {lawFirm.onlineOnly && (
                    <div className="pt-2 border-t border-border/50">
                      <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                        <Globe className="h-3 w-3 mr-1" />
                        Obsługa online
                      </Badge>
                    </div>
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

            {/* Contact Form */}
            <Card id="contact-form">
              <CardHeader>
                <CardTitle>Skontaktuj się z kancelarią</CardTitle>
                <CardDescription>
                  {session?.user
                    ? "Wypełnij formularz, a kancelaria odpowie najszybciej jak to możliwe"
                    : "Zaloguj się, aby wysłać wiadomość do kancelarii"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showContactForm ? (
                  <Button onClick={() => setShowContactForm(true)} className="w-full">
                    Pokaż formularz kontaktowy
                  </Button>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 animate-in fade-in-50 duration-200">
                    <div>
                      <Label htmlFor="imieNazwisko">Imię i nazwisko *</Label>
                      <Input
                        id="imieNazwisko"
                        value={contactForm.imieNazwisko}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, imieNazwisko: e.target.value })
                        }
                        placeholder="Jan Kowalski"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="miasto">Miasto *</Label>
                      <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full text-left justify-between font-normal text-sm"
                          >
                            <span className="truncate">{contactForm.miasto || "Wybierz miasto..."}</span>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Wyszukaj miasto..."
                              value={locationSearch}
                              onValueChange={setLocationSearch}
                            />
                            <CommandList className="max-h-60 overflow-y-auto">
                              {isLoadingCities && (
                                <div className="text-neutral-400 py-3 text-center text-xs">Wyszukiwanie...</div>
                              )}
                              {!isLoadingCities && locationSearch.trim().length < 2 && (
                                <div className="text-neutral-400 py-3 text-center text-xs px-3">
                                  Wpisz co najmniej 2 znaki...
                                </div>
                              )}
                              {!isLoadingCities && locationSearch.trim().length >= 2 && cities.length === 0 && (
                                <div className="text-neutral-400 py-3 text-center text-xs">Nie znaleziono miasta.</div>
                              )}
                              <CommandGroup>
                                {cities.map((city) => {
                                  const matchedPostal = city.postalCodes?.find((p: any) =>
                                    p.code.toLowerCase().includes(locationSearch.trim().toLowerCase())
                                  )
                                  const displayValue = matchedPostal
                                    ? `${city.nazwa} (${matchedPostal.code})`
                                    : city.nazwa

                                  return (
                                    <CommandItem
                                      key={city.id}
                                      value={city.nazwa}
                                      onSelect={() => {
                                        setContactForm({
                                          ...contactForm,
                                          miasto: city.nazwa,
                                          wojewodztwo: city.voivodeship?.nazwa || "",
                                        })
                                        setLocationOpen(false)
                                      }}
                                      className="cursor-pointer flex items-center justify-between gap-2 py-2 px-3 text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Check
                                          className={cn(
                                            "h-4 w-4 text-teal-500",
                                            contactForm.miasto === city.nazwa ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <span>{displayValue}</span>
                                      </div>
                                      <span className="text-xs text-muted-foreground ml-2 text-right">
                                        {city.voivodeship?.nazwa}
                                      </span>
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, email: e.target.value })
                        }
                        placeholder="jan@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefon">Telefon</Label>
                      <Input
                        id="telefon"
                        type="tel"
                        value={contactForm.telefon}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, telefon: e.target.value })
                        }
                        placeholder="+48 123 456 789"
                      />
                    </div>

                    <div>
                      <Label htmlFor="typSprawy">Typ sprawy *</Label>
                      <Select
                        value={contactForm.typSprawy}
                        onValueChange={(value) =>
                          setContactForm({ ...contactForm, typSprawy: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prywatna">Prywatna</SelectItem>
                          <SelectItem value="firmowa">Firmowa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tresc">Treść wiadomości *</Label>
                      <Textarea
                        id="tresc"
                        value={contactForm.tresc}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, tresc: e.target.value })
                        }
                        placeholder="Opisz swoją sprawę..."
                        rows={5}
                        required
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="politykaPrivacy"
                        checked={contactForm.politykaPrivacy}
                        onCheckedChange={(checked) =>
                          setContactForm({ ...contactForm, politykaPrivacy: !!checked })
                        }
                        disabled={!session?.user}
                      />
                      <Label htmlFor="politykaPrivacy" className="text-xs cursor-pointer">
                        Akceptuję politykę prywatności i wyrażam zgodę na przetwarzanie moich danych osobowych *
                      </Label>
                    </div>

                    {session?.user ? (
                      <Button type="submit" className="w-full" disabled={sendingContact}>
                        <Send className="mr-2 h-4 w-4" />
                        {sendingContact ? "Wysyłanie..." : "Wyślij wiadomość"}
                      </Button>
                    ) : (
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-3">
                          Wysłanie wiadomości będzie możliwe po zalogowaniu
                        </p>
                        <Button type="button" onClick={() => router.push("/logowanie")} className="w-full">
                          Zaloguj się
                        </Button>
                      </div>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {lawFirm.galeriaZdjec && lawFirm.galeriaZdjec.length > 0 && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={lawFirm.galeriaZdjec.map((src) => ({ src }))}
          index={lightboxIndex}
        />
      )}
    </div>
  )
}
