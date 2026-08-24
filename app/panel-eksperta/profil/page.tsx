"use client"

import { ConsultationHoursForm } from "@/components/panel-eksperta/ConsultationHoursForm"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { BasicTab } from "@/components/panel-eksperta/profil/BasicTab"
import { ContactTab } from "@/components/panel-eksperta/profil/ContactTab"
import { MultimediaTab } from "@/components/panel-eksperta/profil/MultimediaTab"
import { OfficeHoursCard } from "@/components/panel-eksperta/profil/OfficeHoursCard"
import { ProfileScoreCard } from "@/components/panel-eksperta/profil/ProfileScoreCard"
import { SpecializationTab } from "@/components/panel-eksperta/profil/SpecializationTab"
import { Button } from "@/components/ui/button"
import { ImageCropper } from "@/components/ui/image-cropper"
import { toast } from "@/components/ui/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, User, MapPin, Award, Image as ImageIcon, Clock } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

import type { Voivodeship, City } from "@/types"


import { Category } from "@/types/categories"

function LawFirmProfilePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (
      tabParam &&
      ["basic", "contact", "specialization", "multimedia", "consultations"].includes(
        tabParam
      )
    ) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const currentPath = window.location.pathname
    const newUrl = `${currentPath}?tab=${value}`
    router.push(newUrl, { scroll: false })
  }

  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [expertiseCategories, setExpertiseCategories] = useState<any[]>([])
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null)
  const [showLogoCropper, setShowLogoCropper] = useState(false)
  const [selectedMainImageFile, setSelectedMainImageFile] = useState<File | null>(null)
  const [showMainImageCropper, setShowMainImageCropper] = useState(false)
  const [limitSlowKluczowych, setLimitSlowKluczowych] = useState(5)
  const [citiesByVoivodeship, setCitiesByVoivodeship] = useState<Record<string, City[]>>({})
  const [loadingCities, setLoadingCities] = useState<Record<string, boolean>>({})
  const [hasMoreCities, setHasMoreCities] = useState<Record<string, boolean>>({})
  const [loadingMoreCities, setLoadingMoreCities] = useState<Record<string, boolean>>({})
  const [maxVoivodeships, setMaxVoivodeships] = useState(1)
  const [maxCities, setMaxCities] = useState(3)

  const [formData, setFormData] = useState({
    id: "",
    slug: "",
    // Dane podstawowe
    nazwa: "",
    opis: "",
    logo: "",
    zdjecieGlowne: "",

    // Dane kontaktowe
    imieKontakt: "",
    nazwiskoKontakt: "",
    emailKontakt: "",
    numerTelefonu: "",
    numerTelefonu2: "",
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

    // Biegły sądowy (odznaka na wizytówce)
    bieglySadowy: false,
    bieglySadowyNazwaSadu: "",

    // Obszar działania
    calaPolska: false,
    onlineOnly: false,
    voivodeshipsIds: [] as string[],
    citiesIds: [] as string[],
    categoriesIds: [] as string[],

    // Multimedia
    galeriaZdjec: [] as string[],
    filmYouTube: "",
    okladkaFilmu: "",
    kolejnoscMultimedia: "zdjecia",

    expertiseCategoryId: "",

    // Dane firmy do faktury (COMPANY_*) — null gdy rejestracja jako osoba prywatna
    companyData: null as null | {
      COMPANY_name?: string | null
      COMPANY_nip?: string | null
      COMPANY_regon?: string | null
      COMPANY_krs?: string | null
      COMPANY_residenceAddress?: string | null
      COMPANY_workingAddress?: string | null
      COMPANY_statusVat?: string | null
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pobierz dane pomocnicze
        const [voivRes, lawFirmRes, areaRes, expRes] = await Promise.all([
          fetch("/api/voivodeships"),
          session?.user?.id ? fetch(`/api/law-firms/${session.user.id}`) : null,
          fetch("/api/law-firm/area"),
          fetch("/api/expertise-categories"),
        ])

        if (voivRes.ok) {
          const voivData = await voivRes.json()
          setVoivodeships(voivData)
        }

        if (expRes && expRes.ok) {
          const expData = await expRes.json()
          setExpertiseCategories(expData)
        }

        if (areaRes && areaRes.ok) {
          const areaData = await areaRes.json()
          setMaxVoivodeships(areaData.maxVoivodeships || 1)
          setMaxCities(areaData.maxCities || 3)
        }

        if (lawFirmRes && lawFirmRes.ok) {
          const lawFirmData = await lawFirmRes.json()

          if (lawFirmData.categories) {
            const mappedCategories = lawFirmData.categories.map((c: any) => c.category)
            setCategories(mappedCategories)
          }

          setLimitSlowKluczowych(typeof lawFirmData.limitSlowKluczowych === "number" ? lawFirmData.limitSlowKluczowych : 5)
          const normalizedData = {
            ...lawFirmData,
            // Email konta użytkownika (tylko do wyświetlenia)
            emailKontakt: lawFirmData.user?.email || session?.user?.email || "",
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
            if (
              normalizedData[key] === null &&
              typeof formData[key as keyof typeof formData] === "string"
            ) {
              normalizedData[key] = ""
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
                  const response = await fetch(`/api/cities?voivodeshipId=${vId}&limit=50&offset=0`)
                  if (response.ok) {
                    const data = await response.json()
                    setCitiesByVoivodeship((prev) => ({ ...prev, [vId]: data }))
                    setHasMoreCities((prev) => ({ ...prev, [vId]: data.length === 50 }))
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
      const response = await fetch(`/api/cities?voivodeshipId=${voivodeshipId}&limit=50&offset=0`)
      if (response.ok) {
        const data = await response.json()
        setCitiesByVoivodeship((prev) => ({ ...prev, [voivodeshipId]: data }))
        setHasMoreCities((prev) => ({ ...prev, [voivodeshipId]: data.length === 50 }))
      }
    } catch (error) {
      console.error("Error fetching cities:", error)
    } finally {
      setLoadingCities((prev) => ({ ...prev, [voivodeshipId]: false }))
    }
  }

  const fetchMoreCities = async (voivodeshipId: string) => {
    if (loadingMoreCities[voivodeshipId] || !hasMoreCities[voivodeshipId]) return

    setLoadingMoreCities((prev) => ({ ...prev, [voivodeshipId]: true }))
    try {
      const currentCount = citiesByVoivodeship[voivodeshipId]?.length || 0
      const response = await fetch(`/api/cities?voivodeshipId=${voivodeshipId}&limit=50&offset=${currentCount}`)
      if (response.ok) {
        const data = await response.json()
        setCitiesByVoivodeship((prev) => ({
          ...prev,
          [voivodeshipId]: [...(prev[voivodeshipId] || []), ...data],
        }))
        setHasMoreCities((prev) => ({ ...prev, [voivodeshipId]: data.length === 50 }))
      }
    } catch (error) {
      console.error("Error fetching more cities:", error)
    } finally {
      setLoadingMoreCities((prev) => ({ ...prev, [voivodeshipId]: false }))
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
    if (!formData.calaPolska) {
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

  const handleCompanyDataChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      companyData: prev.companyData ? { ...prev.companyData, [field]: value } : prev.companyData,
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
      const originalName = selectedLogoFile?.name || "logo.jpg"
      const lastDot = originalName.lastIndexOf(".")
      const baseName = lastDot === -1 ? originalName : originalName.slice(0, lastDot)
      const mimeType = croppedBlob.type.split(";")[0]
      const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1] || "png"
      const fileName = `${baseName}.${extension}`

      const file = new File([croppedBlob], fileName, {
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
      const originalName = selectedMainImageFile?.name || "main-image.jpg"
      const lastDot = originalName.lastIndexOf(".")
      const baseName = lastDot === -1 ? originalName : originalName.slice(0, lastDot)
      const mimeType = croppedBlob.type.split(";")[0]
      const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1] || "png"
      const fileName = `${baseName}.${extension}`

      const file = new File([croppedBlob], fileName, {
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
    toast.success(field === "logo" ? "Logo zostało usunięte" : "Zdjęcie główne zostało usunięte")
  }

  if (isLoading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie profilu eksperta...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <PageHeader
        title="Profil Eksperta"
        subtitle="Edytuj dane prezentacyjne swojej eksperta widoczne dla klientów w wyszukiwarce."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">


        {/* Treść profilu — 2/3 szerokości */}
        <div className="lg:col-span-2 space-y-8">
          {/* Re-designed premium tab selector */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="p-1.5 bg-background/40 backdrop-blur-md border border-border/30 rounded-xl flex gap-1.5 w-full max-w-full overflow-x-auto custom-scrollbar relative z-10 scrollbar-none h-auto">
              <TabsTrigger
                value="basic"
                className="rounded-lg text-xs font-semibold py-2.5 px-4 text-muted-foreground hover:text-white hover:bg-muted/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border border-transparent data-[state=active]:border-primary/30 transition-all duration-200 flex items-center gap-2"
              >
                <User className="h-4 w-4 shrink-0" />
                <span>Dane podstawowe</span>
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="rounded-lg text-xs font-semibold py-2.5 px-4 text-muted-foreground hover:text-white hover:bg-muted/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border border-transparent data-[state=active]:border-primary/30 transition-all duration-200 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Kontakt</span>
              </TabsTrigger>
              <TabsTrigger
                value="specialization"
                className="rounded-lg text-xs font-semibold py-2.5 px-4 text-muted-foreground hover:text-white hover:bg-muted/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border border-transparent data-[state=active]:border-primary/30 transition-all duration-200 flex items-center gap-2"
              >
                <Award className="h-4 w-4 shrink-0" />
                <span>Oferta i zakres</span>
              </TabsTrigger>
              <TabsTrigger
                value="multimedia"
                className="rounded-lg text-xs font-semibold py-2.5 px-4 text-muted-foreground hover:text-white hover:bg-muted/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border border-transparent data-[state=active]:border-primary/30 transition-all duration-200 flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4 shrink-0" />
                <span>Galeria i wideo</span>
              </TabsTrigger>
              <TabsTrigger
                value="consultations"
                className="rounded-lg text-xs font-semibold py-2.5 px-4 text-muted-foreground hover:text-white hover:bg-muted/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border border-transparent data-[state=active]:border-primary/30 transition-all duration-200 flex items-center gap-2"
              >
                <Clock className="h-4 w-4 shrink-0" />
                <span>Godziny i dostępność</span>
              </TabsTrigger>
            </TabsList>

            {/* Dane podstawowe */}
            <TabsContent value="basic" className="space-y-6 animate-in fade-in-50 duration-300">
              <BasicTab
                formData={formData}
                handleInputChange={handleInputChange}
                isUploading={isUploading}
                handleLogoFileSelect={handleLogoFileSelect}
                handleMainImageFileSelect={handleMainImageFileSelect}
                handleRemoveSingleImage={handleRemoveSingleImage}
                expertiseCategories={expertiseCategories}
              />
            </TabsContent>

            {/* Dane kontaktowe */}
            <TabsContent value="contact" className="space-y-6 animate-in fade-in-50 duration-300">
              <ContactTab
                formData={formData}
                handleInputChange={handleInputChange}
                handleCompanyDataChange={handleCompanyDataChange}
                voivodeships={voivodeships}
              />
            </TabsContent>

            {/* Zakres usług */}
            <TabsContent value="specialization" className="space-y-6 animate-in fade-in-50 duration-300">
              <SpecializationTab
                formData={formData}
                categories={categories}
                limitSlowKluczowych={limitSlowKluczowych}
                handleInputChange={handleInputChange}
              />
            </TabsContent>

            {/* Multimedia */}
            <TabsContent value="multimedia" className="space-y-6 animate-in fade-in-50 duration-300">
              <MultimediaTab
                formData={formData}
                isUploading={isUploading}
                handleInputChange={handleInputChange}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
              />
            </TabsContent>

            {/* Godziny i dostępność */}
            <TabsContent value="consultations" className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 gap-6 items-start">
                <OfficeHoursCard formData={formData} handleInputChange={handleInputChange} />
                <ConsultationHoursForm />
              </div>
            </TabsContent>
          </Tabs>

          {/* Submit / Cancel Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 px-6 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-hover hover:to-primary text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-t border-border group gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Zapisz profil
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6 border-border/50 hover:bg-muted text-foreground rounded-xl transition-all duration-200"
              onClick={() => router.push("/panel-eksperta")}
              disabled={isSaving}
            >
              Anuluj
            </Button>
          </div>
        </div>

        {/* Ocena profilu — 1/3 szerokości */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <ProfileScoreCard formData={formData} onNavigate={handleTabChange} />
          </div>
        </div>
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

export default function LawFirmProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-[400px] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        </div>
      }
    >
      <LawFirmProfilePageContent />
    </Suspense>
  )
}
