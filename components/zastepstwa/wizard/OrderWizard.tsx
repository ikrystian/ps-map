"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/sonner"
import {
  ApiError,
  PANEL,
  apiFetch,
  errorMessage,
  notifySubstitutionsChanged,
  patchJson,
  postJson,
} from "@/lib/substitutions/client"
import {
  CZYNNOSCI,
  DZIEDZINY,
  FILE_RETENTION_DAYS,
  KTORY_TERMIN,
  MAX_TITLE_LENGTH,
  OFERTY_DO,
  ROLE_ZASTEPCY,
  URGENT_POINTS,
  type OfertyDoKey,
} from "@/lib/substitutions/constants"
import { warsawDay } from "@/lib/substitutions/time"
import type { FileDTO, OwnerOrderDTO, TrustedSubstituteDTO } from "@/lib/substitutions/types"
import { cn } from "@/lib/utils"
import { ArrowLeft, Check, Lock, Loader2, Send, TriangleAlert, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useSubstitutionAccess } from "../access-context"
import { FileDropzone, OrderFiles } from "../Files"
import { InfoBox, LoadingState, Panel, ToggleChip } from "../ui"
import { EMPTY_FORM, STEPS, fromOrder, isUnder24h, stepErrors, toPayload, type WizardForm } from "./form"
import { PlaceField } from "./PlaceField"
import { WizardPreview } from "./WizardPreview"
import { WizardSuccess, type PublishResult } from "./WizardSuccess"
import { WizardSummary } from "./WizardSummary"

const EDITABLE_AFTER_PUBLISH = ["OPUBLIKOWANE", "ZAPYTANIE"]

function FormSection({ title, number, icon, children }: { title: string; number?: number; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-t border-border/30 pt-5 first:border-t-0 first:pt-0 [&+&]:mt-6">
      <h3 className="mb-3.5 flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-foreground/80">
        {number && <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-primary/15 text-[11.5px] text-primary">{number}</span>}
        {icon}
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({ label, htmlFor, required, children, hint }: { label: string; htmlFor?: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-[12.5px] font-semibold text-foreground/80">
        {label} {required && <span className="text-error">*</span>}
      </Label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function ChoiceCard({
  checked,
  onSelect,
  title,
  text,
  disabled,
  children,
}: {
  checked: boolean
  onSelect: () => void
  title: string
  text: string
  disabled?: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      role="radio"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect()}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !disabled && onSelect()}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
        checked ? "border-primary bg-primary/10" : "border-border/60 bg-background/30 hover:border-muted-foreground",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className={cn("mt-1 grid h-4 w-4 flex-none place-items-center rounded-full border", checked ? "border-primary" : "border-muted-foreground/60")}>
        {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      <div className="min-w-0 flex-1">
        <b className="block text-[13.5px]">{title}</b>
        <span className="text-[12.5px] text-muted-foreground">{text}</span>
        {children && <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>{children}</div>}
      </div>
    </div>
  )
}

function ToggleRow({ title, text, checked, onChange, disabled, badge }: { title: string; text: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; badge?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3.5 border-b border-border/30 py-3 last:border-b-0">
      <div>
        <b className="flex items-center gap-2 text-[13.5px]">
          {title}
          {badge}
        </b>
        <span className="text-[12.5px] text-muted-foreground">{text}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}

/** Kreator „Nowe zlecenie zastępstwa” (także wznowienie szkicu i edycja opublikowanego zlecenia). */
export function OrderWizard() {
  const { access, refresh } = useSubstitutionAccess()
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkedId = searchParams.get("zlecenie")
  const createdId = useRef<string | null>(null)

  const [orderId, setOrderId] = useState<string | null>(linkedId)
  const [status, setStatus] = useState<string | null>(null)
  const [numer, setNumer] = useState<string | null>(null)
  const [form, setForm] = useState<WizardForm>(EMPTY_FORM)
  const [files, setFiles] = useState<FileDTO[]>([])
  const [step, setStep] = useState(1)
  const [maxStep, setMaxStep] = useState(1)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(!!linkedId)
  const [saving, setSaving] = useState<"draft" | "next" | "publish" | null>(null)
  const [statement, setStatement] = useState(false)
  const [trusted, setTrusted] = useState<TrustedSubstituteDTO[]>([])
  const [done, setDone] = useState<PublishResult | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const editing = !!status && status !== "SZKIC"

  // Wznowienie szkicu albo edycja — ale nie przeładowujemy szkicu, który właśnie sami założyliśmy
  useEffect(() => {
    if (!linkedId || linkedId === createdId.current) return
    const load = async () => {
      try {
        const view = await apiFetch<{ widok: string; zlecenie: OwnerOrderDTO }>(`/api/substitutions/${linkedId}`)
        const order = view.zlecenie
        if (view.widok !== "owner") throw new Error("To nie jest Twoje zlecenie")
        if (order.status !== "SZKIC" && !EDITABLE_AFTER_PUBLISH.includes(order.status)) {
          router.replace(`${PANEL}/moje/${order.id}`)
          return
        }
        setOrderId(order.id)
        setStatus(order.status)
        setNumer(order.numer)
        setForm(fromOrder(order))
        setFiles(order.pliki)
        if (order.status !== "SZKIC") setMaxStep(5)
      } catch (e) {
        toast.error(errorMessage(e))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [linkedId, router])

  useEffect(() => {
    const load = async () => {
      try {
        setTrusted((await apiFetch<{ zaufani: TrustedSubstituteDTO[] }>("/api/substitutions/trusted")).zaufani)
      } catch {
        setTrusted([])
      }
    }
    load()
  }, [])

  const update = (patch: Partial<WizardForm>) => setForm((current) => ({ ...current, ...patch }))

  /** Zapis szkicu (POST przy pierwszym razie, potem PATCH). Zwraca id zlecenia. */
  const save = async (): Promise<string> => {
    const payload = toPayload(form, { includePrivate: !editing })
    if (orderId) {
      await patchJson(`/api/substitutions/${orderId}`, payload)
      return orderId
    }
    const created = await postJson<{ id: string }>("/api/substitutions", payload)
    createdId.current = created.id
    setOrderId(created.id)
    setStatus("SZKIC")
    router.replace(`${PANEL}/dodaj?zlecenie=${created.id}`, { scroll: false })
    return created.id
  }

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

  const goTo = async (target: number) => {
    let next = target
    if (target > step) {
      for (let i = step; i < target; i++) {
        const errs = stepErrors(i, form)
        if (errs.length) {
          setErrors(errs)
          next = i
          break
        }
      }
    }
    if (next === step && target > step) return
    setErrors([])
    if (next > step && !editing) {
      setSaving("next")
      try {
        await save()
        toast.success("Szkic zapisany automatycznie.")
      } catch (e) {
        toast.error(errorMessage(e))
        setSaving(null)
        return
      }
      setSaving(null)
    }
    setStep(next)
    setMaxStep((m) => Math.max(m, next))
    scrollTop()
  }

  const saveDraft = async () => {
    setSaving("draft")
    try {
      await save()
      toast.success(editing ? "Zmiany zapisane." : "Szkic zapisany. Wrócisz do niego w „Moich zleceniach”.")
      notifySubstitutionsChanged()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setSaving(null)
    }
  }

  const publish = async () => {
    for (let i = 1; i <= 3; i++) {
      const errs = stepErrors(i, form)
      if (errs.length) {
        setErrors(errs)
        setStep(i)
        scrollTop()
        return
      }
    }
    if (!statement) {
      setErrors(["potwierdzenie pod podsumowaniem"])
      return
    }
    setErrors([])
    setSaving("publish")
    try {
      const id = await save()
      if (editing) {
        toast.success("Zmiany zapisane. Zgłoszeni prawnicy dostali informację.")
        notifySubstitutionsChanged()
        router.push(`${PANEL}/moje/${id}`)
        return
      }
      const result = await postJson<PublishResult>(`/api/substitutions/${id}/publish`, { oswiadczenie: true })
      toast.success(result.message)
      setDone(result)
      notifySubstitutionsChanged()
      await refresh()
      scrollTop()
    } catch (e) {
      if (e instanceof ApiError && Array.isArray(e.details) && e.details.length > 0) {
        const issues = e.details as { krok: number; pole: string }[]
        setStep(issues[0].krok)
        setErrors(issues.map((i) => i.pole))
        scrollTop()
      } else {
        toast.error(errorMessage(e))
      }
    } finally {
      setSaving(null)
    }
  }

  const startOver = () => {
    createdId.current = null
    setDone(null)
    setOrderId(null)
    setStatus(null)
    setNumer(null)
    setForm(EMPTY_FORM)
    setFiles([])
    setStep(1)
    setMaxStep(1)
    setStatement(false)
    setErrors([])
    router.replace(`${PANEL}/dodaj`)
  }

  if (!access.mozeZlecac) {
    return (
      <Panel className="mx-auto mt-6 max-w-xl text-center">
        <h1 className="font-playfair text-xl font-semibold">Nowe zlecenie zastępstwa</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Zlecenia dodają adwokaci i radcowie prawni. Jako aplikant możesz przyjmować zastępstwa na upoważnienie.
        </p>
        <Button asChild className="mt-4">
          <Link href={PANEL}>Przejdź do giełdy</Link>
        </Button>
      </Panel>
    )
  }
  if (loading) return <LoadingState text="Wczytywanie zlecenia..." />
  if (done && orderId) {
    return (
      <div ref={topRef}>
        <WizardSuccess
          result={done}
          askedName={trusted.find((t) => t.id === form.zapytanieDoId)?.nazwa ?? null}
          firstComes={form.trybWyboru === "PIERWSZY"}
          onNew={startOver}
          onOpen={() => router.push(`${PANEL}/moje/${orderId}`)}
        />
      </div>
    )
  }

  const today = warsawDay(new Date())
  const lastStep = step === STEPS.length
  const directDisabled = trusted.length === 0

  return (
    <div ref={topRef} className="relative scroll-mt-4 space-y-6">
      <PageHeader
        title={editing ? `Edytuj zlecenie ${numer ?? ""}` : "Nowe zlecenie zastępstwa"}
        subtitle="Opisz czynność. Dane poufne zobaczy tylko wybrany zastępca"
      >
        <Button asChild variant="outline">
          <Link href={editing && orderId ? `${PANEL}/moje/${orderId}` : `${PANEL}/moje`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {editing ? "Szczegóły zlecenia" : "Moje zlecenia"}
          </Link>
        </Button>
      </PageHeader>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <Panel>
          {/* Kroki */}
          <div className="mb-6">
            <ol className="hidden grid-cols-5 gap-2.5 md:grid">
              {STEPS.map((name, index) => {
                const n = index + 1
                const state = n === step ? "akt" : n <= maxStep ? "ok" : ""
                return (
                  <li key={name}>
                    <button
                      type="button"
                      disabled={n > maxStep || !!saving}
                      onClick={() => goTo(n)}
                      className={cn(
                        "flex w-full items-center gap-2 border-t-[3px] pt-2.5 text-left text-[13px] font-semibold",
                        state === "akt" && "border-primary text-foreground",
                        state === "ok" && "border-primary text-foreground/80 hover:text-foreground",
                        state === "" && "cursor-default border-border text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-6 w-6 flex-none place-items-center rounded-full border-2 text-[11.5px] font-bold",
                          state === "akt" && "border-primary text-primary",
                          state === "ok" && "border-primary bg-primary text-primary-foreground",
                          state === "" && "border-border"
                        )}
                      >
                        {state === "ok" ? <Check className="h-3 w-3" /> : n}
                      </span>
                      {name}
                    </button>
                  </li>
                )
              })}
            </ol>
            <div className="md:hidden">
              <div className="mb-2 text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground">
                Krok <b className="text-primary">{step}</b> z {STEPS.length} · {STEPS[step - 1]}
              </div>
              <div className="h-1 overflow-hidden rounded bg-border">
                <div className="h-full bg-primary transition-all" style={{ width: `${(step / STEPS.length) * 100}%` }} />
              </div>
            </div>
          </div>

          {editing && (
            <InfoBox className="mb-5">
              Zlecenie jest opublikowane. Zmiany zobaczą zgłoszeni prawnicy — dostaną też powiadomienie. „Pilne” i zapytanie do
              konkretnej osoby ustawia się tylko przed publikacją.
            </InfoBox>
          )}

          {step === 1 && (
            <>
              <FormSection title="Czynność">
                <div className="grid gap-3.5">
                  <Field label="Krótki tytuł" htmlFor="d-tytul" required>
                    <Input
                      id="d-tytul"
                      maxLength={MAX_TITLE_LENGTH}
                      placeholder="Np. Rozprawa o zapłatę, pierwszy termin"
                      value={form.tytul}
                      onChange={(e) => update({ tytul: e.target.value })}
                    />
                  </Field>
                  <div>
                    <span className="mb-1.5 block text-[12.5px] font-semibold text-foreground/80">
                      Rodzaj czynności <span className="text-error">*</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {CZYNNOSCI.map((c) => (
                        <ToggleChip key={c.value} active={form.czynnosc === c.value} onClick={() => update({ czynnosc: c.value })}>
                          {c.label}
                        </ToggleChip>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3.5 md:grid-cols-3">
                    <Field label="Dziedzina">
                      <Select value={form.dziedzina} onValueChange={(v) => update({ dziedzina: v as WizardForm["dziedzina"] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DZIEDZINY.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Zastępca występuje jako">
                      <Select value={form.rolaZastepcy} onValueChange={(v) => update({ rolaZastepcy: v as WizardForm["rolaZastepcy"] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_ZASTEPCY.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Który termin">
                      <Select value={form.ktoryTermin} onValueChange={(v) => update({ ktoryTermin: v as WizardForm["ktoryTermin"] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {KTORY_TERMIN.map((k) => (
                            <SelectItem key={k.value} value={k.value}>
                              {k.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>
              </FormSection>
              <FormSection title="Opis dla wszystkich">
                <Textarea
                  rows={3}
                  maxLength={2000}
                  placeholder="Czego dotyczy sprawa i czego oczekujesz od zastępcy. Bez nazwisk stron i sygnatury."
                  value={form.opis}
                  onChange={(e) => update({ opis: e.target.value })}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Ten opis widzą wszyscy, którym pokażemy zlecenie. Dane, które mogą ujawnić klienta, wpiszesz w kroku 4.
                </p>
              </FormSection>
            </>
          )}

          {step === 2 && (
            <>
              <FormSection title="Miejsce">
                <PlaceField form={form} update={update} />
              </FormSection>
              <FormSection title="Termin">
                <div className="grid gap-3.5 md:grid-cols-3">
                  <Field label="Data" htmlFor="d-data" required={!form.terminDoUstalenia}>
                    <Input
                      id="d-data"
                      type="date"
                      min={today}
                      disabled={form.terminDoUstalenia}
                      value={form.data}
                      onChange={(e) => update({ data: e.target.value })}
                    />
                  </Field>
                  <Field label="Godzina" htmlFor="d-godz">
                    <Input
                      id="d-godz"
                      type="time"
                      disabled={form.terminDoUstalenia}
                      value={form.godzina}
                      onChange={(e) => update({ godzina: e.target.value })}
                    />
                  </Field>
                  <Field label="Oferty przyjmuję do">
                    <Select value={form.ofertyDoTryb} onValueChange={(v) => update({ ofertyDoTryb: v as OfertyDoKey })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OFERTY_DO.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[13.5px]">
                  <Checkbox
                    className="mt-0.5"
                    checked={form.terminDoUstalenia}
                    onCheckedChange={(v) => update({ terminDoUstalenia: v === true })}
                  />
                  <span>
                    Termin do ustalenia z zastępcą
                    <small className="block text-xs text-muted-foreground">
                      Np. przeglądanie akt albo kopie, które można zrobić w kilka dni. Oferty zbieramy wtedy przez tydzień.
                    </small>
                  </span>
                </label>
                {isUnder24h(form) && (
                  <InfoBox variant="warn" icon={TriangleAlert} className="mt-3">
                    Do terminu zostało mniej niż 24 godziny. Dołącz od razu dokumenty i notatkę, żeby zastępca zdążył się
                    przygotować. Rozważ oznaczenie zlecenia jako pilne.
                  </InfoBox>
                )}
              </FormSection>
            </>
          )}

          {step === 3 && (
            <>
              <FormSection title="Kogo szukasz">
                <div className="flex flex-wrap gap-2">
                  <ToggleChip active={form.dlaAdwokatow} onClick={() => update({ dlaAdwokatow: !form.dlaAdwokatow })} icon={form.dlaAdwokatow ? Check : undefined}>
                    Adwokat
                  </ToggleChip>
                  <ToggleChip active={form.dlaRadcow} onClick={() => update({ dlaRadcow: !form.dlaRadcow })} icon={form.dlaRadcow ? Check : undefined}>
                    Radca prawny
                  </ToggleChip>
                  <ToggleChip active={form.dlaAplikantow} onClick={() => update({ dlaAplikantow: !form.dlaAplikantow })} icon={form.dlaAplikantow ? Check : undefined}>
                    Aplikant, na moje upoważnienie
                  </ToggleChip>
                </div>
                <InfoBox className="mt-3">
                  Aplikant adwokacki lub radcowski nie zostaje substytutem. Może Cię zastąpić na Twoje upoważnienie po 6
                  miesiącach aplikacji, z wyjątkiem SN, NSA i TK.
                </InfoBox>
                <div className="mt-4">
                  <span className="mb-1.5 block text-[12.5px] font-semibold text-foreground/80">Jak szukamy</span>
                  <div className="grid gap-2.5">
                    <ChoiceCard
                      checked={form.jakSzukamy === "gielda"}
                      onSelect={() => update({ jakSzukamy: "gielda" })}
                      disabled={editing}
                      title="Na giełdzie"
                      text="Zlecenie widzą pasujący adwokaci i radcowie. Dostają powiadomienie mailem."
                    />
                    <ChoiceCard
                      checked={form.jakSzukamy === "zapytanie"}
                      onSelect={() => update({ jakSzukamy: "zapytanie", zapytanieDoId: form.zapytanieDoId || trusted[0]?.id || "" })}
                      disabled={editing || directDisabled}
                      title="Najpierw zapytaj konkretną osobę"
                      text={
                        directDisabled
                          ? "Opcja pojawi się po pierwszym zleceniu, które ktoś dla Ciebie wykonał."
                          : "Ma 13 godzin na odpowiedź. Jeśli odmówi albo nie odpowie, zlecenie samo trafi na giełdę."
                      }
                    >
                      {form.jakSzukamy === "zapytanie" && !directDisabled && (
                        <Select value={form.zapytanieDoId} onValueChange={(v) => update({ zapytanieDoId: v })} disabled={editing}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Wybierz osobę" />
                          </SelectTrigger>
                          <SelectContent>
                            {trusted.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.nazwa} ({[t.miasto, `${t.wspolpraca} ${t.wspolpraca === 1 ? "zastępstwo" : "zastępstwa"}`].filter(Boolean).join(", ")})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </ChoiceCard>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Wynagrodzenie i wybór">
                <div className="grid gap-2.5">
                  <ChoiceCard
                    checked={form.stawkaTryb === "kwota"}
                    onSelect={() => update({ stawkaTryb: "kwota" })}
                    title="Podaję stawkę"
                    text="Zastępca widzi kwotę i może ją przyjąć jednym kliknięciem."
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        step={10}
                        placeholder="np. 250"
                        value={form.stawka}
                        onFocus={() => update({ stawkaTryb: "kwota" })}
                        onChange={(e) => update({ stawka: e.target.value, stawkaTryb: "kwota" })}
                        className="h-9 w-32"
                      />
                      <span className="whitespace-nowrap text-xs text-muted-foreground">zł netto</span>
                    </div>
                  </ChoiceCard>
                  <ChoiceCard
                    checked={form.stawkaTryb === "oferty"}
                    onSelect={() => update({ stawkaTryb: "oferty" })}
                    disabled={form.trybWyboru === "PIERWSZY" || form.jakSzukamy === "zapytanie"}
                    title="Czekam na propozycje"
                    text={
                      form.trybWyboru === "PIERWSZY" || form.jakSzukamy === "zapytanie"
                        ? "Przy trybie „pierwszy, kto przyjmie” i zapytaniu do konkretnej osoby podaj stawkę."
                        : "Każdy, kto się zgłasza, podaje swoją stawkę."
                    }
                  />
                </div>
                <div className="mt-2">
                  <ToggleRow
                    title="Wymagam faktury VAT"
                    text="Zastępca zobaczy to przed zgłoszeniem."
                    checked={form.fakturaVat}
                    onChange={(v) => update({ fakturaVat: v })}
                  />
                </div>
                <div className="mt-3">
                  <span className="mb-1.5 block text-[12.5px] font-semibold text-foreground/80">Wybór zastępcy</span>
                  <div className="grid gap-2.5">
                    <ChoiceCard
                      checked={form.trybWyboru === "WYBIERAM"}
                      onSelect={() => update({ trybWyboru: "WYBIERAM" })}
                      title="Wybieram sam spośród ofert"
                      text="Porównujesz stawki, oceny i doświadczenie."
                    />
                    <ChoiceCard
                      checked={form.trybWyboru === "PIERWSZY"}
                      onSelect={() => update({ trybWyboru: "PIERWSZY", stawkaTryb: "kwota" })}
                      title="Pierwszy, kto przyjmie"
                      text="Na sprawy na jutro. Zlecenie bierze pierwsza osoba, która zaakceptuje Twoją stawkę."
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <ToggleRow
                    title="Pilne"
                    badge={
                      <span className="inline-flex items-center gap-1 rounded-full bg-error px-2 py-0.5 text-[11px] font-semibold text-error-foreground">
                        <Zap className="h-3 w-3" />
                        {URGENT_POINTS} pkt
                      </span>
                    }
                    text={
                      editing
                        ? "Oznaczenie „Pilne” ustawia się przed publikacją."
                        : `SMS do pasujących prawników i miejsce na górze listy. Masz ${access.punkty} punktów.`
                    }
                    checked={form.pilne}
                    onChange={(v) => update({ pilne: v })}
                    disabled={editing || (!form.pilne && access.punkty < URGENT_POINTS)}
                  />
                </div>
              </FormSection>
            </>
          )}

          {step === 4 && (
            <FormSection title="Tylko dla wybranego zastępcy" icon={<Lock className="h-3.5 w-3.5 text-secondary" />}>
              <p className="-mt-1 mb-3.5 text-[13px] text-muted-foreground">
                Wszystko w tym kroku jest opcjonalne. Możesz to uzupełnić także po wyborze zastępcy.
              </p>
              <div className="rounded-xl border border-secondary/40 bg-secondary/5 p-4">
                <div className="grid gap-3.5 md:grid-cols-2">
                  <Field label="Sygnatura akt" htmlFor="d-sygn">
                    <Input id="d-sygn" maxLength={100} placeholder="Np. I C 1874/26" value={form.sygnatura} onChange={(e) => update({ sygnatura: e.target.value })} />
                  </Field>
                  <Field label="Strony" htmlFor="d-strony">
                    <Input
                      id="d-strony"
                      maxLength={500}
                      placeholder="Np. powód (mój klient) Jan W., pozwany Alfa sp. z o.o."
                      value={form.strony}
                      onChange={(e) => update({ strony: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="mt-3.5">
                  <Field label="Instrukcja dla zastępcy" htmlFor="d-instr">
                    <Textarea
                      id="d-instr"
                      rows={3}
                      maxLength={4000}
                      placeholder="Stanowisko, wnioski dowodowe, granice ugody, czego nie robić."
                      value={form.instrukcja}
                      onChange={(e) => update({ instrukcja: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="mt-3.5">
                  <span className="mb-1.5 block text-[12.5px] font-semibold text-foreground/80">Dokumenty</span>
                  <FileDropzone
                    ensureOrderId={async () => orderId ?? save()}
                    onUploaded={(file) => setFiles((list) => [...list, file])}
                    hint="PDF, DOCX, JPG do 20 MB. Pełnomocnictwo substytucyjne możesz dodać później."
                  />
                  {orderId && (
                    <OrderFiles orderId={orderId} files={files} canDelete onDeleted={(id) => setFiles((list) => list.filter((f) => f.id !== id))} />
                  )}
                </div>
                <InfoBox variant="lock" className="mt-3.5">
                  Odsłonimy to dopiero osobie, którą wybierzesz. Pliki znikają {FILE_RETENTION_DAYS} dni po zamknięciu zlecenia.
                </InfoBox>
              </div>
            </FormSection>
          )}

          {step === 5 && (
            <WizardSummary
              form={form}
              filesCount={files.length}
              trusted={trusted}
              points={access.punkty}
              editing={editing}
              statement={statement}
              onStatement={setStatement}
              onEdit={(n) => goTo(n)}
            />
          )}

          <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
            {errors.length > 0 && (
              <span className="mr-auto w-full text-[12.5px] text-error sm:w-auto">Uzupełnij: {errors.join(", ")}.</span>
            )}
            {!editing && (
              <Button variant="ghost" onClick={saveDraft} disabled={!!saving} className="max-sm:flex-1">
                {saving === "draft" && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Zapisz szkic
              </Button>
            )}
            {step > 1 && (
              <Button variant="outline" onClick={() => goTo(step - 1)} disabled={!!saving} className="max-sm:flex-1">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Wstecz
              </Button>
            )}
            {!lastStep ? (
              <Button size="lg" onClick={() => goTo(step + 1)} disabled={!!saving} className="max-sm:flex-1">
                {saving === "next" && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Dalej
              </Button>
            ) : (
              <Button size="lg" onClick={publish} disabled={!!saving} className="max-sm:flex-1">
                {saving === "publish" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />}
                {editing ? "Zapisz zmiany" : form.jakSzukamy === "zapytanie" ? "Wyślij zapytanie" : "Opublikuj zlecenie"}
              </Button>
            )}
          </div>
        </Panel>

        <div className="xl:sticky xl:top-4">
          <WizardPreview form={form} numer={numer} filesCount={files.length} />
        </div>
      </div>
    </div>
  )
}
