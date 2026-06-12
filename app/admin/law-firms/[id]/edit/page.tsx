"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FaFacebook as Facebook,
  FaLinkedin as Linkedin,
  FaInstagram as Instagram,
  FaTwitter as Twitter
} from "react-icons/fa"
import {
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Building2,
  Phone,
  User,
  Briefcase,
  Image as ImageIcon,
  TrendingUp,
  Globe,
  Clock,
  Lock,
  Settings2,
  ShieldCheck,
  BookOpen,
  FileCheck2,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { ImageCropper } from "@/components/ui/image-cropper"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { motion, AnimatePresence } from "framer-motion"

import {
  lawFirmSchema,
  type LawFirmFormValues,
  type Voivodeship,
  type AccountManager,
  type NotificationSettings,
} from "./types"
import { AdminNotificationSettingsCard } from "./components/AdminNotificationSettingsCard"
import { AdminStatisticsCard } from "./components/AdminStatisticsCard"
import {
  TagsEditor,
  GalleryEditor,
  BusinessHoursEditor,
  EducationEditor
} from "./components/InteractiveEditors"

export default function EditLawFirmPage() {
  const params = useParams()
  const router = useRouter()
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [accountManagers, setAccountManagers] = useState<AccountManager[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [userId, setUserId] = useState<string>("")
  const [statistics, setStatistics] = useState({
    wyswietleniaProfilu: 0,
    zlozoneOferty: 0,
    wygraneOferty: 0,
    konwersja: 0,
    pozycjaRanking: null as number | null,
  })

  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null)
  const [showLogoCropper, setShowLogoCropper] = useState(false)
  const [selectedMainImageFile, setSelectedMainImageFile] = useState<File | null>(null)
  const [showMainImageCropper, setShowMainImageCropper] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [activeTab, setActiveTab] = useState("general")

  const tabs = [
    { id: "general", label: "Dane podstawowe", desc: "Dane firmy, adres, godziny", icon: Building2 },
    { id: "contact", label: "Kontakt & Social", desc: "Dane kontaktowe i social media", icon: Phone },
    { id: "account", label: "Konto & Plan", desc: "Konto, pakiet, zgody i saldo", icon: User },
    { id: "professional", label: "Profesjonalne", desc: "Uprawnienia, opis i edukacja", icon: Briefcase },
    { id: "multimedia", label: "Multimedia", desc: "Logo, banner, wideo i galeria", icon: ImageIcon },
    { id: "stats", label: "Statystyki & Powiadomienia", desc: "Dzienniki i logi", icon: TrendingUp },
  ]

  const form = useForm<LawFirmFormValues>({
    resolver: zodResolver(lawFirmSchema),
    defaultValues: {
      email: "",
      password: "",
      userStatus: "ACTIVE",
      typ: "OSOBA_FIZYCZNA",
      typInny: "",
      nazwa: "",
      nazwaFirmy: "",
      slug: "",
      nip: "",
      regon: "",
      krs: "",
      imieKontakt: "",
      nazwiskoKontakt: "",
      numerTelefonu: "",
      numerTelefonu2: "",
      emailKontakt: "",
      adres: "",
      kodPocztowy: "",
      miasto: "",
      voivodeshipId: "",
      opis: "",
      logo: "",
      zdjecieGlowne: "",
      galeriaZdjec: "",
      filmYouTube: "",
      okladkaFilmu: "",
      kolejnoscMultimedia: "zdjecia",
      statusGodzinyOtwarcia: false,
      godzinyOtwarcia: "",
      linkLinkedIn: "",
      linkFacebook: "",
      linkInstagram: "",
      linkTwitter: "",
      linkTikTok: "",
      stronaWww: "",
      edukacja: "",
      oirpMiasto: "",
      oirpWpis: "",
      oirpStatus: false,
      oraMiasto: "",
      oraWpis: "",
      oraStatus: false,
      unikatowyOpisUslugi: "",
      slowaKluczowe: "",
      callaPolska: false,
      onlineOnly: false,
      typOferty: "WSZYSTKIE",
      pakietSubskrypcji: "",
      punktySaldo: 0,
      dataPakietuOd: "",
      dataPakietuDo: "",
      zgodaRegulamin: false,
      zgodaPrzetwarzanie: false,
      zweryfikowana: false,
      aktywna: true,
      accountManagerId: "",
    },
  })

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Nieprawidłowy typ pliku. Dozwolone: JPEG, PNG, WebP")
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Plik jest za duży. Maksymalny rozmiar to 5MB")
      return
    }

    setSelectedLogoFile(file)
    setShowLogoCropper(true)
  }

  const handleLogoCropComplete = async (croppedBlob: Blob) => {
    setShowLogoCropper(false)
    setIsUploading(true)

    try {
      const file = new File([croppedBlob], selectedLogoFile?.name || "logo.jpg", {
        type: croppedBlob.type,
      })

      const formDataToSend = new FormData()
      formDataToSend.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      const uploadUrl = data.url
      if (uploadUrl) {
        form.setValue("logo", uploadUrl)
        toast.success("Logo zostało przesłane")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error(error instanceof Error ? error.message : "Nie udało się przesłać zdjęcia")
    } finally {
      setIsUploading(false)
      setSelectedLogoFile(null)
    }
  }

  const handleLogoCropCancel = () => {
    setShowLogoCropper(false)
    setSelectedLogoFile(null)
  }

  const handleMainImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Nieprawidłowy typ pliku. Dozwolone: JPEG, PNG, WebP")
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Plik jest za duży. Maksymalny rozmiar to 5MB")
      return
    }

    setSelectedMainImageFile(file)
    setShowMainImageCropper(true)
  }

  const handleMainImageCropComplete = async (croppedBlob: Blob) => {
    setShowMainImageCropper(false)
    setIsUploading(true)

    try {
      const file = new File([croppedBlob], selectedMainImageFile?.name || "main-image.jpg", {
        type: croppedBlob.type,
      })

      const formDataToSend = new FormData()
      formDataToSend.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      const uploadUrl = data.url
      if (uploadUrl) {
        form.setValue("zdjecieGlowne", uploadUrl)
        toast.success("Zdjęcie główne zostało przesłane")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error(error instanceof Error ? error.message : "Nie udało się przesłać zdjęcia")
    } finally {
      setIsUploading(false)
      setSelectedMainImageFile(null)
    }
  }

  const handleMainImageCropCancel = () => {
    setShowMainImageCropper(false)
    setSelectedMainImageFile(null)
  }

  const handleRemoveSingleImage = (field: "logo" | "zdjecieGlowne") => {
    form.setValue(field, "")
    toast.success(field === "logo" ? "Logo zostało usunięte" : "Zdjęcie główne zostało usunięte")
  }

  // Fetch voivodeships
  useEffect(() => {
    const fetchVoivodeships = async () => {
      try {
        const response = await fetch("/api/voivodeships")
        if (response.ok) {
          const data = await response.json()
          setVoivodeships(data)
        }
      } catch (error) {
        console.error("Error fetching voivodeships:", error)
      }
    }
    fetchVoivodeships()
  }, [])

  // Fetch account managers
  useEffect(() => {
    const fetchAccountManagers = async () => {
      try {
        const response = await fetch("/api/admin/account-managers")
        if (response.ok) {
          const data = await response.json()
          setAccountManagers(data.filter((am: AccountManager) => am.aktywny))
        }
      } catch (error) {
        console.error("Error fetching account managers:", error)
      }
    }
    fetchAccountManagers()
  }, [])

  // Fetch law firm data
  useEffect(() => {
    const fetchLawFirm = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/law-firms/${params.id}`)
        if (response.ok) {
          const lawFirm = await response.json()
          form.reset({
            email: lawFirm.user.email,
            password: "",
            userStatus: lawFirm.user.status as "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLOCKED",
            typ: lawFirm.typ,
            typInny: lawFirm.typInny || "",
            nazwa: lawFirm.nazwa,
            nazwaFirmy: lawFirm.nazwaFirmy,
            slug: lawFirm.slug || "",
            nip: lawFirm.nip,
            regon: lawFirm.regon || "",
            krs: lawFirm.krs || "",
            imieKontakt: lawFirm.imieKontakt,
            nazwiskoKontakt: lawFirm.nazwiskoKontakt,
            numerTelefonu: lawFirm.numerTelefonu,
            numerTelefonu2: lawFirm.numerTelefonu2 || "",
            emailKontakt: law.Firm.user?.email,
            adres: lawFirm.adres,
            kodPocztowy: lawFirm.kodPocztowy,
            miasto: lawFirm.miasto,
            voivodeshipId: lawFirm.voivodeshipId,
            opis: lawFirm.opis || "",
            logo: lawFirm.logo || "",
            zdjecieGlowne: lawFirm.zdjecieGlowne || "",
            galeriaZdjec: lawFirm.galeriaZdjec || "",
            filmYouTube: lawFirm.filmYouTube || "",
            okladkaFilmu: lawFirm.okladkaFilmu || "",
            kolejnoscMultimedia: lawFirm.kolejnoscMultimedia || "zdjecia",
            statusGodzinyOtwarcia: lawFirm.statusGodzinyOtwarcia || false,
            godzinyOtwarcia: lawFirm.godzinyOtwarcia || "",
            linkLinkedIn: lawFirm.linkLinkedIn || "",
            linkFacebook: lawFirm.linkFacebook || "",
            linkInstagram: lawFirm.linkInstagram || "",
            linkTwitter: lawFirm.linkTwitter || "",
            linkTikTok: lawFirm.linkTikTok || "",
            stronaWww: lawFirm.stronaWww || "",
            edukacja: lawFirm.edukacja || "",
            oirpMiasto: lawFirm.oirpMiasto || "",
            oirpWpis: lawFirm.oirpWpis || "",
            oirpStatus: lawFirm.oirpStatus || false,
            oraMiasto: lawFirm.oraMiasto || "",
            oraWpis: lawFirm.oraWpis || "",
            oraStatus: lawFirm.oraStatus || false,
            unikatowyOpisUslugi: lawFirm.unikatowyOpisUslugi || "",
            slowaKluczowe: lawFirm.slowaKluczowe || "",
            callaPolska: lawFirm.callaPolska || false,
            onlineOnly: lawFirm.onlineOnly || false,
            typOferty: lawFirm.typOferty,
            pakietSubskrypcji: lawFirm.pakietSubskrypcji || "",
            punktySaldo: lawFirm.punktySaldo,
            dataPakietuOd: lawFirm.dataPakietuOd ? new Date(lawFirm.dataPakietuOd).toISOString().split("T")[0] : "",
            dataPakietuDo: lawFirm.dataPakietuDo ? new Date(lawFirm.dataPakietuDo).toISOString().split("T")[0] : "",
            zgodaRegulamin: lawFirm.zgodaRegulamin || false,
            zgodaPrzetwarzanie: lawFirm.zgodaPrzetwarzanie || false,
            zweryfikowana: lawFirm.zweryfikowana,
            aktywna: lawFirm.aktywna,
            accountManagerId: lawFirm.accountManagerId || "",
          })

          setStatistics({
            wyswietleniaProfilu: lawFirm.wyswietleniaProfilu || 0,
            zlozoneOferty: lawFirm.zlozoneOferty || 0,
            wygraneOferty: lawFirm.wygraneOferty || 0,
            konwersja: lawFirm.konwersja || 0,
            pozycjaRanking: lawFirm.pozycjaRanking || null,
          })

          setUserId(lawFirm.user.id)

          try {
            const settingsResponse = await fetch(`/api/admin/users/${lawFirm.user.id}/notification-settings`)
            if (settingsResponse.ok) {
              const settings = await settingsResponse.json()
              setNotificationSettings(settings)
            }
          } catch (error) {
            console.error("Error fetching notification settings:", error)
          }
        } else {
          throw new Error("Błąd podczas pobierania danych eksperta")
        }
      } catch (error) {
        toast.error("Nie udało się pobrać danych eksperta")
        router.push("/admin/law-firms")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchLawFirm()
    }
  }, [params.id, router])

  const getTabErrors = (tabId: string) => {
    const errors = form.formState.errors
    const tabFields: Record<string, (keyof LawFirmFormValues)[]> = {
      general: [
        "typ",
        "typInny",
        "nazwa",
        "nazwaFirmy",
        "slug",
        "nip",
        "regon",
        "krs",
        "opis",
        "adres",
        "kodPocztowy",
        "miasto",
        "voivodeshipId",
        "callaPolska",
        "onlineOnly",
        "statusGodzinyOtwarcia",
        "godzinyOtwarcia",
      ],
      contact: [
        "imieKontakt",
        "nazwiskoKontakt",
        "numerTelefonu",
        "numerTelefonu2",
        "emailKontakt",
        "stronaWww",
        "linkLinkedIn",
        "linkFacebook",
        "linkInstagram",
        "linkTwitter",
        "linkTikTok",
      ],
      account: [
        "email",
        "password",
        "userStatus",
        "typOferty",
        "pakietSubskrypcji",
        "punktySaldo",
        "zweryfikowana",
        "aktywna",
        "accountManagerId",
        "dataPakietuOd",
        "dataPakietuDo",
        "zgodaRegulamin",
        "zgodaPrzetwarzanie",
      ],
      professional: [
        "oirpStatus",
        "oirpMiasto",
        "oirpWpis",
        "oraStatus",
        "oraMiasto",
        "oraWpis",
        "edukacja",
        "unikatowyOpisUslugi",
        "slowaKluczowe",
      ],
      multimedia: [
        "logo",
        "zdjecieGlowne",
        "galeriaZdjec",
        "filmYouTube",
        "okladkaFilmu",
        "kolejnoscMultimedia",
      ],
    }

    const fields = tabFields[tabId] || []
    return fields.filter((field) => errors[field]).length
  }

  const handleInvalid = () => {
    toast.error("Formularz zawiera błędy. Sprawdź oznaczone zakładki.")
    const tabsOrder = ["general", "contact", "account", "professional", "multimedia"]
    for (const tabId of tabsOrder) {
      if (getTabErrors(tabId) > 0) {
        setActiveTab(tabId)
        break
      }
    }
  }

  const handleSubmit = async (values: LawFirmFormValues) => {
    try {
      setIsSubmitting(true)
      const updateData: any = {
        ...values,
      }

      if (!values.password || values.password.length === 0) {
        delete updateData.password
      } else {
        updateData.userPassword = values.password
      }
      delete updateData.password

      updateData.userEmail = values.email
      delete updateData.email

      if (updateData.pakietSubskrypcji === "" || !updateData.pakietSubskrypcji) {
        updateData.pakietSubskrypcji = null
      }

      const response = await fetch(`/api/admin/law-firms/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast.success("Ekspert została zaktualizowana pomyślnie")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd podczas aktualizacji eksperta")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaktualizować eksperta")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Ładowanie...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 relative">
      <AdminHeaderSetter title="Edytuj Eksperta" subtitle="Kompleksowe zarządzanie informacjami i konfiguracją eksperta" />
      {/* Sticky Header with Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 border-border">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
            <Link href="/admin/law-firms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit, handleInvalid)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

            {/* Sidebar Navigation */}
            <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 lg:sticky lg:top-24 bg-card border border-border p-2 rounded-xl shadow-sm max-w-full">
              {tabs.map((tab) => {
                const TabIcon = tab.icon
                const isActive = activeTab === tab.id
                const errorCount = getTabErrors(tab.id)

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-3 px-3.5 py-3 rounded-lg text-left text-sm font-medium transition-all outline-none whitespace-nowrap lg:whitespace-normal w-full ${isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                  >
                    <TabIcon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? "" : "text-primary"}`} />
                    <div className="hidden sm:block text-left">
                      <div className="font-semibold text-xs md:text-sm">{tab.label}</div>
                      <div className="text-[10px] md:text-xs font-normal opacity-85 hidden lg:block">
                        {tab.desc}
                      </div>
                    </div>
                    {errorCount > 0 && (
                      <span className="absolute top-2 right-2 lg:relative lg:top-0 lg:right-0 ml-auto flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  {/* --- TAB 1: GENERAL --- */}
                  {activeTab === "general" && (
                    <>
                      {/* Basic Info */}
                      <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
                          <Building2 className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">Dane podstawowe</CardTitle>
                            <CardDescription>Kluczowe dane rejestrowe i opis działalności</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="typ"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Typ działalności</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Wybierz typ" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="OSOBA_FIZYCZNA">Osoba fizyczna</SelectItem>
                                      <SelectItem value="SPOLKA_CYWILNA">Spółka cywilna</SelectItem>
                                      <SelectItem value="SPOLKA_PARTNERSKA">Spółka partnerska</SelectItem>
                                      <SelectItem value="SPOLKA_KOMANDYTOWA">Spółka komandytowa</SelectItem>
                                      <SelectItem value="SPOLKA_JAWNA">Spółka jawna</SelectItem>
                                      <SelectItem value="SPOLKA_ZOO">Spółka z o.o.</SelectItem>
                                      <SelectItem value="INNY">Inny</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {form.watch("typ") === "INNY" && (
                              <FormField
                                control={form.control}
                                name="typInny"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Typ inny (opis)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Podaj typ" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <FormField
                              control={form.control}
                              name="nazwaFirmy"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pełna nazwa firmy</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Pełna nazwa firmy" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Slug URL (opcjonalnie)</FormLabel>
                                <FormControl>
                                  <Input placeholder="np. ekspert-kowalski" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Przyjazny URL dla profilu eksperta. Zostanie wygenerowany automatycznie jeśli pozostawisz puste.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="nip"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>NIP</FormLabel>
                                  <FormControl>
                                    <Input placeholder="1234567890" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="regon"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>REGON (opcjonalnie)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123456789" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="krs"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>KRS (opcjonalnie)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0000123456" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="opis"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Opis eksperta</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Opis eksperta..." className="min-h-32" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      {/* Address */}
                      <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">Adres siedziby</CardTitle>
                            <CardDescription>Lokalizacja i dane adresowe</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                          <FormField
                            control={form.control}
                            name="adres"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adres (ulica i numer)</FormLabel>
                                <FormControl>
                                  <Input placeholder="ul. Przykładowa 123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="kodPocztowy"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Kod pocztowy</FormLabel>
                                  <FormControl>
                                    <Input placeholder="00-000" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="miasto"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Miasto</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Warszawa" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="voivodeshipId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Województwo</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Wybierz województwo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {voivodeships.map((v) => (
                                      <SelectItem key={v.id} value={v.id}>
                                        {v.nazwa}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      {/* Coverage */}
                      <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
                          <Globe className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">Obszar działania</CardTitle>
                            <CardDescription>Zasięg świadczonych usług prawnych</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                          <div className="flex flex-col sm:flex-row gap-6">
                            <FormField
                              control={form.control}
                              name="callaPolska"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg flex-1 hover:bg-muted/30 transition-colors">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="cursor-pointer">Cała Polska</FormLabel>
                                    <FormDescription>
                                      Ekspert świadczy usługi na terenie całego kraju
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="onlineOnly"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg flex-1 hover:bg-muted/30 transition-colors">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="cursor-pointer">Tylko online</FormLabel>
                                    <FormDescription>
                                      Ekspert świadczy usługi wyłącznie przez internet / zdalnie
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Hours */}
                      <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">Godziny otwarcia</CardTitle>
                            <CardDescription>Harmonogram pracy w profilu publicznym</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <FormField
                            control={form.control}
                            name="statusGodzinyOtwarcia"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg bg-muted/20">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="cursor-pointer">Wyświetlaj godziny pracy</FormLabel>
                                  <FormDescription>
                                    Włącz godziny otwarcia w widoku publicznym profilu
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />

                          {form.watch("statusGodzinyOtwarcia") && (
                            <FormField
                              control={form.control}
                              name="godzinyOtwarcia"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Godziny pracy</FormLabel>
                                  <FormControl>
                                    <BusinessHoursEditor value={field.value} onChange={field.onChange} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* --- TAB 2: CONTACT & SOCIAL --- */}
                  {activeTab === "contact" && (
                    <>
                      {/* Contact Info */}
                      <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
                          <Phone className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">Osoba kontaktowa</CardTitle>
                            <CardDescription>Dane osoby do bezpośredniego kontaktu</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="imieKontakt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Imię</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Jan" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="nazwiskoKontakt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nazwisko</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Kowalski" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="numerTelefonu"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Telefon główny</FormLabel>
                                  <FormControl>
                                    <Input placeholder="+48 123 456 789" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="numerTelefonu2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Telefon dodatkowy (opcjonalnie)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="+48 987 654 321" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                        </CardContent>
                      </Card>

                      {/* Social Media */}
                      <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">Media społecznościowe i www</CardTitle>
                            <CardDescription>Adres strony internetowej i profile społecznościowe</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="stronaWww"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <FormLabel className="m-0 text-xs">Strona WWW (opcjonalnie)</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Input placeholder="https://www.example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="linkLinkedIn"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                                    <FormLabel className="m-0 text-xs">LinkedIn (opcjonalnie)</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Input placeholder="https://www.linkedin.com/in/..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="linkFacebook"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <Facebook className="h-4 w-4 text-[#1877F2]" />
                                    <FormLabel className="m-0 text-xs">Facebook (opcjonalnie)</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Input placeholder="https://www.facebook.com/..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="linkInstagram"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <Instagram className="h-4 w-4 text-[#E1306C]" />
                                    <FormLabel className="m-0 text-xs">Instagram (opcjonalnie)</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Input placeholder="https://www.instagram.com/..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="linkTwitter"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <Twitter className="h-4 w-4 text-sky-500" />
                                    <FormLabel className="m-0 text-xs">Twitter / X (opcjonalnie)</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Input placeholder="https://twitter.com/..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="linkTikTok"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="font-bold text-[10px] text-foreground bg-foreground/10 px-1 py-0.5 rounded">T</span>
                                    <FormLabel className="m-0 text-xs">TikTok (opcjonalnie)</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Input placeholder="https://www.tiktok.com/@..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* --- TAB 3: ACCOUNT & PLAN --- */}
                  {activeTab === "account" && (
                    <>
                      {/* Account Credentials */}
                      <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
                          <Lock className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">Konto użytkownika</CardTitle>
                            <CardDescription>Dane logowania i status konta</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email logowania</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="email@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hasło (pozostaw puste aby nie zmieniać)</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Wpisz nowe hasło..." {...field} />
                                  </FormControl>
                                  <FormDescription className="text-xs">
                                    Wprowadź minimum 8 znaków tylko jeśli chcesz zresetować obecne hasło
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="userStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status konta użytkownika</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Wybierz status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ACTIVE">Aktywne</SelectItem>
                                    <SelectItem value="INACTIVE">Nieaktywne</SelectItem>
                                    <SelectItem value="SUSPENDED">Zawieszone</SelectItem>
                                    <SelectItem value="BLOCKED">Zablokowane</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      {/* Settings & Sub */}
                      <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
                          <Settings2 className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">Konfiguracja i subskrypcja</CardTitle>
                            <CardDescription>Opcje oferty, pakiet subskrypcyjny i saldo</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="typOferty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Obsługiwany typ oferty</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Wybierz typ oferty" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="STALA_WSPOLPRACA">Stała współpraca</SelectItem>
                                      <SelectItem value="JEDNORAZOWA_USLUGA">Jednorazowa usługa</SelectItem>
                                      <SelectItem value="KONSULTACJA">Konsultacja</SelectItem>
                                      <SelectItem value="WSZYSTKIE">Wszystkie typy</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="pakietSubskrypcji"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pakiet subskrypcji</FormLabel>
                                  <Select
                                    onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                                    value={field.value || "none"}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Wybierz pakiet" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="none">Brak pakietu (Darmowy)</SelectItem>
                                      <SelectItem value="PODSTAWOWY">Podstawowy</SelectItem>
                                      <SelectItem value="STANDARD">Standard</SelectItem>
                                      <SelectItem value="PREMIUM">Premium</SelectItem>
                                      <SelectItem value="BIZNES">Biznes</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="punktySaldo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Saldo punktów</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="dataPakietuOd"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start subskrypcji</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="dataPakietuDo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Koniec subskrypcji</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-6 p-4 border border-border rounded-lg bg-muted/10">
                            <FormField
                              control={form.control}
                              name="zweryfikowana"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2.5 space-y-0 cursor-pointer">
                                  <FormControl>
                                    <Checkbox
                                      id="chk-zweryfikowana"
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel htmlFor="chk-zweryfikowana" className="cursor-pointer text-sm font-semibold flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Zweryfikowana
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="aktywna"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2.5 space-y-0 cursor-pointer">
                                  <FormControl>
                                    <Checkbox
                                      id="chk-aktywna"
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel htmlFor="chk-aktywna" className="cursor-pointer text-sm font-semibold flex items-center gap-1.5">
                                    <span className={`h-2.5 w-2.5 rounded-full ${field.value ? "bg-green-500 animate-ping" : "bg-gray-400"}`} />
                                    Ekspert Aktywna
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="accountManagerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Opiekun eksperta (Account Manager)</FormLabel>
                                <Select
                                  onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                                  value={field.value || "none"}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Wybierz opiekuna..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">Brak przypisanego opiekuna</SelectItem>
                                    {accountManagers.map((manager) => (
                                      <SelectItem key={manager.id} value={manager.id}>
                                        {manager.imie} {manager.nazwisko} ({manager.email})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-xs">
                                  Dedykowany opiekun z ramienia serwisu, wyświetlany w panelu eksperta.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      {/* Consents */}
                      <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
                          <FileCheck2 className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">Zgody prawne i regulaminy</CardTitle>
                            <CardDescription>Weryfikacja akceptacji warunków serwisu</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                          <div className="flex flex-col gap-3">
                            <FormField
                              control={form.control}
                              name="zgodaRegulamin"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/20 transition-colors">
                                  <FormControl>
                                    <Checkbox
                                      id="chk-regulamin"
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-0.5 leading-none">
                                    <FormLabel htmlFor="chk-regulamin" className="cursor-pointer text-sm font-normal">Akceptacja regulaminu</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="zgodaPrzetwarzanie"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/20 transition-colors">
                                  <FormControl>
                                    <Checkbox
                                      id="chk-przetwarzanie"
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-0.5 leading-none">
                                    <FormLabel htmlFor="chk-przetwarzanie" className="cursor-pointer text-sm font-normal">Zgoda na przetwarzanie danych osobowych (RODO)</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* --- TAB 4: PROFESSIONAL & LEGAL --- */}
                  {activeTab === "professional" && (
                    <>
                      {/* Legal Registrations */}
                      <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">Przynależność do izb i samorządów</CardTitle>
                            <CardDescription>Uprawnienia zawodowe adwokata / radcy prawnego</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          {/* OIRP */}
                          <div className="space-y-4 p-4 border rounded-lg bg-muted/5">
                            <div className="flex items-center gap-2 pb-2 border-b">
                              <FormField
                                control={form.control}
                                name="oirpStatus"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        id="chk-oirp"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel htmlFor="chk-oirp" className="text-sm font-semibold cursor-pointer">
                                      Okręgowa Izba Radców Prawnych (OIRP)
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {form.watch("oirpStatus") && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                <FormField
                                  control={form.control}
                                  name="oirpMiasto"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Miasto siedziby izby</FormLabel>
                                      <FormControl>
                                        <Input placeholder="np. Warszawa" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="oirpWpis"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Numer wpisu na listę</FormLabel>
                                      <FormControl>
                                        <Input placeholder="np. WA/12345" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>

                          {/* ORA */}
                          <div className="space-y-4 p-4 border rounded-lg bg-muted/5">
                            <div className="flex items-center gap-2 pb-2 border-b">
                              <FormField
                                control={form.control}
                                name="oraStatus"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        id="chk-ora"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel htmlFor="chk-ora" className="text-sm font-semibold cursor-pointer">
                                      Okręgowa Rada Adwokacka (ORA)
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {form.watch("oraStatus") && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                <FormField
                                  control={form.control}
                                  name="oraMiasto"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Miasto siedziby izby</FormLabel>
                                      <FormControl>
                                        <Input placeholder="np. Warszawa" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="oraWpis"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Numer wpisu na listę</FormLabel>
                                      <FormControl>
                                        <Input placeholder="np. WA/12345" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Professional Info */}
                      <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">Wykształcenie i tagi</CardTitle>
                            <CardDescription>Wykształcenie adwokatów, oferta i słowa kluczowe</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <FormField
                            control={form.control}
                            name="edukacja"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold">Historia edukacji</FormLabel>
                                <FormControl>
                                  <EducationEditor value={field.value} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="unikatowyOpisUslugi"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold">Unikalny opis usług i wyróżniki</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Opisz co wyróżnia eksperta na tle konkurencji..." className="min-h-24" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="slowaKluczowe"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold">Słowa kluczowe (Tagi wyszukiwania)</FormLabel>
                                <FormControl>
                                  <TagsEditor value={field.value} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* --- TAB 5: MULTIMEDIA --- */}
                  {activeTab === "multimedia" && (
                    <Card className="shadow-sm border-border">
                      <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">Multimedia i wizualizacja</CardTitle>
                          <CardDescription>Zarządzaj wyglądem profilu eksperta</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-8 pt-6">

                        {/* Logo */}
                        <div className="space-y-3 border-b pb-6">
                          <h4 className="text-sm font-semibold">Logo ekspercie</h4>
                          <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div>
                                    {field.value ? (
                                      <div className="flex items-start gap-4">
                                        <div className="relative h-28 w-28 rounded-lg overflow-hidden border bg-muted flex items-center justify-center shadow-sm">
                                          <Image
                                            src={field.value}
                                            alt="Logo"
                                            fill
                                            className="object-contain p-2"
                                          />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                          <label
                                            htmlFor="logo-upload"
                                            className="inline-flex items-center justify-center rounded-md text-xs font-semibold border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer shadow-sm transition-colors"
                                          >
                                            {isUploading ? (
                                              <>
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                Przesyłanie...
                                              </>
                                            ) : (
                                              <>
                                                <Upload className="mr-1.5 h-3.5 w-3.5 text-primary" />
                                                Zmień logo
                                              </>
                                            )}
                                          </label>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemoveSingleImage("logo")}
                                            disabled={isUploading}
                                            className="text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive text-xs"
                                          >
                                            <X className="mr-1.5 h-3.5 w-3.5" />
                                            Usuń logo
                                          </Button>
                                        </div>
                                        <input
                                          id="logo-upload"
                                          type="file"
                                          accept="image/jpeg,image/jpg,image/png,image/webp"
                                          className="hidden"
                                          onChange={handleLogoFileSelect}
                                          disabled={isUploading}
                                        />
                                      </div>
                                    ) : (
                                      <div>
                                        <label
                                          htmlFor="logo-upload"
                                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors bg-muted/10"
                                        >
                                          <div className="flex flex-col items-center justify-center pt-4 pb-4">
                                            {isUploading ? (
                                              <>
                                                <Loader2 className="h-8 w-8 mb-2 text-muted-foreground animate-spin" />
                                                <p className="text-xs text-muted-foreground">Przesyłanie...</p>
                                              </>
                                            ) : (
                                              <>
                                                <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground/60" />
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                  <span className="font-semibold">Kliknij aby wgrać</span> logo
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                  PNG, JPG, WEBP (max 5MB, format kwadratu)
                                                </p>
                                              </>
                                            )}
                                          </div>
                                        </label>
                                        <input
                                          id="logo-upload"
                                          type="file"
                                          accept="image/jpeg,image/jpg,image/png,image/webp"
                                          className="hidden"
                                          onChange={handleLogoFileSelect}
                                          disabled={isUploading}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Banner */}
                        <div className="space-y-3 border-b pb-6">
                          <h4 className="text-sm font-semibold">Główne zdjęcie profilowe (Banner)</h4>
                          <FormField
                            control={form.control}
                            name="zdjecieGlowne"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div>
                                    {field.value ? (
                                      <div className="space-y-3">
                                        <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-muted shadow-sm">
                                          <Image
                                            src={field.value}
                                            alt="Zdjęcie główne"
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <label
                                            htmlFor="main-image-upload"
                                            className="inline-flex items-center justify-center rounded-md text-xs font-semibold border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer shadow-sm transition-colors"
                                          >
                                            {isUploading ? (
                                              <>
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                Przesyłanie...
                                              </>
                                            ) : (
                                              <>
                                                <Upload className="mr-1.5 h-3.5 w-3.5 text-primary" />
                                                Zmień banner
                                              </>
                                            )}
                                          </label>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemoveSingleImage("zdjecieGlowne")}
                                            disabled={isUploading}
                                            className="text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive text-xs"
                                          >
                                            <X className="mr-1.5 h-3.5 w-3.5" />
                                            Usuń banner
                                          </Button>
                                        </div>
                                        <input
                                          id="main-image-upload"
                                          type="file"
                                          accept="image/jpeg,image/jpg,image/png,image/webp"
                                          className="hidden"
                                          onChange={handleMainImageFileSelect}
                                          disabled={isUploading}
                                        />
                                      </div>
                                    ) : (
                                      <div>
                                        <label
                                          htmlFor="main-image-upload"
                                          className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors bg-muted/10"
                                        >
                                          <div className="flex flex-col items-center justify-center pt-4 pb-4">
                                            {isUploading ? (
                                              <>
                                                <Loader2 className="h-8 w-8 mb-2 text-muted-foreground animate-spin" />
                                                <p className="text-xs text-muted-foreground">Przesyłanie...</p>
                                              </>
                                            ) : (
                                              <>
                                                <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground/60" />
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                  <span className="font-semibold">Kliknij aby wgrać</span> banner
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                  PNG, JPG, WEBP (max 5MB, format panoramiczny)
                                                </p>
                                              </>
                                            )}
                                          </div>
                                        </label>
                                        <input
                                          id="main-image-upload"
                                          type="file"
                                          accept="image/jpeg,image/jpg,image/png,image/webp"
                                          className="hidden"
                                          onChange={handleMainImageFileSelect}
                                          disabled={isUploading}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Galeria zdjęć */}
                        <div className="space-y-3 border-b pb-6">
                          <FormField
                            control={form.control}
                            name="galeriaZdjec"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold">Galeria zdjęć profilowych</FormLabel>
                                <FormControl>
                                  <GalleryEditor value={field.value} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* YouTube Video */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold">Film promocyjny YouTube</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="filmYouTube"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL filmu na YouTube</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="okladkaFilmu"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL miniatury filmu (opcjonalnie)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="URL do miniatury" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="kolejnoscMultimedia"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Co wyświetlać jako pierwsze na profilu?</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-full sm:w-[220px]">
                                      <SelectValue placeholder="Wybierz kolejność" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="zdjecia">Zdjęcia i Galerię</SelectItem>
                                    <SelectItem value="film">Wideo YouTube</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* --- TAB 6: STATS --- */}
                  {activeTab === "stats" && (
                    <>
                      <AdminStatisticsCard statistics={statistics} />
                      <AdminNotificationSettingsCard notificationSettings={notificationSettings} />
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Sticky Actions Bar at the bottom of the page */}
          <div className="sticky bottom-4 left-0 right-0 z-20 bg-background/90 backdrop-blur border border-border p-4 rounded-xl flex justify-between items-center gap-4 shadow-lg">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>Status walidacji:</span>
              {Object.keys(form.formState.errors).length > 0 ? (
                <span className="text-destructive flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="h-4 w-4 animate-bounce" />
                  Wykryto błędy w zakładkach
                </span>
              ) : (
                <span className="text-green-500 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Wszystkie pola poprawne
                </span>
              )}
            </div>

            <div className="flex gap-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/law-firms")}
                className="h-9"
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-9 font-semibold px-5">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  "Zapisz Zmiany"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Croppers */}
      {selectedLogoFile && (
        <ImageCropper
          image={selectedLogoFile}
          aspectRatio={1}
          onCropComplete={handleLogoCropComplete}
          onCancel={handleLogoCropCancel}
          open={showLogoCropper}
        />
      )}

      {selectedMainImageFile && (
        <ImageCropper
          image={selectedMainImageFile}
          aspectRatio={2}
          onCropComplete={handleMainImageCropComplete}
          onCancel={handleMainImageCropCancel}
          open={showMainImageCropper}
        />
      )}
    </div>
  )
}
