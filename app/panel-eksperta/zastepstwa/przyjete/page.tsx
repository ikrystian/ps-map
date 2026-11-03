"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { AcceptedOrderCard } from "@/components/zastepstwa/AcceptedOrderCard"
import { EmptyState, InfoBox, LoadingState, Panel } from "@/components/zastepstwa/ui"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { apiFetch, errorMessage, PANEL } from "@/lib/substitutions/client"
import type { AcceptedOrderDTO } from "@/lib/substitutions/types"
import { CircleCheck, Lock } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useState } from "react"

const ACTIVE = ["PRZYDZIELONE", "POTWIERDZONE", "WYKONANE"]

function AcceptedPage() {
  const linkedId = useSearchParams().get("zlecenie")
  const [orders, setOrders] = useState<AcceptedOrderDTO[] | null>(null)

  const load = useCallback(async () => {
    try {
      setOrders((await apiFetch<{ zlecenia: AcceptedOrderDTO[] }>("/api/substitutions/accepted")).zlecenia)
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

  // Link z powiadomienia — przewiń do zlecenia
  useEffect(() => {
    if (!linkedId || !orders) return
    const timer = setTimeout(() => document.getElementById(`zlecenie-${linkedId}`)?.scrollIntoView({ behavior: "smooth" }), 150)
    return () => clearTimeout(timer)
  }, [linkedId, orders])

  if (!orders) return <LoadingState text="Wczytywanie przyjętych zastępstw..." />

  const firstActive = orders.find((o) => ACTIVE.includes(o.status))?.id

  return (
    <div className="relative space-y-5">
      <PageHeader title="Przyjęte przeze mnie" subtitle="Zastępstwa, w których to Ty jesteś zastępcą" />

      {orders.length === 0 ? (
        <Panel>
          <EmptyState
            icon={CircleCheck}
            title="Nie masz jeszcze przyjętych zastępstw"
            action={
              <Button asChild size="sm">
                <Link href={PANEL}>Przejdź do giełdy</Link>
              </Button>
            }
          >
            Gdy zlecający wybierze Twoją ofertę, zobaczysz tu termin, dane sprawy i dokumenty.
          </EmptyState>
        </Panel>
      ) : (
        orders.map((order) => (
          <AcceptedOrderCard
            key={order.id}
            order={order}
            defaultOpen={linkedId ? linkedId === order.id : order.id === firstActive}
            highlighted={linkedId === order.id}
            onChanged={load}
          />
        ))
      )}

      <InfoBox variant="lock" icon={Lock}>
        Sygnaturę, dane stron, instrukcję i pliki widzisz od wyboru do zamknięcia zlecenia. Po anulowaniu przestają być dostępne,
        a pliki usuwamy 30 dni po zamknięciu.
      </InfoBox>
    </div>
  )
}

export default function AcceptedPageWrapper() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AcceptedPage />
    </Suspense>
  )
}
