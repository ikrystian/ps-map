"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/sonner"
import { apiFetch, errorMessage, notifySubstitutionsChanged, PANEL, postJson, zl } from "@/lib/substitutions/client"
import {
  KOGO_FULL,
  SELECTION_MODE_LABELS,
  czynnoscLabel,
  dziedzinaLabel,
  ktoryTerminText,
  rolaLabel,
  whoList,
} from "@/lib/substitutions/constants"
import { formatTermin } from "@/lib/substitutions/time"
import type { MarketOrderDTO } from "@/lib/substitutions/types"
import { formatOffersCount, plural } from "@/lib/format"
import { CircleCheck, Clock, Info, Loader2, Lock, Send, Check, User, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Avatar, Countdown, DefinitionList, IdBadge, InfoBox, RemotePill, SectionLabel, UrgentPill } from "./ui"

interface Props {
  order: MarketOrderDTO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Po wysłaniu/wycofaniu oferty — odśwież giełdę. */
  onChanged: () => Promise<void> | void
  /** Aplikant przed upływem 6 miesięcy aplikacji tylko ogląda. */
  canTake: boolean
}

/** Szuflada zlecenia z giełdy: szczegóły publiczne, zlecający i formularz oferty. */
export function MarketDrawer({ order, open, onOpenChange, onChanged, canTake }: Props) {
  if (!order) return null
  const term = formatTermin(order.termin, order.terminMaGodzine, order.terminDoUstalenia)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-border/40 bg-card p-0 sm:max-w-[540px] [&>button:last-child]:hidden">
        <div className="sticky top-0 z-10 border-b border-border/40 bg-card px-5 pb-3.5 pt-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <IdBadge numer={order.numer} />
            {order.pilne && <UrgentPill />}
            {order.typMiejsca === "ZDALNIE" && <RemotePill />}
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" aria-label="Zamknij">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <SheetTitle className="mt-2.5 text-lg font-semibold leading-snug">{order.tytul}</SheetTitle>
          <SheetDescription asChild>
            <div className="mt-1.5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-secondary">
              <Clock className="h-3.5 w-3.5" />
              {order.przyjmujeOferty ? (
                <>
                  Oferty przyjmowane jeszcze: <Countdown to={order.ofertyDo} />
                </>
              ) : (
                "Zlecenie nie przyjmuje już ofert"
              )}
            </div>
          </SheetDescription>
        </div>

        <div className="px-5 pb-8 pt-5 sm:px-6">
          <DefinitionList
            items={[
              ["Czynność", [czynnoscLabel(order.czynnosc), ktoryTerminText(order.ktoryTermin)].filter(Boolean).join(", ")],
              ["Miejsce", [order.miejsce, order.wydzial].filter(Boolean).join(", ")],
              ["Termin", term],
              ["Dziedzina", dziedzinaLabel(order.dziedzina)],
              ["Rola zastępcy", rolaLabel(order.rolaZastepcy)],
              ["Kogo szuka", whoList(order).map((r) => KOGO_FULL[r]).join(", ")],
              [
                "Wynagrodzenie",
                `${order.stawka ? `${zl(order.stawka)} netto` : "czeka na propozycje"}${order.fakturaVat ? ", faktura VAT" : ", bez faktury"}`,
              ],
              ["Oferty", `${formatOffersCount(order.liczbaOfert)} · ${SELECTION_MODE_LABELS[order.trybWyboru].long}`],
            ]}
          />

          {order.opis && (
            <>
              <SectionLabel icon={Info}>Opis</SectionLabel>
              <p className="whitespace-pre-line text-[13.5px] text-foreground/80">{order.opis}</p>
            </>
          )}

          <InfoBox variant="lock" icon={Lock} className="mt-4">
            Sygnaturę, dane stron i dokumenty zobaczysz, gdy zlecający Cię wybierze. Tak chronimy tajemnicę zawodową.
          </InfoBox>

          <SectionLabel icon={User}>Zlecający</SectionLabel>
          <div className="flex items-center gap-3">
            <Avatar inicjaly={order.zlecajacy.inicjaly} kolor={order.zlecajacy.kolor} />
            <div>
              <div className="font-semibold">{order.zlecajacy.nazwa}</div>
              <div className="text-xs text-muted-foreground">
                {[
                  order.zlecajacy.miasto,
                  order.zlecajacy.zweryfikowany ? "zweryfikowany" : null,
                  `${order.zlecajacy.zlecenia} ${plural(order.zlecajacy.zlecenia, "zlecenie", "zlecenia", "zleceń")}, ${order.zlecajacy.anulowane} ${plural(order.zlecajacy.anulowane, "anulowane", "anulowane", "anulowanych")}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <OfferSection key={order.id} order={order} canTake={canTake} onChanged={onChanged} onClose={() => onOpenChange(false)} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/** Formularz oferty — osobny komponent z `key` zlecenia, żeby każde zlecenie zaczynało od czystych pól. */
function OfferSection({
  order,
  canTake,
  onChanged,
  onClose,
}: {
  order: MarketOrderDTO
  canTake: boolean
  onChanged: () => Promise<void> | void
  onClose: () => void
}) {
  const [mode, setMode] = useState<"stawka" | "inna">("stawka")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [invoice, setInvoice] = useState(order.fakturaVat)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const first = order.trybWyboru === "PIERWSZY"
  const offer = order.mojaOferta

  const submit = async () => {
    const custom = !order.stawka || mode === "inna"
    const value = parseInt(amount, 10)
    if (!first && custom && !(value > 0)) {
      setError("Wpisz stawkę.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const result = await postJson(`/api/substitutions/${order.id}/offers`, {
        przyjmujeStawke: !custom,
        stawka: custom && !first ? value : null,
        notatka: note.trim() || null,
        fakturaVat: invoice,
      })
      toast.success(result.message)
      notifySubstitutionsChanged()
      await onChanged()
      if (first) onClose()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const withdraw = async () => {
    setBusy(true)
    try {
      const result = await apiFetch<{ message: string }>(`/api/substitutions/${order.id}/offers`, { method: "DELETE" })
      toast.success(result.message)
      notifySubstitutionsChanged()
      await onChanged()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {offer?.status === "OCZEKUJE" ? (
        <>
          <InfoBox variant="success" icon={CircleCheck}>
            <b>Oferta wysłana: {zl(offer.stawka)} netto</b>
            <br />
            Zlecający wybiera spośród ofert. Odpowiedź dostaniesz mailem i w panelu. Do tego czasu możesz wycofać ofertę.
          </InfoBox>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 border-error/50 text-error hover:bg-error/10 hover:text-error"
            onClick={withdraw}
            disabled={busy}
          >
            {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Wycofaj ofertę
          </Button>
        </>
      ) : offer?.status === "WYBRANA" ? (
        <InfoBox variant="success" icon={CircleCheck}>
          Zlecający wybrał Ciebie.{" "}
          <Link href={`${PANEL}/przyjete?zlecenie=${order.id}`} className="font-semibold text-primary underline-offset-2 hover:underline">
            Przejdź do „Przyjętych”
          </Link>
        </InfoBox>
      ) : offer?.status === "ODRZUCONA" ? (
        <InfoBox>Zlecenie jest obsadzone — zlecający wybrał innego zastępcę. Dziękujemy za zgłoszenie.</InfoBox>
      ) : offer?.status === "REZYGNACJA" ? (
        <InfoBox variant="warn">Zrezygnowałeś z tego zlecenia.</InfoBox>
      ) : !order.przyjmujeOferty ? (
        <InfoBox>To zlecenie nie przyjmuje już ofert.</InfoBox>
      ) : !canTake ? (
        <InfoBox variant="warn">Zgłosisz się do zleceń po 6 miesiącach aplikacji.</InfoBox>
      ) : (
        <>
          <SectionLabel icon={Send} className="mt-0">
            {first ? "Przyjęcie zlecenia" : "Twoja oferta"}
          </SectionLabel>

          {order.stawka ? (
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as "stawka" | "inna")} className="gap-2.5">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/30 p-3 has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/10">
                <RadioGroupItem value="stawka" className="mt-0.5" />
                <b className="text-[13.5px]">Przyjmuję stawkę {zl(order.stawka)} netto</b>
              </label>
              {!first && (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/30 p-3 has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/10">
                  <RadioGroupItem value="inna" className="mt-0.5" />
                  <div className="min-w-0">
                    <b className="text-[13.5px]">Proponuję inną</b>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        step={10}
                        placeholder="kwota"
                        value={amount}
                        onFocus={() => setMode("inna")}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-9 w-32"
                      />
                      <span className="whitespace-nowrap text-xs text-muted-foreground">zł netto</span>
                    </div>
                  </div>
                </label>
              )}
            </RadioGroup>
          ) : (
            <div>
              <Label htmlFor="sz-kwota" className="mb-1.5 block text-[12.5px]">
                Twoja stawka netto <span className="text-error">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="sz-kwota"
                  type="number"
                  min={1}
                  step={10}
                  placeholder="np. 250"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-36"
                />
                <span className="whitespace-nowrap text-xs text-muted-foreground">zł netto</span>
              </div>
            </div>
          )}

          <div className="mt-3.5">
            <Label htmlFor="sz-not" className="mb-1.5 block text-[12.5px]">
              Krótka notatka (opcjonalnie)
            </Label>
            <Textarea
              id="sz-not"
              rows={2}
              maxLength={1000}
              placeholder="Np. znam ten wydział, będę 30 minut wcześniej."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-[13.5px]">
            <Checkbox checked={invoice} onCheckedChange={(v) => setInvoice(v === true)} />
            Wystawię fakturę VAT
            {order.fakturaVat && <span className="text-xs text-muted-foreground">(zlecający jej wymaga)</span>}
          </label>

          {error && <p className="mt-2.5 text-[12.5px] text-error">{error}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <Button size="lg" onClick={submit} disabled={busy}>
              {busy ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : first ? (
                <Check className="mr-1.5 h-4 w-4" />
              ) : (
                <Send className="mr-1.5 h-4 w-4" />
              )}
              {first ? "Przyjmuję zlecenie" : "Wyślij ofertę"}
            </Button>
            <span className="text-xs text-muted-foreground">
              {first ? "Kto pierwszy przyjmie, ten bierze zlecenie." : "Zlecający wybiera sam spośród ofert."}
            </span>
          </div>
        </>
      )}
    </>
  )
}
