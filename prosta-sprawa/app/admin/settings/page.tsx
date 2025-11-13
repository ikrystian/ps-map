"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Save, Loader2, Settings2 } from "lucide-react"

interface Settings {
  maxLawFirmCategories: {
    value: string
    description: string | null
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [maxCategories, setMaxCategories] = useState("10")

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
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings2 className="h-8 w-8" />
          Ustawienia systemu
        </h1>
        <p className="text-muted-foreground">
          Zarządzaj globalnymi ustawieniami platformy
        </p>
      </div>

      <Separator />

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
              Określa ile maksymalnie kategorii może zaznaczyć kancelaria w zakresie usług.
              Kancelaria która spróbuje zaznaczyć więcej kategorii otrzyma komunikat błędu.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Zapisz zmiany
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dodatkowe sekcje ustawień można dodać tutaj */}
      <Card>
        <CardHeader>
          <CardTitle>Inne ustawienia</CardTitle>
          <CardDescription>
            Dodatkowe opcje konfiguracji (w przygotowaniu)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Więcej opcji konfiguracyjnych będzie dostępnych wkrótce.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
