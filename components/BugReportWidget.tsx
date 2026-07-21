"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { bugReportCategoryLabels, type BugReportCategory } from "@/types/bug-reports"
import { Bug, Camera, Loader2, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"

interface Screenshot {
  url: string
  uploading?: boolean
}

export function BugReportWidget() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [opis, setOpis] = useState("")
  const [url, setUrl] = useState("")
  const [kategoria, setKategoria] = useState<BugReportCategory | "">("")
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (session?.user?.role !== "LAW_FIRM") {
    return null
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && typeof window !== "undefined") {
      setUrl(window.location.href)
    }
  }

  const resetForm = () => {
    setOpis("")
    setKategoria("")
    setScreenshots([])
  }

  const handleCapture = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error("Twoja przeglądarka nie obsługuje przechwytywania ekranu")
      return
    }

    setIsCapturing(true)
    let stream: MediaStream | null = null

    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true })

      const video = document.createElement("video")
      video.muted = true
      video.srcObject = stream

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve()
      })
      await video.play()

      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

      stream.getTracks().forEach((track) => track.stop())
      stream = null

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      )

      if (!blob) {
        toast.error("Nie udało się przetworzyć zrzutu ekranu")
        return
      }

      const formData = new FormData()
      formData.append("file", blob, `zrzut-ekranu-${Date.now()}.png`)

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (response.ok) {
        setScreenshots((prev) => [...prev, { url: data.url }])
      } else {
        toast.error(data.error || "Nie udało się przesłać zrzutu ekranu")
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast.error("Odmówiono dostępu do przechwytywania ekranu")
      } else {
        toast.error("Nie udało się zrobić zrzutu ekranu")
      }
    } finally {
      stream?.getTracks().forEach((track) => track.stop())
      setIsCapturing(false)
    }
  }

  const removeScreenshot = (screenshotUrl: string) => {
    setScreenshots((prev) => prev.filter((s) => s.url !== screenshotUrl))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!opis.trim() || !url.trim() || !kategoria) {
      toast.error("Uzupełnij opis, adres URL oraz kategorię")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opis,
          url,
          kategoria,
          zalaczniki: screenshots.map((s) => s.url),
        }),
      })

      if (response.ok) {
        toast.success("Dziękujemy! Zgłoszenie zostało wysłane do weryfikacji.")
        resetForm()
        setIsOpen(false)
      } else {
        const data = await response.json()
        toast.error(data.error || "Nie udało się wysłać zgłoszenia")
      }
    } catch {
      toast.error("Nie udało się wysłać zgłoszenia")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <button
        onClick={() => handleOpenChange(true)}
        className="fixed right-0 top-1/2 z-50 flex -translate-y-1/2 items-center gap-2 rounded-l-lg bg-primary px-3 py-4 text-primary-foreground shadow-lg transition-transform hover:-translate-x-1"
        aria-label="Zgłoś błąd"
      >
        <Bug className="h-5 w-5" />
        <span className="[writing-mode:vertical-rl] rotate-180 text-xs font-medium tracking-wide">
          Zgłoś błąd
        </span>
      </button>

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Zgłoś błąd</SheetTitle>
          <SheetDescription>
            Znalazłeś błąd w serwisie? Opisz go poniżej — po zaakceptowaniu zgłoszenia
            otrzymasz 20 punktów.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bug-opis">Opis błędu</Label>
            <Textarea
              id="bug-opis"
              value={opis}
              onChange={(e) => setOpis(e.target.value)}
              placeholder="Co się stało? Jak to odtworzyć?"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bug-url">Adres URL</Label>
            <Input
              id="bug-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bug-kategoria">Kategoria</Label>
            <Select value={kategoria} onValueChange={(v) => setKategoria(v as BugReportCategory)}>
              <SelectTrigger id="bug-kategoria">
                <SelectValue placeholder="Wybierz kategorię" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(bugReportCategoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Zrzuty ekranu</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCapture}
              disabled={isCapturing}
              className="w-full"
            >
              {isCapturing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              Zrób zrzut ekranu
            </Button>

            {screenshots.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {screenshots.map((screenshot) => (
                  <div key={screenshot.url} className="group relative">
                    <img
                      src={screenshot.url}
                      alt="Zrzut ekranu"
                      className="h-20 w-full rounded-md border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(screenshot.url)}
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
                      aria-label="Usuń zrzut ekranu"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Wyślij zgłoszenie
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
