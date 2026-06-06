"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Search, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import * as z from "zod"

// Validation schema
const caseSchema = z.object({
  clientId: z.string().min(1, "Klient jest wymagany"),
  typSprawy: z.enum(["OSOBA_PRYWATNA", "FIRMA", "ORGANIZACJA"]),
  categoryId: z.string().min(1, "Kategoria jest wymagana"),
  wybranadziedzinaPrawa: z.string().optional(),
  wybranaSpecyfikacja: z.string().optional(),
  specjalizacja: z.string().optional(),
  nazwaSprawy: z.string().min(1, "Nazwa sprawy jest wymagana"),
  opisSprawy: z.string().min(100, "Opis musi zawierać minimum 100 znaków"),
  oczekiwanyTerminRealizacji: z.string().optional(),
  trybPilny: z.boolean(),
  budzetOd: z.number().optional(),
  budzetDo: z.number().optional(),
  doNegocjacji: z.boolean(),
  imieNazwisko: z.string().min(1, "Imię i nazwisko jest wymagane"),
  emailKontakt: z.string().email("Nieprawidłowy adres email"),
  telefonKontakt: z.string().min(1, "Telefon jest wymagany"),
  preferowanyKontakt: z.enum(["EMAIL", "TELEFON", "OBA"]),
  voivodeshipId: z.string().min(1, "Województwo jest wymagane"),
  status: z.enum(["NOWA", "OFERTY_OTRZYMANE", "W_TRAKCIE", "ZAKONCZONA", "ANULOWANA"]),
  akceptujeKlauzule: z.boolean(),
})

type CaseFormValues = z.infer<typeof caseSchema>

interface Client {
  id: string
  imie: string
  nazwisko: string
  user: {
    email: string
  }
}

interface Voivodeship {
  id: string
  nazwa: string
}

import { Category } from "@/types/categories"

export default function NewCasePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientSearchOpen, setClientSearchOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      clientId: "",
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
      akceptujeKlauzule: true,
    },
  })

  // Fetch clients, voivodeships and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, voivodeshipsRes, categoriesRes] = await Promise.all([
          fetch("/api/admin/clients"),
          fetch("/api/voivodeships"),
          fetch("/api/categories"),
        ])

        if (clientsRes.ok) {
          const data = await clientsRes.json()
          setClients(data.clients || data)
        }

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
        toast.error("Nie udało się pobrać danych")
      }
    }
    fetchData()
  }, [])

  // Auto-fill contact data when client is selected
  useEffect(() => {
    if (selectedClient) {
      form.setValue("imieNazwisko", `${selectedClient.imie} ${selectedClient.nazwisko}`)
      form.setValue("emailKontakt", selectedClient.user.email)
    }
  }, [selectedClient, form])

  // Create case
  const handleSubmit = async (values: CaseFormValues) => {
    try {
      setIsSubmitting(true)

      const submitData: any = {
        ...values,
        oczekiwanyTerminRealizacji: values.oczekiwanyTerminRealizacji
          ? new Date(values.oczekiwanyTerminRealizacji).toISOString()
          : null,
      }

      const response = await fetch("/api/admin/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const newCase = await response.json()
        toast.success("Sprawa została utworzona pomyślnie")
        router.push(`/admin/cases/${newCase.id}`)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd podczas tworzenia sprawy")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się utworzyć sprawy")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Nowa sprawa" subtitle="Utwórz nową sprawę dla klienta" />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/cases">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Wybierz klienta</CardTitle>
              <CardDescription>Wybierz klienta, dla którego tworzysz sprawę</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Klient</FormLabel>
                    <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {selectedClient ? (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>
                                  {selectedClient.imie} {selectedClient.nazwisko} ({selectedClient.user.email})
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                <span>Wyszukaj klienta...</span>
                              </div>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[500px] p-0">
                        <Command>
                          <CommandInput placeholder="Szukaj klienta po imieniu, nazwisku lub emailu..." />
                          <CommandEmpty>Nie znaleziono klienta</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-auto">
                            {clients.map((client) => (
                              <CommandItem
                                key={client.id}
                                value={`${client.imie} ${client.nazwisko} ${client.user.email}`}
                                onSelect={() => {
                                  setSelectedClient(client)
                                  field.onChange(client.id)
                                  setClientSearchOpen(false)
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <div>
                                    <p className="font-medium">
                                      {client.imie} {client.nazwisko}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{client.user.email}</p>
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Wybierz istniejącego klienta z listy
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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
              <CardDescription>Informacje kontaktowe klienta</CardDescription>
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

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status sprawy</CardTitle>
              <CardDescription>Ustal początkowy status sprawy</CardDescription>
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
                        <SelectItem value="W_TRAKCIE">W toku</SelectItem>
                        <SelectItem value="ZAKONCZONA">Zakończona</SelectItem>
                        <SelectItem value="ANULOWANA">Anulowana</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
              {isSubmitting ? "Tworzenie..." : "Utwórz Sprawę"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
