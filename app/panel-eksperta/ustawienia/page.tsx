"use client"

import { DeleteAccountSection, LoginHistory } from "@/components/auth"
import { NOTIFICATION_SETTINGS_CHANGED_EVENT } from "@/components/MessageNotificationSound"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { clearAppCacheAndStorage } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  Calendar,
  CheckCircle2,
  Info,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  User,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface UserData {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface NotificationSettings {
  id?: string
  userId?: string
  emailNoweOferty: boolean
  emailWiadomosci: boolean
  emailStatusy: boolean
  smsPilne: boolean
  kontaktKlienci: boolean
  kluczowe: boolean
  wskazowkiPorady: boolean
  ofertPromocje: boolean
  przypomnienieWiadomosci: boolean
  noweFunkcje: boolean
  zmianyCenniki: boolean
  zmianyRegulamin: boolean
  kontaktDoradca: boolean
  wyswietlanieAwatara: boolean
  autoProsbOpinie: boolean
  powiadomienieDzwiekowe: boolean
  ustawieniaOgloszenia: boolean
  powiadomieniaSmNowa: boolean
  wiadomosciZbiorcze: boolean
  urlop: boolean
}

interface AccountInfo {
  createdAt: string
  lastLogin: {
    date: string
    ipAddress: string | null
  } | null
  lastFailedLogin: {
    date: string
    ipAddress: string | null
  } | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export default function LawFirmSettingsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Dane użytkownika
  const [userData, setUserData] = useState<UserData>({
    id: "",
    name: "",
    email: "",
    image: null,
  })

  // Ustawienia powiadomień
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNoweOferty: true,
    emailWiadomosci: true,
    emailStatusy: true,
    smsPilne: false,
    kontaktKlienci: true,
    kluczowe: true,
    wskazowkiPorady: true,
    ofertPromocje: true,
    przypomnienieWiadomosci: true,
    noweFunkcje: true,
    zmianyCenniki: true,
    zmianyRegulamin: true,
    kontaktDoradca: false,
    wyswietlanieAwatara: true,
    autoProsbOpinie: false,
    powiadomienieDzwiekowe: false,
    ustawieniaOgloszenia: true,
    powiadomieniaSmNowa: false,
    wiadomosciZbiorcze: true,
    urlop: false,
  })

  // Informacje o koncie
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pobierz dane użytkownika
        if (session?.user) {
          setUserData({
            id: session.user.id || "",
            name: session.user.name || "",
            email: session.user.email || "",
            image: session.user.image || null,
          })
        }

        // Pobierz ustawienia powiadomień
        const settingsRes = await fetch("/api/notification-settings")
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setNotificationSettings(settingsData)
        }

        // Pobierz informacje o koncie
        const accountRes = await fetch("/api/auth/account-info")
        if (accountRes.ok) {
          const accountData = await accountRes.json()
          setAccountInfo(accountData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Nie udało się pobrać danych")
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [session])

  const handleSettingChange = (field: keyof NotificationSettings, value: boolean) => {
    // Nie pozwól na wyłączenie obowiązkowych pól
    if ((field === "kontaktKlienci" || field === "kluczowe") && !value) {
      toast.error("Ta opcja jest obowiązkowa i nie może być wyłączona")
      return
    }

    setNotificationSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }



  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)

    try {
      const response = await fetch("/api/notification-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationSettings),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      // Powiadom globalny odtwarzacz dźwięku o zmianie ustawień (bez przeładowania)
      window.dispatchEvent(
        new CustomEvent(NOTIFICATION_SETTINGS_CHANGED_EVENT, {
          detail: { powiadomienieDzwiekowe: notificationSettings.powiadomienieDzwiekowe },
        })
      )

      toast.success("Ustawienia zostały zaktualizowane")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Nie udało się zapisać ustawień")
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleLogout = async () => {
    await clearAppCacheAndStorage()
    await signOut({ callbackUrl: "/" })
  }

  if (isLoading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie ustawień...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Ustawienia"
          subtitle="Zarządzaj swoim kontem eksperta, preferencjami komunikacji oraz bezpieczeństwem sesji."
        />

      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative z-10">
        {/* Left Column: Personal info & Account Details */}
        <div className="space-y-6">
          {/* Dane osobowe */}
          <Card variant="glass" className="rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Dane administratora konta
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs">Uaktualnij podstawowe informacje o swojej tożsamości.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Nazwa (Zablokowana edycja) */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name" className="text-xs font-semibold text-zinc-300">Nazwa</Label>
                    <span className="text-[10px] text-amber-400/80 flex items-center gap-1 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Lock className="h-3 w-3" /> Tylko do odczytu
                    </span>
                  </div>
                  <Input
                    id="name"
                    value={userData.name || ""}
                    readOnly
                    className="h-11 bg-background/20 border-border/30 rounded-xl cursor-not-allowed text-zinc-400 text-sm select-none"
                  />
                  <p className="text-xs text-zinc-500 font-light mt-0.5 leading-relaxed">
                    Aby zmienić nazwę administratora konta, skontaktuj się z administratorem strony.
                  </p>
                </div>

                {/* E-mail (Zablokowana edycja) */}
                <div className="p-4 rounded-xl bg-background/30 border border-border/30 flex items-center gap-3">
                  <Mail className="h-5 w-5 text-indigo-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-zinc-400 uppercase tracking-wider block font-medium">Adres e-mail administratora</span>
                    <span className="text-sm font-semibold text-white truncate block">{userData.email}</span>
                  </div>
                  <div title="Edycja adresu e-mail jest zablokowana" className="ml-auto shrink-0 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-zinc-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zarządzanie kontem */}
          <Card variant="glass" className="rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Zarządzanie kontem
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs">Informacje o bezpieczeństwie i akcje systemowe.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Informacje o koncie */}
              {accountInfo && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <Calendar className="h-4 w-4 text-primary" />
                    Bezpieczeństwo logowania
                  </Label>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-2.5 px-3.5 bg-background/25 border border-border/30 rounded-xl">
                      <span className="text-zinc-400">Data założenia konta:</span>
                      <span className="font-semibold text-white">{formatDateTime(accountInfo.createdAt)}</span>
                    </div>

                    {accountInfo.lastLogin && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2.5 px-3.5 bg-background/25 border border-border/30 rounded-xl">
                        <span className="text-zinc-400">Ostatnie logowanie:</span>
                        <span className="font-semibold text-white text-right">
                          {formatDateTime(accountInfo.lastLogin.date)}
                          {accountInfo.lastLogin.ipAddress && (
                            <span className="text-zinc-500 font-light block sm:inline sm:ml-2">
                              (IP: {accountInfo.lastLogin.ipAddress})
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {accountInfo.lastFailedLogin && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2.5 px-3.5 bg-rose-500/5 border border-rose-500/20 rounded-xl text-rose-400">
                        <span className="text-rose-400/80">Ostatnie błędne logowanie:</span>
                        <span className="font-bold text-right">
                          {formatDateTime(accountInfo.lastFailedLogin.date)}
                          {accountInfo.lastFailedLogin.ipAddress && (
                            <span className="text-rose-500/70 font-light block sm:inline sm:ml-2">
                              (IP: {accountInfo.lastFailedLogin.ipAddress})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator className="bg-border/20" />

              {/* Status konta */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-zinc-300">Status konta</Label>
                <div className="flex items-center gap-2.5">
                  <Badge className="bg-success/10 text-success border border-success/20 px-3 py-1 flex items-center gap-1 text-sm font-semibold tracking-wide">
                    <CheckCircle2 className="h-3 w-3" />
                    W pełni aktywne
                  </Badge>
                  <p className="text-xs text-muted-foreground font-light">
                    Ekspert jest zweryfikowana i widoczna w katalogu.
                  </p>
                </div>
              </div>

              <Separator className="bg-border/20" />

              {/* Akcje konta */}
              <div className="space-y-4">
                <Label className="text-xs font-semibold text-zinc-300">Akcje systemowe</Label>

                <div className="space-y-3">
                  {/* Wyloguj */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-background/20 group hover:border-primary/30 transition-all duration-200">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white text-sm">Wyloguj się</h4>
                      <p className="text-xs text-muted-foreground font-light mt-0.5">
                        Zakończ bieżącą sesję administratora.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="shrink-0 h-10 px-5 rounded-xl border-border/50 hover:bg-muted text-white gap-2 transition-all"
                    >
                      <LogOut className="h-4 w-4 text-zinc-400" />
                      Wyloguj
                    </Button>
                  </div>

                  {/* Usuń konto (anonimizacja danych osobowych — RODO art. 17) */}
                  <DeleteAccountSection variant="expert" />
                </div>
              </div>

              <Alert className="bg-secondary/5 border-secondary/20 text-secondary rounded-xl flex items-start gap-2.5">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <AlertDescription className="text-xs leading-relaxed font-light">
                  Przed usunięciem konta upewnij się, że zrealizowałeś wszystkie opłacone punkty w portalu.
                  Faktury i dowody księgowe pozostaną w systemie przez okres wymagany przepisami prawa.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Login history wrapped in glass card */}
          <Card variant="glass" className="rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Historia logowania
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs">Historia sesji oraz prób autoryzacji na tym koncie.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <LoginHistory noCard />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Powiadomienia & Ustawienia ogłoszenia */}
        <div className="space-y-6">
          {/* Ustawienia powiadomień */}
          <Card variant="glass" className="rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white">Preferencje powiadomień</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">Dostosuj formy powiadomień e-mail, SMS oraz dźwiękowych.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Powiadomienia e-mail */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Powiadomienia e-mail</h3>
                  <div className="space-y-3">
                    {/* Kontakt z klientami - obowiązkowe */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/25">
                      <div className="flex-1">
                        <Label
                          htmlFor="kontaktKlienci"
                          className="font-semibold text-zinc-300 text-xs"
                        >
                          Kontakt z klientami
                          <span className="text-rose-500 ml-1">*</span>
                        </Label>
                        <p className="text-sm text-zinc-500 mt-1 font-light leading-relaxed">
                          Ta opcja jest obowiązkowa i niezbędna do obsługi Twoich klientów i ich zgłoszeń.
                        </p>
                      </div>
                      <Switch
                        id="kontaktKlienci"
                        checked={notificationSettings.kontaktKlienci}
                        onCheckedChange={(checked) =>
                          handleSettingChange("kontaktKlienci", checked)
                        }
                        disabled={true}
                      />
                    </div>

                    {/* Kluczowe informacje - obowiązkowe */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/25">
                      <div className="flex-1">
                        <Label
                          htmlFor="kluczowe"
                          className="font-semibold text-zinc-300 text-xs"
                        >
                          Kluczowe informacje
                          <span className="text-rose-500 ml-1">*</span>
                        </Label>
                        <p className="text-sm text-zinc-500 mt-1 font-light leading-relaxed">
                          Powiadomienia o Twoich ofertach, ważnych zmianach w cenniku oraz regulaminach.
                        </p>
                      </div>
                      <Switch
                        id="kluczowe"
                        checked={notificationSettings.kluczowe}
                        onCheckedChange={(checked) => handleSettingChange("kluczowe", checked)}
                        disabled={true}
                      />
                    </div>

                    {/* Wskazówki, porady */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="wskazowkiPorady"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Wskazówki, porady
                        </Label>
                        <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                          Artykuły i porady jak podnieść jakość ofert oraz zwiększyć zasięgi.
                        </p>
                      </div>
                      <Switch
                        id="wskazowkiPorady"
                        checked={notificationSettings.wskazowkiPorady}
                        onCheckedChange={(checked) =>
                          handleSettingChange("wskazowkiPorady", checked)
                        }
                      />
                    </div>

                    {/* Ciekawe oferty i promocje */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="ofertPromocje"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Ciekawe oferty i promocje
                        </Label>
                        <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                          Oferty promocyjne i pakiety punktów stworzone dla Twojego profilu.
                        </p>
                      </div>
                      <Switch
                        id="ofertPromocje"
                        checked={notificationSettings.ofertPromocje}
                        onCheckedChange={(checked) =>
                          handleSettingChange("ofertPromocje", checked)
                        }
                      />
                    </div>

                    {/* Przypomnienie o nowych wiadomościach */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="przypomnienieWiadomosci"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Przypomnienie o nowych wiadomościach
                        </Label>
                        <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                          Powiadomienia na skrzynkę e-mail, kiedy klient wyśle nową wiadomość.
                        </p>
                      </div>
                      <Switch
                        id="przypomnienieWiadomosci"
                        checked={notificationSettings.przypomnienieWiadomosci}
                        onCheckedChange={(checked) =>
                          handleSettingChange("przypomnienieWiadomosci", checked)
                        }
                      />
                    </div>

                    {/* Powiadomienie o nowych funkcjach */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="noweFunkcje"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Powiadomienie o nowych funkcjach
                        </Label>
                        <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                          Aktualizacje systemu, nowo wdrożone moduły i integracje.
                        </p>
                      </div>
                      <Switch
                        id="noweFunkcje"
                        checked={notificationSettings.noweFunkcje}
                        onCheckedChange={(checked) =>
                          handleSettingChange("noweFunkcje", checked)
                        }
                      />
                    </div>

                    {/* Powiadomienia o zmianach cenników */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="zmianyCenniki"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Powiadomienia o zmianach cenników
                        </Label>
                        <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                          Informacje o zmianach w cennikach lub taryfach punktów.
                        </p>
                      </div>
                      <Switch
                        id="zmianyCenniki"
                        checked={notificationSettings.zmianyCenniki}
                        onCheckedChange={(checked) =>
                          handleSettingChange("zmianyCenniki", checked)
                        }
                      />
                    </div>

                    {/* Powiadomienia o zmianach regulaminu */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="zmianyRegulamin"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Powiadomienia o zmianach regulaminu
                        </Label>
                        <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                          Zmiany w regulaminie i polityce prywatności serwisu.
                        </p>
                      </div>
                      <Switch
                        id="zmianyRegulamin"
                        checked={notificationSettings.zmianyRegulamin}
                        onCheckedChange={(checked) =>
                          handleSettingChange("zmianyRegulamin", checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/20" />

                {/* Kontakt telefoniczny */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Kontakt telefoniczny</h3>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="kontaktDoradca"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Kontakt z doradcą
                        </Label>
                        <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                          Ważne alerty i spersonalizowane oferty wsparcia telefonicznego dla Twojego profilu.
                        </p>
                      </div>
                      <Switch
                        id="kontaktDoradca"
                        checked={notificationSettings.kontaktDoradca}
                        onCheckedChange={(checked) =>
                          handleSettingChange("kontaktDoradca", checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/20" />

                {/* Dodatkowe */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Ustawienia dodatkowe</h3>
                  <div className="space-y-3">
                    {/* Awatar */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="wyswietlanieAwatara"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Wyświetlanie awatara w katalogu
                        </Label>
                        <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                          Zgoda na pokazywanie zdjęcia profilowego/loga eksperta w katalogu.
                        </p>
                      </div>
                      <Switch
                        id="wyswietlanieAwatara"
                        checked={notificationSettings.wyswietlanieAwatara}
                        onCheckedChange={(checked) =>
                          handleSettingChange("wyswietlanieAwatara", checked)
                        }
                      />
                    </div>

                    {/* Automatyczne opinie */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="autoProsbOpinie"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Automatyczne prośby o opinie
                        </Label>
                        <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                          Wysyła zapytanie o opinię do klienta po zakończeniu realizacji sprawy.
                        </p>
                      </div>
                      <Switch
                        id="autoProsbOpinie"
                        checked={notificationSettings.autoProsbOpinie}
                        onCheckedChange={(checked) =>
                          handleSettingChange("autoProsbOpinie", checked)
                        }
                      />
                    </div>

                    {/* Dźwięk powiadomienia */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="powiadomienieDzwiekowe"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Dźwięk powiadomień na czacie
                        </Label>
                        <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                          Odtwórz dźwięk ostrzegawczy po otrzymaniu nowej wiadomości.
                        </p>
                      </div>
                      <Switch
                        id="powiadomienieDzwiekowe"
                        checked={notificationSettings.powiadomienieDzwiekowe}
                        onCheckedChange={(checked) =>
                          handleSettingChange("powiadomienieDzwiekowe", checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSavingSettings}
                    variant="primary"
                    className="h-11 px-6 text-white font-semibold rounded-xl shadow-md border-t border-white/10 gap-2 shrink-0 w-full sm:w-auto"
                  >
                    {isSavingSettings ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Zapisz ustawienia
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Box ustawienia ogłoszenia */}
          <Card variant="glass" className="rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white">Ustawienia ogłoszeń & URLOP</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">Skonfiguruj statusy wyświetlania ofert i powiadomień SMS.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                {/* Statusy ogłoszenia */}
                <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                  <div className="flex-1">
                    <Label
                      htmlFor="ustawieniaOgloszenia"
                      className="cursor-pointer font-semibold text-white text-xs"
                    >
                      Ustawienia widoczności
                    </Label>
                    <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                      Zezwalaj na składanie ofert bezpośrednich na profilu eksperta.
                    </p>
                  </div>
                  <Switch
                    id="ustawieniaOgloszenia"
                    checked={notificationSettings.ustawieniaOgloszenia}
                    onCheckedChange={(checked) =>
                      handleSettingChange("ustawieniaOgloszenia", checked)
                    }
                  />
                </div>

                <Separator className="bg-border/20" />

                {/* Powiadomienia SMS */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Powiadomienia SMS</h4>
                  <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                    <div className="flex-1">
                      <Label
                        htmlFor="powiadomieniaSmNowa"
                        className="cursor-pointer font-semibold text-white text-xs"
                      >
                        Powiadomienia o nowych wiadomościach (SMS)
                      </Label>
                      <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                        Wyślij SMS na numer komórkowy po otrzymaniu nowej wiadomości.
                      </p>
                    </div>
                    <Switch
                      id="powiadomieniaSmNowa"
                      checked={notificationSettings.powiadomieniaSmNowa}
                      onCheckedChange={(checked) =>
                        handleSettingChange("powiadomieniaSmNowa", checked)
                      }
                    />
                  </div>
                </div>

                <Separator className="bg-border/20" />

                {/* Wiadomości zbiorcze */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Wiadomości zbiorcze</h4>
                  <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                    <div className="flex-1">
                      <Label
                        htmlFor="wiadomosciZbiorcze"
                        className="cursor-pointer font-semibold text-white text-xs"
                      >
                        Otrzymywanie raportów zbiorczych
                      </Label>
                      <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                        Grupuj e-maile z powiadomieniami w jeden dobowy raport.
                      </p>
                    </div>
                    <Switch
                      id="wiadomosciZbiorcze"
                      checked={notificationSettings.wiadomosciZbiorcze}
                      onCheckedChange={(checked) =>
                        handleSettingChange("wiadomosciZbiorcze", checked)
                      }
                    />
                  </div>
                </div>

                <Separator className="bg-border/20" />

                {/* Tryb urlopowy */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Tryb urlopowy</h4>
                  <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-secondary/30 bg-secondary/5 hover:bg-secondary/10 transition-all duration-200">
                    <div className="flex-1">
                      <Label
                        htmlFor="urlop"
                        className="cursor-pointer font-semibold text-secondary text-xs"
                      >
                        Tryb urlopowy (Status zawieszony)
                      </Label>
                      <p className="text-sm text-secondary/80 mt-1 font-light leading-relaxed">
                        Wyłącz widoczność w katalogu na czas nieobecności i zablokuj powiadomienia e-mail/SMS.
                      </p>
                    </div>
                    <Switch
                      id="urlop"
                      checked={notificationSettings.urlop}
                      onCheckedChange={(checked) =>
                        handleSettingChange("urlop", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>



    </div>
  )
}
