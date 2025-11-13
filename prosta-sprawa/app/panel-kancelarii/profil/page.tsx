"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { AlertCircle, Loader2, Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { ImageCropper } from "@/components/ui/image-cropper"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

interface Voivodeship {
  id: string
  nazwa: string
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
        const [voivRes, catRes, lawFirmRes] = await Promise.all([
          fetch("/api/voivodeships"),
          fetch("/api/categories"),
          session?.user?.id ? fetch(`/api/law-firms/${session.user.id}`) : null,
        ])

        if (voivRes.ok) {
          const voivData = await voivRes.json()
          setVoivodeships(voivData)
        }

        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData)
        }

        if (lawFirmRes && lawFirmRes.ok) {
          const lawFirmData = await lawFirmRes.json()
          const normalizedData = {
            ...lawFirmData,
            voivodeshipsIds: lawFirmData.voivodeships?.map((v: any) => v.voivodeship.id) || [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/law-firms/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast.success("Profil został zaktualizowany")
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Nie udało się zapisać profilu")
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
      const uploadPromises = Array.from(files).map(async (file) => {
        const formDataToSend = new FormData()
        formDataToSend.append("file", file)

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formDataToSend,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to upload image")
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)

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

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload image")
      }

      const data = await response.json()
      handleInputChange("logo", data.url)
      toast.success("Logo zostało przesłane")
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

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload image")
      }

      const data = await response.json()
      handleInputChange("zdjecieGlowne", data.url)
      toast.success("Zdjęcie główne zostało przesłane")
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
        <h1 className="text-3xl font-bold">Profil Kancelarii</h1>
        <p className="text-muted-foreground">Zarządzaj informacjami o swojej kancelarii</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Podstawowe</TabsTrigger>
          <TabsTrigger value="contact">Kontakt</TabsTrigger>
          <TabsTrigger value="specialization">Specjalizacje</TabsTrigger>
          <TabsTrigger value="multimedia">Multimedia</TabsTrigger>
          <TabsTrigger value="additional">Dodatkowe</TabsTrigger>
        </TabsList>

        {/* Dane podstawowe */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dane podstawowe</CardTitle>
              <CardDescription>Podstawowe informacje o kancelarii</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nazwa">Nazwa kancelarii *</Label>
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
                  <Label htmlFor="opis">Opis kancelarii</Label>
                  <RichTextEditor
                    value={formData.opis}
                    onChange={(value) => handleInputChange("opis", value)}
                    placeholder="Opisz swoją kancelarię..."
                    minHeight="300px"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo i zdjęcia</CardTitle>
              <CardDescription>
                Dodaj logo oraz zdjęcie główne swojej kancelarii
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <Label>Logo kancelarii</Label>
                <p className="text-sm text-muted-foreground">
                  Logo będzie wyświetlane na Twojej stronie kancelarii i w wynikach wyszukiwania.
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
                  Zdjęcie główne będzie wyświetlane jako banner na górze Twojej strony kancelarii.
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

        {/* Specjalizacje */}
        <TabsContent value="specialization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Specjalizacje</CardTitle>
              <CardDescription>Wybierz kategorie prawne, w których działasz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Kategorie prawne</Label>
                <div className="grid md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-4 border rounded-lg">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={formData.categoriesIds.includes(cat.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleInputChange("categoriesIds", [...formData.categoriesIds, cat.id])
                          } else {
                            handleInputChange(
                              "categoriesIds",
                              formData.categoriesIds.filter((id) => id !== cat.id)
                            )
                          }
                        }}
                      />
                      <label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
                        {cat.nazwa}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unikatowyOpisUslugi">Unikalny opis usługi</Label>
                <Textarea
                  id="unikatowyOpisUslugi"
                  value={formData.unikatowyOpisUslugi}
                  onChange={(e) => handleInputChange("unikatowyOpisUslugi", e.target.value)}
                  rows={4}
                  placeholder="Opisz swoje unikalne podejście do świadczenia usług..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slowoKluczowe">Słowa kluczowe</Label>
                <div className="flex gap-2">
                  <Input
                    id="slowoKluczowe"
                    placeholder="Dodaj słowo kluczowe..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
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
                    onClick={(e) => {
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
                <p className="text-xs text-muted-foreground">
                  Naciśnij Enter lub kliknij "Dodaj" aby dodać słowo kluczowe
                </p>
              </div>

              <div className="space-y-2">
                <Label>Obszar działania</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="callaPolska"
                      checked={formData.callaPolska}
                      onCheckedChange={(checked) => handleInputChange("callaPolska", checked)}
                    />
                    <Label htmlFor="callaPolska" className="cursor-pointer">
                      Cała Polska
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="onlineOnly"
                      checked={formData.onlineOnly}
                      onCheckedChange={(checked) => handleInputChange("onlineOnly", checked)}
                    />
                    <Label htmlFor="onlineOnly" className="cursor-pointer">
                      Tylko online
                    </Label>
                  </div>
                </div>
              </div>

              {!formData.callaPolska && (
                <div className="grid gap-2">
                  <Label>Województwa działania</Label>
                  <div className="grid md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-4 border rounded-lg">
                    {voivodeships.map((v) => (
                      <div key={v.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`voiv-${v.id}`}
                          checked={formData.voivodeshipsIds.includes(v.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("voivodeshipsIds", [...formData.voivodeshipsIds, v.id])
                            } else {
                              handleInputChange(
                                "voivodeshipsIds",
                                formData.voivodeshipsIds.filter((id) => id !== v.id)
                              )
                            }
                          }}
                        />
                        <label htmlFor={`voiv-${v.id}`} className="text-sm cursor-pointer">
                          {v.nazwa}
                        </label>
                      </div>
                    ))}
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
                Dodaj zdjęcia swojej kancelarii (maksymalnie 10 zdjęć, każde do 5MB)
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
                    <strong>Wskazówka:</strong> Zdjęcia będą wyświetlane w galerii na Twojej stronie kancelarii.
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
                Dodaj link do filmu na YouTube prezentującego Twoją kancelarię
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
                  {Object.keys(formData.godzinyOtwarcia).map((day) => (
                    <div key={day} className="grid md:grid-cols-2 gap-4 items-center">
                      <Label className="capitalize">{day}</Label>
                      <Input
                        placeholder="np. 9:00-17:00"
                        value={formData.godzinyOtwarcia[day as keyof typeof formData.godzinyOtwarcia]}
                        onChange={(e) =>
                          handleInputChange("godzinyOtwarcia", {
                            ...formData.godzinyOtwarcia,
                            [day]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
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
