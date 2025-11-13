"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Crop, RotateCcw, ZoomIn, ZoomOut } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface ImageCropperProps {
  image: File
  aspectRatio: number // e.g., 1 for 1:1, 2 for 16:8
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
  open: boolean
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export function ImageCropper({ image, aspectRatio, onCropComplete, onCancel, open }: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string>("")
  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Load image
  useEffect(() => {
    if (!image) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setImageSrc(e.target?.result as string)
        imageRef.current = img

        // Initialize crop area based on aspect ratio
        const containerWidth = 600
        const containerHeight = 400

        let cropWidth = Math.min(containerWidth * 0.8, img.width)
        let cropHeight = cropWidth / aspectRatio

        if (cropHeight > img.height) {
          cropHeight = img.height * 0.8
          cropWidth = cropHeight * aspectRatio
        }

        setCrop({
          x: (containerWidth - cropWidth) / 2,
          y: (containerHeight - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight,
        })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(image)
  }, [image, aspectRatio])

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !imageSrc) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 600
    canvas.height = 400

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate scaled image dimensions
    const img = imageRef.current
    let drawWidth = img.width * zoom
    let drawHeight = img.height * zoom

    // Center the image
    let drawX = (canvas.width - drawWidth) / 2
    let drawY = (canvas.height - drawHeight) / 2

    // Draw image
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

    // Draw overlay (darken everything except crop area)
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Clear crop area
    ctx.clearRect(crop.x, crop.y, crop.width, crop.height)
    ctx.drawImage(
      img,
      ((crop.x - drawX) / zoom),
      ((crop.y - drawY) / zoom),
      crop.width / zoom,
      crop.height / zoom,
      crop.x,
      crop.y,
      crop.width,
      crop.height
    )

    // Draw crop border
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height)

    // Draw corner handles
    const handleSize = 10
    ctx.fillStyle = "#fff"
    ctx.fillRect(crop.x - handleSize / 2, crop.y - handleSize / 2, handleSize, handleSize)
    ctx.fillRect(crop.x + crop.width - handleSize / 2, crop.y - handleSize / 2, handleSize, handleSize)
    ctx.fillRect(crop.x - handleSize / 2, crop.y + crop.height - handleSize / 2, handleSize, handleSize)
    ctx.fillRect(crop.x + crop.width - handleSize / 2, crop.y + crop.height - handleSize / 2, handleSize, handleSize)
  }, [imageSrc, crop, zoom])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if click is inside crop area
    if (x >= crop.x && x <= crop.x + crop.width && y >= crop.y && y <= crop.y + crop.height) {
      setIsDragging(true)
      setDragStart({ x: x - crop.x, y: y - crop.y })
    }
  }, [crop])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let newX = x - dragStart.x
    let newY = y - dragStart.y

    // Keep crop within canvas bounds
    newX = Math.max(0, Math.min(newX, canvas.width - crop.width))
    newY = Math.max(0, Math.min(newY, canvas.height - crop.height))

    setCrop((prev) => ({ ...prev, x: newX, y: newY }))
  }, [isDragging, dragStart, crop.width, crop.height])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleZoomChange = useCallback((value: number[]) => {
    setZoom(value[0])
  }, [])

  const handleCrop = useCallback(async () => {
    if (!imageRef.current) return

    const img = imageRef.current
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Calculate crop coordinates on the actual image
    const scaleX = img.width / (img.width * zoom)
    const scaleY = img.height / (img.height * zoom)

    const sourceX = (crop.x - (600 - img.width * zoom) / 2) / zoom
    const sourceY = (crop.y - (400 - img.height * zoom) / 2) / zoom
    const sourceWidth = crop.width / zoom
    const sourceHeight = crop.height / zoom

    // Set canvas size to match crop area
    canvas.width = sourceWidth
    canvas.height = sourceHeight

    // Draw cropped image
    ctx.drawImage(
      img,
      Math.max(0, sourceX),
      Math.max(0, sourceY),
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    )

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob)
      }
    }, image.type || "image/jpeg", 0.95)
  }, [crop, zoom, image.type, onCropComplete])

  const handleReset = useCallback(() => {
    setZoom(1)
    if (imageRef.current) {
      const img = imageRef.current
      let cropWidth = Math.min(600 * 0.8, img.width)
      let cropHeight = cropWidth / aspectRatio

      if (cropHeight > img.height) {
        cropHeight = img.height * 0.8
        cropWidth = cropHeight * aspectRatio
      }

      setCrop({
        x: (600 - cropWidth) / 2,
        y: (400 - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
      })
    }
  }, [aspectRatio])

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Kadruj obrazek</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div ref={containerRef} className="relative bg-gray-100 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-move max-w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ZoomOut className="h-4 w-4" />
              <Slider
                value={[zoom]}
                onValueChange={handleZoomChange}
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4" />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Przeciągnij obszar kadrowania, aby ustawić pozycję</span>
              <span>Proporcje: {aspectRatio === 1 ? "1:1" : aspectRatio === 2 ? "16:8" : `${aspectRatio}:1`}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
          <Button type="button" onClick={handleCrop}>
            <Crop className="h-4 w-4 mr-2" />
            Kadruj i zapisz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
