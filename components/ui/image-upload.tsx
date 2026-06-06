"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link as LinkIcon, Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { useId, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  description?: string
}

export function ImageUpload({ value, onChange, label, description }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [urlInput, setUrlInput] = useState(value || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uniqueId = useId()

  const uploadFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Nieprawidłowy typ pliku. Dozwolone: JPEG, PNG, WebP, GIF")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Plik jest za duży. Maksymalny rozmiar to 5MB")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      onChange(data.url)
      toast.success("Obrazek został przesłany")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Nie udało się przesłać obrazka")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      await uploadFile(file)
    }
  }

  const handleUrlSubmit = () => {
    if (!urlInput) {
      toast.error("Podaj URL obrazka")
      return
    }

    try {
      new URL(urlInput)
      onChange(urlInput)
      toast.success("URL obrazka został zapisany")
    } catch {
      toast.error("Podaj poprawny URL")
    }
  }

  const handleRemove = () => {
    onChange("")
    setUrlInput("")
  }

  return (
    <div className="space-y-4">
      {label && <Label>{label}</Label>}

      {value ? (
        <div className="space-y-4">
          <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              onError={() => {
                toast.error("Nie można załadować obrazka")
                onChange("")
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="destructive" size="sm" onClick={handleRemove}>
              <X className="h-4 w-4 mr-2" />
              Usuń obrazek
            </Button>
            <p className="text-sm text-muted-foreground truncate flex-1">{value}</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Prześlij plik
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              Użyj URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                isDragActive
                  ? "border-primary bg-primary/10 scale-[0.99]"
                  : "border-muted-foreground/30 hover:border-primary hover:bg-muted/5"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id={uniqueId}
              />
              <label
                htmlFor={uniqueId}
                className={cn(
                  "cursor-pointer block w-full h-full",
                  isUploading ? "pointer-events-none opacity-50" : ""
                )}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Przesyłanie...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-12 w-12 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-1" />
                    <p className="text-sm font-medium">
                      {isDragActive ? "Upuść plik tutaj" : "Kliknij lub przeciągnij plik, aby go wybrać"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, WebP lub GIF (max 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleUrlSubmit()
                  }
                }}
              />
              <Button type="button" onClick={handleUrlSubmit}>
                Dodaj
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Wklej URL do obrazka z internetu
            </p>
          </TabsContent>
        </Tabs>
      )}

      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}
