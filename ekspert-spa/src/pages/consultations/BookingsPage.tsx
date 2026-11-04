import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Archive,
  ArchiveRestore,
  BadgeCheck,
  Calendar,
  CalendarPlus,
  CircleSlash,
  Clock,
  Ellipsis,
  Mail,
  MessageSquare,
  Phone,
  Trash2,
  Video,
} from "lucide-react"
import { useMemo, useState } from "react"
import { formatCurrency } from "@shared/format"
import { Screen } from "@/components/Screen"
import { ActionSheet, ConfirmSheet, type SheetAction } from "@/components/Sheet"
import { useToast } from "@/components/toast"
import { Badge, Button, Card, Chips, EmptyState, ErrorState, IconButton, ListSkeleton, PageHeader } from "@/components/ui"
import { api } from "@/lib/api"
import { buildBookingCalendarFile } from "@/lib/calendar"
import { dateParts, formatMeeting, formatTime } from "@/lib/format"
import { BOOKING_STATUS_LABEL, type Tone } from "@/lib/labels"
import { openExternal, saveFile } from "@/lib/native"
import { useBookings, useOpenChat } from "@/lib/queries"
import { useStickyState } from "@/lib/sticky"
import type { Booking } from "@/lib/types"
import { ConsultationsTabs } from "./ConsultationsTabs"

type Section = "upcoming" | "past" | "archived"

interface BookingUpdate {
  id: string
  patch: Record<string, unknown>
  message: string
}

function bookingTone(status: string): Tone {
  if (status === "ACCEPTED" || status === "COMPLETED") return "success"
  if (status === "REJECTED") return "danger"
  if (status === "CANCELLED") return "neutral"
  return "warning"
}

const EMPTY_MESSAGE: Record<Section, string> = {
  upcoming: "Nie masz nadchodzących konsultacji.",
  past: "Brak minionych konsultacji.",
  archived: "Archiwum jest puste.",
}

function clientName(booking: Booking) {
  return booking.client.user?.name ?? (`${booking.client.imie ?? ""} ${booking.client.nazwisko ?? ""}`.trim() || "Klient")
}

export function BookingsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data, isPending, error, refetch } = useBookings()
  const openChat = useOpenChat()
  const [section, setSection] = useStickyState<Section>("bookings.section", "upcoming")
  const [menuTarget, setMenuTarget] = useState<Booking | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null)

  const groups = useMemo(() => {
    const now = Date.now()
    const time = (booking: Booking) => new Date(booking.consultationDate).getTime()
    const active = (data ?? []).filter((booking) => !booking.isArchived)
    return {
      upcoming: active.filter((b) => time(b) >= now).sort((a, b) => time(a) - time(b)),
      past: active.filter((b) => time(b) < now).sort((a, b) => time(b) - time(a)),
      archived: (data ?? []).filter((b) => b.isArchived).sort((a, b) => time(b) - time(a)),
    }
  }, [data])

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["bookings"] })
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
  }

  const update = useMutation({
    mutationFn: ({ id, patch }: BookingUpdate) => api(`/api/consultations/${id}`, { method: "PATCH", body: patch }),
    onSuccess: (_data, { message }) => {
      toast.success(message)
      setRejectTarget(null)
      invalidate()
    },
    onError: toast.error,
  })

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/consultations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Konsultacja została usunięta.")
      setDeleteTarget(null)
      invalidate()
    },
    onError: toast.error,
  })

  const addToCalendar = (booking: Booking) => {
    const { blob, filename } = buildBookingCalendarFile(booking, clientName(booking))
    saveFile(blob, filename).catch(toast.error)
  }

  const menuActions: SheetAction[] = menuTarget
    ? [
        {
          label: "Dodaj do kalendarza",
          hint: "Zapisz termin w kalendarzu telefonu",
          icon: CalendarPlus,
          onSelect: () => addToCalendar(menuTarget),
        },
        {
          label: menuTarget.paymentStatus === "ZAPLACONE" ? "Cofnij opłacenie" : "Oznacz jako opłaconą",
          icon: menuTarget.paymentStatus === "ZAPLACONE" ? CircleSlash : BadgeCheck,
          onSelect: () =>
            update.mutate({
              id: menuTarget.id,
              patch: { paymentStatus: menuTarget.paymentStatus === "ZAPLACONE" ? "OCZEKUJE" : "ZAPLACONE" },
              message: "Status płatności został zaktualizowany.",
            }),
        },
        {
          label: menuTarget.isArchived ? "Przywróć z archiwum" : "Archiwizuj",
          icon: menuTarget.isArchived ? ArchiveRestore : Archive,
          onSelect: () =>
            update.mutate({
              id: menuTarget.id,
              patch: { isArchived: !menuTarget.isArchived },
              message: menuTarget.isArchived ? "Konsultacja została przywrócona." : "Konsultacja została zarchiwizowana.",
            }),
        },
        { label: "Usuń konsultację", icon: Trash2, danger: true, onSelect: () => setDeleteTarget(menuTarget) },
      ]
    : []

  const bookings = groups[section]

  return (
    <Screen
      tabRoot
      header={
        <PageHeader title="Konsultacje">
          <ConsultationsTabs />
        </PageHeader>
      }
    >
      <Chips
        label="Okres"
        value={section}
        onChange={setSection}
        options={[
          { value: "upcoming", label: "Nadchodzące", count: groups.upcoming.length },
          { value: "past", label: "Minione", count: groups.past.length },
          { value: "archived", label: "Archiwum", count: groups.archived.length },
        ]}
      />

      {isPending ? (
        <ListSkeleton rows={3} label="Wczytywanie rezerwacji…" />
      ) : !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : bookings.length === 0 ? (
        <EmptyState icon={Calendar} title="Brak rezerwacji">
          {EMPTY_MESSAGE[section]}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <BookingCard
                booking={booking}
                upcoming={section === "upcoming"}
                busy={update.isPending && update.variables?.id === booking.id}
                chatLoading={openChat.isPending && openChat.variables === booking.client.userId}
                onAccept={() =>
                  update.mutate({
                    id: booking.id,
                    patch: { status: "ACCEPTED" },
                    message: "Rezerwacja została zaakceptowana.",
                  })
                }
                onReject={() => setRejectTarget(booking)}
                onChat={() => openChat.mutate(booking.client.userId)}
                onMore={() => setMenuTarget(booking)}
              />
            </li>
          ))}
        </ul>
      )}

      <ActionSheet
        open={!!menuTarget}
        title={menuTarget ? clientName(menuTarget) : "Konsultacja"}
        actions={menuActions}
        onClose={() => setMenuTarget(null)}
      />

      <ConfirmSheet
        open={!!rejectTarget}
        title="Odrzucić rezerwację?"
        confirmLabel="Odrzuć"
        cancelLabel="Wróć"
        danger
        loading={update.isPending}
        onConfirm={() =>
          rejectTarget &&
          update.mutate({
            id: rejectTarget.id,
            patch: { status: "REJECTED" },
            message: "Rezerwacja została odrzucona.",
          })
        }
        onClose={() => setRejectTarget(null)}
      >
        {rejectTarget && `${clientName(rejectTarget)} dostanie powiadomienie o odrzuceniu terminu.`}
      </ConfirmSheet>

      <ConfirmSheet
        open={!!deleteTarget}
        title="Usunąć konsultację?"
        confirmLabel="Usuń"
        danger
        loading={remove.isPending}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
      >
        Tej operacji nie można cofnąć.
      </ConfirmSheet>
    </Screen>
  )
}

interface BookingCardProps {
  booking: Booking
  upcoming: boolean
  busy: boolean
  chatLoading: boolean
  onAccept: () => void
  onReject: () => void
  onChat: () => void
  onMore: () => void
}

function BookingCard({ booking, upcoming, busy, chatLoading, onAccept, onReject, onChat, onMore }: BookingCardProps) {
  const { weekday, day, month } = dateParts(booking.consultationDate)
  const isPaid = booking.paymentStatus === "ZAPLACONE"
  const contact = booking.clientContact.trim()
  const contactHref = contact.includes("@") ? `mailto:${contact}` : `tel:${contact.replace(/\s/g, "")}`
  const ContactIcon = contact.includes("@") ? Mail : Phone

  return (
    <Card className="space-y-3">
      <div className="flex gap-3">
        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-accent py-1.5 text-accent-foreground">
          <span className="text-[11px] font-medium uppercase leading-tight">{weekday}</span>
          <span className="text-xl font-semibold leading-tight">{day}</span>
          <span className="text-[11px] font-medium uppercase leading-tight">{month}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-[15px] font-semibold leading-snug">{clientName(booking)}</p>
            <p className="shrink-0 text-sm font-semibold">{formatCurrency(booking.price)}</p>
          </div>
          <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">{booking.topic}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Clock className="size-3.5" aria-hidden />
              {upcoming ? formatMeeting(booking.consultationDate) : formatTime(booking.consultationDate)}
            </span>
            <span>{booking.duration} min</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge tone={bookingTone(booking.status)}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge>
        <Badge tone={isPaid ? "success" : "neutral"}>{isPaid ? "Zapłacona" : "Nieopłacona"}</Badge>
      </div>

      {booking.status === "PENDING" && (
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" loading={busy} onClick={onAccept}>
            Zaakceptuj
          </Button>
          <Button variant="danger" size="sm" disabled={busy} onClick={onReject}>
            Odrzuć
          </Button>
        </div>
      )}

      {booking.status === "ACCEPTED" && upcoming && booking.googleMeetUrl && (
        <Button size="sm" className="w-full" onClick={() => void openExternal(booking.googleMeetUrl!)}>
          <Video className="size-4" aria-hidden />
          Dołącz do spotkania
        </Button>
      )}

      <div className="-mx-1 -mb-1 flex items-center gap-1 border-t border-border/70 pt-2">
        <Button variant="ghost" size="sm" className="flex-1" loading={chatLoading} onClick={onChat}>
          {!chatLoading && <MessageSquare className="size-4 text-primary" aria-hidden />}
          Czat
        </Button>
        {contact && (
          <a
            href={contactHref}
            className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-2 text-sm font-medium transition-colors active:bg-muted"
          >
            <ContactIcon className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{contact.includes("@") ? "E-mail" : "Zadzwoń"}</span>
          </a>
        )}
        <IconButton label="Więcej akcji" className="text-muted-foreground" onClick={onMore}>
          <Ellipsis className="size-5" aria-hidden />
        </IconButton>
      </div>
    </Card>
  )
}
