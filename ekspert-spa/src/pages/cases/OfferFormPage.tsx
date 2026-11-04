import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Save } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { formatCurrency } from "@shared/format"
import { OFFER_HIGHLIGHT_POINTS } from "@shared/points-pricing"
import { Screen } from "@/components/Screen"
import { useToast } from "@/components/toast"
import { Button, Card, Field, PageHeader, Section, Toggle, cn } from "@/components/ui"
import { api } from "@/lib/api"
import { readDraft, removeDraft, writeDraft } from "@/lib/drafts"
import { normalizeDecimal, normalizeInteger, parseDecimal } from "@/lib/format"
import { PAYMENT_TERMS_LABEL } from "@/lib/labels"
import { useLawFirm } from "@/lib/queries"
import type { CaseDetail } from "@/lib/types"

const MIN_OFFER_DESCRIPTION = 200
const DRAFT_SAVE_DELAY = 400

const EMPTY_FORM = {
  kwotaNetto: "",
  vat: "23",
  terminRealizacjiDni: "",
  opisOferty: "",
  zakresUslug: "",
  warunkiPlatnosci: "PRZELEW_14",
  dodatkoweWarunki: "",
  wyroznienie: false,
}

type OfferForm = typeof EMPTY_FORM
type FormErrors = Partial<Record<keyof OfferForm, string>>

function validate(form: OfferForm): FormErrors {
  const errors: FormErrors = {}
  if (parseDecimal(form.kwotaNetto) <= 0) errors.kwotaNetto = "Podaj kwotę netto"
  if (!(parseInt(form.terminRealizacjiDni) >= 1)) errors.terminRealizacjiDni = "Podaj liczbę dni"
  if (form.opisOferty.trim().length < MIN_OFFER_DESCRIPTION) {
    errors.opisOferty = `Opis musi mieć minimum ${MIN_OFFER_DESCRIPTION} znaków`
  }
  if (!form.zakresUslug.trim()) errors.zakresUslug = "Opisz zakres usług"
  return errors
}

export function OfferFormPage() {
  const { id } = useParams<{ id: string }>()
  const toast = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: lawFirm } = useLawFirm()
  const { data: caseData } = useQuery({
    queryKey: ["cases", id],
    queryFn: () => api<CaseDetail>(`/api/cases/${id}`),
  })

  const draftKey = `offer:${id}`
  const [form, setForm] = useState<OfferForm>(() => ({ ...EMPTY_FORM, ...readDraft<Partial<OfferForm>>(draftKey) }))
  const [errors, setErrors] = useState<FormErrors>({})

  const update = <K extends keyof OfferForm>(field: K, value: OfferForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  useEffect(() => {
    const timer = setTimeout(() => writeDraft(draftKey, form), DRAFT_SAVE_DELAY)
    return () => clearTimeout(timer)
  }, [draftKey, form])

  const netto = parseDecimal(form.kwotaNetto)
  const vat = parseInt(form.vat)
  const brutto = vat === -1 ? netto : netto + netto * (vat / 100)
  const points = lawFirm?.punktySaldo ?? null
  const tooFewPoints = points !== null && points < OFFER_HIGHLIGHT_POINTS
  const descriptionLength = form.opisOferty.trim().length
  const descriptionProgress = Math.min(descriptionLength / MIN_OFFER_DESCRIPTION, 1)

  const submit = useMutation({
    mutationFn: () =>
      api("/api/offers", {
        method: "POST",
        body: {
          caseId: id,
          kwotaNetto: netto,
          vat,
          terminRealizacjiDni: parseInt(form.terminRealizacjiDni),
          opisOferty: form.opisOferty,
          zakresUslug: form.zakresUslug,
          warunkiPlatnosci: form.warunkiPlatnosci,
          dodatkoweWarunki: form.dodatkoweWarunki || undefined,
          wyroznienie: form.wyroznienie && !tooFewPoints,
        },
      }),
    onSuccess: () => {
      removeDraft(draftKey)
      void queryClient.invalidateQueries({ queryKey: ["offers"] })
      void queryClient.invalidateQueries({ queryKey: ["cases"] })
      void queryClient.invalidateQueries({ queryKey: ["law-firm"] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast.success("Twoja oferta została pomyślnie złożona")
      navigate("/sprawy/oferty", { replace: true })
    },
    onError: toast.error,
  })

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length === 0) {
      submit.mutate()
      return
    }
    toast.error("Uzupełnij zaznaczone pola")
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    })
  }

  return (
    <Screen
      refreshable={false}
      header={<PageHeader title="Nowa oferta" subtitle={caseData?.nazwaSprawy} back={`/sprawy/${id}`} />}
      footer={
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Razem brutto</p>
            <p className="truncate text-lg font-semibold leading-tight">{formatCurrency(brutto)}</p>
          </div>
          <Button className="shrink-0 px-6" loading={submit.isPending} onClick={() => handleSubmit()}>
            Wyślij ofertę
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Section title="Wycena">
          <Card className="space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-3">
              <Field label="Kwota netto (PLN)" error={errors.kwotaNetto}>
                {(props) => (
                  <input
                    {...props}
                    type="text"
                    inputMode="decimal"
                    enterKeyHint="next"
                    placeholder="0,00"
                    value={form.kwotaNetto}
                    onChange={(e) => update("kwotaNetto", normalizeDecimal(e.target.value))}
                  />
                )}
              </Field>
              <Field label="VAT">
                {(props) => (
                  <select {...props} value={form.vat} onChange={(e) => update("vat", e.target.value)}>
                    <option value="23">23%</option>
                    <option value="8">8%</option>
                    <option value="0">0%</option>
                    <option value="-1">zw.</option>
                  </select>
                )}
              </Field>
            </div>
          </Card>
        </Section>

        <Section title="Realizacja">
          <Card className="space-y-3">
            <Field label="Termin realizacji (dni robocze)" error={errors.terminRealizacjiDni}>
              {(props) => (
                <input
                  {...props}
                  type="text"
                  inputMode="numeric"
                  enterKeyHint="next"
                  placeholder="np. 14"
                  value={form.terminRealizacjiDni}
                  onChange={(e) => update("terminRealizacjiDni", normalizeInteger(e.target.value))}
                />
              )}
            </Field>
            <Field label="Warunki płatności">
              {(props) => (
                <select {...props} value={form.warunkiPlatnosci} onChange={(e) => update("warunkiPlatnosci", e.target.value)}>
                  {Object.entries(PAYMENT_TERMS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </Card>
        </Section>

        <Section title="Treść oferty">
          <Card className="space-y-3">
            <Field label="Opis oferty" error={errors.opisOferty}>
              {(props) => (
                <textarea
                  {...props}
                  rows={6}
                  placeholder="Opisz swoje doświadczenie w podobnych sprawach i proponowane podejście…"
                  value={form.opisOferty}
                  onChange={(e) => update("opisOferty", e.target.value)}
                />
              )}
            </Field>
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width,background-color] duration-300",
                    descriptionProgress >= 1 ? "bg-success" : "bg-primary"
                  )}
                  style={{ width: `${descriptionProgress * 100}%` }}
                />
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {descriptionLength} / {MIN_OFFER_DESCRIPTION}
              </span>
            </div>
            <Field label="Szczegółowy zakres usług" error={errors.zakresUslug}>
              {(props) => (
                <textarea
                  {...props}
                  rows={4}
                  value={form.zakresUslug}
                  onChange={(e) => update("zakresUslug", e.target.value)}
                />
              )}
            </Field>
            <Field label="Dodatkowe warunki (opcjonalnie)">
              {(props) => (
                <textarea
                  {...props}
                  rows={3}
                  value={form.dodatkoweWarunki}
                  onChange={(e) => update("dodatkoweWarunki", e.target.value)}
                />
              )}
            </Field>
          </Card>
        </Section>

        <Card className="py-1.5">
          <Toggle
            label={`Wyróżnij ofertę (${OFFER_HIGHLIGHT_POINTS} pkt)`}
            description={
              tooFewPoints
                ? `Niewystarczające saldo punktów (masz: ${points} pkt).`
                : "Oferta trafi na górę skrzynki klienta i zostanie podświetlona."
            }
            checked={form.wyroznienie && !tooFewPoints}
            disabled={tooFewPoints}
            onChange={(checked) => update("wyroznienie", checked)}
          />
        </Card>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Save className="size-3.5" aria-hidden />
          Szkic zapisuje się automatycznie na tym urządzeniu
        </p>
      </form>
    </Screen>
  )
}
