"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface SubscriptionPlanForm {
  typ: string
  nazwa: string
  cena1Miesiac: number | null
  cena6Miesiecy: number | null
  cena12Miesiecy: number
  dostepDoSpraw: number | null
  kategorieSpraw: number | null
  wojewodztwa: number
  miasta: number
  priorytetWyszukiwanie: boolean
  osobistyOpiekun: number
  artykutySponsoro: boolean
  specjalneOznaczenie: string
  statystykiAnalizy: boolean
  mozliwoscBloga: boolean
  wsparcieMarketingowe: boolean
  promowanieProfilu: boolean
  powiadomieniaSprawy: number
  liczbaTakow: number
  zalaczniki: boolean
  coverBaner: boolean
  wyswietlanieReklam: boolean
  punktyGratis: number
  skillLawFocus: boolean
  aktywny: boolean
}

export default function EditSubscriptionPlanPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<SubscriptionPlanForm>({
    typ: "PODSTAWOWY",
    nazwa: "",
    cena1Miesiac: null,
    cena6Miesiecy: null,
    cena12Miesiecy: 0,
    dostepDoSpraw: null,
    kategorieSpraw: null,
    wojewodztwa: 0,
    miasta: 0,
    priorytetWyszukiwanie: false,
    osobistyOpiekun: 0,
    artykutySponsoro: false,
    specjalneOznaczenie: "",
    statystykiAnalizy: false,
    mozliwoscBloga: false,
    wsparcieMarketingowe: false,
    promowanieProfilu: false,
    powiadomieniaSprawy: 0,
    liczbaTakow: 0,
    zalaczniki: false,
    coverBaner: false,
    wyswietlanieReklam: false,
    punktyGratis: 0,
    skillLawFocus: false,
    aktywny: true,
  })

  useEffect(() => {
    fetchPlan()
  }, [params.id])

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/subscription-plans/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch plan")
      const data = await response.json()
      setFormData(data)
    } catch (error) {
      toast.error("Nie udało się pobrać danych pakietu")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/subscription-plans/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to update plan")

      toast.success("Pakiet został zaktualizowany")

      router.push("/admin/pakiety")
    } catch (error) {
      toast.error("Nie udało się zaktualizować pakietu")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof SubscriptionPlanForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNumberChange = (field: keyof SubscriptionPlanForm, value: string, allowNull = false) => {
    if (value === "" && allowNull) {
      handleChange(field, null)
    } else {
      const num = parseFloat(value)
      handleChange(field, isNaN(num) ? 0 : num)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/pakiety">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edytuj pakiet</h1>
          <p className="text-muted-foreground mt-2">
            Zmień szczegóły pakietu subskrypcji
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Podstawowe informacje */}
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe informacje</CardTitle>
              <CardDescription>Nazwa i typ pakietu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nazwa">Nazwa pakietu</Label>
                  <Input
                    id="nazwa"
                    value={formData.nazwa}
                    onChange={(e) => handleChange("nazwa", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typ">Typ pakietu</Label>
                  <Select
                    value={formData.typ}
                    onValueChange={(value) => handleChange("typ", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PODSTAWOWY">Podstawowy</SelectItem>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="BIZNES">Biznes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="aktywny"
                  checked={formData.aktywny}
                  onCheckedChange={(checked) => handleChange("aktywny", checked)}
                />
                <Label htmlFor="aktywny">Pakiet aktywny</Label>
              </div>
            </CardContent>
          </Card>

          {/* Cennik */}
          <Card>
            <CardHeader>
              <CardTitle>Cennik</CardTitle>
              <CardDescription>Ceny dla różnych okresów subskrypcji</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cena1Miesiac">Cena 1 miesiąc (zł)</Label>
                  <Input
                    id="cena1Miesiac"
                    type="number"
                    step="0.01"
                    value={formData.cena1Miesiac ?? ""}
                    onChange={(e) => handleNumberChange("cena1Miesiac", e.target.value, true)}
                    placeholder="Opcjonalne"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cena6Miesiecy">Cena 6 miesięcy (zł)</Label>
                  <Input
                    id="cena6Miesiecy"
                    type="number"
                    step="0.01"
                    value={formData.cena6Miesiecy ?? ""}
                    onChange={(e) => handleNumberChange("cena6Miesiecy", e.target.value, true)}
                    placeholder="Opcjonalne"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cena12Miesiecy">Cena 12 miesięcy (zł)</Label>
                  <Input
                    id="cena12Miesiecy"
                    type="number"
                    step="0.01"
                    value={formData.cena12Miesiecy}
                    onChange={(e) => handleNumberChange("cena12Miesiecy", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dostęp i limity */}
          <Card>
            <CardHeader>
              <CardTitle>Dostęp i limity</CardTitle>
              <CardDescription>Pozostaw puste dla nieograniczonego dostępu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dostepDoSpraw">Dostęp do spraw (∞ jeśli puste)</Label>
                  <Input
                    id="dostepDoSpraw"
                    type="number"
                    value={formData.dostepDoSpraw ?? ""}
                    onChange={(e) => handleNumberChange("dostepDoSpraw", e.target.value, true)}
                    placeholder="Nieograniczone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kategorieSpraw">Kategorie spraw (∞ jeśli puste)</Label>
                  <Input
                    id="kategorieSpraw"
                    type="number"
                    value={formData.kategorieSpraw ?? ""}
                    onChange={(e) => handleNumberChange("kategorieSpraw", e.target.value, true)}
                    placeholder="Nieograniczone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wojewodztwa">Województwa</Label>
                  <Input
                    id="wojewodztwa"
                    type="number"
                    value={formData.wojewodztwa}
                    onChange={(e) => handleNumberChange("wojewodztwa", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="miasta">Miasta</Label>
                  <Input
                    id="miasta"
                    type="number"
                    value={formData.miasta}
                    onChange={(e) => handleNumberChange("miasta", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funkcjonalności */}
          <Card>
            <CardHeader>
              <CardTitle>Funkcjonalności</CardTitle>
              <CardDescription>Zaznacz dostępne funkcjonalności</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="priorytetWyszukiwanie"
                    checked={formData.priorytetWyszukiwanie}
                    onCheckedChange={(checked) => handleChange("priorytetWyszukiwanie", checked)}
                  />
                  <Label htmlFor="priorytetWyszukiwanie">Priorytet w wyszukiwaniu</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="artykutySponsoro"
                    checked={formData.artykutySponsoro}
                    onCheckedChange={(checked) => handleChange("artykutySponsoro", checked)}
                  />
                  <Label htmlFor="artykutySponsoro">Artykuły sponsorowane</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="statystykiAnalizy"
                    checked={formData.statystykiAnalizy}
                    onCheckedChange={(checked) => handleChange("statystykiAnalizy", checked)}
                  />
                  <Label htmlFor="statystykiAnalizy">Statystyki i analizy</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="mozliwoscBloga"
                    checked={formData.mozliwoscBloga}
                    onCheckedChange={(checked) => handleChange("mozliwoscBloga", checked)}
                  />
                  <Label htmlFor="mozliwoscBloga">Możliwość prowadzenia bloga</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="wsparcieMarketingowe"
                    checked={formData.wsparcieMarketingowe}
                    onCheckedChange={(checked) => handleChange("wsparcieMarketingowe", checked)}
                  />
                  <Label htmlFor="wsparcieMarketingowe">Wsparcie marketingowe</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="promowanieProfilu"
                    checked={formData.promowanieProfilu}
                    onCheckedChange={(checked) => handleChange("promowanieProfilu", checked)}
                  />
                  <Label htmlFor="promowanieProfilu">Promowanie profilu</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="zalaczniki"
                    checked={formData.zalaczniki}
                    onCheckedChange={(checked) => handleChange("zalaczniki", checked)}
                  />
                  <Label htmlFor="zalaczniki">Załączniki</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="coverBaner"
                    checked={formData.coverBaner}
                    onCheckedChange={(checked) => handleChange("coverBaner", checked)}
                  />
                  <Label htmlFor="coverBaner">Cover baner</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="wyswietlanieReklam"
                    checked={formData.wyswietlanieReklam}
                    onCheckedChange={(checked) => handleChange("wyswietlanieReklam", checked)}
                  />
                  <Label htmlFor="wyswietlanieReklam">Wyświetlanie reklam</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="skillLawFocus"
                    checked={formData.skillLawFocus}
                    onCheckedChange={(checked) => handleChange("skillLawFocus", checked)}
                  />
                  <Label htmlFor="skillLawFocus">Skill Law Focus</Label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="osobistyOpiekun">Osobisty opiekun klienta</Label>
                  <Input
                    id="osobistyOpiekun"
                    type="number"
                    value={formData.osobistyOpiekun}
                    onChange={(e) => handleNumberChange("osobistyOpiekun", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="powiadomieniaSprawy">Powiadomienia o sprawach</Label>
                  <Input
                    id="powiadomieniaSprawy"
                    type="number"
                    value={formData.powiadomieniaSprawy}
                    onChange={(e) => handleNumberChange("powiadomieniaSprawy", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liczbaTakow">Liczba tagów</Label>
                  <Input
                    id="liczbaTakow"
                    type="number"
                    value={formData.liczbaTakow}
                    onChange={(e) => handleNumberChange("liczbaTakow", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specjalneOznaczenie">Specjalne oznaczenie profilu</Label>
                <Input
                  id="specjalneOznaczenie"
                  value={formData.specjalneOznaczenie}
                  onChange={(e) => handleChange("specjalneOznaczenie", e.target.value)}
                  placeholder="np. Podstawowe, Rozszerzone"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bonusy */}
          <Card>
            <CardHeader>
              <CardTitle>Bonusy</CardTitle>
              <CardDescription>Dodatkowe punkty i benefity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="punktyGratis">Punkty gratis</Label>
                <Input
                  id="punktyGratis"
                  type="number"
                  value={formData.punktyGratis}
                  onChange={(e) => handleNumberChange("punktyGratis", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Zapisz zmiany
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/pakiety")}
            >
              Anuluj
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
