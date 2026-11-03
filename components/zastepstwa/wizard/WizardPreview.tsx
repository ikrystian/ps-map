"use client"

import { Button } from "@/components/ui/button"
import { zl } from "@/lib/substitutions/client"
import { KOGO_FULL, czynnoscLabel, dziedzinaLabel, ktoryTerminText } from "@/lib/substitutions/constants"
import { formatTermin } from "@/lib/substitutions/time"
import { plural } from "@/lib/format"
import { cn } from "@/lib/utils"
import { CalendarDays, Coins, Eye, FileText, Gavel, Info, Lock, MapPin, Phone, Upload, Users } from "lucide-react"
import { IdBadge, RemotePill, UrgentPill } from "../ui"
import { termDate, type WizardForm } from "./form"

function Row({ icon: Icon, children, muted }: { icon: typeof Gavel; children: React.ReactNode; muted?: boolean }) {
  return (
    <div className={cn("mt-2 flex items-start gap-2.5 text-[13px]", muted ? "text-muted-foreground" : "text-foreground/80")}>
      <Icon className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
      <span className="min-w-0">{children}</span>
    </div>
  )
}

function Blur({ width }: { width: number }) {
  return <span className="inline-block h-2.5 rounded bg-border align-middle" style={{ width }} />
}

/** „Tak zobaczą to inni prawnicy” — podgląd karty zlecenia odświeżany przy wpisywaniu. */
export function WizardPreview({ form, numer, filesCount }: { form: WizardForm; numer: string | null; filesCount: number }) {
  const date = termDate(form)
  const who = [
    form.dlaAdwokatow && KOGO_FULL.ADWOKAT,
    form.dlaRadcow && KOGO_FULL.RADCA,
    form.dlaAplikantow && KOGO_FULL.APLIKANT,
  ].filter(Boolean) as string[]
  const whoText = who.length ? who.join(", ").replace(/^./, (c) => c.toUpperCase()) : "Wybierz, kogo szukasz"
  const amount = parseInt(form.stawka, 10)
  const place = form.miejsce.trim() ? [form.miejsce.trim(), form.wydzial.trim()].filter(Boolean).join(", ") : "Wybierz miejsce"

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Eye className="h-3.5 w-3.5" />
        Tak zobaczą to inni prawnicy
      </div>
      <div className="rounded-2xl border border-border/40 bg-background/30 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <IdBadge numer={numer ?? "ZAS/…"} />
          {form.pilne && <UrgentPill />}
          {form.typMiejsca === "ZDALNIE" && <RemotePill />}
        </div>
        <div className={cn("mb-2.5 mt-2 text-[15px] font-semibold", !form.tytul.trim() && "opacity-50")}>
          {form.tytul.trim() || "Tytuł zlecenia"}
        </div>
        <Row icon={Gavel}>
          {[czynnoscLabel(form.czynnosc), dziedzinaLabel(form.dziedzina), ktoryTerminText(form.ktoryTermin)].filter(Boolean).join(" · ")}
        </Row>
        <Row icon={MapPin} muted={!form.miejsce.trim()}>
          {place}
        </Row>
        <Row icon={CalendarDays}>
          {form.terminDoUstalenia ? "do ustalenia z zastępcą" : date ? formatTermin(date, !!form.godzina, false) : "Wybierz datę"}
        </Row>
        <Row icon={Users}>{whoText}</Row>
        <Row icon={Coins}>
          {form.stawkaTryb === "kwota" ? `${amount > 0 ? zl(amount) : "? zł"} netto` : "Czeka na propozycje"}
          {form.fakturaVat ? " · faktura VAT" : " · bez faktury"}
        </Row>
        <Row icon={Info} muted={!form.opis.trim()}>
          <span className={cn(!form.opis.trim() && "italic")}>{form.opis.trim() || "Opis pojawi się tutaj."}</span>
        </Row>
        <Button size="sm" className="mt-3.5 w-full" tabIndex={-1} disabled>
          {form.trybWyboru === "PIERWSZY" ? "Przyjmuję" : "Zgłoś się"}
        </Button>
      </div>

      <div className="rounded-2xl border border-secondary/40 bg-secondary/5 p-4">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-secondary">
          <Lock className="h-3.5 w-3.5" />
          Zobaczy tylko wybrany zastępca
        </div>
        <Row icon={FileText}>
          Sygnatura: {form.sygnatura.trim() || <Blur width={90} />}
        </Row>
        <Row icon={Users}>
          Strony: {form.strony.trim() || <Blur width={150} />}
        </Row>
        <Row icon={Upload}>
          {filesCount} {plural(filesCount, "plik", "pliki", "plików")}
          {form.instrukcja.trim() ? " i instrukcja" : ""}
        </Row>
        <Row icon={Phone}>Twój telefon i e-mail</Row>
      </div>
    </div>
  )
}
