"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { CheckCircle2, Loader2, Phone, Video } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const MIN_OPIS_LENGTH = 100

interface Category {
  id: string
  nazwa: string
}

interface FormState {
  temat: string
  opis: string
  categoryId: string
  forma: "VIDEO" | "TELEFON" | "DOWOLNA"
  preferowanyCzas: string
  preferowanyTermin: string
  terminOd: string
  terminDo: string
  budzetDo: string
  imieNazwisko: string
  telefonKontakt: string
  akceptujeKlauzule: boolean
}

const INITIAL_FORM: FormState = {
  temat: "",
  opis: "",
  categoryId: "",
  forma: "DOWOLNA",
  preferowanyCzas: "",
  preferowanyTermin: "",
  terminOd: "",
  terminDo: "",
  budzetDo: "",
  imieNazwisko: "",
  telefonKontakt: "",
  akceptujeKlauzule: false,
}

export default function AskForConsultationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          setCategories(await response.json())
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/clients/me")
        if (response.ok) {
          const userData = await response.json()
          setFormData((prev) => ({
            ...prev,
            imieNazwisko: `${userData.imie || ""} ${userData.nazwisko || ""}`.trim(),
            telefonKontakt: userData.telefon || "",
          }))
        }
      } catch (error) {
        console.error("Error fetching client data:", error)
      }
    }
    fetchUserData()
  }, [])

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field as string]
      return next
    })
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.temat.trim()) {
      nextErrors.temat = "Podaj temat konsultacji"
    }
    if (formData.opis.trim().length < MIN_OPIS_LENGTH) {
      nextErrors.opis = `Opis musi mieć minimum ${MIN_OPIS_LENGTH} znaków (obecnie ${formData.opis.trim().length})`
    }
    if (!formData.imieNazwisko.trim()) {
      nextErrors.imieNazwisko = "Podaj imię i nazwisko"
    }
    if (!formData.telefonKontakt.trim()) {
      nextErrors.telefonKontakt = "Podaj numer telefonu"
    }
    if (formData.terminOd && formData.terminDo && formData.terminOd > formData.terminDo) {
      nextErrors.terminDo = "Data końcowa nie może być wcześniejsza niż początkowa"
    }
    if (!formData.akceptujeKlauzule) {
      nextErrors.akceptujeKlauzule = "Musisz zaakceptować regulamin i politykę prywatności"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error("Popraw zaznaczone pola formularza")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/consultation-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId || null,
          preferowanyCzas: formData.preferowanyCzas ? Number(formData.preferowanyCzas) : null,
          budzetDo: formData.budzetDo ? Number(formData.budzetDo) : null,
          terminOd: formData.terminOd || null,
          terminDo: formData.terminDo || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Nie udało się wysłać zapytania")
      }

      setCreatedId(data.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
    } finally {
      setIsSubmitting(false)
    }
  }

  const opisLength = formData.opis.trim().length

  return (
    <div className="relative space-y-8">
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <PageHeader
        title="Zapytaj o konsultację online"
        subtitle="Opisz swoją sprawę. Zapytanie zobaczą wszyscy pasujący eksperci i zaproponują termin oraz cenę płatnej konsultacji wideo lub telefonicznej."
      />

      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        <Card variant="glass">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="temat">Temat konsultacji *</Label>
              <Input
                id="temat"
                value={formData.temat}
                onChange={(e) => updateField("temat", e.target.value)}
                placeholder="np. Rozwiązanie umowy o pracę bez wypowiedzenia"
                maxLength={150}
              />
              {errors.temat && <p className="text-sm text-red-400">{errors.temat}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="opis">Opis sprawy *</Label>
              <Textarea
                id="opis"
                value={formData.opis}
                onChange={(e) => updateField("opis", e.target.value)}
                placeholder="Opisz swoją sytuację: co się wydarzyło, czego dotyczy problem i na jakie pytania chcesz uzyskać odpowiedź podczas konsultacji."
                rows={8}
              />
              <div className="flex items-center justify-between text-xs">
                <span className={opisLength < MIN_OPIS_LENGTH ? "text-zinc-500" : "text-emerald-400"}>
                  {opisLength} / {MIN_OPIS_LENGTH} znaków minimum
                </span>
              </div>
              {errors.opis && <p className="text-sm text-red-400">{errors.opis}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Dziedzina prawa</Label>
              <Select
                value={formData.categoryId || "none"}
                onValueChange={(value) => updateField("categoryId", value === "none" ? "" : value)}
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Wybierz dziedzinę (opcjonalnie)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nie wiem / dowolna</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nazwa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500">
                Bez wskazanej dziedziny zapytanie trafi do wszystkich aktywnych ekspertów.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-3">
              <Label>Forma konsultacji</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {([
                  { value: "VIDEO", label: "Wideokonferencja", icon: Video },
                  { value: "TELEFON", label: "Rozmowa telefoniczna", icon: Phone },
                  { value: "DOWOLNA", label: "Dowolna", icon: CheckCircle2 },
                ] as const).map((option) => {
                  const Icon = option.icon
                  const isActive = formData.forma === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("forma", option.value)}
                      className={`flex items-center gap-2.5 rounded-lg border p-3.5 text-sm transition-all ${
                        isActive
                          ? "border-primary/40 bg-primary/10 text-white"
                          : "border-border/10 bg-zinc-950/20 text-zinc-400 hover:border-primary/20"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="preferowanyCzas">Preferowany czas trwania</Label>
                <Select
                  value={formData.preferowanyCzas || "any"}
                  onValueChange={(value) => updateField("preferowanyCzas", value === "any" ? "" : value)}
                >
                  <SelectTrigger id="preferowanyCzas">
                    <SelectValue placeholder="Dowolny" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Dowolny</SelectItem>
                    <SelectItem value="15">15 minut</SelectItem>
                    <SelectItem value="30">30 minut</SelectItem>
                    <SelectItem value="60">60 minut</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budzetDo">Budżet do (PLN)</Label>
                <Input
                  id="budzetDo"
                  type="number"
                  min="0"
                  step="10"
                  value={formData.budzetDo}
                  onChange={(e) => updateField("budzetDo", e.target.value)}
                  placeholder="np. 300"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="terminOd">Dostępny od</Label>
                <DatePicker
                  id="terminOd"
                  value={formData.terminOd}
                  onChange={(value) => updateField("terminOd", value)}
                  minDate={new Date()}
                  placeholder="Wybierz datę"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terminDo">Dostępny do</Label>
                <DatePicker
                  id="terminDo"
                  value={formData.terminDo}
                  onChange={(value) => updateField("terminDo", value)}
                  minDate={new Date()}
                  placeholder="Wybierz datę"
                />
                {errors.terminDo && <p className="text-sm text-red-400">{errors.terminDo}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferowanyTermin">Preferowane godziny</Label>
              <Input
                id="preferowanyTermin"
                value={formData.preferowanyTermin}
                onChange={(e) => updateField("preferowanyTermin", e.target.value)}
                placeholder="np. popołudniami po 16:00, najlepiej wtorek lub czwartek"
                maxLength={200}
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="imieNazwisko">Imię i nazwisko *</Label>
                <Input
                  id="imieNazwisko"
                  value={formData.imieNazwisko}
                  onChange={(e) => updateField("imieNazwisko", e.target.value)}
                />
                {errors.imieNazwisko && <p className="text-sm text-red-400">{errors.imieNazwisko}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonKontakt">Telefon kontaktowy *</Label>
                <Input
                  id="telefonKontakt"
                  value={formData.telefonKontakt}
                  onChange={(e) => updateField("telefonKontakt", e.target.value)}
                  placeholder="+48 600 000 000"
                />
                {errors.telefonKontakt && <p className="text-sm text-red-400">{errors.telefonKontakt}</p>}
                <p className="text-xs text-zinc-500">
                  Numer zobaczy wyłącznie ekspert, którego zgłoszenie przyjmiesz.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="akceptujeKlauzule"
                checked={formData.akceptujeKlauzule}
                onCheckedChange={(checked) => updateField("akceptujeKlauzule", checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="akceptujeKlauzule" className="font-normal leading-relaxed">
                  Akceptuję regulamin serwisu i politykę prywatności oraz zgadzam się na kontakt ze strony
                  ekspertów w sprawie tej konsultacji. *
                </Label>
                {errors.akceptujeKlauzule && (
                  <p className="text-sm text-red-400">{errors.akceptujeKlauzule}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/panel-klienta/konsultacje/zapytania">Anuluj</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Wyślij zapytanie do ekspertów
          </Button>
        </div>
      </form>

      <Dialog open={Boolean(createdId)} onOpenChange={(open) => !open && setCreatedId(null)}>
        <DialogContent className="p-6 text-center sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <DialogTitle className="font-playfair">Zapytanie wysłane</DialogTitle>
            <DialogDescription>
              Twoje zapytanie trafiło do ekspertów. Gdy ktoś zgłosi zainteresowanie, otrzymasz powiadomienie
              wraz z proponowanym terminem i ceną.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full"
              onClick={() => router.push(`/panel-klienta/konsultacje/zapytania/${createdId}`)}
            >
              Zobacz zapytanie
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/panel-klienta/konsultacje/zapytania")}
            >
              Wróć do listy zapytań
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
