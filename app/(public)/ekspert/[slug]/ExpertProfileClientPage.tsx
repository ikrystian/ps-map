"use client"

import { ConsultationBooking } from "@/components/ekspert/ConsultationBooking"
import { ReviewsSection } from "@/components/ekspert/ReviewsSection"
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
import { toast } from "@/components/ui/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { expertAvatar } from "@/lib/expert-avatar"
import { cn } from "@/lib/utils"
import {
  FaFacebook as Facebook,
  FaInstagram as Instagram,
  FaLinkedin as Linkedin,
  FaTwitter as Twitter
} from "react-icons/fa"
import {
  Award,
  Clock,
  Eye,
  Globe,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Share2,
  Star,
  ShieldCheck,
  FileText
} from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronDown } from "lucide-react"
import { TooltipPreview } from "@/components/unlumen-ui/tooltip-preview"
import type { LawFirm } from "@/types"
import { SimilarExperts } from "@/components/ekspert/SimilarExperts"
import { NewExperts } from "@/components/homepage/new-experts"
import { BlogPostsSlider } from "@/components/ekspert/BlogPostsSlider"
import { ExpertCityLinks } from "@/components/ekspert/ExpertCityLinks"
import type { BlogPost } from "@/types/blog"

// Client-side cache for city searches to avoid redundant api queries
const clientCitiesCache: Record<string, any[]> = {}

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
  const [relatedExperts, setRelatedExperts] = useState<LawFirm[]>([])
  const [newExperts, setNewExperts] = useState<LawFirm[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [voivodeshipCities, setVoivodeshipCities] = useState<{ id: string; nazwa: string }[]>([])

  // Parallax calculations for header image
  const { scrollY } = useScroll()
  const imageY = useTransform(scrollY, [0, 440], [0, 120])
  const imageScale = useTransform(scrollY, [0, 440], [1.05, 1.15])
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
  const [mapsDialogOpen, setMapsDialogOpen] = useState(false)
  const [showContactData, setShowContactData] = useState(false)

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
    if (tabParam && ["about", "services", "reviews", "blog", "consultations"].includes(tabParam)) {
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
          throw new Error("Nie udało się pobrać danych eksperta")
        }

        const data = await response.json()
        setLawFirm(data)

        // Track profile view
        fetch(`/api/law-firms/${data.id}/view`, {
          method: "POST",
        }).catch(() => {
          // Ignore errors for view tracking
        })

        // Sprawdź czy ekspert jest w ulubionych
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

  useEffect(() => {
    if (!lawFirm) return

    const categorySlug =
      lawFirm.categories?.[0]?.category?.slug ||
      lawFirm.categories?.[0]?.slug ||
      ""
    const city = lawFirm.miasto || ""

    const params = new URLSearchParams({ limit: "10" })
    if (city) params.set("city", city)
    if (categorySlug) params.set("category", categorySlug)

    const voivodeshipId = (lawFirm as any).voivodeshipId
    const citiesParams = new URLSearchParams({ hasExperts: "true" })
    if (voivodeshipId) citiesParams.set("voivodeshipId", voivodeshipId)

    Promise.all([
      fetch(`/api/law-firms?${params}`).then((r) => r.ok ? r.json() : null),
      fetch("/api/law-firms?limit=8").then((r) => r.ok ? r.json() : null),
      fetch("/api/blog/posts?limit=8").then((r) => r.ok ? r.json() : null),
      voivodeshipId ? fetch(`/api/cities?${citiesParams}`).then((r) => r.ok ? r.json() : []) : Promise.resolve([]),
    ]).then(([related, newFirms, blog, cities]) => {
      if (related?.lawFirms) setRelatedExperts(related.lawFirms)
      if (newFirms?.lawFirms) setNewExperts(newFirms.lawFirms)
      if (blog?.posts) setBlogPosts(blog.posts)
      if (Array.isArray(cities)) setVoivodeshipCities(cities)
    }).catch(() => { })
  }, [lawFirm?.id])

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

      toast.success("Twoja wiadomość została wysłana do ekspercie")
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
      toast.error("Musisz być zalogowany, aby dodać eksperta do ulubionych")
      router.push("/logowanie")
      return
    }

    if (session.user.role !== "CLIENT") {
      toast.error("Tylko klienci mogą dodawać ekspertów do ulubionych")
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
          ? "Ekspert został usunięty z Twojej listy ulubionych"
          : "Ekspert został dodany do Twojej listy ulubionych"
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
      toast.error("Tylko klienci mogą rozpocząć czat z ekspertami")
      return
    }

    if (!lawFirm) return

    setIsStartingChat(true)

    try {
      // Pobierz ID użytkownika eksperta
      const lawFirmUserResponse = await fetch(`/api/law-firms/${lawFirm.id}`)
      if (!lawFirmUserResponse.ok) {
        throw new Error("Nie udało się pobrać danych eksperta")
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
          <p className="mt-4 text-muted-foreground">Ładowanie profilu eksperta...</p>
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
            <CardDescription>{error || "Nie znaleziono eksperta"}</CardDescription>
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
    <div className="min-h-screen bg-background-sec pb-16">
      {/* Header Image / Video Banner */}
      <div className="relative h-[280px] md:h-[380px] lg:h-[640px] w-full flex items-end overflow-hidden" id="ekspert-header">
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
            <div className="absolute inset-0 bg-black/40 z-[1]" />
          </>
        ) : lawFirm.zdjecieGlowne ? (
          <motion.div
            className="absolute inset-0 z-[2] will-change-transform"
            style={{ y: imageY, scale: imageScale }}
          >
            <Image
              src={lawFirm.zdjecieGlowne}
              alt={lawFirm.nazwa}
              fill
              id="cover-photo"
              className="object-cover opacity-75"
            />
          </motion.div>
        ) : (
          <div className={cn(
            "absolute inset-0 z-[5]",
            lawFirm.pakietSubskrypcji === "BIZNES" && "bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-background",
            lawFirm.pakietSubskrypcji === "PREMIUM" && "bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-background",
            lawFirm.pakietSubskrypcji === "STANDARD" && "bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-background",
            (!lawFirm.pakietSubskrypcji || lawFirm.pakietSubskrypcji === "PODSTAWOWY") && "bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10"
          )} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-background-sec/60 to-background-sec z-[3]" />
      </div>

      {/* Overlapping Hero Card Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-24 md:-mt-36">

        {/* Floating Profile Info Card */}
        <div className={cn(
          "profile-card bg-card/90 backdrop-blur-xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl md:rounded-3xl p-6 md:p-8 transition-all duration-500 relative overflow-hidden",
          lawFirm.pakietSubskrypcji === "BIZNES" && "border-amber-500/40 shadow-[0_0_40px_-5px_rgba(245,158,11,0.2)] bg-gradient-to-br from-card/95 via-card/90 to-amber-950/10",
          lawFirm.pakietSubskrypcji === "PREMIUM" && "border-purple-500/40 shadow-[0_0_40px_-5px_rgba(168,85,247,0.2)] bg-gradient-to-br from-card/95 via-card/90 to-purple-950/10",
          lawFirm.pakietSubskrypcji === "STANDARD" && "border-blue-500/40 shadow-[0_0_40px_-5px_rgba(59,130,246,0.2)] bg-gradient-to-br from-card/95 via-card/90 to-blue-950/10"
        )}>
          {/* Decorative background glows */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none opacity-60 dark:opacity-40" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none opacity-50 dark:opacity-30" />

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start justify-between relative z-10">

            {/* Logo and Metadata */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start flex-1 w-full text-center md:text-left">
              {/* Logo */}
              <div className="relative group flex-shrink-0 self-center md:self-start">
                <div className={cn(
                  "relative h-28 w-28 md:h-32 md:w-32 rounded-2xl overflow-hidden bg-background/90 backdrop-blur-sm flex-shrink-0 border shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl",
                  lawFirm.pakietSubskrypcji === "BIZNES" && "border-amber-400 shadow-amber-500/20",
                  lawFirm.pakietSubskrypcji === "PREMIUM" && "border-purple-400 shadow-purple-500/20",
                  lawFirm.pakietSubskrypcji === "STANDARD" && "border-blue-400 shadow-blue-500/20",
                  (!lawFirm.pakietSubskrypcji || lawFirm.pakietSubskrypcji === "PODSTAWOWY") && "border-border"
                )}>
                  {lawFirm.pakietSubskrypcji === "BIZNES" && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-[length:200%_100%] animate-gradient opacity-60" />
                  )}
                  {lawFirm.pakietSubskrypcji === "PREMIUM" && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-[length:200%_100%] animate-gradient opacity-60" />
                  )}
                  <div className="relative h-full w-full rounded-[14px] bg-card overflow-hidden z-10 m-[1px] w-[calc(100%-2px)] h-[calc(100%-2px)]">
                    <Image
                      src={expertAvatar(lawFirm.logo)}
                      alt={lawFirm.nazwa}
                      id="logo-photo"
                      fill
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                {/* Subtle pulsing background glow on hover for premium profiles */}
                {(lawFirm.pakietSubskrypcji === "BIZNES" || lawFirm.pakietSubskrypcji === "PREMIUM") && (
                  <span className="absolute -inset-1.5 rounded-3xl bg-primary/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                )}
              </div>

              {/* Text Info */}
              <div className="space-y-4 flex-1 w-full">
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start flex-wrap">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-playfair tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
                      {lawFirm?.nazwa}
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                      {lawFirm.zweryfikowana && (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Zweryfikowany ekspert
                        </Badge>
                      )}
                      {lawFirm.pakietSubskrypcji && (
                        <PackageBadge
                          packageType={lawFirm.pakietSubskrypcji as "PODSTAWOWY" | "STANDARD" | "PREMIUM" | "BIZNES" | null}
                          size="md"
                          className="shadow-sm border-border"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating, Opening Status, and Location details in clean pills */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm pt-1">
                  {/* Review Pill */}
                  {lawFirm.reviewCount > 0 ? (
                    <div className="flex items-center gap-2 bg-yellow-500/10 dark:bg-yellow-500/15 border border-yellow-500/30 px-3.5 py-1.5 rounded-full shadow-sm">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${star <= Math.round(lawFirm.avgRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-muted text-muted"
                              }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-yellow-500 text-xs">
                        {lawFirm.avgRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-yellow-500/80 font-medium">
                        ({lawFirm.reviewCount} {lawFirm.reviewCount === 1 ? "opinia" : lawFirm.reviewCount < 5 ? "opinie" : "opinii"})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground font-medium bg-foreground/5 border border-border px-3 py-1.5 rounded-full italic">
                      Brak opinii
                    </span>
                  )}

                  {/* Open / Closed status indicator with pulse animation */}
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
                        <div className="flex items-center gap-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                          Zamknięte
                        </div>
                      )
                    }

                    const [from, to] = todayHours.split("-").map((t: string) => t.trim())
                    if (!from || !to) return null

                    const [fromHour, fromMin] = from.split(":").map(Number)
                    const [toHour, toMin] = to.split(":").map(Number)

                    const fromTime = fromHour * 60 + fromMin
                    const toTime = toHour * 60 + toMin

                    const isOpen = currentTime >= fromTime && currentTime <= toTime

                    return isOpen ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Otwarte
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                        Zamknięte
                      </div>
                    )
                  })()}

                  {/* Location pill */}
                  <div className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-sm">
                    {lawFirm.miasto}
                  </div>
                </div>

                {/* Słowa kluczowe (tags) */}
                {lawFirm.slowaKluczowe && lawFirm.slowaKluczowe.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 justify-center md:justify-start">
                    {(lawFirm.slowaKluczowe as string[]).map((keyword: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-foreground/5 border-border hover:bg-foreground/10 hover:border-border transition-colors px-2.5 py-0.5 rounded-md text-muted-foreground hover:text-foreground font-medium"
                      >
                        #{keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch lg:items-center justify-center lg:justify-end self-stretch lg:self-end border-t lg:border-t-0 pt-6 lg:pt-0 mt-2 lg:mt-0 border-border">
              <div className="flex items-center gap-2 justify-center lg:justify-end flex-wrap">

                {/* Social Media Icons */}
                {lawFirm.linkLinkedIn && (
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl bg-foreground/5 border-border hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5] text-muted-foreground transition-all hover:scale-105 active:scale-95 shadow-sm" title="LinkedIn" asChild>
                    <a href={lawFirm.linkLinkedIn} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                {lawFirm.linkFacebook && (
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl bg-foreground/5 border-border hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] text-muted-foreground transition-all hover:scale-105 active:scale-95 shadow-sm" title="Facebook" asChild>
                    <a href={lawFirm.linkFacebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                {lawFirm.linkInstagram && (
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl bg-foreground/5 border-border hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white hover:border-transparent text-muted-foreground transition-all hover:scale-105 active:scale-95 shadow-sm" title="Instagram" asChild>
                    <a href={lawFirm.linkInstagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                {lawFirm.linkTwitter && (
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl bg-foreground/5 border-border hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black text-muted-foreground transition-all hover:scale-105 active:scale-95 shadow-sm" title="Twitter / X" asChild>
                    <a href={lawFirm.linkTwitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-5 w-5" />
                    </a>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="ml-4 h-11 w-11 rounded-xl bg-foreground/5 border-border hover:bg-foreground/10 hover:border-border hover:text-red-400 text-muted-foreground transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title={isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                  onClick={handleToggleFavorite}
                  disabled={isFavoriteLoading}
                >
                  <Heart className={`h-5 w-5 transition-transform duration-300 ${isFavorite ? "fill-red-500 text-red-500 scale-110" : ""}`} />
                </Button>

                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl bg-foreground/5 border-border hover:bg-foreground/10 hover:border-border text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95 shadow-sm">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Udostępnij profil</DialogTitle>
                      <DialogDescription>
                        Skopiuj link do profilu tego eksperta.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 pt-2">
                      <div className="grid flex-1 gap-2">
                        <Input
                          value={typeof window !== 'undefined' ? window.location.href : ''}
                          readOnly
                          className="w-full text-xs font-mono select-all bg-muted/30 border-border/60"
                        />
                      </div>
                      <Button onClick={handleCopyUrl} type="button" size="sm" className="px-3">
                        Kopiuj
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                        Zamknij
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              </div>

              {session?.user?.role === "CLIENT" ? (
                <Button
                  onClick={handleStartChat}
                  disabled={isStartingChat || lawFirm.naUrlopie || lawFirm.przyjmujeBezposrednieZapytania === false}
                  title={
                    lawFirm.naUrlopie
                      ? "Ekspert jest w trybie urlopowym"
                      : lawFirm.przyjmujeBezposrednieZapytania === false
                        ? "Ekspert nie przyjmuje obecnie bezpośrednich zapytań"
                        : undefined
                  }
                  className="h-11 rounded-xl bg-gradient-to-r from-primary to-[#12c2b1] hover:from-[#12c2b1] hover:to-primary text-primary-foreground font-semibold px-6 shadow-md shadow-primary/10 hover:shadow-[0_0_20px_rgba(13,161,146,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 border border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <MessageSquare className="h-4 w-4" />
                  {isStartingChat ? "Łączenie..." : "Rozpocznij czat"}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setShowContactForm(true);
                    setTimeout(() => {
                      const element = document.getElementById("contact-form");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }, 100);
                  }}
                  className="h-11 rounded-xl bg-gradient-to-r from-primary to-[#12c2b1] hover:from-[#12c2b1] hover:to-primary text-primary-foreground font-semibold px-6 shadow-md shadow-primary/10 hover:shadow-[0_0_20px_rgba(13,161,146,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 border border-primary/20 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  Skontaktuj się
                </Button>
              )}
            </div>

          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">

          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
              <TabsList className={cn(
                "p-1 bg-muted/30 border border-border/40 rounded-xl grid w-full gap-1",
                isOwnProfile ? "grid-cols-4" : "grid-cols-5"
              )}>
                <TabsTrigger value="about" className="py-2.5 rounded-lg text-sm transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">O nas</TabsTrigger>
                <TabsTrigger value="services" className="py-2.5 rounded-lg text-sm transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">Usługi</TabsTrigger>
                {!isOwnProfile && <TabsTrigger value="consultations" className="py-2.5 rounded-lg text-sm transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">Konsultacje</TabsTrigger>}
                <TabsTrigger value="reviews" className="py-2.5 rounded-lg text-sm transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">Opinie</TabsTrigger>
                <TabsTrigger value="blog" className="py-2.5 rounded-lg text-sm transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">Blog</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6 animate-in fade-in-50 duration-300">
                <AboutTab
                  lawFirm={lawFirm}
                  formatDate={formatDate}
                  setLightboxIndex={setLightboxIndex}
                  setLightboxOpen={setLightboxOpen}
                />
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-4 animate-in fade-in-50 duration-300">
                <ServicesTab lawFirm={lawFirm} />
              </TabsContent>

              {/* Consultations Tab */}
              {!isOwnProfile && (
                <TabsContent value="consultations" className="animate-in fade-in-50 duration-300">
                  <ConsultationBooking lawFirm={lawFirm} />
                </TabsContent>
              )}

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4 animate-in fade-in-50 duration-300">
                <ReviewsSection
                  reviews={lawFirm.reviews || []}
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
              <TabsContent value="blog" className="space-y-4 animate-in fade-in-50 duration-300">
                <BlogTab lawFirm={lawFirm} formatDate={formatDate} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">

            {/* Contact Details Card */}
            <Card className="border border-border/50 shadow-sm overflow-hidden rounded-2xl hover:shadow-md transition-all duration-300">
              <CardHeader className="bg-muted/10 border-b border-border/30 pb-4">
                <CardTitle className="text-xl font-light font-playfair flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary/80" />
                  Dane kontaktowe
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary h-fit">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Adres</p>
                    <div className="text-sm text-foreground">
                      {session?.user || showContactData ? (
                        <button
                          onClick={() => setMapsDialogOpen(true)}
                          className="leading-relaxed text-left hover:text-primary transition-colors cursor-pointer group"
                          title="Pokaż na mapie"
                        >
                          <span className="group-hover:underline underline-offset-2 decoration-primary/50">
                            {lawFirm.adres}<br />
                            {lawFirm.kodPocztowy} {lawFirm.miasto}
                          </span>
                          <span className="inline-flex items-center gap-1 ml-1 text-xs text-primary/60 group-hover:text-primary transition-colors">
                            <MapPin className="h-3 w-3" />
                          </span>
                        </button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowContactData(true)}
                          className="gap-1.5 h-7 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Pokaż
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-border/30 pt-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary h-fit">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telefon</p>
                    <div className="text-sm text-foreground">
                      {session?.user || showContactData ? (
                        <>
                          <a href={`tel:${lawFirm.numerTelefonu}`} className="hover:text-primary transition-colors font-semibold">{lawFirm.numerTelefonu}</a>
                          {lawFirm.numerTelefonu2 && (
                            <p><a href={`tel:${lawFirm.numerTelefonu2}`} className="hover:text-primary transition-colors">{lawFirm.numerTelefonu2}</a></p>
                          )}
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowContactData(true)}
                          className="gap-1.5 h-7 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Pokaż
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-border/30 pt-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary h-fit">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                    <div className="text-sm text-foreground break-all">
                      {session?.user || showContactData ? (
                        <a href={`mailto:${lawFirm.user?.email}`} className="hover:text-primary transition-colors font-semibold">{lawFirm.user?.email}</a>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowContactData(true)}
                          className="gap-1.5 h-7 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Pokaż
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {lawFirm.stronaWww && (
                  <div className="flex gap-4 border-t border-border/30 pt-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary h-fit">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Strona WWW</p>
                      <div className="text-sm text-foreground">
                        <TooltipPreview
                          href={lawFirm.stronaWww.startsWith('http') ? lawFirm.stronaWww : `https://${lawFirm.stronaWww}`}
                          title={lawFirm.nazwa}
                          description={lawFirm.opis || `Oficjalna strona internetowa eksperta ${lawFirm.nazwa}`}
                          favicon={`https://www.google.com/s2/favicons?domain=${lawFirm.stronaWww.startsWith('http') ? lawFirm.stronaWww : `https://${lawFirm.stronaWww}`}&sz=32`}
                          className="text-primary font-medium break-all"
                        >
                          {lawFirm.stronaWww}
                        </TooltipPreview>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Opening Hours Card */}
            {lawFirm.statusGodzinyOtwarcia && lawFirm.godzinyOtwarcia && (
              <Card className="border border-border/50 shadow-sm overflow-hidden rounded-2xl hover:shadow-md transition-all duration-300">
                <CardHeader className="bg-muted/10 border-b border-border/30 pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary/80" />
                    Godziny otwarcia
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2.5">
                    {Object.entries(lawFirm.godzinyOtwarcia).map(([day, hours]: [string, any]) => {
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
                      const isClosed = !hours || (typeof hours === "string" && (hours.trim() === "" || hours.toLowerCase() === "zamknięte"))

                      return (
                        <div
                          key={day}
                          className={cn(
                            "flex justify-between items-center text-sm py-1.5 px-3 rounded-lg transition-all",
                            isToday ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-muted-foreground hover:bg-muted/10"
                          )}
                        >
                          <span className="capitalize">{dayMap[day] || day}</span>
                          <span className={cn(
                            isClosed ? "text-muted-foreground italic font-normal" : "font-semibold text-foreground",
                            isToday && !isClosed && "text-primary"
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



            {/* Subscription Package Card */}
            {lawFirm.pakietSubskrypcji && (() => {
              const pkg = lawFirm.pakietSubskrypcji;
              const cardClass =
                pkg === "BIZNES" ? "border-2 border-amber-500/80 bg-gradient-to-br from-card via-card to-amber-950/20 shadow-lg shadow-amber-500/10" :
                  pkg === "PREMIUM" ? "border-2 border-purple-500/80 bg-gradient-to-br from-[#1e1b4b] via-card to-purple-950/20 shadow-lg shadow-purple-500/10" :
                    pkg === "STANDARD" ? "border-2 border-blue-500/70 bg-gradient-to-br from-[#172554] via-card to-blue-950/20 shadow-lg shadow-blue-500/5" :
                      "border border-border bg-card";

              return (
                <Card className={cn("transition-all duration-300 rounded-2xl overflow-hidden hidden hover:scale-[1.01] hover:shadow-md", cardClass)}>
                  <CardHeader className="pb-2 border-b border-border/30 bg-muted/10">
                    <CardTitle className="text-sm text-center uppercase tracking-wider text-muted-foreground font-semibold">Plan subskrypcji</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center py-2">
                      <PackageBadge
                        packageType={lawFirm.pakietSubskrypcji as "PODSTAWOWY" | "STANDARD" | "PREMIUM" | "BIZNES" | null}
                        size="lg"
                        className="shadow-md border-border"
                      />
                    </div>
                    {pkg === "BIZNES" && (
                      <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
                        Ekspert z najwyższym pakietem - pełen dostęp do wszystkich funkcji
                      </p>
                    )}
                    {pkg === "PREMIUM" && (
                      <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
                        Zaawansowany ekspert z rozszerzonymi funkcjami
                      </p>
                    )}
                    {pkg === "STANDARD" && (
                      <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
                        Ekspert z pakietem standardowym
                      </p>
                    )}
                    {pkg === "PODSTAWOWY" && (
                      <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
                        Ekspert z pakietem podstawowym
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Service Area Card */}
            {((lawFirm.voivodeships && lawFirm.voivodeships.length > 0) || (lawFirm.cities && lawFirm.cities.length > 0) || lawFirm.calaPolska) && (
              <Card className="border border-border/50 shadow-sm overflow-hidden rounded-2xl hover:shadow-md transition-all duration-300">
                <CardHeader className="bg-muted/10 border-b border-border/30 pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary/80" />
                    Obszar działania
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {lawFirm.calaPolska ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-lg py-1 px-2.5">
                        <Globe className="h-3.5 w-3.5 mr-1.5" />
                        Cała Polska
                      </Badge>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Voivodeships */}
                      {lawFirm.voivodeships && lawFirm.voivodeships.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Województwa</p>
                          <div className="flex flex-wrap gap-1.5">
                            {lawFirm.voivodeships.map((v: any, index: number) => (
                              <Badge key={index} variant="outline" className="bg-background/50 border-border/60 font-medium px-2 py-1 rounded-lg text-sm">
                                {v.voivodeship.nazwa}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cities */}
                      {lawFirm.cities && lawFirm.cities.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-md font-bold uppercase text-muted-foreground tracking-wider">Główne miasta</p>
                          <div className="flex flex-wrap gap-1.5">
                            {lawFirm.cities.map((c: any, index: number) => (
                              <Badge key={index} variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-semibold text-md px-2 py-0.5 rounded-lg">
                                {c.city.nazwa}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {lawFirm.onlineOnly && (
                    <div className="pt-3 border-t border-border/30">
                      <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 rounded-lg py-1 px-2.5 font-semibold">
                        <Globe className="h-3.5 w-3.5 mr-1.5" />
                        Obsługa online
                      </Badge>
                    </div>
                  )}
                  {lawFirm.bieglySadowy && (
                    <div className="pt-3 border-t border-border/30">
                      <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 rounded-lg py-1 px-2.5 font-semibold">
                        <Award className="h-3.5 w-3.5 mr-1.5" />
                        Biegły sądowy
                        {lawFirm.bieglySadowyNazwaSadu ? ` — ${lawFirm.bieglySadowyNazwaSadu}` : ""}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Wpisy do rejestrów zawodowych Card */}
            {(lawFirm.oirpStatus || lawFirm.oraStatus) && (
              <Card className="border border-border/50 shadow-sm overflow-hidden rounded-2xl hover:shadow-md transition-all duration-300">
                <CardHeader className="bg-muted/10 border-b border-border/30 pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary/80" />
                    Wpisy do rejestrów zawodowych
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-4">
                    {lawFirm.oirpStatus && (
                      <div className="space-y-1.5 pb-3 border-b border-border/30 last:border-0 last:pb-0 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            Radca Prawny (OIRP)
                          </Badge>
                        </div>
                        {lawFirm.oirpMiasto && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                            <span className="font-medium text-foreground">Izba:</span> {lawFirm.oirpMiasto}
                          </p>
                        )}
                        {lawFirm.oirpWpis && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground/70" />
                            <span className="font-medium text-foreground">Numer wpisu:</span> {lawFirm.oirpWpis}
                          </p>
                        )}
                      </div>
                    )}

                    {lawFirm.oraStatus && (
                      <div className="space-y-1.5 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20">
                            Adwokat (ORA)
                          </Badge>
                        </div>
                        {lawFirm.oraMiasto && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                            <span className="font-medium text-foreground">Izba:</span> {lawFirm.oraMiasto}
                          </p>
                        )}
                        {lawFirm.oraWpis && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground/70" />
                            <span className="font-medium text-foreground">Numer wpisu:</span> {lawFirm.oraWpis}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portal Stats Card */}
            <Card className="border border-border/50 shadow-sm overflow-hidden rounded-2xl hover:shadow-md transition-all duration-300">
              <CardHeader className="bg-muted/10 border-b border-border/30 pb-4">
                <CardTitle className="text-xl font-light font-playfair flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary/80" />
                  Statystyki na portalu
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-muted/20 p-3.5 rounded-xl border border-border/40 space-y-1">
                    <p className="text-sm font-bold text-foreground">{lawFirm.wyswietleniaProfilu}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Wyświetlenia</p>
                  </div>
                  <div className="bg-muted/20 p-3.5 rounded-xl border border-border/40 space-y-1">
                    <p className="text-sm font-bold text-foreground">{lawFirm.zlozoneOferty}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Złożone oferty</p>
                  </div>
                  <div className="bg-muted/20 p-3.5 rounded-xl border border-border/40 space-y-1">
                    <p className="text-sm font-bold text-foreground">{lawFirm.wygraneOferty}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Wygrane</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form Card */}
            <Card id="contact-form" className="scroll-mt-24 border border-border/50 shadow-sm overflow-hidden rounded-2xl hover:shadow-md transition-all duration-300">
              <CardHeader className="bg-muted/10 border-b border-border/30 pb-4">
                <CardTitle className="text-xl font-light font-playfair flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary/80" />
                  Skontaktuj się z ekspertem
                </CardTitle>
                <CardDescription>
                  {session?.user
                    ? "Wypełnij formularz, a ekspert odpowie najszybciej jak to możliwe"
                    : "Zaloguj się, aby wysłać wiadomość do eksperta"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {lawFirm.naUrlopie ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
                    Ekspert jest obecnie niedostępny (tryb urlopowy) i nie przyjmuje nowych zapytań.
                  </div>
                ) : lawFirm.przyjmujeBezposrednieZapytania === false ? (
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
                    Ten ekspert nie przyjmuje obecnie bezpośrednich zapytań przez profil.
                  </div>
                ) : !showContactForm ? (
                  <Button onClick={() => setShowContactForm(true)} className="w-full rounded-xl bg-primary hover:bg-primary/95 transition-all text-white font-semibold">
                    Pokaż formularz kontaktowy
                  </Button>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-1.5">
                      <Label htmlFor="imieNazwisko" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Imię i nazwisko *</Label>
                      <Input
                        id="imieNazwisko"
                        value={contactForm.imieNazwisko}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, imieNazwisko: e.target.value })
                        }
                        placeholder="Jan Kowalski"
                        className="rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary focus-visible:border-primary"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="miasto" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Miasto *</Label>
                      <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full text-left justify-between font-normal text-sm rounded-xl border-border/60 bg-background/50 hover:bg-background/80 transition-colors"
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
                                <div className="text-muted-foreground py-3 text-center text-xs">Wyszukiwanie...</div>
                              )}
                              {!isLoadingCities && locationSearch.trim().length < 2 && (
                                <div className="text-muted-foreground py-3 text-center text-xs px-3">
                                  Wpisz co najmniej 2 znaki...
                                </div>
                              )}
                              {!isLoadingCities && locationSearch.trim().length >= 2 && cities.length === 0 && (
                                <div className="text-muted-foreground py-3 text-center text-xs">Nie znaleziono miasta.</div>
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

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, email: e.target.value })
                        }
                        placeholder="jan@example.com"
                        className="rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary focus-visible:border-primary"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="telefon" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telefon</Label>
                      <Input
                        id="telefon"
                        type="tel"
                        value={contactForm.telefon}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, telefon: e.target.value })
                        }
                        placeholder="+48 123 456 789"
                        className="rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary focus-visible:border-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="typSprawy" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typ sprawy *</Label>
                      <Select
                        value={contactForm.typSprawy}
                        onValueChange={(value) =>
                          setContactForm({ ...contactForm, typSprawy: value })
                        }
                      >
                        <SelectTrigger className="rounded-xl border-border/60 bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prywatna">Prywatna</SelectItem>
                          <SelectItem value="firmowa">Firmowa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="tresc" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Treść wiadomości *</Label>
                      <Textarea
                        id="tresc"
                        value={contactForm.tresc}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, tresc: e.target.value })
                        }
                        placeholder="Opisz swoją sprawę..."
                        className="rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary focus-visible:border-primary"
                        rows={5}
                        required
                      />
                    </div>

                    <div className="flex items-start space-x-2 pt-1">
                      <Checkbox
                        id="politykaPrivacy"
                        checked={contactForm.politykaPrivacy}
                        onCheckedChange={(checked) =>
                          setContactForm({ ...contactForm, politykaPrivacy: !!checked })
                        }
                        disabled={!session?.user}
                        className="rounded-md border-border/70"
                      />
                      <Label htmlFor="politykaPrivacy" className="text-[11px] text-muted-foreground leading-normal cursor-pointer select-none">
                        Akceptuję politykę prywatności i wyrażam zgodę na przetwarzanie moich danych osobowych *
                      </Label>
                    </div>

                    {session?.user ? (
                      <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white shadow-md shadow-primary/10 transition-all font-semibold flex items-center justify-center gap-2" disabled={sendingContact}>
                        <Send className="h-4 w-4" />
                        {sendingContact ? "Wysyłanie..." : "Wyślij wiadomość"}
                      </Button>
                    ) : (
                      <div className="p-4 bg-muted/30 border border-border/40 rounded-xl text-center">
                        <p className="text-xs text-muted-foreground mb-3 font-medium">
                          Wysłanie wiadomości będzie możliwe po zalogowaniu
                        </p>
                        <Button type="button" onClick={() => router.push("/logowanie")} className="w-full rounded-xl" variant="outline">
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

      {/* Similar Experts - same city & category */}
      <SimilarExperts
        experts={relatedExperts}
        currentExpertId={lawFirm.id}
        expertiseCategoryName={(lawFirm as any).expertiseCategory?.nazwa}
      />

      {/* New Experts Slider */}
      {newExperts.length > 0 && <NewExperts newLawFirms={newExperts} />}

      {/* Blog Posts Slider */}
      <BlogPostsSlider blogPosts={blogPosts} />

      {/* SEO City Links */}
      <ExpertCityLinks
        cities={voivodeshipCities}
        expertiseCategoryId={(lawFirm as any).expertiseCategoryId}
        expertiseCategoryName={(lawFirm as any).expertiseCategory?.nazwa}
        voivodeshipName={lawFirm.voivodeship?.nazwa}
      />

      {/* Photo Lightbox */}
      {lawFirm.galeriaZdjec && lawFirm.galeriaZdjec.length > 0 && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={lawFirm.galeriaZdjec.map((src) => ({ src }))}
          index={lightboxIndex}
        />
      )}

      {/* Google Maps Dialog */}
      <Dialog open={mapsDialogOpen} onOpenChange={setMapsDialogOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl border border-border/60">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/40">
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <MapPin className="h-5 w-5 text-primary" />
              {lawFirm.nazwa}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {lawFirm.adres}, {lawFirm.kodPocztowy} {lawFirm.miasto}
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-[420px]">
            <iframe
              title="Lokalizacja eksperta na mapie"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${lawFirm.adres}, ${lawFirm.kodPocztowy} ${lawFirm.miasto}, Polska`)}&output=embed&z=15`}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border/40 flex items-center justify-between gap-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lawFirm.adres}, ${lawFirm.kodPocztowy} ${lawFirm.miasto}, Polska`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors font-medium flex items-center gap-1"
            >
              <Globe className="h-3.5 w-3.5" />
              Otwórz w Google Maps
            </a>
            <Button variant="outline" size="sm" onClick={() => setMapsDialogOpen(false)} className="rounded-xl">
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
