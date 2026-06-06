"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2, Upload, X, Image as ImageIcon, User, ShieldCheck } from "lucide-react"
import Image from "next/image"
import dynamic from "next/dynamic"

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
    nazwaFirmy: string
    opis: string
    logo: string
    zdjecieGlowne: string
    oirpStatus: boolean
    oirpMiasto: string
    oirpWpis: string
    oraStatus: boolean
    oraMiasto: string
    oraWpis: string
  }
  handleInputChange: (field: string, value: any) => void
  isUploading: boolean
  handleLogoFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleMainImageFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveSingleImage: (field: "logo" | "zdjecieGlowne") => void
}

export function BasicTab({
  formData,
  handleInputChange,
  isUploading,
  handleLogoFileSelect,
  handleMainImageFileSelect,
  handleRemoveSingleImage,
}: BasicTabProps) {
  return (
    <div className="space-y-6">
      {/* Dane podstawowe */}
      <Card id="tour-profil-basic" className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
        <CardHeader className="border-b border-border/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#0da192]/10 p-2 rounded-xl text-[#0da192]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-white font-playfair">Dane podstawowe</CardTitle>
              <CardDescription className="text-zinc-400 text-sm">Podstawowe informacje o profilu eksperta</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nazwa" className="text-zinc-300">Nazwa wyświetlana *</Label>
              <Input
                id="nazwa"
                value={formData.nazwa}
                onChange={(e) => handleInputChange("nazwa", e.target.value)}
                required
                className="bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-[#0da192] focus:ring-[#0da192]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nazwaFirmy" className="text-zinc-300">Nazwa firmy *</Label>
              <Input
                id="nazwaFirmy"
                value={formData.nazwaFirmy}
                onChange={(e) => handleInputChange("nazwaFirmy", e.target.value)}
                required
                className="bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-[#0da192] focus:ring-[#0da192]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="opis" className="text-zinc-300">Opis profilu</Label>
              <div className="rounded-xl overflow-hidden border border-border/30 bg-zinc-950/20">
                <RichTextEditor
                  value={formData.opis}
                  onChange={(value) => handleInputChange("opis", value)}
                  placeholder="Opisz swoje doświadczenie i usługi..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wpisy do rejestrów */}
      <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
        <CardHeader className="border-b border-border/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#0da192]/10 p-2 rounded-xl text-[#0da192]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-white font-playfair">Wpisy do rejestrów zawodowych</CardTitle>
              <CardDescription className="text-zinc-400 text-sm">Dodaj informacje o przynależności do izb zawodowych</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-xl border border-border/20 bg-zinc-950/10">
              <Switch
                id="oirpStatus"
                checked={formData.oirpStatus}
                onCheckedChange={(checked) => handleInputChange("oirpStatus", checked)}
              />
              <Label htmlFor="oirpStatus" className="text-white cursor-pointer font-medium">
                Wpis do Okręgowej Izby Radców Prawnych (OIRP)
              </Label>
            </div>

            {formData.oirpStatus && (
              <div className="grid md:grid-cols-2 gap-4 pl-4 border-l-2 border-[#0da192]/30 animate-in slide-in-from-top-1 duration-200">
                <div className="grid gap-2">
                  <Label htmlFor="oirpMiasto" className="text-xs text-zinc-400 uppercase tracking-wider">OIRP Miasto</Label>
                  <Input
                    id="oirpMiasto"
                    placeholder="np. Warszawa"
                    value={formData.oirpMiasto}
                    onChange={(e) => handleInputChange("oirpMiasto", e.target.value)}
                    className="bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-[#0da192]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="oirpWpis" className="text-xs text-zinc-400 uppercase tracking-wider">Numer wpisu</Label>
                  <Input
                    id="oirpWpis"
                    placeholder="np. WA-12345"
                    value={formData.oirpWpis}
                    onChange={(e) => handleInputChange("oirpWpis", e.target.value)}
                    className="bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-[#0da192]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-xl border border-border/20 bg-zinc-950/10">
              <Switch
                id="oraStatus"
                checked={formData.oraStatus}
                onCheckedChange={(checked) => handleInputChange("oraStatus", checked)}
              />
              <Label htmlFor="oraStatus" className="text-white cursor-pointer font-medium">
                Wpis do Okręgowej Rady Adwokackiej (ORA)
              </Label>
            </div>

            {formData.oraStatus && (
              <div className="grid md:grid-cols-2 gap-4 pl-4 border-l-2 border-[#d7b56d]/30 animate-in slide-in-from-top-1 duration-200">
                <div className="grid gap-2">
                  <Label htmlFor="oraMiasto" className="text-xs text-zinc-400 uppercase tracking-wider">ORA Miasto</Label>
                  <Input
                    id="oraMiasto"
                    placeholder="np. Kraków"
                    value={formData.oraMiasto}
                    onChange={(e) => handleInputChange("oraMiasto", e.target.value)}
                    className="bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-[#d7b56d]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="oraWpis" className="text-xs text-zinc-400 uppercase tracking-wider">Numer wpisu</Label>
                  <Input
                    id="oraWpis"
                    placeholder="np. KRA/Adw/1234"
                    value={formData.oraWpis}
                    onChange={(e) => handleInputChange("oraWpis", e.target.value)}
                    className="bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-[#d7b56d]"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logo i zdjęcia główne */}
      <Card id="tour-profil-logo" className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
        <CardHeader className="border-b border-border/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#0da192]/10 p-2 rounded-xl text-[#0da192]">
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
        <CardContent className="space-y-6 pt-6">
          {/* Logo Upload */}
          <div className="space-y-3">
            <Label className="text-white font-medium text-base">Zdjęcie profilowe (Avatar)</Label>
            <p className="text-sm text-zinc-400 font-light">
              Zdjęcie będzie wyświetlane na Twojej stronie eksperta i w wynikach wyszukiwania.
              Zalecany rozmiar: 400x400px (kwadratowe).
            </p>

            {formData.logo ? (
              <div className="flex items-start gap-4 p-4 border border-border/20 rounded-xl bg-zinc-950/10">
                <div className="relative h-32 w-32 rounded-lg overflow-hidden border border-border/30 bg-zinc-900">
                  <Image
                    src={formData.logo}
                    alt="Logo"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border/30 bg-zinc-900/60 hover:bg-zinc-800 text-white h-10 px-4 py-2 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0da192]" />
                        Przesyłanie...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4 text-[#0da192]" />
                        Zmień logo
                      </>
                    )}
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveSingleImage("logo")}
                    disabled={isUploading}
                    className="rounded-xl border-border/30 hover:bg-rose-500/10 hover:text-rose-400 text-white"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Usuń logo
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
                  className="flex flex-col items-center justify-center w-full h-40 border border-dashed border-border/30 rounded-xl cursor-pointer hover:bg-zinc-800/10 hover:border-[#0da192]/40 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-10 w-10 mb-3 text-[#0da192] animate-spin" />
                        <p className="text-sm text-zinc-400">Przesyłanie...</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 mb-3 text-zinc-500" />
                        <p className="mb-2 text-sm text-zinc-300">
                          <span className="font-semibold text-[#0da192]">Kliknij aby przesłać</span> logo
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

          <Separator className="bg-border/10" />

          {/* Zdjęcie główne Upload */}
          <div className="space-y-3">
            <Label className="text-white font-medium text-base">Zdjęcie główne (Banner)</Label>
            <p className="text-sm text-zinc-400 font-light">
              Zdjęcie główne będzie wyświetlane jako banner na górze Twojej strony eksperta.
              Zalecany rozmiar: 1920x600px (panoramiczne).
            </p>

            {formData.zdjecieGlowne ? (
              <div className="space-y-3 p-4 border border-border/20 rounded-xl bg-zinc-950/10">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border/30">
                  <Image
                    src={formData.zdjecieGlowne}
                    alt="Zdjęcie główne"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <label
                    htmlFor="main-image-upload"
                    className="inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border/30 bg-zinc-900/60 hover:bg-zinc-800 text-white h-10 px-4 py-2 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0da192]" />
                        Przesyłanie...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4 text-[#0da192]" />
                        Zmień zdjęcie
                      </>
                    )}
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveSingleImage("zdjecieGlowne")}
                    disabled={isUploading}
                    className="rounded-xl border-border/30 hover:bg-rose-500/10 hover:text-rose-400 text-white"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Usuń zdjęcie
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
                  className="flex flex-col items-center justify-center w-full h-48 border border-dashed border-border/30 rounded-xl cursor-pointer hover:bg-zinc-800/10 hover:border-[#0da192]/40 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-10 w-10 mb-3 text-[#0da192] animate-spin" />
                        <p className="text-sm text-zinc-400">Przesyłanie...</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 mb-3 text-zinc-500" />
                        <p className="mb-2 text-sm text-zinc-300">
                          <span className="font-semibold text-[#0da192]">Kliknij aby przesłać</span> zdjęcie główne
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
        </CardContent>
      </Card>
    </div>
  )
}
