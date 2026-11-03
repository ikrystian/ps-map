"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { CancelDialog } from "@/components/zastepstwa/CancelDialog"
import { EmptyState, IdBadge, LoadingState, Panel, PanelTitle, StatusPill, UrgentPill } from "@/components/zastepstwa/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { apiFetch, errorMessage, notifySubstitutionsChanged, PANEL, postJson } from "@/lib/substitutions/client"
import { FINAL_ORDER_STATUSES, foldText } from "@/lib/substitutions/constants"
import { formatDay, formatTermin } from "@/lib/substitutions/time"
import type { OwnerListItemDTO } from "@/lib/substitutions/types"
import { formatOffersCount } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Archive, ArchiveRestore, Eye, FolderOpen, Pencil, Plus, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

const GRID =
  "xl:grid xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)_minmax(0,.9fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.6fr)_minmax(0,.7fr)_112px] xl:gap-3 xl:items-center"

const STATUS_FILTERS = [
  { value: "all", label: "Wszystkie statusy" },
  { value: "SZKIC", label: "Szkice" },
  { value: "ZAPYTANIE", label: "Zapytanie wysłane" },
  { value: "OFERTY", label: "Są oferty" },
  { value: "OPUBLIKOWANE", label: "Czekają na oferty" },
  { value: "PRZYDZIELONE", label: "Czeka na potwierdzenie" },
  { value: "POTWIERDZONE", label: "Potwierdzone" },
  { value: "WYKONANE", label: "Do potwierdzenia wykonania" },
  { value: "ZAMKNIETE", label: "Zamknięte" },
  { value: "WYGASLO", label: "Wygasło" },
  { value: "ANULOWANE", label: "Anulowane" },
]

const EDITABLE = ["SZKIC", "ZAPYTANIE", "OPUBLIKOWANE"]
const CANCELLABLE = ["ZAPYTANIE", "OPUBLIKOWANE", "PRZYDZIELONE", "POTWIERDZONE"]

function Cell({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex min-w-0 items-center justify-between gap-3 xl:block", className)}>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground xl:hidden">{label}</span>
      <div className="min-w-0 break-words text-right xl:text-left">{children}</div>
    </div>
  )
}

export default function MyOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OwnerListItemDTO[] | null>(null)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [showArchived, setShowArchived] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<OwnerListItemDTO | null>(null)

  const load = useCallback(async () => {
    try {
      setOrders((await apiFetch<{ zlecenia: OwnerListItemDTO[] }>("/api/substitutions")).zlecenia)
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }, [])

  useEffect(() => {
    const run = async () => {
      await load()
    }
    run()
  }, [load])

  const filtered = useMemo(() => {
    const needle = foldText(query.trim())
    return (orders ?? []).filter((o) => {
      if (!showArchived && o.zarchiwizowane) return false
      if (status === "OFERTY" && !(o.status === "OPUBLIKOWANE" && o.liczbaOfert > 0)) return false
      if (status === "OPUBLIKOWANE" && !(o.status === "OPUBLIKOWANE" && o.liczbaOfert === 0)) return false
      if (!["all", "OFERTY", "OPUBLIKOWANE"].includes(status) && o.status !== status) return false
      if (needle && !foldText([o.tytul, o.miejsce, o.zastepca, o.numer].filter(Boolean).join(" ")).includes(needle)) return false
      return true
    })
  }, [orders, query, status, showArchived])

  const open = (order: OwnerListItemDTO) =>
    router.push(order.status === "SZKIC" ? `${PANEL}/dodaj?zlecenie=${order.id}` : `${PANEL}/moje/${order.id}`)

  const archive = async (order: OwnerListItemDTO) => {
    try {
      const result = await postJson(`/api/substitutions/${order.id}/actions`, { action: "archive", zarchiwizowane: !order.zarchiwizowane })
      toast.success(result.message)
      await load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const removeDraft = async (order: OwnerListItemDTO) => {
    try {
      const result = await apiFetch<{ message: string }>(`/api/substitutions/${order.id}`, { method: "DELETE" })
      toast.success(result.message)
      notifySubstitutionsChanged()
      await load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  if (!orders) return <LoadingState text="Wczytywanie zleceń..." />

  return (
    <div className="relative space-y-6">
      <PageHeader title="Moje zlecenia" subtitle="Zastępstwa, których szukasz w swoich sprawach">
        <Button asChild>
          <Link href={`${PANEL}/dodaj`}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nowe zlecenie
          </Link>
        </Button>
      </PageHeader>

      <Panel>
        <PanelTitle>Filtry</PanelTitle>
        <div className="grid gap-3.5 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Szukaj po tytule, sądzie, zastępcy…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 rounded-xl border-border/50 bg-background/50 pl-10"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11 rounded-xl border-border/50 bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11 rounded-xl" onClick={() => setShowArchived((v) => !v)}>
            <Archive className="mr-1.5 h-4 w-4" />
            {showArchived ? "Ukryj zarchiwizowane" : "Pokaż zarchiwizowane"}
          </Button>
        </div>
      </Panel>

      <Panel className="pb-2">
        <PanelTitle>Lista zleceń ({filtered.length})</PanelTitle>
        <div className={cn("hidden border-b border-border/40 px-3 py-2.5 text-[13px] font-semibold text-muted-foreground", GRID)}>
          <div>ID / Tytuł</div>
          <div>Miejsce</div>
          <div>Termin</div>
          <div>Status</div>
          <div>Zastępca</div>
          <div>Oferty</div>
          <div>Utworzone</div>
          <div className="text-right">Akcje</div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title={orders.length === 0 ? "Nie masz jeszcze zleceń" : "Brak zleceń dla tych filtrów"}
            action={
              orders.length === 0 && (
                <Button asChild size="sm">
                  <Link href={`${PANEL}/dodaj`}>Dodaj pierwsze zlecenie</Link>
                </Button>
              )
            }
          >
            {orders.length === 0 && "Opisz czynność, a powiadomimy pasujących adwokatów i radców prawnych."}
          </EmptyState>
        ) : (
          filtered.map((order) => {
            const final = FINAL_ORDER_STATUSES.includes(order.status)
            return (
              <div
                key={order.id}
                role="button"
                tabIndex={0}
                onClick={() => open(order)}
                onKeyDown={(e) => e.key === "Enter" && open(order)}
                className={cn(
                  "grid cursor-pointer gap-2 border-b border-border/30 px-1 py-4 transition-colors last:border-b-0 hover:bg-foreground/[0.03] sm:px-3",
                  GRID,
                  order.zarchiwizowane && "opacity-55"
                )}
              >
                <div>
                  <div className="mb-1.5 text-[14.5px] font-semibold">{order.tytul || "Szkic bez tytułu"}</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <IdBadge numer={order.numer} />
                    {order.pilne && <UrgentPill />}
                    {order.zarchiwizowane && <span className="text-xs text-muted-foreground">Zarchiwizowane</span>}
                  </div>
                </div>
                <Cell label="Miejsce">
                  <span className="text-[13.5px]">{order.miejsce ?? "—"}</span>
                </Cell>
                <Cell label="Termin">
                  <span className="text-[13.5px] tabular-nums">
                    {order.termin || order.terminDoUstalenia
                      ? formatTermin(order.termin, order.terminMaGodzine, order.terminDoUstalenia, { weekday: false })
                      : "—"}
                  </span>
                </Cell>
                <Cell label="Status">
                  <StatusPill status={order.status} liczbaOfert={order.ofertyOczekujace} />
                </Cell>
                <Cell label="Zastępca">
                  <span className="text-[13.5px]">
                    {order.zastepca ?? (order.zapytanieDo && order.status === "ZAPYTANIE" ? `pytamy: ${order.zapytanieDo}` : <span className="text-muted-foreground">brak</span>)}
                  </span>
                </Cell>
                <Cell label="Oferty">
                  <span className="text-[13.5px]">{formatOffersCount(order.liczbaOfert)}</span>
                </Cell>
                <Cell label="Utworzone">
                  <span className="text-[13.5px] tabular-nums">{formatDay(order.createdAt)}</span>
                </Cell>
                <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Podgląd" onClick={() => open(order)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {EDITABLE.includes(order.status) && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edytuj" asChild>
                      <Link href={`${PANEL}/dodaj?zlecenie=${order.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  {order.status === "SZKIC" && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-error/50 text-error hover:bg-error/10 hover:text-error"
                      title="Usuń szkic"
                      onClick={() => removeDraft(order)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {CANCELLABLE.includes(order.status) && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-error/50 text-error hover:bg-error/10 hover:text-error"
                      title="Anuluj"
                      onClick={() => setCancelTarget(order)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {final && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300"
                      title={order.zarchiwizowane ? "Przywróć z archiwum" : "Archiwizuj"}
                      onClick={() => archive(order)}
                    >
                      {order.zarchiwizowane ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </Panel>

      <CancelDialog
        order={cancelTarget ? { ...cancelTarget, hasSubstitute: !!cancelTarget.zastepca } : null}
        onClose={() => setCancelTarget(null)}
        onDone={() => {
          setCancelTarget(null)
          load()
        }}
      />
    </div>
  )
}
