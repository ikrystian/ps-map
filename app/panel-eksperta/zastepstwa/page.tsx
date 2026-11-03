"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { useSubstitutionAccess } from "@/components/zastepstwa/access-context"
import { DirectRequestBanner, type RequestAnswer } from "@/components/zastepstwa/DirectRequestBanner"
import { MarketDrawer } from "@/components/zastepstwa/MarketDrawer"
import { MarketHeader, MarketRow } from "@/components/zastepstwa/MarketRow"
import { EmptyState, InfoBox, LoadingState, Panel, PanelTitle, StatCard, ToggleChip } from "@/components/zastepstwa/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { apiFetch, errorMessage, PANEL } from "@/lib/substitutions/client"
import { CZYNNOSCI, czynnoscLabel, dziedzinaLabel, foldText } from "@/lib/substitutions/constants"
import { daysUntil, formatDay } from "@/lib/substitutions/time"
import type { DirectRequestDTO, MarketOrderDTO, MarketResponse } from "@/lib/substitutions/types"
import { plural } from "@/lib/format"
import { Coins, List, Monitor, Plus, Search, SlidersHorizontal, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useMemo, useState } from "react"

type ChipKey = "pasujace" | "zdalnie" | "pilne" | "stawka"

const ALL = "all"
const selectClass = "h-11 rounded-xl border-border/50 bg-background/50"

function orders(n: number) {
  return plural(n, "zlecenie", "zlecenia", "zleceń")
}

function MarketPage() {
  const { access } = useSubstitutionAccess()
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkedId = searchParams.get("zlecenie")

  const [data, setData] = useState<MarketResponse | null>(null)
  const [answered, setAnswered] = useState<{ request: DirectRequestDTO; answer: RequestAnswer }[]>([])
  const [query, setQuery] = useState("")
  const [voivodeship, setVoivodeship] = useState(ALL)
  const [activity, setActivity] = useState(ALL)
  const [within, setWithin] = useState(ALL)
  const [chips, setChips] = useState<Set<ChipKey>>(new Set())
  const [sort, setSort] = useState<"termin" | "nowe">("termin")
  const [selected, setSelected] = useState<MarketOrderDTO | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const market = await apiFetch<MarketResponse>("/api/substitutions/market")
      setData(market)
      // Otwarta szuflada pokazuje świeże dane (np. po wysłaniu oferty)
      setSelected((current) => (current ? market.zlecenia.find((z) => z.id === current.id) ?? current : current))
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

  // Link z powiadomienia: /panel-eksperta/zastepstwa?zlecenie=<id>
  useEffect(() => {
    if (!linkedId || !data) return
    const fromList = data.zlecenia.find((z) => z.id === linkedId)
    const open = async () => {
      if (fromList) {
        setSelected(fromList)
        setDrawerOpen(true)
        return
      }
      try {
        const view = await apiFetch<{ widok: string; zlecenie: MarketOrderDTO }>(`/api/substitutions/${linkedId}`)
        if (view.widok === "market") {
          setSelected(view.zlecenie)
          setDrawerOpen(true)
        } else if (view.widok === "owner") {
          router.replace(`${PANEL}/moje/${linkedId}`)
        } else if (view.widok === "substitute") {
          router.replace(`${PANEL}/przyjete?zlecenie=${linkedId}`)
        }
      } catch (e) {
        toast.error(errorMessage(e))
      }
    }
    open()
  }, [linkedId, data, router])

  const toggleChip = (key: ChipKey) =>
    setChips((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const filtered = useMemo(() => {
    if (!data) return []
    const needle = foldText(query.trim())
    const list = data.zlecenia.filter((z) => {
      if (needle) {
        const haystack = foldText(
          [z.tytul, z.miejsce, z.miasto, z.wydzial, czynnoscLabel(z.czynnosc), dziedzinaLabel(z.dziedzina)].filter(Boolean).join(" ")
        )
        if (!haystack.includes(needle)) return false
      }
      if (voivodeship !== ALL && z.wojewodztwo !== voivodeship) return false
      if (activity !== ALL && z.czynnosc !== activity) return false
      if (within !== ALL && !(z.termin && !z.terminDoUstalenia && daysUntil(z.termin) <= Number(within))) return false
      if (chips.has("pasujace") && !z.pasuje) return false
      if (chips.has("zdalnie") && z.typMiejsca !== "ZDALNIE") return false
      if (chips.has("pilne") && !z.pilne) return false
      if (chips.has("stawka") && !z.stawka) return false
      return true
    })
    return list.sort((a, b) => {
      if (sort === "nowe") return (b.opublikowanoAt ?? "").localeCompare(a.opublikowanoAt ?? "")
      if (a.pilne !== b.pilne) return a.pilne ? -1 : 1
      return (a.termin ?? "9999").localeCompare(b.termin ?? "9999")
    })
  }, [data, query, voivodeship, activity, within, chips, sort])

  if (!data) return <LoadingState text="Wczytywanie giełdy..." />

  const activities = CZYNNOSCI.filter((c) => data.zlecenia.some((z) => z.czynnosc === c.value))
  const pendingRequests = data.zapytania.filter((r) => !answered.some((a) => a.request.id === r.id))
  const stats = data.statystyki

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />

      <PageHeader title="Giełda zastępstw" subtitle="Zlecenia od innych pełnomocników, dopasowane do Twoich ustawień">
        {access.mozeZlecac && (
          <Button asChild>
            <Link href={`${PANEL}/dodaj`}>
              <Plus className="mr-1.5 h-4 w-4" />
              Dodaj zlecenie
            </Link>
          </Button>
        )}
      </PageHeader>

      {[...answered.map((a) => ({ ...a, live: false })), ...pendingRequests.map((request) => ({ request, answer: undefined, live: true }))].map(
        ({ request, answer }) => (
          <DirectRequestBanner
            key={request.id}
            request={request}
            answer={answer}
            onAnswered={(value) => {
              setAnswered((list) => [...list, { request, answer: value }])
              load()
            }}
          />
        )
      )}

      {!access.mozePrzyjmowac && access.aplikantGotowyOd && (
        <InfoBox variant="warn">
          Jako aplikant zgłosisz się do zleceń od {formatDay(access.aplikantGotowyOd)} — po 6 miesiącach aplikacji. Zlecenia
          zobaczysz tylko wtedy, gdy zlecający dopuści aplikantów.
        </InfoBox>
      )}

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard label="Pasujące do Twoich ustawień" value={stats.pasujace} unit={orders(stats.pasujace)} />
        <StatCard label="Na najbliższe 3 dni" value={stats.najblizsze3Dni} unit={orders(stats.najblizsze3Dni)} />
        <StatCard label="Zdalne, z całej Polski" value={stats.zdalne} unit={orders(stats.zdalne)} />
        <StatCard label="Twoje oferty czekają na decyzję" value={stats.mojeOfertyOczekujace} />
      </div>

      <Panel>
        <PanelTitle>Filtry</PanelTitle>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,1fr))]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Szukaj po sądzie, mieście, czynności…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 rounded-xl border-border/50 bg-background/50 pl-10"
            />
          </div>
          <Select value={voivodeship} onValueChange={setVoivodeship}>
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="Województwo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Wszystkie województwa</SelectItem>
              {data.wojewodztwa.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={activity} onValueChange={setActivity}>
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="Czynność" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Wszystkie czynności</SelectItem>
              {activities.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={within} onValueChange={setWithin}>
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="Termin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Dowolny termin</SelectItem>
              <SelectItem value="3">Najbliższe 3 dni</SelectItem>
              <SelectItem value="7">Najbliższy tydzień</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <ToggleChip active={chips.has("pasujace")} onClick={() => toggleChip("pasujace")} icon={SlidersHorizontal}>
            Tylko pasujące do mnie
          </ToggleChip>
          <ToggleChip active={chips.has("zdalnie")} onClick={() => toggleChip("zdalnie")} icon={Monitor}>
            Zdalnie
          </ToggleChip>
          <ToggleChip active={chips.has("pilne")} onClick={() => toggleChip("pilne")} icon={Zap}>
            Pilne
          </ToggleChip>
          <ToggleChip active={chips.has("stawka")} onClick={() => toggleChip("stawka")} icon={Coins}>
            Z podaną stawką
          </ToggleChip>
          <span className="w-full text-xs text-muted-foreground lg:ml-auto lg:w-auto">
            {data.ustawienia.opis}{" "}
            <Link href={`${PANEL}/ustawienia`} className="font-medium text-primary hover:underline">
              Zmień
            </Link>
          </span>
        </div>
        {!data.ustawienia.zapisane && (
          <InfoBox className="mt-3.5">
            Ustaw miasto, promień dojazdu i rodzaje czynności — wtedy powiadomimy Cię tylko o zleceniach, które Ci pasują.
          </InfoBox>
        )}
      </Panel>

      <Panel className="pb-2">
        <PanelTitle
          right={
            <Select value={sort} onValueChange={(v) => setSort(v as "termin" | "nowe")}>
              <SelectTrigger className="h-9 w-auto rounded-xl border-border/50 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="termin">Najbliższy termin</SelectItem>
                <SelectItem value="nowe">Najnowsze</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          Zlecenia ({filtered.length})
        </PanelTitle>
        <MarketHeader />
        {filtered.length === 0 ? (
          <EmptyState icon={List} title="Brak zleceń dla tych filtrów">
            {data.zlecenia.length === 0
              ? "Na giełdzie nie ma teraz otwartych zleceń, które możesz przyjąć. Damy znać, gdy pojawi się pasujące."
              : "Zmień filtry albo wyłącz „Tylko pasujące do mnie”."}
          </EmptyState>
        ) : (
          filtered.map((order) => (
            <MarketRow
              key={order.id}
              order={order}
              onOpen={() => {
                setSelected(order)
                setDrawerOpen(true)
              }}
            />
          ))
        )}
      </Panel>

      <MarketDrawer
        order={selected}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (!open && linkedId) router.replace(PANEL)
        }}
        onChanged={load}
        canTake={access.mozePrzyjmowac}
      />
    </div>
  )
}

export default function MarketPageWrapper() {
  return (
    <Suspense fallback={<LoadingState text="Wczytywanie giełdy..." />}>
      <MarketPage />
    </Suspense>
  )
}
