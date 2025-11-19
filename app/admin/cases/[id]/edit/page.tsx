"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, ExternalLink } from "lucide-react"
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

// Validation schema
const caseSchema = z.object({
  typSprawy: z.enum(["OSOBA_PRYWATNA", "FIRMA", "ORGANIZACJA"]),
  categoryId: z.string().min(1, "Category is required"),
  wybranadziedzinaPrawa: z.string().optional(),
  wybranaSpecyfikacja: z.string().optional(),
  specjalizacja: z.string().optional(),
  nazwaSprawy: z.string().min(1, "Case name is required"),
  opisSprawy: z.string().min(100, "Description must be at least 100 characters"),
  oczekiwanyTerminRealizacji: z.string().optional(),
  trybPilny: z.boolean(),
  budzetOd: z.number().optional(),
  budzetDo: z.number().optional(),
  doNegocjacji: z.boolean(),
  imieNazwisko: z.string().min(1, "Name is required"),
  emailKontakt: z.string().email("Invalid email address"),
  telefonKontakt: z.string().min(1, "Phone is required"),
  preferowanyKontakt: z.enum(["EMAIL", "TELEFON", "OBA"]),
  voivodeshipId: z.string().min(1, "Voivodeship is required"),
  status: z.enum(["NOWA", "OFERTY_OTRZYMANE", "W_TRAKCIE", "ZAKONCZONA", "ANULOWANA"]),
  isArchived: z.boolean(),
})

type CaseFormValues = z.infer<typeof caseSchema>

interface Voivodeship {
  id: string
  nazwa: string
}

interface Category {
  id: string
  nazwa: string
}

export default function EditCasePage() {
  const params = useParams()
  const router = useRouter()
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attachments, setAttachments] = useState<string[]>([])

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      typSprawy: "OSOBA_PRYWATNA",
      categoryId: "",
      wybranadziedzinaPrawa: "",
      wybranaSpecyfikacja: "",
      specjalizacja: "",
      nazwaSprawy: "",
      opisSprawy: "",
      oczekiwanyTerminRealizacji: "",
      trybPilny: false,
      budzetOd: undefined,
      budzetDo: undefined,
      doNegocjacji: false,
      imieNazwisko: "",
      emailKontakt: "",
      telefonKontakt: "",
      preferowanyKontakt: "EMAIL",
      voivodeshipId: "",
      status: "NOWA",
      isArchived: false,
    },
  })

  // Fetch voivodeships and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voivodeshipsRes, categoriesRes] = await Promise.all([
          fetch("/api/voivodeships"),
          fetch("/api/categories"),
        ])
        if (voivodeshipsRes.ok) {
          const data = await voivodeshipsRes.json()
          setVoivodeships(data)
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  // Fetch case data
  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/cases/${params.id}`)
        if (response.ok) {
          const caseData = await response.json()

          // Set attachments if they exist
          if (caseData.zalaczniki && Array.isArray(caseData.zalaczniki)) {
            setAttachments(caseData.zalaczniki)
          }

          form.reset({
            typSprawy: caseData.typSprawy,
            categoryId: caseData.categoryId,
            wybranadziedzinaPrawa: caseData.wybranadziedzinaPrawa || "",
            wybranaSpecyfikacja: caseData.wybranaSpecyfikacja || "",
            specjalizacja: caseData.specjalizacja || "",
            nazwaSprawy: caseData.nazwaSprawy,
            opisSprawy: caseData.opisSprawy,
            oczekiwanyTerminRealizacji: caseData.oczekiwanyTerminRealizacji
              ? new Date(caseData.oczekiwanyTerminRealizacji).toISOString().split('T')[0]
              : "",
            trybPilny: caseData.trybPilny,
            budzetOd: caseData.budzetOd || undefined,
            budzetDo: caseData.budzetDo || undefined,
            doNegocjacji: caseData.doNegocjacji,
            imieNazwisko: caseData.imieNazwisko,
            emailKontakt: caseData.emailKontakt,
            telefonKontakt: caseData.telefonKontakt,
            preferowanyKontakt: caseData.preferowanyKontakt,
            voivodeshipId: caseData.voivodeshipId,
            status: caseData.status,
            isArchived: caseData.isArchived,
          })
        } else {
          throw new Error("Błąd pobierania danych sprawy")
        }
      } catch (error) {
        toast.error("Nie udało się pobrać danych sprawy")
        router.push("/admin/cases")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCase()
    }
  }, [params.id, router])

  // Update case
  const handleSubmit = async (values: CaseFormValues) => {
    try {
      setIsSubmitting(true)

      const updateData: any = {
        ...values,
        oczekiwanyTerminRealizacji: values.oczekiwanyTerminRealizacji
          ? new Date(values.oczekiwanyTerminRealizacji).toISOString()
          : null,
      }

      const response = await fetch(`/api/admin/cases/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast.success("Sprawa została zaktualizowana pomyślnie")
        router.push("/admin/cases")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd podczas aktualizacji sprawy")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaktualizować sprawy")
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
          <Link href="/admin/cases">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edycja sprawy</h1>
          <p className="text-muted-foreground">{form.getValues("nazwaSprawy")}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe informacje</CardTitle>
              <CardDescription>Typ i kategoria sprawy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="typSprawy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Typ sprawy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz typ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OSOBA_PRYWATNA">Osoba prywatna</SelectItem>
                        <SelectItem value="FIRMA">Firma</SelectItem>
                        <SelectItem value="ORGANIZACJA">Organizacja</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kategorię" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nazwa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nazwaSprawy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa sprawy</FormLabel>
                    <FormControl>
                      <Input placeholder="Krótka nazwa sprawy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="opisSprawy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis sprawy</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Szczegółowy opis sprawy (minimum 100 znaków)"
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value.length}/100 znaków
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Szczegóły</CardTitle>
              <CardDescription>Dodatkowe informacje o sprawie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="wybranadziedzinaPrawa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dziedzina prawa (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Input placeholder="np. Prawo rodzinne" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wybranaSpecyfikacja"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specyfikacja (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Input placeholder="np. Rozwód" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specjalizacja"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specjalizacja (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Input placeholder="Dodatkowe wymagania" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Timeline and Budget */}
          <Card>
            <CardHeader>
              <CardTitle>Termin i budżet</CardTitle>
              <CardDescription>Oczekiwany termin i budżet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="oczekiwanyTerminRealizacji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oczekiwany termin realizacji (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trybPilny"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Tryb pilny</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budzetOd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budżet od (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budzetDo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budżet do (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="doNegocjacji"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Do negocjacji</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Dane kontaktowe</CardTitle>
              <CardDescription>Informacje o kliencie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="imieNazwisko"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imię i nazwisko</FormLabel>
                    <FormControl>
                      <Input placeholder="Jan Kowalski" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailKontakt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email kontaktowy</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefonKontakt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon kontaktowy</FormLabel>
                    <FormControl>
                      <Input placeholder="+48 123 456 789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferowanyKontakt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferowany kontakt</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="TELEFON">Telefon</SelectItem>
                        <SelectItem value="OBA">Oba</SelectItem>
                      </SelectContent>
                    </Select>
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

          {/* Attachments */}
          {attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Załączone pliki</CardTitle>
                <CardDescription>Pliki dodane do sprawy przez klienta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {attachments.map((fileUrl, index) => {
                    const fileName = fileUrl.split('/').pop() || `Plik ${index + 1}`
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{decodeURIComponent(fileName)}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-md">{fileUrl}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Otwórz
                          </a>
                        </Button>
                      </div>
                    )
                  })}
                </div>
                {attachments.length === 0 && (
                  <p className="text-sm text-muted-foreground">Brak załączonych plików</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status sprawy</CardTitle>
              <CardDescription>Status i archiwizacja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <SelectItem value="NOWA">Nowa</SelectItem>
                        <SelectItem value="OFERTY_OTRZYMANE">Oferty otrzymane</SelectItem>
                        <SelectItem value="W_TRAKCIE">W trakcie</SelectItem>
                        <SelectItem value="ZAKONCZONA">Zakończona</SelectItem>
                        <SelectItem value="ANULOWANA">Anulowana</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isArchived"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Zarchiwizowana</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/cases")}>
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
