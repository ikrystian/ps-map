import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, Clock, UsersRound, Video, Wallet, type LucideIcon } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CONSULTATION_FORM_LABELS } from "@shared/consultation-requests"
import { formatCurrency, formatDate, formatDateTime } from "@shared/format"
import { Screen } from "@/components/Screen"
import { useToast } from "@/components/toast"
import { Badge, Button, Card, Chips, ErrorState, Field, ListSkeleton, PageHeader, Section } from "@/components/ui"
import { api } from "@/lib/api"
import { normalizeDecimal, parseDecimal } from "@/lib/format"
import { INTEREST_STATUS_LABEL } from "@/lib/labels"
import { useLawFirm } from "@/lib/queries"
import type { ConsultationRequest } from "@/lib/types"

const MIN_MESSAGE_LENGTH = 100

interface Availability {
  price15min?: number | null
  price30min?: number | null
}

/** Wartość dla `min` pola datetime-local: teraz, w lokalnej strefie urządzenia. */
function localNow() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16)
}

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: request, error, refetch } = useQuery({
    queryKey: ["consultation-requests", id],
    queryFn: () => api<ConsultationRequest>(`/api/consultation-requests/${id}`),
  })

  if (!request) {
    return (
      <Screen header={<PageHeader title="Zapytanie" back="/konsultacje/zapytania" />}>
        {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : <ListSkeleton rows={2} label="Wczytywanie zapytania…" />}
      </Screen>
    )
  }

  const ownInterest = request.interests[0]
  const details = (
    <>
      <div className="space-y-1.5 px-1 pt-1">
        {request.category && <Badge tone="primary">{request.category.nazwa}</Badge>}
        <h2 className="font-serif text-[22px] font-semibold leading-tight">{request.temat}</h2>
      </div>

      <Card>
        <p className="whitespace-pre-line text-sm leading-relaxed">{request.opis}</p>
      </Card>

      <Card flush className="grid grid-cols-2 gap-px overflow-hidden bg-border/70">
        <Detail icon={Video} label="Forma" value={CONSULTATION_FORM_LABELS[request.forma] ?? request.forma} />
        <Detail icon={Wallet} label="Budżet" value={request.budzetDo ? `do ${formatCurrency(request.budzetDo)}` : "Nie określono"} />
        <Detail icon={Clock} label="Czas" value={request.preferowanyCzas ? `${request.preferowanyCzas} min` : "Dowolny"} />
        <Detail icon={UsersRound} label="Zgłoszenia ekspertów" value={String(request.liczbaZgloszen)} />
        {request.preferowanyTermin && <Detail icon={CalendarDays} label="Preferowany termin" value={request.preferowanyTermin} wide />}
        {request.terminOd && (
          <Detail
            icon={CalendarDays}
            label="Termin"
            value={`${formatDate(request.terminOd)}${request.terminDo ? ` – ${formatDate(request.terminDo)}` : ""}`}
            wide
          />
        )}
      </Card>
    </>
  )

  if (ownInterest) {
    return (
      <Screen header={<PageHeader title="Zapytanie" back="/konsultacje/zapytania" />}>
        {details}
        <Section title="Twoje zgłoszenie">
          <Card className="space-y-2 text-sm">
            <Badge tone="primary">{INTEREST_STATUS_LABEL[ownInterest.status] ?? ownInterest.status}</Badge>
            <p className="font-medium">
              {formatDateTime(ownInterest.proponowanyTermin)} · {ownInterest.duration} min · {formatCurrency(ownInterest.cena)}
            </p>
            <p className="whitespace-pre-line text-muted-foreground">{ownInterest.wiadomosc}</p>
          </Card>
        </Section>
      </Screen>
    )
  }

  return <InterestForm request={request} details={details} />
}

function Detail({ icon: Icon, label, value, wide }: { icon: LucideIcon; label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2 bg-card px-4 py-3" : "bg-card px-4 py-3"}>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  )
}

function InterestForm({ request, details }: { request: ConsultationRequest; details: React.ReactNode }) {
  const toast = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: lawFirm } = useLawFirm()
  const { data: availability } = useQuery({
    queryKey: ["availability", lawFirm?.id],
    queryFn: () => api<Availability[]>(`/api/law-firms/${lawFirm!.id}/consultation-availability`),
    enabled: !!lawFirm,
  })

  const [form, setForm] = useState({
    proponowanyTermin: "",
    alternatywnyTermin: "",
    duration: request.preferowanyCzas ? String(request.preferowanyCzas) : "30",
    cena: "",
    forma: request.forma === "TELEFON" ? "TELEFON" : "VIDEO",
    wiadomosc: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  // Podpowiedź ceny z cennika konsultacji eksperta
  useEffect(() => {
    const pricing = availability?.[0]
    if (!pricing) return
    setForm((prev) => {
      if (prev.cena) return prev
      const price = prev.duration === "15" ? pricing.price15min : pricing.price30min
      return price ? { ...prev, cena: normalizeDecimal(String(price)) } : prev
    })
  }, [availability])

  const submit = useMutation({
    mutationFn: () =>
      api("/api/consultation-interests", {
        method: "POST",
        body: {
          requestId: request.id,
          proponowanyTermin: new Date(form.proponowanyTermin).toISOString(),
          alternatywnyTermin: form.alternatywnyTermin ? new Date(form.alternatywnyTermin).toISOString() : null,
          duration: Number(form.duration),
          cena: parseDecimal(form.cena),
          forma: form.forma,
          wiadomosc: form.wiadomosc,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["consultation-requests"] })
      toast.success("Zgłoszenie wysłane. Klient otrzymał powiadomienie.")
      navigate("/konsultacje/zapytania", { replace: true })
    },
    onError: toast.error,
  })

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    const next: Record<string, string> = {}
    if (!form.proponowanyTermin) next.proponowanyTermin = "Wybierz proponowany termin"
    else if (new Date(form.proponowanyTermin).getTime() <= Date.now()) next.proponowanyTermin = "Termin musi być w przyszłości"
    if (form.alternatywnyTermin && new Date(form.alternatywnyTermin).getTime() <= Date.now()) {
      next.alternatywnyTermin = "Termin alternatywny musi być w przyszłości"
    }
    if (parseDecimal(form.cena) <= 0) next.cena = "Podaj cenę konsultacji"
    if (form.wiadomosc.trim().length < MIN_MESSAGE_LENGTH) {
      next.wiadomosc = `Wiadomość musi mieć minimum ${MIN_MESSAGE_LENGTH} znaków (obecnie ${form.wiadomosc.trim().length})`
    }
    setErrors(next)
    if (Object.keys(next).length === 0) {
      submit.mutate()
      return
    }
    requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
  }

  const minDate = localNow()

  return (
    <Screen
      refreshable={false}
      header={<PageHeader title="Zapytanie" back="/konsultacje/zapytania" />}
      footer={
        <Button className="w-full" loading={submit.isPending} onClick={() => handleSubmit()}>
          Wyślij zgłoszenie
        </Button>
      }
    >
      {details}
      <Section title="Zgłoś zainteresowanie">
        <Card>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Proponowany termin" error={errors.proponowanyTermin}>
              {(props) => (
                <input
                  {...props}
                  type="datetime-local"
                  min={minDate}
                  value={form.proponowanyTermin}
                  onChange={(e) => update("proponowanyTermin", e.target.value)}
                />
              )}
            </Field>
            <Field label="Termin alternatywny (opcjonalnie)" error={errors.alternatywnyTermin}>
              {(props) => (
                <input
                  {...props}
                  type="datetime-local"
                  min={minDate}
                  value={form.alternatywnyTermin}
                  onChange={(e) => update("alternatywnyTermin", e.target.value)}
                />
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Czas trwania">
                {(props) => (
                  <select {...props} value={form.duration} onChange={(e) => update("duration", e.target.value)}>
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="60">60 min</option>
                  </select>
                )}
              </Field>
              <Field label="Cena (PLN)" error={errors.cena}>
                {(props) => (
                  <input
                    {...props}
                    type="text"
                    inputMode="decimal"
                    value={form.cena}
                    onChange={(e) => update("cena", normalizeDecimal(e.target.value))}
                  />
                )}
              </Field>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Forma</p>
              <Chips
                wrap
                label="Forma"
                value={form.forma}
                onChange={(value) => update("forma", value)}
                options={[
                  { value: "VIDEO", label: "Wideo" },
                  { value: "TELEFON", label: "Telefon" },
                ]}
              />
            </div>
            <Field
              label="Wiadomość do klienta"
              error={errors.wiadomosc}
              hint={`${form.wiadomosc.trim().length} / min. ${MIN_MESSAGE_LENGTH} znaków`}
            >
              {(props) => (
                <textarea {...props} rows={5} value={form.wiadomosc} onChange={(e) => update("wiadomosc", e.target.value)} />
              )}
            </Field>
          </form>
        </Card>
      </Section>
    </Screen>
  )
}
