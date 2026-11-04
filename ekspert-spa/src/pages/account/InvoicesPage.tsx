import { useMutation, useQuery } from "@tanstack/react-query"
import { Download, FileText } from "lucide-react"
import { formatCurrency, formatDate } from "@shared/format"
import { INVOICE_STATUS_LABEL, statusLabel } from "@shared/labels"
import { Screen } from "@/components/Screen"
import { useToast } from "@/components/toast"
import { Badge, Button, Card, EmptyState, ErrorState, ListSkeleton, PageHeader } from "@/components/ui"
import { api, apiBlob } from "@/lib/api"
import { saveFile } from "@/lib/native"
import type { Invoice } from "@/lib/types"

// Finalny PDF (z numerem KSeF i kodem QR) istnieje dopiero po przyjęciu faktury przez KSeF
const isPdfReady = (invoice: Invoice) => invoice.ksefStatus === "ACCEPTED" && !!invoice.ksefNumber

export function InvoicesPage() {
  const toast = useToast()
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => api<Invoice[]>("/api/invoices"),
  })

  const download = useMutation({
    mutationFn: async (invoice: Invoice) => {
      const blob = await apiBlob(`/api/invoices/${invoice.id}/pdf`)
      await saveFile(blob, `${invoice.invoiceNumber.replaceAll("/", "-")}.pdf`)
    },
    onError: toast.error,
  })

  return (
    <Screen header={<PageHeader title="Faktury VAT" back="/konto" />}>
      {isPending ? (
        <ListSkeleton rows={3} label="Wczytywanie faktur…" />
      ) : !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState icon={FileText} title="Brak faktur">
          Faktury za zakupy pojawią się tutaj.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {data.map((invoice) => (
            <li key={invoice.id}>
              <Card className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-[15px] font-semibold">{invoice.invoiceNumber}</p>
                  <Badge tone={invoice.status === "PAID" ? "success" : "neutral"}>
                    {statusLabel(INVOICE_STATUS_LABEL, invoice.status)}
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="min-w-0 truncate text-xs text-muted-foreground">
                    {formatDate(invoice.issueDate)} · {invoice.order.orderNumber}
                  </p>
                  <p className="shrink-0 font-semibold">{formatCurrency(invoice.grossAmount)}</p>
                </div>
                {isPdfReady(invoice) ? (
                  <Button
                    variant="soft"
                    size="sm"
                    className="w-full"
                    loading={download.isPending && download.variables?.id === invoice.id}
                    onClick={() => download.mutate(invoice)}
                  >
                    <Download className="size-4" aria-hidden />
                    Pobierz PDF
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">PDF będzie dostępny po nadaniu numeru KSeF.</p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  )
}
