import { useQuery } from "@tanstack/react-query"
import { Check, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { formatCurrency, formatDate } from "@shared/format"
import { INVOICE_STATUS_LABEL, PAYMENT_STATUS_LABEL, statusLabel } from "@shared/labels"
import { Screen } from "@/components/Screen"
import { Badge, ButtonLink, Card, EmptyState, ErrorState, ListSkeleton, PageHeader, Section } from "@/components/ui"
import { api } from "@/lib/api"
import { paymentTone } from "@/lib/labels"
import { useLawFirm, useSubscriptionPlans } from "@/lib/queries"
import type { Invoice, Order } from "@/lib/types"
import { planFeatures } from "./PackagePage"
import { isPackageActive } from "./packageState"

export function BillingPage() {
  const { data: lawFirm, isPending, error, refetch } = useLawFirm()
  const { data: plans } = useSubscriptionPlans()
  const { data: orders } = useQuery({
    queryKey: ["orders", "recent"],
    queryFn: () => api<{ orders: Order[] }>("/api/orders?limit=5"),
  })
  const { data: invoices } = useQuery({ queryKey: ["invoices"], queryFn: () => api<Invoice[]>("/api/invoices") })

  const active = lawFirm ? isPackageActive(lawFirm) : false
  const plan = plans?.find((candidate) => candidate.typ === lawFirm?.pakietSubskrypcji)

  return (
    <Screen header={<PageHeader title="Subskrypcje i płatności" back="/konto" />}>
      {isPending ? (
        <ListSkeleton rows={3} label="Wczytywanie rozliczeń…" />
      ) : !lawFirm ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <Section title="Aktualna subskrypcja">
            <Card className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-semibold">{active ? (plan?.nazwa ?? lawFirm.pakietSubskrypcji) : "Brak pakietu"}</p>
                {active && <Badge tone="success">Aktywny</Badge>}
              </div>
              {active && lawFirm.dataPakietuDo && (
                <p className="text-sm text-muted-foreground">Ważny do {formatDate(lawFirm.dataPakietuDo)}</p>
              )}
              {active && plan && (
                <ul className="space-y-1.5 text-[13px] text-muted-foreground">
                  {planFeatures(plan).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              <ButtonLink to="/konto/pakiet" variant="soft" size="sm" className="w-full">
                {active ? "Zmień lub przedłuż pakiet" : "Wybierz pakiet"}
              </ButtonLink>
            </Card>
          </Section>

          <Section title="Ostatnie zamówienia">
            {orders?.orders.length ? (
              <Card flush className="divide-y divide-border/70">
                {orders.orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {order.orderType === "POINTS"
                          ? `${order.liczbaPunktow} punktów`
                          : (order.subscriptionPlan?.nazwa ?? "Subskrypcja")}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="shrink-0 space-y-0.5 text-right">
                      <p className="text-sm font-semibold">{formatCurrency(order.kwota)}</p>
                      <Badge tone={paymentTone(order.statusPlatnosci)}>{statusLabel(PAYMENT_STATUS_LABEL, order.statusPlatnosci)}</Badge>
                    </div>
                  </div>
                ))}
              </Card>
            ) : (
              <EmptyState title="Brak zamówień" />
            )}
          </Section>

          <Section title="Ostatnie faktury">
            {invoices?.length ? (
              <Card flush className="divide-y divide-border/70 overflow-hidden">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{invoice.invoiceNumber}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDate(invoice.issueDate)} · {statusLabel(INVOICE_STATUS_LABEL, invoice.status)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold">{formatCurrency(invoice.grossAmount)}</p>
                  </div>
                ))}
                <Link
                  to="/konto/faktury"
                  className="flex min-h-12 items-center justify-between px-4 text-sm font-medium text-primary transition-colors active:bg-muted"
                >
                  Wszystkie faktury
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              </Card>
            ) : (
              <EmptyState title="Brak faktur" />
            )}
          </Section>
        </>
      )}
    </Screen>
  )
}
