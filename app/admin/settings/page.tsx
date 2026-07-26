"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, Upload, Mail, MessageSquare, AlertCircle, CheckCircle2, Globe, Palette, Users, Star, CreditCard, BarChart3, Settings as SettingsIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { Checkbox } from "@/components/ui/checkbox"
import { Category } from "@/types/categories"

interface Settings {
  favicon?: {
    value: string
    description: string | null
  }
  ogTitle?: {
    value: string
    description: string | null
  }
  ogDescription?: {
    value: string
    description: string | null
  }
  ogImage?: {
    value: string
    description: string | null
  }
  maxLawFirmCategories: {
    value: string
    description: string | null
  }
  siteName: {
    value: string
    description: string | null
  }
  contactEmail: {
    value: string
    description: string | null
  }
  supportEmail: {
    value: string
    description: string | null
  }
  reviewsPerPage: {
    value: string
    description: string | null
  }
  minReviewLength: {
    value: string
    description: string | null
  }
  featuredCategoriesLimit: {
    value: string
    description: string | null
  }
  maxLawFirmTags: {
    value: string
    description: string | null
  }
  showExpertTutorial?: {
    value: string
    description: string | null
  }
  autoApproveTestPayment?: {
    value: string
    description: string | null
  }
  enablePaymentTest?: {
    value: string
    description: string | null
  }
  enablePaymentPrzelewy24?: {
    value: string
    description: string | null
  }
  enablePaymentPayU?: {
    value: string
    description: string | null
  }
  enablePaymentTpay?: {
    value: string
    description: string | null
  }
  enablePaymentPrzelew?: {
    value: string
    description: string | null
  }
  deleteReviewCostRating1?: {
    value: string
    description: string | null
  }
  deleteReviewCostRating2?: {
    value: string
    description: string | null
  }
  deleteReviewCostRating3?: {
    value: string
    description: string | null
  }
  enableUserSelectionOnLogin?: {
    value: string
    description: string | null
  }
  smsMode?: {
    value: string
    description: string | null
  }
  smsapiSender?: {
    value: string
    description: string | null
  }
  smsapiToken?: {
    value: string
    description: string | null
  }
  /** Stan wyliczony po stronie serwera (tylko do odczytu, JSON). */
  smsapiStatus?: {
    value: string
    description: string | null
  }
  ksefEnabled?: {
    value: string
    description: string | null
  }
  ksefNip?: {
    value: string
    description: string | null
  }
  ksefToken?: {
    value: string
    description: string | null
  }
  ksefEnv?: {
    value: string
    description: string | null
  }
  showChatAssistant?: {
    value: string
    description: string | null
  }
  autoGrantBusinessPackage?: {
    value: string
    description: string | null
  }
  geographicHierarchy?: {
    value: string
    description: string | null
  }
  emailServerHost?: {
    value: string
    description: string | null
  }
  emailServerPort?: {
    value: string
    description: string | null
  }
  emailServerUser?: {
    value: string
    description: string | null
  }
  emailServerPassword?: {
    value: string
    description: string | null
  }
  emailFrom?: {
    value: string
    description: string | null
  }
  emailFromName?: {
    value: string
    description: string | null
  }
  emailLogToMails?: {
    value: string
    description: string | null
  }
  homepageConsultedCategories?: {
    value: string
    description: string | null
  }
  promoteConsultedImmediately?: {
    value: string
    description: string | null
  }
  publicItemsPerPage?: {
    value: string
    description: string | null
  }
  footerCopyrightText?: {
    value: string
    description: string | null
  }
  footerSocialFacebook?: {
    value: string
    description: string | null
  }
  footerSocialTwitter?: {
    value: string
    description: string | null
  }
  footerSocialLinkedin?: {
    value: string
    description: string | null
  }
  footerSocialYoutube?: {
    value: string
    description: string | null
  }
  footerSocialInstagram?: {
    value: string
    description: string | null
  }
  googleAnalyticsId?: {
    value: string
    description: string | null
  }
  googleAnalyticsEnabled?: {
    value: string
    description: string | null
  }
  comingSoonMode?: {
    value: string
    description: string | null
  }
  caseCreationOtpEnabled?: {
    value: string
    description: string | null
  }
  pointsToPlnRatio?: {
    value: string
    description: string | null
  }
}

/** Stan konfiguracji SMS wyliczony przez serwer (klucz `smsapiStatus`). */
interface SmsApiStatus {
  /** Czy przy obecnych ustawieniach SMS-y NIE są realnie wysyłane. */
  simulated: boolean
  /** Skąd pochodzi token: z panelu, z ENV, albo go nie ma. */
  tokenSource: "settings" | "env" | "none"
  sender: string
  apiUrl: string
  nodeEnv: string
}


export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [maxCategories, setMaxCategories] = useState("10")
  const [pointsToPlnRatio, setPointsToPlnRatio] = useState("1")
  const [siteName, setSiteName] = useState("Prosta Sprawa")
  const [contactEmail, setContactEmail] = useState("kontakt@prostasprawa.pl")
  const [supportEmail, setSupportEmail] = useState("pomoc@prostasprawa.pl")
  const [reviewsPerPage, setReviewsPerPage] = useState("10")
  const [publicItemsPerPage, setPublicItemsPerPage] = useState("12")
  const [minReviewLength, setMinReviewLength] = useState("50")
  const [featuredCategoriesLimit, setFeaturedCategoriesLimit] = useState("8")
  const [maxTags, setMaxTags] = useState("5")
  const [showExpertTutorial, setShowExpertTutorial] = useState("false")
  const [autoApproveTestPayment, setAutoApproveTestPayment] = useState("true")
  const [enablePaymentTest, setEnablePaymentTest] = useState("true")
  const [enablePaymentPrzelewy24, setEnablePaymentPrzelewy24] = useState("true")
  const [enablePaymentPayU, setEnablePaymentPayU] = useState("true")
  const [enablePaymentTpay, setEnablePaymentTpay] = useState("true")
  const [enablePaymentPrzelew, setEnablePaymentPrzelew] = useState("true")
  const [deleteCost1, setDeleteCost1] = useState("500")
  const [deleteCost2, setDeleteCost2] = useState("300")
  const [deleteCost3, setDeleteCost3] = useState("100")
  const [enableUserSelectionOnLogin, setEnableUserSelectionOnLogin] = useState("true")
  const [ksefEnabled, setKsefEnabled] = useState("false")
  const [ksefNip, setKsefNip] = useState("1234567890")
  const [ksefToken, setKsefToken] = useState("")
  const [ksefEnv, setKsefEnv] = useState("test")
  const [showChatAssistant, setShowChatAssistant] = useState("true")
  const [autoGrantBusinessPackage, setAutoGrantBusinessPackage] = useState("false")
  const [geographicHierarchy, setGeographicHierarchy] = useState("voivodeships")

  // SMTP Settings
  const [emailServerHost, setEmailServerHost] = useState("")
  const [emailServerPort, setEmailServerPort] = useState("587")
  const [emailServerUser, setEmailServerUser] = useState("")
  const [emailServerPassword, setEmailServerPassword] = useState("")
  const [emailFrom, setEmailFrom] = useState("")
  const [emailFromName, setEmailFromName] = useState("")
  const [emailLogToMails, setEmailLogToMails] = useState("false")

  // Weryfikacja SMS (SMSAPI)
  const [smsMode, setSmsMode] = useState("auto")
  const [smsapiSender, setSmsapiSender] = useState("Test")
  const [smsapiToken, setSmsapiToken] = useState("")
  const [smsapiStatus, setSmsapiStatus] = useState<SmsApiStatus | null>(null)

  // Stopka — dolny pasek
  const [footerCopyrightText, setFooterCopyrightText] = useState("2026 © ProstaSprawa.pl")
  const [footerSocialFacebook, setFooterSocialFacebook] = useState("https://facebook.com")
  const [footerSocialTwitter, setFooterSocialTwitter] = useState("https://twitter.com")
  const [footerSocialLinkedin, setFooterSocialLinkedin] = useState("https://linkedin.com")
  const [footerSocialYoutube, setFooterSocialYoutube] = useState("https://youtube.com")
  const [footerSocialInstagram, setFooterSocialInstagram] = useState("https://instagram.com")

  // Homepage Categories
  const [homepageConsultedCategories, setHomepageConsultedCategories] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [promoteConsultedImmediately, setPromoteConsultedImmediately] = useState("false")

  // Favicon i Open Graph (SEO)
  const [favicon, setFavicon] = useState("/favicon.png")
  const [ogTitle, setOgTitle] = useState("Prosta Sprawa - Platforma łącząca klientów z ekspertami prawnymi")
  const [ogDescription, setOgDescription] = useState("Znajdź prawnika lub eksperta prawnego w Twojej okolicy. Porównaj oferty i ceny usług prawnych.")
  const [ogImage, setOgImage] = useState("/favicon.png")
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false)
  const [isUploadingOgImage, setIsUploadingOgImage] = useState(false)

  // Google Analytics
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("")
  const [googleAnalyticsEnabled, setGoogleAnalyticsEnabled] = useState("false")

  // Coming Soon Mode
  const [comingSoonMode, setComingSoonMode] = useState("false")

  // Weryfikacja OTP przy dodawaniu sprawy
  const [caseCreationOtpEnabled, setCaseCreationOtpEnabled] = useState("false")


  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setMaxCategories(data.maxLawFirmCategories?.value || "10")
        setSiteName(data.siteName?.value || "Prosta Sprawa")
        setContactEmail(data.contactEmail?.value || "kontakt@prostasprawa.pl")
        setSupportEmail(data.supportEmail?.value || "pomoc@prostasprawa.pl")
        setReviewsPerPage(data.reviewsPerPage?.value || "10")
        setPublicItemsPerPage(data.publicItemsPerPage?.value || "12")
        setMinReviewLength(data.minReviewLength?.value || "50")
        setFavicon(data.favicon?.value || "/favicon.png")
        setOgTitle(data.ogTitle?.value || "Prosta Sprawa - Platforma łącząca klientów z ekspertami prawnymi")
        setOgDescription(data.ogDescription?.value || "Znajdź prawnika lub eksperta prawnego w Twojej okolicy. Porównaj oferty i ceny usług prawnych.")
        setOgImage(data.ogImage?.value || "/favicon.png")
        setFeaturedCategoriesLimit(data.featuredCategoriesLimit?.value || "8")
        setMaxTags(data.maxLawFirmTags?.value || "5")
        setShowExpertTutorial(data.showExpertTutorial?.value || "false")
        setAutoApproveTestPayment(data.autoApproveTestPayment?.value || "true")
        setEnablePaymentTest(data.enablePaymentTest?.value || "true")
        setEnablePaymentPrzelewy24(data.enablePaymentPrzelewy24?.value || "true")
        setEnablePaymentPayU(data.enablePaymentPayU?.value || "true")
        setEnablePaymentTpay(data.enablePaymentTpay?.value || "true")
        setEnablePaymentPrzelew(data.enablePaymentPrzelew?.value || "true")
        setDeleteCost1(data.deleteReviewCostRating1?.value || "500")
        setDeleteCost2(data.deleteReviewCostRating2?.value || "300")
        setDeleteCost3(data.deleteReviewCostRating3?.value || "100")
        setEnableUserSelectionOnLogin(data.enableUserSelectionOnLogin?.value || "true")
        setKsefEnabled(data.ksefEnabled?.value || "false")
        setKsefNip(data.ksefNip?.value || "1234567890")
        setKsefToken(data.ksefToken?.value || "")
        setKsefEnv(data.ksefEnv?.value || "test")
        setShowChatAssistant(data.showChatAssistant?.value || "true")
        setAutoGrantBusinessPackage(data.autoGrantBusinessPackage?.value || "false")
        setGeographicHierarchy(data.geographicHierarchy?.value || "voivodeships")

        // SMTP Settings
        setEmailServerHost(data.emailServerHost?.value || "")
        setEmailServerPort(data.emailServerPort?.value || "587")
        setEmailServerUser(data.emailServerUser?.value || "")
        setEmailServerPassword(data.emailServerPassword?.value || "")
        setEmailFrom(data.emailFrom?.value || "")
        setEmailFromName(data.emailFromName?.value || "")
        setEmailLogToMails(data.emailLogToMails?.value || "false")

        // Weryfikacja SMS (SMSAPI)
        setSmsMode(data.smsMode?.value || "auto")
        setSmsapiSender(data.smsapiSender?.value || "Test")
        setSmsapiToken(data.smsapiToken?.value || "")
        try {
          setSmsapiStatus(data.smsapiStatus ? JSON.parse(data.smsapiStatus.value) : null)
        } catch {
          setSmsapiStatus(null)
        }

        setPromoteConsultedImmediately(data.promoteConsultedImmediately?.value || "false")

        // Google Analytics
        setGoogleAnalyticsId(data.googleAnalyticsId?.value || "")
        setGoogleAnalyticsEnabled(data.googleAnalyticsEnabled?.value || "false")

        // Coming Soon Mode
        setComingSoonMode(data.comingSoonMode?.value || "false")

        // Weryfikacja OTP przy dodawaniu sprawy
        setCaseCreationOtpEnabled(data.caseCreationOtpEnabled?.value || "false")
        setPointsToPlnRatio(data.pointsToPlnRatio?.value || "1")

        // Stopka — dolny pasek (?? zamiast ||, bo pusty string = celowo ukryta ikona)
        setFooterCopyrightText(data.footerCopyrightText?.value ?? "2026 © ProstaSprawa.pl")
        setFooterSocialFacebook(data.footerSocialFacebook?.value ?? "https://facebook.com")
        setFooterSocialTwitter(data.footerSocialTwitter?.value ?? "https://twitter.com")
        setFooterSocialLinkedin(data.footerSocialLinkedin?.value ?? "https://linkedin.com")
        setFooterSocialYoutube(data.footerSocialYoutube?.value ?? "https://youtube.com")
        setFooterSocialInstagram(data.footerSocialInstagram?.value ?? "https://instagram.com")

        try {
          const parsed = JSON.parse(data.homepageConsultedCategories?.value || "[]")
          setHomepageConsultedCategories(Array.isArray(parsed) ? parsed : [])
        } catch {
          setHomepageConsultedCategories([])
        }

        // Pobierz kategorie
        const catRes = await fetch("/api/categories")
        if (catRes.ok) {
          const cats = await catRes.json()
          setAvailableCategories(cats.filter((c: Category) => c.aktywna && c.typ === "SPRAWY_PRYWATNE"))
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Nie udało się pobrać ustawień")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Walidacja
    const maxCategoriesNum = parseInt(maxCategories)
    if (isNaN(maxCategoriesNum) || maxCategoriesNum < 1 || maxCategoriesNum > 100) {
      toast.error("Maksymalna liczba kategorii musi być liczbą od 1 do 100")
      return
    }

    const maxTagsNum = parseInt(maxTags)
    if (isNaN(maxTagsNum) || maxTagsNum < 1 || maxTagsNum > 100) {
      toast.error("Maksymalna liczba słów kluczowych musi być liczbą od 1 do 100")
      return
    }

    const reviewsPerPageNum = parseInt(reviewsPerPage)
    if (isNaN(reviewsPerPageNum) || reviewsPerPageNum < 5 || reviewsPerPageNum > 50) {
      toast.error("Liczba opinii na stronę musi być liczbą od 5 do 50")
      return
    }

    const publicItemsPerPageNum = parseInt(publicItemsPerPage)
    if (isNaN(publicItemsPerPageNum) || publicItemsPerPageNum < 1 || publicItemsPerPageNum > 100) {
      toast.error("Liczba pozycji na stronę w kategoriach i wyszukiwarce musi być liczbą od 1 do 100")
      return
    }

    const minReviewLengthNum = parseInt(minReviewLength)
    if (isNaN(minReviewLengthNum) || minReviewLengthNum < 10 || minReviewLengthNum > 500) {
      toast.error("Minimalna długość opinii musi być liczbą od 10 do 500")
      return
    }

    const featuredCategoriesLimitNum = parseInt(featuredCategoriesLimit)
    if (isNaN(featuredCategoriesLimitNum) || featuredCategoriesLimitNum < 4 || featuredCategoriesLimitNum > 20) {
      toast.error("Limit wyróżnionych kategorii musi być liczbą od 4 do 20")
      return
    }

    if (!contactEmail || !supportEmail) {
      toast.error("Adresy email są wymagane")
      return
    }

    const deleteCost1Num = parseInt(deleteCost1)
    const deleteCost2Num = parseInt(deleteCost2)
    const deleteCost3Num = parseInt(deleteCost3)
    if (isNaN(deleteCost1Num) || deleteCost1Num < 0 || isNaN(deleteCost2Num) || deleteCost2Num < 0 || isNaN(deleteCost3Num) || deleteCost3Num < 0) {
      toast.error("Koszty usunięcia opinii muszą być liczbami większymi lub równymi 0")
      return
    }

    const pointsToPlnRatioNum = parseFloat(pointsToPlnRatio)
    if (isNaN(pointsToPlnRatioNum) || pointsToPlnRatioNum <= 0) {
      toast.error("Przelicznik punktów na PLN musi być liczbą większą od 0")
      return
    }

    if (ksefEnabled === "true") {
      const cleanNip = ksefNip.replace(/\D/g, "")
      if (cleanNip.length !== 10) {
        toast.error("NIP w konfiguracji KSeF musi mieć dokładnie 10 cyfr")
        return
      }
      if (!ksefToken) {
        toast.error("Token autoryzacyjny KSeF jest wymagany przy włączonej integracji")
        return
      }
    }

    if (emailServerHost) {
      const portNum = parseInt(emailServerPort)
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        toast.error("Port serwera SMTP musi być liczbą od 1 do 65535")
        return
      }
    }

    // Tryb produkcyjny bez tokenu = zablokowana rejestracja (SMS nie wyjdzie).
    // Token może pochodzić z ENV, więc bierzemy pod uwagę też stan z serwera.
    const smsTokenAvailable = Boolean(smsapiToken.trim()) || smsapiStatus?.tokenSource === "env"
    if (smsMode === "production" && !smsTokenAvailable) {
      toast.error("Tryb produkcyjny SMS wymaga tokenu SMSAPI (pole poniżej lub SMSAPI_TOKEN w ENV)")
      return
    }
    if (smsMode !== "simulation" && smsapiSender.trim().length > 11) {
      toast.error("Nazwa nadawcy SMS może mieć maksymalnie 11 znaków")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: {
            maxLawFirmCategories: {
              value: maxCategories,
              description: "Maksymalna liczba kategorii, które może zaznaczyć ekspert",
            },
            siteName: {
              value: siteName,
              description: "Nazwa serwisu wyświetlana w nagłówku i meta tagach",
            },
            contactEmail: {
              value: contactEmail,
              description: "Email kontaktowy wyświetlany na stronie",
            },
            supportEmail: {
              value: supportEmail,
              description: "Email wsparcia technicznego",
            },
            reviewsPerPage: {
              value: reviewsPerPage,
              description: "Liczba opinii wyświetlanych na jednej stronie",
            },
            publicItemsPerPage: {
              value: publicItemsPerPage,
              description: "Liczba wyświetlanych pozycji na stronie w kategoriach oraz wyszukiwarce",
            },
            minReviewLength: {
              value: minReviewLength,
              description: "Minimalna długość opinii w znakach",
            },
            featuredCategoriesLimit: {
              value: featuredCategoriesLimit,
              description: "Maksymalna liczba wyróżnionych kategorii na stronie głównej",
            },
            maxLawFirmTags: {
              value: maxTags,
              description: "Maksymalna liczba słów kluczowych dla ekspertów bez aktywnego pakietu",
            },
            showExpertTutorial: {
              value: showExpertTutorial,
              description: "Czy wyświetlać samouczek (krok po kroku) w panelu eksperta",
            },
            autoApproveTestPayment: {
              value: autoApproveTestPayment,
              description: "Czy płatność testowa (TEST) ma być automatycznie akceptowana przez system (status ZAPLACONE)",
            },
            enablePaymentTest: {
              value: enablePaymentTest,
              description: "Czy płatność testowa (TEST) ma być dostępna jako metoda płatności",
            },
            enablePaymentPrzelewy24: {
              value: enablePaymentPrzelewy24,
              description: "Czy płatność przez Przelewy24 ma być dostępna jako metoda płatności",
            },
            enablePaymentPayU: {
              value: enablePaymentPayU,
              description: "Czy płatność przez PayU ma być dostępna jako metoda płatności",
            },
            enablePaymentTpay: {
              value: enablePaymentTpay,
              description: "Czy płatność przez Tpay ma być dostępna jako metoda płatności",
            },
            enablePaymentPrzelew: {
              value: enablePaymentPrzelew,
              description: "Czy płatność przelewem tradycyjnym ma być dostępna jako metoda płatności",
            },
            deleteReviewCostRating1: {
              value: deleteCost1,
              description: "Koszt usunięcia opinii z oceną 1★ w punktach",
            },
            deleteReviewCostRating2: {
              value: deleteCost2,
              description: "Koszt usunięcia opinii z oceną 2★ w punktach",
            },
            deleteReviewCostRating3: {
              value: deleteCost3,
              description: "Koszt usunięcia opinii z oceną 3★ w punktach",
            },
            pointsToPlnRatio: {
              value: pointsToPlnRatio,
              description: "Przelicznik punktów na złotówki w systemie (1 punkt = X PLN)",
            },
            enableUserSelectionOnLogin: {
              value: enableUserSelectionOnLogin,
              description: "Czy włączyć listę wyboru użytkowników na stronie logowania",
            },
            ksefEnabled: {
              value: ksefEnabled,
              description: "Czy włączyć automatyczne wystawianie faktur przez KSeF 2.0",
            },
            ksefNip: {
              value: ksefNip,
              description: "NIP sprzedawcy (platformy) dla systemu KSeF",
            },
            ksefToken: {
              value: ksefToken,
              description: "Token autoryzacyjny KSeF wygenerowany w Aplikacji Podatnika",
            },
            ksefEnv: {
              value: ksefEnv,
              description: "Środowisko KSeF: test (testowe/sandbox) lub prod (produkcyjne)",
            },
            showChatAssistant: {
              value: showChatAssistant,
              description: "Czy wyświetlać asystenta czatu (ChatAssistant) na stronie",
            },
            autoGrantBusinessPackage: {
              value: autoGrantBusinessPackage,
              description: "Czy automatycznie przyznawać nowo zarejestrowanym ekspertom darmowy 3-miesięczny pakiet Biznes",
            },
            geographicHierarchy: {
              value: geographicHierarchy,
              description: "Hierarchia geograficzna używana w formularzach i filtrach: voivodeships (województwa), counties (powiaty), cities (miasta)",
            },
            favicon: {
              value: favicon,
              description: "Adres URL lub ścieżka do faviconu strony",
            },
            ogTitle: {
              value: ogTitle,
              description: "Domyślny tytuł Open Graph dla strony głównej i stron publicznych",
            },
            ogDescription: {
              value: ogDescription,
              description: "Domyślny opis Open Graph dla strony głównej i stron publicznych",
            },
            ogImage: {
              value: ogImage,
              description: "Adres URL lub ścieżka do domyślnego obrazka Open Graph (zalecane 1200x630)",
            },
            emailServerHost: {
              value: emailServerHost,
              description: "Adres hosta serwera SMTP",
            },
            emailServerPort: {
              value: emailServerPort,
              description: "Port serwera SMTP",
            },
            emailServerUser: {
              value: emailServerUser,
              description: "Nazwa użytkownika konta SMTP",
            },
            emailServerPassword: {
              value: emailServerPassword,
              description: "Hasło konta SMTP",
            },
            emailFrom: {
              value: emailFrom,
              description: "Adres email nadawcy",
            },
            emailFromName: {
              value: emailFromName,
              description: "Wyświetlana nazwa nadawcy (pojawia się zamiast adresu email w kliencie pocztowym)",
            },
            emailLogToMails: {
              value: emailLogToMails,
              description: "Czy przekierowywać wszystkie e-maile do logów (/mails) zamiast wysyłać przez SMTP",
            },
            smsMode: {
              value: smsMode,
              description:
                "Tryb wysyłki SMS: auto (decyduje środowisko), simulation (SMS nie wychodzi, kod widoczny w UI), production (realna wysyłka)",
            },
            smsapiSender: {
              value: smsapiSender.trim(),
              description: "Nazwa nadawcy SMS zweryfikowana w panelu SMSAPI (maks. 11 znaków)",
            },
            smsapiToken: {
              value: smsapiToken.trim(),
              description: "Token OAuth z panelu SMSAPI (pusty = używany jest SMSAPI_TOKEN z ENV)",
            },
            homepageConsultedCategories: {
              value: JSON.stringify(homepageConsultedCategories),
              description: "Lista ID kategorii wyświetlanych w sekcji Najczęściej Konsultowane na stronie głównej",
            },
            promoteConsultedImmediately: {
              value: promoteConsultedImmediately,
              description: "Tryb testowy: promocje 'Najczęściej konsultowane kategorie' są aktywowane natychmiast (od teraz) zamiast od pierwszego dnia kolejnego miesiąca",
            },
            footerCopyrightText: {
              value: footerCopyrightText,
              description: "Tekst copyright wyświetlany w dolnym pasku stopki",
            },
            footerSocialFacebook: {
              value: footerSocialFacebook,
              description: "Adres URL profilu Facebook w dolnym pasku stopki (pusty = ukryta ikona)",
            },
            footerSocialTwitter: {
              value: footerSocialTwitter,
              description: "Adres URL profilu Twitter/X w dolnym pasku stopki (pusty = ukryta ikona)",
            },
            footerSocialLinkedin: {
              value: footerSocialLinkedin,
              description: "Adres URL profilu LinkedIn w dolnym pasku stopki (pusty = ukryta ikona)",
            },
            footerSocialYoutube: {
              value: footerSocialYoutube,
              description: "Adres URL kanału YouTube w dolnym pasku stopki (pusty = ukryta ikona)",
            },
            footerSocialInstagram: {
              value: footerSocialInstagram,
              description: "Adres URL profilu Instagram w dolnym pasku stopki (pusty = ukryta ikona)",
            },
            googleAnalyticsId: {
              value: googleAnalyticsId,
              description: "Identyfikator pomiaru Google Analytics (np. G-XXXXXXXXXX lub UA-XXXXXXXX-X)",
            },
            googleAnalyticsEnabled: {
              value: googleAnalyticsEnabled,
              description: "Czy śledzenie Google Analytics jest włączone",
            },
            comingSoonMode: {
              value: comingSoonMode,
              description: "Tryb 'Coming Soon' - zastępuje stronę główną stroną zapowiedzi (pozostałe podstrony pozostają dostępne)",
            },
            caseCreationOtpEnabled: {
              value: caseCreationOtpEnabled,
              description: "Czy wymagać od klienta dodatkowej weryfikacji jednorazowym kodem wysłanym mailem przed utworzeniem nowej sprawy",
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Nie udało się zapisać ustawień")
      }

      toast.success("Ustawienia zostały zapisane")
      fetchSettings()
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Nie udało się zapisać ustawień")
    } finally {
      setSaving(false)
    }
  }

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingFavicon(true)
    const formDataToSend = new FormData()
    formDataToSend.append("file", file)

    try {
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload favicon")
      }

      const data = await response.json()
      setFavicon(data.url)
      toast.success("Favicon został przesłany pomyślnie!")
    } catch (error) {
      console.error("Error uploading favicon:", error)
      toast.error(error instanceof Error ? error.message : "Błąd podczas przesyłania faviconu")
    } finally {
      setIsUploadingFavicon(false)
      e.target.value = ""
    }
  }

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingOgImage(true)
    const formDataToSend = new FormData()
    formDataToSend.append("file", file)

    try {
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload Open Graph image")
      }

      const data = await response.json()
      setOgImage(data.url)
      toast.success("Obraz Open Graph został przesłany pomyślnie!")
    } catch (error) {
      console.error("Error uploading Open Graph image:", error)
      toast.error(error instanceof Error ? error.message : "Błąd podczas przesyłania obrazu Open Graph")
    } finally {
      setIsUploadingOgImage(false)
      e.target.value = ""
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Ustawienia systemu" subtitle="Zarządzaj globalnymi ustawieniami platformy" />
      <Separator />

      <Tabs defaultValue="general" className="space-y-6">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 border-b">
          <TabsList className="inline-flex h-auto w-full sm:w-auto flex-wrap gap-1 bg-muted/50 p-1.5">
            <TabsTrigger value="general" className="gap-2 px-3 py-2 data-[state=active]:bg-background">
              <SettingsIcon className="h-4 w-4" />
              <span>Ogólne</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 px-3 py-2 data-[state=active]:bg-background">
              <Palette className="h-4 w-4" />
              <span>Wygląd i SEO</span>
            </TabsTrigger>
            <TabsTrigger value="experts" className="gap-2 px-3 py-2 data-[state=active]:bg-background">
              <Users className="h-4 w-4" />
              <span>Eksperci</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 px-3 py-2 data-[state=active]:bg-background">
              <Star className="h-4 w-4" />
              <span>Opinie</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2 px-3 py-2 data-[state=active]:bg-background">
              <Mail className="h-4 w-4" />
              <span>E-mail (SMTP)</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="gap-2 px-3 py-2 data-[state=active]:bg-background">
              <MessageSquare className="h-4 w-4" />
              <span>SMS</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 px-3 py-2 data-[state=active]:bg-background">
              <CreditCard className="h-4 w-4" />
              <span>Płatności i KSeF</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ============== TAB 1: OGÓLNE ============== */}
        <TabsContent value="general" className="space-y-6 m-0">
          {/* Ustawienia ogólne */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Identyfikacja serwisu
              </CardTitle>
              <CardDescription>
                Podstawowe informacje o platformie wyświetlane użytkownikom.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">
                  Nazwa serwisu
                </Label>
                <Input
                  id="siteName"
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Prosta Sprawa"
                />
                <p className="text-sm text-muted-foreground">
                  Nazwa wyświetlana w nagłówku strony i meta tagach
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">
                    Email kontaktowy
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="kontakt@prostasprawa.pl"
                  />
                  <p className="text-sm text-muted-foreground">
                    Główny adres kontaktowy
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportEmail">
                    Email wsparcia
                  </Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="pomoc@prostasprawa.pl"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email wsparcia technicznego
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hierarchia geograficzna */}
          <Card>
            <CardHeader>
              <CardTitle>Hierarchia geograficzna</CardTitle>
              <CardDescription>
                Wybierz poziom podziału administracyjnego używany w formularzach rejestracji ekspertów, filtrach wyszukiwania i innych miejscach wymagających lokalizacji.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant={geographicHierarchy === "voivodeships" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setGeographicHierarchy("voivodeships")}
                >
                  Województwa
                </Button>
                <Button
                  type="button"
                  variant={geographicHierarchy === "counties" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setGeographicHierarchy("counties")}
                >
                  Powiaty
                </Button>
                <Button
                  type="button"
                  variant={geographicHierarchy === "cities" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setGeographicHierarchy("cities")}
                >
                  Miasta
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Aktualny poziom: <span className="font-semibold text-foreground">
                  {geographicHierarchy === "voivodeships" && "Województwa"}
                  {geographicHierarchy === "counties" && "Powiaty"}
                  {geographicHierarchy === "cities" && "Miasta"}
                </span>. Zmiana wpływa na formularze i wyniki wyszukiwania ekspertów według lokalizacji.
              </p>
            </CardContent>
          </Card>

          {/* Ustawienia logowania */}
          <Card>
            <CardHeader>
              <CardTitle>Logowanie</CardTitle>
              <CardDescription>
                Konfiguracja formularza logowania w serwisie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="enableUserSelectionOnLogin" className="text-base font-semibold">
                    Wybór użytkownika przy logowaniu
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Włącza/wyłącza możliwość szybkiego wyboru użytkownika testowego z listy rozwijanej zamiast wpisywania adresu email.
                  </p>
                </div>
                <Switch
                  id="enableUserSelectionOnLogin"
                  checked={enableUserSelectionOnLogin === "true"}
                  onCheckedChange={(checked) => setEnableUserSelectionOnLogin(checked ? "true" : "false")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Weryfikacja OTP przy dodawaniu sprawy */}
          <Card>
            <CardHeader>
              <CardTitle>Weryfikacja dodawania sprawy</CardTitle>
              <CardDescription>
                Dodatkowe zabezpieczenie formularza dodawania sprawy (/panel-klienta/sprawy/dodaj) w panelu klienta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="caseCreationOtpEnabled" className="text-base font-semibold">
                    Weryfikacja kodem email przed dodaniem sprawy
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Po włączeniu klient przed utworzeniem sprawy musi podać jednorazowy kod przesłany na jego adres email. Kod jest ważny przez 10 minut.
                  </p>
                </div>
                <Switch
                  id="caseCreationOtpEnabled"
                  checked={caseCreationOtpEnabled === "true"}
                  onCheckedChange={(checked) => setCaseCreationOtpEnabled(checked ? "true" : "false")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tryb Coming Soon */}
          <Card className="border-amber-500/20 bg-amber-500/[0.01]">
            <CardHeader>
              <CardTitle className="text-amber-600 dark:text-amber-400">Tryb Coming Soon</CardTitle>
              <CardDescription>
                Zastąp stronę główną stroną zapowiedzi (&quot;Już wkrótce startujemy&quot; z odliczaniem).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between space-y-0 rounded-lg border border-amber-500/30 bg-amber-500/[0.04] p-4 hover:bg-amber-500/[0.07] transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="comingSoonMode" className="text-base font-semibold">
                    Włącz tryb Coming Soon
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Po włączeniu strona główna (/) wyświetla stronę zapowiedzi zamiast standardowej zawartości. Pozostałe podstrony pozostają dostępne po bezpośrednim podaniu adresu.
                  </p>
                </div>
                <Switch
                  id="comingSoonMode"
                  checked={comingSoonMode === "true"}
                  onCheckedChange={(checked) => setComingSoonMode(checked ? "true" : "false")}
                />
              </div>
              {comingSoonMode === "true" && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 mt-4">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Tryb Coming Soon jest aktywny — odwiedzający stronę główną zobaczą wyłącznie stronę zapowiedzi.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============== TAB 2: WYGLĄD I SEO ============== */}
        <TabsContent value="appearance" className="space-y-6 m-0">
          {/* Google Analytics */}
          <Card className="border-blue-500/20 bg-blue-500/[0.01]">
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Google Analytics (GA4)
              </CardTitle>
              <CardDescription>
                Skonfiguruj śledzenie analityki w serwisie za pomocą Google Analytics 4 (Measurement ID).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-4 rounded-lg border p-4 bg-background">
                <div className="space-y-0.5">
                  <Label className="text-base">Włącz śledzenie Google Analytics</Label>
                  <p className="text-xs text-muted-foreground">
                    Gdy opcja jest włączona, skrypt Google Analytics jest automatycznie dołączany na stronach publicznych.
                  </p>
                </div>
                <Switch
                  checked={googleAnalyticsEnabled === "true"}
                  onCheckedChange={(checked) => setGoogleAnalyticsEnabled(checked ? "true" : "false")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ga-id">Identyfikator pomiaru Google Analytics (Measurement ID / Tracking ID)</Label>
                <Input
                  id="ga-id"
                  type="text"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  placeholder="G-XXXXXXXXXX lub UA-XXXXXXXX-X"
                />
                <p className="text-xs text-muted-foreground">
                  Wklej unikalny identyfikator strumienia danych z panelu Google Analytics (np. <strong>G-ABC123XYZ</strong>).
                </p>
              </div>

              {googleAnalyticsEnabled === "true" && !googleAnalyticsId.trim() && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Śledzenie jest włączone, ale nie podano Identyfikatora pomiaru Google Analytics. Wprowadź poprawny identyfikator G-XXXXXXXXXX i zapisz ustawienia.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favicon i Open Graph (SEO) */}
          <Card className="border-teal-500/20 bg-teal-500/[0.01]">
            <CardHeader>
              <CardTitle className="text-teal-600 dark:text-teal-400 flex items-center gap-2">
                Favicon i Open Graph (SEO)
              </CardTitle>
              <CardDescription>
                Zarządzaj faviconem serwisu oraz domyślnymi tagami Open Graph dla strony głównej i podstron publicznych.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Favicon Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                <div className="md:col-span-1 flex flex-col items-center justify-center border border-border rounded-lg p-4 bg-background">
                  <Label className="mb-2 text-center text-xs font-semibold text-muted-foreground uppercase">Favicon Podgląd</Label>
                  <div className="w-16 h-16 rounded border border-border/80 bg-neutral-900 flex items-center justify-center overflow-hidden p-1 shadow-sm">
                    {favicon ? (
                      <img src={favicon} alt="Favicon preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Brak</span>
                    )}
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground mt-2">Zalecany format PNG lub ICO</p>
                </div>

                <div className="md:col-span-3 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="favicon-url">URL Faviconu</Label>
                    <div className="flex gap-2">
                      <Input
                        id="favicon-url"
                        type="text"
                        value={favicon}
                        onChange={(e) => setFavicon(e.target.value)}
                        placeholder="/favicon.png"
                      />
                      <div className="relative">
                        <input
                          id="favicon-file"
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconUpload}
                          className="hidden"
                          disabled={isUploadingFavicon}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("favicon-file")?.click()}
                          disabled={isUploadingFavicon}
                          className="whitespace-nowrap flex gap-2"
                        >
                          {isUploadingFavicon ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Wgraj plik
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ścieżka relatywna (np. /favicon.png) lub pełny adres URL.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Open Graph Title */}
              <div className="space-y-2">
                <Label htmlFor="ogTitle">Domyślny Tytuł Open Graph (og:title)</Label>
                <Input
                  id="ogTitle"
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="Prosta Sprawa - ..."
                />
                <p className="text-xs text-muted-foreground">
                  Używany jako domyślny tytuł przy udostępnianiu strony w mediach społecznościowych (np. Facebook, Twitter, Slack).
                </p>
              </div>

              {/* Open Graph Description */}
              <div className="space-y-2">
                <Label htmlFor="ogDescription">Domyślny Opis Open Graph (og:description)</Label>
                <Textarea
                  id="ogDescription"
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  placeholder="Znajdź prawnika..."
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  Opis wyświetlany pod tytułem udostępnionej karty w mediach społecznościowych. Zalecane max. 155-160 znaków.
                </p>
              </div>

              {/* Open Graph Image */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                <div className="md:col-span-1 flex flex-col items-center justify-center border border-border rounded-lg p-4 bg-background">
                  <Label className="mb-2 text-center text-xs font-semibold text-muted-foreground uppercase">Obraz OG Podgląd</Label>
                  <div className="w-full aspect-[1.91/1] rounded border border-border/80 bg-neutral-900 flex items-center justify-center overflow-hidden shadow-sm">
                    {ogImage ? (
                      <img src={ogImage} alt="OG Image preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Brak</span>
                    )}
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground mt-2">Zalecany rozmiar 1200x630 (1.91:1)</p>
                </div>

                <div className="md:col-span-3 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ogImage-url">URL Obrazu Open Graph (og:image)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ogImage-url"
                        type="text"
                        value={ogImage}
                        onChange={(e) => setOgImage(e.target.value)}
                        placeholder="/favicon.png"
                      />
                      <div className="relative">
                        <input
                          id="ogImage-file"
                          type="file"
                          accept="image/*"
                          onChange={handleOgImageUpload}
                          className="hidden"
                          disabled={isUploadingOgImage}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("ogImage-file")?.click()}
                          disabled={isUploadingOgImage}
                          className="whitespace-nowrap flex gap-2"
                        >
                          {isUploadingOgImage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Wgraj plik
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Główny obraz reprezentujący witrynę po udostępnieniu. Powinien mieć wymiary 1200x630px dla optymalnego wyglądu.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strona główna - Najczęściej konsultowane kategorie */}
          <Card>
            <CardHeader>
              <CardTitle>Najczęściej konsultowane kategorie</CardTitle>
              <CardDescription>
                Wybierz kategorie, które mają być wyświetlane w sekcji "Najczęściej konsultowane" na stronie głównej.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ładowanie kategorii...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={homepageConsultedCategories.includes(cat.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setHomepageConsultedCategories([...homepageConsultedCategories, cat.id])
                          } else {
                            setHomepageConsultedCategories(homepageConsultedCategories.filter((id) => id !== cat.id))
                          }
                        }}
                      />
                      <Label htmlFor={`cat-${cat.id}`} className="font-normal cursor-pointer">
                        {cat.nazwa}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Zaleca się wybranie od 4 do 6 kategorii. Zaznaczone kategorie zostaną użyte jako zakładki na stronie głównej.
              </p>

              <Separator className="my-2" />

              <div className="flex items-center justify-between space-y-0 rounded-lg border border-amber-500/30 bg-amber-500/[0.04] p-4 hover:bg-amber-500/[0.07] transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="promoteConsultedImmediately" className="text-base font-semibold flex items-center gap-2">
                    Natychmiastowe włączanie promocji (tryb testowy)
                    <span className="text-sm bg-amber-500 text-amber-950 px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">TEST</span>
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Po włączeniu promocje miesięczne („Najczęściej konsultowane kategorie" oraz „Polecani prawnicy i adwokaci") zakupione w panelu eksperta na bieżący miesiąc stają się aktywne od razu (od teraz), a nie dopiero od pierwszego dnia kolejnego miesiąca. Przeznaczone wyłącznie do testów.
                  </p>
                </div>
                <Switch
                  id="promoteConsultedImmediately"
                  checked={promoteConsultedImmediately === "true"}
                  onCheckedChange={(checked) => setPromoteConsultedImmediately(checked ? "true" : "false")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ustawienia wyświetlania */}
          <Card>
            <CardHeader>
              <CardTitle>Elementy interfejsu</CardTitle>
              <CardDescription>
                Konfiguracja elementów wyświetlanych na stronie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="featuredCategoriesLimit">
                  Limit wyróżnionych kategorii
                </Label>
                <Input
                  id="featuredCategoriesLimit"
                  type="number"
                  min="4"
                  max="20"
                  value={featuredCategoriesLimit}
                  onChange={(e) => setFeaturedCategoriesLimit(e.target.value)}
                  placeholder="8"
                />
                <p className="text-sm text-muted-foreground">
                  Liczba wyróżnionych kategorii na stronie głównej (4-20)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicItemsPerPage">
                  Liczba pozycji na stronę (Kategorie i Wyszukiwarka)
                </Label>
                <Input
                  id="publicItemsPerPage"
                  type="number"
                  min="1"
                  max="100"
                  value={publicItemsPerPage}
                  onChange={(e) => setPublicItemsPerPage(e.target.value)}
                  placeholder="12"
                />
                <p className="text-sm text-muted-foreground">
                  Liczba adwokatów/ekspertów wyświetlanych na jednej stronie w widoku kategorii oraz w wynikach wyszukiwania (1-100)
                </p>
              </div>

              <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="showExpertTutorial" className="text-base font-semibold">
                    Samouczek w panelu eksperta
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Włącza/wyłącza interaktywny samouczek krok po kroku dla zalogowanych ekspertów w ich panelu.
                  </p>
                </div>
                <Switch
                  id="showExpertTutorial"
                  checked={showExpertTutorial === "true"}
                  onCheckedChange={(checked) => setShowExpertTutorial(checked ? "true" : "false")}
                />
              </div>

              <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="showChatAssistant" className="text-base font-semibold">
                    Asystent czatu (AI Chat Assistant)
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Włącza/wyłącza wyświetlanie pływającego okna asystenta czatu (ChatAssistant) w prawym dolnym rogu na stronach publicznych.
                  </p>
                </div>
                <Switch
                  id="showChatAssistant"
                  checked={showChatAssistant === "true"}
                  onCheckedChange={(checked) => setShowChatAssistant(checked ? "true" : "false")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stopka — dolny pasek */}
          <Card>
            <CardHeader>
              <CardTitle>Stopka — dolny pasek</CardTitle>
              <CardDescription>
                Tekst copyright oraz linki do mediów społecznościowych wyświetlane w dolnym pasku stopki na stronach publicznych. Pozostaw adres URL pusty, aby ukryć daną ikonę.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="footerCopyrightText">Tekst copyright</Label>
                <Input
                  id="footerCopyrightText"
                  type="text"
                  value={footerCopyrightText}
                  onChange={(e) => setFooterCopyrightText(e.target.value)}
                  placeholder="2026 © ProstaSprawa.pl"
                />
                <p className="text-sm text-muted-foreground">
                  Tekst wyświetlany po lewej stronie dolnego paska stopki
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footerSocialFacebook">Facebook</Label>
                  <Input
                    id="footerSocialFacebook"
                    type="url"
                    value={footerSocialFacebook}
                    onChange={(e) => setFooterSocialFacebook(e.target.value)}
                    placeholder="https://facebook.com/prostasprawa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerSocialTwitter">Twitter / X</Label>
                  <Input
                    id="footerSocialTwitter"
                    type="url"
                    value={footerSocialTwitter}
                    onChange={(e) => setFooterSocialTwitter(e.target.value)}
                    placeholder="https://twitter.com/prostasprawa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerSocialLinkedin">LinkedIn</Label>
                  <Input
                    id="footerSocialLinkedin"
                    type="url"
                    value={footerSocialLinkedin}
                    onChange={(e) => setFooterSocialLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/company/prostasprawa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerSocialYoutube">YouTube</Label>
                  <Input
                    id="footerSocialYoutube"
                    type="url"
                    value={footerSocialYoutube}
                    onChange={(e) => setFooterSocialYoutube(e.target.value)}
                    placeholder="https://youtube.com/@prostasprawa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerSocialInstagram">Instagram</Label>
                  <Input
                    id="footerSocialInstagram"
                    type="url"
                    value={footerSocialInstagram}
                    onChange={(e) => setFooterSocialInstagram(e.target.value)}
                    placeholder="https://instagram.com/prostasprawa"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============== TAB 3: EKSPERCI ============== */}
        <TabsContent value="experts" className="space-y-6 m-0">
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia eksperta</CardTitle>
              <CardDescription>
                Konfiguracja parametrów dla ekspertów prawnych
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxCategories">
                    Maks. liczba kategorii
                  </Label>
                  <Input
                    id="maxCategories"
                    type="number"
                    min="1"
                    max="100"
                    value={maxCategories}
                    onChange={(e) => setMaxCategories(e.target.value)}
                    placeholder="10"
                  />
                  <p className="text-sm text-muted-foreground">
                    Ile maks. kategorii może zaznaczyć ekspert w zakresie usług
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTags">
                    Maks. liczba słów kluczowych
                  </Label>
                  <Input
                    id="maxTags"
                    type="number"
                    min="1"
                    max="100"
                    value={maxTags}
                    onChange={(e) => setMaxTags(e.target.value)}
                    placeholder="5"
                  />
                  <p className="text-sm text-muted-foreground">
                    Ile maks. tagów może dodać ekspert bez aktywnego pakietu
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pointsToPlnRatio">
                    Przelicznik punktów na PLN (1 pkt = X zł)
                  </Label>
                  <Input
                    id="pointsToPlnRatio"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={pointsToPlnRatio}
                    onChange={(e) => setPointsToPlnRatio(e.target.value)}
                    placeholder="1.0"
                  />
                  <p className="text-sm text-muted-foreground">
                    Wartość 1 punktu w PLN (domyślnie 1:1, czyli 1 pkt = 1 PLN)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="autoGrantBusinessPackage" className="text-base font-semibold">
                    Darmowy pakiet Biznes dla nowych ekspertów
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Po włączeniu każdy nowo zarejestrowany ekspert otrzyma automatycznie pakiet Biznes na okres 3 miesięcy od momentu rejestracji.
                  </p>
                </div>
                <Switch
                  id="autoGrantBusinessPackage"
                  checked={autoGrantBusinessPackage === "true"}
                  onCheckedChange={(checked) => setAutoGrantBusinessPackage(checked ? "true" : "false")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============== TAB 4: OPINIE ============== */}
        <TabsContent value="reviews" className="space-y-6 m-0">
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia opinii</CardTitle>
              <CardDescription>
                Konfiguracja systemu opinii i ocen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reviewsPerPage">
                    Liczba opinii na stronę
                  </Label>
                  <Input
                    id="reviewsPerPage"
                    type="number"
                    min="5"
                    max="50"
                    value={reviewsPerPage}
                    onChange={(e) => setReviewsPerPage(e.target.value)}
                    placeholder="10"
                  />
                  <p className="text-sm text-muted-foreground">
                    Ile opinii wyświetlać na jednej stronie (5-50)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minReviewLength">
                    Minimalna długość opinii
                  </Label>
                  <Input
                    id="minReviewLength"
                    type="number"
                    min="10"
                    max="500"
                    value={minReviewLength}
                    onChange={(e) => setMinReviewLength(e.target.value)}
                    placeholder="50"
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimalna liczba znaków w opinii (10-500)
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Koszt usunięcia opinii (w punktach)</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Określ, ile punktów kosztuje usunięcie negatywnej opinii przez eksperta, w zależności od oceny (1-3 gwiazdki).
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deleteCost1">Ocena 1★</Label>
                    <Input
                      id="deleteCost1"
                      type="number"
                      min="0"
                      value={deleteCost1}
                      onChange={(e) => setDeleteCost1(e.target.value)}
                      placeholder="500"
                    />
                    <p className="text-xs text-muted-foreground">Punkty za opinię 1★</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deleteCost2">Ocena 2★</Label>
                    <Input
                      id="deleteCost2"
                      type="number"
                      min="0"
                      value={deleteCost2}
                      onChange={(e) => setDeleteCost2(e.target.value)}
                      placeholder="300"
                    />
                    <p className="text-xs text-muted-foreground">Punkty za opinię 2★</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deleteCost3">Ocena 3★</Label>
                    <Input
                      id="deleteCost3"
                      type="number"
                      min="0"
                      value={deleteCost3}
                      onChange={(e) => setDeleteCost3(e.target.value)}
                      placeholder="100"
                    />
                    <p className="text-xs text-muted-foreground">Punkty za opinię 3★</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============== TAB 5: E-MAIL (SMTP) ============== */}
        <TabsContent value="email" className="space-y-6 m-0">
          <Card className="border-cyan-500/20 bg-cyan-500/[0.01]">
            <CardHeader>
              <CardTitle className="text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Konfiguracja SMTP (Wysyłka e-maili)
              </CardTitle>
              <CardDescription>
                Skonfiguruj serwer SMTP do wysyłania powiadomień e-mail z platformy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-y-0 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.03] p-4 hover:bg-cyan-500/[0.06] transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="emailLogToMails" className="text-base font-semibold">
                    Tryb podglądu (logowanie do /mails)
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Po włączeniu, system zamiast wysyłać wiadomości e-mail przez SMTP będzie zapisywał je w bazie danych (podgląd pod adresem <a href="/mails" target="_blank" rel="noopener noreferrer" className="underline text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300 font-semibold">/mails</a>).
                  </p>
                </div>
                <Switch
                  id="emailLogToMails"
                  checked={emailLogToMails === "true"}
                  onCheckedChange={(checked) => setEmailLogToMails(checked ? "true" : "false")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="emailServerHost">Host SMTP</Label>
                  <Input
                    id="emailServerHost"
                    type="text"
                    value={emailServerHost}
                    onChange={(e) => setEmailServerHost(e.target.value)}
                    placeholder="np. smtp.gmail.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adres serwera poczty wychodzącej SMTP.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailServerPort">Port SMTP</Label>
                  <Input
                    id="emailServerPort"
                    type="text"
                    value={emailServerPort}
                    onChange={(e) => setEmailServerPort(e.target.value)}
                    placeholder="np. 587"
                  />
                  <p className="text-xs text-muted-foreground">
                    Zazwyczaj 587 (STARTTLS) lub 465 (SSL).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailServerUser">Użytkownik SMTP</Label>
                  <Input
                    id="emailServerUser"
                    type="text"
                    value={emailServerUser}
                    onChange={(e) => setEmailServerUser(e.target.value)}
                    placeholder="np. website@ps-dev.com.pl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Login do konta pocztowego.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailServerPassword">Hasło SMTP</Label>
                  <Input
                    id="emailServerPassword"
                    type="password"
                    value={emailServerPassword}
                    onChange={(e) => setEmailServerPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Hasło do konta lub hasło aplikacji (dla Gmail).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailFrom">Adres nadawcy (Od)</Label>
                  <Input
                    id="emailFrom"
                    type="email"
                    value={emailFrom}
                    onChange={(e) => setEmailFrom(e.target.value)}
                    placeholder="np. noreply@prostasprawa.pl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adres e-mail, z którego będą wysyłane wiadomości (powinien odpowiadać autoryzowanemu nadawcy w SMTP).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailFromName">Nazwa nadawcy (wyświetlana)</Label>
                  <Input
                    id="emailFromName"
                    type="text"
                    value={emailFromName}
                    onChange={(e) => setEmailFromName(e.target.value)}
                    placeholder="np. Prosta Sprawa"
                  />
                  <p className="text-xs text-muted-foreground">
                    Imię lub nazwa wyświetlana w kliencie pocztowym zamiast samego adresu e-mail (np. &quot;Prosta Sprawa&quot;).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============== TAB 6: SMS (SMSAPI) ============== */}
        <TabsContent value="sms" className="space-y-6 m-0">
          <Card className="border-emerald-500/20 bg-emerald-500/[0.01]">
            <CardHeader>
              <CardTitle className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Weryfikacja SMS (SMSAPI)
              </CardTitle>
              <CardDescription>
                Kod SMS wysyłany przy rejestracji klienta i eksperta. Ustawienia z tego panelu
                mają pierwszeństwo nad zmiennymi środowiskowymi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Tryb wysyłki</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Button
                    type="button"
                    variant={smsMode === "auto" ? "default" : "outline"}
                    onClick={() => setSmsMode("auto")}
                  >
                    AUTOMATYCZNY
                  </Button>
                  <Button
                    type="button"
                    variant={smsMode === "simulation" ? "default" : "outline"}
                    className={smsMode === "simulation" ? "" : "text-amber-600 hover:text-amber-700 dark:text-amber-400"}
                    onClick={() => setSmsMode("simulation")}
                  >
                    SYMULACJA
                  </Button>
                  <Button
                    type="button"
                    variant={smsMode === "production" ? "default" : "outline"}
                    className={smsMode === "production" ? "" : "text-red-600 hover:text-red-700 dark:text-red-400"}
                    onClick={() => setSmsMode("production")}
                  >
                    PRODUKCJA
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Automatyczny</span> — o trybie decyduje środowisko:
                  na produkcji SMS-y wychodzą realnie, poza nią (lub bez tokenu) działa symulacja.
                </p>
              </div>

              {smsMode === "simulation" && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-4 text-sm text-amber-800 dark:text-amber-400">
                  <span className="font-semibold">Tryb symulacji:</span> SMS-y nie są wysyłane
                  (bramka nie jest odpytywana, punkty się nie zużywają). Treść wiadomości z kodem
                  trafia do logów serwera <span className="font-mono">[SMSAPI:SYMULACJA]</span> i jest
                  pokazywana wprost w okienku weryfikacji na stronie rejestracji.
                </div>
              )}

              {smsMode === "simulation" && smsapiStatus?.nodeEnv === "production" && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/[0.08] p-4 text-sm text-red-700 dark:text-red-400">
                  <span className="font-semibold">Uwaga — to jest środowisko produkcyjne.</span> Przy
                  włączonej symulacji numery telefonów nie są faktycznie weryfikowane, a kod
                  weryfikacyjny widzi każdy, kto wypełni formularz rejestracji.
                </div>
              )}

              {smsMode === "production" && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-4 text-sm text-emerald-700 dark:text-emerald-400">
                  <span className="font-semibold">Tryb produkcyjny:</span> każdy SMS zużywa punkty
                  na koncie SMSAPI. Nazwa nadawcy musi być zweryfikowana w panelu SMSAPI — konta
                  trial mają dostępną wyłącznie nazwę <span className="font-mono">Test</span>.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smsapiSender" className="font-semibold text-foreground">
                    Nazwa nadawcy
                  </Label>
                  <Input
                    id="smsapiSender"
                    type="text"
                    value={smsapiSender}
                    onChange={(e) => setSmsapiSender(e.target.value)}
                    placeholder="np. ProstaSprawa"
                    maxLength={11}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maks. 11 znaków, musi być zarejestrowana w panelu SMSAPI.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smsapiToken" className="font-semibold text-foreground">
                    Token SMSAPI
                  </Label>
                  <Input
                    id="smsapiToken"
                    type="password"
                    value={smsapiToken}
                    onChange={(e) => setSmsapiToken(e.target.value)}
                    placeholder={
                      smsapiStatus?.tokenSource === "env"
                        ? "Używany token z ENV — wpisz, aby nadpisać"
                        : "Wklej token OAuth z panelu SMSAPI…"
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Token z panelu <span className="font-mono">smsapi.com</span> (nie .pl — token z
                    .pl zwraca <span className="font-mono">authorization_failed</span>). Puste pole =
                    używany jest <span className="font-mono">SMSAPI_TOKEN</span> z ENV.
                  </p>
                </div>
              </div>

              {smsapiStatus && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm">
                  <p className="mb-2 font-semibold text-foreground">Stan po ostatnim zapisie</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>
                      Wysyłka:{" "}
                      <span className={smsapiStatus.simulated ? "font-semibold text-amber-600 dark:text-amber-400" : "font-semibold text-emerald-600 dark:text-emerald-400"}>
                        {smsapiStatus.simulated ? "symulacja (SMS nie wychodzi)" : "realna przez SMSAPI"}
                      </span>
                    </li>
                    <li>
                      Token:{" "}
                      <span className="font-medium text-foreground">
                        {smsapiStatus.tokenSource === "settings"
                          ? "z panelu administratora"
                          : smsapiStatus.tokenSource === "env"
                            ? "z ENV (SMSAPI_TOKEN)"
                            : "brak — realna wysyłka niemożliwa"}
                      </span>
                    </li>
                    <li>
                      Nadawca: <span className="font-mono text-foreground">{smsapiStatus.sender}</span>
                    </li>
                    <li>
                      Bramka: <span className="font-mono text-foreground">{smsapiStatus.apiUrl}</span>
                      {" · "}
                      Środowisko: <span className="font-mono text-foreground">{smsapiStatus.nodeEnv}</span>
                    </li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============== TAB 7: PŁATNOŚCI I KSEF ============== */}
        <TabsContent value="payments" className="space-y-6 m-0">
          {/* Metody płatności */}
          <Card>
            <CardHeader>
              <CardTitle>Metody płatności</CardTitle>
              <CardDescription>
                Włączaj i wyłączaj poszczególne metody płatności w systemie oraz konfiguruj ich działanie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Przelewy24 */}
              <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="enablePaymentPrzelewy24" className="text-base font-semibold">
                    Przelewy24
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Włącza/wyłącza płatności internetowe za pośrednictwem serwisu Przelewy24 (BLIK, szybkie przelewy, karty).
                  </p>
                </div>
                <Switch
                  id="enablePaymentPrzelewy24"
                  checked={enablePaymentPrzelewy24 === "true"}
                  onCheckedChange={(checked) => setEnablePaymentPrzelewy24(checked ? "true" : "false")}
                />
              </div>

              {/* PayU */}
              <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="enablePaymentPayU" className="text-base font-semibold">
                    PayU
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Włącza/wyłącza płatności internetowe za pośrednictwem serwisu PayU.
                  </p>
                </div>
                <Switch
                  id="enablePaymentPayU"
                  checked={enablePaymentPayU === "true"}
                  onCheckedChange={(checked) => setEnablePaymentPayU(checked ? "true" : "false")}
                />
              </div>

              {/* Tpay */}
              <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="enablePaymentTpay" className="text-base font-semibold">
                    Tpay
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Włącza/wyłącza płatności internetowe za pośrednictwem serwisu Tpay.
                  </p>
                </div>
                <Switch
                  id="enablePaymentTpay"
                  checked={enablePaymentTpay === "true"}
                  onCheckedChange={(checked) => setEnablePaymentTpay(checked ? "true" : "false")}
                />
              </div>

              {/* Przelew tradycyjny */}
              <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="enablePaymentPrzelew" className="text-base font-semibold">
                    Przelew tradycyjny
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Włącza/wyłącza opcję zapłaty przelewem tradycyjnym (wymaga ręcznego zatwierdzenia po zaksięgowaniu wpłaty).
                  </p>
                </div>
                <Switch
                  id="enablePaymentPrzelew"
                  checked={enablePaymentPrzelew === "true"}
                  onCheckedChange={(checked) => setEnablePaymentPrzelew(checked ? "true" : "false")}
                />
              </div>

              <Separator className="my-4" />

              {/* Płatność testowa */}
              <div className="flex items-center justify-between space-y-0 rounded-lg border border-primary/20 bg-primary/5 p-4 hover:bg-primary/10 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="enablePaymentTest" className="text-base font-semibold flex items-center gap-2">
                    Płatność testowa
                    <span className="text-sm bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">TEST</span>
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Włącza/wyłącza możliwość korzystania z płatności testowej (TEST) w systemie (symulacja płatności).
                  </p>
                </div>
                <Switch
                  id="enablePaymentTest"
                  checked={enablePaymentTest === "true"}
                  onCheckedChange={(checked) => setEnablePaymentTest(checked ? "true" : "false")}
                />
              </div>

              {/* Automatyczna akceptacja płatności testowych (widoczna tylko gdy włączona płatność testowa) */}
              {enablePaymentTest === "true" && (
                <div className="flex items-center justify-between space-y-0 rounded-lg border border-primary/20 bg-primary/5 p-4 hover:bg-primary/10 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoApproveTestPayment" className="text-base font-semibold flex items-center gap-2">
                      Automatyczna akceptacja płatności testowych
                      <span className="text-sm bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">TEST</span>
                    </Label>
                    <p className="text-sm text-muted-foreground max-w-xl">
                      Włącza/wyłącza automatyczne zatwierdzanie płatności testowej (TEST). Gdy jest wyłączone, zamówienie uzyska status oczekującego (OCZEKUJE) i będzie wymagało zatwierdzenia w panelu admina.
                    </p>
                  </div>
                  <Switch
                    id="autoApproveTestPayment"
                    checked={autoApproveTestPayment === "true"}
                    onCheckedChange={(checked) => setAutoApproveTestPayment(checked ? "true" : "false")}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ustawienia Krajowego Systemu e-Faktur (KSeF) */}
          <Card className="border-indigo-500/20 bg-indigo-500/[0.01]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    Integracja KSeF 2.0
                    <span className="text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">MF Polska</span>
                  </CardTitle>
                  <CardDescription>
                    Konfiguracja automatycznego przesyłania faktur do Krajowego Systemu e-Faktur (KSeF) w standardzie FA(3).
                  </CardDescription>
                </div>
                <Switch
                  id="ksefEnabled"
                  checked={ksefEnabled === "true"}
                  onCheckedChange={(checked) => setKsefEnabled(checked ? "true" : "false")}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {ksefEnabled === "false" && (
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/[0.03] p-4 text-sm text-yellow-800 dark:text-yellow-400">
                  <span className="font-semibold">Tryb Symulacji:</span> System KSeF jest wyłączony. Faktury będą generowane w formacie FA(3) XML lokalnie i automatycznie oznaczane jako przesłane w celach demonstracyjnych i deweloperskich.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ksefNip" className="font-semibold text-foreground">NIP Sprzedawcy (Platformy)</Label>
                  <Input
                    id="ksefNip"
                    type="text"
                    value={ksefNip}
                    onChange={(e) => setKsefNip(e.target.value)}
                    placeholder="np. 1234567890"
                    disabled={ksefEnabled === "false"}
                  />
                  <p className="text-xs text-muted-foreground">
                    10-cyfrowy NIP podmiotu wystawiającego faktury (sprzedawcy).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-foreground">Środowisko KSeF 2.0</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={ksefEnv === "test" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setKsefEnv("test")}
                      disabled={ksefEnabled === "false"}
                    >
                      TEST (Sandbox)
                    </Button>
                    <Button
                      type="button"
                      variant={ksefEnv === "prod" ? "default" : "outline"}
                      className="flex-1 text-red-600 hover:text-red-700 dark:text-red-400"
                      onClick={() => setKsefEnv("prod")}
                      disabled={ksefEnabled === "false"}
                    >
                      PRODUKCJA
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Zalecane testowanie integracji na środowisku testowym (Sandbox MF).
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ksefToken" className="font-semibold text-foreground">Token Autoryzacyjny (Token KSeF)</Label>
                <Input
                  id="ksefToken"
                  type="password"
                  value={ksefToken}
                  onChange={(e) => setKsefToken(e.target.value)}
                  placeholder="Wklej 40-znakowy token autoryzacyjny..."
                  disabled={ksefEnabled === "false"}
                />
                <p className="text-xs text-muted-foreground">
                  Token wygenerowany w Aplikacji Podatnika KSeF w sekcji &quot;Certyfikaty i Uprawnienia&quot;. Posiadający uprawnienie do wystawiania faktur.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky Actions Bar at the bottom of the page */}
      <div className="sticky bottom-4 left-0 right-0 z-20 bg-background/90 backdrop-blur border border-border p-4 rounded-xl flex justify-between items-center gap-4 shadow-lg mt-6">
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span>Status walidacji:</span>
          {(!siteName.trim() || !contactEmail.trim() || !supportEmail.trim()) ? (
            <span className="text-destructive flex items-center gap-1.5 font-semibold">
              <AlertCircle className="h-4 w-4 animate-bounce" />
              Wymagane pola są puste (Nazwa serwisu, E-mail kontaktowy lub E-mail wsparcia)
            </span>
          ) : (
            <span className="text-green-500 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Wszystkie pola poprawne
            </span>
          )}
        </div>

        <div className="flex gap-3 ml-auto">
          <Button onClick={handleSave} disabled={saving} className="h-9 font-semibold px-5">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Zapisz wszystkie ustawienia
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
