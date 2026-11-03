"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { errorMessage, notifySubstitutionsChanged, PANEL, postJson, zl } from "@/lib/substitutions/client"
import { czynnoscLabel } from "@/lib/substitutions/constants"
import { formatTermin } from "@/lib/substitutions/time"
import type { DirectRequestDTO } from "@/lib/substitutions/types"
import { plural } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Check, CircleCheck, Clock, Hourglass, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Countdown, Pill } from "./ui"

export type RequestAnswer = "TAK" | "NIE"

/**
 * Zapytanie „czy możesz mnie zastąpić” od konkretnego prawnika — nad giełdą,
 * z licznikiem czasu na odpowiedź. Po odpowiedzi baner zostaje z potwierdzeniem.
 */
export function DirectRequestBanner({
  request,
  answer,
  onAnswered,
}: {
  request: DirectRequestDTO
  answer?: RequestAnswer
  onAnswered: (answer: RequestAnswer) => void
}) {
  const [busy, setBusy] = useState<RequestAnswer | null>(null)
  const term = formatTermin(request.termin, request.terminMaGodzine, request.terminDoUstalenia)

  const respond = async (decyzja: RequestAnswer) => {
    setBusy(decyzja)
    try {
      const result = await postJson(`/api/substitutions/${request.id}/actions`, { action: "respond", decyzja })
      toast.success(result.message)
      notifySubstitutionsChanged()
      onAnswered(decyzja)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  if (answer) {
    return (
      <div
        className={cn(
          "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-5",
          answer === "TAK" ? "border-primary/60 bg-primary/5" : "border-border/40 bg-card/25"
        )}
      >
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl", answer === "TAK" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
          {answer === "TAK" ? <CircleCheck className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </div>
        <div>
          <b className="text-[15px]">
            {answer === "TAK"
              ? `Potwierdzone. Zastępstwo dla: ${request.zlecajacy.nazwa}, ${term}.`
              : `Odmówiłeś. ${request.zlecajacy.nazwa} dostał(a) informację.`}
          </b>
          <p className="text-[13px] text-muted-foreground">
            {answer === "TAK" ? "Dane sprawy i dokumenty są już w „Przyjętych”." : "Zlecenie trafiło na giełdę dla innych."}
          </p>
        </div>
        {answer === "TAK" && (
          <Button asChild size="sm" variant="outline" className="col-span-2 justify-self-start sm:col-span-1">
            <Link href={`${PANEL}/przyjete?zlecenie=${request.id}`}>Przejdź</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-secondary/50 bg-gradient-to-r from-secondary/10 to-transparent to-60% p-4 sm:px-5 xl:grid-cols-[auto_minmax(0,1fr)_auto]">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary/15 text-secondary">
        <Hourglass className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Pill className="bg-secondary text-secondary-foreground">Zapytanie do Ciebie</Pill>
          <b className="text-[15px]">{request.zlecajacy.nazwa} prosi Cię o zastępstwo</b>
        </div>
        <p className="text-[13px] text-foreground/80">
          {[request.tytul, czynnoscLabel(request.czynnosc), [request.miejsce, request.wydzial].filter(Boolean).join(", "), term, `${zl(request.stawka)} netto${request.fakturaVat ? ", faktura VAT" : ""}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {request.wspolpraca > 0
            ? `Współpracowaliście już ${request.wspolpraca} ${plural(request.wspolpraca, "raz", "razy", "razy")}. `
            : ""}
          Jeśli nie odpowiesz, zlecenie po czasie trafi na giełdę.
        </p>
      </div>
      <div className="col-span-2 flex flex-wrap items-center gap-2 xl:col-span-1 xl:justify-end">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-secondary">
          <Clock className="h-3.5 w-3.5" />
          Na odpowiedź: <Countdown to={request.zapytanieWazneDo} />
        </span>
        <Button size="sm" variant="ghost" onClick={() => respond("NIE")} disabled={!!busy}>
          {busy === "NIE" && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Nie tym razem
        </Button>
        <Button size="sm" onClick={() => respond("TAK")} disabled={!!busy}>
          {busy === "TAK" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
          Jestem dostępny
        </Button>
      </div>
    </div>
  )
}
