"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { useSubstitutionAccess } from "@/components/zastepstwa/access-context"
import { Avatar, InfoBox, LoadingState, Panel, PanelTitle, PersonMeta, ToggleChip } from "@/components/zastepstwa/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/sonner"
import { apiFetch, errorMessage, notifySubstitutionsChanged } from "@/lib/substitutions/client"
import { CZYNNOSCI, DZIEDZINY } from "@/lib/substitutions/constants"
import { searchAnyPlace } from "@/lib/substitutions/places"
import { formatDay } from "@/lib/substitutions/time"
import type { SettingsResponse } from "@/lib/substitutions/types"
import { Check, Loader2, Plus, ShieldCheck, X } from "lucide-react"
import { useEffect, useState } from "react"

type Settings = SettingsResponse["ustawienia"]

function ToggleRow({
  title,
  text,
  checked,
  onChange,
  disabled,
  large,
}: {
  title: string
  text: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  large?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3.5 border-b border-border/30 py-3 first:pt-0 last:border-b-0 last:pb-0">
      <div>
        <b className={large ? "text-[15px]" : "text-[13.5px]"}>{title}</b>
        <p className="text-[12.5px] text-muted-foreground">{text}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}

/** Wybór podzbioru słownika; „wszystkie zaznaczone” zapisujemy jako null (= bez ograniczeń). */
function toggleIn(list: string[] | null, all: readonly { value: string }[], value: string): string[] | null {
  const current = list ?? all.map((i) => i.value)
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
  return next.length === all.length ? null : next
}

export default function SubstitutionSettingsPage() {
  const { access } = useSubstitutionAccess()
  const [data, setData] = useState<SettingsResponse | null>(null)
  const [form, setForm] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [courtQuery, setCourtQuery] = useState("")
  const [addingCourt, setAddingCourt] = useState(false)
  const [rangeFrom, setRangeFrom] = useState("")
  const [rangeTo, setRangeTo] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiFetch<SettingsResponse>("/api/substitutions/settings")
        setData(response)
        setForm(response.ustawienia)
      } catch (e) {
        toast.error(errorMessage(e))
      }
    }
    load()
  }, [])

  if (!data || !form) return <LoadingState text="Wczytywanie ustawień..." />

  const update = (patch: Partial<Settings>) => setForm({ ...form, ...patch })
  const courtSuggestions = courtQuery.trim().length >= 2 ? searchAnyPlace(courtQuery, 6).filter((p) => !form.sady.includes(p.nazwa)) : []

  const addRange = () => {
    if (!rangeFrom) {
      toast.error("Wybierz datę początkową.")
      return
    }
    const to = rangeTo || rangeFrom
    if (to < rangeFrom) {
      toast.error("Data końca jest wcześniejsza niż początek.")
      return
    }
    update({ niedostepnosc: [...form.niedostepnosc, { od: rangeFrom, do: to }].sort((a, b) => a.od.localeCompare(b.od)) })
    setRangeFrom("")
    setRangeTo("")
  }

  const save = async () => {
    if (form.czynnosci && form.czynnosci.length === 0) {
      toast.error("Zaznacz co najmniej jedną czynność.")
      return
    }
    if (form.dziedziny && form.dziedziny.length === 0) {
      toast.error("Zaznacz co najmniej jedną dziedzinę.")
      return
    }
    setSaving(true)
    try {
      const { zapisane: _zapisane, ...payload } = form
      const response = await apiFetch<SettingsResponse>("/api/substitutions/settings", {
        method: "PUT",
        body: JSON.stringify({ ...payload, minStawka: form.minStawka || null }),
      })
      setData(response)
      setForm(response.ustawienia)
      toast.success("Ustawienia zapisane.")
      notifySubstitutionsChanged()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const card = data.karta

  return (
    <div className="relative space-y-6 pb-4">
      <PageHeader title="Ustawienia zastępstw" subtitle="Decydujesz, jakie zlecenia do Ciebie trafiają" />

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Panel>
            <ToggleRow
              large
              title="Przyjmuję zastępstwa"
              text="Gdy wyłączysz, nie dostaniesz powiadomień, a Twoje konto nie pojawi się w zapytaniach. Własne zlecenia dodajesz dalej."
              checked={form.przyjmuje}
              onChange={(v) => update({ przyjmuje: v })}
            />
            <InfoBox variant="success" icon={ShieldCheck} className="mt-3">
              {data.weryfikacja}
            </InfoBox>
            {access.rola === "APLIKANT" && !access.mozePrzyjmowac && access.aplikantGotowyOd && (
              <InfoBox variant="warn" className="mt-2.5">
                Zgłosisz się do zleceń od {formatDay(access.aplikantGotowyOd)}. Ustawienia możesz przygotować już teraz.
              </InfoBox>
            )}
          </Panel>

          <Panel>
            <PanelTitle>Skąd zlecenia</PanelTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="u-miasto" className="mb-1.5 block text-[12.5px] font-semibold">
                  Miasto
                </Label>
                <Input id="u-miasto" value={form.miasto} placeholder="Np. Warszawa" onChange={(e) => update({ miasto: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block text-[12.5px] font-semibold">Promień: {form.promienKm} km</Label>
                <Slider
                  className="mt-4"
                  min={5}
                  max={150}
                  step={5}
                  value={[form.promienKm]}
                  onValueChange={([value]) => update({ promienKm: value })}
                />
              </div>
            </div>
            <div className="mt-4">
              <span className="mb-1.5 block text-[12.5px] font-semibold">Albo konkretne sądy</span>
              <div className="flex flex-wrap gap-2">
                {form.sady.map((name) => (
                  <ToggleChip key={name} active onClick={() => update({ sady: form.sady.filter((s) => s !== name) })}>
                    {name}
                    <X className="h-3 w-3" />
                  </ToggleChip>
                ))}
                {!addingCourt && (
                  <ToggleChip active={false} onClick={() => setAddingCourt(true)} icon={Plus}>
                    dodaj sąd
                  </ToggleChip>
                )}
              </div>
              {addingCourt && (
                <div className="relative mt-2.5">
                  <Input
                    autoFocus
                    placeholder="Zacznij pisać, np. Mokotów albo Prokuratura Okręgowa"
                    value={courtQuery}
                    onChange={(e) => setCourtQuery(e.target.value)}
                    onBlur={() => setTimeout(() => setAddingCourt(false), 150)}
                  />
                  {courtSuggestions.length > 0 && (
                    <div className="absolute inset-x-0 top-[calc(100%+4px)] z-20 rounded-xl border border-border/60 bg-card p-1 shadow-xl">
                      {courtSuggestions.map((place) => (
                        <button
                          key={place.nazwa}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            update({ sady: [...form.sady, place.nazwa] })
                            setCourtQuery("")
                          }}
                          className="block w-full rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-foreground/5"
                        >
                          {place.nazwa}
                          <small className="block text-[11.5px] text-muted-foreground">{place.miasto}</small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground">Zlecenia z wybranych sądów przyjdą niezależnie od promienia.</p>
            </div>
            <div className="mt-3">
              <ToggleRow
                title="Zdalne z całej Polski"
                text="Rozprawy online, np. przed KIO albo w sądach z e-rozprawą."
                checked={form.zdalne}
                onChange={(v) => update({ zdalne: v })}
              />
            </div>
          </Panel>

          <Panel>
            <PanelTitle>Jakie zlecenia</PanelTitle>
            <span className="mb-1.5 block text-[12.5px] font-semibold">Czynności</span>
            <div className="mb-4 flex flex-wrap gap-2">
              {CZYNNOSCI.map((c) => {
                const active = !form.czynnosci || form.czynnosci.includes(c.value)
                return (
                  <ToggleChip key={c.value} active={active} icon={active ? Check : undefined} onClick={() => update({ czynnosci: toggleIn(form.czynnosci, CZYNNOSCI, c.value) })}>
                    {c.plural}
                  </ToggleChip>
                )
              })}
            </div>
            <span className="mb-1.5 block text-[12.5px] font-semibold">Dziedziny</span>
            <div className="mb-4 flex flex-wrap gap-2">
              {DZIEDZINY.map((d) => {
                const active = !form.dziedziny || form.dziedziny.includes(d.value)
                return (
                  <ToggleChip key={d.value} active={active} icon={active ? Check : undefined} onClick={() => update({ dziedziny: toggleIn(form.dziedziny, DZIEDZINY, d.value) })}>
                    {d.short}
                  </ToggleChip>
                )
              })}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="u-min" className="mb-1.5 block text-[12.5px] font-semibold">
                  Minimalna stawka
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="u-min"
                    type="number"
                    min={0}
                    step={10}
                    value={form.minStawka ?? ""}
                    placeholder="bez limitu"
                    onChange={(e) => update({ minStawka: e.target.value ? parseInt(e.target.value, 10) : null })}
                  />
                  <span className="whitespace-nowrap text-xs text-muted-foreground">zł netto</span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Zlecenia z niższą stawką nie przyjdą. „Czekam na propozycje” przychodzą zawsze.
                </p>
              </div>
              <div>
                <span className="mb-1.5 block text-[12.5px] font-semibold">Nie przyjmuję w dniach</span>
                <div className="flex flex-wrap gap-1.5">
                  {form.niedostepnosc.map((range, index) => (
                    <ToggleChip
                      key={`${range.od}-${range.do}`}
                      active
                      onClick={() => update({ niedostepnosc: form.niedostepnosc.filter((_, i) => i !== index) })}
                    >
                      {range.od === range.do ? formatDay(`${range.od}T12:00:00Z`) : `${formatDay(`${range.od}T12:00:00Z`)} do ${formatDay(`${range.do}T12:00:00Z`)}`}
                      <X className="h-3 w-3" />
                    </ToggleChip>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Input type="date" className="h-9 w-auto" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} aria-label="Od" />
                  <span className="text-xs text-muted-foreground">do</span>
                  <Input type="date" className="h-9 w-auto" value={rangeTo} min={rangeFrom} onChange={(e) => setRangeTo(e.target.value)} aria-label="Do" />
                  <Button type="button" size="sm" variant="outline" onClick={addRange}>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Dodaj
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <PanelTitle>Powiadomienia</PanelTitle>
            <ToggleRow
              title="E-mail od razu"
              text="Każde nowe zlecenie, które pasuje do ustawień."
              checked={form.emailOdRazu}
              onChange={(v) => update({ emailOdRazu: v, zestawienieDzienne: v ? false : form.zestawienieDzienne })}
            />
            <ToggleRow
              title="Zestawienie raz dziennie"
              text="Jeden mail o 7:30 zamiast kilku w ciągu dnia."
              checked={form.zestawienieDzienne}
              onChange={(v) => update({ zestawienieDzienne: v, emailOdRazu: v ? false : form.emailOdRazu })}
            />
            <ToggleRow
              title="SMS przy pilnych"
              text={data.smsDostepny ? "Na numer z profilu. W pakietach Premium i Biznes." : "Dostępne w pakietach Premium i Biznes."}
              checked={form.smsPilne && data.smsDostepny}
              onChange={(v) => update({ smsPilne: v })}
              disabled={!data.smsDostepny}
            />
            <ToggleRow
              title="Przypomnienie dzień przed terminem"
              text="Mail i SMS o 18:00 z adresem i salą."
              checked={form.przypomnienie}
              onChange={(v) => update({ przypomnienie: v })}
            />
          </Panel>

          <Panel>
            <PanelTitle>Twoja karta zastępcy</PanelTitle>
            <p className="-mt-2 mb-3 text-xs text-muted-foreground">
              Tyle widzą zlecający przy Twojej ofercie. Oceny są widoczne tylko dla prawników w module zastępstw.
            </p>
            <div className="rounded-xl border border-border/40 bg-background/30 p-4">
              <div className="flex items-start gap-3">
                <Avatar inicjaly={card.inicjaly} kolor={card.kolor} />
                <div className="min-w-0">
                  <b className="text-[15px]">{card.nazwa}</b>
                  <div className="mt-1">
                    <PersonMeta osoba={card} />
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <div className="sticky bottom-4 flex justify-end">
            <Button size="lg" onClick={save} disabled={saving} className="shadow-xl">
              {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}
              Zapisz ustawienia
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
