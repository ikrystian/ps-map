import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, FileText, Loader2, Mail, ShieldCheck, Trash2 } from "lucide-react"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { formatDate, formatDateTime } from "@shared/format"
import { Screen } from "@/components/Screen"
import { Sheet } from "@/components/Sheet"
import { useToast } from "@/components/toast"
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Field,
  ListRow,
  PageHeader,
  PasswordInput,
  RowsSkeleton,
  Section,
  Segmented,
  Toggle,
} from "@/components/ui"
import { API_URL, api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { getAppVersion, haptic, openExternal } from "@/lib/native"
import { useLawFirm } from "@/lib/queries"
import { useThemeMode, type ThemeMode } from "@/lib/theme"
import type { AccountInfo, LoginRecord, RetentionSummary } from "@/lib/types"

type NotificationSettings = Record<string, boolean | string | null>

const CONFIRMATION_PHRASE = "USUWAM KONTO"
const SAVE_DELAY = 500

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "dark", label: "Ciemny" },
  { value: "light", label: "Jasny" },
  { value: "system", label: "Systemowy" },
]

interface SettingOption {
  key: string
  label: string
  description: string
  locked?: boolean
}

const SETTING_GROUPS: { title: string; options: SettingOption[] }[] = [
  {
    title: "Powiadomienia e-mail",
    options: [
      { key: "kontaktKlienci", label: "Kontakt z klientami", description: "Niezbędne do obsługi klientów i ich zgłoszeń.", locked: true },
      { key: "kluczowe", label: "Kluczowe informacje", description: "Oferty, ważne zmiany w cenniku i regulaminach.", locked: true },
      { key: "wskazowkiPorady", label: "Wskazówki, porady", description: "Jak podnieść jakość ofert i zwiększyć zasięgi." },
      { key: "ofertPromocje", label: "Ciekawe oferty i promocje", description: "Oferty promocyjne i pakiety punktów." },
      { key: "przypomnienieWiadomosci", label: "Przypomnienie o wiadomościach", description: "E-mail, gdy klient wyśle nową wiadomość." },
      { key: "noweFunkcje", label: "Nowe funkcje", description: "Aktualizacje systemu i nowe moduły." },
      { key: "zmianyCenniki", label: "Zmiany cenników", description: "Zmiany w cennikach i taryfach punktów." },
      { key: "zmianyRegulamin", label: "Zmiany regulaminu", description: "Regulamin i polityka prywatności serwisu." },
      { key: "kontaktDoradca", label: "Kontakt z doradcą", description: "Alerty i oferty wsparcia telefonicznego." },
    ],
  },
  {
    title: "Profil i opinie",
    options: [
      { key: "wyswietlanieAwatara", label: "Awatar w katalogu", description: "Pokazuj zdjęcie lub logo eksperta w katalogu." },
      { key: "autoProsbOpinie", label: "Automatyczne prośby o opinie", description: "Po zakończeniu realizacji sprawy." },
    ],
  },
  {
    title: "Ogłoszenia i urlop",
    options: [
      { key: "ustawieniaOgloszenia", label: "Oferty bezpośrednie", description: "Zezwalaj na składanie ofert na profilu eksperta." },
      { key: "powiadomieniaSmNowa", label: "SMS o nowych wiadomościach", description: "SMS po otrzymaniu nowej wiadomości." },
      { key: "wiadomosciZbiorcze", label: "Raporty zbiorcze", description: "Grupuj e-maile w jeden dobowy raport." },
      { key: "urlop", label: "Tryb urlopowy", description: "Ukryj profil w katalogu i wstrzymaj powiadomienia." },
    ],
  },
]

export function SettingsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [themeMode, setThemeMode] = useThemeMode()
  const { data: lawFirm } = useLawFirm()
  const { data: accountInfo } = useQuery({
    queryKey: ["account-info"],
    queryFn: () => api<AccountInfo>("/api/auth/account-info"),
  })
  const { data: loginHistory } = useQuery({
    queryKey: ["login-history"],
    queryFn: () => api<{ loginHistory: LoginRecord[] }>("/api/auth/login-history"),
  })
  const { data: savedSettings, isPending, error, refetch } = useQuery({
    queryKey: ["notification-settings"],
    queryFn: () => api<NotificationSettings>("/api/notification-settings"),
  })
  const { data: appVersion } = useQuery({ queryKey: ["app-version"], queryFn: getAppVersion, staleTime: Infinity })
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [emailSheetOpen, setEmailSheetOpen] = useState(false)
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unsaved = useRef<NotificationSettings | null>(null)

  useEffect(() => {
    if (savedSettings && !unsaved.current) setSettings(savedSettings)
  }, [savedSettings])

  const save = useMutation({
    mutationFn: (next: NotificationSettings) => api("/api/notification-settings", { method: "PUT", body: next }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notification-settings"] })
    },
    onError: (err) => {
      toast.error(err)
      // Ekran ma pokazywać stan z serwera, a nie przełącznik, który się nie zapisał
      if (savedSettings) setSettings(savedSettings)
    },
  })
  const saveRef = useRef(save.mutate)
  saveRef.current = save.mutate

  // Wyjście z ekranu tuż po przełączeniu nie może zgubić zmiany
  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (unsaved.current) saveRef.current(unsaved.current)
    },
    []
  )

  const updateSetting = (key: string, checked: boolean) => {
    if (!settings) return
    haptic("light")
    const next = { ...settings, [key]: checked }
    setSettings(next)
    unsaved.current = next
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      unsaved.current = null
      save.mutate(next)
    }, SAVE_DELAY)
  }

  return (
    <Screen header={<PageHeader title="Ustawienia" back="/konto" />}>
      <Section title="Wygląd">
        <Segmented label="Motyw aplikacji" value={themeMode} onChange={setThemeMode} options={THEME_OPTIONS} />
      </Section>

      <Section title="Dane konta">
        <Card className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Nazwa</p>
            <p className="font-medium">{user?.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Zmianę nazwy wykonuje administrator serwisu.</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Adres e-mail</p>
              <p className="truncate font-medium">{user?.email}</p>
            </div>
            <Button variant="soft" size="sm" onClick={() => setEmailSheetOpen(true)}>
              Zmień
            </Button>
          </div>
          {lawFirm && (
            <div className="flex flex-wrap gap-1.5">
              <Badge tone={lawFirm.zweryfikowana ? "success" : "warning"}>
                {lawFirm.zweryfikowana ? "Profil zweryfikowany" : "Oczekuje na weryfikację"}
              </Badge>
              <Badge tone={lawFirm.aktywna ? "success" : "neutral"}>{lawFirm.aktywna ? "Aktywny" : "Nieaktywny"}</Badge>
            </div>
          )}
        </Card>
      </Section>

      <Section title="Bezpieczeństwo logowania">
        <Card className="space-y-2 text-sm">
          {accountInfo && (
            <>
              <Row label="Konto założone" value={formatDateTime(accountInfo.createdAt)} />
              {accountInfo.lastLogin && <Row label="Ostatnie logowanie" value={formatDateTime(accountInfo.lastLogin.date)} />}
              {accountInfo.lastFailedLogin && (
                <Row label="Nieudana próba" value={formatDateTime(accountInfo.lastFailedLogin.date)} />
              )}
            </>
          )}
          {!!loginHistory?.loginHistory.length && (
            <ul className="space-y-1.5 border-t border-border/70 pt-2">
              {loginHistory.loginHistory.slice(0, 5).map((record) => (
                <li key={record.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {formatDateTime(record.createdAt)}
                    {record.location ? ` · ${record.location}` : ""}
                  </span>
                  <Badge tone={record.success ? "success" : "danger"}>{record.success ? "Udane" : "Nieudane"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Section>

      {isPending || !settings ? (
        error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : (
          <RowsSkeleton rows={4} label="Wczytywanie ustawień…" />
        )
      ) : (
        SETTING_GROUPS.map((group, index) => (
          <Section
            key={group.title}
            title={group.title}
            action={index === 0 ? <SaveStatus saving={save.isPending} saved={save.isSuccess} /> : undefined}
          >
            <Card flush className="divide-y divide-border/70 px-4">
              {group.options.map((option) => (
                <Toggle
                  key={option.key}
                  label={option.label}
                  description={option.description}
                  checked={option.locked ? true : !!settings[option.key]}
                  disabled={option.locked}
                  onChange={(checked) => updateSetting(option.key, checked)}
                />
              ))}
            </Card>
          </Section>
        ))
      )}

      <Section title="Informacje">
        <Card flush className="divide-y divide-border/70 overflow-hidden">
          <ListRow icon={FileText} label="Regulamin" onClick={() => void openExternal(`${API_URL}/regulamin`)} />
          <ListRow icon={ShieldCheck} label="Polityka prywatności" onClick={() => void openExternal(`${API_URL}/polityka-prywatnosci`)} />
          {appVersion && <ListRow label="Wersja aplikacji" value={appVersion} />}
        </Card>
      </Section>

      <Card flush className="overflow-hidden">
        <ListRow icon={Trash2} label="Usuń konto" danger onClick={() => setDeleteSheetOpen(true)} />
      </Card>

      <ChangeEmailSheet open={emailSheetOpen} onClose={() => setEmailSheetOpen(false)} />
      <DeleteAccountSheet open={deleteSheetOpen} onClose={() => setDeleteSheetOpen(false)} />
    </Screen>
  )
}

function SaveStatus({ saving, saved }: { saving: boolean; saved: boolean }) {
  if (saving) {
    return (
      <span role="status" className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        Zapisywanie
      </span>
    )
  }
  if (saved) {
    return (
      <span role="status" className="flex items-center gap-1 text-xs text-success">
        <CheckCircle2 className="size-3.5" aria-hidden />
        Zapisano
      </span>
    )
  }
  return null
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

function ChangeEmailSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [newEmail, setNewEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sentTo, setSentTo] = useState<string | null>(null)

  const change = useMutation({
    mutationFn: () => api("/api/account/email-change", { method: "POST", body: { newEmail, password } }),
    onSuccess: () => setSentTo(newEmail.trim().toLowerCase()),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    change.mutate()
  }

  const close = () => {
    setPassword("")
    setSentTo(null)
    change.reset()
    onClose()
  }

  return (
    <Sheet open={open} title="Zmiana adresu e-mail" onClose={close}>
      {sentTo ? (
        <>
          <div className="flex items-start gap-3 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
            <Mail className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p>Wysłaliśmy link potwierdzający na {sentTo}. Adres zmieni się po jego kliknięciu.</p>
          </div>
          <Button className="w-full" onClick={close}>
            Gotowe
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {change.error && <p className="text-sm text-destructive">{change.error.message}</p>}
          <Field label="Nowy adres e-mail">
            {(props) => (
              <input
                {...props}
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            )}
          </Field>
          <Field label="Aktualne hasło">
            {(props) => (
              <PasswordInput
                {...props}
                autoComplete="current-password"
                enterKeyHint="send"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button variant="outline" onClick={close}>
              Anuluj
            </Button>
            <Button type="submit" loading={change.isPending}>
              Wyślij link
            </Button>
          </div>
        </form>
      )}
    </Sheet>
  )
}

function DeleteAccountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { logout } = useAuth()
  const toast = useToast()
  const [confirmation, setConfirmation] = useState("")
  const { data: summary } = useQuery({
    queryKey: ["deletion-summary"],
    queryFn: () => api<RetentionSummary>("/api/auth/me/deletion-summary"),
    enabled: open,
  })

  const remove = useMutation({
    mutationFn: () =>
      api("/api/auth/me", { method: "DELETE", body: { reason: "Żądanie usunięcia konta z aplikacji mobilnej" } }),
    onSuccess: () => {
      toast.success("Konto zostało usunięte, a Twoje dane osobowe zanonimizowane")
      void logout()
    },
    onError: toast.error,
  })

  const retained = summary
    ? [
        summary.invoices > 0 && `faktury (${summary.invoices})`,
        summary.paidOrders > 0 && `opłacone zamówienia (${summary.paidOrders})`,
        summary.cases > 0 && `zgłoszone sprawy (${summary.cases})`,
        summary.offers > 0 && `złożone oferty (${summary.offers})`,
      ].filter(Boolean)
    : []

  return (
    <Sheet open={open} title="Usunięcie konta" onClose={onClose}>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Twoje dane osobowe zostaną zanonimizowane, a logowanie przestanie być możliwe. Tej operacji nie można cofnąć.</p>
        {retained.length > 0 && summary && (
          <p>
            Dane wymagane przepisami zachowamy do {formatDate(summary.retentionUntil)}: {retained.join(", ")}.
          </p>
        )}
      </div>
      <Field label={`Wpisz „${CONFIRMATION_PHRASE}”, aby potwierdzić`}>
        {(props) => (
          <input
            {...props}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
        )}
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onClose}>
          Anuluj
        </Button>
        <Button
          variant="danger"
          disabled={confirmation.trim().toUpperCase() !== CONFIRMATION_PHRASE}
          loading={remove.isPending}
          onClick={() => remove.mutate()}
        >
          Usuń konto
        </Button>
      </div>
    </Sheet>
  )
}
