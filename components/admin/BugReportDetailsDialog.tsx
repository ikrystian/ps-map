"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { EMPTY_PLACEHOLDER, formatDateTime } from "@/lib/format"
import {
  BUG_REPORT_REPLY_MAX_LENGTH,
  bugReportCategoryLabels,
  bugReportStatusLabels,
  bugReportTicketNumber,
  type BugReport,
  type BugReportDetails,
  type BugReportReply,
} from "@/types/bug-reports"
import { ExternalLink, Loader2, Send } from "lucide-react"
import { useEffect, useState } from "react"

interface BugReportDetailsDialogProps {
  /** Zgłoszenie z listy — pokazywane od razu, szczegóły i historia doładowują się z API */
  report: BugReport | null
  onClose: () => void
}

function parseScreenshots(zalaczniki: string | null | undefined): string[] {
  if (!zalaczniki) return []
  try {
    const urls = JSON.parse(zalaczniki)
    return Array.isArray(urls) ? urls : []
  } catch {
    return []
  }
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words font-medium">{children}</dd>
    </div>
  )
}

export function BugReportDetailsDialog({ report, onClose }: BugReportDetailsDialogProps) {
  return (
    <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        {/* key — każde otwarte zgłoszenie startuje z czystym stanem (szczegóły, wpisana odpowiedź) */}
        {report && <BugReportDetailsBody key={report.id} report={report} />}
      </DialogContent>
    </Dialog>
  )
}

function BugReportDetailsBody({ report }: { report: BugReport }) {
  const [details, setDetails] = useState<BugReportDetails | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)

  const reportId = report.id
  const loadingDetails = !details && !loadFailed

  useEffect(() => {
    let cancelled = false
    fetch(`/api/admin/bug-reports/${reportId}`)
      .then((response) => {
        if (!response.ok) throw new Error()
        return response.json()
      })
      .then((data: BugReportDetails) => {
        if (!cancelled) setDetails(data)
      })
      .catch(() => {
        if (cancelled) return
        setLoadFailed(true)
        toast.error("Nie udało się pobrać szczegółów zgłoszenia")
      })

    return () => {
      cancelled = true
    }
  }, [reportId])

  const sendReply = async () => {
    if (!replyText.trim()) return
    setSending(true)
    try {
      const response = await fetch(`/api/admin/bug-reports/${report.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tresc: replyText }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Nie udało się wysłać odpowiedzi")

      const reply = data.reply as BugReportReply | null
      if (reply) {
        setDetails((prev) => (prev ? { ...prev, replies: [...prev.replies, reply] } : prev))
        toast.success(`Odpowiedź została wysłana na adres ${reply.wyslanoNa}`)
      } else {
        toast.warning("Odpowiedź została wysłana, ale nie udało się zapisać jej w historii")
      }
      setReplyText("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się wysłać odpowiedzi")
    } finally {
      setSending(false)
    }
  }

  // Dane z listy wystarczą na start; po załadowaniu bierzemy pełne (telefon, slug kancelarii, historia)
  const data: BugReport = details ?? report
  const user = data.user
  const screenshots = parseScreenshots(data.zalaczniki)
  const replies = details?.replies ?? []
  const reporterName = user
    ? [user.imie, user.nazwisko].filter(Boolean).join(" ") || user.name || user.email
    : EMPTY_PLACEHOLDER

  return (
    <>
      <DialogHeader>
        <div className="flex flex-wrap items-center gap-2 pr-6">
          <DialogTitle>Zgłoszenie {bugReportTicketNumber(data.id)}</DialogTitle>
          <Badge variant={bugReportStatusLabels[data.status].variant}>
            {bugReportStatusLabels[data.status].label}
          </Badge>
          <Badge variant="outline">{bugReportCategoryLabels[data.kategoria]}</Badge>
        </div>
        <DialogDescription>Zgłoszone {formatDateTime(data.createdAt)}</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
        <div>
          <h3 className="mb-1 text-sm font-semibold">Zgłaszający</h3>
          <dl className="divide-y divide-border/50">
            <DetailRow label="Imię i nazwisko">{reporterName}</DetailRow>
            <DetailRow label="E-mail">
              {user ? (
                <a href={`mailto:${user.email}`} className="text-primary hover:underline">
                  {user.email}
                </a>
              ) : (
                EMPTY_PLACEHOLDER
              )}
            </DetailRow>
            <DetailRow label="Telefon">
              {user?.numerTelefonu ? (
                <a href={`tel:${user.numerTelefonu}`} className="text-primary hover:underline">
                  {user.numerTelefonu}
                </a>
              ) : (
                EMPTY_PLACEHOLDER
              )}
            </DetailRow>
            <DetailRow label="Kancelaria">
              {user?.lawFirm?.slug ? (
                <a
                  href={`/ekspert/${user.lawFirm.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {user.lawFirm.nazwa}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                (user?.lawFirm?.nazwa ?? EMPTY_PLACEHOLDER)
              )}
            </DetailRow>
            <DetailRow label="ID użytkownika">
              <span className="font-mono text-xs">{data.userId}</span>
            </DetailRow>
          </dl>
        </div>

        <div>
          <h3 className="mb-1 text-sm font-semibold">Szczegóły zgłoszenia</h3>
          <dl className="divide-y divide-border/50">
            <DetailRow label="Strona">
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1 text-primary hover:underline"
              >
                <span className="break-all">{data.url}</span>
                <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
              </a>
            </DetailRow>
            <DetailRow label="Data zgłoszenia">{formatDateTime(data.createdAt)}</DetailRow>
            <DetailRow label="Ostatnia zmiana">{formatDateTime(data.updatedAt)}</DetailRow>
            <DetailRow label="Nagroda">{data.punktyPrzyznane ? "Punkty przyznane" : "Nie przyznano"}</DetailRow>
            <DetailRow label="ID zgłoszenia">
              <span className="font-mono text-xs">{data.id}</span>
            </DetailRow>
          </dl>
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold">Opis</h3>
        <div className="whitespace-pre-wrap break-words rounded-lg border border-border/50 bg-muted/30 p-3 text-sm">
          {data.opis}
        </div>
      </div>

      {data.adminNotatka && (
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold">Notatka admina (widoczna dla eksperta)</h3>
          <div className="whitespace-pre-wrap break-words rounded-lg border border-border/50 bg-muted/30 p-3 text-sm">
            {data.adminNotatka}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold">Zrzuty ekranu ({screenshots.length})</h3>
        {screenshots.length === 0 ? (
          <p className="text-sm text-muted-foreground">Zgłaszający nie dołączył zrzutów ekranu.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {screenshots.map((src, index) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg border border-border/50 hover:border-primary/50"
                title="Otwórz w nowej karcie"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Zrzut ekranu ${index + 1}`}
                  className="h-32 w-full object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Historia odpowiedzi ({replies.length})</h3>
        {loadingDetails ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Ładowanie...
          </p>
        ) : replies.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nie wysłano jeszcze żadnej odpowiedzi.</p>
        ) : (
          <ul className="space-y-2">
            {replies.map((reply) => (
              <li key={reply.id} className="rounded-lg border border-border/50 p-3">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 text-xs text-muted-foreground">
                  <span>
                    <span className="font-medium text-foreground">{reply.adminName}</span> → {reply.wyslanoNa}
                  </span>
                  <span>{formatDateTime(reply.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm">{reply.tresc}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2 border-t border-border/50 pt-4">
        <Label htmlFor="bug-report-reply">
          Odpowiedź{user ? ` — zostanie wysłana mailem na ${user.email}` : ""}
        </Label>
        <Textarea
          id="bug-report-reply"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Napisz odpowiedź do zgłaszającego..."
          rows={5}
          maxLength={BUG_REPORT_REPLY_MAX_LENGTH}
          disabled={sending}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {replyText.length}/{BUG_REPORT_REPLY_MAX_LENGTH}
          </span>
          <Button onClick={sendReply} disabled={sending || !replyText.trim()}>
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Wyślij odpowiedź
          </Button>
        </div>
      </div>
    </>
  )
}
