"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface MultimediaTabProps {
  formData: {
    galeriaZdjec: string[]
    filmYouTube: string
    okladkaFilmu: string
    kolejnoscMultimedia: string
  }
  isUploading: boolean
  handleInputChange: (field: string, value: any) => void
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveImage: (index: number) => void
}

export function MultimediaTab({
  formData,
  isUploading,
  handleInputChange,
  handleImageUpload,
  handleRemoveImage,
}: MultimediaTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Galeria zdjęć</CardTitle>
          <CardDescription>
            Dodaj zdjęcia swojego profilu (maksymalnie 10 zdjęć, każde do 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Button */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="gallery-upload"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Przesyłanie...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Dodaj zdjęcia
                </>
              )}
            </label>
            <input
              id="gallery-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading || formData.galeriaZdjec.length >= 10}
            />
            <span className="text-sm text-muted-foreground">
              {formData.galeriaZdjec.length} / 10 zdjęć
            </span>
          </div>

          {/* Gallery Grid */}
          {formData.galeriaZdjec.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.galeriaZdjec.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
                    <Image
                      src={imageUrl}
                      alt={`Galeria ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                      title="Usuń zdjęcie"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Zdjęcie {index + 1}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Brak zdjęć w galerii
              </p>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Kliknij "Dodaj zdjęcia" aby przesłać zdjęcia
              </p>
            </div>
          )}

          {formData.galeriaZdjec.length > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Wskazówka:</strong> Zdjęcia będą wyświetlane w galerii na Twoim profilu.
                Najedź kursorem na zdjęcie i kliknij przycisk X aby je usunąć.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Film YouTube (opcjonalnie)</CardTitle>
          <CardDescription>
            Dodaj link do filmu na YouTube prezentującego Twój profil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="filmYouTube">Link do filmu YouTube</Label>
            <Input
              id="filmYouTube"
              value={formData.filmYouTube}
              onChange={(e) => handleInputChange("filmYouTube", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="kolejnoscMultimedia">Kolejność wyświetlania</Label>
            <Select
              value={formData.kolejnoscMultimedia}
              onValueChange={(value) => handleInputChange("kolejnoscMultimedia", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zdjecia">Najpierw zdjęcia, potem film</SelectItem>
                <SelectItem value="film">Najpierw film, potem zdjęcia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
