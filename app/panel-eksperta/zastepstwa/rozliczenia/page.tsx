"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { EmptyState, InfoBox, LoadingState, Panel, Pill, StatCard } from "@/components/zastepstwa/ui"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { apiFetch, errorMessage, postJson, zl } from "@/lib/substitutions/client"
import { INVOICE_STATUS_LABELS } from "@/lib/substitutions/constants"
import { formatDay } from "@/lib/substitutions/time"
import type { SettlementRowDTO, SettlementsResponse } from "@/lib/substitutions/types"
import { formatMonthYear, plural } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { SubstitutionInvoiceStatus } from "@prisma/client"
import { Download, FileText, Loader2, Wallet } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

type Tab = "wykonane" | "zlecone"

const GRID = "lg:grid lg:grid-cols-[96px_minmax(0,2fr)_minmax(0,1.2fr)_96px_170px_48px] lg:items-center lg:gap-4"

const monthLabel = (month: string) => {
  const text = formatMonthYear(`${month}-15T12:00:00Z`)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

interface InvoiceData {
  rola: "zlecajacy" | "zastepca"
  dane: { nazwa: string; nip: string | null; adres: string; email: string | null }
}

export default function SettlementsPage() {
  const [month, setMonth] = useState<string | null>(null)
  const [data, setData] = useState<SettlementsResponse | null>(null)
  const [tab, setTab] = useState<Tab>("wykonane")
  const [saving, setSaving] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<{ row: SettlementRowDTO; data: InvoiceData | null } | null>(null)

  const load = useCallback(async (target: string | null) => {
    try {
      const query = target ? `?miesiac=${target}` : ""
      setData(await apiFetch<SettlementsResponse>(`/api/substitutions/settlements${query}`))
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }, [])

  useEffect(() => {
    const run = async () => {
      await load(month)
    }
    run()
  }, [load, month])

  const setStatus = async (row: SettlementRowDTO, status: SubstitutionInvoiceStatus) => {
    setSaving(row.id)
    try {
      await postJson(`/api/substitutions/${row.id}/actions`, { action: "invoice", status })
      await load(month)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setSaving(null)
    }
  }

  const showInvoiceData = async (row: SettlementRowDTO) => {
    setInvoice({ row, data: null })
    try {
      const result = await apiFetch<InvoiceData>(`/api/substitutions/${row.id}/invoice-data`)
      setInvoice({ row, data: result })
    } catch (e) {
      toast.error(errorMessage(e))
      setInvoice(null)
    }
  }

  if (!data) return <LoadingState text="Wczytywanie rozliczeń..." />

  const rows = tab === "wykonane" ? data.wykonane : data.zlecone
  const total = rows.reduce((sum, r) => sum + r.stawka, 0)
  const monthName = formatMonthYear(`${data.miesiac}-15T12:00:00Z`)

  return (
    <div className="relative space-y-6">
      <PageHeader title="Rozliczenia" subtitle="Zestawienie do faktur. Płatności idą bezpośrednio między Wami" />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard
          label={`Wykonane: ${monthName}`}
          value={data.statystyki.wykonaneLiczba}
          unit={plural(data.statystyki.wykonaneLiczba, "zastępstwo", "zastępstwa", "zastępstw")}
        />
        <StatCard label="Do wystawienia faktury" value={data.statystyki.doWystawienia.toLocaleString("pl-PL")} unit="zł netto" />
        <StatCard label="Wystawione, czekam na wpłatę" value={data.statystyki.wystawione.toLocaleString("pl-PL")} unit="zł netto" />
        <StatCard label="Opłacone" value={data.statystyki.oplacone.toLocaleString("pl-PL")} unit="zł netto" />
      </div>

      <Panel className="pb-3">
        <div className="mb-4 flex gap-1 border-b border-border/40">
          {(
            [
              ["wykonane", "Wykonane przeze mnie"],
              ["zlecone", "Zlecone przeze mnie"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "-mb-px border-b-2 px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors",
                tab === key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Rozliczacie się bezpośrednio między sobą. To zestawienie pomaga pamiętać o fakturach.
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Select value={data.miesiac} onValueChange={(value) => setMonth(value)}>
              <SelectTrigger className="h-9 w-auto min-w-[170px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.miesiace.map((m) => (
                  <SelectItem key={m} value={m}>
                    {monthLabel(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button asChild variant="outline" size="sm" className="h-9">
              <a href={`/api/substitutions/settlements?miesiac=${data.miesiac}&format=csv&zakladka=${tab}`}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Eksport CSV
              </a>
            </Button>
          </div>
        </div>

        <div className={cn("hidden border-b border-border/40 px-2 py-2.5 text-[13px] font-semibold text-muted-foreground", GRID)}>
          <div>Data</div>
          <div>Zlecenie</div>
          <div>{tab === "wykonane" ? "Zlecający" : "Zastępca"}</div>
          <div>Stawka netto</div>
          <div>Faktura</div>
          <div className="text-right">Akcje</div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={Wallet} title={`Brak zamkniętych zleceń: ${monthName}`}>
            {tab === "wykonane"
              ? "Zastępstwa trafiają tutaj, gdy zlecający potwierdzi wykonanie (albo po 48 h od raportu)."
              : "Twoje zlecenia trafiają tutaj po zamknięciu."}
          </EmptyState>
        ) : (
          <>
            {rows.map((row) => (
              <div key={row.id} className={cn("grid gap-1.5 border-b border-border/30 px-2 py-3.5 text-[13.5px]", GRID)}>
                <div className="tabular-nums text-muted-foreground lg:text-foreground">{formatDay(row.data)}</div>
                <div className="min-w-0">
                  <div className="font-semibold">{row.tytul}</div>
                  <div className="text-xs text-muted-foreground">{[row.numer, row.miejsce].filter(Boolean).join(" · ")}</div>
                </div>
                <div>{row.osoba}</div>
                <div className="font-semibold tabular-nums">{zl(row.stawka)}</div>
                <div>
                  {tab === "wykonane" ? (
                    <div className="flex items-center gap-2">
                      <Select value={row.fakturaStatus} onValueChange={(v) => setStatus(row, v as SubstitutionInvoiceStatus)} disabled={saving === row.id}>
                        <SelectTrigger className="h-8 w-[160px] rounded-lg text-[12.5px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(INVOICE_STATUS_LABELS) as SubstitutionInvoiceStatus[]).map((key) => (
                            <SelectItem key={key} value={key}>
                              {INVOICE_STATUS_LABELS[key].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {saving === row.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                    </div>
                  ) : (
                    <Pill className={INVOICE_STATUS_LABELS[row.fakturaStatus].className}>
                      {INVOICE_STATUS_LABELS[row.fakturaStatus].ordererLabel}
                    </Pill>
                  )}
                </div>
                <div className="flex lg:justify-end">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Dane do faktury" onClick={() => showInvoiceData(row)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className={cn("grid border-t border-border/60 px-2 py-3 text-[13.5px] font-bold", GRID)}>
              <div className="lg:col-span-3">Razem: {monthName}</div>
              <div className="tabular-nums">{zl(total)}</div>
            </div>
          </>
        )}
      </Panel>

      <InfoBox>Platforma nie przyjmuje pieniędzy. Status faktury zmienia zastępca, a sumy liczymy z zamkniętych zleceń.</InfoBox>

      <Dialog open={!!invoice} onOpenChange={(open) => !open && setInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dane do faktury</DialogTitle>
            <DialogDescription>
              {invoice?.row.tytul} · {invoice?.row.numer} · {zl(invoice?.row.stawka)} netto
            </DialogDescription>
          </DialogHeader>
          {invoice?.data ? (
            <dl className="grid grid-cols-[90px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[13.5px]">
              <dt className="text-muted-foreground">{invoice.data.rola === "zlecajacy" ? "Nabywca" : "Wystawca"}</dt>
              <dd className="font-medium">{invoice.data.dane.nazwa}</dd>
              <dt className="text-muted-foreground">NIP</dt>
              <dd className="font-medium">{invoice.data.dane.nip || "—"}</dd>
              <dt className="text-muted-foreground">Adres</dt>
              <dd className="font-medium">{invoice.data.dane.adres || "—"}</dd>
              <dt className="text-muted-foreground">E-mail</dt>
              <dd className="font-medium">{invoice.data.dane.email || "—"}</dd>
            </dl>
          ) : (
            <Loader2 className="mx-auto my-6 h-6 w-6 animate-spin text-primary" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
