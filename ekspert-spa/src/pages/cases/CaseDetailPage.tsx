import { useQuery } from "@tanstack/react-query"
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  EyeOff,
  Heart,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Tag,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { formatBudgetRange, formatBusinessDays, formatCurrency, formatDate, formatOffersCount } from "@shared/format"
import { CASE_STATUS_LABEL, OFFER_STATUS_LABEL, statusLabel } from "@shared/labels"
import { Screen } from "@/components/Screen"
import { useToast } from "@/components/toast"
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  ErrorState,
  IconButton,
  ListSkeleton,
  PageHeader,
  SafeHtml,
  Section,
  cn,
} from "@/components/ui"
import { api, assetUrl } from "@/lib/api"
import { readDraft } from "@/lib/drafts"
import { timeAgo } from "@/lib/format"
import { CASE_TYPE_LABEL, caseTone, offerTone } from "@/lib/labels"
import { readIdSet, writeIdSet } from "@/lib/localIdSet"
import { haptic, openExternal } from "@/lib/native"
import { useLawFirm, useOpenChat } from "@/lib/queries"
import type { CaseDetail, Offer } from "@/lib/types"

const OWN_OFFER_MESSAGE: Record<string, string> = {
  ZLOZONA: "Czeka na rozpatrzenie przez klienta.",
  NEGOCJACJE: "Oferta jest w trakcie negocjacji z klientem.",
  ZAAKCEPTOWANA: "Klient zaakceptował Twoją ofertę.",
  ODRZUCONA: "Klient odrzucił Twoją ofertę.",
  WYGASLA: "Twoja oferta wygasła.",
}

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const openChat = useOpenChat()
  const { data: lawFirm } = useLawFirm()
  const { data: caseData, error, refetch } = useQuery({
    queryKey: ["cases", id],
    queryFn: () => api<CaseDetail>(`/api/cases/${id}`),
  })
  const { data: ownOffers } = useQuery({
    queryKey: ["offers", "case", id, lawFirm?.id],
    queryFn: () => api<{ offers: Offer[] }>(`/api/offers?caseId=${id}&lawFirmId=${lawFirm!.id}`),
    enabled: !!lawFirm,
  })
  const [favorites, setFavorites] = useState(() => readIdSet("favoriteCases"))

  const hideCase = () => {
    writeIdSet("rejectedCases", readIdSet("rejectedCases").add(id!))
    toast.success("Ukryta sprawa czeka w filtrze „Ukryte”")
    navigate("/sprawy", { replace: true })
  }

  if (!caseData) {
    return (
      <Screen header={<PageHeader title="Sprawa" back="/sprawy" />}>
        {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : <ListSkeleton rows={2} label="Wczytywanie sprawy…" />}
      </Screen>
    )
  }

  const favorite = favorites.has(caseData.id)
  const toggleFavorite = () => {
    haptic("light")
    const next = new Set(favorites)
    if (!next.delete(caseData.id)) next.add(caseData.id)
    writeIdSet("favoriteCases", next)
    setFavorites(next)
  }

  const ownOffer = ownOffers?.offers[0]
  const acceptedHere = caseData.offers?.some((offer) => offer.status === "ZAAKCEPTOWANA")
  const categoryNames = caseData.categories?.length
    ? caseData.categories.map((link) => link.category.nazwa).join(", ")
    : caseData.category.nazwa
  const budget = caseData.doNegocjacji
    ? "Do negocjacji"
    : (formatBudgetRange(caseData.budzetOd, caseData.budzetDo) ?? "Nie określono")
  const canOffer =
    ownOffers !== undefined && !ownOffer && caseData.status !== "W_TRAKCIE" && caseData.status !== "ZAKONCZONA"
  const hasDraft = !!readDraft(`offer:${caseData.id}`)
  const clientUserId = caseData.client?.userId

  return (
    <Screen
      header={
        <PageHeader
          title="Sprawa"
          subtitle={caseData.numerSprawy ? `Nr ${caseData.numerSprawy}` : undefined}
          back="/sprawy"
          action={
            <>
              <IconButton label="Ukryj sprawę" onClick={hideCase} className="text-muted-foreground">
                <EyeOff className="size-5" aria-hidden />
              </IconButton>
              <IconButton
                label={favorite ? "Usuń z obserwowanych" : "Dodaj do obserwowanych"}
                aria-pressed={favorite}
                onClick={toggleFavorite}
                className={favorite ? "text-secondary" : "text-muted-foreground"}
              >
                <Heart className={cn("size-5", favorite && "fill-current")} aria-hidden />
              </IconButton>
            </>
          }
        />
      }
      footer={
        canOffer ? (
          <ButtonLink to={`/sprawy/${caseData.id}/oferta`} className="w-full">
            {hasDraft ? "Dokończ ofertę" : "Złóż ofertę"}
          </ButtonLink>
        ) : undefined
      }
    >
      <div className="space-y-2.5 px-1 pt-1">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={caseTone(caseData.status)}>{statusLabel(CASE_STATUS_LABEL, caseData.status)}</Badge>
          {caseData.trybPilny && <Badge tone="danger">Pilne</Badge>}
          {caseData.referral && <Badge tone="warning">Twoje polecenie</Badge>}
        </div>
        <h2 className="font-serif text-[22px] font-semibold leading-tight">{caseData.nazwaSprawy}</h2>
        <p className="text-xs text-muted-foreground">
          Dodano {timeAgo(caseData.createdAt)}
          {caseData._count ? ` · ${formatOffersCount(caseData._count.offers)}` : ""}
        </p>
      </div>

      {ownOffer && (
        <Card className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
          <div className="min-w-0 flex-1 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="font-semibold">Twoja oferta</p>
              <Badge tone={offerTone(ownOffer.status)}>{statusLabel(OFFER_STATUS_LABEL, ownOffer.status)}</Badge>
            </div>
            <p className="mt-1 text-[15px] font-semibold">
              {formatCurrency(ownOffer.kwotaBrutto)}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                {formatBusinessDays(ownOffer.terminRealizacjiDni)}
              </span>
            </p>
            <p className="mt-0.5 text-muted-foreground">{OWN_OFFER_MESSAGE[ownOffer.status] ?? OWN_OFFER_MESSAGE.ZLOZONA}</p>
            <Link to="/sprawy/oferty" className="mt-1.5 inline-flex min-h-9 items-center font-medium text-primary">
              Zobacz swoje oferty
            </Link>
          </div>
        </Card>
      )}

      {acceptedHere && (
        <Section title="Dane kontaktowe klienta">
          <Card className="space-y-3">
            <div>
              <p className="font-semibold">{caseData.imieNazwisko}</p>
              <p className="text-sm text-muted-foreground">{caseData.telefonKontakt}</p>
            </div>
            <div className={cn("grid gap-2", clientUserId && "grid-cols-2")}>
              <a
                href={`tel:${caseData.telefonKontakt.replace(/\s/g, "")}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-fill text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
              >
                <Phone className="size-4" aria-hidden />
                Zadzwoń
              </a>
              {clientUserId && (
                <Button
                  variant="soft"
                  size="sm"
                  className="min-h-11"
                  loading={openChat.isPending}
                  onClick={() => openChat.mutate(clientUserId)}
                >
                  <MessageSquare className="size-4" aria-hidden />
                  Napisz
                </Button>
              )}
            </div>
          </Card>
        </Section>
      )}

      <Card flush className="divide-y divide-border/70">
        <Fact icon={Wallet} label="Budżet klienta" value={budget} strong />
        <Fact icon={Tag} label="Kategoria" value={categoryNames} />
        <Fact icon={Building2} label="Typ" value={CASE_TYPE_LABEL[caseData.typSprawy] ?? caseData.typSprawy} />
        <Fact
          icon={CalendarDays}
          label="Oczekiwany termin"
          value={caseData.oczekiwanyTerminRealizacji ? formatDate(caseData.oczekiwanyTerminRealizacji) : "Elastyczny"}
        />
        <Fact icon={MapPin} label="Obszar" value={[caseData.city?.nazwa, caseData.voivodeship.nazwa].filter(Boolean).join(", ")} />
        {caseData._count && <Fact icon={UsersRound} label="Złożone oferty" value={String(caseData._count.offers)} />}
      </Card>

      <Section title="Opis sprawy">
        <Card>
          <SafeHtml html={caseData.opisSprawy} />
        </Card>
      </Section>

      {!!caseData.zalaczniki?.length && (
        <Section title={`Załączniki (${caseData.zalaczniki.length})`}>
          <Card flush className="divide-y divide-border/70">
            {caseData.zalaczniki.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => void openExternal(assetUrl(url))}
                className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors active:bg-muted"
              >
                <Paperclip className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{url.split("/").pop() ?? `Załącznik ${index + 1}`}</span>
                <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>
            ))}
          </Card>
        </Section>
      )}
    </Screen>
  )
}

function Fact({ icon: Icon, label, value, strong }: { icon: LucideIcon; label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Icon className="mt-0.5 size-[18px] shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm", strong ? "font-semibold" : "font-medium")}>{value}</p>
      </div>
    </div>
  )
}
