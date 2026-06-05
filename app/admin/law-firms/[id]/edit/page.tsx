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
import { ArrowLeft, Loader2, Upload, X, Image as ImageIcon } from "lucide-react"
import { ImageCropper } from "@/components/ui/image-cropper"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import {
  lawFirmSchema,
  type LawFirmFormValues,
  type Voivodeship,
  type AccountManager,
  type NotificationSettings,
} from "./types"
import { AdminNotificationSettingsCard } from "./components/AdminNotificationSettingsCard"
import { AdminStatisticsCard } from "./components/AdminStatisticsCard"

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
      stanowisko: "",
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
            stanowisko: lawFirm.stanowisko || "",
            numerTelefonu: lawFirm.numerTelefonu,
            numerTelefonu2: lawFirm.numerTelefonu2 || "",
            emailKontakt: lawFirm.emailKontakt,
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
            dataPakietuOd: lawFirm.dataPakietuOd ? new Date(lawFirm.dataPakietuOd).toISOString().split('T')[0] : "",
            dataPakietuDo: lawFirm.dataPakietuDo ? new Date(lawFirm.dataPakietuDo).toISOString().split('T')[0] : "",
            zgodaRegulamin: lawFirm.zgodaRegulamin || false,
            zgodaPrzetwarzanie: lawFirm.zgodaPrzetwarzanie || false,
            zweryfikowana: lawFirm.zweryfikowana,
            aktywna: lawFirm.aktywna,
            accountManagerId: lawFirm.accountManagerId || "",
          })

          // Set statistics
          setStatistics({
            wyswietleniaProfilu: lawFirm.wyswietleniaProfilu || 0,
            zlozoneOferty: lawFirm.zlozoneOferty || 0,
            wygraneOferty: lawFirm.wygraneOferty || 0,
            konwersja: lawFirm.konwersja || 0,
            pozycjaRanking: lawFirm.pozycjaRanking || null,
          })

          // Store userId for fetching notification settings
          setUserId(lawFirm.user.id)

          // Fetch notification settings
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
          throw new Error("Błąd podczas pobierania danych kancelarii")
        }
      } catch (error) {
        toast.error("Nie udało się pobrać danych kancelarii")
        router.push("/admin/law-firms")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchLawFirm()
    }
  }, [params.id, router])

  // Update law firm
  const handleSubmit = async (values: LawFirmFormValues) => {
    try {
      setIsSubmitting(true)

      const updateData: any = {
        ...values,
      }

      // Only include password if it was changed
      if (!values.password || values.password.length === 0) {
        delete updateData.password
      } else {
        updateData.userPassword = values.password
      }
      delete updateData.password

      // Rename email fields for API
      updateData.userEmail = values.email
      delete updateData.email

      // Map pakietSubskrypcji to null if it is empty/falsy
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
        toast.success("Kancelaria została zaktualizowana pomyślnie")
        router.push("/admin/law-firms")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd podczas aktualizacji kancelarii")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaktualizować kancelarii")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/law-firms">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edytuj Kancelarię</h1>
          <p className="text-muted-foreground">Zaktualizuj dane kancelarii prawniczej</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Dane konta użytkownika</CardTitle>
              <CardDescription>Email i hasło do logowania</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email użytkownika</FormLabel>
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
                      <FormLabel>Hasło</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Pozostaw puste aby nie zmieniać" {...field} />
                      </FormControl>
                      <FormDescription>
                        Pozostaw puste jeśli nie chcesz zmieniać hasła
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
                    <FormLabel>Status konta</FormLabel>
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

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Dane podstawowe</CardTitle>
              <CardDescription>Informacje o kancelarii</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nazwa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa</FormLabel>
                      <FormControl>
                        <Input placeholder="Nazwa kancelarii" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nazwaFirmy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa firmy</FormLabel>
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
                      <Input placeholder="np. kancelaria-kowalski" {...field} />
                    </FormControl>
                    <FormDescription>
                      Przyjazny URL dla profilu kancelarii. Zostanie wygenerowany automatycznie jeśli pozostawisz puste.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
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
                    <FormLabel>Opis (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Opis kancelarii..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo (opcjonalnie)</FormLabel>
                    <FormControl>
                      <div>
                        {field.value ? (
                          <div className="flex items-start gap-4">
                            <div className="relative h-32 w-32 rounded-lg overflow-hidden border-2 border-border bg-card">
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Dane kontaktowe</CardTitle>
              <CardDescription>Informacje o osobie kontaktowej</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imieKontakt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imię osoby kontaktowej</FormLabel>
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
                      <FormLabel>Nazwisko osoby kontaktowej</FormLabel>
                      <FormControl>
                        <Input placeholder="Kowalski" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="stanowisko"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stanowisko (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Input placeholder="Radca prawny" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numerTelefonu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numer telefonu</FormLabel>
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
                      <FormLabel>Numer telefonu 2 (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input placeholder="+48 123 456 789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="emailKontakt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email kontaktowy</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="kontakt@kancelaria.pl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Adres</CardTitle>
              <CardDescription>Lokalizacja kancelarii</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="adres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres</FormLabel>
                    <FormControl>
                      <Input placeholder="ul. Przykładowa 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia</CardTitle>
              <CardDescription>Typ oferty, pakiet i status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="typOferty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Typ oferty</FormLabel>
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
                        <SelectItem value="WSZYSTKIE">Wszystkie</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="none">Brak pakietu</SelectItem>
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
              </div>

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="zweryfikowana"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Zweryfikowana</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aktywna"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Aktywna</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="accountManagerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opiekun kancelarii</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz opiekuna (opcjonalnie)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Brak opiekuna</SelectItem>
                        {accountManagers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.imie} {manager.nazwisko} ({manager.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Przypisz opiekuna do tej kancelarii. Opiekun będzie widoczny w panelu kancelarii.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media społecznościowe</CardTitle>
              <CardDescription>Linki do profili społecznościowych</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stronaWww"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strona WWW (opcjonalnie)</FormLabel>
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
                      <FormLabel>LinkedIn (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.linkedin.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="linkFacebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook (opcjonalnie)</FormLabel>
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
                      <FormLabel>Instagram (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.instagram.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="linkTwitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter (opcjonalnie)</FormLabel>
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
                      <FormLabel>TikTok (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.tiktok.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Multimedia */}
          <Card>
            <CardHeader>
              <CardTitle>Multimedia</CardTitle>
              <CardDescription>Zdjęcia, galeria i filmy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="zdjecieGlowne"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zdjęcie główne (opcjonalnie)</FormLabel>
                    <FormControl>
                      <div>
                        {field.value ? (
                          <div className="space-y-3">
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="galeriaZdjec"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Galeria zdjęć (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Textarea placeholder='JSON array URL-i, np. ["https://...", "https://..."]' {...field} />
                    </FormControl>
                    <FormDescription>
                      Wpisz JSON array z URL-ami zdjęć do galerii
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="filmYouTube"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Film YouTube (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.youtube.com/..." {...field} />
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
                      <FormLabel>Miniatura filmu (opcjonalnie)</FormLabel>
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
                    <FormLabel>Kolejność multimediów</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kolejność" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="zdjecia">Zdjęcia najpierw</SelectItem>
                        <SelectItem value="film">Film najpierw</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Godziny otwarcia</CardTitle>
              <CardDescription>Godziny pracy kancelarii</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="statusGodzinyOtwarcia"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Włącz godziny otwarcia</FormLabel>
                      <FormDescription>
                        Wyświetlaj godziny pracy w profilu publicznym
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="godzinyOtwarcia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Godziny otwarcia (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='JSON, np. {"poniedzialek": "9:00-17:00", "wtorek": "9:00-17:00", ...}'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Wpisz JSON z godzinami otwarcia dla każdego dnia tygodnia
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Legal Registrations */}
          <Card>
            <CardHeader>
              <CardTitle>Wpisy do rejestrów</CardTitle>
              <CardDescription>OIRP i ORA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold">OIRP (Okręgowa Izba Radców Prawnych)</h4>
                <FormField
                  control={form.control}
                  name="oirpStatus"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Zarejestrowany w OIRP</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="oirpMiasto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Miasto OIRP (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="Warszawa" {...field} />
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
                        <FormLabel>Numer wpisu OIRP (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="WA/12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold">ORA (Okręgowa Rada Adwokacka)</h4>
                <FormField
                  control={form.control}
                  name="oraStatus"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Zarejestrowany w ORA</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="oraMiasto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Miasto ORA (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="Warszawa" {...field} />
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
                        <FormLabel>Numer wpisu ORA (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="WA/12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informacje zawodowe</CardTitle>
              <CardDescription>Edukacja, specjalizacje i słowa kluczowe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="edukacja"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historia edukacji (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='JSON array, np. [{"uczelnia": "Uniwersytet Warszawski", "wydzial": "Prawo", "rokOd": 2000, "rokDo": 2005}]'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Wpisz JSON array z historią edukacji
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unikatowyOpisUslugi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unikalny opis usług (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Opisz unikalne aspekty świadczonych usług..." {...field} />
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
                    <FormLabel>Słowa kluczowe (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='JSON array tagów, np. ["prawo cywilne", "prawo rodzinne", "sprawy spadkowe"]'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Wpisz JSON array ze słowami kluczowymi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Coverage Area */}
          <Card>
            <CardHeader>
              <CardTitle>Obszar działania</CardTitle>
              <CardDescription>Zakres terytorialny działalności</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="callaPolska"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Cała Polska</FormLabel>
                        <FormDescription>
                          Kancelaria świadczy usługi na terenie całej Polski
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="onlineOnly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Tylko online</FormLabel>
                        <FormDescription>
                          Kancelaria świadczy usługi wyłącznie online
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Dates & Consents */}
          <Card>
            <CardHeader>
              <CardTitle>Subskrypcja i zgody</CardTitle>
              <CardDescription>Daty subskrypcji i zgody użytkownika</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataPakietuOd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data rozpoczęcia subskrypcji (opcjonalnie)</FormLabel>
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
                      <FormLabel>Data zakończenia subskrypcji (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="zgodaRegulamin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Zgoda na regulamin</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zgodaPrzetwarzanie"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Zgoda na przetwarzanie danych</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings (Read-only) */}
          <AdminNotificationSettingsCard notificationSettings={notificationSettings} />

          {/* Statistics (Read-only) */}
          <AdminStatisticsCard statistics={statistics} />

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/law-firms")}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz Zmiany"}
            </Button>
          </div>
        </form>
      </Form>

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
