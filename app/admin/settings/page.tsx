"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { Save, Loader2, Settings2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

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
