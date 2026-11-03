"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/sonner"
import { errorMessage, notifySubstitutionsChanged, postJson, zl } from "@/lib/substitutions/client"
import { AUTO_CLOSE_HOURS, LATE_RESIGNATION_HOURS, PRZEBIEG_RAPORTU, przebiegLabel, rolaLabel, type PrzebiegKey } from "@/lib/substitutions/constants"
import { formatShort, formatTermin, hoursUntil, shiftDay, termEnd, warsawDay } from "@/lib/substitutions/time"
import type { AcceptedOrderDTO, FileDTO } from "@/lib/substitutions/types"
import { plural } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  CircleCheck,
  FileText,
  Info,
  Loader2,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react"
import { useState } from "react"
import { useSubstitutionAccess } from "./access-context"
import { FileDropzone, OrderFiles } from "./Files"
import { DefinitionList, IdBadge, InfoBox, RemotePill, SectionLabel, StatusPill } from "./ui"
import { StarRating } from "./OfferCard"

function icsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n")
}

/** Plik .ics z terminem zastępstwa — do importu w kalendarzu. */
function downloadIcs(order: AcceptedOrderDTO) {
  if (!order.termin) return
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const start = new Date(order.termin)
  const timing = order.terminMaGodzine
    ? [`DTSTART:${stamp(start)}`, `DTEND:${stamp(new Date(start.getTime() + 3600_000))}`]
    : [`DTSTART;VALUE=DATE:${warsawDay(start).replace(/-/g, "")}`, `DTEND;VALUE=DATE:${shiftDay(warsawDay(start), 1).replace(/-/g, "")}`]
  const location = [order.miejsce, order.wydzial, order.adres].filter(Boolean).join(", ")
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ProstaSprawa//Zastepstwa procesowe//PL",
    "BEGIN:VEVENT",
    `UID:${order.id}@prostasprawa.pl`,
    `DTSTAMP:${stamp(new Date())}`,
    ...timing,
    `SUMMARY:${icsText(`Zastępstwo: ${order.tytul}`)}`,
    `LOCATION:${icsText(location)}`,
    `DESCRIPTION:${icsText(`${order.numer ?? ""} · zlecający: ${order.zlecajacy.nazwa}${order.poufne.sygnatura ? ` · sygn. ${order.poufne.sygnatura}` : ""}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `zastepstwo-${(order.numer ?? order.id).replace(/\//g, "-")}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

function Step({ n, state, title, note }: { n: number; state: "ok" | "akt" | ""; title: string; note: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 text-[13px]", state === "" ? "text-muted-foreground" : state === "ok" ? "text-foreground/80" : "text-foreground")}>
      <span
        className={cn(
          "grid h-[26px] w-[26px] flex-none place-items-center rounded-full border-2 text-xs font-bold",
          state === "ok" && "border-primary bg-primary text-primary-foreground",
          state === "akt" && "border-secondary text-secondary",
          state === "" && "border-border"
        )}
      >
        {n}
      </span>
      <div>
        <b>{title}</b>
        <div className="text-xs text-muted-foreground">{note}</div>
      </div>
    </div>
  )
}

/** Zastępstwo przyjęte przez eksperta — jak karta „Przyjęte przeze mnie” w makiecie. */
export function AcceptedOrderCard({
  order,
  defaultOpen,
  highlighted,
  onChanged,
}: {
  order: AcceptedOrderDTO
  defaultOpen: boolean
  highlighted: boolean
  onChanged: () => Promise<void>
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [busy, setBusy] = useState<string | null>(null)
  const [przebieg, setPrzebieg] = useState<PrzebiegKey>("ODBYLA_SIE")
  const [nextTerm, setNextTerm] = useState("")
  const [note, setNote] = useState("")
  const [noteError, setNoteError] = useState(false)
  const [files, setFiles] = useState<FileDTO[]>(order.pliki)
  const [resignOpen, setResignOpen] = useState(false)
  const [resignReason, setResignReason] = useState("")

  const owner = order.zlecajacy
  const term = formatTermin(order.termin, order.terminMaGodzine, order.terminDoUstalenia)
  const start = order.termin && !order.terminDoUstalenia ? termEnd(order.termin, order.terminMaGodzine) : null
  const lateResign = !!start && hoursUntil(start) < LATE_RESIGNATION_HOURS
  const aplikant = useSubstitutionAccess().access.rola === "APLIKANT"
  const stawka = order.stawkaUzgodniona ?? order.mojaOferta?.stawka ?? order.stawka

  const act = async (key: string, body: Record<string, unknown>) => {
    setBusy(key)
    try {
      const result = await postJson(`/api/substitutions/${order.id}/actions`, body)
      toast.success(result.message)
      notifySubstitutionsChanged()
      await onChanged()
      return true
    } catch (e) {
      toast.error(errorMessage(e))
      return false
    } finally {
      setBusy(null)
    }
  }

  const sendReport = async () => {
    if (note.trim().length < 10) {
      setNoteError(true)
      toast.error("Napisz w notatce, co się wydarzyło (min. 10 znaków).")
      return
    }
    await act("report", { action: "report", przebieg, kolejnyTermin: nextTerm || null, notatka: note.trim() })
  }

  const s = order.status
  const steps: ("ok" | "akt" | "")[] =
    s === "PRZYDZIELONE" ? ["akt", "", ""] : s === "POTWIERDZONE" ? ["ok", order.naMiejscuAt ? "ok" : "akt", order.naMiejscuAt ? "akt" : ""] : ["ok", "ok", "ok"]

  return (
    <div
      id={`zlecenie-${order.id}`}
      className={cn(
        "scroll-mt-4 overflow-hidden rounded-2xl border bg-card/25 backdrop-blur-md transition-shadow",
        highlighted ? "border-primary/60 shadow-[0_0_0_3px] shadow-primary/15" : "border-border/30"
      )}
    >
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full flex-wrap items-start gap-3.5 px-5 py-4 text-left sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <IdBadge numer={order.numer} />
            <StatusPill status={s} perspective="substitute" />
            {order.typMiejsca === "ZDALNIE" && <RemotePill />}
          </div>
          <h3 className="mt-2 text-lg font-semibold">{order.tytul}</h3>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {open
              ? `Zlecający: ${owner.nazwa}, ${owner.kontakt.kancelaria} · ${owner.zweryfikowany ? "zweryfikowany · " : ""}${owner.zlecenia} ${plural(owner.zlecenia, "zlecenie", "zlecenia", "zleceń")}, ${owner.anulowane} ${plural(owner.anulowane, "anulowane", "anulowane", "anulowanych")}`
              : [term, order.miejsce, `zlecający: ${owner.nazwa}`].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tabular-nums">{zl(stawka)} netto</div>
          <div className="text-xs text-muted-foreground">{order.mojaOferta?.fakturaVat || order.fakturaVat ? "faktura VAT na kancelarię zlecającego" : "bez faktury"}</div>
        </div>
        <ChevronDown className={cn("mt-1 h-4 w-4 flex-none text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          {s !== "ANULOWANE" && (
            <div className="grid gap-2.5 border-y border-border/30 bg-background/30 px-5 py-4 sm:px-6 md:grid-cols-3">
              <Step n={1} state={steps[0]} title="Potwierdź przyjęcie" note={order.potwierdzenieDo && s === "PRZYDZIELONE" ? `do ${formatShort(order.potwierdzenieDo)}` : order.potwierdzonoAt ? `potwierdzone ${formatShort(order.potwierdzonoAt)}` : ""} />
              <Step n={2} state={steps[1]} title="W dniu terminu" note="„Jestem na miejscu”" />
              <Step n={3} state={steps[2]} title="Raport po czynności" note="przebieg i kolejny termin" />
            </div>
          )}

          <div className="grid md:grid-cols-2">
            <div className="px-5 py-4 sm:px-6">
              <SectionLabel icon={CalendarDays} className="mt-0">
                Termin i miejsce
              </SectionLabel>
              <DefinitionList
                items={[
                  ["Kiedy", term],
                  ["Gdzie", [order.miejsce, order.wydzial].filter(Boolean).join(", ")],
                  ["Adres", order.adres],
                  ["Występujesz jako", `${rolaLabel(order.rolaZastepcy)}, ${aplikant ? "na upoważnienie" : "substytut"}`],
                  [
                    "Kontakt",
                    s === "ANULOWANE"
                      ? null
                      : [owner.kontakt.telefon, owner.kontakt.email].filter(Boolean).join(" · ") || null,
                  ],
                ]}
              />

              {s !== "ANULOWANE" && (
                <>
                  <SectionLabel icon={Lock}>Dane sprawy, odsłonięte dla Ciebie</SectionLabel>
                  <DefinitionList
                    items={[
                      ["Sygnatura", order.poufne.sygnatura || <span className="text-muted-foreground">zlecający jeszcze nie podał</span>],
                      ["Strony", order.poufne.strony || <span className="text-muted-foreground">zlecający jeszcze nie podał</span>],
                    ]}
                  />
                  {order.poufne.instrukcja && (
                    <div className="mt-3 whitespace-pre-line rounded-lg border-l-[3px] border-secondary bg-background/40 px-3 py-2.5 text-[13.5px] text-foreground/80">
                      {order.poufne.instrukcja}
                    </div>
                  )}
                  <OrderFiles
                    orderId={order.id}
                    files={files}
                    canDelete={s === "PRZYDZIELONE" || s === "POTWIERDZONE" || s === "WYKONANE"}
                    onDeleted={(id) => setFiles((list) => list.filter((f) => f.id !== id))}
                  />
                </>
              )}
            </div>

            <div className="border-t border-border/30 px-5 py-4 sm:px-6 md:border-l md:border-t-0">
              {s === "PRZYDZIELONE" && (
                <>
                  <SectionLabel icon={ShieldCheck} className="mt-0">
                    Potwierdzenie
                  </SectionLabel>
                  <p className="mb-3.5 text-[13.5px] text-foreground/80">
                    Zlecający wybrał Twoją ofertę. Potwierdź, że przyjmujesz {aplikant ? "zastępstwo na upoważnienie" : "substytucję"}. Zlecający
                    dostanie od nas maila.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => act("confirm", { action: "confirm" })} disabled={!!busy}>
                      {busy === "confirm" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CircleCheck className="mr-1.5 h-4 w-4" />}
                      Potwierdzam przyjęcie
                    </Button>
                    <Button variant="outline" className="border-error/50 text-error hover:bg-error/10 hover:text-error" onClick={() => setResignOpen(true)}>
                      Rezygnuję
                    </Button>
                  </div>
                  <InfoBox icon={Info} className="mt-3.5">
                    Potwierdzenie przyjęcia substytucji wymaga też Kodeks Etyki Adwokackiej (§ 42) przy zastępstwie dla kolegi z innej
                    miejscowości.
                  </InfoBox>
                </>
              )}

              {s === "POTWIERDZONE" && (
                <>
                  <SectionLabel icon={MapPin} className="mt-0">
                    W dniu terminu
                  </SectionLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => act("on-site", { action: "on-site" })} disabled={!!busy || !!order.naMiejscuAt}>
                      {busy === "on-site" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <MapPin className="mr-1.5 h-4 w-4" />}
                      Jestem na miejscu
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {order.naMiejscuAt ? `Zlecający wie, że jesteś na miejscu (${formatShort(order.naMiejscuAt)}).` : "Opcjonalnie. Zlecający dostanie powiadomienie."}
                    </span>
                  </div>

                  <SectionLabel icon={FileText}>Raport po czynności</SectionLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="mb-1.5 block text-[12.5px]">Przebieg</Label>
                      <Select value={przebieg} onValueChange={(v) => setPrzebieg(v as PrzebiegKey)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRZEBIEG_RAPORTU.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-[12.5px]">Kolejny termin</Label>
                      <Input type="datetime-local" value={nextTerm} onChange={(e) => setNextTerm(e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label className="mb-1.5 block text-[12.5px]">
                      Notatka dla zlecającego <span className="text-error">*</span>
                    </Label>
                    <Textarea
                      rows={4}
                      maxLength={4000}
                      placeholder="Co się wydarzyło, jakie wnioski złożyłeś, co trzeba zrobić dalej."
                      value={note}
                      onChange={(e) => {
                        setNote(e.target.value)
                        setNoteError(false)
                      }}
                      className={cn(noteError && "border-error")}
                    />
                  </div>
                  <div className="mt-3">
                    <FileDropzone
                      compact
                      rodzaj="RAPORT"
                      ensureOrderId={async () => order.id}
                      onUploaded={(file) => setFiles((list) => [...list, file])}
                      label="Dodaj zdjęcie protokołu albo notatkę (opcjonalnie)"
                      hint=""
                    />
                  </div>
                  <div className="mt-3.5 flex flex-wrap justify-end gap-2">
                    <Button variant="ghost" className="text-error hover:text-error" onClick={() => setResignOpen(true)}>
                      Rezygnuję
                    </Button>
                    <Button onClick={sendReport} disabled={!!busy}>
                      {busy === "report" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CircleCheck className="mr-1.5 h-4 w-4" />}
                      Oznacz jako wykonane
                    </Button>
                  </div>
                </>
              )}

              {(s === "WYKONANE" || s === "ZAMKNIETE") && (
                <>
                  <InfoBox variant="success" icon={CircleCheck}>
                    {s === "WYKONANE" ? (
                      <>
                        <b>Raport wysłany.</b> Zlecający ma {AUTO_CLOSE_HOURS} godzin na potwierdzenie. Potem zamkniemy zlecenie automatycznie i
                        trafi ono do Twoich rozliczeń.
                      </>
                    ) : (
                      <>
                        <b>Zlecenie zamknięte{order.zamknietoAt ? ` ${formatShort(order.zamknietoAt)}` : ""}.</b> Jest w Twoich rozliczeniach —
                        rozliczacie się bezpośrednio.
                      </>
                    )}
                  </InfoBox>
                  {order.raport && (
                    <div className="mt-3.5">
                      <DefinitionList
                        items={[
                          ["Przebieg", przebiegLabel(order.raport.przebieg)],
                          ["Kolejny termin", order.raport.kolejnyTermin ? formatTermin(order.raport.kolejnyTermin, true, false) : null],
                        ]}
                      />
                      {order.raport.notatka && (
                        <div className="mt-2.5 whitespace-pre-line rounded-lg border-l-[3px] border-primary bg-background/40 px-3 py-2.5 text-[13.5px] text-foreground/80">
                          {order.raport.notatka}
                        </div>
                      )}
                    </div>
                  )}
                  {s === "ZAMKNIETE" && order.ocena != null && (
                    <div className="mt-3.5 flex items-center gap-2 text-[13px] text-muted-foreground">
                      <Star className="h-4 w-4 text-secondary" />
                      Ocena zlecającego:
                      <StarRating value={order.ocena} />
                    </div>
                  )}
                </>
              )}

              {s === "ANULOWANE" && (
                <InfoBox variant="warn">
                  Zlecający anulował zlecenie{order.anulowanoAt ? ` ${formatShort(order.anulowanoAt)}` : ""}. Powód: {order.powodAnulowania}. Nie musisz
                  stawiać się na czynności. Dane sprawy nie są już dostępne.
                </InfoBox>
              )}

              {s !== "ANULOWANE" && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {owner.kontakt.email && (
                    <Button asChild variant="ghost" size="sm">
                      <a href={`mailto:${owner.kontakt.email}?subject=${encodeURIComponent(`Zastępstwo ${order.numer ?? ""}`)}`}>
                        <Mail className="mr-1.5 h-3.5 w-3.5" />
                        Napisz do zlecającego
                      </a>
                    </Button>
                  )}
                  {order.termin && !order.terminDoUstalenia && (
                    <Button variant="ghost" size="sm" onClick={() => downloadIcs(order)}>
                      <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                      Dodaj do kalendarza
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Dialog open={resignOpen} onOpenChange={setResignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zrezygnować z zastępstwa {order.numer}?</DialogTitle>
            <DialogDescription>
              Zlecenie wróci na giełdę, a zlecający dostanie informację{lateResign ? " mailem i SMS-em" : ""}.
            </DialogDescription>
          </DialogHeader>
          {lateResign && (
            <InfoBox variant="warn">
              Do terminu ({start ? formatShort(start) : term}) zostało mniej niż {LATE_RESIGNATION_HOURS} godziny. Rezygnacja zostanie w Twojej
              statystyce widocznej dla zlecających.
            </InfoBox>
          )}
          <div>
            <Label className="mb-1.5 block text-[12.5px]">Powód (opcjonalnie)</Label>
            <Textarea rows={3} maxLength={500} value={resignReason} onChange={(e) => setResignReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResignOpen(false)}>
              Wróć
            </Button>
            <Button
              variant="destructive"
              disabled={!!busy}
              onClick={async () => {
                const ok = await act("resign", { action: "resign", powod: resignReason.trim() || null })
                if (ok) setResignOpen(false)
              }}
            >
              {busy === "resign" && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Rezygnuję
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
