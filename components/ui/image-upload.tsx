"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, Link as LinkIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  description?: string
}

export function ImageUpload({ value, onChange, label, description }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [urlInput, setUrlInput] = useState(value || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer ${isUploading ? "pointer-events-none opacity-50" : ""}`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Przesyłanie...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm font-medium">Kliknij, aby wybrać plik</p>
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
