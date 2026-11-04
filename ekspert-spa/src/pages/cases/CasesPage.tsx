import { useQuery } from "@tanstack/react-query"
import { Briefcase, Eye, EyeOff, Heart, MapPin, SlidersHorizontal, Wallet } from "lucide-react"
import { memo, useCallback, useDeferredValue, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { formatBudgetRange } from "@shared/format"
import { CASE_STATUS_LABEL, OFFER_STATUS_LABEL, statusLabel } from "@shared/labels"
import { Screen } from "@/components/Screen"
import { Sheet } from "@/components/Sheet"
import { useToast } from "@/components/toast"
import {
  Badge,
  Button,
  Card,
  Chips,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  ListSkeleton,
  PageHeader,
  SearchInput,
  SwipeAction,
  SwipeRow,
  cn,
  stripHtml,
} from "@/components/ui"
import { api } from "@/lib/api"
import { matchesPhrase, timeAgo } from "@/lib/format"
import { CASE_TYPE_LABEL, caseTone, offerTone } from "@/lib/labels"
import { readIdSet, writeIdSet } from "@/lib/localIdSet"
import { haptic } from "@/lib/native"
import { useCategories, usePermissions } from "@/lib/queries"
import { useStickyState } from "@/lib/sticky"
import type { CaseListItem } from "@/lib/types"
import { CasesTabs } from "./CasesTabs"

type StatusFilter = "all" | "NOWA" | "FAVORITES" | "PENDING" | "CLOSED" | "HIDDEN"
type SortOrder = "newest" | "budget"

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Najnowsze" },
  { value: "budget", label: "Najwyższy budżet" },
]

const isPending = (c: CaseListItem) =>
  c.status === "OFERTY_OTRZYMANE" ||
  c.status === "W_TRAKCIE" ||
  !!c.offers?.some((o) => o.status === "ZLOZONA" || o.status === "NEGOCJACJE")

const isClosed = (c: CaseListItem) =>
  c.status === "ZAKONCZONA" ||
  c.status === "ANULOWANA" ||
  !!c.offers?.some((o) => o.status === "ODRZUCONA" || o.status === "WYGASLA")

const budgetValue = (c: CaseListItem) => c.budzetDo ?? c.budzetOd ?? 0

export function CasesPage() {
  const toast = useToast()
  const { data, isPending: loading, error, refetch } = useQuery({
    queryKey: ["cases"],
    queryFn: () => api<CaseListItem[]>("/api/cases?includeAll=true"),
  })
  const { data: permissions } = usePermissions()
  const { data: categories } = useCategories()

  const [query, setQuery] = useStickyState("cases.query", "")
  const [status, setStatus] = useStickyState<StatusFilter>("cases.status", "all")
  const [categoryId, setCategoryId] = useStickyState("cases.category", "all")
  const [caseType, setCaseType] = useStickyState("cases.type", "all")
  const [sort, setSort] = useStickyState<SortOrder>("cases.sort", "newest")
  const [filtersOpen, setFiltersOpen] = useState(false)
  // Obserwowane i ukryte sprawy to lokalne preferencje — te same klucze co w panelu webowym
  const [favorites, setFavorites] = useState(() => readIdSet("favoriteCases"))
  const [hidden, setHidden] = useState(() => readIdSet("rejectedCases"))
  const phrase = useDeferredValue(query)

  const searchIndex = useMemo(
    () => new Map((data ?? []).map((c) => [c.id, `${c.nazwaSprawy} ${stripHtml(c.opisSprawy)} ${c.category.nazwa}`])),
    [data]
  )

  const visible = useMemo(() => {
    const cases = (data ?? []).filter((c) => !hidden.has(c.id))
    const accepted = (c: CaseListItem) => c.offers?.[0]?.status === "ZAAKCEPTOWANA"
    return cases.sort((a, b) => Number(accepted(b)) - Number(accepted(a)))
  }, [data, hidden])

  const hiddenCases = useMemo(() => (data ?? []).filter((c) => hidden.has(c.id)), [data, hidden])

  const counts = useMemo(
    () => ({
      all: visible.length,
      NOWA: visible.filter((c) => c.status === "NOWA").length,
      FAVORITES: visible.filter((c) => favorites.has(c.id)).length,
      PENDING: visible.filter(isPending).length,
      CLOSED: visible.filter(isClosed).length,
    }),
    [visible, favorites]
  )

  const matchesFilters = useCallback(
    (c: CaseListItem) => {
      if (!matchesPhrase(searchIndex.get(c.id) ?? "", phrase)) return false
      if (categoryId !== "all" && c.category.id !== categoryId && !c.categories?.some((l) => l.category.id === categoryId)) {
        return false
      }
      return caseType === "all" || c.typSprawy === caseType
    },
    [searchIndex, phrase, categoryId, caseType]
  )

  // Ostatnia ukryta sprawa wróciła, a pozycja „Ukryte” zniknęła z filtrów
  const activeStatus = status === "HIDDEN" && hiddenCases.length === 0 ? "all" : status

  const matching = useMemo(() => {
    const source = activeStatus === "HIDDEN" ? hiddenCases : visible
    const filtered = source.filter((c) => {
      if (!matchesFilters(c)) return false
      if (activeStatus === "NOWA") return c.status === "NOWA"
      if (activeStatus === "FAVORITES") return favorites.has(c.id)
      if (activeStatus === "PENDING") return isPending(c)
      if (activeStatus === "CLOSED") return isClosed(c)
      return true
    })
    return sort === "budget" ? filtered.sort((a, b) => budgetValue(b) - budgetValue(a)) : filtered
  }, [visible, hiddenCases, matchesFilters, activeStatus, favorites, sort])

  // Limit pakietu liczony jak w panelu webowym: po filtrowaniu, gdy pakiet ma ustawiony limit
  const packageActive = !!permissions?.pakietSubskrypcji &&
    (!permissions.dataPakietuDo || new Date(permissions.dataPakietuDo) > new Date())
  const limit = packageActive ? (permissions?.powiadomieniaSprawy ?? 0) : 0
  const limited = limit > 0 && matching.length > limit
  const shown = limited ? matching.slice(0, limit) : matching

  const toggleFavorite = useCallback((id: string) => {
    haptic("light")
    setFavorites((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      writeIdSet("favoriteCases", next)
      return next
    })
  }, [])

  const setCaseHidden = useCallback((id: string, value: boolean) => {
    setHidden((current) => {
      const next = new Set(current)
      if (value) next.add(id)
      else next.delete(id)
      writeIdSet("rejectedCases", next)
      return next
    })
  }, [])

  const hideCase = useCallback(
    (id: string) => {
      setCaseHidden(id, true)
      toast.success("Sprawa została ukryta z listy", { label: "Cofnij", onClick: () => setCaseHidden(id, false) })
    },
    [setCaseHidden, toast]
  )

  const restoreCase = useCallback(
    (id: string) => {
      setCaseHidden(id, false)
      toast.success("Sprawa wróciła na listę")
    },
    [setCaseHidden, toast]
  )

  const rootCategories = (categories ?? []).filter((c) => !c.parentId)
  const activeFilters = Number(categoryId !== "all") + Number(caseType !== "all") + Number(sort !== "newest")
  const clearFilters = () => {
    setCategoryId("all")
    setCaseType("all")
    setSort("newest")
  }

  return (
    <Screen
      tabRoot
      header={
        <PageHeader title="Sprawy">
          <CasesTabs />
        </PageHeader>
      }
    >
      <div className="flex gap-2">
        <SearchInput label="Szukaj spraw" placeholder="Szukaj spraw…" value={query} onChange={setQuery} />
        <button
          type="button"
          aria-label={activeFilters > 0 ? `Filtry, aktywne: ${activeFilters}` : "Filtry"}
          onClick={() => setFiltersOpen(true)}
          className={cn(
            "relative flex size-12 shrink-0 items-center justify-center rounded-xl border shadow-card transition-transform active:scale-95",
            activeFilters > 0 ? "border-transparent bg-primary-fill text-primary-foreground" : "border-border/40 bg-card text-muted-foreground"
          )}
        >
          <SlidersHorizontal className="size-5" aria-hidden />
          {activeFilters > 0 && (
            <span className="absolute -right-1 -top-1 flex size-[18px] items-center justify-center rounded-full bg-gold text-[11px] font-semibold text-[#3a2b0b]">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      <Chips
        label="Status sprawy"
        value={activeStatus}
        onChange={setStatus}
        options={[
          { value: "all", label: "Wszystkie", count: counts.all },
          { value: "NOWA", label: "Nowe", count: counts.NOWA },
          { value: "FAVORITES", label: "Obserwowane", count: counts.FAVORITES },
          { value: "PENDING", label: "Oczekujące", count: counts.PENDING },
          { value: "CLOSED", label: "Zamknięte", count: counts.CLOSED },
          ...(hiddenCases.length > 0 ? [{ value: "HIDDEN" as const, label: "Ukryte", count: hiddenCases.length }] : []),
        ]}
      />

      {loading ? (
        <ListSkeleton label="Wczytywanie spraw…" />
      ) : !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Brak spraw"
          action={
            activeFilters > 0 || query ? (
              <Button
                variant="soft"
                size="sm"
                onClick={() => {
                  clearFilters()
                  setQuery("")
                }}
              >
                Wyczyść filtry
              </Button>
            ) : undefined
          }
        >
          {activeFilters > 0 || query
            ? "Żadna sprawa nie pasuje do wybranych filtrów."
            : "Nowe sprawy z Twojego zakresu pojawią się tutaj."}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {shown.map((item) => (
            <li key={item.id}>
              <CaseCard
                item={item}
                favorite={favorites.has(item.id)}
                isHidden={activeStatus === "HIDDEN"}
                onToggleFavorite={toggleFavorite}
                onHide={hideCase}
                onRestore={restoreCase}
              />
            </li>
          ))}
        </ul>
      )}

      {limited && (
        <Card className="text-sm">
          Twój pakiet pozwala wyświetlić {limit} z {matching.length} pasujących spraw.{" "}
          <Link to="/konto/pakiet" className="font-medium text-primary">
            Zobacz wyższe pakiety
          </Link>
        </Card>
      )}

      <Sheet open={filtersOpen} title="Filtry" onClose={() => setFiltersOpen(false)}>
        <Field label="Kategoria">
          {(props) => (
            <select {...props} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="all">Wszystkie kategorie</option>
              {rootCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nazwa}
                </option>
              ))}
            </select>
          )}
        </Field>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Typ sprawy</p>
          <Chips
            wrap
            label="Typ sprawy"
            value={caseType}
            onChange={setCaseType}
            options={[
              { value: "all", label: "Wszystkie" },
              ...Object.entries(CASE_TYPE_LABEL).map(([value, label]) => ({ value, label })),
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Sortowanie</p>
          <Chips wrap label="Sortowanie" value={sort} onChange={setSort} options={SORT_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="outline" onClick={clearFilters} disabled={activeFilters === 0}>
            Wyczyść
          </Button>
          <Button onClick={() => setFiltersOpen(false)}>Pokaż ({shown.length})</Button>
        </div>
      </Sheet>
    </Screen>
  )
}

interface CaseCardProps {
  item: CaseListItem
  favorite: boolean
  isHidden: boolean
  onToggleFavorite: (id: string) => void
  onHide: (id: string) => void
  onRestore: (id: string) => void
}

// Opis to HTML klienta, a parsowanie go przy każdym znaku w wyszukiwarce byłoby odczuwalne
const CaseCard = memo(function CaseCard({ item, favorite, isHidden, onToggleFavorite, onHide, onRestore }: CaseCardProps) {
  const ownOffer = item.offers?.[0]
  const accepted = ownOffer?.status === "ZAAKCEPTOWANA"
  const description = useMemo(() => stripHtml(item.opisSprawy), [item.opisSprawy])
  const budget = item.doNegocjacji ? "Do negocjacji" : (formatBudgetRange(item.budzetOd, item.budzetDo) ?? "Budżet nieokreślony")
  const place = item.city?.nazwa ?? item.voivodeship.nazwa

  return (
    <SwipeRow
      action={
        isHidden ? (
          <SwipeAction icon={Eye} label="Przywróć" onClick={() => onRestore(item.id)} className="bg-accent text-accent-foreground" />
        ) : (
          <SwipeAction icon={EyeOff} label="Ukryj" onClick={() => onHide(item.id)} className="bg-muted text-muted-foreground" />
        )
      }
    >
      <Card flush className={cn("relative h-full", accepted && "ring-[1.5px] ring-success/50")}>
        <Link to={`/sprawy/${item.id}`} className="block rounded-2xl p-4 transition-colors active:bg-muted/50">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 pr-9">
            <Badge tone={caseTone(item.status)}>{statusLabel(CASE_STATUS_LABEL, item.status)}</Badge>
            {item.trybPilny && <Badge tone="danger">Pilne</Badge>}
            {item.zTwojegoPolecenia && <Badge tone="warning">Twoje polecenie</Badge>}
            {ownOffer && <Badge tone={offerTone(ownOffer.status)}>Oferta: {statusLabel(OFFER_STATUS_LABEL, ownOffer.status)}</Badge>}
          </div>
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug">{item.nazwaSprawy}</h2>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
          <dl className="mt-3 space-y-1 border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1.5">
                <Wallet className="size-3.5 shrink-0 text-primary" aria-hidden />
                <dt className="sr-only">Budżet</dt>
                <dd className="truncate text-[13px] font-semibold text-foreground">{budget}</dd>
              </div>
              <div className="shrink-0">
                <dt className="sr-only">Dodano</dt>
                <dd>{timeAgo(item.createdAt)}</dd>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <dt className="sr-only">Lokalizacja i kategoria</dt>
              <dd className="truncate">
                {place} · {item.category.nazwa}
              </dd>
            </div>
          </dl>
        </Link>
        <IconButton
          label={favorite ? "Usuń z obserwowanych" : "Dodaj do obserwowanych"}
          aria-pressed={favorite}
          onClick={() => onToggleFavorite(item.id)}
          className={cn("absolute right-1 top-1", favorite ? "text-secondary" : "text-muted-foreground/70")}
        >
          <Heart className={cn("size-5", favorite && "fill-current")} aria-hidden />
        </IconButton>
      </Card>
    </SwipeRow>
  )
})

