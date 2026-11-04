import { useQuery } from "@tanstack/react-query"
import { ChevronRight, Clock, FileText, Sparkles, Wallet } from "lucide-react"
import { useDeferredValue, useMemo, useState } from "react"
import { formatBusinessDays, formatCurrency, formatDate } from "@shared/format"
import { OFFER_STATUS_LABEL, statusLabel } from "@shared/labels"
import { Screen } from "@/components/Screen"
import { Sheet } from "@/components/Sheet"
import { Badge, ButtonLink, Card, Chips, EmptyState, ErrorState, ListSkeleton, PageHeader, SearchInput, cn } from "@/components/ui"
import { api } from "@/lib/api"
import { matchesPhrase, timeAgo } from "@/lib/format"
import { PAYMENT_TERMS_LABEL, offerTone } from "@/lib/labels"
import { useStickyState } from "@/lib/sticky"
import type { Offer } from "@/lib/types"
import { CasesTabs } from "./CasesTabs"

const STATUSES = ["all", "ZLOZONA", "ZAAKCEPTOWANA", "NEGOCJACJE", "ODRZUCONA", "WYGASLA"] as const
type StatusFilter = (typeof STATUSES)[number]

export function OffersPage() {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["offers", "own"],
    queryFn: () => api<{ offers: Offer[] }>("/api/offers"),
  })
  const [status, setStatus] = useStickyState<StatusFilter>("offers.status", "all")
  const [query, setQuery] = useStickyState("offers.query", "")
  const [selected, setSelected] = useState<Offer | null>(null)
  const phrase = useDeferredValue(query)

  const offers = useMemo(
    () =>
      [...(data?.offers ?? [])].sort((a, b) => {
        const accepted = Number(b.status === "ZAAKCEPTOWANA") - Number(a.status === "ZAAKCEPTOWANA")
        return accepted || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }),
    [data]
  )

  const filtered = useMemo(
    () =>
      offers.filter(
        (offer) =>
          (status === "all" || offer.status === status) &&
          matchesPhrase(
            `${offer.case.nazwaSprawy} ${offer.opisOferty} ${offer.case.client.imie} ${offer.case.client.nazwisko}`,
            phrase
          )
      ),
    [offers, status, phrase]
  )

  return (
    <Screen
      tabRoot
      header={
        <PageHeader title="Sprawy">
          <CasesTabs />
        </PageHeader>
      }
    >
      <SearchInput label="Szukaj ofert" placeholder="Szukaj ofert…" value={query} onChange={setQuery} />

      <Chips
        label="Status oferty"
        value={status}
        onChange={setStatus}
        options={STATUSES.map((value) => ({
          value,
          label: value === "all" ? "Wszystkie" : statusLabel(OFFER_STATUS_LABEL, value),
          count: value === "all" ? offers.length : offers.filter((o) => o.status === value).length,
        }))}
      />

      {isPending ? (
        <ListSkeleton label="Wczytywanie ofert…" />
      ) : !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="Brak ofert" action={<ButtonLink to="/sprawy" variant="soft" size="sm">Przeglądaj sprawy</ButtonLink>}>
          Oferty złożone do spraw pojawią się tutaj.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {filtered.map((offer) => (
            <li key={offer.id}>
              <button type="button" onClick={() => setSelected(offer)} className="block w-full text-left">
                <Card
                  className={cn(
                    "space-y-2 transition-transform active:scale-[0.99]",
                    offer.status === "ZAAKCEPTOWANA" && "ring-[1.5px] ring-success/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone={offerTone(offer.status)}>{statusLabel(OFFER_STATUS_LABEL, offer.status)}</Badge>
                    <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">{timeAgo(offer.createdAt)}</span>
                  </div>
                  <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug">{offer.case.nazwaSprawy}</h2>
                  <p className="truncate text-xs text-muted-foreground">{offer.case.category.nazwa}</p>
                  <div className="flex items-center justify-between gap-2 border-t border-border/70 pt-2.5">
                    <p className="flex items-center gap-1.5 text-[15px] font-semibold">
                      {formatCurrency(offer.kwotaBrutto)}
                      {offer.wyroznienie && <Sparkles className="size-3.5 text-secondary" aria-label="Wyróżniona" />}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      {formatBusinessDays(offer.terminRealizacjiDni)}
                      <ChevronRight className="size-4 text-muted-foreground/70" aria-hidden />
                    </p>
                  </div>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!selected} title={selected?.case.nazwaSprawy ?? "Oferta"} onClose={() => setSelected(null)}>
        {selected && <OfferDetails offer={selected} />}
      </Sheet>
    </Screen>
  )
}

function OfferDetails({ offer }: { offer: Offer }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={offerTone(offer.status)}>{statusLabel(OFFER_STATUS_LABEL, offer.status)}</Badge>
        <span className="text-xs text-muted-foreground">Złożona {formatDate(offer.createdAt)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wallet className="size-3.5" aria-hidden />
            Brutto
          </p>
          <p className="text-[15px] font-semibold">{formatCurrency(offer.kwotaBrutto)}</p>
          <p className="text-xs text-muted-foreground">netto {formatCurrency(offer.kwotaNetto)}</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden />
            Termin
          </p>
          <p className="text-[15px] font-semibold">{formatBusinessDays(offer.terminRealizacjiDni)}</p>
          <p className="truncate text-xs text-muted-foreground">
            {PAYMENT_TERMS_LABEL[offer.warunkiPlatnosci] ?? offer.warunkiPlatnosci}
          </p>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Opis oferty</h3>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{offer.opisOferty}</p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Zakres usług</h3>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{offer.zakresUslug}</p>
      </div>
      {offer.dodatkoweWarunki && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Dodatkowe warunki</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{offer.dodatkoweWarunki}</p>
        </div>
      )}
      <ButtonLink to={`/sprawy/${offer.case.id}`} className="w-full">
        Przejdź do sprawy
      </ButtonLink>
    </>
  )
}
