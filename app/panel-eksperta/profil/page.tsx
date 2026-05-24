"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/sonner"
import { AlertCircle, Loader2, Upload, X, Image as ImageIcon, Globe, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { ImageCropper } from "@/components/ui/image-cropper"
import dynamic from "next/dynamic"

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="h-40 w-full flex items-center justify-center bg-background border border-border rounded-lg text-sm text-muted-foreground">Ładowanie edytora...</div>
  }
)

import { ConsultationHoursForm } from "@/components/panel-eksperta/ConsultationHoursForm"

interface Voivodeship {
  id: string
  nazwa: string
}

interface City {
  id: string
  nazwa: string
  voivodeshipId: string
}

interface Category {
  id: string
  nazwa: string
}

export default function LawFirmProfilePage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null)
  const [showLogoCropper, setShowLogoCropper] = useState(false)
  const [selectedMainImageFile, setSelectedMainImageFile] = useState<File | null>(null)
  const [showMainImageCropper, setShowMainImageCropper] = useState(false)
  const [limitSlowKluczowych, setLimitSlowKluczowych] = useState(5)
  const [citiesByVoivodeship, setCitiesByVoivodeship] = useState<Record<string, City[]>>({})
  const [loadingCities, setLoadingCities] = useState<Record<string, boolean>>({})
  const [maxVoivodeships, setMaxVoivodeships] = useState(1)
  const [maxCities, setMaxCities] = useState(3)

  const [formData, setFormData] = useState({
    id: "",
    slug: "",
    // Dane podstawowe
    nazwa: "",
    nazwaFirmy: "",
    opis: "",
    logo: "",
    zdjecieGlowne: "",

    // Dane kontaktowe
    imieKontakt: "",
    nazwiskoKontakt: "",
    stanowisko: "",
    numerTelefonu: "",
    numerTelefonu2: "",
    emailKontakt: "",
    stronaWww: "",

    // Adres
    adres: "",
    kodPocztowy: "",
    miasto: "",
    voivodeshipId: "",

    // Social media
    linkLinkedIn: "",
    linkFacebook: "",
    linkInstagram: "",
    linkTwitter: "",
    linkTikTok: "",

    // Godziny otwarcia
    statusGodzinyOtwarcia: false,
    godzinyOtwarcia: {
      poniedzialek: "",
      wtorek: "",
      sroda: "",
      czwartek: "",
      piatek: "",
      sobota: "",
      niedziela: "",
    },

    // Edukacja
    edukacja: [] as Array<{
      uczelnia: string
      wydzial: string
      rokOd: number
      rokDo: number
    }>,

    // Wpisy do rejestrów
    oirpMiasto: "",
    oirpWpis: "",
    oirpStatus: false,
    oraMiasto: "",
    oraWpis: "",
    oraStatus: false,

    // Specjalizacje
    unikatowyOpisUslugi: "",
    slowaKluczowe: [] as string[],

    // Obszar działania
    callaPolska: false,
    onlineOnly: false,
    voivodeshipsIds: [] as string[],
    citiesIds: [] as string[],
    categoriesIds: [] as string[],

    // Multimedia
    galeriaZdjec: [] as string[],
    filmYouTube: "",
    okladkaFilmu: "",
    kolejnoscMultimedia: "zdjecia",

    // Typ oferty
    typOferty: "WSZYSTKIE",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pobierz dane pomocnicze
        const [voivRes, catRes, lawFirmRes, areaRes] = await Promise.all([
          fetch("/api/voivodeships"),
          fetch("/api/categories"),
          session?.user?.id ? fetch(`/api/law-firms/${session.user.id}`) : null,
          fetch("/api/law-firm/area"),
        ])

        if (voivRes.ok) {
          const voivData = await voivRes.json()
          setVoivodeships(voivData)
        }

        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData)
        }

        if (areaRes && areaRes.ok) {
          const areaData = await areaRes.json()
          setMaxVoivodeships(areaData.maxVoivodeships || 1)
          setMaxCities(areaData.maxCities || 3)
        }

        if (lawFirmRes && lawFirmRes.ok) {
          const lawFirmData = await lawFirmRes.json()
          setLimitSlowKluczowych(lawFirmData.limitSlowKluczowych || 5)
          const normalizedData = {
            ...lawFirmData,
            voivodeshipsIds: lawFirmData.voivodeships?.map((v: any) => v.voivodeship.id) || [],
            citiesIds: lawFirmData.cities?.map((c: any) => c.city.id) || [],
            categoriesIds: lawFirmData.categories?.map((c: any) => c.category.id) || [],
            godzinyOtwarcia: lawFirmData.godzinyOtwarcia || {
              poniedzialek: "",
              wtorek: "",
              sroda: "",
              czwartek: "",
              piatek: "",
              sobota: "",
              niedziela: "",
            },
          }
          // Konwertuj null na puste stringi dla wszystkich pól
          Object.keys(normalizedData).forEach((key) => {
            if (normalizedData[key] === null && typeof formData[key as keyof typeof formData] === 'string') {
              normalizedData[key] = ''
            }
          })
          setFormData({
            ...formData,
            ...normalizedData,
          })

          // Pobierz miasta dla przypisanych województw
          const initialVoivIds = lawFirmData.voivodeships?.map((v: any) => v.voivodeship.id) || []
          if (initialVoivIds.length > 0) {
            await Promise.all(
              initialVoivIds.map(async (vId: string) => {
                try {
                  const response = await fetch(`/api/cities?voivodeshipId=${vId}`)
                  if (response.ok) {
                    const data = await response.json()
                    setCitiesByVoivodeship((prev) => ({ ...prev, [vId]: data }))
                  }
                } catch (e) {
                  console.error("Error fetching initial cities:", e)
                }
              })
            )
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Nie udało się pobrać danych")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session])

  const fetchCities = async (voivodeshipId: string) => {
    if (citiesByVoivodeship[voivodeshipId]) return

    setLoadingCities((prev) => ({ ...prev, [voivodeshipId]: true }))
    try {
      const response = await fetch(`/api/cities?voivodeshipId=${voivodeshipId}`)
      if (response.ok) {
        const data = await response.json()
        setCitiesByVoivodeship((prev) => ({ ...prev, [voivodeshipId]: data }))
      }
    } catch (error) {
      console.error("Error fetching cities:", error)
    } finally {
      setLoadingCities((prev) => ({ ...prev, [voivodeshipId]: false }))
    }
  }

  const toggleVoivodeship = (id: string) => {
    const isSelected = formData.voivodeshipsIds.includes(id)
    if (isSelected) {
      const newCities = formData.citiesIds.filter((cityId) => {
        const city = Object.values(citiesByVoivodeship)
          .flat()
          .find((c) => c.id === cityId)
        return city?.voivodeshipId !== id
      })
      setFormData((prev) => ({
        ...prev,
        voivodeshipsIds: prev.voivodeshipsIds.filter((vId) => vId !== id),
        citiesIds: newCities,
      }))
    } else {
      if (formData.voivodeshipsIds.length >= maxVoivodeships) {
        toast.error(`Limit województw (${maxVoivodeships}) osiągnięty.`)
        return
      }
      fetchCities(id)
      setFormData((prev) => ({
        ...prev,
        voivodeshipsIds: [...prev.voivodeshipsIds, id],
      }))
    }
  }

  const toggleCity = (id: string) => {
    const isSelected = formData.citiesIds.includes(id)
    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        citiesIds: prev.citiesIds.filter((cId) => cId !== id),
      }))
    } else {
      if (formData.citiesIds.length >= maxCities) {
        toast.error(`Limit miast (${maxCities}) osiągnięty.`)
        return
      }
      setFormData((prev) => ({
        ...prev,
        citiesIds: [...prev.citiesIds, id],
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Walidacja limitów obszaru działania
    if (!formData.callaPolska) {
      if (formData.voivodeshipsIds.length > maxVoivodeships) {
        toast.error(`Przekroczono limit województw (${maxVoivodeships})`)
        setIsSaving(false)
        return
      }
      if (formData.citiesIds.length > maxCities) {
        toast.error(`Przekroczono limit miast (${maxCities})`)
        setIsSaving(false)
        return
      }
    }

    try {
      // Wyklucz categoriesIds, aby nie nadpisać kolejności ustawionej w Zakresie usług
      const { categoriesIds, ...dataToSave } = formData

      const response = await fetch(`/api/law-firms/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Nie udało się zapisać profilu")
      }

      toast.success("Profil został zaktualizowany")
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error(error instanceof Error ? error.message : "Nie udało się zapisać profilu")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Sprawdź limit 10 zdjęć
    if (formData.galeriaZdjec.length + files.length > 10) {
      toast.error("Możesz dodać maksymalnie 10 zdjęć do galerii")
      return
    }

    setIsUploading(true)

    try {
      const uploadedUrls = []

      for (const file of Array.from(files)) {
        const formDataToSend = new FormData()
        formDataToSend.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataToSend,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const data = await response.json()
        uploadedUrls.push(data.url)
      }

      handleInputChange("galeriaZdjec", [...formData.galeriaZdjec, ...uploadedUrls])

      toast.success(`Dodano ${uploadedUrls.length} zdjęć do galerii`)
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.error(error instanceof Error ? error.message : "Nie udało się przesłać zdjęć")
    } finally {
      setIsUploading(false)
      // Reset input
      e.target.value = ""
    }
  }

  const handleRemoveImage = (index: number) => {
    const newGallery = formData.galeriaZdjec.filter((_, i) => i !== index)
    handleInputChange("galeriaZdjec", newGallery)
    toast.success("Zdjęcie zostało usunięte")
  }

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Nieprawidłowy typ pliku. Dozwolone: JPEG, PNG, WebP")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Plik jest za duży. Maksymalny rozmiar to 5MB")
      return
    }

    // Show cropper
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
        handleInputChange("logo", uploadUrl)
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

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Nieprawidłowy typ pliku. Dozwolone: JPEG, PNG, WebP")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Plik jest za duży. Maksymalny rozmiar to 5MB")
      return
    }

    // Show cropper
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
        handleInputChange("zdjecieGlowne", uploadUrl)
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
    handleInputChange(field, "")
    toast.success(
      field === "logo" ? "Logo zostało usunięte" : "Zdjęcie główne zostało usunięte"
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-white font-playfair">Profil Eksperta</h1>
        <p className="text-muted-foreground">Zarządzaj informacjami o swoim profilu</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList id="tour-profil-tabs">
          <TabsTrigger value="basic">Podstawowe</TabsTrigger>
          <TabsTrigger value="contact">Kontakt</TabsTrigger>
          <TabsTrigger value="specialization">Zakres usług</TabsTrigger>
          <TabsTrigger value="multimedia">Multimedia</TabsTrigger>
          <TabsTrigger value="consultations">Godziny konsultacji</TabsTrigger>
          <TabsTrigger value="additional">Dodatkowe</TabsTrigger>
        </TabsList>

        {/* Dane podstawowe */}
        <TabsContent value="basic" className="space-y-6">
          <Card id="tour-profil-basic">
            <CardHeader>
              <CardTitle>Dane podstawowe</CardTitle>
              <CardDescription>Podstawowe informacje o ekspercie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nazwa">Nazwa wyświetlana *</Label>
                  <Input
                    id="nazwa"
                    value={formData.nazwa}
                    onChange={(e) => handleInputChange("nazwa", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nazwaFirmy">Nazwa firmy *</Label>
                  <Input
                    id="nazwaFirmy"
                    value={formData.nazwaFirmy}
                    onChange={(e) => handleInputChange("nazwaFirmy", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="opis">Opis profilu</Label>
                  <RichTextEditor
                    value={formData.opis}
                    onChange={(value) => handleInputChange("opis", value)}
                    placeholder="Opisz swoje doświadczenie i usługi..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="tour-profil-logo">
            <CardHeader>
              <CardTitle>Logo i zdjęcia</CardTitle>
              <CardDescription>
                Dodaj zdjęcie profilowe oraz zdjęcie główne
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <Label>Zdjęcie profilowe (Avatar)</Label>
                <p className="text-sm text-muted-foreground">
                  Zdjęcie będzie wyświetlane na Twojej stronie eksperta i w wynikach wyszukiwania.
                  Zalecany rozmiar: 400x400px (kwadratowe).
                </p>

                {formData.logo ? (
                  <div className="flex items-start gap-4">
                    <div className="relative h-32 w-32 rounded-lg overflow-hidden border-2 border-border bg-card">
                      <Image
                        src={formData.logo}
                        alt="Logo"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="logo-upload"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Przesyłanie...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Zmień logo
                          </>
                        )}
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveSingleImage("logo")}
                        disabled={isUploading}
                      >
                        <X className="mr-2 h-4 w-4" />
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
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                          <>
                            <Loader2 className="h-10 w-10 mb-3 text-muted-foreground animate-spin" />
                            <p className="text-sm text-muted-foreground">Przesyłanie...</p>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-10 w-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Kliknij aby przesłać</span> logo
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, WEBP (max 5MB)
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

              <Separator />

              {/* Zdjęcie główne Upload */}
              <div className="space-y-3">
                <Label>Zdjęcie główne</Label>
                <p className="text-sm text-muted-foreground">
                  Zdjęcie główne będzie wyświetlane jako banner na górze Twojej strony eksperta.
                  Zalecany rozmiar: 1920x600px (panoramiczne).
                </p>

                {formData.zdjecieGlowne ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                      <Image
                        src={formData.zdjecieGlowne}
                        alt="Zdjęcie główne"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <label
                        htmlFor="main-image-upload"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Przesyłanie...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Zmień zdjęcie
                          </>
                        )}
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveSingleImage("zdjecieGlowne")}
                        disabled={isUploading}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Usuń zdjęcie
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
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                          <>
                            <Loader2 className="h-10 w-10 mb-3 text-muted-foreground animate-spin" />
                            <p className="text-sm text-muted-foreground">Przesyłanie...</p>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-10 w-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Kliknij aby przesłać</span> zdjęcie główne
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, WEBP (max 5MB)
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dane kontaktowe */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dane kontaktowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="imieKontakt">Imię kontaktowe *</Label>
                  <Input
                    id="imieKontakt"
                    value={formData.imieKontakt}
                    onChange={(e) => handleInputChange("imieKontakt", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nazwiskoKontakt">Nazwisko kontaktowe *</Label>
                  <Input
                    id="nazwiskoKontakt"
                    value={formData.nazwiskoKontakt}
                    onChange={(e) => handleInputChange("nazwiskoKontakt", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="numerTelefonu">Telefon główny *</Label>
                  <Input
                    id="numerTelefonu"
                    value={formData.numerTelefonu}
                    onChange={(e) => handleInputChange("numerTelefonu", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="numerTelefonu2">Telefon dodatkowy</Label>
                  <Input
                    id="numerTelefonu2"
                    value={formData.numerTelefonu2}
                    onChange={(e) => handleInputChange("numerTelefonu2", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="emailKontakt">Email *</Label>
                  <Input
                    id="emailKontakt"
                    type="email"
                    value={formData.emailKontakt}
                    onChange={(e) => handleInputChange("emailKontakt", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stronaWww">Strona WWW</Label>
                  <Input
                    id="stronaWww"
                    value={formData.stronaWww}
                    onChange={(e) => handleInputChange("stronaWww", e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="adres">Adres *</Label>
                  <Input
                    id="adres"
                    value={formData.adres}
                    onChange={(e) => handleInputChange("adres", e.target.value)}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="kodPocztowy">Kod pocztowy *</Label>
                    <Input
                      id="kodPocztowy"
                      value={formData.kodPocztowy}
                      onChange={(e) => handleInputChange("kodPocztowy", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="miasto">Miasto *</Label>
                    <Input
                      id="miasto"
                      value={formData.miasto}
                      onChange={(e) => handleInputChange("miasto", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="voivodeshipId">Województwo *</Label>
                  <Select
                    value={formData.voivodeshipId}
                    onValueChange={(value) => handleInputChange("voivodeshipId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz województwo" />
                    </SelectTrigger>
                    <SelectContent>
                      {voivodeships.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.nazwa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Social Media</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="LinkedIn URL"
                    value={formData.linkLinkedIn}
                    onChange={(e) => handleInputChange("linkLinkedIn", e.target.value)}
                  />
                  <Input
                    placeholder="Facebook URL"
                    value={formData.linkFacebook}
                    onChange={(e) => handleInputChange("linkFacebook", e.target.value)}
                  />
                  <Input
                    placeholder="Instagram URL"
                    value={formData.linkInstagram}
                    onChange={(e) => handleInputChange("linkInstagram", e.target.value)}
                  />
                  <Input
                    placeholder="Twitter URL"
                    value={formData.linkTwitter}
                    onChange={(e) => handleInputChange("linkTwitter", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zakres usług */}
        <TabsContent value="specialization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Zakres usług</CardTitle>
              <CardDescription>Twoje wybrane specjalizacje i zakres świadczonych usług</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Wybrane kategorie</Label>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/panel-eksperta/zakres-uslug">
                      Zarządzaj usługami
                    </Link>
                  </Button>
                </div>

                {formData.categoriesIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30">
                    {formData.categoriesIds.map((id) => {
                      const category = categories.find(c => c.id === id);
                      return category ? (
                        <Badge key={id} variant="secondary" className="px-3 py-1">
                          {category.nazwa}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">Nie wybrano jeszcze żadnych kategorii usług.</p>
                    <Button variant="outline" asChild>
                      <Link href="/panel-eksperta/zakres-uslug">
                        Dodaj pierwsze usługi
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="unikatowyOpisUslugi">Unikalny opis usługi</Label>
                  <Textarea
                    id="unikatowyOpisUslugi"
                    value={formData.unikatowyOpisUslugi}
                    onChange={(e) => handleInputChange("unikatowyOpisUslugi", e.target.value)}
                    rows={4}
                    placeholder="Opisz swoje unikalne podejście do świadczenia usług..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Ten opis będzie widoczny na Twoim publicznym profilu w sekcji "Zakres usług".
                  </p>
                </div>

                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="slowoKluczowe">Słowa kluczowe</Label>
                    <span className="text-xs text-muted-foreground">
                      Dodano {formData.slowaKluczowe.length} z {limitSlowKluczowych} dostępnych
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="slowoKluczowe"
                      placeholder={
                        formData.slowaKluczowe.length >= limitSlowKluczowych
                          ? "Osiągnięto limit słów kluczowych"
                          : "Dodaj słowo kluczowe..."
                      }
                      disabled={formData.slowaKluczowe.length >= limitSlowKluczowych}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          if (formData.slowaKluczowe.length >= limitSlowKluczowych) {
                            return
                          }
                          const value = e.currentTarget.value.trim()
                          if (value && !formData.slowaKluczowe.includes(value)) {
                            handleInputChange("slowaKluczowe", [...formData.slowaKluczowe, value])
                            e.currentTarget.value = ""
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      disabled={formData.slowaKluczowe.length >= limitSlowKluczowych}
                      onClick={(e) => {
                        if (formData.slowaKluczowe.length >= limitSlowKluczowych) {
                          return
                        }
                        const input = document.getElementById("slowoKluczowe") as HTMLInputElement
                        const value = input.value.trim()
                        if (value && !formData.slowaKluczowe.includes(value)) {
                          handleInputChange("slowaKluczowe", [...formData.slowaKluczowe, value])
                          input.value = ""
                        }
                      }}
                    >
                      Dodaj
                    </Button>
                  </div>
                  {formData.slowaKluczowe.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.slowaKluczowe.map((keyword, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                        >
                          <span>{keyword}</span>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange(
                                "slowaKluczowe",
                                formData.slowaKluczowe.filter((_, i) => i !== index)
                              )
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          <Card id="tour-zakres-area" className="shadow-sm border-muted/60">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Obszar działania</CardTitle>
                  <CardDescription>
                    Zdefiniuj, gdzie i w jaki sposób świadczysz pomoc prawną.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3">Tryb świadczenia usług</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                    formData.callaPolska ? "bg-primary/5 border-primary shadow-sm" : "border-muted bg-card hover:bg-accent/30"
                  )} onClick={() => handleInputChange("callaPolska", !formData.callaPolska)}>
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", formData.callaPolska ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Cała Polska</p>
                        <p className="text-xs text-muted-foreground">Widoczność w każdym mieście</p>
                      </div>
                    </div>
                    <Switch checked={formData.callaPolska} onCheckedChange={(val) => handleInputChange("callaPolska", val)} />
                  </div>

                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                    formData.onlineOnly ? "bg-primary/5 border-primary shadow-sm" : "border-muted bg-card hover:bg-accent/30"
                  )} onClick={() => handleInputChange("onlineOnly", !formData.onlineOnly)}>
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", formData.onlineOnly ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <div className="h-5 w-5 flex items-center justify-center font-bold text-[10px]">WEB</div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Tylko online</p>
                        <p className="text-xs text-muted-foreground">Konsultacje zdalne</p>
                      </div>
                    </div>
                    <Switch checked={formData.onlineOnly} onCheckedChange={(val) => handleInputChange("onlineOnly", val)} />
                  </div>
                </div>
              </div>

              {!formData.callaPolska && (
                <div className="pt-4 border-t border-muted">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold">Lokalizacje stacjonarne</h4>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Województwa: <span className={formData.voivodeshipsIds.length >= maxVoivodeships ? "text-destructive font-bold" : "font-bold"}>{formData.voivodeshipsIds.length}</span> / {maxVoivodeships}</span>
                      <span>Miasta: <span className={formData.citiesIds.length >= maxCities ? "text-destructive font-bold" : "font-bold"}>{formData.citiesIds.length}</span> / {maxCities}</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase text-muted-foreground tracking-wider px-1">Województwa</h5>
                      <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar border rounded-xl p-3 bg-muted/10">
                        {voivodeships.map(v => (
                          <div key={v.id} className={cn(
                            "flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer",
                            formData.voivodeshipsIds.includes(v.id)
                              ? "bg-primary/5 border-primary/30 text-primary font-medium"
                              : "border-transparent bg-card hover:bg-muted/50"
                          )} onClick={() => toggleVoivodeship(v.id)}>
                            <Checkbox checked={formData.voivodeshipsIds.includes(v.id)} onCheckedChange={() => toggleVoivodeship(v.id)} />
                            <span className="text-sm">{v.nazwa}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase text-muted-foreground tracking-wider px-1">Miasta w wybranych województwach</h5>
                      <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar border rounded-xl p-3 bg-muted/10">
                        {formData.voivodeshipsIds.length === 0 ? (
                          <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-muted-foreground py-10 opacity-60">
                            <MapPin className="h-8 w-8 mb-2 text-muted-foreground/55 animate-pulse" />
                            <p className="text-xs font-medium">Wybierz województwo po lewej stronie</p>
                          </div>
                        ) : (
                          formData.voivodeshipsIds.map(vId => {
                            const vName = voivodeships.find(v => v.id === vId)?.nazwa
                            const cities = citiesByVoivodeship[vId] || []
                            const isLoading = loadingCities[vId]

                            return (
                              <div key={vId} className="mb-4 last:mb-0">
                                <div className="text-[10px] font-bold text-muted-foreground mb-2 flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                  {vName}
                                </div>
                                <div className="grid grid-cols-1 gap-1">
                                  {isLoading ? (
                                    <div className="py-2 flex items-center gap-2 text-xs text-muted-foreground">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Ładowanie miast...
                                    </div>
                                  ) : cities.length === 0 ? (
                                    <div className="py-2 text-[10px] italic text-muted-foreground">Brak miast w bazie.</div>
                                  ) : (
                                    cities.map(city => (
                                      <div key={city.id} className={cn(
                                        "flex items-center gap-2 p-1.5 rounded-md transition-all cursor-pointer",
                                        formData.citiesIds.includes(city.id)
                                          ? "bg-primary/10 text-primary font-medium"
                                          : "hover:bg-muted"
                                      )} onClick={() => toggleCity(city.id)}>
                                        <Checkbox checked={formData.citiesIds.includes(city.id)} onCheckedChange={() => toggleCity(city.id)} />
                                        <span className="text-xs">{city.nazwa}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        {/* Multimedia */}
        <TabsContent value="multimedia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Galeria zdjęć</CardTitle>
              <CardDescription>
                Dodaj zdjęcia swojego profilu (maksymalnie 10 zdjęć, każde do 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Button */}
              <div className="flex items-center gap-4">
                <label
                  htmlFor="gallery-upload"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Przesyłanie...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Dodaj zdjęcia
                    </>
                  )}
                </label>
                <input
                  id="gallery-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading || formData.galeriaZdjec.length >= 10}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.galeriaZdjec.length} / 10 zdjęć
                </span>
              </div>

              {/* Gallery Grid */}
              {formData.galeriaZdjec.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.galeriaZdjec.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
                        <Image
                          src={imageUrl}
                          alt={`Galeria ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                          title="Usuń zdjęcie"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-center text-muted-foreground mt-1">
                        Zdjęcie {index + 1}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Brak zdjęć w galerii
                  </p>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    Kliknij "Dodaj zdjęcia" aby przesłać zdjęcia
                  </p>
                </div>
              )}

              {formData.galeriaZdjec.length > 0 && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Wskazówka:</strong> Zdjęcia będą wyświetlane w galerii na Twoim profilu.
                    Najedź kursorem na zdjęcie i kliknij przycisk X aby je usunąć.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Film YouTube (opcjonalnie)</CardTitle>
              <CardDescription>
                Dodaj link do filmu na YouTube prezentującego Twój profil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="filmYouTube">Link do filmu YouTube</Label>
                <Input
                  id="filmYouTube"
                  value={formData.filmYouTube}
                  onChange={(e) => handleInputChange("filmYouTube", e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="kolejnoscMultimedia">Kolejność wyświetlania</Label>
                <Select
                  value={formData.kolejnoscMultimedia}
                  onValueChange={(value) => handleInputChange("kolejnoscMultimedia", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zdjecia">Najpierw zdjęcia, potem film</SelectItem>
                    <SelectItem value="film">Najpierw film, potem zdjęcia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Godziny konsultacji */}
        <TabsContent value="consultations">
          <ConsultationHoursForm />
        </TabsContent>


        {/* Dodatkowe */}
        <TabsContent value="additional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wpisy do rejestrów</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="oirpStatus"
                    checked={formData.oirpStatus}
                    onCheckedChange={(checked) => handleInputChange("oirpStatus", checked)}
                  />
                  <Label htmlFor="oirpStatus">Wpis do OIRP</Label>
                </div>

                {formData.oirpStatus && (
                  <div className="grid md:grid-cols-2 gap-4 ml-8">
                    <Input
                      placeholder="Miasto OIRP"
                      value={formData.oirpMiasto}
                      onChange={(e) => handleInputChange("oirpMiasto", e.target.value)}
                    />
                    <Input
                      placeholder="Numer wpisu"
                      value={formData.oirpWpis}
                      onChange={(e) => handleInputChange("oirpWpis", e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="oraStatus"
                    checked={formData.oraStatus}
                    onCheckedChange={(checked) => handleInputChange("oraStatus", checked)}
                  />
                  <Label htmlFor="oraStatus">Wpis do ORA</Label>
                </div>

                {formData.oraStatus && (
                  <div className="grid md:grid-cols-2 gap-4 ml-8">
                    <Input
                      placeholder="Miasto ORA"
                      value={formData.oraMiasto}
                      onChange={(e) => handleInputChange("oraMiasto", e.target.value)}
                    />
                    <Input
                      placeholder="Numer wpisu"
                      value={formData.oraWpis}
                      onChange={(e) => handleInputChange("oraWpis", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Godziny otwarcia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="statusGodzinyOtwarcia"
                  checked={formData.statusGodzinyOtwarcia}
                  onCheckedChange={(checked) => handleInputChange("statusGodzinyOtwarcia", checked)}
                />
                <Label htmlFor="statusGodzinyOtwarcia">Wyświetl godziny otwarcia</Label>
              </div>

              {formData.statusGodzinyOtwarcia && formData.godzinyOtwarcia && (
                <div className="grid gap-3">
                  {Object.keys(formData.godzinyOtwarcia).map((day) => {
                    const currentValue = formData.godzinyOtwarcia[day as keyof typeof formData.godzinyOtwarcia]
                    const [fromTime, toTime] = currentValue.split('-').map(t => t.trim())

                    return (
                      <div key={day} className="grid md:grid-cols-[120px_1fr_auto_1fr] gap-2 items-center">
                        <Label className="capitalize">{day}</Label>
                        <Select
                          value={fromTime || ""}
                          onValueChange={(value) => {
                            const to = toTime || "17:00"
                            handleInputChange("godzinyOtwarcia", {
                              ...formData.godzinyOtwarcia,
                              [day]: value === "zamkniete" ? "Zamknięte" : `${value}-${to}`,
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Od" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zamkniete">Zamknięte</SelectItem>
                            {Array.from({ length: 48 }, (_, i) => {
                              const hour = Math.floor(i / 2)
                              const minute = i % 2 === 0 ? "00" : "30"
                              const time = `${hour.toString().padStart(2, '0')}:${minute}`
                              return (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <span className="text-center text-muted-foreground">-</span>
                        <Select
                          value={toTime || ""}
                          onValueChange={(value) => {
                            const from = fromTime || "09:00"
                            if (from !== "zamkniete" && from !== "Zamknięte") {
                              handleInputChange("godzinyOtwarcia", {
                                ...formData.godzinyOtwarcia,
                                [day]: `${from}-${value}`,
                              })
                            }
                          }}
                          disabled={fromTime === "zamkniete" || !fromTime || currentValue === "Zamknięte"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Do" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 48 }, (_, i) => {
                              const hour = Math.floor(i / 2)
                              const minute = i % 2 === 0 ? "00" : "30"
                              const time = `${hour.toString().padStart(2, '0')}:${minute}`

                              // Porównanie czasów - konwertuj do minut od północy
                              const timeToMinutes = (t: string) => {
                                const [h, m] = t.split(':').map(Number)
                                return h * 60 + m
                              }

                              const fromMinutes = fromTime ? timeToMinutes(fromTime) : 0
                              const currentMinutes = timeToMinutes(time)

                              // Tylko czasy po godzinie "od"
                              if (currentMinutes <= fromMinutes) return null

                              return (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" disabled={isSaving}>
          Anuluj
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Zapisz profil
        </Button>
      </div>

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
    </form>
  )
}

