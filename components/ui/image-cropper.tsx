"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageCrop, ImageCropApply, ImageCropContent, ImageCropReset, useImageCrop } from "@/components/ui/shadcn-io/image-crop"
import { AlertTriangle, Crop, RotateCcw } from "lucide-react"

interface ImageCropperProps {
  image: File
  aspectRatio: number // e.g., 1 for 1:1, 2 for 16:8
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
  open: boolean
  /** Zalecana minimalna szerokość kadru w pikselach oryginału — poniżej pokazujemy ostrzeżenie. */
  minRecommendedWidth?: number
  /** Maksymalna szerokość zapisanego kadru (większe są zmniejszane, mniejsze zapisywane 1:1). */
  maxOutputWidth?: number
}

function CropResolutionInfo({ minRecommendedWidth }: { minRecommendedWidth?: number }) {
  const { cropSourceSize } = useImageCrop()
  if (!cropSourceSize) return null

  const tooSmall = !!minRecommendedWidth && cropSourceSize.width < minRecommendedWidth

  return (
    <p className={tooSmall ? "flex items-center gap-2 text-sm text-amber-600" : "text-sm text-muted-foreground"}>
      {tooSmall && <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
      Rozmiar kadru: {cropSourceSize.width}×{cropSourceSize.height} px
      {tooSmall && ` — zalecane min. ${minRecommendedWidth} px szerokości, obraz może być nieostry na dużych ekranach.`}
    </p>
  )
}

export function ImageCropper({
  image,
  aspectRatio,
  onCropComplete,
  onCancel,
  open,
  minRecommendedWidth,
  maxOutputWidth,
}: ImageCropperProps) {
  const handleCrop = async (croppedImage: string) => {
    // Convert base64 to blob
    const response = await fetch(croppedImage)
    const blob = await response.blob()
    onCropComplete(blob)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Kadruj obrazek</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <ImageCrop
            file={image}
            aspect={aspectRatio}
            onCrop={handleCrop}
            maxImageSize={5 * 1024 * 1024}
            maxOutputWidth={maxOutputWidth}
          >
            <div className="relative bg-gray-100 rounded-lg overflow-hidden p-4 flex items-center justify-center min-h-[400px] max-h-[600px]">
              <ImageCropContent className="max-h-[550px]" />
            </div>

            <CropResolutionInfo minRecommendedWidth={minRecommendedWidth} />

            <DialogFooter className="mt-4">
              <ImageCropReset asChild>
                <Button type="button" variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </ImageCropReset>
              <Button type="button" variant="outline" onClick={onCancel}>
                Anuluj
              </Button>
              <ImageCropApply asChild>
                <Button type="button">
                  <Crop className="h-4 w-4 mr-2" />
                  Kadruj i zapisz
                </Button>
              </ImageCropApply>
            </DialogFooter>
          </ImageCrop>
        </div>
      </DialogContent>
    </Dialog>
  )
}
