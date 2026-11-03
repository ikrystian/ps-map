"use client"

import { Button } from "@/components/ui/button"
import { formatShort } from "@/lib/substitutions/time"
import { CircleCheck, FileText, Plus } from "lucide-react"
import { IdBadge, InfoBox, Panel, Timeline, UrgentPill, type TimelineItem } from "../ui"

export interface PublishResult {
  message: string
  id: string
  numer: string | null
  status: string
  pilne: boolean
  ofertyDo: string | null
  zapytanieWazneDo: string | null
}

/** Ekran po publikacji: co już się stało i co dalej (jak w makiecie). */
export function WizardSuccess({
  result,
  askedName,
  firstComes,
  onNew,
  onOpen,
}: {
  result: PublishResult
  askedName: string | null
  firstComes: boolean
  onNew: () => void
  onOpen: () => void
}) {
  const direct = result.status === "ZAPYTANIE"
  const steps: TimelineItem[] = direct
    ? [
        { state: "ok", title: `Zapytanie wysłane do: ${askedName ?? "wybranej osoby"}`, note: "przed chwilą" },
        { state: "teraz", title: "Czekamy na odpowiedź", note: result.zapytanieWazneDo ? `do ${formatShort(result.zapytanieWazneDo)}` : "do 13 godzin" },
        { state: "przyszle", title: "Jeśli odmówi: zlecenie na giełdzie", note: "powiadomimy pasujących prawników" },
        { state: "przyszle", title: "Zastępca potwierdza przyjęcie", note: "wtedy odsłonimy mu sygnaturę, strony i pliki" },
        { state: "przyszle", title: "Raport po czynności", note: "potwierdzasz go albo zamkniemy zlecenie po 48 h" },
      ]
    : [
        { state: "ok", title: "Opublikowane, powiadomienia wysłane", note: result.pilne ? "mail i SMS, przed chwilą" : "mail, przed chwilą" },
        {
          state: "teraz",
          title: firstComes ? "Czekamy, aż ktoś przyjmie" : "Zbierasz oferty",
          note: firstComes ? "pierwsza akceptacja bierze zlecenie" : result.ofertyDo ? `do: ${formatShort(result.ofertyDo)}` : null,
        },
        {
          state: "przyszle",
          title: firstComes ? "Zastępca przyjmuje zlecenie" : "Wybierasz zastępcę",
          note: "wtedy odsłonimy mu sygnaturę, strony i pliki",
        },
        { state: "przyszle", title: "Zastępca potwierdza przyjęcie" },
        { state: "przyszle", title: "Raport po czynności", note: "potwierdzasz go albo zamkniemy zlecenie po 48 h" },
      ]

  const text = direct
    ? `${askedName ?? "Wybrana osoba"} dostaje maila i powiadomienie w panelu. O odpowiedzi dowiesz się od razu.`
    : `Wysłaliśmy maila do pasujących prawników${result.pilne ? " i SMS do tych, którzy je włączyli (pobraliśmy punkty)" : ""}. ${
        firstComes
          ? "Gdy ktoś przyjmie zlecenie, od razu dostaniesz powiadomienie."
          : "Każdą ofertę zobaczysz w „Moich zleceniach”, a o każdej dostaniesz powiadomienie."
      }`

  return (
    <Panel className="mx-auto max-w-3xl px-6 py-10 text-center sm:px-8">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary/15 text-primary">
        <CircleCheck className="h-8 w-8" />
      </div>
      <div className="mb-2.5 flex justify-center gap-1.5">
        <IdBadge numer={result.numer} />
        {result.pilne && <UrgentPill />}
      </div>
      <h2 className="font-playfair text-2xl font-semibold">{direct ? "Zapytanie wysłane" : "Zlecenie opublikowane"}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{text}</p>
      <Timeline items={steps} className="mx-auto mb-2 mt-7 max-w-md text-left" />
      <InfoBox icon={FileText} className="mx-auto mb-6 mt-4 max-w-xl text-left">
        Pełnomocnictwo substytucyjne (dla aplikanta: upoważnienie) wystawiasz sam po wyborze zastępcy. Wzór pobierzesz w
        szczegółach zlecenia.
      </InfoBox>
      <div className="flex flex-wrap justify-center gap-2.5">
        <Button variant="outline" onClick={onNew}>
          <Plus className="mr-1.5 h-4 w-4" />
          Dodaj kolejne zlecenie
        </Button>
        <Button onClick={onOpen}>Przejdź do zlecenia</Button>
      </div>
    </Panel>
  )
}
