"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

// Validation schema for law firm form
const createLawFirmSchema = z.object({
  // User credentials
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  userStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),

  // Basic info
  typ: z.enum(["OSOBA_FIZYCZNA", "SPOLKA_CYWILNA", "SPOLKA_PARTNERSKA", "SPOLKA_KOMANDYTOWA", "SPOLKA_JAWNA", "SPOLKA_ZOO", "INNY"]),
  typInny: z.string().optional(),
  nazwa: z.string().min(1, "Name is required"),
  nazwaFirmy: z.string().min(1, "Company name is required"),
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

  // Type and subscription
  typOferty: z.enum(["STALA_WSPOLPRACA", "JEDNORAZOWA_USLUGA", "KONSULTACJA", "WSZYSTKIE"]),
  pakietSubskrypcji: z.enum(["PODSTAWOWY", "STANDARD", "PREMIUM", "BIZNES"]),
  punktySaldo: z.number(),

  // Status
  zweryfikowana: z.boolean(),
  aktywna: z.boolean(),
})

type CreateLawFirmFormValues = z.infer<typeof createLawFirmSchema>

interface Voivodeship {
  id: string
  nazwa: string
}

export default function NewLawFirmPage() {
  const router = useRouter()
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateLawFirmFormValues>({
    resolver: zodResolver(createLawFirmSchema),
    defaultValues: {
      email: "",
      password: "",
      userStatus: "ACTIVE",
      typ: "OSOBA_FIZYCZNA",
      typInny: "",
      nazwa: "",
      nazwaFirmy: "",
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
      typOferty: "WSZYSTKIE",
      pakietSubskrypcji: "PODSTAWOWY",
      punktySaldo: 0,
      zweryfikowana: false,
      aktywna: true,
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

  // Create law firm
  const handleSubmit = async (values: CreateLawFirmFormValues) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/admin/law-firms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast.success("Kancelaria została utworzona pomyślnie")
        router.push("/admin/law-firms")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd podczas tworzenia kancelarii")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się utworzyć kancelarii")
    } finally {
      setIsSubmitting(false)
    }
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
          <h1 className="text-3xl font-bold">Dodaj Nową Kancelarię</h1>
          <p className="text-muted-foreground">Wprowadź dane nowej kancelarii prawniczej</p>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/law-firms")}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Tworzenie..." : "Dodaj Kancelarię"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
