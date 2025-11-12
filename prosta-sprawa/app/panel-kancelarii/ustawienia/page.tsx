"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { AlertCircle, Loader2, Save, Info } from "lucide-react"
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ustawienia</h1>
        <p className="text-muted-foreground">Zarządzaj swoim kontem i preferencjami powiadomień</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lewa kolumna - Dane osobowe */}
        <div className="space-y-6">
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
              </div>

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Więcej ustawień ogłoszeń będzie dostępnych wkrótce
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
