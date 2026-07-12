"use client"

import { LoginHistory } from "@/components/auth"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ImageCropper } from "@/components/ui/image-cropper"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import {
  Building,
  Image as ImageIcon,
  Info,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  User,
} from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const profileFormSchema = z.object({
  clientType: z.enum(["INDIVIDUAL", "BUSINESS"]),
  imie: z.string().min(2, "Imię musi mieć minimum 2 znaki"),
  nazwisko: z.string().min(2, "Nazwisko musi mieć minimum 2 znaki"),
  telefon: z.string().optional(),
  nazwa: z.string().optional(),
  nip: z.string().optional(),
  regon: z.string().optional(),
  krs: z.string().optional(),
  adres: z.string().optional(),
  kodPocztowy: z.string().optional(),
  miasto: z.string().optional(),
  voivodeshipId: z.string().optional(),
  zgodaNewsletter: z.any().transform(v => Boolean(v)),
  zgodaMarketing: z.any().transform(v => Boolean(v))
}).superRefine((data, ctx) => {
  if (data.clientType === "BUSINESS") {
    if (data.nip && data.nip.trim() !== "") {
      const cleanNip = data.nip.replace(/[^0-9]/g, "")
      if (cleanNip.length !== 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Numer NIP musi składać się z 10 cyfr",
          path: ["nip"]
        })
      }
    }
  }
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

import { Voivodeship } from "@/types"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export default function ClientProfilePage() {
  const router = useRouter()
  const { update } = useSession()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [clientData, setClientData] = useState<any>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [showAvatarCropper, setShowAvatarCropper] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      clientType: "INDIVIDUAL",
      imie: "",
      nazwisko: "",
      telefon: "",
      nazwa: "",
      nip: "",
      regon: "",
      krs: "",
      adres: "",
      kodPocztowy: "",
      miasto: "",
      voivodeshipId: "",
      zgodaNewsletter: false,
      zgodaMarketing: false,
    },
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Pobierz dane klienta
      const clientResponse = await fetch("/api/clients/me")
      if (clientResponse.ok) {
        const data = await clientResponse.json()
        setClientData(data)

        // Ustaw wartości formularza
        form.reset({
          clientType: data.clientType || "INDIVIDUAL",
          imie: data.imie || "",
          nazwisko: data.nazwisko || "",
          telefon: data.telefon || "",
          nazwa: data.nazwa || "",
          nip: data.nip || "",
          regon: data.regon || "",
          krs: data.krs || "",
          adres: data.adres || "",
          kodPocztowy: data.kodPocztowy || "",
          miasto: data.miasto || "",
          voivodeshipId: data.voivodeshipId || "",
          zgodaNewsletter: data.zgodaNewsletter === true,
          zgodaMarketing: data.zgodaMarketing === true,
        })
      }

      // Pobierz województwa
      const voivodeshipsResponse = await fetch("/api/voivodeships")
      if (voivodeshipsResponse.ok) {
        const data = await voivodeshipsResponse.json()
        setVoivodeships(data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Nie udało się pobrać danych")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setSelectedAvatarFile(file)
    setShowAvatarCropper(true)
  }

  const handleAvatarCropComplete = async (croppedBlob: Blob) => {
    setShowAvatarCropper(false)
    setIsUploadingAvatar(true)

    try {
      // Convert blob to file
      const originalName = selectedAvatarFile?.name || "avatar.jpg"
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
        throw new Error("Failed to upload avatar")
      }

      const data = await response.json()
      const uploadUrl = data.url

      if (!uploadUrl) {
        throw new Error("No upload URL returned")
      }

      // Zaktualizuj dane użytkownika z nowym avatarem
      const updateResponse = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: uploadUrl,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update avatar")
      }

      // Odśwież dane klienta lokalnie
      await fetchData()

      // Zaktualizuj sesję NextAuth z triggerem "update"
      await update({
        image: uploadUrl
      })

      toast.success("Avatar został zaktualizowany")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error(error instanceof Error ? error.message : "Nie udało się przesłać avatara")
    } finally {
      setIsUploadingAvatar(false)
      setSelectedAvatarFile(null)
    }
  }

  const handleAvatarCropCancel = () => {
    setShowAvatarCropper(false)
    setSelectedAvatarFile(null)
  }

  const handleRemoveAvatar = async () => {
    setIsRemovingAvatar(true)
    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove avatar")
      }

      // Odśwież dane klienta lokalnie
      await fetchData()

      // Zaktualizuj sesję NextAuth z triggerem "update"
      await update({
        image: null
      })

      toast.success("Avatar został usunięty")
    } catch (error) {
      console.error("Error removing avatar:", error)
      toast.error("Nie udało się usunąć avatara")
    } finally {
      setIsRemovingAvatar(false)
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/clients/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Profil został zaktualizowany")
        // Odśwież dane klienta po zapisie
        await fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || "Nie udało się zaktualizować profilu")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Wystąpił błąd podczas zapisywania")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie profilu...</p>
        </div>
      </div>
    )
  }

  const initials = clientData
    ? `${clientData.imie[0]}${clientData.nazwisko[0]}`.toUpperCase()
    : "KL"

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />


      <PageHeader
        title="Ustawienia Profilu"
        subtitle="Zaktualizuj swoje dane osobowe, adres korespondencyjny oraz ustawienia powiadomień i zgód."
      />


      {/* Profile Edit Content Grid */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {/* Left Side: Photo, account type, and consents */}
            <div className="space-y-6">
              {/* Avatar Section */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="font-playfair text-white text-base">Zdjęcie profilowe (Avatar)</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Avatar będzie wyświetlany w górnym menu i widoczny dla ekspertów.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {clientData?.user.image ? (
                    <div className="w-full flex flex-col items-center gap-4">
                      <div className="relative h-48 w-48 rounded-full overflow-hidden border-2 border-border/50 bg-card/50 ring-4 ring-primary/10 shrink-0">
                        <Image
                          src={clientData.user.image}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <label
                          htmlFor="avatar-upload"
                          className={cn(
                            "inline-flex items-center justify-center rounded-lg text-sm font-semibold h-10 px-4 py-2 w-full transition-all border border-border/30 text-white bg-background-sec/50 hover:bg-background-sec/30 cursor-pointer"
                          )}
                        >
                          {isUploadingAvatar ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                              Przesyłanie...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4 text-primary" />
                              Zmień avatar
                            </>
                          )}
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full text-error hover:text-error hover:bg-error/10"
                          onClick={() => setShowDeleteConfirm(true)}
                          disabled={isUploadingAvatar || isRemovingAvatar}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Usuń avatar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <label
                        htmlFor="avatar-upload"
                        className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border/30 rounded-lg cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          {isUploadingAvatar ? (
                            <>
                              <Loader2 className="h-9 w-9 mb-2 text-primary animate-spin" />
                              <p className="text-xs text-muted-foreground">Przesyłanie...</p>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-9 w-9 mb-2 text-primary" />
                              <p className="mb-1 text-xs text-muted-foreground">
                                <span className="font-semibold text-primary">Prześlij</span> avatar
                              </p>
                              <p className="text-sm text-muted-foreground/70">
                                PNG, JPG, WEBP (max 5MB)
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarFileSelect}
                    disabled={isUploadingAvatar}
                  />
                </CardContent>
              </Card>

              {/* Typ konta selector */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="font-playfair text-white text-base">Typ konta</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Informacja o tym, czy korzystasz z serwisu prywatnie czy firmowo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="clientType"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between py-2.5 px-4 rounded-lg text-xs font-semibold bg-background-sec/50 border border-border/40 text-white">
                            <span className="flex items-center gap-2">
                              {field.value === "BUSINESS" ? (
                                <Building className="h-4 w-4 text-primary" />
                              ) : (
                                <User className="h-4 w-4 text-primary" />
                              )}
                              {field.value === "BUSINESS" ? "Firma / Organizacja" : "Osoba Prywatna"}
                            </span>
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Zmiana typu konta nie jest możliwa z poziomu profilu. Jeżeli chcesz
                              zmienić typ konta, skontaktuj się z administracją serwisu.
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Zgody marketingowe */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="font-playfair text-white text-base">Zgody marketingowe</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Zarządzaj ustawieniami komunikacji.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Newsletter */}
                  <FormField
                    control={form.control}
                    name="zgodaNewsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/30 bg-background-sec/20 p-3 gap-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-xs text-white">Newsletter</FormLabel>
                          <FormDescription className="text-sm text-muted-foreground">
                            Porady prawne i nowości.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Marketing */}
                  <FormField
                    control={form.control}
                    name="zgodaMarketing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/30 bg-background-sec/20 p-3 gap-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-xs text-white">Komunikacja marketingowa</FormLabel>
                          <FormDescription className="text-sm text-muted-foreground">
                            Promocje i oferty specjalne.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Side: Detailed Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dane firmowe (B2B) */}
              {form.watch("clientType") === "BUSINESS" && (
                <Card variant="glass" className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <CardHeader>
                    <CardTitle className="font-playfair text-white text-lg flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      Dane firmy
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-xs">Uzupełnij dane rejestrowe firmy.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nazwa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground">Pełna nazwa firmy (opcjonalnie)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ACME Sp. z o.o."
                                className="h-11"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground">NIP (opcjonalnie)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="1234567890"
                                className="h-11"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="regon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground">REGON (opcjonalnie)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123456789"
                                className="h-11"
                                {...field}
                                value={field.value || ""}
                              />
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
                            <FormLabel className="text-xs font-semibold text-muted-foreground">KRS (opcjonalnie)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="0000123456"
                                className="h-11"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dane osobowe / reprezentanta */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="font-playfair text-white text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {form.watch("clientType") === "BUSINESS" ? "Dane reprezentanta" : "Dane osobowe"}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    {form.watch("clientType") === "BUSINESS"
                      ? "Informacje o osobie reprezentującej firmę w kontaktach z ekspertami."
                      : "Podstawowe informacje o Tobie."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="imie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground">Imię *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Jan"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nazwisko"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground">Nazwisko *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Kowalski"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="telefon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground">Telefon kontaktowy</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+48 123 456 789"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Informacja o emailu (Zablokowana edycja) */}
                  <div className="p-4 rounded-lg bg-background-sec/20 border border-border/30 flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-muted-foreground uppercase tracking-wider block font-medium">Adres e-mail konta</span>
                      <span className="text-sm font-semibold text-white truncate block">{clientData?.user.email}</span>
                    </div>
                    <div title="Zablokowane edytowanie" className="ml-auto shrink-0 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Adres do korespondencji */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="font-playfair text-white text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Adres korespondencyjny
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">Uzupełnij swój adres zamieszkania.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="adres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground">Ulica i numer</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ul. Przykładowa 12/3"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <FormField
                      control={form.control}
                      name="kodPocztowy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground">Kod pocztowy</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00-000"
                              className="h-11 bg-background-sec/20 border-border/30 rounded-lg text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="miasto"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs font-semibold text-muted-foreground">Miasto</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Wpisz miasto"
                              className="h-11 bg-background-sec/20 border-border/30 rounded-lg text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="voivodeshipId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground">Województwo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-background-sec/20 border-border/30 rounded-lg text-white">
                                <SelectValue placeholder="Wybierz" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {voivodeships.map((voivodeship) => (
                                <SelectItem key={voivodeship.id} value={voivodeship.id}>
                                  {voivodeship.nazwa}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="w-full sm:flex-1 h-11 shadow-md shadow-primary/20 group gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Zapisz zmiany
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-6 transition-all duration-200"
                  onClick={() => router.push("/panel-klienta")}
                  disabled={submitting}
                >
                  Anuluj
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>

      {/* Login History (noCard prop to match glassmorphic structure) */}
      <div className="relative z-10 pt-4">
        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="border-b border-border/20 py-4 px-6">
            <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Historia logowania
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Historia sesji oraz prób autoryzacji na Twoim koncie klienta.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <LoginHistory noCard />
          </CardContent>
        </Card>
      </div>

      {selectedAvatarFile && (
        <ImageCropper
          image={selectedAvatarFile}
          aspectRatio={1}
          onCropComplete={handleAvatarCropComplete}
          onCancel={handleAvatarCropCancel}
          open={showAvatarCropper}
        />
      )}

      <ConfirmDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleRemoveAvatar}
        isPending={isRemovingAvatar}
        title="Usuń zdjęcie profilowe"
        description="Czy na pewno chcesz usunąć swoje zdjęcie profilowe? Tej operacji nie można cofnąć."
        confirmText="Usuń"
        cancelText="Anuluj"
      />
    </div>
  )
}
