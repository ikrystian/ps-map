"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, X, Image as ImageIcon, Video } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"

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
  const [imageIndexToDelete, setImageIndexToDelete] = useState<number | null>(null)
  return (
    <div className="space-y-6">
      {/* Galeria zdjęć */}
      <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
        <CardHeader className="border-b border-border/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#0da192]/10 p-2 rounded-xl text-[#0da192]">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-white font-playfair">Galeria zdjęć</CardTitle>
              <CardDescription className="text-zinc-400 text-sm">
                Dodaj zdjęcia prezentujące Twoją działalność (maksymalnie 10 zdjęć, do 5MB każde)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Przycisk dodawania */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="gallery-upload"
              className="inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#0da192] hover:bg-[#0a8276] text-white h-10 px-4 py-2 cursor-pointer shadow-md"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Przesyłanie...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4 text-white" />
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
            <span className="text-sm text-zinc-400 font-light">
              Dodano {formData.galeriaZdjec.length} z 10 zdjęć
            </span>
          </div>

          {/* Grid zdjęć */}
          {formData.galeriaZdjec.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border border-border/20 rounded-xl bg-zinc-950/10">
              {formData.galeriaZdjec.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-border/30 bg-zinc-900">
                    <Image
                      src={imageUrl}
                      alt={`Galeria ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => setImageIndexToDelete(index)}
                      className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
                      title="Usuń zdjęcie"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-center text-zinc-500 mt-1.5 font-light">
                    Zdjęcie {index + 1}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/30 rounded-xl bg-zinc-950/5">
              <ImageIcon className="h-12 w-12 text-zinc-600 mb-4" />
              <p className="text-zinc-300 text-sm font-medium">Brak zdjęć w galerii</p>
              <p className="text-xs text-zinc-500 mt-1">
                Kliknij przycisk powyżej, aby przesłać pierwsze zdjęcia
              </p>
            </div>
          )}

          {formData.galeriaZdjec.length > 0 && (
            <div className="bg-[#0da192]/5 border border-[#0da192]/20 p-4 rounded-xl">
              <p className="text-xs text-zinc-400 leading-relaxed">
                <strong className="text-white font-medium">Wskazówka:</strong> Zdjęcia będą wyświetlane w galerii na Twoim profilu publicznym. Najedź kursorem na wybrane zdjęcie i kliknij przycisk z ikoną kosza (X), aby je usunąć z galerii.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Film YouTube */}
      <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
        <CardHeader className="border-b border-border/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#0da192]/10 p-2 rounded-xl text-[#0da192]">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-white font-playfair">Prezentacja wideo (opcjonalnie)</CardTitle>
              <CardDescription className="text-zinc-400 text-sm">
                Dodaj film promocyjny ze swojego kanału YouTube
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-2">
            <Label htmlFor="filmYouTube" className="text-zinc-300">Link do filmu YouTube</Label>
            <Input
              id="filmYouTube"
              value={formData.filmYouTube}
              onChange={(e) => handleInputChange("filmYouTube", e.target.value)}
              placeholder="np. https://www.youtube.com/watch?v=..."
              className="bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-[#0da192]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="kolejnoscMultimedia" className="text-zinc-300">Kolejność wyświetlania na profilu</Label>
            <Select
              value={formData.kolejnoscMultimedia}
              onValueChange={(value) => handleInputChange("kolejnoscMultimedia", value)}
            >
              <SelectTrigger className="bg-zinc-950/20 border-border/30 text-white rounded-xl">
                <SelectValue placeholder="Wybierz kolejność..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-border/30 rounded-xl">
                <SelectItem value="zdjecia" className="text-zinc-300 focus:text-white">Najpierw galeria zdjęć, potem film wideo</SelectItem>
                <SelectItem value="film" className="text-zinc-300 focus:text-white">Najpierw film wideo, potem galeria zdjęć</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={imageIndexToDelete !== null}
        onOpenChange={(open) => !open && setImageIndexToDelete(null)}
        onConfirm={() => {
          if (imageIndexToDelete !== null) {
            handleRemoveImage(imageIndexToDelete)
          }
        }}
        title="Usuń zdjęcie z galerii"
        description="Czy na pewno chcesz usunąć to zdjęcie z galerii? Tej operacji nie można cofnąć."
        confirmText="Usuń"
        cancelText="Anuluj"
      />
    </div>
  )
}
