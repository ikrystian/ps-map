"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Settings2 } from "lucide-react"
import { useEffect, useState } from "react"

interface Settings {
  maxLawFirmCategories: {
    value: string
    description: string | null
  }
  siteName: {
    value: string
    description: string | null
  }
  contactEmail: {
    value: string
    description: string | null
  }
  supportEmail: {
    value: string
    description: string | null
  }
  reviewsPerPage: {
    value: string
    description: string | null
  }
  minReviewLength: {
    value: string
    description: string | null
  }
  featuredCategoriesLimit: {
    value: string
    description: string | null
  }
  maxLawFirmTags: {
    value: string
    description: string | null
  }
  showExpertTutorial?: {
    value: string
    description: string | null
  }
  autoApproveTestPayment?: {
    value: string
    description: string | null
  }
  enablePaymentTest?: {
    value: string
    description: string | null
  }
  enablePaymentPrzelewy24?: {
    value: string
    description: string | null
  }
  enablePaymentPayU?: {
    value: string
    description: string | null
  }
  enablePaymentPrzelew?: {
    value: string
    description: string | null
  }
  deleteReviewCostRating1?: {
    value: string
    description: string | null
  }
  deleteReviewCostRating2?: {
    value: string
    description: string | null
  }
  deleteReviewCostRating3?: {
    value: string
    description: string | null
  }
  enableUserSelectionOnLogin?: {
    value: string
    description: string | null
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [maxCategories, setMaxCategories] = useState("10")
  const [siteName, setSiteName] = useState("Prosta Sprawa")
  const [contactEmail, setContactEmail] = useState("kontakt@prostasprawa.pl")
  const [supportEmail, setSupportEmail] = useState("pomoc@prostasprawa.pl")
  const [reviewsPerPage, setReviewsPerPage] = useState("10")
  const [minReviewLength, setMinReviewLength] = useState("50")
  const [featuredCategoriesLimit, setFeaturedCategoriesLimit] = useState("8")
  const [maxTags, setMaxTags] = useState("5")
  const [showExpertTutorial, setShowExpertTutorial] = useState("true")
  const [autoApproveTestPayment, setAutoApproveTestPayment] = useState("true")
  const [enablePaymentTest, setEnablePaymentTest] = useState("true")
  const [enablePaymentPrzelewy24, setEnablePaymentPrzelewy24] = useState("true")
  const [enablePaymentPayU, setEnablePaymentPayU] = useState("true")
  const [enablePaymentPrzelew, setEnablePaymentPrzelew] = useState("true")
  const [deleteCost1, setDeleteCost1] = useState("500")
  const [deleteCost2, setDeleteCost2] = useState("300")
  const [deleteCost3, setDeleteCost3] = useState("100")
  const [enableUserSelectionOnLogin, setEnableUserSelectionOnLogin] = useState("true")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setMaxCategories(data.maxLawFirmCategories?.value || "10")
        setSiteName(data.siteName?.value || "Prosta Sprawa")
        setContactEmail(data.contactEmail?.value || "kontakt@prostasprawa.pl")
        setSupportEmail(data.supportEmail?.value || "pomoc@prostasprawa.pl")
        setReviewsPerPage(data.reviewsPerPage?.value || "10")
        setMinReviewLength(data.minReviewLength?.value || "50")
        setFeaturedCategoriesLimit(data.featuredCategoriesLimit?.value || "8")
        setMaxTags(data.maxLawFirmTags?.value || "5")
        setShowExpertTutorial(data.showExpertTutorial?.value || "true")
        setAutoApproveTestPayment(data.autoApproveTestPayment?.value || "true")
        setEnablePaymentTest(data.enablePaymentTest?.value || "true")
        setEnablePaymentPrzelewy24(data.enablePaymentPrzelewy24?.value || "true")
        setEnablePaymentPayU(data.enablePaymentPayU?.value || "true")
        setEnablePaymentPrzelew(data.enablePaymentPrzelew?.value || "true")
        setDeleteCost1(data.deleteReviewCostRating1?.value || "500")
        setDeleteCost2(data.deleteReviewCostRating2?.value || "300")
        setDeleteCost3(data.deleteReviewCostRating3?.value || "100")
        setEnableUserSelectionOnLogin(data.enableUserSelectionOnLogin?.value || "true")
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Nie udało się pobrać ustawień")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Walidacja
    const maxCategoriesNum = parseInt(maxCategories)
    if (isNaN(maxCategoriesNum) || maxCategoriesNum < 1 || maxCategoriesNum > 100) {
      toast.error("Maksymalna liczba kategorii musi być liczbą od 1 do 100")
      return
    }

    const maxTagsNum = parseInt(maxTags)
    if (isNaN(maxTagsNum) || maxTagsNum < 1 || maxTagsNum > 100) {
      toast.error("Maksymalna liczba słów kluczowych musi być liczbą od 1 do 100")
      return
    }

    const reviewsPerPageNum = parseInt(reviewsPerPage)
    if (isNaN(reviewsPerPageNum) || reviewsPerPageNum < 5 || reviewsPerPageNum > 50) {
      toast.error("Liczba opinii na stronę musi być liczbą od 5 do 50")
      return
    }

    const minReviewLengthNum = parseInt(minReviewLength)
    if (isNaN(minReviewLengthNum) || minReviewLengthNum < 10 || minReviewLengthNum > 500) {
      toast.error("Minimalna długość opinii musi być liczbą od 10 do 500")
      return
    }

    const featuredCategoriesLimitNum = parseInt(featuredCategoriesLimit)
    if (isNaN(featuredCategoriesLimitNum) || featuredCategoriesLimitNum < 4 || featuredCategoriesLimitNum > 20) {
      toast.error("Limit wyróżnionych kategorii musi być liczbą od 4 do 20")
      return
    }

    if (!contactEmail || !supportEmail) {
      toast.error("Adresy email są wymagane")
      return
    }

    const deleteCost1Num = parseInt(deleteCost1)
    const deleteCost2Num = parseInt(deleteCost2)
    const deleteCost3Num = parseInt(deleteCost3)
    if (isNaN(deleteCost1Num) || deleteCost1Num < 0 || isNaN(deleteCost2Num) || deleteCost2Num < 0 || isNaN(deleteCost3Num) || deleteCost3Num < 0) {
      toast.error("Koszty usunięcia opinii muszą być liczbami większymi lub równymi 0")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: {
            maxLawFirmCategories: {
              value: maxCategories,
              description: "Maksymalna liczba kategorii, które może zaznaczyć kancelaria",
            },
            siteName: {
              value: siteName,
              description: "Nazwa serwisu wyświetlana w nagłówku i meta tagach",
            },
            contactEmail: {
              value: contactEmail,
              description: "Email kontaktowy wyświetlany na stronie",
            },
            supportEmail: {
              value: supportEmail,
              description: "Email wsparcia technicznego",
            },
            reviewsPerPage: {
              value: reviewsPerPage,
              description: "Liczba opinii wyświetlanych na jednej stronie",
            },
            minReviewLength: {
              value: minReviewLength,
              description: "Minimalna długość opinii w znakach",
            },
            featuredCategoriesLimit: {
              value: featuredCategoriesLimit,
              description: "Maksymalna liczba wyróżnionych kategorii na stronie głównej",
            },
            maxLawFirmTags: {
              value: maxTags,
              description: "Maksymalna liczba słów kluczowych dla kancelarii bez aktywnego pakietu",
            },
            showExpertTutorial: {
              value: showExpertTutorial,
              description: "Czy wyświetlać samouczek (krok po kroku) w panelu eksperta",
            },
            autoApproveTestPayment: {
              value: autoApproveTestPayment,
              description: "Czy płatność testowa (TEST) ma być automatycznie akceptowana przez system (status ZAPLACONE)",
            },
            enablePaymentTest: {
              value: enablePaymentTest,
              description: "Czy płatność testowa (TEST) ma być dostępna jako metoda płatności",
            },
            enablePaymentPrzelewy24: {
              value: enablePaymentPrzelewy24,
              description: "Czy płatność przez Przelewy24 ma być dostępna jako metoda płatności",
            },
            enablePaymentPayU: {
              value: enablePaymentPayU,
              description: "Czy płatność przez PayU ma być dostępna jako metoda płatności",
            },
            enablePaymentPrzelew: {
              value: enablePaymentPrzelew,
              description: "Czy płatność przelewem tradycyjnym ma być dostępna jako metoda płatności",
            },
            deleteReviewCostRating1: {
              value: deleteCost1,
              description: "Koszt usunięcia opinii z oceną 1★ w punktach",
            },
            deleteReviewCostRating2: {
              value: deleteCost2,
              description: "Koszt usunięcia opinii z oceną 2★ w punktach",
            },
            deleteReviewCostRating3: {
              value: deleteCost3,
              description: "Koszt usunięcia opinii z oceną 3★ w punktach",
            },
            enableUserSelectionOnLogin: {
              value: enableUserSelectionOnLogin,
              description: "Czy włączyć listę wyboru użytkowników na stronie logowania",
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Nie udało się zapisać ustawień")
      }

      toast.success("Ustawienia zostały zapisane")
      fetchSettings()
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Nie udało się zapisać ustawień")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium tracking-tight font-playfair">
          <Settings2 className="h-8 w-8" />
          Ustawienia systemu
        </h1>
        <p className="text-muted-foreground">
          Zarządzaj globalnymi ustawieniami platformy
        </p>
      </div>

      <Separator />

      {/* Ustawienia ogólne */}
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia ogólne</CardTitle>
          <CardDescription>
            Podstawowe informacje o serwisie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">
              Nazwa serwisu
            </Label>
            <Input
              id="siteName"
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Prosta Sprawa"
            />
            <p className="text-sm text-muted-foreground">
              Nazwa wyświetlana w nagłówku strony i meta tagach
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">
                Email kontaktowy
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="kontakt@prostasprawa.pl"
              />
              <p className="text-sm text-muted-foreground">
                Główny adres kontaktowy
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">
                Email wsparcia
              </Label>
              <Input
                id="supportEmail"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="pomoc@prostasprawa.pl"
              />
              <p className="text-sm text-muted-foreground">
                Email wsparcia technicznego
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ustawienia kancelarii */}
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia kancelarii</CardTitle>
          <CardDescription>
            Konfiguracja parametrów dla kancelarii prawnych
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxCategories">
              Maksymalna liczba kategorii dla kancelarii
            </Label>
            <Input
              id="maxCategories"
              type="number"
              min="1"
              max="100"
              value={maxCategories}
              onChange={(e) => setMaxCategories(e.target.value)}
              placeholder="10"
            />
            <p className="text-sm text-muted-foreground">
              Określa ile maksymalnie kategorii może zaznaczyć kancelaria w zakresie usług
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTags">
              Maksymalna liczba słów kluczowych dla kancelarii
            </Label>
            <Input
              id="maxTags"
              type="number"
              min="1"
              max="100"
              value={maxTags}
              onChange={(e) => setMaxTags(e.target.value)}
              placeholder="5"
            />
            <p className="text-sm text-muted-foreground">
              Określa ile maksymalnie słów kluczowych (tagów) może dodać kancelaria bez aktywnego pakietu
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ustawienia opinii */}
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia opinii</CardTitle>
          <CardDescription>
            Konfiguracja systemu opinii i ocen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reviewsPerPage">
                Liczba opinii na stronę
              </Label>
              <Input
                id="reviewsPerPage"
                type="number"
                min="5"
                max="50"
                value={reviewsPerPage}
                onChange={(e) => setReviewsPerPage(e.target.value)}
                placeholder="10"
              />
              <p className="text-sm text-muted-foreground">
                Ile opinii wyświetlać na jednej stronie (5-50)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minReviewLength">
                Minimalna długość opinii
              </Label>
              <Input
                id="minReviewLength"
                type="number"
                min="10"
                max="500"
                value={minReviewLength}
                onChange={(e) => setMinReviewLength(e.target.value)}
                placeholder="50"
              />
              <p className="text-sm text-muted-foreground">
                Minimalna liczba znaków w opinii (10-500)
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Koszt usunięcia opinii (w punktach)</h3>
            <p className="text-xs text-muted-foreground">
              Określ, ile punktów kosztuje usunięcie negatywnej opinii przez eksperta, w zależności od oceny (1-3 gwiazdki).
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deleteCost1">Ocena 1★</Label>
                <Input
                  id="deleteCost1"
                  type="number"
                  min="0"
                  value={deleteCost1}
                  onChange={(e) => setDeleteCost1(e.target.value)}
                  placeholder="500"
                />
                <p className="text-xs text-muted-foreground">Punkty za opinię 1★</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deleteCost2">Ocena 2★</Label>
                <Input
                  id="deleteCost2"
                  type="number"
                  min="0"
                  value={deleteCost2}
                  onChange={(e) => setDeleteCost2(e.target.value)}
                  placeholder="300"
                />
                <p className="text-xs text-muted-foreground">Punkty za opinię 2★</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deleteCost3">Ocena 3★</Label>
                <Input
                  id="deleteCost3"
                  type="number"
                  min="0"
                  value={deleteCost3}
                  onChange={(e) => setDeleteCost3(e.target.value)}
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">Punkty za opinię 3★</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ustawienia wyświetlania */}
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia wyświetlania</CardTitle>
          <CardDescription>
            Konfiguracja elementów wyświetlanych na stronie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="featuredCategoriesLimit">
              Limit wyróżnionych kategorii
            </Label>
            <Input
              id="featuredCategoriesLimit"
              type="number"
              min="4"
              max="20"
              value={featuredCategoriesLimit}
              onChange={(e) => setFeaturedCategoriesLimit(e.target.value)}
              placeholder="8"
            />
            <p className="text-sm text-muted-foreground">
              Liczba wyróżnionych kategorii na stronie głównej (4-20)
            </p>
          </div>

          <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="showExpertTutorial" className="text-base font-semibold">
                Samouczek w panelu eksperta
              </Label>
              <p className="text-sm text-muted-foreground max-w-xl">
                Włącza/wyłącza interaktywny samouczek krok po kroku dla zalogowanych ekspertów w ich panelu.
              </p>
            </div>
            <Switch
              id="showExpertTutorial"
              checked={showExpertTutorial === "true"}
              onCheckedChange={(checked) => setShowExpertTutorial(checked ? "true" : "false")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ustawienia logowania */}
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia logowania</CardTitle>
          <CardDescription>
            Konfiguracja formularza logowania w serwisie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="enableUserSelectionOnLogin" className="text-base font-semibold">
                Wybór użytkownika przy logowaniu
              </Label>
              <p className="text-sm text-muted-foreground max-w-xl">
                Włącza/wyłącza możliwość szybkiego wyboru użytkownika testowego z listy rozwijanej zamiast wpisywania adresu email.
              </p>
            </div>
            <Switch
              id="enableUserSelectionOnLogin"
              checked={enableUserSelectionOnLogin === "true"}
              onCheckedChange={(checked) => setEnableUserSelectionOnLogin(checked ? "true" : "false")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Metody płatności */}
      <Card>
        <CardHeader>
          <CardTitle>Metody płatności</CardTitle>
          <CardDescription>
            Włączaj i wyłączaj poszczególne metody płatności w systemie oraz konfiguruj ich działanie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Przelewy24 */}
          <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="enablePaymentPrzelewy24" className="text-base font-semibold">
                Przelewy24
              </Label>
              <p className="text-sm text-muted-foreground max-w-xl">
                Włącza/wyłącza płatności internetowe za pośrednictwem serwisu Przelewy24 (BLIK, szybkie przelewy, karty).
              </p>
            </div>
            <Switch
              id="enablePaymentPrzelewy24"
              checked={enablePaymentPrzelewy24 === "true"}
              onCheckedChange={(checked) => setEnablePaymentPrzelewy24(checked ? "true" : "false")}
            />
          </div>

          {/* PayU */}
          <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="enablePaymentPayU" className="text-base font-semibold">
                PayU
              </Label>
              <p className="text-sm text-muted-foreground max-w-xl">
                Włącza/wyłącza płatności internetowe za pośrednictwem serwisu PayU.
              </p>
            </div>
            <Switch
              id="enablePaymentPayU"
              checked={enablePaymentPayU === "true"}
              onCheckedChange={(checked) => setEnablePaymentPayU(checked ? "true" : "false")}
            />
          </div>

          {/* Przelew tradycyjny */}
          <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="enablePaymentPrzelew" className="text-base font-semibold">
                Przelew tradycyjny
              </Label>
              <p className="text-sm text-muted-foreground max-w-xl">
                Włącza/wyłącza opcję zapłaty przelewem tradycyjnym (wymaga ręcznego zatwierdzenia po zaksięgowaniu wpłaty).
              </p>
            </div>
            <Switch
              id="enablePaymentPrzelew"
              checked={enablePaymentPrzelew === "true"}
              onCheckedChange={(checked) => setEnablePaymentPrzelew(checked ? "true" : "false")}
            />
          </div>

          <Separator className="my-4" />

          {/* Płatność testowa */}
          <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors border-primary/20 bg-primary/5">
            <div className="space-y-0.5">
              <Label htmlFor="enablePaymentTest" className="text-base font-semibold flex items-center gap-2">
                Płatność testowa
                <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">TEST</span>
              </Label>
              <p className="text-sm text-muted-foreground max-w-xl">
                Włącza/wyłącza możliwość korzystania z płatności testowej (TEST) w systemie (symulacja płatności).
              </p>
            </div>
            <Switch
              id="enablePaymentTest"
              checked={enablePaymentTest === "true"}
              onCheckedChange={(checked) => setEnablePaymentTest(checked ? "true" : "false")}
            />
          </div>

          {/* Automatyczna akceptacja płatności testowych (widoczna tylko gdy włączona płatność testowa) */}
          {enablePaymentTest === "true" && (
            <div className="flex items-center justify-between space-y-0 rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors border-primary/20 bg-primary/5">
              <div className="space-y-0.5">
                <Label htmlFor="autoApproveTestPayment" className="text-base font-semibold flex items-center gap-2">
                  Automatyczna akceptacja płatności testowych
                  <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">TEST</span>
                </Label>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Włącza/wyłącza automatyczne zatwierdzanie płatności testowej (TEST). Gdy jest wyłączone, zamówienie uzyska status oczekującego (OCZEKUJE) i będzie wymagało zatwierdzenia w panelu admina.
                </p>
              </div>
              <Switch
                id="autoApproveTestPayment"
                checked={autoApproveTestPayment === "true"}
                onCheckedChange={(checked) => setAutoApproveTestPayment(checked ? "true" : "false")}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Przycisk zapisu */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Zapisz wszystkie ustawienia
        </Button>
      </div>
    </div>
  )
}
