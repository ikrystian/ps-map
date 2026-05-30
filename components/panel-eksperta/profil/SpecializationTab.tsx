"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Globe, Loader2, MapPin } from "lucide-react"
import Link from "next/link"

interface Category {
  id: string
  nazwa: string
}

interface Voivodeship {
  id: string
  nazwa: string
}

interface City {
  id: string
  nazwa: string
  voivodeshipId: string
}

interface SpecializationTabProps {
  formData: {
    categoriesIds: string[]
    unikatowyOpisUslugi: string
    slowaKluczowe: string[]
    callaPolska: boolean
    onlineOnly: boolean
    voivodeshipsIds: string[]
    citiesIds: string[]
  }
  categories: Category[]
  limitSlowKluczowych: number
  maxVoivodeships: number
  maxCities: number
  voivodeships: Voivodeship[]
  citiesByVoivodeship: Record<string, City[]>
  loadingCities: Record<string, boolean>
  handleInputChange: (field: string, value: any) => void
  toggleVoivodeship: (id: string) => void
  toggleCity: (id: string) => void
}

export function SpecializationTab({
  formData,
  categories,
  limitSlowKluczowych,
  maxVoivodeships,
  maxCities,
  voivodeships,
  citiesByVoivodeship,
  loadingCities,
  handleInputChange,
  toggleVoivodeship,
  toggleCity,
}: SpecializationTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zakres usług</CardTitle>
          <CardDescription>Twoje wybrane specjalizacje i zakres świadczonych usług</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Wybrane kategorie</Label>
              <Button variant="outline" size="sm" asChild>
                <Link href="/panel-eksperta/zakres-uslug">
                  Zarządzaj usługami
                </Link>
              </Button>
            </div>

            {formData.categoriesIds.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30">
                {formData.categoriesIds.map((id) => {
                  const category = categories.find((c) => c.id === id)
                  return category ? (
                    <Badge key={id} variant="secondary" className="px-3 py-1">
                      {category.nazwa}
                    </Badge>
                  ) : null
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">Nie wybrano jeszcze żadnych kategorii usług.</p>
                <Button variant="outline" asChild>
                  <Link href="/panel-eksperta/zakres-uslug">
                    Dodaj pierwsze usługi
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="unikatowyOpisUslugi">Unikalny opis usługi</Label>
              <Textarea
                id="unikatowyOpisUslugi"
                value={formData.unikatowyOpisUslugi}
                onChange={(e) => handleInputChange("unikatowyOpisUslugi", e.target.value)}
                rows={4}
                placeholder="Opisz swoje unikalne podejście do świadczenia usług..."
              />
              <p className="text-xs text-muted-foreground">
                Ten opis będzie widoczny na Twoim publicznym profilu w sekcji "Zakres usług".
              </p>
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="slowoKluczowe">Słowa kluczowe</Label>
                <span className="text-xs text-muted-foreground">
                  Dodano {formData.slowaKluczowe.length} z {limitSlowKluczowych} dostępnych
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="slowoKluczowe"
                  placeholder={
                    formData.slowaKluczowe.length >= limitSlowKluczowych
                      ? "Osiągnięto limit słów kluczowych"
                      : "Dodaj słowo kluczowe..."
                  }
                  disabled={formData.slowaKluczowe.length >= limitSlowKluczowych}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (formData.slowaKluczowe.length >= limitSlowKluczowych) {
                        return
                      }
                      const value = e.currentTarget.value.trim()
                      if (value && !formData.slowaKluczowe.includes(value)) {
                        handleInputChange("slowaKluczowe", [...formData.slowaKluczowe, value])
                        e.currentTarget.value = ""
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  disabled={formData.slowaKluczowe.length >= limitSlowKluczowych}
                  onClick={() => {
                    if (formData.slowaKluczowe.length >= limitSlowKluczowych) {
                      return
                    }
                    const input = document.getElementById("slowoKluczowe") as HTMLInputElement
                    const value = input.value.trim()
                    if (value && !formData.slowaKluczowe.includes(value)) {
                      handleInputChange("slowaKluczowe", [...formData.slowaKluczowe, value])
                      input.value = ""
                    }
                  }}
                >
                  Dodaj
                </Button>
              </div>
              {formData.slowaKluczowe.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.slowaKluczowe.map((keyword, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                    >
                      <span>{keyword}</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange(
                            "slowaKluczowe",
                            formData.slowaKluczowe.filter((_, i) => i !== index)
                          )
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="tour-zakres-area" className="shadow-sm border-muted/60">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Obszar działania</CardTitle>
              <CardDescription>
                Zdefiniuj, gdzie i w jaki sposób świadczysz pomoc prawną.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold mb-3 hidden">Tryb świadczenia usług</h4>
            <div className="grid sm:grid-cols-2 gap-4 hidden">
              <div
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                  formData.callaPolska ? "bg-primary/5 border-primary shadow-sm" : "border-muted bg-card hover:bg-accent/30"
                )}
                onClick={() => handleInputChange("callaPolska", !formData.callaPolska)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      formData.callaPolska ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Cała Polska</p>
                    <p className="text-xs text-muted-foreground">Widoczność w każdym mieście</p>
                  </div>
                </div>
                <Switch
                  checked={formData.callaPolska}
                  onCheckedChange={(val) => handleInputChange("callaPolska", val)}
                />
              </div>

              <div
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                  formData.onlineOnly ? "bg-primary/5 border-primary shadow-sm" : "border-muted bg-card hover:bg-accent/30"
                )}
                onClick={() => handleInputChange("onlineOnly", !formData.onlineOnly)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      formData.onlineOnly ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <div className="h-5 w-5 flex items-center justify-center font-bold text-[10px]">WEB</div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Tylko online</p>
                    <p className="text-xs text-muted-foreground">Konsultacje zdalne</p>
                  </div>
                </div>
                <Switch
                  checked={formData.onlineOnly}
                  onCheckedChange={(val) => handleInputChange("onlineOnly", val)}
                />
              </div>
            </div>
          </div>

          {!formData.callaPolska && (
            <div className="pt-4 border-t border-muted">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold">Lokalizacje stacjonarne</h4>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>
                    Województwa:{" "}
                    <span
                      className={
                        formData.voivodeshipsIds.length >= maxVoivodeships ? "text-destructive font-bold" : "font-bold"
                      }
                    >
                      {formData.voivodeshipsIds.length}
                    </span>{" "}
                    / {maxVoivodeships}
                  </span>
                  <span>
                    Miasta:{" "}
                    <span
                      className={formData.citiesIds.length >= maxCities ? "text-destructive font-bold" : "font-bold"}
                    >
                      {formData.citiesIds.length}
                    </span>{" "}
                    / {maxCities}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase text-muted-foreground tracking-wider px-1">Województwa</h5>
                  <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar border rounded-xl p-3 bg-muted/10">
                    {voivodeships.map((v) => (
                      <div
                        key={v.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer",
                          formData.voivodeshipsIds.includes(v.id)
                            ? "bg-primary/5 border-primary/30 text-primary font-medium"
                            : "border-transparent bg-card hover:bg-muted/50"
                        )}
                        onClick={() => toggleVoivodeship(v.id)}
                      >
                        <Checkbox
                          checked={formData.voivodeshipsIds.includes(v.id)}
                          onCheckedChange={() => toggleVoivodeship(v.id)}
                        />
                        <span className="text-sm">{v.nazwa}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase text-muted-foreground tracking-wider px-1">
                    Miasta w wybranych województwach
                  </h5>
                  <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar border rounded-xl p-3 bg-muted/10">
                    {formData.voivodeshipsIds.length === 0 ? (
                      <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-muted-foreground py-10 opacity-60">
                        <MapPin className="h-8 w-8 mb-2 text-muted-foreground/55 animate-pulse" />
                        <p className="text-xs font-medium">Wybierz województwo po lewej stronie</p>
                      </div>
                    ) : (
                      formData.voivodeshipsIds.map((vId) => {
                        const vName = voivodeships.find((v) => v.id === vId)?.nazwa
                        const cities = citiesByVoivodeship[vId] || []
                        const isLoading = loadingCities[vId]

                        return (
                          <div key={vId} className="mb-4 last:mb-0">
                            <div className="text-[10px] font-bold text-muted-foreground mb-2 flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {vName}
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              {isLoading ? (
                                <div className="py-2 flex items-center gap-2 text-xs text-muted-foreground">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Ładowanie miast...
                                </div>
                              ) : cities.length === 0 ? (
                                <div className="py-2 text-[10px] italic text-muted-foreground">Brak miast w bazie.</div>
                              ) : (
                                cities.map((city) => (
                                  <div
                                    key={city.id}
                                    className={cn(
                                      "flex items-center gap-2 p-1.5 rounded-md transition-all cursor-pointer",
                                      formData.citiesIds.includes(city.id)
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-muted"
                                    )}
                                    onClick={() => toggleCity(city.id)}
                                  >
                                    <Checkbox
                                      checked={formData.citiesIds.includes(city.id)}
                                      onCheckedChange={() => toggleCity(city.id)}
                                    />
                                    <span className="text-xs">{city.nazwa}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
