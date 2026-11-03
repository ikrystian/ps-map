"use client"

import { Button } from "@/components/ui/button"
import { zl } from "@/lib/substitutions/client"
import type { OfferDTO, PersonCardDTO } from "@/lib/substitutions/types"
import { cn } from "@/lib/utils"
import { Check, Mail, Star, UserRound } from "lucide-react"
import { useState } from "react"
import { Avatar, Pill, PersonMeta } from "./ui"

/** Karta zgłoszenia w szczegółach zlecenia (jak „.oferta” w makiecie). */
export function OfferCard({
  offer,
  state,
  onChoose,
}: {
  offer: Pick<OfferDTO, "stawka" | "fakturaVat" | "notatka" | "email"> & { osoba: PersonCardDTO }
  state?: "wybrana" | "zgaszona"
  onChoose?: () => void
}) {
  const person = offer.osoba
  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        state === "wybrana" ? "border-primary bg-primary/10" : "border-border/40 bg-background/30",
        state === "zgaszona" && "opacity-45"
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <Avatar inicjaly={person.inicjaly} kolor={person.kolor} />
        <div className="min-w-[200px] flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <b className="text-[15px]">{person.nazwa}</b>
            {person.rola === "APLIKANT" && (
              <Pill className="border border-border/70 text-foreground/80">upoważnienie, nie substytucja</Pill>
            )}
          </div>
          <div className="mt-1">
            <PersonMeta osoba={person} />
          </div>
        </div>
        <div className="text-right">
          <b className="text-xl tabular-nums">{zl(offer.stawka)}</b>
          <div className="text-xs text-muted-foreground">netto{offer.fakturaVat ? ", faktura VAT" : ", bez faktury"}</div>
        </div>
      </div>
      {offer.notatka && (
        <div className="mt-3 rounded-lg border-l-[3px] border-border bg-background/40 px-3 py-2.5 text-[13.5px] text-foreground/80">
          {offer.notatka}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        {state === "wybrana" && (
          <Pill className="mr-auto bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
            Wybrany
          </Pill>
        )}
        <Button asChild variant="ghost" size="sm">
          <a href={`/ekspert/${person.slug}`} target="_blank" rel="noopener noreferrer">
            <UserRound className="mr-1.5 h-3.5 w-3.5" />
            Profil
          </a>
        </Button>
        {offer.email && (
          <Button asChild variant="ghost" size="sm">
            <a href={`mailto:${offer.email}`}>
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              Napisz
            </a>
          </Button>
        )}
        {onChoose && (
          <Button size="sm" onClick={onChoose}>
            Wybieram
          </Button>
        )}
      </div>
    </div>
  )
}

/** Ocena 1–5 gwiazdkami. */
export function StarRating({ value, onChange, disabled }: { value: number; onChange?: (v: number) => void; disabled?: boolean }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} na 5`}
          disabled={disabled || !onChange}
          onMouseEnter={() => onChange && setHover(n)}
          onClick={() => onChange?.(n)}
          className={cn("p-0.5", n <= shown ? "text-secondary" : "text-border", (disabled || !onChange) && "cursor-default")}
        >
          <Star className={cn("h-6 w-6", n <= shown && "fill-current")} />
        </button>
      ))}
    </div>
  )
}
