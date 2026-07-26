"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2, Upload, X, Image as ImageIcon, User, ShieldCheck, Building, MapPin, FileText, Lock, Zap, Lightbulb, ChevronDown, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePermissions } from "@/hooks/usePermissions"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { BorderBeam } from "@/components/ui/border-beam"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 w-full flex items-center justify-center bg-zinc-950/40 border border-border/30 rounded-xl text-sm text-zinc-400">
        Ładowanie edytora...
      </div>
    )
  }
)

interface BasicTabProps {
  formData: {
    nazwa: string
    opis: string
    logo: string
    zdjecieGlowne: string
    oirpStatus: boolean
    oirpMiasto: string
    oirpWpis: string
    oraStatus: boolean
    oraMiasto: string
    oraWpis: string
    expertiseCategoryId: string
  }
  handleInputChange: (field: string, value: any) => void
  isUploading: boolean
  handleLogoFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleMainImageFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveSingleImage: (field: "logo" | "zdjecieGlowne") => void
  expertiseCategories: any[]
}

export function BasicTab({
  formData,
  handleInputChange,
  isUploading,
  handleLogoFileSelect,
  handleMainImageFileSelect,
  handleRemoveSingleImage,
  expertiseCategories,
}: BasicTabProps) {
  const [showLogoConfirm, setShowLogoConfirm] = useState(false)
  const [showCoverConfirm, setShowCoverConfirm] = useState(false)
  const [showDescTips, setShowDescTips] = useState(false)
  const descTipsRef = useRef<HTMLDivElement>(null)

  const [selectedCatId, setSelectedCatId] = useState("")
  const [selectedSubcatId, setSelectedSubcatId] = useState("")

  useEffect(() => {
    if (!expertiseCategories || expertiseCategories.length === 0) return

    // 1) Rozpoznaj kategorię po zapisanym expertiseCategoryId
    if (formData.expertiseCategoryId) {
      let foundCatId = ""
      let foundSubcatId = ""

      for (const cat of expertiseCategories) {
        if (cat.id === formData.expertiseCategoryId) {
          foundCatId = cat.id
          break
        }
        if (cat.children) {
          for (const sub of cat.children) {
            if (sub.id === formData.expertiseCategoryId) {
              foundCatId = cat.id
              foundSubcatId = sub.id
              break
            }
            if (sub.children) {
              for (const leaf of sub.children) {
                if (leaf.id === formData.expertiseCategoryId) {
                  foundCatId = cat.id
                  foundSubcatId = sub.id
                  break
                }
              }
            }
            if (foundCatId) break
          }
        }
        if (foundCatId) break
      }

      if (foundCatId) {
        setSelectedCatId(foundCatId)
        setSelectedSubcatId(foundSubcatId)
      }
    }
    // Fallback odtwarzający wybór ze ścieżki w `typInny` był potrzebny, dopóki
    // ścieżka dublowała `expertiseCategoryId`. Po rozdzieleniu obu znaczeń
    // (`typ`/`typInny` = forma prawna) jedynym źródłem jest już samo ID.
  }, [formData.expertiseCategoryId, expertiseCategories])

  const selectedCat = expertiseCategories?.find((c) => c.id === selectedCatId)
  const hasSubcategories = !!(
    selectedCat?.children &&
    selectedCat.children.length > 0 &&
    selectedCat.children.some((ch: any) => ch.children && ch.children.length > 0)
  )

  const subcategoriesList = selectedCat?.children || []
  const selectedSubcat = subcategoriesList.find((s: any) => s.id === selectedSubcatId)

  let specializationsList: any[] = []
  if (selectedCat) {
    if (!hasSubcategories) {
      specializationsList = subcategoriesList
    } else if (selectedSubcat) {
      specializationsList = selectedSubcat.children || []
    }
  }

  // Po odsłonięciu sekcji ze wskazówkami przewiń do niej płynnie
  useEffect(() => {
    if (showDescTips) {
      descTipsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [showDescTips])

  const { hasFeature, loading: permissionsLoading } = usePermissions()
  const canUploadCover = permissionsLoading ? true : hasFeature("canUploadCoverBanner")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Kolumna lewa: Dane podstawowe */}
      <div className="lg:col-span-12 space-y-6">
        {/* Dane podstawowe */}
        <Card id="tour-profil-basic" className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
          <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={8} borderWidth={1} />
          <CardHeader className="border-b border-border/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-white font-playfair">Dane podstawowe</CardTitle>
                <CardDescription className="text-zinc-400 text-sm">Podstawowe informacje o profilu eksperta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2" data-score-target="nazwa">
                  <Label htmlFor="nazwa" className="text-zinc-300 font-medium">Nazwa wyświetlana *</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="nazwa"
                      value={formData.nazwa}
                      readOnly
                      aria-readonly="true"
                      className="pl-10 bg-zinc-950/50 border-border/30 text-zinc-400 cursor-not-allowed rounded-xl focus-visible:ring-0"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed">
                    Aby zmienić wyświetlaną nazwę, skontaktuj się z administracją prostasprawa.
                  </p>
                </div>

              </div>

              {/* Branża i specjalizacja */}
              <div className="border-t border-border/10 pt-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Branża i specjalizacja rejestracyjna</h4>
                  <p className="text-xs text-zinc-400 font-light mt-1">
                    Określ swoją główną specjalizację zawodową podaną podczas rejestracji.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Kategoria */}
                  <div className="grid gap-2">
                    <Label htmlFor="category-select" className="text-zinc-300 font-medium">Kategoria główna *</Label>
                    <Select
                      value={selectedCatId}
                      onValueChange={(val) => {
                        setSelectedCatId(val)
                        setSelectedSubcatId("")
                        handleInputChange("expertiseCategoryId", "")
                      }}
                    >
                      <SelectTrigger id="category-select" className="h-11 bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-primary">
                        <SelectValue placeholder="Wybierz kategorię..." />
                      </SelectTrigger>
                      <SelectContent>
                        {expertiseCategories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nazwa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Podkategoria (warunkowo) */}
                  {selectedCat && hasSubcategories && (
                    <div className="grid gap-2 animate-in fade-in-50 duration-200">
                      <Label htmlFor="subcategory-select" className="text-zinc-300 font-medium">Podkategoria *</Label>
                      <Select
                        value={selectedSubcatId}
                        onValueChange={(val) => {
                          setSelectedSubcatId(val)
                          handleInputChange("expertiseCategoryId", "")
                        }}
                      >
                        <SelectTrigger id="subcategory-select" className="h-11 bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-primary">
                          <SelectValue placeholder="Wybierz podkategorię..." />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategoriesList.map((sub: any) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.nazwa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Specjalizacja / Typ działalności */}
                  {selectedCat && (!hasSubcategories || selectedSubcatId) && specializationsList.length > 0 && (
                    <div className="grid gap-2 animate-in fade-in-50 duration-200">
                      <Label htmlFor="specialization-select" className="text-zinc-300 font-medium">Specjalizacja *</Label>
                      <Select
                        value={formData.expertiseCategoryId || ""}
                        onValueChange={(val) => {
                          handleInputChange("expertiseCategoryId", val)
                        }}
                      >
                        <SelectTrigger id="specialization-select" className="h-11 bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-primary">
                          <SelectValue placeholder="Wybierz specjalizację..." />
                        </SelectTrigger>
                        <SelectContent>
                          {specializationsList.map((spec: any) => (
                            <SelectItem key={spec.id} value={spec.id}>
                              {spec.nazwa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2" data-score-target="opis">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <Label htmlFor="opis" className="text-zinc-300 font-medium">Opis profilu</Label>
                  <button
                    type="button"
                    onClick={() => setShowDescTips((prev) => !prev)}
                    aria-expanded={showDescTips}
                    className="profile-desc-button inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    {showDescTips ? "Ukryj wskazówki" : "Jak napisać dobry opis?"}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showDescTips ? "rotate-180" : ""}`} />
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden border border-border/30 bg-zinc-950/20">
                  <RichTextEditor
                    value={formData.opis}
                    onChange={(value) => handleInputChange("opis", value)}
                    placeholder="Opisz swoje doświadczenie i usługi..."
                  />
                </div>

                {showDescTips && (
                  <div
                    ref={descTipsRef}
                    className="scroll-mt-24 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 animate-in slide-in-from-top-1 fade-in-50 duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">Jak napisać dobry opis profilu</h4>
                    </div>

                    <ul className="space-y-2 text-xs text-zinc-300 font-light leading-relaxed">
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong className="font-medium text-zinc-100">Zacznij od najważniejszego</strong> — w pierwszych zdaniach napisz, w czym się specjalizujesz i komu pomagasz.</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong className="font-medium text-zinc-100">Używaj słów kluczowych</strong>, których szukają klienci (np. „rozwód", „odszkodowanie", „prawo pracy") — poprawiają widoczność w wyszukiwarce (SEO).</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong className="font-medium text-zinc-100">Pokaż doświadczenie konkretami</strong> — lata praktyki, liczba prowadzonych spraw, obszary specjalizacji.</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong className="font-medium text-zinc-100">Pisz prostym językiem</strong>, bez nadmiaru żargonu prawniczego — klient ma zrozumieć, jak mu pomożesz.</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong className="font-medium text-zinc-100">Zadbaj o długość min. 40 znaków</strong> — zbyt krótkie opisy obniżają ocenę kompletności profilu.</span>
                      </li>
                    </ul>

                    <div className="rounded-lg border border-border/20 bg-zinc-950/30 p-3">
                      <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-1.5">Przykład</p>
                      <p className="text-xs text-zinc-300 font-light italic leading-relaxed">
                        „Specjalizuję się w prawie rodzinnym — rozwody, podział majątku oraz sprawy alimentacyjne. Od ponad 10 lat reprezentuję klientów w Warszawie i okolicach, prowadząc każdą sprawę z pełnym zaangażowaniem. Oferuję jasne zasady współpracy i bezpłatną wstępną konsultację telefoniczną."
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kolumna prawa: Wizerunek i zdjęcia bannerów oraz Wpisy do rejestrów */}
      <div className="lg:col-span-12 space-y-6">
        {/* Logo i zdjęcia główne */}
        <Card id="tour-profil-logo" className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
          <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={9} borderWidth={1} />
          <CardHeader className="border-b border-border/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-white font-playfair">Wizerunek i zdjęcia bannerów</CardTitle>
                <CardDescription className="text-zinc-400 text-sm">
                  Dodaj zdjęcie profilowe oraz zdjęcie główne (banner)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 items-start">

              {/* Logo Upload (Avatar) */}
              <div className="space-y-4" data-score-target="logo">
                <div>
                  <Label className="text-white font-semibold text-base">Zdjęcie profilowe (Avatar)</Label>
                  <p className="text-xs text-zinc-400 font-light mt-1">
                    Zdjęcie widoczne w wynikach wyszukiwania. Zalecany rozmiar: 400x400px (kwadratowe).
                  </p>
                </div>

                {formData.logo ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-border/20 rounded-xl bg-zinc-950/10">
                    <div className="relative h-36 w-36 rounded-xl overflow-hidden border border-border/30 bg-zinc-900 shrink-0">
                      <Image
                        src={formData.logo}
                        alt="Logo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-row items-center gap-2 w-full">
                      <label
                        htmlFor="logo-upload"
                        className="inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border/30 bg-zinc-700 hover:bg-zinc-800 text-white h-10 px-4 py-2 cursor-pointer shadow-sm"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                            Przesyłanie...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4 text-primary" />
                            Zmień zdjęćie
                          </>
                        )}
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowLogoConfirm(true)}
                        disabled={isUploading}
                        className="rounded-xl border-border/30 hover:bg-rose-500/10 hover:text-rose-400 text-white"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Usuń zdjęcie
                      </Button>
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleLogoFileSelect}
                      disabled={isUploading}
                    />
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="logo-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border border-dashed border-border/30 rounded-xl cursor-pointer hover:bg-zinc-800/10 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        {isUploading ? (
                          <>
                            <Loader2 className="h-10 w-10 mb-3 text-primary animate-spin" />
                            <p className="text-sm text-zinc-400">Przesyłanie...</p>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-10 w-10 mb-3 text-zinc-500" />
                            <p className="mb-1 text-sm text-zinc-300">
                              <span className="font-semibold text-primary">Kliknij aby przesłać</span>
                            </p>
                            <p className="text-xs text-zinc-500">
                              PNG, JPG, WEBP (max 5MB)
                            </p>
                          </>
                        )}
                      </div>
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleLogoFileSelect}
                      disabled={isUploading}
                    />
                  </div>
                )}
              </div>

              {/* Zdjęcie główne Upload (Banner) */}
              <div className="space-y-4" data-score-target="zdjecieGlowne">
                <div>
                  <Label className="text-white font-semibold text-base">Zdjęcie główne (Banner)</Label>
                  <p className="text-xs text-zinc-400 font-light mt-1">
                    Zdjęcie panoramiczne jako nagłówek profilu. Zalecany rozmiar: 1920x600px.
                  </p>
                </div>

                <div className="relative">
                  {!canUploadCover && (
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px] rounded-xl z-20 flex flex-col items-center justify-center p-4 text-center border border-dashed border-border/30">
                      <div className="rounded-full bg-zinc-900 border border-zinc-800 p-2.5 mb-2.5">
                        <Lock className="h-5 w-5 text-amber-500" />
                      </div>
                      <p className="text-sm font-semibold text-white">Funkcja Premium</p>
                      <p className="text-xs text-zinc-400 max-w-[280px] mt-1 mb-3">
                        Dodawanie własnego baneru w nagłówku profilu jest dostępne w wyższych pakietach.
                      </p>
                      <Button asChild size="sm" className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg h-8 px-3">
                        <Link href="/panel-eksperta/pakiet">
                          Ulepsz pakiet <Zap className="ml-1.5 h-3.5 w-3.5 fill-current" />
                        </Link>
                      </Button>
                    </div>
                  )}

                  {formData.zdjecieGlowne ? (
                    <div className="space-y-4 p-4 border border-border/20 rounded-xl bg-zinc-950/10">
                      <div className="relative w-full min-h-32 rounded-xl overflow-hidden border border-border/30">
                        <Image
                          src={formData.zdjecieGlowne}
                          alt="Zdjęcie główne"
                          fill
                          className="object-contain relative!"
                        />
                      </div>
                      <div className="flex gap-2">
                        <label
                          htmlFor="main-image-upload"
                          className="inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border/30 bg-zinc-700 hover:bg-zinc-800 text-white h-10 px-4 py-2 cursor-pointer shadow-sm"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                              Przesyłanie...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4 text-primary" />
                              Zmień zdjęcie
                            </>
                          )}
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCoverConfirm(true)}
                          disabled={isUploading}
                          className="rounded-xl border-border/30 hover:bg-rose-500/10 hover:text-rose-400 text-white"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Usuń banner
                        </Button>
                      </div>
                      <input
                        id="main-image-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleMainImageFileSelect}
                        disabled={isUploading}
                      />
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="main-image-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border border-dashed border-border/30 rounded-xl cursor-pointer hover:bg-zinc-800/10 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          {isUploading ? (
                            <>
                              <Loader2 className="h-10 w-10 mb-3 text-primary animate-spin" />
                              <p className="text-sm text-zinc-400">Przesyłanie...</p>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-10 w-10 mb-3 text-zinc-500" />
                              <p className="mb-1 text-sm text-zinc-300">
                                <span className="font-semibold text-primary">Kliknij aby przesłać</span> banner
                              </p>
                              <p className="text-xs text-zinc-500">
                                PNG, JPG, WEBP (max 5MB)
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        id="main-image-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleMainImageFileSelect}
                        disabled={isUploading}
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Wpisy do rejestrów */}
        <Card data-score-target="rejestry" className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
          <BorderBeam lightColor="var(--secondary)" lightWidth={400} duration={8} borderWidth={1} />
          <CardHeader className="border-b border-border/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-white font-playfair">Wpisy do rejestrów zawodowych</CardTitle>
                <CardDescription className="text-zinc-400 text-sm">Dodaj informacje o przynależności do izb zawodowych</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
              {/* OIRP */}
              <div className="space-y-4 p-4 rounded-2xl border border-border/20 bg-zinc-950/10 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="oirpStatus"
                      checked={formData.oirpStatus}
                      onCheckedChange={(checked) => handleInputChange("oirpStatus", checked)}
                    />
                    <Label htmlFor="oirpStatus" className="text-white cursor-pointer font-semibold text-sm">
                      Radca Prawny (OIRP)
                    </Label>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${formData.oirpStatus ? "bg-primary shadow-[0_0_8px_var(--primary)]" : "bg-zinc-800"}`} />
                </div>

                {formData.oirpStatus ? (
                  <div className="grid gap-3 pt-3 border-t border-border/15 animate-in slide-in-from-top-1 duration-200">
                    <div className="grid gap-1.5">
                      <Label htmlFor="oirpMiasto" className="text-xs text-zinc-400 uppercase tracking-wider">OIRP Miasto</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <Input
                          id="oirpMiasto"
                          placeholder="np. Warszawa"
                          value={formData.oirpMiasto}
                          onChange={(e) => handleInputChange("oirpMiasto", e.target.value)}
                          className="pl-9 bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="oirpWpis" className="text-xs text-zinc-400 uppercase tracking-wider">Numer wpisu</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <Input
                          id="oirpWpis"
                          placeholder="np. WA-12345"
                          value={formData.oirpWpis}
                          onChange={(e) => handleInputChange("oirpWpis", e.target.value)}
                          className="pl-9 bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic pt-2">Zaznacz przełącznik, aby dodać wpis radcowski.</p>
                )}
              </div>

              {/* ORA */}
              <div className="space-y-4 p-4 rounded-2xl border border-border/20 bg-zinc-950/10 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="oraStatus"
                      checked={formData.oraStatus}
                      onCheckedChange={(checked) => handleInputChange("oraStatus", checked)}
                    />
                    <Label htmlFor="oraStatus" className="text-white cursor-pointer font-semibold text-sm">
                      Adwokat (ORA)
                    </Label>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${formData.oraStatus ? "bg-secondary shadow-[0_0_8px_var(--secondary)]" : "bg-zinc-800"}`} />
                </div>

                {formData.oraStatus ? (
                  <div className="grid gap-3 pt-3 border-t border-border/15 animate-in slide-in-from-top-1 duration-200">
                    <div className="grid gap-1.5">
                      <Label htmlFor="oraMiasto" className="text-xs text-zinc-400 uppercase tracking-wider">ORA Miasto</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <Input
                          id="oraMiasto"
                          placeholder="np. Kraków"
                          value={formData.oraMiasto}
                          onChange={(e) => handleInputChange("oraMiasto", e.target.value)}
                          className="pl-9 bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-secondary"
                        />
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="oraWpis" className="text-xs text-zinc-400 uppercase tracking-wider">Numer wpisu</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <Input
                          id="oraWpis"
                          placeholder="np. KRA/Adw/1234"
                          value={formData.oraWpis}
                          onChange={(e) => handleInputChange("oraWpis", e.target.value)}
                          className="pl-9 bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-secondary"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic pt-2">Zaznacz przełącznik, aby dodać wpis adwokacki.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        open={showLogoConfirm}
        onOpenChange={setShowLogoConfirm}
        onConfirm={() => handleRemoveSingleImage("logo")}
        title="Usuń logo profilowe"
        description="Czy na pewno chcesz usunąć swoje logo profilowe? Tej operacji nie można cofnąć."
        confirmText="Usuń"
        cancelText="Anuluj"
      />

      <ConfirmDeleteDialog
        open={showCoverConfirm}
        onOpenChange={setShowCoverConfirm}
        onConfirm={() => handleRemoveSingleImage("zdjecieGlowne")}
        title="Usuń zdjęcie główne"
        description="Czy na pewno chcesz usunąć zdjęcie główne (banner)? Tej operacji nie można cofnąć."
        confirmText="Usuń"
        cancelText="Anuluj"
      />
    </div>
  )
}
