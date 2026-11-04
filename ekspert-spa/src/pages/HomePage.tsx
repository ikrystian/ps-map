import { useQuery } from "@tanstack/react-query"
import {
  BadgeCheck,
  Briefcase,
  CalendarCheck2,
  ChevronRight,
  Clock,
  Coins,
  Eye,
  MessageSquare,
  Package,
  Send,
  ShieldAlert,
  Sparkles,
  Star,
  Trophy,
  Video,
  type LucideIcon,
} from "lucide-react"
import { useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { formatBudgetRange, formatCurrency, formatDate, formatNumber, formatPoints, plural } from "@shared/format"
import { Screen } from "@/components/Screen"
import { Button, ButtonLink, Card, PageHeader, Section, Skeleton, cn } from "@/components/ui"
import { api } from "@/lib/api"
import { formatMeeting, timeAgo, timeUntil } from "@/lib/format"
import { readIdSet } from "@/lib/localIdSet"
import { openExternal } from "@/lib/native"
import { useBookings, useDashboard, useLawFirm } from "@/lib/queries"
import { presetStickyState } from "@/lib/sticky"
import type { CaseListItem, LawFirm } from "@/lib/types"
import { isPackageActive } from "./account/packageState"

const PACKAGE_WARNING_DAYS = 14
const LATEST_CASES = 3
const ACTIVE_BOOKING = new Set(["PENDING", "ACCEPTED"])

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("pl-PL", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Warsaw" }).format(new Date()))
  return hour >= 18 || hour < 5 ? "Dobry wieczór" : "Dzień dobry"
}

function daysLeft(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
}

export function HomePage() {
  const navigate = useNavigate()
  const { data: lawFirm } = useLawFirm()
  const { data: dashboard } = useDashboard()
  const { data: bookings } = useBookings()
  const { data: cases } = useQuery({
    queryKey: ["cases"],
    queryFn: () => api<CaseListItem[]>("/api/cases?includeAll=true"),
  })
  const { data: unread } = useQuery({
    queryKey: ["conversations", "unread"],
    queryFn: () => api<{ unreadCount: number }>("/api/conversations/unread-count"),
  })

  const newCases = useMemo(() => {
    const hidden = readIdSet("rejectedCases")
    return (cases ?? []).filter((item) => item.status === "NOWA" && !item.offers?.length && !hidden.has(item.id))
  }, [cases])

  const { pendingBookings, nextBooking } = useMemo(() => {
    const now = Date.now()
    const active = (bookings ?? []).filter((booking) => !booking.isArchived)
    const upcoming = active
      .filter((booking) => new Date(booking.consultationDate).getTime() >= now && ACTIVE_BOOKING.has(booking.status))
      .sort((a, b) => new Date(a.consultationDate).getTime() - new Date(b.consultationDate).getTime())
    return {
      pendingBookings: active.filter((booking) => booking.status === "PENDING").length,
      nextBooking: upcoming[0],
    }
  }, [bookings])

  const openNewCases = () => {
    presetStickyState("cases.status", "NOWA")
    navigate("/sprawy", { replace: true })
  }

  const unreadCount = unread?.unreadCount ?? 0
  const expiresIn = lawFirm?.dataPakietuDo && isPackageActive(lawFirm) ? daysLeft(lawFirm.dataPakietuDo) : null
  const packageExpiring = expiresIn !== null && expiresIn <= PACKAGE_WARNING_DAYS
  const stats = dashboard?.stats
  const rating = stats && stats.reviewsCount > 0 ? formatNumber(stats.averageRating, 1) : "—"

  return (
    <Screen
      tabRoot
      header={<PageHeader title={lawFirm?.imieKontakt ? `${greeting()}, ${lawFirm.imieKontakt}` : greeting()} subtitle={lawFirm?.nazwa} />}
    >
      {lawFirm ? <BalanceCard lawFirm={lawFirm} /> : <Skeleton className="h-[148px] rounded-3xl" />}

      <Section title="Do zrobienia">
        <Card flush className="divide-y divide-border/70">
          {!lawFirm || !bookings || !cases ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          ) : (
            <>
              {!lawFirm.zweryfikowana && (
                <TaskRow
                  icon={ShieldAlert}
                  tone="warning"
                  label="Profil czeka na weryfikację"
                  hint="Oferty złożysz po jej zakończeniu"
                  to="/konto/ustawienia"
                />
              )}
              {pendingBookings > 0 && (
                <TaskRow
                  icon={CalendarCheck2}
                  label={`${pendingBookings} ${plural(pendingBookings, "rezerwacja czeka", "rezerwacje czekają", "rezerwacji czeka")} na decyzję`}
                  to="/konsultacje"
                />
              )}
              {unreadCount > 0 && (
                <TaskRow
                  icon={MessageSquare}
                  label={`${unreadCount} ${plural(unreadCount, "nowa wiadomość", "nowe wiadomości", "nowych wiadomości")}`}
                  to="/wiadomosci"
                />
              )}
              {newCases.length > 0 && (
                <TaskRow
                  icon={Briefcase}
                  label={`${newCases.length} ${plural(newCases.length, "nowa sprawa", "nowe sprawy", "nowych spraw")} bez Twojej oferty`}
                  onClick={openNewCases}
                />
              )}
              {packageExpiring && (
                <TaskRow
                  icon={Package}
                  tone="warning"
                  label={expiresIn <= 0 ? "Pakiet wygasa dziś" : `Pakiet wygasa za ${expiresIn} ${plural(expiresIn, "dzień", "dni", "dni")}`}
                  hint="Przedłuż go, żeby nie stracić dostępu do spraw"
                  to="/konto/pakiet"
                />
              )}
              {lawFirm.zweryfikowana && pendingBookings + unreadCount + newCases.length === 0 && !packageExpiring && (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
                    <BadgeCheck className="size-5" aria-hidden />
                  </span>
                  <p className="text-sm font-medium">Wszystko załatwione. Dobra robota!</p>
                </div>
              )}
            </>
          )}
        </Card>
      </Section>

      {nextBooking && (
        <Section
          title="Najbliższa konsultacja"
          action={
            <Link to="/konsultacje" className="text-[13px] font-medium text-primary">
              Wszystkie
            </Link>
          }
        >
          <Card className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Clock className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-snug">{formatMeeting(nextBooking.consultationDate)}</p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {timeUntil(nextBooking.consultationDate)} · {nextBooking.duration} min · {nextBooking.topic}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold">{formatCurrency(nextBooking.price)}</p>
            </div>
            {nextBooking.status === "ACCEPTED" && nextBooking.googleMeetUrl && (
              <Button size="sm" className="w-full" onClick={() => void openExternal(nextBooking.googleMeetUrl!)}>
                <Video className="size-4" aria-hidden />
                Dołącz do spotkania
              </Button>
            )}
          </Card>
        </Section>
      )}

      <Section title="Ten miesiąc">
        <div className="grid grid-cols-2 gap-3">
          <StatTile icon={Eye} label="Wyświetlenia profilu" value={stats ? formatNumber(stats.viewsThisMonth) : null} />
          <StatTile icon={Send} label="Złożone oferty" gold value={stats ? formatNumber(stats.offersThisMonth) : null} />
          <StatTile
            icon={Trophy}
            label="Skuteczność ofert"
            value={dashboard ? `${formatNumber(dashboard.lawFirm.konwersja, 0)}%` : null}
            hint={dashboard ? `${dashboard.lawFirm.wygraneOferty} z ${dashboard.lawFirm.zlozoneOferty} ofert` : undefined}
          />
          <StatTile
            icon={Star}
            gold
            label="Średnia ocena"
            value={stats ? rating : null}
            hint={stats ? `${stats.reviewsCount} ${plural(stats.reviewsCount, "opinia", "opinie", "opinii")}` : undefined}
          />
        </div>
      </Section>

      {newCases.length > 0 && (
        <Section
          title="Nowe sprawy"
          action={
            <button type="button" onClick={openNewCases} className="text-[13px] font-medium text-primary">
              Wszystkie
            </button>
          }
        >
          <Card flush className="divide-y divide-border/70">
            {newCases.slice(0, LATEST_CASES).map((item) => (
              <Link
                key={item.id}
                to={`/sprawy/${item.id}`}
                className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors active:bg-muted"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{item.nazwaSprawy}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.doNegocjacji ? "Do negocjacji" : (formatBudgetRange(item.budzetOd, item.budzetDo) ?? "Budżet nieokreślony")} ·{" "}
                    {timeAgo(item.createdAt)}
                  </span>
                </span>
                <ChevronRight className="size-[18px] shrink-0 text-muted-foreground/70" aria-hidden />
              </Link>
            ))}
          </Card>
        </Section>
      )}
    </Screen>
  )
}

function BalanceCard({ lawFirm }: { lawFirm: LawFirm }) {
  const active = isPackageActive(lawFirm)
  return (
    <div className="hero relative overflow-hidden rounded-3xl p-5 shadow-card">
      <Coins aria-hidden className="absolute -bottom-6 -right-5 size-32 text-primary/10" strokeWidth={1.2} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">Dostępne saldo</p>
          <p className="mt-1 text-[32px] font-semibold leading-tight">
            {formatPoints(lawFirm.punktySaldo)} <span className="text-lg font-medium text-muted-foreground">pkt</span>
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-secondary/30 bg-secondary/15 px-2.5 py-1 text-xs font-medium text-secondary">
          <Sparkles className="size-3.5" aria-hidden />
          {active ? lawFirm.pakietSubskrypcji : "Brak pakietu"}
        </span>
      </div>
      <div className="relative mt-3 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs text-muted-foreground">
          {active && lawFirm.dataPakietuDo ? `Pakiet ważny do ${formatDate(lawFirm.dataPakietuDo)}` : "Wybierz pakiet, aby korzystać ze spraw"}
        </p>
        <ButtonLink to="/konto/punkty" size="sm" className="min-h-9 shrink-0 px-3.5">
          Doładuj
        </ButtonLink>
      </div>
    </div>
  )
}

interface TaskRowProps {
  icon: LucideIcon
  label: string
  hint?: string
  tone?: "primary" | "warning"
  to?: string
  onClick?: () => void
}

function TaskRow({ icon: Icon, label, hint, tone = "primary", to, onClick }: TaskRowProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          tone === "warning" ? "bg-secondary/10 text-secondary" : "bg-accent text-accent-foreground"
        )}
      >
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <ChevronRight className="size-[18px] shrink-0 text-muted-foreground/70" aria-hidden />
    </>
  )
  const className = "flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-muted"

  // Zakładka zastępuje pulpit, a ekran szczegółowy kładzie się na nim, żeby „wstecz” tu wracało
  return to ? (
    <Link to={to} replace={to.lastIndexOf("/") === 0} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}

interface StatTileProps {
  icon: LucideIcon
  label: string
  value: string | null
  hint?: string
  gold?: boolean
}

function StatTile({ icon: Icon, label, value, hint, gold }: StatTileProps) {
  return (
    <Card className="min-w-0 space-y-2 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow min-w-0">{label}</p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-xl",
            gold ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      {value === null ? <Skeleton className="h-7 w-14" /> : <p className="text-2xl font-semibold leading-tight">{value}</p>}
      {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
    </Card>
  )
}
