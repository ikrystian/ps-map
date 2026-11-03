"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TYPY_MIEJSCA, type TypMiejscaKey } from "@/lib/substitutions/constants"
import { WOJEWODZTWA, findPlace, searchPlaces, type PlaceEntry } from "@/lib/substitutions/places"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { useState } from "react"
import { PlaceIcon } from "../ui"
import type { WizardForm } from "./form"

type Patch = (patch: Partial<WizardForm>) => void

/** Kafle „Gdzie odbywa się czynność” + nazwa z podpowiedziami + wydział, sala. */
export function PlaceField({ form, update, disabled }: { form: WizardForm; update: Patch; disabled?: boolean }) {
  const [focused, setFocused] = useState(false)
  const typ = TYPY_MIEJSCA.find((t) => t.value === form.typMiejsca) ?? TYPY_MIEJSCA[0]
  const suggestions = focused ? searchPlaces(form.typMiejsca, form.miejsce) : []
  const known = form.miejsce.trim() ? findPlace(form.typMiejsca, form.miejsce) : undefined
  const needsCity = form.typMiejsca !== "ZDALNIE" && !!form.miejsce.trim() && !known

  const choose = (place: PlaceEntry) => {
    update({ miejsce: place.nazwa, miasto: place.miasto, wojewodztwo: place.wojewodztwo })
    setFocused(false)
  }

  return (
    <div>
      <span className="mb-1.5 block text-[12.5px] font-semibold text-foreground/80">
        Gdzie odbywa się czynność <span className="text-error">*</span>
      </span>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
        {TYPY_MIEJSCA.map((t) => {
          const active = form.typMiejsca === t.value
          return (
            <button
              key={t.value}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() =>
                update({ typMiejsca: t.value as TypMiejscaKey, miejsce: "", miasto: "", wojewodztwo: "" })
              }
              className={cn(
                "rounded-xl border px-1.5 pb-2.5 pt-3 text-center transition-colors disabled:opacity-60",
                active ? "border-primary bg-primary/10" : "border-border/60 bg-background/30 hover:border-muted-foreground"
              )}
            >
              <PlaceIcon typ={t.value} className={cn("mx-auto mb-1.5 h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
              <b className="block text-[13px]">{t.label}</b>
              <small className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">{t.hint}</small>
            </button>
          )
        })}
      </div>

      <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
        <div className="relative">
          <Label htmlFor="d-miejsce" className="mb-1.5 block text-[12.5px]">
            {typ.fieldLabel} <span className="text-error">*</span>
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="d-miejsce"
              autoComplete="off"
              disabled={disabled}
              placeholder={form.typMiejsca === "SAD" ? "Zacznij pisać, np. Mokotów" : "Zacznij pisać nazwę"}
              value={form.miejsce}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onChange={(e) => update({ miejsce: e.target.value })}
              className="pl-9"
            />
          </div>
          {focused && (
            <div className="absolute inset-x-0 top-[calc(100%+4px)] z-20 max-h-64 overflow-auto rounded-xl border border-border/60 bg-card p-1 shadow-xl">
              {suggestions.length > 0 ? (
                suggestions.map((place) => (
                  <button
                    key={place.nazwa}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      choose(place)
                    }}
                    className="block w-full rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-foreground/5"
                  >
                    {place.nazwa}
                    <small className="block text-[11.5px] text-muted-foreground">
                      {[place.adres, place.zrodlo].filter(Boolean).join(" · ")}
                    </small>
                  </button>
                ))
              ) : (
                <div className="px-2.5 py-2 text-[13px] text-muted-foreground">
                  Brak na liście. Wpisz pełną nazwę i podaj miejscowość poniżej.
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="d-wydz" className="mb-1.5 block text-[12.5px]">
            Wydział, sala
          </Label>
          <Input
            id="d-wydz"
            disabled={disabled}
            placeholder="Np. I Wydział Cywilny, sala 112"
            value={form.wydzial}
            onChange={(e) => update({ wydzial: e.target.value })}
          />
        </div>
      </div>

      {needsCity && (
        <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
          <div>
            <Label htmlFor="d-miasto" className="mb-1.5 block text-[12.5px]">
              Miejscowość <span className="text-error">*</span>
            </Label>
            <Input
              id="d-miasto"
              disabled={disabled}
              placeholder="Np. Pruszków"
              value={form.miasto}
              onChange={(e) => update({ miasto: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-[12.5px]">Województwo</Label>
            <Select value={form.wojewodztwo || undefined} onValueChange={(v) => update({ wojewodztwo: v })} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz województwo" />
              </SelectTrigger>
              <SelectContent>
                {WOJEWODZTWA.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      {known?.adres && <p className="mt-2 text-xs text-muted-foreground">Adres: {known.adres}</p>}
    </div>
  )
}
