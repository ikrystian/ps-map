"use client"

import { Button } from "@/components/ui/button"
import { zl } from "@/lib/substitutions/client"
import { SELECTION_MODE_LABELS } from "@/lib/substitutions/constants"
import { formatTermin, formatWeekday } from "@/lib/substitutions/time"
import type { MarketOrderDTO } from "@/lib/substitutions/types"
import { formatOffersCount } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Check, Eye } from "lucide-react"
import { IdBadge, Pill, PlaceIcon, RemotePill, UrgentPill, WhoTags } from "./ui"

/** Siatka kolumn giełdy — wspólna dla nagłówka i wierszy (jak w makiecie). */
export const MARKET_GRID =
  "xl:grid xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.5fr)_minmax(0,.9fr)_minmax(0,.7fr)_minmax(0,.95fr)_minmax(0,.65fr)_150px] xl:gap-4 xl:items-center"

export function MarketHeader() {
  return (
    <div className={cn("hidden border-b border-border/40 px-3.5 py-2.5 text-[13px] font-semibold text-muted-foreground", MARKET_GRID)}>
      <div>ID / Czynność</div>
      <div>Miejsce</div>
      <div>Termin</div>
      <div>Kogo szuka</div>
      <div>Wynagrodzenie</div>
      <div>Oferty</div>
      <div className="text-right">Akcje</div>
    </div>
  )
}

function Cell({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("min-w-0 break-words", className)}>
      <div className="mb-0.5 text-[11px] uppercase tracking-wider text-muted-foreground xl:hidden">{label}</div>
      {children}
    </div>
  )
}

export function MarketRow({ order, onOpen }: { order: MarketOrderDTO; onOpen: () => void }) {
  const mine = order.mojaOferta && order.mojaOferta.status === "OCZEKUJE"
  const term = order.termin && !order.terminDoUstalenia

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      className={cn(
        "grid cursor-pointer grid-cols-2 gap-x-3.5 gap-y-2.5 border-b border-border/30 px-1 py-4 text-[13.5px] transition-colors last:border-b-0 hover:bg-foreground/[0.03] sm:px-3.5",
        MARKET_GRID
      )}
    >
      <div className="col-span-2 min-w-0 xl:col-span-1">
        <div className="mb-1.5 break-words text-[14.5px] font-semibold text-foreground">{order.tytul}</div>
        <div className="flex flex-wrap items-center gap-1.5">
          <IdBadge numer={order.numer} />
          {order.pilne && <UrgentPill />}
          {order.typMiejsca === "ZDALNIE" && <RemotePill />}
          {mine && (
            <Pill className="bg-primary text-primary-foreground">
              <Check className="h-3 w-3" />
              Twoja oferta
            </Pill>
          )}
        </div>
      </div>

      <div className="col-span-2 flex min-w-0 items-start gap-2.5 xl:col-span-1">
        <PlaceIcon typ={order.typMiejsca} className="mt-0.5 flex-none text-muted-foreground" />
        <div className="min-w-0">
          <div className="font-medium text-foreground">{order.miejsce}</div>
          <div className="text-xs text-muted-foreground">
            {[order.wydzial, order.typMiejsca === "ZDALNIE" ? "cała Polska" : order.wojewodztwo].filter(Boolean).join(" · ")}
          </div>
        </div>
      </div>

      <Cell label="Termin">
        <div className="font-medium tabular-nums text-foreground">
          {term ? formatTermin(order.termin, order.terminMaGodzine, false, { weekday: false }) : "Do ustalenia"}
        </div>
        <div className="text-xs text-muted-foreground">{term ? formatWeekday(order.termin!) : "termin do ustalenia"}</div>
      </Cell>

      <Cell label="Kogo szuka">
        <WhoTags flags={order} />
      </Cell>

      <Cell label="Wynagrodzenie">
        <div className="font-medium text-foreground">{order.stawka ? `${zl(order.stawka)} netto` : "Czekam na propozycje"}</div>
        <div className="text-xs text-muted-foreground">{order.fakturaVat ? "faktura VAT" : "bez faktury"}</div>
      </Cell>

      <Cell label="Oferty">
        <div className="text-foreground">{formatOffersCount(order.liczbaOfert)}</div>
        <div className="text-xs text-muted-foreground">{SELECTION_MODE_LABELS[order.trybWyboru].short}</div>
      </Cell>

      <div className="col-span-2 flex items-center justify-end gap-1.5 xl:col-span-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 max-xl:hidden"
          title="Szczegóły"
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={mine ? "outline" : "default"}
          className="max-xl:flex-1"
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
        >
          {mine ? "Zobacz ofertę" : order.trybWyboru === "PIERWSZY" ? "Przyjmuję" : "Zgłoś się"}
        </Button>
      </div>
    </div>
  )
}
