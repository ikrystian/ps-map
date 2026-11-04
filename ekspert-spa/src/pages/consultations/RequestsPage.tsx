import { useQuery } from "@tanstack/react-query"
import { CalendarClock, ChevronRight, Phone, UsersRound, Video } from "lucide-react"
import { useDeferredValue, useMemo } from "react"
import { Link } from "react-router-dom"
import { CONSULTATION_FORM_LABELS } from "@shared/consultation-requests"
import { formatCurrency } from "@shared/format"
import { Screen } from "@/components/Screen"
import { Badge, Card, EmptyState, ErrorState, ListSkeleton, PageHeader, SearchInput } from "@/components/ui"
import { api } from "@/lib/api"
import { matchesPhrase, timeAgo } from "@/lib/format"
import { useStickyState } from "@/lib/sticky"
import type { ConsultationRequest } from "@/lib/types"
import { ConsultationsTabs } from "./ConsultationsTabs"

export function RequestsPage() {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["consultation-requests"],
    queryFn: () => api<ConsultationRequest[]>("/api/consultation-requests"),
  })
  const [query, setQuery] = useStickyState("requests.query", "")
  const phrase = useDeferredValue(query)

  const filtered = useMemo(
    () =>
      (data ?? []).filter((request) =>
        matchesPhrase(`${request.temat} ${request.opis} ${request.category?.nazwa ?? ""}`, phrase)
      ),
    [data, phrase]
  )

  return (
    <Screen
      tabRoot
      header={
        <PageHeader title="Konsultacje">
          <ConsultationsTabs />
        </PageHeader>
      }
    >
      <SearchInput label="Szukaj zapytań" placeholder="Szukaj po temacie lub dziedzinie…" value={query} onChange={setQuery} />

      {isPending ? (
        <ListSkeleton rows={3} label="Wczytywanie zapytań…" />
      ) : !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={CalendarClock} title="Brak zapytań">
          Nowe zapytania klientów o konsultacje pojawią się tutaj.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {filtered.map((request) => {
            const FormIcon = request.forma === "TELEFON" ? Phone : Video
            return (
              <li key={request.id}>
                <Link to={`/konsultacje/zapytania/${request.id}`} className="block">
                  <Card className="space-y-1.5 transition-transform active:scale-[0.99]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap gap-1.5">
                        {request.category && <Badge tone="primary">{request.category.nazwa}</Badge>}
                        {request.interests.length > 0 && <Badge tone="success">Zgłoszono</Badge>}
                      </div>
                      <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">{timeAgo(request.createdAt)}</span>
                    </div>
                    <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug">{request.temat}</h2>
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{request.opis}</p>
                    <div className="flex items-center gap-3 border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FormIcon className="size-3.5 text-primary" aria-hidden />
                        {CONSULTATION_FORM_LABELS[request.forma] ?? request.forma}
                      </span>
                      {!!request.budzetDo && <span className="font-semibold text-foreground">do {formatCurrency(request.budzetDo)}</span>}
                      <span className="ml-auto flex items-center gap-1">
                        <UsersRound className="size-3.5" aria-hidden />
                        {request.liczbaZgloszen}
                        <ChevronRight className="size-4 text-muted-foreground/70" aria-hidden />
                      </span>
                    </div>
                  </Card>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Screen>
  )
}
