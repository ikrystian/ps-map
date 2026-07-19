"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Wrench, Award, Plus, X, Tag, Scale } from "lucide-react"
import Link from "next/link"
import { Category } from "@/types"
import { BorderBeam } from "@/components/ui/border-beam"

interface SpecializationTabProps {
  formData: {
    categoriesIds: string[]
    unikatowyOpisUslugi: string
    slowaKluczowe: string[]
    bieglySadowy: boolean
    bieglySadowyNazwaSadu: string
  }
  categories: Category[]
  limitSlowKluczowych: number
  handleInputChange: (field: string, value: any) => void
}

export function SpecializationTab({
  formData,
  categories,
  limitSlowKluczowych,
  handleInputChange,
}: SpecializationTabProps) {
  return (
    <div className="space-y-6">
      {/* Kategorie usług */}
      <Card data-score-target="kategorie" className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
        <BorderBeam lightColor="var(--primary)" lightWidth={350} duration={8} borderWidth={1} />
        <CardHeader className="border-b border-border/10 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-white font-playfair">Wybrane specjalizacje</CardTitle>
                <CardDescription className="text-zinc-400 text-sm">Główne dziedziny prawa, w których świadczysz pomoc</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl border-border/30 hover:bg-zinc-800 text-white shadow-sm" asChild>
              <Link href="/panel-eksperta/zakres-uslug">
                Zarządzaj usługami
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {formData.categoriesIds.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-4 border border-border/20 rounded-xl bg-zinc-950/10">
              {formData.categoriesIds.map((id) => {
                const category = categories.find((c) => c.id === id)
                return category ? (
                  <Badge key={id} variant="secondary" className="px-3.5 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-semibold rounded-lg shadow-sm hover:bg-primary/15 transition-all">
                    {category.nazwa}
                  </Badge>
                ) : null
              })}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-border/30 rounded-xl bg-zinc-950/5">
              <p className="text-zinc-400 mb-4 text-sm font-light">Nie wybrano jeszcze żadnych kategorii usług.</p>
              <Button className="bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md" asChild>
                <Link href="/panel-eksperta/zakres-uslug">
                  Dodaj pierwsze usługi
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prezentacja oferty */}
      <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
        <BorderBeam lightColor="var(--primary)" lightWidth={350} duration={9} borderWidth={1} />
        <CardHeader className="border-b border-border/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-white font-playfair">Prezentacja oferty i specjalizacji</CardTitle>
              <CardDescription className="text-zinc-400 text-sm">Opisz unikalne cechy swojej oferty i dodaj słowa kluczowe</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Unikalny opis */}
          <div className="grid gap-2" data-score-target="unikatowyOpis">
            <Label htmlFor="unikatowyOpisUslugi" className="text-zinc-300 font-medium">Unikalny opis usługi</Label>
            <Textarea
              id="unikatowyOpisUslugi"
              value={formData.unikatowyOpisUslugi}
              onChange={(e) => handleInputChange("unikatowyOpisUslugi", e.target.value)}
              rows={5}
              placeholder="Opisz swoje unikalne podejście do świadczenia usług, zalety i warunki współpracy..."
              className="bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-primary"
            />
            <p className="text-xs text-zinc-500 font-light">
              Ten opis będzie widoczny na Twoim publicznym profilu w sekcji "Zakres usług".
            </p>
          </div>

          <Separator className="bg-border/10" />

          {/* Słowa kluczowe */}
          <div className="grid gap-2" data-score-target="slowaKluczowe">
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="slowoKluczowe" className="text-zinc-300 font-medium">Słowa kluczowe</Label>
              <span className="text-xs text-zinc-500">
                Dodano <span className="font-semibold text-white">{formData.slowaKluczowe.length}</span> z <span className="font-semibold text-white">{limitSlowKluczowych}</span> dostępnych
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Tag className="h-4 w-4" />
                </div>
                <Input
                  id="slowoKluczowe"
                  placeholder={
                    formData.slowaKluczowe.length >= limitSlowKluczowych
                      ? "Osiągnięto limit słów kluczowych"
                      : "Wpisz słowo i zatwierdź Enterem..."
                  }
                  disabled={formData.slowaKluczowe.length >= limitSlowKluczowych}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (formData.slowaKluczowe && formData.slowaKluczowe.length >= limitSlowKluczowych) {
                        return
                      }
                      const value = e.currentTarget.value.trim()
                      if (value && !formData.slowaKluczowe.includes(value)) {
                        handleInputChange("slowaKluczowe", [...formData.slowaKluczowe, value])
                        e.currentTarget.value = ""
                      }
                    }
                  }}
                  className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-primary"
                />
              </div>
              <Button
                type="button"
                className="bg-primary hover:bg-primary-dark text-white rounded-xl gap-1.5 shadow-sm transition-all duration-200"
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
                <Plus className="h-4 w-4" />
                Dodaj
              </Button>
            </div>

            {formData.slowaKluczowe.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 border border-border/20 rounded-xl bg-zinc-950/10">
                {formData.slowaKluczowe.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 bg-zinc-900 border border-border/30 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-zinc-800 hover:border-zinc-700"
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
                      className="ml-1 text-zinc-500 hover:text-rose-400 font-semibold focus:outline-none transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Biegły sądowy */}
      <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
        <CardHeader className="border-b border-border/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-white font-playfair">Biegły sądowy</CardTitle>
              <CardDescription className="text-zinc-400 text-sm">Wpis na listę biegłych sądowych pokażemy jako odznakę na Twojej wizytówce</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between gap-4 p-4 border border-border/20 rounded-xl bg-zinc-950/10">
            <Label htmlFor="bieglySadowy" className="text-zinc-300 font-medium cursor-pointer">
              Jestem wpisany/-a na listę biegłych sądowych
            </Label>
            <Switch
              id="bieglySadowy"
              checked={formData.bieglySadowy}
              onCheckedChange={(val) => handleInputChange("bieglySadowy", val)}
            />
          </div>
          {formData.bieglySadowy && (
            <div className="grid gap-2">
              <Label htmlFor="bieglySadowyNazwaSadu" className="text-zinc-300 font-medium">
                Sąd, przy którym prowadzona jest lista (opcjonalnie)
              </Label>
              <Input
                id="bieglySadowyNazwaSadu"
                placeholder="np. Sąd Okręgowy w Warszawie"
                value={formData.bieglySadowyNazwaSadu}
                onChange={(e) => handleInputChange("bieglySadowyNazwaSadu", e.target.value)}
                className="bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-primary"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
