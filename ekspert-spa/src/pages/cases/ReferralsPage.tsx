import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Copy, MapPin, Plus, Send, Share2, X } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { formatDate } from "@shared/format"
import { Screen } from "@/components/Screen"
import { ConfirmSheet } from "@/components/Sheet"
import { useToast } from "@/components/toast"
import { Badge, Button, ButtonLink, Card, EmptyState, ErrorState, IconButton, ListSkeleton, PageHeader } from "@/components/ui"
import { api } from "@/lib/api"
import { REFERRAL_STATUS_LABEL, type Tone } from "@/lib/labels"
import { copyText, shareLink } from "@/lib/native"
import type { Referral, ReferralStats } from "@/lib/types"
import { CasesTabs } from "./CasesTabs"

const CLOSED_STATUSES = ["SPRAWA_UTWORZONA", "ANULOWANE", "WYGASLE"]

function referralTone(status: string): Tone {
  if (status === "SPRAWA_UTWORZONA") return "success"
  if (status === "ANULOWANE" || status === "WYGASLE") return "neutral"
  return "primary"
}

export function ReferralsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["referrals"],
    queryFn: () => api<{ referrals: Referral[]; stats: ReferralStats }>("/api/case-referrals"),
  })
  const [cancelTarget, setCancelTarget] = useState<Referral | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["referrals"] })

  const resend = useMutation({
    mutationFn: (referral: Referral) => api(`/api/case-referrals/${referral.id}/resend`, { method: "POST" }),
    onSuccess: (_data, referral) => {
      toast.success(`Link wysłany ponownie na ${referral.email}`)
      void invalidate()
    },
    onError: toast.error,
  })

  const cancel = useMutation({
    mutationFn: (referral: Referral) =>
      api(`/api/case-referrals/${referral.id}`, { method: "PATCH", body: { status: "ANULOWANE" } }),
    onSuccess: () => {
      toast.success("Polecenie anulowane — link przestał działać")
      setCancelTarget(null)
      void invalidate()
    },
    onError: toast.error,
  })

  const handleCopy = async (link: string) => {
    try {
      await copyText(link)
      toast.success("Link skopiowany do schowka")
    } catch {
      toast.error("Nie udało się skopiować linku")
    }
  }

  const handleShare = async (referral: Referral) => {
    try {
      const result = await shareLink({
        title: "Dokończ zgłoszenie sprawy",
        text: "Link do założenia sprawy w serwisie Prosta Sprawa:",
        url: referral.link,
      })
      if (result === "copied") toast.success("Link skopiowany do schowka")
    } catch (err) {
      toast.error(err)
    }
  }

  const stats = data?.stats

  return (
    <Screen
      tabRoot
      header={
        <PageHeader
          title="Sprawy"
          action={
            <ButtonLink to="/sprawy/polecenia/nowe" variant="soft" size="sm" aria-label="Poleć sprawę" className="min-h-9">
              <Plus className="size-4" aria-hidden />
              Poleć
            </ButtonLink>
          }
        >
          <CasesTabs />
        </PageHeader>
      }
    >
      {isPending ? (
        <ListSkeleton rows={3} label="Wczytywanie poleceń…" />
      ) : !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <Card flush className="grid grid-cols-4 divide-x divide-border/70 py-3 text-center">
            {[
              ["Wysłane", stats?.wyslane],
              ["Otwarte", stats?.otwarte],
              ["Konta", stats?.zarejestrowane],
              ["Sprawy", stats?.sprawy],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-lg font-semibold leading-tight">{value ?? 0}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </Card>

          {data.referrals.length === 0 ? (
            <EmptyState
              icon={Share2}
              title="Brak poleceń"
              action={
                <ButtonLink to="/sprawy/polecenia/nowe" size="sm">
                  Poleć pierwszą sprawę
                </ButtonLink>
              }
            >
              Wyślij klientowi link, dzięki któremu doda sprawę z wybranym przez Ciebie zakresem.
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {data.referrals.map((referral) => (
                <li key={referral.id}>
                  <Card className="space-y-2">
                    <Badge tone={referralTone(referral.status)}>
                      {REFERRAL_STATUS_LABEL[referral.status] ?? referral.status}
                    </Badge>
                    <p className="line-clamp-2 text-[15px] font-semibold leading-snug">{referral.nazwaSprawy ?? referral.email}</p>
                    <p className="truncate text-sm text-muted-foreground">{referral.email}</p>
                    {!!referral.categories.length && (
                      <p className="text-xs text-muted-foreground">
                        {referral.categories.map((link) => link.category.nazwa).join(", ")}
                      </p>
                    )}
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      {referral.city?.nazwa ?? referral.voivodeship?.nazwa ?? "—"} · ważny do {formatDate(referral.expiresAt)}
                    </p>
                    {referral.case && (
                      <Link to={`/sprawy/${referral.case.id}`} className="inline-flex min-h-9 items-center text-sm font-medium text-primary">
                        Zobacz sprawę
                      </Link>
                    )}
                    {!CLOSED_STATUSES.includes(referral.status) && (
                      <div className="flex items-center gap-1 border-t border-border/70 pt-2">
                        <Button variant="soft" size="sm" className="flex-1" onClick={() => void handleShare(referral)}>
                          <Share2 className="size-4" aria-hidden />
                          Udostępnij
                        </Button>
                        <IconButton label="Kopiuj link" className="text-muted-foreground" onClick={() => void handleCopy(referral.link)}>
                          <Copy className="size-[18px]" aria-hidden />
                        </IconButton>
                        <IconButton
                          label="Wyślij ponownie"
                          className="text-muted-foreground"
                          disabled={resend.isPending && resend.variables?.id === referral.id}
                          onClick={() => resend.mutate(referral)}
                        >
                          <Send className="size-[18px]" aria-hidden />
                        </IconButton>
                        <IconButton label="Anuluj polecenie" className="text-destructive" onClick={() => setCancelTarget(referral)}>
                          <X className="size-5" aria-hidden />
                        </IconButton>
                      </div>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ConfirmSheet
        open={!!cancelTarget}
        title="Anulować polecenie?"
        confirmLabel="Anuluj polecenie"
        cancelLabel="Zostaw"
        danger
        loading={cancel.isPending}
        onConfirm={() => cancelTarget && cancel.mutate(cancelTarget)}
        onClose={() => setCancelTarget(null)}
      >
        Link wysłany na {cancelTarget?.email} przestanie działać.
      </ConfirmSheet>
    </Screen>
  )
}
