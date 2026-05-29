"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageCrop, ImageCropApply, ImageCropContent, ImageCropReset } from "@/components/ui/shadcn-io/image-crop"
import { Crop, RotateCcw } from "lucide-react"

interface ImageCropperProps {
  image: File
  aspectRatio: number // e.g., 1 for 1:1, 2 for 16:8
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
  open: boolean
}

export function ImageCropper({ image, aspectRatio, onCropComplete, onCancel, open }: ImageCropperProps) {
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
          >
            <div className="relative bg-gray-100 rounded-lg overflow-hidden p-4 flex items-center justify-center min-h-[400px] max-h-[600px]">
              <ImageCropContent className="max-h-[550px]" />
            </div>

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
