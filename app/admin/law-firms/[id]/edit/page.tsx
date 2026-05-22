"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { ImageUpload } from "@/components/ui/image-upload"

// Validation schema for law firm form
const lawFirmSchema = z.object({
  // User credentials
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  userStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"]),

  // Basic info
  typ: z.enum(["OSOBA_FIZYCZNA", "SPOLKA_CYWILNA", "SPOLKA_PARTNERSKA", "SPOLKA_KOMANDYTOWA", "SPOLKA_JAWNA", "SPOLKA_ZOO", "INNY"]),
  typInny: z.string().optional(),
  nazwa: z.string().min(1, "Name is required"),
  nazwaFirmy: z.string().min(1, "Company name is required"),
  slug: z.string().optional(),
  nip: z.string().min(10, "NIP must be 10 digits"),
  regon: z.string().optional(),
  krs: z.string().optional(),

  // Contact
  imieKontakt: z.string().min(1, "Contact first name is required"),
  nazwiskoKontakt: z.string().min(1, "Contact last name is required"),
  stanowisko: z.string().optional(),
  numerTelefonu: z.string().min(1, "Phone number is required"),
  numerTelefonu2: z.string().optional(),
  emailKontakt: z.string().email("Invalid contact email"),

  // Address
  adres: z.string().min(1, "Address is required"),
  kodPocztowy: z.string().min(1, "Postal code is required"),
  miasto: z.string().min(1, "City is required"),
  voivodeshipId: z.string().min(1, "Voivodeship is required"),

  // Profile
  opis: z.string().optional(),
  logo: z.string().optional(),

  // Multimedia
  zdjecieGlowne: z.string().optional(),
  galeriaZdjec: z.string().optional(),
  filmYouTube: z.string().optional(),
  okladkaFilmu: z.string().optional(),
  kolejnoscMultimedia: z.enum(["zdjecia", "film"]).optional(),

  // Business hours
  statusGodzinyOtwarcia: z.boolean(),
  godzinyOtwarcia: z.string().optional(),

  // Social media
  linkLinkedIn: z.string().optional(),
  linkFacebook: z.string().optional(),
  linkInstagram: z.string().optional(),
  linkTwitter: z.string().optional(),
  linkTikTok: z.string().optional(),
  stronaWww: z.string().optional(),

  // Education
  edukacja: z.string().optional(),

  // Legal registrations
  oirpMiasto: z.string().optional(),
  oirpWpis: z.string().optional(),
  oirpStatus: z.boolean(),
  oraMiasto: z.string().optional(),
  oraWpis: z.string().optional(),
  oraStatus: z.boolean(),

  // Services
  unikatowyOpisUslugi: z.string().optional(),
  slowaKluczowe: z.string().optional(),

  // Coverage area
  callaPolska: z.boolean(),
  onlineOnly: z.boolean(),

  // Type and subscription
  typOferty: z.enum(["STALA_WSPOLPRACA", "JEDNORAZOWA_USLUGA", "KONSULTACJA", "WSZYSTKIE"]),
  pakietSubskrypcji: z.enum(["PODSTAWOWY", "STANDARD", "PREMIUM", "BIZNES"]),
  punktySaldo: z.number(),
  dataPakietuOd: z.string().optional(),
  dataPakietuDo: z.string().optional(),

  // Consents
  zgodaRegulamin: z.boolean(),
  zgodaPrzetwarzanie: z.boolean(),

  // Status
  zweryfikowana: z.boolean(),
  aktywna: z.boolean(),

  // Account Manager
  accountManagerId: z.string().optional(),
})

type LawFirmFormValues = z.infer<typeof lawFirmSchema>

interface Voivodeship {
  id: string
  nazwa: string
}

interface AccountManager {
  id: string
  imie: string
  nazwisko: string
  email: string
  aktywny: boolean
}

interface NotificationSettings {
  id: string
  userId: string
  emailNoweOferty: boolean
  emailWiadomosci: boolean
  emailStatusy: boolean
  smsPilne: boolean
  kontaktKlienci: boolean
  kluczowe: boolean
  wskazowkiPorady: boolean
  ofertPromocje: boolean
  przypomnienieWiadomosci: boolean
  noweFunkcje: boolean
  zmianyCenniki: boolean
  zmianyRegulamin: boolean
  kontaktDoradca: boolean
  wyswietlanieAwatara: boolean
  autoProsbOpinie: boolean
  powiadomienieDzwiekowe: boolean
  ustawieniaOgloszenia: boolean
  powiadomieniaSmNowa: boolean
  wiadomosciZbiorcze: boolean
  urlop: boolean
}

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
      pakietSubskrypcji: "PODSTAWOWY",
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
            pakietSubskrypcji: lawFirm.pakietSubskrypcji,
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
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        label=""
                        description="Logo kancelarii będzie wyświetlane w profilu publicznym"
                      />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz pakiet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        label=""
                        description="Główne zdjęcie profilu kancelarii"
                      />
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
          {notificationSettings && (
            <Card>
              <CardHeader>
                <CardTitle>Ustawienia powiadomień użytkownika</CardTitle>
                <CardDescription>Dane tylko do odczytu - użytkownik zarządza nimi w swoim panelu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Powiadomienia e-mail</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.kontaktKlienci ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Kontakt z klientami</span>
                        {notificationSettings.kontaktKlienci && <span className="text-xs text-muted-foreground">(obowiązkowe)</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.kluczowe ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Informacje kluczowe</span>
                        {notificationSettings.kluczowe && <span className="text-xs text-muted-foreground">(obowiązkowe)</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.wskazowkiPorady ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Wskazówki i porady</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.ofertPromocje ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Oferty i promocje</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.przypomnienieWiadomosci ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Przypomnienia o wiadomościach</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.noweFunkcje ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Nowe funkcje</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.zmianyCenniki ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Zmiany cenników</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.zmianyRegulamin ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Zmiany regulaminu</span>
                      </div>
                    </div>
                  </div>

                  {/* Phone Contact */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Kontakt telefoniczny</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.kontaktDoradca ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Kontakt z doradcą</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Settings */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Ustawienia dodatkowe</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.wyswietlanieAwatara ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Wyświetlanie awatara</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.autoProsbOpinie ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Automatyczna prośba o opinie</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.powiadomienieDzwiekowe ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Powiadomienia dźwiękowe</span>
                      </div>
                    </div>
                  </div>

                  {/* Announcement Settings */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Ustawienia ogłoszeń</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.ustawieniaOgloszenia ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Ustawienia ogłoszenia aktywne</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.powiadomieniaSmNowa ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Powiadomienia SMS o nowych sprawach</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${notificationSettings.wiadomosciZbiorcze ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">Wiadomości zbiorcze</span>
                      </div>
                    </div>
                  </div>

                  {/* Vacation Mode */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Tryb urlopowy</h3>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${notificationSettings.urlop ? "bg-amber-500" : "bg-gray-300"}`} />
                      <span className="text-sm font-medium">{notificationSettings.urlop ? "Tryb urlopowy AKTYWNY" : "Tryb urlopowy nieaktywny"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Statystyki</CardTitle>
              <CardDescription>Dane tylko do odczytu - nie można edytować</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Wyświetlenia profilu</p>
                  <p className="text-2xl font-bold">{statistics.wyswietleniaProfilu}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Złożone oferty</p>
                  <p className="text-2xl font-bold">{statistics.zlozoneOferty}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Wygrane oferty</p>
                  <p className="text-2xl font-bold">{statistics.wygraneOferty}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Konwersja</p>
                  <p className="text-2xl font-bold">{statistics.konwersja.toFixed(2)}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Pozycja w rankingu</p>
                  <p className="text-2xl font-bold">{statistics.pozycjaRanking || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
    </div>
  )
}
