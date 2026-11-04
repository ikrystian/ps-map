import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CircleCheck, CircleX, Clock } from "lucide-react"
import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { formatCurrency, plural } from "@shared/format"
import { Screen } from "@/components/Screen"
import { Button, Card, ErrorState, ListSkeleton, PageHeader, cn } from "@/components/ui"
import { api } from "@/lib/api"
import { PAYMENT_METHOD_LABEL } from "@/lib/labels"
import { haptic, onReturnToApp } from "@/lib/native"
import type { Order } from "@/lib/types"

const POLL_INTERVAL = 4 * 1000

export function OrderStatusPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["orders", "detail", id],
    queryFn: () => api<{ order?: Order } & Order>(`/api/orders/${id}`),
    // Płatność potwierdza webhook operatora, więc czekamy na zmianę statusu po stronie API
    refetchInterval: (query) => {
      const order = query.state.data
      return (order?.order ?? order)?.statusPlatnosci === "OCZEKUJE" ? POLL_INTERVAL : false
    },
  })

  useEffect(() => onReturnToApp(() => void refetch()), [refetch])

  const order = data?.order ?? data
  const status = order?.statusPlatnosci

  useEffect(() => {
    if (status !== "ZAPLACONE") return
    haptic("success")
    void queryClient.invalidateQueries({ queryKey: ["law-firm"] })
    void queryClient.invalidateQueries({ queryKey: ["point-transactions"] })
    void queryClient.invalidateQueries({ queryKey: ["orders"] })
  }, [status, queryClient])

  return (
    <Screen
      header={<PageHeader title="Status zamówienia" back="/konto/punkty" />}
      footer={
        order ? (
          <Button className="w-full" onClick={() => navigate("/konto/punkty", { replace: true })}>
            Wróć do punktów
          </Button>
        ) : undefined
      }
    >
      {isPending ? (
        <ListSkeleton rows={1} />
      ) : !order ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <Card className="flex flex-col items-center gap-2 py-9 text-center">
          <span
            className={cn(
              "mb-1 flex size-20 items-center justify-center rounded-full",
              status === "ZAPLACONE" ? "bg-success/15" : status === "OCZEKUJE" ? "bg-warning/15" : "bg-destructive/15"
            )}
          >
            {status === "ZAPLACONE" ? (
              <CircleCheck className="size-11 text-success" aria-hidden />
            ) : status === "OCZEKUJE" ? (
              <Clock className="size-11 animate-pulse text-warning" aria-hidden />
            ) : (
              <CircleX className="size-11 text-destructive" aria-hidden />
            )}
          </span>
          {status === "ZAPLACONE" ? (
            <>
              <h2 className="font-serif text-xl font-semibold">Płatność zakończona</h2>
              {order.liczbaPunktow ? (
                <p className="text-sm text-muted-foreground">
                  Na Twoje konto {plural(order.liczbaPunktow, "trafił", "trafiły", "trafiło")} {order.liczbaPunktow}{" "}
                  {plural(order.liczbaPunktow, "punkt", "punkty", "punktów")}.
                </p>
              ) : null}
            </>
          ) : status === "OCZEKUJE" ? (
            <>
              <h2 className="font-serif text-xl font-semibold">Oczekujemy na płatność</h2>
              <p className="text-sm text-muted-foreground">
                {order.metodaPlatnosci === "PRZELEW"
                  ? "Punkty zostaną przyznane po zaksięgowaniu przelewu."
                  : "Dokończ płatność w otwartym oknie. Status odświeży się automatycznie."}
              </p>
            </>
          ) : (
            <>
              <h2 className="font-serif text-xl font-semibold">Płatność nie powiodła się</h2>
              <p className="text-sm text-muted-foreground">Zamówienie zostało anulowane lub zwrócone.</p>
            </>
          )}
          <p className="mt-2 text-sm font-medium">
            {formatCurrency(order.kwota)} · {PAYMENT_METHOD_LABEL[order.metodaPlatnosci] ?? order.metodaPlatnosci}
          </p>
        </Card>
      )}
    </Screen>
  )
}
