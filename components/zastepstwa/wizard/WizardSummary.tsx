"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { zl } from "@/lib/substitutions/client"
import {
  KOGO,
  URGENT_POINTS,
  czynnoscLabel,
  dziedzinaLabel,
  joinWithAnd,
  ktoryTerminText,
  ofertyDoLabel,
  rolaLabel,
  whoList,
} from "@/lib/substitutions/constants"
import { formatTermin } from "@/lib/substitutions/time"
import type { TrustedSubstituteDTO } from "@/lib/substitutions/types"
import { plural } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Clock, Lock, Send, TriangleAlert } from "lucide-react"
import { DefinitionList, InfoBox, RemotePill } from "../ui"
import { isUnder24h, termDate, type WizardForm } from "./form"

function Section({
  step,
  title,
  locked,
  onEdit,
  items,
}: {
  step: number
  title: string
  locked?: boolean
  onEdit: (step: number) => void
  items: [string, React.ReactNode][]
}) {
  return (
    <div className={cn("rounded-xl border bg-background/30 px-4 py-3.5", locked ? "border-secondary/40" : "border-border/40")}>
      <div className="mb-2.5 flex items-center gap-2">
        {locked && <Lock className="h-3.5 w-3.5 text-secondary" />}
        <b className="text-xs uppercase tracking-wider text-foreground/80">{title}</b>
        <button type="button" onClick={() => onEdit(step)} className="ml-auto text-[12.5px] font-semibold text-primary hover:underline">
          Zmień
        </button>
      </div>
      <DefinitionList labelWidth="130px" items={items} />
    </div>
  )
}

const missing = <span className="text-muted-foreground">nie podano</span>

/** Krok 5: podsumowanie z „Zmień” przy każdej sekcji, komunikat, kogo powiadomimy, i oświadczenie. */
export function WizardSummary({
  form,
  filesCount,
  trusted,
  points,
  editing,
  statement,
  onStatement,
  onEdit,
}: {
  form: WizardForm
  filesCount: number
  trusted: TrustedSubstituteDTO[]
  points: number
  editing: boolean
  statement: boolean
  onStatement: (value: boolean) => void
  onEdit: (step: number) => void
}) {
  const date = termDate(form)
  const asked = trusted.find((t) => t.id === form.zapytanieDoId)
  const direct = form.jakSzukamy === "zapytanie" && !editing
  const who = whoList(form)
  const amount = parseInt(form.stawka, 10)
  const remote = form.typMiejsca === "ZDALNIE"
  const where = remote ? "z całej Polski, którzy przyjmują rozprawy zdalne" : "z zasięgiem obejmującym to miejsce"

  return (
    <div className="space-y-3">
      <Section
        step={1}
        title="Czynność"
        onEdit={onEdit}
        items={[
          ["Tytuł", form.tytul],
          ["Czynność", [czynnoscLabel(form.czynnosc), dziedzinaLabel(form.dziedzina), ktoryTerminText(form.ktoryTermin)].filter(Boolean).join(" · ")],
          ["Zastępca jako", rolaLabel(form.rolaZastepcy)],
          ["Opis", form.opis.trim() || missing],
        ]}
      />
      <Section
        step={2}
        title="Miejsce i termin"
        onEdit={onEdit}
        items={[
          [
            "Miejsce",
            <span key="m" className="inline-flex flex-wrap items-center gap-1.5">
              {[form.miejsce, form.wydzial].filter((v) => v.trim()).join(", ")}
              {remote && <RemotePill />}
            </span>,
          ],
          ["Termin", form.terminDoUstalenia ? "do ustalenia z zastępcą" : date ? formatTermin(date, !!form.godzina, false) : missing],
          ["Oferty do", ofertyDoLabel(form.ofertyDoTryb)],
        ]}
      />
      <Section
        step={3}
        title="Kogo i za ile"
        onEdit={onEdit}
        items={[
          ["Kogo szukasz", who.map((r) => KOGO.find((k) => k.value === r)?.label).join(", ")],
          ["Jak szukamy", direct ? `najpierw zapytanie do: ${asked?.nazwa ?? "—"}, potem giełda` : "giełda, powiadomienie mailem"],
          [
            "Wynagrodzenie",
            `${form.stawkaTryb === "kwota" ? `${zl(amount)} netto` : "czekam na propozycje"}${form.fakturaVat ? ", faktura VAT" : ", bez faktury"}`,
          ],
          ["Wybór", form.trybWyboru === "WYBIERAM" ? "wybierasz sam spośród ofert" : "pierwszy, kto przyjmie Twoją stawkę"],
          ["Pilne", form.pilne ? `tak, ${URGENT_POINTS} punktów (zostanie Ci ${points - URGENT_POINTS})` : ""],
        ]}
      />
      <Section
        step={4}
        title="Dane poufne, tylko dla wybranego"
        locked
        onEdit={onEdit}
        items={[
          ["Sygnatura", form.sygnatura.trim() || missing],
          ["Strony", form.strony.trim() || missing],
          [
            "Instrukcja",
            form.instrukcja.trim()
              ? form.instrukcja.trim().length > 90
                ? `${form.instrukcja.trim().slice(0, 90)}…`
                : form.instrukcja.trim()
              : missing,
          ],
          ["Dokumenty", `${filesCount} ${plural(filesCount, "plik", "pliki", "plików")}`],
        ]}
      />

      {!editing && (
        <InfoBox icon={Send}>
          {direct
            ? `Po publikacji wyślemy zapytanie do: ${asked?.nazwa ?? "—"}. Ma 13 godzin na odpowiedź. Jeśli odmówi albo nie odpowie, zlecenie samo trafi na giełdę.`
            : `Po publikacji wyślemy maila do zweryfikowanych ${joinWithAnd(who.map((r) => KOGO.find((k) => k.value === r)!.genitivePlural))} ${where}${form.pilne ? ", a do wszystkich pasujących także SMS" : ""}.`}
        </InfoBox>
      )}
      {editing && <InfoBox>Po zapisaniu zmian zgłoszeni prawnicy dostaną informację, że zlecenie się zmieniło.</InfoBox>}
      {!form.instrukcja.trim() && (
        <InfoBox variant="warn" icon={TriangleAlert}>
          Nie ma instrukcji dla zastępcy. Możesz ją dodać po wyborze, ale wcześniej łatwiej się przygotować.
        </InfoBox>
      )}
      {isUnder24h(form) && (
        <InfoBox variant="warn" icon={Clock}>
          Do terminu zostało mniej niż 24 godziny.{form.pilne || editing ? "" : " Rozważ oznaczenie jako pilne (krok 3)."}
        </InfoBox>
      )}

      <label className="mt-2 flex cursor-pointer items-start gap-2.5 text-[13.5px]">
        <Checkbox className="mt-0.5" checked={statement} onCheckedChange={(v) => onStatement(v === true)} />
        <span>
          Opis dla wszystkich nie zawiera nazwisk stron, sygnatury ani innych danych, po których da się rozpoznać klienta.
          <small className="block text-xs text-muted-foreground">Wymagane. Tak chronimy tajemnicę zawodową.</small>
        </span>
      </label>
    </div>
  )
}
