"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  Ban,
  Loader2,
  Lock,
  Save,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const editCaseSchema = z.object({
  nazwaSprawy: z.string().min(1, "Podaj nazwę sprawy"),
  opisSprawy: z.string().min(100, "Opis musi mieć co najmniej 100 znaków"),
  oczekiwanyTerminRealizacji: z.string().optional(),
  trybPilny: z.boolean(),
  budzetOd: z.union([z.number(), z.undefined()]),
  budzetDo: z.union([z.number(), z.undefined()]),
  doNegocjacji: z.boolean(),
  imieNazwisko: z.string().min(1, "Podaj imię i nazwisko"),
  telefonKontakt: z.string().min(1, "Podaj numer telefonu"),
  preferowanyKontakt: z.enum(["EMAIL", "TELEFON", "OBA"]),
})

type EditCaseFormValues = z.infer<typeof editCaseSchema>

interface CaseData {
  id: string
  numerSprawy: string | null
  nazwaSprawy: string
  opisSprawy: string
  status: string
  oczekiwanyTerminRealizacji?: string | null
  trybPilny: boolean
  budzetOd?: number | null
  budzetDo?: number | null
  doNegocjacji: boolean
  imieNazwisko: string
  telefonKontakt: string
  preferowanyKontakt: string
}

const statusLabels: Record<string, { label: string; className: string }> = {
  NOWA: { label: "Nowa", className: "bg-primary/10 text-primary border border-primary/30" },
  OFERTY_OTRZYMANE: { label: "Oferty otrzymane", className: "bg-secondary/15 text-secondary border border-secondary/30" },
  W_TRAKCIE: { label: "W toku", className: "bg-primary/10 text-primary border border-primary/30" },
  ZAKONCZONA: { label: "Zakończona", className: "bg-success/10 text-success border border-success/30" },
  ANULOWANA: { label: "Anulowana", className: "bg-error/10 text-error border border-error/30" },
}

export default function EditCasePage() {
  const params = useParams()
  const router = useRouter()
  const caseId = params.id as string

  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)

  const form = useForm<EditCaseFormValues>({
    resolver: zodResolver(editCaseSchema),
    defaultValues: {
      nazwaSprawy: "",
      opisSprawy: "",
      oczekiwanyTerminRealizacji: "",
      trybPilny: false,
      budzetOd: undefined,
      budzetDo: undefined,
      doNegocjacji: false,
      imieNazwisko: "",
      telefonKontakt: "",
      preferowanyKontakt: "EMAIL",
    },
  })

  const fetchCase = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`)
      if (!response.ok) throw new Error("Nie udało się pobrać danych sprawy")

      const data = await response.json()
      setCaseData(data)
      form.reset({
        nazwaSprawy: data.nazwaSprawy,
        opisSprawy: data.opisSprawy,
        oczekiwanyTerminRealizacji: data.oczekiwanyTerminRealizacji
          ? new Date(data.oczekiwanyTerminRealizacji).toISOString().split("T")[0]
          : "",
        trybPilny: data.trybPilny,
        budzetOd: data.budzetOd ?? undefined,
        budzetDo: data.budzetDo ?? undefined,
        doNegocjacji: data.doNegocjacji,
        imieNazwisko: data.imieNazwisko,
        telefonKontakt: data.telefonKontakt,
        preferowanyKontakt: data.preferowanyKontakt,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
      router.push("/panel-klienta/sprawy")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (caseId) fetchCase()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId])

  const doNegocjacji = form.watch("doNegocjacji")
  const isClosed = caseData?.status === "ANULOWANA" || caseData?.status === "ZAKONCZONA"

  const handleSubmit = async (values: EditCaseFormValues) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          oczekiwanyTerminRealizacji: values.oczekiwanyTerminRealizacji || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Nie udało się zaktualizować sprawy")
      }

      toast.success("Sprawa została zaktualizowana")
      router.push(`/panel-klienta/sprawy/${caseId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd podczas zapisywania")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseCase = async () => {
    setIsClosing(true)
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ANULOWANA" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Nie udało się zamknąć sprawy")
      }

      toast.success("Sprawa została zamknięta i nie jest już widoczna dla ekspertów")
      router.push(`/panel-klienta/sprawy/${caseId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd podczas zamykania sprawy")
    } finally {
      setIsClosing(false)
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie danych sprawy...</p>
        </div>
      </div>
    )
  }

  if (!caseData) return null

  return (
    <div className="relative space-y-8">
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/panel-klienta/sprawy/${caseId}`)}
          className="-ml-2 text-muted-foreground hover:text-foreground gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót do sprawy
        </Button>
        <PageHeader
          title="Edytuj sprawę"
          subtitle={caseData.numerSprawy ? `Nr sprawy: ${caseData.numerSprawy}` : undefined}
        >
          <span
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border",
              statusLabels[caseData.status]?.className || "bg-background-sec/40 text-muted-foreground border-border/30"
            )}
          >
            {statusLabels[caseData.status]?.label || caseData.status}
          </span>
        </PageHeader>
      </div>

      {isClosed ? (
        <Card variant="glass" className="relative z-10 border-border/30">
          <CardContent className="flex flex-col items-center text-center gap-3 py-12 px-6">
            <div className="p-3.5 rounded-full bg-background-sec/40 border border-border/30">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground font-medium">Ta sprawa jest zamknięta</p>
              <p className="text-muted-foreground text-sm font-light max-w-md">
                Sprawa ma status &bdquo;{statusLabels[caseData.status]?.label || caseData.status}&rdquo; i nie jest już edytowalna
                ani widoczna dla ekspertów. Skontaktuj się z administratorem, jeśli chcesz ją ponownie otworzyć.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push(`/panel-klienta/sprawy/${caseId}`)} className="mt-2 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Powrót do sprawy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="relative z-10 space-y-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="font-playfair text-foreground text-base">Szczegóły sprawy</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Nazwa i opis widoczne dla ekspertów przeglądających Twoją sprawę.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nazwaSprawy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground">Nazwa sprawy</FormLabel>
                      <FormControl>
                        <Input className="h-11" placeholder="Krótka nazwa sprawy" {...field} />
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
                      <FormLabel className="text-xs font-semibold text-muted-foreground">Opis sprawy</FormLabel>
                      <FormControl>
                        <Textarea rows={6} placeholder="Szczegółowy opis sprawy (minimum 100 znaków)" {...field} />
                      </FormControl>
                      <FormDescription className="text-sm text-muted-foreground">
                        {field.value.length}/100 znaków
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle className="font-playfair text-foreground text-base">Termin i budżet</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Oczekiwany termin realizacji oraz widełki budżetowe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="oczekiwanyTerminRealizacji"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground">Oczekiwany termin realizacji</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trybPilny"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/30 bg-background-sec/20 p-3 gap-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-xs text-foreground">Tryb pilny</FormLabel>
                        <FormDescription className="text-sm text-muted-foreground">
                          Sprawa zostanie oznaczona jako pilna dla ekspertów.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doNegocjacji"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/30 bg-background-sec/20 p-3 gap-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-xs text-foreground">Budżet do negocjacji</FormLabel>
                        <FormDescription className="text-sm text-muted-foreground">
                          Nie podajesz konkretnych widełek kwotowych.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!doNegocjacji && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budzetOd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground">Budżet od</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="h-11"
                              placeholder="0"
                              value={field.value ?? ""}
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
                          <FormLabel className="text-xs font-semibold text-muted-foreground">Budżet do</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="h-11"
                              placeholder="0"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle className="font-playfair text-foreground text-base">Dane kontaktowe</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Dane, którymi skontaktuje się z Tobą wybrany ekspert.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="imieNazwisko"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground">Imię i nazwisko</FormLabel>
                      <FormControl>
                        <Input className="h-11" placeholder="Jan Kowalski" {...field} />
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
                      <FormLabel className="text-xs font-semibold text-muted-foreground">Telefon kontaktowy</FormLabel>
                      <FormControl>
                        <Input className="h-11" placeholder="+48 123 456 789" {...field} />
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
                      <FormLabel className="text-xs font-semibold text-muted-foreground">Preferowany kontakt</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 bg-background-sec/20 border-border/30 rounded-lg text-foreground">
                            <SelectValue placeholder="Wybierz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EMAIL">Email</SelectItem>
                          <SelectItem value="TELEFON">Telefon</SelectItem>
                          <SelectItem value="OBA">Email i telefon</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card variant="glass" className="border-error/20">
              <CardHeader>
                <CardTitle className="font-playfair text-foreground text-base">Zamknij sprawę</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Sprawa zniknie z wyników wyszukiwania ekspertów i nie będzie już można składać do niej ofert.
                  Tej operacji nie można cofnąć samodzielnie.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant="outline"
                  className="border-error/30 text-error hover:bg-error/10 hover:text-error gap-2"
                  onClick={() => setShowCloseDialog(true)}
                >
                  <Ban className="h-4 w-4" />
                  Zamknij sprawę
                </Button>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-4">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full sm:flex-1 h-11 shadow-md shadow-primary/20 gap-2"
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
                className="w-full sm:w-auto h-11 px-6"
                onClick={() => router.push(`/panel-klienta/sprawy/${caseId}`)}
              >
                Anuluj
              </Button>
            </div>
          </form>
        </Form>
      )}

      <ConfirmDeleteDialog
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}
        onConfirm={handleCloseCase}
        isPending={isClosing}
        variant="warning"
        title="Zamknąć tę sprawę?"
        description="Sprawa przestanie być widoczna dla ekspertów w wynikach wyszukiwania i nie będzie już można składać do niej ofert. Nie możesz samodzielnie cofnąć tej operacji."
        confirmText="Zamknij sprawę"
        cancelText="Wróć"
      />
    </div>
  )
}
