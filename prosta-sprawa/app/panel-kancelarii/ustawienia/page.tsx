"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { AlertCircle, Loader2, Save, Info, LogOut, Trash2, CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserData {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface NotificationSettings {
  id?: string
  userId?: string
  // Stare pola
  emailNoweOferty: boolean
  emailWiadomosci: boolean
  emailStatusy: boolean
  smsPilne: boolean
  // Powiadomienia e-mail
  kontaktKlienci: boolean
  kluczowe: boolean
  wskazowkiPorady: boolean
  ofertPromocje: boolean
  przypomnienieWiadomosci: boolean
  noweFunkcje: boolean
  zmianyCenniki: boolean
  zmianyRegulamin: boolean
  // Kontakt telefoniczny
  kontaktDoradca: boolean
  // Dodatkowe
  wyswietlanieAwatara: boolean
  autoProsbOpinie: boolean
  powiadomienieDzwiekowe: boolean
  // Ustawienia ogłoszenia
  ustawieniaOgloszenia: boolean
  powiadomieniaSmNowa: boolean
  wiadomosciZbiorcze: boolean
  urlop: boolean
}

export default function LawFirmSettingsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingUser, setIsSavingUser] = useState(false)
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

  const handleUserDataChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

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

  const handleSaveUserData = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingUser(true)

    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user data")
      }

      toast.success("Dane osobowe zostały zaktualizowane")
    } catch (error) {
      console.error("Error saving user data:", error)
      toast.error("Nie udało się zapisać danych osobowych")
    } finally {
      setIsSavingUser(false)
    }
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

      toast.success("Ustawienia zostały zaktualizowane")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Nie udało się zapisać ustawień")
    } finally {
      setIsSavingSettings(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete account")
      }

      toast.success("Konto zostało usunięte")
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Nie udało się usunąć konta")
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ustawienia</h1>
        <p className="text-muted-foreground">Zarządzaj swoim kontem i preferencjami powiadomień</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lewa kolumna - Dane osobowe i Konto */}
        <div className="space-y-6">
          {/* Dane osobowe */}
          <Card>
            <CardHeader>
              <CardTitle>Dane osobowe</CardTitle>
              <CardDescription>Edytuj swoje podstawowe informacje</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveUserData} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Imię i nazwisko</Label>
                  <Input
                    id="name"
                    value={userData.name || ""}
                    onChange={(e) => handleUserDataChange("name", e.target.value)}
                    placeholder="Wpisz swoje imię i nazwisko"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={userData.email} disabled />
                  <p className="text-xs text-muted-foreground">
                    Email nie może być zmieniony z poziomu ustawień
                  </p>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSavingUser}>
                    {isSavingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Zapisz dane osobowe
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Zarządzanie kontem */}
          <Card>
            <CardHeader>
              <CardTitle>Zarządzanie kontem</CardTitle>
              <CardDescription>Zarządzaj swoim kontem i bezpieczeństwem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status konta */}
              <div className="space-y-2">
                <Label>Status konta</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Aktywny
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Twoje konto jest w pełni aktywne
                  </p>
                </div>
              </div>

              <Separator />

              {/* Akcje konta */}
              <div className="space-y-4">
                <Label>Akcje konta</Label>

                <div className="space-y-3">
                  {/* Wyloguj */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">Wyloguj się</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Zakończ bieżącą sesję i wyloguj się z konta
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="ml-4"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Wyloguj
                    </Button>
                  </div>

                  {/* Usuń konto */}
                  <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                    <div className="flex-1">
                      <h4 className="font-medium text-destructive">Usuń konto</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Trwale usuń swoje konto i wszystkie powiązane dane. Tej akcji nie można cofnąć.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="ml-4"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Usuń konto
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Czy na pewno chcesz usunąć konto?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ta akcja jest nieodwracalna. Wszystkie Twoje dane, w tym profil kancelarii,
                            oferty, wiadomości i historia zostaną trwale usunięte. Nie będziesz mógł
                            odzyskać tych danych.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anuluj</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Tak, usuń moje konto
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Jeśli masz aktywne ogłoszenia lub subskrypcję, upewnij się, że je zakończyłeś
                  przed usunięciem konta.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Prawa kolumna - Ustawienia powiadomień */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia ogólne</CardTitle>
              <CardDescription>Dostosuj preferencje powiadomień</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Powiadomienia e-mail */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Powiadomienia e-mail</h3>
                    <div className="space-y-3">
                      {/* Kontakt z klientami - obowiązkowe */}
                      <div className="flex items-start justify-between space-x-2 p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <Label
                            htmlFor="kontaktKlienci"
                            className="cursor-pointer font-medium"
                          >
                            Kontakt z klientami
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ta opcja musi być włączona, ponieważ jest kluczowa do działania Twojego konta.
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
                      <div className="flex items-start justify-between space-x-2 p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <Label
                            htmlFor="kluczowe"
                            className="cursor-pointer font-medium"
                          >
                            Kluczowe informacje
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Dotyczą informacji o Twojej ofercie, zasadach działania portalu, a także
                            modyfikacjach wynikających ze zmiany cennika, regulaminu i polityki
                            prywatności serwisu.
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
                      <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <Label
                            htmlFor="wskazowkiPorady"
                            className="cursor-pointer font-medium"
                          >
                            Wskazówki, porady
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Dotyczą wskazówek i porad, jak ulepszyć i zwiększyć widoczność Twojej oferty.
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
                      <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <Label
                            htmlFor="ofertPromocje"
                            className="cursor-pointer font-medium"
                          >
                            Ciekawe oferty i promocje
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Dotyczą ofert i promocji przygotowanych specjalnie dla Twojej oferty.
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
                      <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <Label
                            htmlFor="przypomnienieWiadomosci"
                            className="cursor-pointer font-medium"
                          >
                            Przypomnienie o nowych wiadomościach
                          </Label>
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
                      <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <Label
                            htmlFor="noweFunkcje"
                            className="cursor-pointer font-medium"
                          >
                            Powiadomienie o nowych funkcjach
                          </Label>
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
                      <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <Label
                            htmlFor="zmianyCenniki"
                            className="cursor-pointer font-medium"
                          >
                            Powiadomienia o zmianach cenników
                          </Label>
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
                      <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <Label
                            htmlFor="zmianyRegulamin"
                            className="cursor-pointer font-medium"
                          >
                            Powiadomienia o zmianach regulaminu
                          </Label>
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

                  <Separator />

                  {/* Kontakt telefoniczny */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Kontakt telefoniczny</h3>
                    <div className="space-y-3">
                      {/* Kontakt z doradcą */}
                      <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <Label
                            htmlFor="kontaktDoradca"
                            className="cursor-pointer font-medium"
                          >
                            Kontakt z doradcą
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Dotyczy ważnych informacji i zmian w Twoich ogłoszeniach w serwisie.
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

                  <Separator />

                  {/* Dodatkowe */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Dodatkowe</h3>
                    <div className="space-y-3">
                      {/* Zgoda na wyświetlanie awatara */}
                      <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <Label
                            htmlFor="wyswietlanieAwatara"
                            className="cursor-pointer font-medium"
                          >
                            Zgoda na wyświetlanie awatara (wizerunek)
                          </Label>
                        </div>
                        <Switch
                          id="wyswietlanieAwatara"
                          checked={notificationSettings.wyswietlanieAwatara}
                          onCheckedChange={(checked) =>
                            handleSettingChange("wyswietlanieAwatara", checked)
                          }
                        />
                      </div>

                      {/* Zgoda na automatyczne wysłanie prośby o dodanie opinii */}
                      <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <Label
                            htmlFor="autoProsbOpinie"
                            className="cursor-pointer font-medium"
                          >
                            Zgoda na automatyczne wysłanie prośby o dodanie opinii
                          </Label>
                        </div>
                        <Switch
                          id="autoProsbOpinie"
                          checked={notificationSettings.autoProsbOpinie}
                          onCheckedChange={(checked) =>
                            handleSettingChange("autoProsbOpinie", checked)
                          }
                        />
                      </div>

                      {/* Powiadomienie dźwiękowe o nowej wiadomości */}
                      <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <Label
                            htmlFor="powiadomienieDzwiekowe"
                            className="cursor-pointer font-medium"
                          >
                            Powiadomienie dźwiękowe o nowej wiadomości
                          </Label>
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
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSavingSettings}>
                    {isSavingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Zapisz ustawienia
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Box ustawienia ogłoszenia */}
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia ogłoszenia</CardTitle>
              <CardDescription>Zarządzaj ustawieniami dotyczącymi ogłoszeń</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <Label
                      htmlFor="ustawieniaOgloszenia"
                      className="cursor-pointer font-medium"
                    >
                      Ustawienia ogłoszenia
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Włącz lub wyłącz dodatkowe opcje związane z ogłoszeniami
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

                <Separator />

                {/* Powiadomienia SMS */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Powiadomienia SMS</h4>
                  <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <Label
                        htmlFor="powiadomieniaSmNowa"
                        className="cursor-pointer font-medium"
                      >
                        Nowa wiadomość
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Otrzymuj powiadomienia SMS o nowych wiadomościach
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

                <Separator />

                {/* Powiadomienia e-mail */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Powiadomienia e-mail</h4>
                  <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <Label
                        htmlFor="wiadomosciZbiorcze"
                        className="cursor-pointer font-medium"
                      >
                        Otrzymywanie wiadomości zbiorczych
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Otrzymuj zbiorcze powiadomienia e-mail zamiast pojedynczych
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

                <Separator />

                {/* Urlop */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Tryb urlopowy</h4>
                  <div className="flex items-start justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <Label
                        htmlFor="urlop"
                        className="cursor-pointer font-medium"
                      >
                        Urlop
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Włącz tryb urlopowy - ogranicza powiadomienia podczas Twojej nieobecności
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

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Dostosuj powiadomienia zgodnie ze swoimi potrzebami
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
