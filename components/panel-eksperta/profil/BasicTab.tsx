"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import dynamic from "next/dynamic"

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 w-full flex items-center justify-center bg-background border border-border rounded-lg text-sm text-muted-foreground">
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
      <Card id="tour-profil-basic">
        <CardHeader>
          <CardTitle>Dane podstawowe</CardTitle>
          <CardDescription>Podstawowe informacje o ekspercie</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nazwa">Nazwa wyświetlana *</Label>
              <Input
                id="nazwa"
                value={formData.nazwa}
                onChange={(e) => handleInputChange("nazwa", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nazwaFirmy">Nazwa firmy *</Label>
              <Input
                id="nazwaFirmy"
                value={formData.nazwaFirmy}
                onChange={(e) => handleInputChange("nazwaFirmy", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="opis">Opis profilu</Label>
              <RichTextEditor
                value={formData.opis}
                onChange={(value) => handleInputChange("opis", value)}
                placeholder="Opisz swoje doświadczenie i usługi..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="tour-profil-logo">
        <CardHeader>
          <CardTitle>Logo i zdjęcia</CardTitle>
          <CardDescription>
            Dodaj zdjęcie profilowe oraz zdjęcie główne
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-3">
            <Label>Zdjęcie profilowe (Avatar)</Label>
            <p className="text-sm text-muted-foreground">
              Zdjęcie będzie wyświetlane na Twojej stronie eksperta i w wynikach wyszukiwania.
              Zalecany rozmiar: 400x400px (kwadratowe).
            </p>

            {formData.logo ? (
              <div className="flex items-start gap-4">
                <div className="relative h-32 w-32 rounded-lg overflow-hidden border-2 border-border bg-card">
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
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Przesyłanie...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Zmień logo
                      </>
                    )}
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveSingleImage("logo")}
                    disabled={isUploading}
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
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-10 w-10 mb-3 text-muted-foreground animate-spin" />
                        <p className="text-sm text-muted-foreground">Przesyłanie...</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Kliknij aby przesłać</span> logo
                        </p>
                        <p className="text-xs text-muted-foreground">
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

          <Separator />

          {/* Zdjęcie główne Upload */}
          <div className="space-y-3">
            <Label>Zdjęcie główne</Label>
            <p className="text-sm text-muted-foreground">
              Zdjęcie główne będzie wyświetlane jako banner na górze Twojej strony eksperta.
              Zalecany rozmiar: 1920x600px (panoramiczne).
            </p>

            {formData.zdjecieGlowne ? (
              <div className="space-y-3">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
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
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Przesyłanie...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Zmień zdjęcie
                      </>
                    )}
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveSingleImage("zdjecieGlowne")}
                    disabled={isUploading}
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
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-10 w-10 mb-3 text-muted-foreground animate-spin" />
                        <p className="text-sm text-muted-foreground">Przesyłanie...</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Kliknij aby przesłać</span> zdjęcie główne
                        </p>
                        <p className="text-xs text-muted-foreground">
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
