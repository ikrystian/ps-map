import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Landmark, Smartphone, type LucideIcon } from "lucide-react"
import { useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { formatCurrency } from "@shared/format"
import { Screen } from "@/components/Screen"
import { useToast } from "@/components/toast"
import { Button, Card, EmptyState, PageHeader, Section, Skeleton, cn } from "@/components/ui"
import { API_URL, api } from "@/lib/api"
import { openExternal } from "@/lib/native"
import { useLawFirm, usePublicSettings } from "@/lib/queries"
import type { Order, PublicSettings } from "@/lib/types"

export interface PendingOrder {
  pakietPunktow: string
  pakietLabel: string
  liczbaPunktow: number
  punktyGratis: number
  kwota: number
}

type PaymentMethod = "PRZELEWY24" | "TPAY" | "PAYU" | "PRZELEW" | "TEST"

const PAYMENT_METHODS: { value: PaymentMethod; setting: string; label: string; hint: string; icon: LucideIcon }[] = [
  { value: "PRZELEWY24", setting: "enablePaymentPrzelewy24", label: "Przelewy24", hint: "Przelew, BLIK, karty", icon: Smartphone },
  { value: "TPAY", setting: "enablePaymentTpay", label: "Tpay", hint: "Szybka płatność online", icon: Smartphone },
  { value: "PAYU", setting: "enablePaymentPayU", label: "PayU", hint: "Szybka płatność online", icon: Smartphone },
  { value: "PRZELEW", setting: "enablePaymentPrzelew", label: "Przelew tradycyjny", hint: "Punkty po zaksięgowaniu przelewu", icon: Landmark },
  { value: "TEST", setting: "enablePaymentTest", label: "Płatność testowa", hint: "Tylko środowiska testowe", icon: Smartphone },
]

const ONLINE_INIT_ENDPOINT: Partial<Record<PaymentMethod, string>> = {
  PRZELEWY24: "/api/payments/przelewy24/init",
  TPAY: "/api/payments/tpay/init",
  PAYU: "/api/payments/payu/order",
}

function enabledMethods(settings: PublicSettings) {
  return PAYMENT_METHODS.filter((method) => settings[method.setting] !== "false")
}

export function CheckoutPage() {
  const { state } = useLocation()
  const order = state as PendingOrder | null
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data: lawFirm } = useLawFirm()
  const { data: settings } = usePublicSettings()
  const [selected, setSelected] = useState<PaymentMethod | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Przed wczytaniem ustawień nie wolno pokazać metod wyłączonych przez administratora
  const methods = settings ? enabledMethods(settings) : null
  const method = selected ?? methods?.[0]?.value ?? null

  const submit = useMutation({
    mutationFn: async () => {
      const created = await api<Order>("/api/orders", {
        method: "POST",
        body: { ...order, metodaPlatnosci: method },
      })
      const endpoint = method && ONLINE_INIT_ENDPOINT[method]
      if (endpoint) {
        const { redirectUrl } = await api<{ redirectUrl?: string }>(endpoint, {
          method: "POST",
          body: { orderId: created.id, mobile: true },
        })
        if (!redirectUrl) throw new Error("Brak adresu przekierowania do płatności")
        await openExternal(redirectUrl)
      }
      return created
    },
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] })
      navigate(`/konto/zamowienie/${created.id}`, { replace: true })
    },
    onError: toast.error,
  })

  if (!order) return <Navigate to="/konto/punkty" replace />

  return (
    <Screen
      refreshable={false}
      header={<PageHeader title="Finalizacja zamówienia" back="/konto/punkty" />}
      footer={
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Do zapłaty</p>
            <p className="truncate text-lg font-semibold leading-tight">{formatCurrency(order.kwota)}</p>
          </div>
          <Button className="shrink-0 px-6" disabled={!termsAccepted || !method} loading={submit.isPending} onClick={() => submit.mutate()}>
            Zamawiam i płacę
          </Button>
        </div>
      }
    >
      <Card className="space-y-1.5 text-sm">
        <Row label="Pakiet" value={order.pakietLabel} />
        {order.punktyGratis > 0 && <Row label="W tym gratis" value={`+${order.punktyGratis} pkt`} />}
        {lawFirm && <Row label="Saldo po zakupie" value={`${lawFirm.punktySaldo + order.liczbaPunktow} pkt`} />}
      </Card>

      <Section title="Metoda płatności">
        {!methods ? (
          <div className="space-y-2">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
        ) : methods.length === 0 ? (
          <EmptyState title="Brak dostępnych metod płatności">Spróbuj ponownie później.</EmptyState>
        ) : (
          <div role="radiogroup" aria-label="Metoda płatności" className="space-y-2">
            {methods.map(({ value, label, hint, icon: Icon }) => {
              const active = method === value
              return (
                <label
                  key={value}
                  className={cn(
                    "flex min-h-16 items-center gap-3 rounded-2xl bg-card px-4 py-2.5 shadow-card transition-shadow",
                    active && "ring-[1.5px] ring-primary"
                  )}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    checked={active}
                    onChange={() => setSelected(value)}
                    className="sr-only"
                  />
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">{hint}</span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      active ? "border-primary-fill bg-primary-fill text-primary-foreground" : "border-input"
                    )}
                  >
                    {active && <Check className="size-4" strokeWidth={3} />}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </Section>

      <label className="flex items-start gap-3 px-1 text-sm">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-[var(--primary)]"
        />
        <span>
          Akceptuję{" "}
          <button type="button" className="text-primary underline" onClick={() => void openExternal(`${API_URL}/regulamin`)}>
            regulamin
          </button>{" "}
          i{" "}
          <button type="button" className="text-primary underline" onClick={() => void openExternal(`${API_URL}/polityka-prywatnosci`)}>
            politykę prywatności
          </button>
        </span>
      </label>
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
