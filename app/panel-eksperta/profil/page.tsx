"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Button } from "@/components/ui/button"
import { ImageCropper } from "@/components/ui/image-cropper"
import { toast } from "@/components/ui/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

import { ConsultationHoursForm } from "@/components/panel-eksperta/ConsultationHoursForm"
import { BasicTab } from "@/components/panel-eksperta/profil/BasicTab"
import { ContactTab } from "@/components/panel-eksperta/profil/ContactTab"
import { SpecializationTab } from "@/components/panel-eksperta/profil/SpecializationTab"
import { MultimediaTab } from "@/components/panel-eksperta/profil/MultimediaTab"
import { AdditionalTab } from "@/components/panel-eksperta/profil/AdditionalTab"

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

function LawFirmProfilePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam && ["basic", "contact", "specialization", "multimedia", "consultations", "additional"].includes(tabParam)) {
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
      <PageHeader
        title="Profil Eksperta"
        subtitle="Zarządzaj informacjami o swoim profilu"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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
          <BasicTab
            formData={formData}
            handleInputChange={handleInputChange}
            isUploading={isUploading}
            handleLogoFileSelect={handleLogoFileSelect}
            handleMainImageFileSelect={handleMainImageFileSelect}
            handleRemoveSingleImage={handleRemoveSingleImage}
          />
        </TabsContent>

        {/* Dane kontaktowe */}
        <TabsContent value="contact" className="space-y-6">
          <ContactTab
            formData={formData}
            handleInputChange={handleInputChange}
            voivodeships={voivodeships}
          />
        </TabsContent>

        {/* Zakres usług */}
        <TabsContent value="specialization" className="space-y-6">
          <SpecializationTab
            formData={formData}
            categories={categories}
            limitSlowKluczowych={limitSlowKluczowych}
            maxVoivodeships={maxVoivodeships}
            maxCities={maxCities}
            voivodeships={voivodeships}
            citiesByVoivodeship={citiesByVoivodeship}
            loadingCities={loadingCities}
            handleInputChange={handleInputChange}
            toggleVoivodeship={toggleVoivodeship}
            toggleCity={toggleCity}
          />
        </TabsContent>

        {/* Multimedia */}
        <TabsContent value="multimedia" className="space-y-6">
          <MultimediaTab
            formData={formData}
            isUploading={isUploading}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            handleRemoveImage={handleRemoveImage}
          />
        </TabsContent>

        {/* Godziny konsultacji */}
        <TabsContent value="consultations">
          <ConsultationHoursForm />
        </TabsContent>

        {/* Dodatkowe */}
        <TabsContent value="additional" className="space-y-6">
          <AdditionalTab
            formData={formData}
            handleInputChange={handleInputChange}
          />
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

export default function LawFirmProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LawFirmProfilePageContent />
    </Suspense>
  )
}
