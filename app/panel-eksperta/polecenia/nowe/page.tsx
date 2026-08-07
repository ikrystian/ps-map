"use client"

import {
  CategoryPicker,
  type CaseTypeValue,
  type CategoryOption,
} from "@/components/sprawy/CategoryPicker"
import { CityCombobox } from "@/components/sprawy/CityCombobox"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { REFERRAL_TTL_DAYS } from "@/lib/case-referrals"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Building2, Copy, Landmark, Loader2, Mail, Send, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const CASE_TYPE_OPTIONS: { value: CaseTypeValue; label: string; description: string; icon: typeof User }[] = [
  {
    value: "OSOBA_PRYWATNA",
    label: "Osoba prywatna",
    description: "Sprawa klienta indywidualnego",
    icon: User,
  },
  { value: "FIRMA", label: "Firma", description: "Sprawa działalności lub spółki", icon: Building2 },
  {
    value: "ORGANIZACJA",
    label: "Organizacja",
    description: "Fundacja, stowarzyszenie, instytucja",
    icon: Landmark,
  },
]

const MAX_WIADOMOSC_LENGTH = 500

interface FormState {
  typSprawy: CaseTypeValue
  categoryIds: string[]
  cityId: string
  cityName: string
  email: string
  nazwaSprawy: string
  wiadomosc: string
}

const INITIAL_FORM: FormState = {
  typSprawy: "",
  categoryIds: [],
  cityId: "",
  cityName: "",
  email: "",
  nazwaSprawy: "",
  wiadomosc: "",
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function NewReferralPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdLink, setCreatedLink] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) setCategories(await response.json())
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  // Walidacja lustrzana wobec POST /api/case-referrals
  const validate = (): boolean => {
    const next: Record<string, string> = {}

    if (!form.typSprawy) next.typSprawy = "Wybierz typ sprawy"
    if (form.categoryIds.length === 0) next.categoryIds = "Wybierz przynajmniej jedną kategorię"
    if (!form.cityId) next.cityId = "Wybierz miasto"
    if (!EMAIL_REGEX.test(form.email.trim())) next.email = "Podaj poprawny adres e-mail klienta"
    if (form.wiadomosc.length > MAX_WIADOMOSC_LENGTH) {
      next.wiadomosc = `Wiadomość może mieć maksymalnie ${MAX_WIADOMOSC_LENGTH} znaków`
    }

    setErrors(next)
    if (Object.keys(next).length > 0) {
      toast.error(Object.values(next)[0])
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/case-referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          typSprawy: form.typSprawy,
          categoryIds: form.categoryIds,
          cityId: form.cityId,
          nazwaSprawy: form.nazwaSprawy.trim() || undefined,
          wiadomosc: form.wiadomosc.trim() || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Nie udało się wysłać polecenia")

      setCreatedLink(data.link)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = async () => {
    if (!createdLink) return
    try {
      await navigator.clipboard.writeText(createdLink)
      toast.success("Link skopiowany do schowka")
    } catch {
      toast.error("Nie udało się skopiować linku")
    }
  }

  return (
    <div className="relative space-y-8">
      <div className="absolute left-1/4 top-0 pointer-events-none h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />

      <PageHeader
        title="Poleć sprawę"
        subtitle="Wybierz zakres i lokalizację sprawy, a my wyślemy klientowi link do założenia konta i dokończenia zgłoszenia."
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 space-y-6"
      >
        {/* 1. Typ sprawy */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="font-playfair text-lg">1. Typ sprawy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CASE_TYPE_OPTIONS.map((option) => {
                const isSelected = form.typSprawy === option.value
                const OptionIcon = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      updateField("typSprawy", option.value)
                      // Kategorie są rozdzielone na prywatne / firmowe – zmiana typu je unieważnia
                      updateField("categoryIds", [])
                    }}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                        : errors.typSprawy
                          ? "border-destructive/60 bg-background-sec/10 hover:border-destructive"
                          : "border-border/30 bg-background-sec/10 hover:border-border/60",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-md border transition-all",
                        isSelected
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/10 bg-background-sec text-muted-foreground",
                      )}
                    >
                      <OptionIcon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-white">{option.label}</span>
                    <span className="text-xs font-light text-zinc-400">{option.description}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 2. Kategorie i lokalizacja */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="font-playfair text-lg">2. Zakres i lokalizacja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {!form.typSprawy ? (
              <p className="rounded-lg border border-dashed border-border/40 px-4 py-6 text-center text-sm font-light text-zinc-400">
                Najpierw wybierz typ sprawy — od niego zależy lista dostępnych kategorii.
              </p>
            ) : (
              <div>
                <Label className="mb-2 block text-xs font-semibold text-muted-foreground">
                  Kategorie sprawy * (możesz wybrać więcej niż jedną)
                </Label>
                <CategoryPicker
                  categories={categories}
                  isLoadingCategories={isLoadingCategories}
                  typSprawy={form.typSprawy}
                  value={form.categoryIds}
                  onChange={(categoryIds) => updateField("categoryIds", categoryIds)}
                  hasError={!!errors.categoryIds}
                />
                {errors.categoryIds && (
                  <p className="mt-2 text-xs font-medium text-destructive">{errors.categoryIds}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label
                className={cn(
                  "text-xs font-semibold text-muted-foreground",
                  errors.cityId && "text-destructive",
                )}
              >
                Miasto *
              </Label>
              <CityCombobox
                value={form.cityId}
                cityName={form.cityName}
                hasError={!!errors.cityId}
                onSelect={(city) => {
                  setForm((prev) => ({ ...prev, cityId: city.id, cityName: city.nazwa }))
                  setErrors((prev) => {
                    const next = { ...prev }
                    delete next.cityId
                    return next
                  })
                }}
              />
              {errors.cityId && (
                <p className="mt-1 text-xs font-medium text-destructive">{errors.cityId}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Adresat */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="font-playfair text-lg">3. Adresat polecenia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={cn(
                  "text-xs font-semibold text-muted-foreground",
                  errors.email && "text-destructive",
                )}
              >
                Adres e-mail klienta *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="klient@example.com"
                  className={cn("pl-9", errors.email && "border-destructive")}
                />
              </div>
              <p className="text-xs font-light text-zinc-500">
                Link będzie ważny {REFERRAL_TTL_DAYS} dni i zadziała tylko dla tego adresu.
              </p>
              {errors.email && (
                <p className="text-xs font-medium text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nazwaSprawy" className="text-xs font-semibold text-muted-foreground">
                Proponowana nazwa sprawy (opcjonalnie)
              </Label>
              <Input
                id="nazwaSprawy"
                value={form.nazwaSprawy}
                onChange={(e) => updateField("nazwaSprawy", e.target.value)}
                placeholder="np. Rozwód bez orzekania o winie"
              />
              <p className="text-xs font-light text-zinc-500">
                Podpowiedź dla klienta — będzie mógł ją zmienić przy dodawaniu sprawy.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="wiadomosc"
                className={cn(
                  "text-xs font-semibold text-muted-foreground",
                  errors.wiadomosc && "text-destructive",
                )}
              >
                Wiadomość do klienta (opcjonalnie)
              </Label>
              <Textarea
                id="wiadomosc"
                value={form.wiadomosc}
                onChange={(e) => updateField("wiadomosc", e.target.value)}
                rows={4}
                placeholder="Dzień dobry, zgodnie z naszą rozmową przesyłam link do zgłoszenia sprawy..."
                className={cn(errors.wiadomosc && "border-destructive")}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs font-light text-zinc-500">
                  Trafi do treści e-maila i na stronę z linkiem.
                </p>
                <span
                  className={cn(
                    "text-xs",
                    form.wiadomosc.length > MAX_WIADOMOSC_LENGTH
                      ? "text-destructive"
                      : "text-zinc-500",
                  )}
                >
                  {form.wiadomosc.length}/{MAX_WIADOMOSC_LENGTH}
                </span>
              </div>
              {errors.wiadomosc && (
                <p className="text-xs font-medium text-destructive">{errors.wiadomosc}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild>
            <Link href="/panel-eksperta/polecenia">Anuluj</Link>
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Wyślij polecenie
          </Button>
        </div>
      </motion.div>

      <Dialog open={!!createdLink} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Polecenie wysłane</DialogTitle>
            <DialogDescription>
              Wiadomość z linkiem poszła na <strong>{form.email}</strong>. Możesz też przekazać link
              samodzielnie — zadziała tylko dla tego adresu i wygaśnie po {REFERRAL_TTL_DAYS} dniach.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-zinc-950/40 p-3">
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-300">
              {createdLink}
            </span>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreatedLink(null)
                setForm(INITIAL_FORM)
                setErrors({})
              }}
            >
              Poleć kolejną sprawę
            </Button>
            <Button variant="primary" onClick={() => router.push("/panel-eksperta/polecenia")}>
              Wróć do listy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
