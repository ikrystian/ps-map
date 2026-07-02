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
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, AlertCircle, Check, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import * as z from "zod"

// Validation schema for law firm form
const createLawFirmSchema = z.object({
  // User credentials
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  userStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"]),

  // Basic info
  typ: z.enum(["OSOBA_FIZYCZNA", "SPOLKA_CYWILNA", "SPOLKA_PARTNERSKA", "SPOLKA_KOMANDYTOWA", "SPOLKA_JAWNA", "SPOLKA_ZOO", "INNY"]),
  typInny: z.string().optional(),
  expertiseCategoryId: z.string().optional(),
  nazwa: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  nip: z.string().regex(/^\d{10}$/, "NIP must be 10 digits").or(z.literal("")),
  regon: z.string().optional(),
  krs: z.string().optional(),

  // Contact
  imieKontakt: z.string().min(1, "Contact first name is required"),
  nazwiskoKontakt: z.string().min(1, "Contact last name is required"),
  numerTelefonu: z.string().min(1, "Phone number is required"),
  numerTelefonu2: z.string().optional(),

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
  pakietSubskrypcji: z.enum(["PODSTAWOWY", "STANDARD", "PREMIUM", "BIZNES"]).nullable().optional().or(z.literal("")),
  punktySaldo: z.number(),
  dataPakietuOd: z.string().optional(),
  dataPakietuDo: z.string().optional(),

  // Consents
  zgodaRegulamin: z.boolean(),
  zgodaPrzetwarzanie: z.boolean(),

  // Status
  zweryfikowana: z.boolean(),
  aktywna: z.boolean(),
})

type CreateLawFirmFormValues = z.infer<typeof createLawFirmSchema>

type ExpertiseCategoryItem = {
  id: string
  nazwa: string
  parentId: string | null
  children?: ExpertiseCategoryItem[]
}

import type { Voivodeship } from "@/types"

export default function NewLawFirmPage() {
  const router = useRouter()
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [expertiseCategories, setExpertiseCategories] = useState<ExpertiseCategoryItem[]>([])
  const [selectedCatId, setSelectedCatId] = useState("")
  const [selectedSubcatId, setSelectedSubcatId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateLawFirmFormValues>({
    resolver: zodResolver(createLawFirmSchema),
    defaultValues: {
      email: "",
      password: "",
      userStatus: "ACTIVE",
      typ: "INNY",
      typInny: "",
      expertiseCategoryId: "",
      nazwa: "",
      nazwa: "",
      slug: "",
      nip: "",
      regon: "",
      krs: "",
      imieKontakt: "",
      nazwiskoKontakt: "",
      numerTelefonu: "",
      numerTelefonu2: "",
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
    },
  })

  // Fetch voivodeships and expertise categories
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
    const fetchExpertiseCategories = async () => {
      try {
        const response = await fetch("/api/expertise-categories")
        if (response.ok) {
          const data = await response.json()
          setExpertiseCategories(data)
        }
      } catch (error) {
        console.error("Error fetching expertise categories:", error)
      }
    }
    fetchVoivodeships()
    fetchExpertiseCategories()
  }, [])

  // Create law firm
  const handleSubmit = async (values: CreateLawFirmFormValues) => {
    try {
      setIsSubmitting(true)
      const submitValues = {
        ...values,
        pakietSubskrypcji: (values.pakietSubskrypcji === "" || !values.pakietSubskrypcji) ? null : values.pakietSubskrypcji,
      }
      const response = await fetch("/api/admin/law-firms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitValues),
      })

      if (response.ok) {
        toast.success("Ekspert została utworzona pomyślnie")
        router.push("/admin/law-firms")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd podczas tworzenia eksperta")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się utworzyć eksperta")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Dodaj Nowego Eksperta" subtitle="Wprowadź dane nowego eksperta prawnego" />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/law-firms">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <CardDescription>Informacje o ekspercie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Expertise Category Selector */}
              <div className="space-y-3">
                <FormLabel>Kategoria specjalizacji</FormLabel>
                {expertiseCategories.length === 0 ? (
                  <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">Trwa ładowanie kategorii...</div>
                ) : (
                  <div className="space-y-3">
                    <Select
                      value={selectedCatId}
                      onValueChange={(val) => {
                        setSelectedCatId(val)
                        setSelectedSubcatId("")
                        form.setValue("expertiseCategoryId", "")
                        form.setValue("typ", "INNY")
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz kategorię..." />
                      </SelectTrigger>
                      <SelectContent>
                        {expertiseCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.nazwa}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {(() => {
                      const selectedCat = expertiseCategories.find(c => c.id === selectedCatId)
                      if (!selectedCat) return null
                      const hasSubcategories = selectedCat.children?.some(ch => ch.children && ch.children.length > 0) ?? false
                      const subcategoriesList = selectedCat.children || []
                      const selectedSubcat = subcategoriesList.find(s => s.id === selectedSubcatId)
                      const specializationsList = !hasSubcategories
                        ? subcategoriesList
                        : selectedSubcat?.children || []

                      return (
                        <>
                          {hasSubcategories && (
                            <Select
                              value={selectedSubcatId}
                              onValueChange={(val) => {
                                setSelectedSubcatId(val)
                                form.setValue("expertiseCategoryId", "")
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz podkategorię..." />
                              </SelectTrigger>
                              <SelectContent>
                                {subcategoriesList.map((sub) => (
                                  <SelectItem key={sub.id} value={sub.id}>{sub.nazwa}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {(!hasSubcategories || selectedSubcatId) && specializationsList.length > 0 && (
                            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                              {specializationsList.map((spec) => {
                                const isSelected = form.watch("expertiseCategoryId") === spec.id
                                return (
                                  <div
                                    key={spec.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? "bg-primary/5 border-primary" : "border-transparent bg-muted/30 hover:border-primary/30 hover:bg-muted/50"}`}
                                    onClick={() => {
                                      const parts = [selectedCat.nazwa]
                                      if (selectedSubcat) parts.push(selectedSubcat.nazwa)
                                      parts.push(spec.nazwa)
                                      form.setValue("expertiseCategoryId", spec.id)
                                      form.setValue("typ", "INNY")
                                      form.setValue("typInny", parts.join(" > "))
                                    }}
                                  >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/30"}`}>
                                      {isSelected && <Check className="w-3 h-3" />}
                                    </div>
                                    <span className={`text-sm ${isSelected ? "text-primary font-medium" : "text-foreground"}`}>{spec.nazwa}</span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">

                <FormField
                  control={form.control}
                  name="nazwa"
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
                      <Input placeholder="np. ekspert-kowalski" {...field} />
                    </FormControl>
                    <FormDescription>
                      Przyjazny URL dla profilu eksperta. Zostanie wygenerowany automatycznie jeśli pozostawisz puste.
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
                      <Textarea placeholder="Opis eksperta..." {...field} />
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
                        description="Logo ekspercie będzie wyświetlane w profilu publicznym"
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


            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Adres</CardTitle>
              <CardDescription>Lokalizacja eksperta</CardDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        description="Główne zdjęcie profilu eksperta"
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <CardDescription>Godziny pracy eksperta</CardDescription>
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
                          Ekspert świadczy usługi na terenie całej Polski
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
                          Ekspert świadczy usługi wyłącznie online
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

          {/* Sticky Actions Bar at the bottom of the page */}
          <div className="sticky bottom-4 left-0 right-0 z-20 bg-background/90 backdrop-blur border border-border p-4 rounded-xl flex justify-between items-center gap-4 shadow-lg">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>Status walidacji:</span>
              {Object.keys(form.formState.errors).length > 0 ? (
                <span className="text-destructive flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="h-4 w-4 animate-bounce" />
                  Wykryto błędy w formularzu
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tworzenie...
                  </>
                ) : (
                  "Dodaj Eksperta"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
