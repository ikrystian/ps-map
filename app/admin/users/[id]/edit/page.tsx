"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Image as ImageIcon, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Validation schema
const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").or(z.literal("")).optional(),
  role: z.enum(["CLIENT", "LAW_FIRM", "ADMIN"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"]),
  image: z.string().optional(),
  // Client fields
  client: z.object({
    imie: z.string().optional(),
    nazwisko: z.string().optional(),
    telefon: z.string().optional(),
    adres: z.string().optional(),
    kodPocztowy: z.string().optional(),
    miasto: z.string().optional(),
    voivodeshipId: z.string().optional(),
    zgodaRegulamin: z.boolean().optional(),
    zgodaNewsletter: z.boolean().optional(),
    zgodaMarketing: z.boolean().optional(),
  }).optional(),
  // Notification settings
  notificationSettings: z.object({
    emailNoweOferty: z.boolean().optional(),
    emailWiadomosci: z.boolean().optional(),
    emailStatusy: z.boolean().optional(),
    smsPilne: z.boolean().optional(),
    kontaktKlienci: z.boolean().optional(),
    kluczowe: z.boolean().optional(),
    wskazowkiPorady: z.boolean().optional(),
    ofertPromocje: z.boolean().optional(),
    przypomnienieWiadomosci: z.boolean().optional(),
    noweFunkcje: z.boolean().optional(),
    zmianyCenniki: z.boolean().optional(),
    zmianyRegulamin: z.boolean().optional(),
    kontaktDoradca: z.boolean().optional(),
    wyswietlanieAwatara: z.boolean().optional(),
    autoProsbOpinie: z.boolean().optional(),
    powiadomienieDzwiekowe: z.boolean().optional(),
    ustawieniaOgloszenia: z.boolean().optional(),
    powiadomieniaSmNowa: z.boolean().optional(),
    wiadomosciZbiorcze: z.boolean().optional(),
    urlop: z.boolean().optional(),
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.role === "CLIENT") {
    if (!data.client?.imie || data.client.imie.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Imię jest wymagane",
        path: ["client", "imie"],
      })
    }
    if (!data.client?.nazwisko || data.client.nazwisko.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nazwisko jest wymagane",
        path: ["client", "nazwisko"],
      })
    }
  }
})

type UserFormValues = z.infer<typeof userSchema>

interface Voivodeship {
  id: string
  nazwa: string
}

interface UserData {
  id: string
  name?: string | null
  email: string
  role: "CLIENT" | "LAW_FIRM" | "ADMIN"
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLOCKED"
  image?: string | null
  client?: {
    id: string
    imie: string
    nazwisko: string
    telefon?: string | null
    adres?: string | null
    kodPocztowy?: string | null
    miasto?: string | null
    voivodeshipId?: string | null
    zgodaRegulamin: boolean
    zgodaNewsletter: boolean
    zgodaMarketing: boolean
  } | null
}

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "CLIENT",
      status: "ACTIVE",
      image: "",
      client: {
        imie: "",
        nazwisko: "",
        telefon: "",
        adres: "",
        kodPocztowy: "",
        miasto: "",
        voivodeshipId: "",
        zgodaRegulamin: false,
        zgodaNewsletter: false,
        zgodaMarketing: false,
      },
      notificationSettings: {
        emailNoweOferty: true,
        emailWiadomosci: true,
        emailStatusy: true,
        smsPilne: false,
        kontaktKlienci: true,
        kluczowe: true,
        wskazowkiPorady: true,
        ofertPromocje: true,
        przypomnienieWiadomosci: true,
        noweFunkcje: true,
        zmianyCenniki: true,
        zmianyRegulamin: true,
        kontaktDoradca: false,
        wyswietlanieAwatara: true,
        autoProsbOpinie: false,
        powiadomienieDzwiekowe: false,
        ustawieniaOgloszenia: true,
        powiadomieniaSmNowa: false,
        wiadomosciZbiorcze: true,
        urlop: false,
      },
    },
  })

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

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/users/${params.id}`)
        if (response.ok) {
          const user: UserData = await response.json()
          setUserData(user)

          // Fetch notification settings
          let settingsData = {
            emailNoweOferty: true,
            emailWiadomosci: true,
            emailStatusy: true,
            smsPilne: false,
            kontaktKlienci: true,
            kluczowe: true,
            wskazowkiPorady: true,
            ofertPromocje: true,
            przypomnienieWiadomosci: true,
            noweFunkcje: true,
            zmianyCenniki: true,
            zmianyRegulamin: true,
            kontaktDoradca: false,
            wyswietlanieAwatara: true,
            autoProsbOpinie: false,
            powiadomienieDzwiekowe: false,
            ustawieniaOgloszenia: true,
            powiadomieniaSmNowa: false,
            wiadomosciZbiorcze: true,
            urlop: false,
          }

          try {
            const settingsResponse = await fetch(`/api/admin/users/${params.id}/notification-settings`)
            if (settingsResponse.ok) {
              const fetchedSettings = await settingsResponse.json()
              settingsData = { ...settingsData, ...fetchedSettings }
            }
          } catch (error) {
            console.error("Error fetching notification settings:", error)
          }

          form.reset({
            name: user.name || "",
            email: user.email,
            password: "",
            role: user.role,
            status: user.status,
            image: user.image || "",
            client: {
              imie: user.client?.imie || "",
              nazwisko: user.client?.nazwisko || "",
              telefon: user.client?.telefon || "",
              adres: user.client?.adres || "",
              kodPocztowy: user.client?.kodPocztowy || "",
              miasto: user.client?.miasto || "",
              voivodeshipId: user.client?.voivodeshipId || "",
              zgodaRegulamin: user.client?.zgodaRegulamin || false,
              zgodaNewsletter: user.client?.zgodaNewsletter || false,
              zgodaMarketing: user.client?.zgodaMarketing || false,
            },
            notificationSettings: settingsData,
          })
        } else {
          throw new Error("Błąd podczas pobierania danych użytkownika")
        }
      } catch (error) {
        toast.error("Nie udało się pobrać danych użytkownika")
        router.push("/admin/users")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchUser()
    }
  }, [params.id, router])

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)

    try {
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
      form.setValue("image", data.url)
      toast.success("Zdjęcie zostało przesłane")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error(error instanceof Error ? error.message : "Nie udało się przesłać zdjęcia")
    } finally {
      setIsUploadingImage(false)
      e.target.value = ""
    }
  }

  // Handle image removal
  const handleRemoveImage = () => {
    form.setValue("image", "")
    toast.success("Zdjęcie zostało usunięte")
  }

  // Update user
  const handleSubmit = async (values: UserFormValues) => {
    try {
      setIsSubmitting(true)

      const updateData: any = {
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
        image: values.image,
      }

      // Only include password if it was changed
      if (values.password && values.password.length > 0) {
        updateData.password = values.password
      }

      // Include client data
      if (values.client) {
        updateData.client = values.client
      }

      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Błąd podczas aktualizacji użytkownika")
      }

      // Zapisz ustawienia powiadomień jeśli rola to Kancelaria
      if (values.role === "LAW_FIRM" && values.notificationSettings) {
        const settingsResponse = await fetch(`/api/admin/users/${params.id}/notification-settings`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values.notificationSettings),
        })

        if (!settingsResponse.ok) {
          const error = await settingsResponse.json()
          throw new Error(error.error || "Błąd podczas aktualizacji ustawień powiadomień")
        }
      }

      toast.success("Użytkownik został zaktualizowany pomyślnie")
      router.push("/admin/users")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaktualizować użytkownika")
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

  const imageValue = form.watch("image")
  const userRole = form.watch("role")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edytuj Użytkownika</h1>
          <p className="text-muted-foreground">{userData?.email}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8">
              <TabsTrigger value="account">Konto</TabsTrigger>
              <TabsTrigger 
                value="client" 
                disabled={userRole !== "CLIENT"}
                className={cn(userRole !== "CLIENT" && "hidden")}
              >
                Dane klienta
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                disabled={userRole !== "LAW_FIRM"}
                className={cn(userRole !== "LAW_FIRM" && "hidden")}
              >
                Ustawienia powiadomień
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              {/* Profile Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Zdjęcie profilowe</CardTitle>
                  <CardDescription>Avatar użytkownika (opcjonalnie)</CardDescription>
                </CardHeader>
                <CardContent>
                  {imageValue ? (
                    <div className="flex items-start gap-4">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-card">
                        <Image
                          src={imageValue}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="image-upload"
                          className={cn(
                            "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background h-10 px-4 py-2",
                            isUploadingImage
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          )}
                          onClick={(e) => {
                            if (isUploadingImage) {
                              e.preventDefault()
                            }
                          }}
                        >
                          {isUploadingImage ? (
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
                          onClick={handleRemoveImage}
                          disabled={isUploadingImage}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Usuń zdjęcie
                        </Button>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                      />
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="h-10 w-10 mb-3 text-muted-foreground animate-spin" />
                              <p className="text-sm text-muted-foreground">Przesyłanie...</p>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-10 w-10 mb-3 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Kliknij aby przesłać</span> zdjęcie profilowe
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG, WEBP (max 5MB)
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Dane konta</CardTitle>
                  <CardDescription>Email, hasło i podstawowe informacje</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="user@example.com" {...field} />
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
                          Pozostaw puste jeśli nie chcesz zmieniać hasła (minimum 8 znaków jeśli podano)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nazwa (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rola</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz rolę" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CLIENT">Klient</SelectItem>
                              <SelectItem value="LAW_FIRM">Kancelaria</SelectItem>
                              <SelectItem value="ADMIN">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Aktywny</SelectItem>
                              <SelectItem value="INACTIVE">Nieaktywny</SelectItem>
                              <SelectItem value="SUSPENDED">Zawieszony</SelectItem>
                              <SelectItem value="BLOCKED">Zablokowany</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personal Information */}
            <TabsContent value="client" className="space-y-6">
              {userRole === "CLIENT" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dane osobowe</CardTitle>
                    <CardDescription>Podstawowe informacje o użytkowniku</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="client.imie"
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
                        name="client.nazwisko"
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

                    <FormField
                      control={form.control}
                      name="client.telefon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon (opcjonalnie)</FormLabel>
                          <FormControl>
                            <Input placeholder="+48 123 456 789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="client.adres"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adres (opcjonalnie)</FormLabel>
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
                        name="client.kodPocztowy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kod pocztowy (opcjonalnie)</FormLabel>
                            <FormControl>
                              <Input placeholder="00-000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="client.miasto"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Miasto (opcjonalnie)</FormLabel>
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
                      name="client.voivodeshipId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Województwo (opcjonalnie)</FormLabel>
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

                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="client.zgodaRegulamin"
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
                        name="client.zgodaNewsletter"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Zgoda na newsletter</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="client.zgodaMarketing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Zgoda na marketing</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Ustawienia powiadomień i preferencji Kancelarii */}
            <TabsContent value="notifications" className="space-y-6">
              {userRole === "LAW_FIRM" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Card 1: Ustawienia Ogólne Powiadomień */}
                  <Card className="border border-border/60 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Ustawienia powiadomień e-mail
                      </CardTitle>
                      <CardDescription>
                        Dostosuj preferencje powiadomień e-mail wysyłanych do kancelarii
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {/* Kontakt z klientami */}
                        <FormField
                          control={form.control}
                          name="notificationSettings.kontaktKlienci"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg bg-muted/40 border border-muted-foreground/10">
                              <div className="space-y-0.5 pr-2">
                                <FormLabel className="text-sm font-semibold cursor-pointer">
                                  Kontakt z klientami <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Wymagane do prawidłowego kontaktu z klientami w serwisie.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Kluczowe informacje */}
                        <FormField
                          control={form.control}
                          name="notificationSettings.kluczowe"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg bg-muted/40 border border-muted-foreground/10">
                              <div className="space-y-0.5 pr-2">
                                <FormLabel className="text-sm font-semibold cursor-pointer">
                                  Kluczowe informacje <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Wymagane powiadomienia o regulaminie, cennikach i funkcjonowaniu serwisu.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Wskazówki, porady */}
                        <FormField
                          control={form.control}
                          name="notificationSettings.wskazowkiPorady"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                              <div className="space-y-0.5 pr-2">
                                <FormLabel className="text-sm font-semibold cursor-pointer">
                                  Wskazówki i porady
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Porady jak ulepszyć ofertę i zwiększyć widoczność.
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

                        {/* Ciekawe oferty i promocje */}
                        <FormField
                          control={form.control}
                          name="notificationSettings.ofertPromocje"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                              <div className="space-y-0.5 pr-2">
                                <FormLabel className="text-sm font-semibold cursor-pointer">
                                  Ciekawe oferty i promocje
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Promocje i specjalne oferty przygotowane dla kancelarii.
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

                        {/* Przypomnienie o nowych wiadomościach */}
                        <FormField
                          control={form.control}
                          name="notificationSettings.przypomnienieWiadomosci"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                              <div className="space-y-0.5 pr-2">
                                <FormLabel className="text-sm font-semibold cursor-pointer">
                                  Przypomnienie o wiadomościach
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Przypomnienia o nieprzeczytanych wiadomościach.
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

                        {/* Powiadomienie o nowych funkcjach */}
                        <FormField
                          control={form.control}
                          name="notificationSettings.noweFunkcje"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                              <div className="space-y-0.5 pr-2">
                                <FormLabel className="text-sm font-semibold cursor-pointer">
                                  Nowe funkcje serwisu
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Informacje o wprowadzanych ulepszeniach i nowych modułach.
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

                        {/* Zmiany cenników */}
                        <FormField
                          control={form.control}
                          name="notificationSettings.zmianyCenniki"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                              <div className="space-y-0.5 pr-2">
                                <FormLabel className="text-sm font-semibold cursor-pointer">
                                  Zmiany cenników
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Powiadomienia o aktualizacjach cennika usług.
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

                        {/* Zmiany regulaminu */}
                        <FormField
                          control={form.control}
                          name="notificationSettings.zmianyRegulamin"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                              <div className="space-y-0.5 pr-2">
                                <FormLabel className="text-sm font-semibold cursor-pointer">
                                  Zmiany regulaminu
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Informacje o modyfikacjach w regulaminie portalu.
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
                      </div>

                      <Separator />

                      {/* Kontakt telefoniczny */}
                      <div className="space-y-3 pt-2">
                        <h3 className="text-sm font-semibold text-muted-foreground px-1">Kontakt telefoniczny</h3>
                        <FormField
                          control={form.control}
                          name="notificationSettings.kontaktDoradca"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                              <div className="space-y-0.5 pr-2">
                                <FormLabel className="text-sm font-semibold cursor-pointer">
                                  Kontakt z doradcą
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Zgoda na bezpośredni kontakt telefoniczny z doradcą portalu.
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* Column 2: Inne ustawienia */}
                  <div className="space-y-6">
                    {/* Card 2.1: Ustawienia Ogłoszenia */}
                    <Card className="border border-border/60 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          Ustawienia ogłoszenia i tryb pracy
                        </CardTitle>
                        <CardDescription>
                          Zarządzaj widocznością i preferencjami zleceń
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {/* Ustawienia ogłoszenia */}
                          <FormField
                            control={form.control}
                            name="notificationSettings.ustawieniaOgloszenia"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                                <div className="space-y-0.5 pr-2">
                                  <FormLabel className="text-sm font-semibold cursor-pointer">
                                    Włącz ustawienia ogłoszenia
                                  </FormLabel>
                                  <FormDescription className="text-xs">
                                    Aktywuje opcje dodatkowe powiązane z ogłoszeniami.
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

                          <Separator />

                          {/* Powiadomienia SMS */}
                          <div className="space-y-2 pt-1">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Powiadomienia SMS</h4>
                            <FormField
                              control={form.control}
                              name="notificationSettings.powiadomieniaSmNowa"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                                  <div className="space-y-0.5 pr-2">
                                    <FormLabel className="text-sm font-semibold cursor-pointer">
                                      SMS o nowej wiadomości
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                      Otrzymuj natychmiastowe powiadomienia SMS o nowych zleceniach.
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
                          </div>

                          <Separator />

                          {/* Powiadomienia e-mail - zbiorcze */}
                          <div className="space-y-2 pt-1">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Wiadomości zbiorcze</h4>
                            <FormField
                              control={form.control}
                              name="notificationSettings.wiadomosciZbiorcze"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                                  <div className="space-y-0.5 pr-2">
                                    <FormLabel className="text-sm font-semibold cursor-pointer">
                                      Otrzymywanie wiadomości zbiorczych
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                      Zbiorcze raporty e-mail zamiast pojedynczych powiadomień.
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
                          </div>

                          <Separator />

                          {/* Tryb urlopowy */}
                          <div className="space-y-2 pt-1">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Tryb pracy</h4>
                            <FormField
                              control={form.control}
                              name="notificationSettings.urlop"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                                  <div className="space-y-0.5 pr-2">
                                    <FormLabel className="text-sm font-semibold cursor-pointer text-amber-600 dark:text-amber-500">
                                      Tryb urlopowy
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                      Wstrzymuje powiadomienia o zleceniach na czas Twojej nieobecności.
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 2.2: Zgody i preferencje systemowe */}
                    <Card className="border border-border/60 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          Zgody i dodatkowe funkcje
                        </CardTitle>
                        <CardDescription>
                          Zarządzaj wizerunkiem i profilowaniem w serwisie
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {/* Zgoda na wyświetlanie awatara */}
                          <FormField
                            control={form.control}
                            name="notificationSettings.wyswietlanieAwatara"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                                <div className="space-y-0.5 pr-2">
                                  <FormLabel className="text-sm font-semibold cursor-pointer">
                                    Zgoda na wyświetlanie awatara (wizerunek)
                                  </FormLabel>
                                  <FormDescription className="text-xs">
                                    Zgoda na pokazywanie Twojego zdjęcia na profilu publicznym i w opiniach.
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

                          {/* Zgoda na auto prośbę o opinię */}
                          <FormField
                            control={form.control}
                            name="notificationSettings.autoProsbOpinie"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                                <div className="space-y-0.5 pr-2">
                                  <FormLabel className="text-sm font-semibold cursor-pointer">
                                    Automatyczne prośby o opinie
                                  </FormLabel>
                                  <FormDescription className="text-xs">
                                    Automatyczne wysyłanie próśb do kancelarii o wystawienie opinii po zakończeniu sprawy.
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

                          {/* Powiadomienie dźwiękowe o nowej wiadomości */}
                          <FormField
                            control={form.control}
                            name="notificationSettings.powiadomienieDzwiekowe"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/10">
                                <div className="space-y-0.5 pr-2">
                                  <FormLabel className="text-sm font-semibold cursor-pointer">
                                    Powiadomienie dźwiękowe
                                  </FormLabel>
                                  <FormDescription className="text-xs">
                                    Otrzymuj natychmiastowe powiadomienia dźwiękowe o nowych wiadomościach.
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
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz Zmiany"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
