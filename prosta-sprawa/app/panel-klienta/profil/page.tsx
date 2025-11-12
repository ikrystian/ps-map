"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { Loader2, Save, User } from "lucide-react"

const profileFormSchema = z.object({
  imie: z.string().min(2, "Imię musi mieć minimum 2 znaki"),
  nazwisko: z.string().min(2, "Nazwisko musi mieć minimum 2 znaki"),
  telefon: z.string().optional(),
  adres: z.string().optional(),
  kodPocztowy: z.string().optional(),
  miasto: z.string().optional(),
  voivodeshipId: z.string().optional(),
  zgodaNewsletter: z.any().transform(v => Boolean(v)),
  zgodaMarketing: z.any().transform(v => Boolean(v)),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface Voivodeship {
  id: string
  nazwa: string
}

export default function ClientProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [clientData, setClientData] = useState<any>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      imie: "",
      nazwisko: "",
      telefon: "",
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
          imie: data.imie || "",
          nazwisko: data.nazwisko || "",
          telefon: data.telefon || "",
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
        router.push("/panel-klienta")
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
        <h1 className="text-3xl font-bold">Edycja Profilu</h1>
        <p className="text-muted-foreground mt-2">
          Zaktualizuj swoje dane osobowe i ustawienia
        </p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Zdjęcie profilowe</CardTitle>
          <CardDescription>To zdjęcie będzie widoczne dla kancelarii</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={clientData?.user.image || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Aby zmienić zdjęcie profilowe, skontaktuj się z administracją
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dane osobowe */}
          <Card>
            <CardHeader>
              <CardTitle>Dane osobowe</CardTitle>
              <CardDescription>Podstawowe informacje o Tobie</CardDescription>
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
                        defaultValue={field.value}
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
    </div>
  )
}
