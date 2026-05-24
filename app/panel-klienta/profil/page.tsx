"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, Save, User, Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ImageCropper } from "@/components/ui/image-cropper"
import { LoginHistory } from "@/components/auth"

const profileFormSchema = z.object({
  clientType: z.enum(["INDIVIDUAL", "BUSINESS"]),
  imie: z.string().min(2, "Imię musi mieć minimum 2 znaki"),
  nazwisko: z.string().min(2, "Nazwisko musi mieć minimum 2 znaki"),
  telefon: z.string().optional(),
  nazwaFirmy: z.string().optional(),
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

interface Voivodeship {
  id: string
  nazwa: string
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      clientType: "INDIVIDUAL",
      imie: "",
      nazwisko: "",
      telefon: "",
      nazwaFirmy: "",
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
          nazwaFirmy: data.nazwaFirmy || "",
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
      const file = new File([croppedBlob], selectedAvatarFile?.name || "avatar.jpg", {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const initials = clientData
    ? `${clientData.imie[0]}${clientData.nazwisko[0]}`.toUpperCase()
    : "KL"

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl  font-playfair font-bold">Edycja Profilu</h1>
        <p className="text-muted-foreground mt-2">
          Zaktualizuj swoje dane osobowe i ustawienia
        </p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-playfair">Zdjęcie profilowe (Avatar)</CardTitle>
          <CardDescription>
            Avatar będzie wyświetlany w górnym menu i będzie widoczny dla ekspertów. Zalecany rozmiar: 200x200px.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientData?.user.image ? (
            <div className="flex items-start gap-4">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-card">
                <Image
                  src={clientData.user.image}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="avatar-upload"
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background h-10 px-4 py-2",
                    isUploadingAvatar
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  )}
                  onClick={(e) => {
                    if (isUploadingAvatar) {
                      e.preventDefault()
                    }
                  }}
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Przesyłanie...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Zmień avatar
                    </>
                  )}
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveAvatar}
                  disabled={isUploadingAvatar}
                >
                  <X className="mr-2 h-4 w-4" />
                  Usuń avatar
                </Button>
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarFileSelect}
                disabled={isUploadingAvatar}
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="avatar-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="h-10 w-10 mb-3 text-muted-foreground animate-spin" />
                      <p className="text-sm text-muted-foreground">Przesyłanie...</p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Kliknij aby przesłać</span> avatar
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP (max 5MB)
                      </p>
                    </>
                  )}
                </div>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarFileSelect}
                disabled={isUploadingAvatar}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Typ konta */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Typ konta</CardTitle>
              <CardDescription>
                Wybierz czy korzystasz z serwisu jako osoba prywatna czy jako firma / B2B.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="clientType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-4 p-1.5 bg-muted rounded-xl w-full max-w-md border border-border">
                        <button
                          type="button"
                          className={cn(
                            "flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200",
                            field.value === "INDIVIDUAL"
                              ? "bg-background text-foreground shadow-sm scale-100"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => field.onChange("INDIVIDUAL")}
                        >
                          Osoba Prywatna
                        </button>
                        <button
                          type="button"
                          className={cn(
                            "flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200",
                            field.value === "BUSINESS"
                              ? "bg-background text-foreground shadow-sm scale-100"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => field.onChange("BUSINESS")}
                        >
                          Firma / Organizacja
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Dane firmowe (B2B) */}
          {form.watch("clientType") === "BUSINESS" && (
            <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
              <CardHeader>
                <CardTitle className="font-playfair">Dane firmy</CardTitle>
                <CardDescription>Uzupełnij dane rejestrowe firmy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nazwaFirmy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pełna nazwa firmy (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="ACME Sp. z o.o." {...field} value={field.value || ""} />
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
                        <FormLabel>NIP (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} value={field.value || ""} />
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
                        <FormLabel>REGON (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" {...field} value={field.value || ""} />
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
                          <Input placeholder="0000123456" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dane osobowe */}
          <Card>
            <CardHeader>
              <CardTitle>
                {form.watch("clientType") === "BUSINESS" ? "Dane reprezentanta" : "Dane osobowe"}
              </CardTitle>
              <CardDescription>
                {form.watch("clientType") === "BUSINESS"
                  ? "Informacje o osobie reprezentującej firmę w kontaktach z ekspertami"
                  : "Podstawowe informacje o Tobie"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imię *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan" {...field} />
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
                      <FormLabel>Nazwisko *</FormLabel>
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
                name="telefon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="+48 123 456 789" {...field} />
                    </FormControl>
                    <FormDescription>
                      Numer telefonu kontaktowego
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Email:</strong> {clientData?.user.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aby zmienić adres email, skontaktuj się z administracją
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Adres */}
          <Card>
            <CardHeader>
              <CardTitle>Adres</CardTitle>
              <CardDescription>Twój adres zamieszkania</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="adres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ulica i numer</FormLabel>
                    <FormControl>
                      <Input placeholder="ul. Przykładowa 12/3" {...field} />
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

                <FormField
                  control={form.control}
                  name="voivodeshipId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Województwo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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

          {/* Zgody marketingowe */}
          <Card>
            <CardHeader>
              <CardTitle>Zgody marketingowe</CardTitle>
              <CardDescription>Zarządzaj swoimi preferencjami komunikacji</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="zgodaNewsletter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Newsletter</FormLabel>
                      <FormDescription>
                        Otrzymuj newslettery z aktualnościami i poradami prawnymi
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

              <FormField
                control={form.control}
                name="zgodaMarketing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Komunikacja marketingowa</FormLabel>
                      <FormDescription>
                        Otrzymuj informacje o promocjach i ofertach specjalnych
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

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Zapisz zmiany
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/panel-klienta")}
              disabled={submitting}
            >
              Anuluj
            </Button>
          </div>
        </form>
      </Form>

      <LoginHistory />

      {selectedAvatarFile && (
        <ImageCropper
          image={selectedAvatarFile}
          aspectRatio={1}
          onCropComplete={handleAvatarCropComplete}
          onCancel={handleAvatarCropCancel}
          open={showAvatarCropper}
        />
      )}
    </div>
  )
}
