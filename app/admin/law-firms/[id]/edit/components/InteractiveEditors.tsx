"use client"

import React, { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { X, Plus, Trash2, Loader2, Upload, Image as ImageIcon } from "lucide-react"
import { toast } from "@/components/ui/sonner"

// --- TAGS EDITOR (for slowaKluczowe) ---
interface TagsEditorProps {
  value?: string
  onChange: (val: string) => void
  placeholder?: string
}

export function TagsEditor({ value = "", onChange, placeholder = "Wpisz tag i wciśnij Enter..." }: TagsEditorProps) {
  const [tags, setTags] = useState<string[]>([])
  const [input, setInput] = useState("")

  useEffect(() => {
    try {
      if (value) {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          setTags(parsed)
          return
        }
      }
    } catch (e) {}

    if (value && typeof value === "string") {
      const split = value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      setTags(split)
    } else {
      setTags([])
    }
  }, [value])

  const updateTags = (newTags: string[]) => {
    setTags(newTags)
    onChange(JSON.stringify(newTags))
  }

  const handleAdd = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      updateTags([...tags, trimmed])
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleRemove = (tagToRemove: string) => {
    updateTags(tags.filter((t) => t !== tagToRemove))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[42px] p-1.5 border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 px-2.5 py-1 text-sm bg-muted text-muted-foreground hover:bg-muted/80 rounded-md transition-colors"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="text-muted-foreground hover:text-foreground rounded-full outline-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        ))}
        {tags.length === 0 && (
          <span className="text-sm text-muted-foreground flex items-center px-2 py-1">
            Brak słów kluczowych.
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" onClick={handleAdd} variant="secondary">
          Dodaj
        </Button>
      </div>
    </div>
  )
}

// --- GALLERY EDITOR (for galeriaZdjec) ---
interface GalleryEditorProps {
  value?: string
  onChange: (val: string) => void
}

export function GalleryEditor({ value = "", onChange }: GalleryEditorProps) {
  const [images, setImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [urlInput, setUrlInput] = useState("")

  useEffect(() => {
    try {
      if (value) {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          setImages(parsed)
          return
        }
      }
    } catch (e) {}
    setImages([])
  }, [value])

  const updateImages = (newImages: string[]) => {
    setImages(newImages)
    onChange(JSON.stringify(newImages))
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Nieprawidłowy typ pliku: ${file.name}. Dozwolone: JPEG, PNG, WebP`)
          continue
        }

        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
          toast.error(`Plik ${file.name} jest za duży. Maksymalny rozmiar to 5MB`)
          continue
        }

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Przesyłanie nie powiodło się dla ${file.name}`)
        }

        const data = await response.json()
        if (data.url) {
          newUrls.push(data.url)
        }
      }

      if (newUrls.length > 0) {
        updateImages([...images, ...newUrls])
        toast.success(`Pomyślnie dodano ${newUrls.length} zdjęć`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Wystąpił błąd podczas przesyłania zdjęć")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleAddUrl = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      toast.error("Wprowadź poprawny adres URL (musi się zaczynać od http:// lub https://)")
      return
    }

    updateImages([...images, trimmed])
    setUrlInput("")
    toast.success("Zdjęcie zostało dodane z linku")
  }

  const handleRemove = (indexToRemove: number) => {
    updateImages(images.filter((_, idx) => idx !== indexToRemove))
    toast.success("Zdjęcie zostało usunięte z galerii")
  }

  return (
    <div className="space-y-4">
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center shadow-sm"
            >
              <img
                src={url}
                alt={`Zdjęcie w galerii ${idx + 1}`}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-md hover:scale-110 transition-transform"
                  onClick={() => handleRemove(idx)}
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-lg bg-muted/20">
          <ImageIcon className="h-10 w-10 text-muted-foreground/60 mb-2 animate-pulse" />
          <p className="text-sm text-muted-foreground">Galeria zdjęć jest pusta</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label
            htmlFor="gallery-file-upload"
            className="flex items-center justify-center gap-2 w-full h-10 px-4 border border-input rounded-md cursor-pointer bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors shadow-sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Przesyłanie...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 text-primary" />
                Wgraj zdjęcia z komputera
              </>
            )}
          </label>
          <input
            id="gallery-file-upload"
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </div>

        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Lub wklej URL (https://...)"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddUrl()
              }
            }}
          />
          <Button type="button" onClick={handleAddUrl} variant="outline">
            Dodaj link
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- BUSINESS HOURS EDITOR (for godzinyOtwarcia) ---
const DAYS_OF_WEEK = [
  { id: "poniedzialek", label: "Poniedziałek" },
  { id: "wtorek", label: "Wtorek" },
  { id: "sroda", label: "Środa" },
  { id: "czwartek", label: "Czwartek" },
  { id: "piatek", label: "Piątek" },
  { id: "sobota", label: "Sobota" },
  { id: "niedziela", label: "Niedziela" },
]

interface BusinessHoursEditorProps {
  value?: string
  onChange: (val: string) => void
}

export function BusinessHoursEditor({ value = "", onChange }: BusinessHoursEditorProps) {
  const [schedule, setSchedule] = useState<Record<string, { isOpen: boolean; from: string; to: string }>>({})

  useEffect(() => {
    let parsed: Record<string, string> = {}
    try {
      if (value) {
        parsed = JSON.parse(value)
      }
    } catch (e) {}

    const initialSchedule: Record<string, { isOpen: boolean; from: string; to: string }> = {}
    DAYS_OF_WEEK.forEach((day) => {
      const timeStr = parsed[day.id]
      if (timeStr && timeStr !== "Zamknięte" && timeStr.includes("-")) {
        const [from, to] = timeStr.split("-").map((t) => t.trim())
        initialSchedule[day.id] = { isOpen: true, from: from || "08:00", to: to || "16:00" }
      } else {
        initialSchedule[day.id] = { isOpen: false, from: "08:00", to: "16:00" }
      }
    })
    setSchedule(initialSchedule)
  }, [value])

  const updateSchedule = (newSchedule: typeof schedule) => {
    setSchedule(newSchedule)
    const result: Record<string, string> = {}
    DAYS_OF_WEEK.forEach((day) => {
      const entry = newSchedule[day.id]
      if (entry && entry.isOpen) {
        result[day.id] = `${entry.from}-${entry.to}`
      }
    })
    onChange(JSON.stringify(result))
  }

  const handleToggle = (dayId: string, checked: boolean) => {
    const updated = {
      ...schedule,
      [dayId]: {
        ...schedule[dayId],
        isOpen: checked,
      },
    }
    updateSchedule(updated)
  }

  const handleTimeChange = (dayId: string, field: "from" | "to", timeValue: string) => {
    const updated = {
      ...schedule,
      [dayId]: {
        ...schedule[dayId],
        [field]: timeValue,
      },
    }
    updateSchedule(updated)
  }

  return (
    <div className="space-y-1.5 border rounded-lg p-3 bg-muted/10">
      <div className="grid gap-3">
        {DAYS_OF_WEEK.map((day) => {
          const entry = schedule[day.id] || { isOpen: false, from: "08:00", to: "16:00" }
          return (
            <div
              key={day.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`hours-${day.id}`}
                  checked={entry.isOpen}
                  onCheckedChange={(checked) => handleToggle(day.id, !!checked)}
                />
                <Label htmlFor={`hours-${day.id}`} className="font-medium min-w-[120px] cursor-pointer text-sm">
                  {day.label}
                </Label>
              </div>

              {entry.isOpen ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={entry.from}
                    onChange={(e) => handleTimeChange(day.id, "from", e.target.value)}
                    className="w-28 text-center h-9"
                  />
                  <span className="text-xs text-muted-foreground">do</span>
                  <Input
                    type="time"
                    value={entry.to}
                    onChange={(e) => handleTimeChange(day.id, "to", e.target.value)}
                    className="w-28 text-center h-9"
                  />
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic sm:mr-16 py-1">Zamknięte</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- EDUCATION EDITOR (for edukacja) ---
interface EducationEntry {
  uczelnia: string
  wydzial?: string
  rokOd?: string | number
  rokDo?: string | number
}

interface EducationEditorProps {
  value?: string
  onChange: (val: string) => void
}

export function EducationEditor({ value = "", onChange }: EducationEditorProps) {
  const [entries, setEntries] = useState<EducationEntry[]>([])

  useEffect(() => {
    try {
      if (value) {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          setEntries(parsed)
          return
        }
      }
    } catch (e) {}
    setEntries([])
  }, [value])

  const updateEntries = (newEntries: EducationEntry[]) => {
    setEntries(newEntries)
    onChange(JSON.stringify(newEntries))
  }

  const handleAdd = () => {
    updateEntries([...entries, { uczelnia: "", wydzial: "", rokOd: "", rokDo: "" }])
  }

  const handleFieldChange = (index: number, field: keyof EducationEntry, val: string) => {
    const updated = entries.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: val }
      }
      return item
    })
    updateEntries(updated)
  }

  const handleRemove = (indexToRemove: number) => {
    updateEntries(entries.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, idx) => (
        <div key={idx} className="relative p-4 border border-border rounded-lg bg-card space-y-3 shadow-sm">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-xs font-semibold text-primary">Pozycja #{idx + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
              onClick={() => handleRemove(idx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Uczelnia / Szkoła</Label>
              <Input
                value={entry.uczelnia}
                onChange={(e) => handleFieldChange(idx, "uczelnia", e.target.value)}
                placeholder="np. Uniwersytet Warszawski"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Wydział / Kierunek (opcjonalnie)</Label>
              <Input
                value={entry.wydzial || ""}
                onChange={(e) => handleFieldChange(idx, "wydzial", e.target.value)}
                placeholder="np. Wydział Prawa i Administracji"
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs">
            <div className="space-y-1">
              <Label className="text-xs">Rok rozpoczęcia</Label>
              <Input
                type="number"
                value={entry.rokOd || ""}
                onChange={(e) => handleFieldChange(idx, "rokOd", e.target.value)}
                placeholder="np. 2010"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Rok zakończenia</Label>
              <Input
                type="number"
                value={entry.rokDo || ""}
                onChange={(e) => handleFieldChange(idx, "rokDo", e.target.value)}
                placeholder="np. 2015"
                className="h-9"
              />
            </div>
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 border border-dashed border-border rounded-lg bg-muted/20">
          <span className="text-sm text-muted-foreground">Brak wpisów edukacyjnych.</span>
        </div>
      )}

      <Button type="button" variant="outline" className="w-full flex items-center gap-2 h-9" onClick={handleAdd}>
        <Plus className="h-4 w-4" />
        Dodaj wpis edukacyjny
      </Button>
    </div>
  )
}
