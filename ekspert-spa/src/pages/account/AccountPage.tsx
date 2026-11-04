import { Coins, CreditCard, FileText, LogOut, Package, Settings, Sparkles, type LucideIcon } from "lucide-react"
import { useState } from "react"
import { formatDate, formatPoints } from "@shared/format"
import { Screen } from "@/components/Screen"
import { ConfirmSheet } from "@/components/Sheet"
import { Avatar, Card, ErrorState, ListRow, PageHeader, Section, Skeleton } from "@/components/ui"
import { useAuth } from "@/lib/auth"
import { useLawFirm } from "@/lib/queries"
import { isPackageActive } from "./packageState"

const LINKS: { to: string; label: string; hint: string; icon: LucideIcon }[] = [
  { to: "/konto/punkty", label: "Punkty", hint: "Saldo, doładowania i historia", icon: Coins },
  { to: "/konto/pakiet", label: "Pakiet", hint: "Plany i zmiana pakietu", icon: Package },
  { to: "/konto/platnosci", label: "Subskrypcje i płatności", hint: "Zamówienia i rozliczenia", icon: CreditCard },
  { to: "/konto/faktury", label: "Faktury VAT", hint: "Lista i pobieranie PDF", icon: FileText },
  { to: "/konto/ustawienia", label: "Ustawienia", hint: "Konto, powiadomienia, wygląd", icon: Settings },
]

export function AccountPage() {
  const { logout, user } = useAuth()
  const { data: lawFirm, error, refetch } = useLawFirm()
  const [logoutOpen, setLogoutOpen] = useState(false)

  return (
    <Screen tabRoot header={<PageHeader title="Konto" />}>
      {lawFirm ? (
        <div className="hero rounded-3xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <Avatar name={lawFirm.nazwa} src={lawFirm.logo} size="lg" className="rounded-full ring-2 ring-border" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-medium leading-snug">{lawFirm.nazwa}</p>
              <p className="truncate text-[13px] text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-3.5">
            <div>
              <dt className="eyebrow">Saldo</dt>
              <dd className="text-lg font-semibold">{formatPoints(lawFirm.punktySaldo)} pkt</dd>
            </div>
            <div>
              <dt className="eyebrow">Pakiet</dt>
              <dd className="flex items-center gap-1 text-lg font-semibold">
                {isPackageActive(lawFirm) && <Sparkles className="size-4 shrink-0 text-secondary" aria-hidden />}
                <span className="truncate">{isPackageActive(lawFirm) ? lawFirm.pakietSubskrypcji : "Brak"}</span>
              </dd>
              {isPackageActive(lawFirm) && lawFirm.dataPakietuDo && (
                <dd className="text-xs text-muted-foreground">do {formatDate(lawFirm.dataPakietuDo)}</dd>
              )}
            </div>
          </dl>
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <Skeleton className="h-[188px] rounded-3xl" />
      )}

      <Section title="Zarządzanie">
        <Card flush className="divide-y divide-border/70 overflow-hidden">
          {LINKS.map(({ to, label, hint, icon }) => (
            <ListRow key={to} to={to} label={label} hint={hint} icon={icon} />
          ))}
        </Card>
      </Section>

      <Card flush className="overflow-hidden">
        <ListRow label="Wyloguj się" icon={LogOut} danger onClick={() => setLogoutOpen(true)} />
      </Card>

      <ConfirmSheet
        open={logoutOpen}
        title="Wylogować się?"
        confirmLabel="Wyloguj"
        danger
        onConfirm={() => void logout()}
        onClose={() => setLogoutOpen(false)}
      >
        Niewysłane szkice ofert zostaną usunięte z tego urządzenia.
      </ConfirmSheet>
    </Screen>
  )
}
