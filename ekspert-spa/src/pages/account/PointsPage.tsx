import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Coins, Minus, Plus, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { formatCurrency, formatDate, formatPoints } from "@shared/format"
import { PAYMENT_STATUS_LABEL, statusLabel } from "@shared/labels"
import { getPointTransactionLabel } from "@shared/point-transaction-labels"
import {
  buildCustomPointsOrderId,
  buildPointsPricingConfig,
  calculateCustomPointsPrice,
  getPackageSavings,
  getPackageTotalPoints,
  getPricePerPoint,
  type PointPackage,
} from "@shared/points-pricing"
import { Screen } from "@/components/Screen"
import { Badge, Button, Card, EmptyState, ErrorState, Field, IconButton, PageHeader, RowsSkeleton, Section, Segmented, Skeleton, cn } from "@/components/ui"
import { api } from "@/lib/api"
import { normalizeInteger } from "@/lib/format"
import { PAYMENT_METHOD_LABEL, paymentTone } from "@/lib/labels"
import { useLawFirm, usePublicSettings } from "@/lib/queries"
import { useStickyState } from "@/lib/sticky"
import type { Order, Pagination, PointEntry } from "@/lib/types"
import type { PendingOrder } from "./CheckoutPage"

type HistoryTab = "points" | "orders"

export function PointsPage() {
  const navigate = useNavigate()
  const { data: lawFirm, error, refetch } = useLawFirm()
  const { data: settings } = usePublicSettings()
  const [customPoints, setCustomPoints] = useState("")
  const [history, setHistory] = useStickyState<HistoryTab>("points.history", "points")

  const pricing = useMemo(() => buildPointsPricingConfig(settings ?? {}), [settings])
  const packages = pricing.packages.filter((pkg) => pkg.active)
  const bestSavings = Math.max(0, ...packages.map((pkg) => getPackageSavings(pkg, pricing.ratio)))

  const customValue = parseInt(customPoints) || 0
  const customPrice = calculateCustomPointsPrice(customValue, pricing.tiers, pricing.ratio)
  const customRate = getPricePerPoint(customValue, pricing.tiers, pricing.ratio)
  const customTooLow = customValue < pricing.minCustomPoints

  const buyPackage = (pkg: PointPackage) => {
    const order: PendingOrder = {
      pakietPunktow: pkg.id,
      pakietLabel: pkg.bonusPoints > 0 ? `${pkg.points} pkt + ${pkg.bonusPoints} gratis` : `${pkg.points} punktów`,
      liczbaPunktow: getPackageTotalPoints(pkg),
      punktyGratis: pkg.bonusPoints,
      kwota: pkg.price,
    }
    navigate("/konto/zamowienie", { state: order })
  }

  const buyCustom = () => {
    const order: PendingOrder = {
      pakietPunktow: buildCustomPointsOrderId(customValue),
      pakietLabel: `${customValue} punktów`,
      liczbaPunktow: customValue,
      punktyGratis: 0,
      kwota: customPrice,
    }
    navigate("/konto/zamowienie", { state: order })
  }

  return (
    <Screen header={<PageHeader title="Punkty" back="/konto" />}>
      {lawFirm ? (
        <div className="hero relative overflow-hidden rounded-3xl p-5 shadow-card">
          <Coins aria-hidden className="absolute -bottom-6 -right-5 size-32 text-primary/10" strokeWidth={1.2} />
          <p className="eyebrow">Dostępne saldo</p>
          <p className="mt-1 text-[32px] font-semibold leading-tight">
            {formatPoints(lawFirm.punktySaldo)} <span className="text-lg font-medium text-muted-foreground">pkt</span>
          </p>
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <Skeleton className="h-[108px] rounded-3xl" />
      )}

      <Section title="Doładuj punkty">
        <ul className="grid grid-cols-2 gap-3">
          {packages.map((pkg) => {
            const savings = getPackageSavings(pkg, pricing.ratio)
            const best = savings > 0 && savings === bestSavings
            return (
              <li key={pkg.id}>
                <button
                  type="button"
                  onClick={() => buyPackage(pkg)}
                  className={cn(
                    "relative flex h-full w-full flex-col gap-0.5 rounded-2xl bg-card p-3.5 text-left shadow-card transition-transform active:scale-[0.97]",
                    best && "ring-[1.5px] ring-gold"
                  )}
                >
                  {best && (
                    <span className="absolute -top-2.5 right-3 flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold text-[#3a2b0b]">
                      <Sparkles className="size-3" aria-hidden />
                      Najkorzystniej
                    </span>
                  )}
                  <span className="truncate text-xs text-muted-foreground">{pkg.label}</span>
                  <span className="text-lg font-semibold leading-tight">{getPackageTotalPoints(pkg)} pkt</span>
                  {pkg.bonusPoints > 0 && <span className="text-xs font-medium text-success">+{pkg.bonusPoints} gratis</span>}
                  <span className="mt-auto pt-2 text-[15px] font-semibold text-primary">{formatCurrency(pkg.price)}</span>
                  {savings > 0 && <span className="text-[11px] text-muted-foreground">Oszczędzasz {formatCurrency(savings)}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </Section>

      <Card className="space-y-3">
        <Field label="Własna liczba punktów" hint={`Minimum ${pricing.minCustomPoints} pkt`}>
          {(props) => (
            <input
              {...props}
              type="text"
              inputMode="numeric"
              enterKeyHint="done"
              placeholder={String(pricing.minCustomPoints)}
              value={customPoints}
              onChange={(e) => setCustomPoints(normalizeInteger(e.target.value))}
            />
          )}
        </Field>
        {customValue > 0 && !customTooLow && (
          <p className="text-sm text-muted-foreground">
            {formatCurrency(customRate)} / pkt · razem <span className="font-semibold text-foreground">{formatCurrency(customPrice)}</span>
          </p>
        )}
        <Button variant="soft" className="w-full" disabled={customTooLow} onClick={buyCustom}>
          Kup punkty
        </Button>
      </Card>

      <Section title="Historia">
        <Segmented
          label="Historia"
          value={history}
          onChange={setHistory}
          options={[
            { value: "points", label: "Operacje na saldzie" },
            { value: "orders", label: "Zakupy punktów" },
          ]}
        />
        {history === "points" ? <PointHistory /> : <OrderHistory />}
      </Section>
    </Screen>
  )
}

function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-3">
      <IconButton label="Poprzednia strona" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="size-5" aria-hidden />
      </IconButton>
      <span className="text-[13px] tabular-nums text-muted-foreground">
        {page} / {totalPages}
      </span>
      <IconButton label="Następna strona" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <ChevronRight className="size-5" aria-hidden />
      </IconButton>
    </div>
  )
}

function PointHistory() {
  const [page, setPage] = useState(1)
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["point-transactions", page],
    queryFn: () =>
      api<{ transactions: PointEntry[]; pagination: Pagination }>(
        `/api/law-firms/me/point-transactions?page=${page}&limit=10`
      ),
    placeholderData: keepPreviousData,
  })

  if (isPending) return <RowsSkeleton rows={4} />
  if (!data) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (data.transactions.length === 0) return <EmptyState title="Brak operacji" />

  return (
    <>
      <Card flush className="divide-y divide-border/70">
        {data.transactions.map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                entry.amount >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
              )}
            >
              {entry.amount >= 0 ? <Plus className="size-4" aria-hidden /> : <Minus className="size-4" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{getPointTransactionLabel(entry.type)}</p>
              <p className="truncate text-xs text-muted-foreground">{entry.description}</p>
              <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className={cn("text-sm font-semibold", entry.amount > 0 && "text-success")}>
                {entry.amount > 0 ? "+" : ""}
                {entry.amount}
              </p>
              <p className="text-xs text-muted-foreground">saldo {entry.balanceAfter}</p>
            </div>
          </div>
        ))}
      </Card>
      <Pager page={page} totalPages={data.pagination.totalPages} onChange={setPage} />
    </>
  )
}

function OrderHistory() {
  const [page, setPage] = useState(1)
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["orders", "points", page],
    queryFn: () =>
      api<{ orders: Order[]; pagination: Pagination }>(`/api/orders?page=${page}&limit=10&orderType=POINTS`),
    placeholderData: keepPreviousData,
  })

  if (isPending) return <RowsSkeleton rows={4} />
  if (!data) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (data.orders.length === 0) return <EmptyState title="Brak zakupów" />

  return (
    <>
      <Card flush className="divide-y divide-border/70">
        {data.orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{order.liczbaPunktow} pkt</p>
              <p className="truncate text-xs text-muted-foreground">
                {PAYMENT_METHOD_LABEL[order.metodaPlatnosci] ?? order.metodaPlatnosci} · {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="shrink-0 space-y-0.5 text-right">
              <p className="text-sm font-semibold">{formatCurrency(order.kwota)}</p>
              <Badge tone={paymentTone(order.statusPlatnosci)}>{statusLabel(PAYMENT_STATUS_LABEL, order.statusPlatnosci)}</Badge>
            </div>
          </div>
        ))}
      </Card>
      <Pager page={page} totalPages={data.pagination.totalPages} onChange={setPage} />
    </>
  )
}
