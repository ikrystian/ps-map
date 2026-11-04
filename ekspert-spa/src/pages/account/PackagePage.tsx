import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { formatDate, formatPoints } from "@shared/format"
import { parsePointsToPlnRatio, plnToPoints } from "@shared/points-pricing"
import { Screen } from "@/components/Screen"
import { ConfirmSheet } from "@/components/Sheet"
import { useToast } from "@/components/toast"
import { Badge, Button, Card, ErrorState, ListSkeleton, PageHeader, Segmented, cn } from "@/components/ui"
import { api } from "@/lib/api"
import { PLAN_ORDER } from "@/lib/labels"
import { useLawFirm, usePublicSettings, useSubscriptionPlans } from "@/lib/queries"
import type { SubscriptionPlan } from "@/lib/types"
import { isPackageActive } from "./packageState"

type Period = "1" | "6" | "12"

const PERIOD_LABEL: Record<Period, string> = { "1": "1 miesiąc", "6": "6 miesięcy", "12": "12 miesięcy" }

function planPrice(plan: SubscriptionPlan, period: Period): number {
  if (period === "1") return plan.cena1Miesiac ?? 0
  if (period === "6") return plan.cena6Miesiecy ?? 0
  return plan.cena12Miesiecy
}

function planRank(typ: string | null | undefined): number {
  if (!typ) return -1
  const type = typ.toUpperCase()
  if (type === "FREE") return 0
  const index = PLAN_ORDER.indexOf(type)
  return index === -1 ? -1 : index + 1
}

export function planFeatures(plan: SubscriptionPlan): string[] {
  return [
    plan.dostepDoSpraw === null ? "Dostęp do spraw bez limitu" : `Dostęp do spraw: ${plan.dostepDoSpraw} miesięcznie`,
    plan.kategorieSpraw === null ? "Kategorie specjalizacji bez limitu" : `Kategorie specjalizacji: ${plan.kategorieSpraw}`,
    plan.wojewodztwa != null ? `Zasięg: ${plan.wojewodztwa} woj.` : null,
    plan.miasta ? `Miasta: ${plan.miasta}` : null,
    plan.powiadomieniaSprawy ? `Powiadomienia o sprawach: ${plan.powiadomieniaSprawy} miesięcznie` : null,
    plan.punktyGratis ? `${plan.punktyGratis} punktów gratis` : null,
  ].filter((feature): feature is string => !!feature)
}

export function PackagePage() {
  const toast = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: lawFirm, isPending: firmPending, error: firmError, refetch } = useLawFirm()
  const { data: plansData, isPending: plansPending, error: plansError } = useSubscriptionPlans()
  const { data: settings } = usePublicSettings()
  const [period, setPeriod] = useState<Period>("12")
  const [selected, setSelected] = useState<SubscriptionPlan | null>(null)

  const ratio = parsePointsToPlnRatio(settings?.pointsToPlnRatio)

  const plans = useMemo(
    () =>
      [...(plansData ?? [])].sort((a, b) => {
        const rank = (plan: SubscriptionPlan) => {
          const value = planRank(plan.typ)
          return value === -1 ? 99 : value
        }
        return rank(a) - rank(b)
      }),
    [plansData]
  )

  const purchase = useMutation({
    mutationFn: (plan: SubscriptionPlan) =>
      api("/api/law-firms/me/subscribe", {
        method: "POST",
        body: { planId: plan.id, period: Number(period), metodaPlatnosci: "POINTS" },
      }),
    onSuccess: () => {
      toast.success("Pakiet został aktywowany")
      setSelected(null)
      void queryClient.invalidateQueries({ queryKey: ["law-firm"] })
      void queryClient.invalidateQueries({ queryKey: ["permissions"] })
      void queryClient.invalidateQueries({ queryKey: ["point-transactions"] })
    },
    onError: toast.error,
  })

  const error = firmError ?? plansError
  const active = lawFirm ? isPackageActive(lawFirm) : false
  const selectedCost = selected ? plnToPoints(planPrice(selected, period), ratio) : 0
  const tooFewPoints = !!lawFirm && lawFirm.punktySaldo < selectedCost

  return (
    <Screen header={<PageHeader title="Pakiet" back="/konto" />}>
      {firmPending || plansPending ? (
        <ListSkeleton rows={3} label="Wczytywanie pakietów…" />
      ) : !lawFirm || !plansData ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <div className="hero rounded-3xl p-5 shadow-card">
            <p className="eyebrow">Twój pakiet</p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold leading-tight">
              {active && <Sparkles className="size-5 shrink-0 text-secondary" aria-hidden />}
              {active ? lawFirm.pakietSubskrypcji : "Brak aktywnego pakietu"}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {active && lawFirm.dataPakietuDo ? `Aktywny do ${formatDate(lawFirm.dataPakietuDo)} · ` : ""}
              Saldo: {formatPoints(lawFirm.punktySaldo)} pkt
            </p>
          </div>

          <Segmented
            label="Okres"
            value={period}
            onChange={setPeriod}
            options={(Object.keys(PERIOD_LABEL) as Period[]).reverse().map((value) => ({
              value,
              label: PERIOD_LABEL[value],
            }))}
          />

          <ul className="space-y-3">
            {plans.map((plan) => {
              const price = planPrice(plan, period)
              const isCurrent = active && lawFirm.pakietSubskrypcji?.toUpperCase() === plan.typ.toUpperCase()
              const available = price > 0 || plan.typ === "FREE"
              const lower = active && planRank(plan.typ) < planRank(lawFirm.pakietSubskrypcji)
              return (
                <li key={plan.id}>
                  <Card className={cn("space-y-3", isCurrent && "ring-[1.5px] ring-primary")}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="font-serif text-lg font-semibold leading-snug">{plan.nazwa}</h2>
                        {isCurrent && <Badge tone="success">Aktualny</Badge>}
                      </div>
                      <p className="shrink-0 text-right text-lg font-semibold text-primary">
                        {plan.typ === "FREE" ? "Darmowy" : available ? `${plnToPoints(price, ratio)} pkt` : "—"}
                      </p>
                    </div>
                    <ul className="space-y-1.5 text-[13px] text-muted-foreground">
                      {planFeatures(plan).map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={isCurrent ? "soft" : lower ? "outline" : "primary"}
                      className="w-full"
                      disabled={!available || lower}
                      onClick={() => setSelected(plan)}
                    >
                      {isCurrent ? "Przedłuż pakiet" : lower ? "Masz wyższy pakiet" : "Wybierz pakiet"}
                    </Button>
                  </Card>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <ConfirmSheet
        open={!!selected}
        title={`Aktywować pakiet ${selected?.nazwa ?? ""}?`}
        confirmLabel={tooFewPoints ? "Doładuj punkty" : "Aktywuj"}
        loading={purchase.isPending}
        onConfirm={() => {
          if (tooFewPoints) navigate("/konto/punkty")
          else if (selected) purchase.mutate(selected)
        }}
        onClose={() => setSelected(null)}
      >
        {tooFewPoints
          ? `Masz za mało punktów: pakiet kosztuje ${selectedCost} pkt, a saldo to ${lawFirm?.punktySaldo} pkt.`
          : `Okres: ${PERIOD_LABEL[period]}. Z Twojego salda zostanie pobrane ${selectedCost} pkt.`}
      </ConfirmSheet>
    </Screen>
  )
}
