"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2, Calendar, Check, CheckCircle2, Code2, Edit,
  Image as ImageIcon, LayoutGrid, Link, Loader2, Megaphone, Plus,
  Search, Sliders, Tag, Trash2, UploadCloud, X,
} from "lucide-react"
import { useState } from "react"
import type { AdClient, Advertisement } from "./types"
import { AD_LOCATIONS } from "./types"

interface AdsTabProps {
  ads: Advertisement[]
  clients: AdClient[]
  onRefresh: () => void
}

export function AdsTab({ ads, clients, onRefresh }: AdsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLocation, setFilterLocation] = useState("all")
  const [filterClient, setFilterClient] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [creativeType, setCreativeType] = useState<"image" | "html">("image")

  const [formData, setFormData] = useState({
    name: "", imageUrl: "", linkUrl: "", htmlContent: "",
    location: "search_top", active: true, startDate: "", endDate: "",
    clientId: "", weight: "1", priority: "0",
  })

  const filtered = ads.filter(ad => {
    const matchSearch = ad.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchLoc = filterLocation === "all" || ad.location === filterLocation
    const matchClient = filterClient === "all"
      || (filterClient === "none" && !ad.clientId)
      || ad.clientId === filterClient
    return matchSearch && matchLoc && matchClient
  })

  const openDialog = (ad?: Advertisement) => {
    if (ad) {
      setEditingAd(ad)
      setCreativeType(ad.htmlContent ? "html" : "image")
      setFormData({
        name: ad.name,
        imageUrl: ad.imageUrl || "",
        linkUrl: ad.linkUrl,
        htmlContent: ad.htmlContent || "",
        location: ad.location,
        active: ad.active,
        startDate: ad.startDate ? new Date(ad.startDate).toISOString().split("T")[0] : "",
        endDate: ad.endDate ? new Date(ad.endDate).toISOString().split("T")[0] : "",
        clientId: ad.clientId || "",
        weight: String(ad.weight ?? 1),
        priority: String(ad.priority ?? 0),
      })
    } else {
      setEditingAd(null)
      setCreativeType("image")
      setFormData({ name: "", imageUrl: "", linkUrl: "", htmlContent: "", location: "search_top", active: true, startDate: "", endDate: "", clientId: "", weight: "1", priority: "0" })
    }
    setIsDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/upload/image", { method: "POST", body: fd })
      if (!res.ok) throw new Error((await res.json()).error || "Upload failed")
      const data = await res.json()
      setFormData(p => ({ ...p, imageUrl: data.url }))
      toast.success("Plik graficzny przesłany pomyślnie!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd przesyłania")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/ads/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !current }) })
      if (!res.ok) throw new Error()
      toast.success(`Reklama ${!current ? "aktywowana" : "dezaktywowana"}`)
      onRefresh()
    } catch { toast.error("Nie udało się zmienić statusu") }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę reklamę?")) return
    try {
      const res = await fetch(`/api/admin/ads/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Reklama usunięta")
      onRefresh()
    } catch { toast.error("Nie udało się usunąć reklamy") }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.location || !formData.linkUrl.trim()) {
      toast.error("Wypełnij wszystkie wymagane pola")
      return
    }
    if (creativeType === "image" && !formData.imageUrl) { toast.error("Musisz wgrać lub podać link do pliku graficznego"); return }
    if (creativeType === "html" && !formData.htmlContent) { toast.error("Musisz wkleić kod HTML"); return }

    setIsSubmitting(true)

    const payload = {
      name: formData.name.trim(),
      location: formData.location,
      linkUrl: formData.linkUrl.trim(),
      active: formData.active,
      imageUrl: creativeType === "image" ? formData.imageUrl.trim() : null,
      htmlContent: creativeType === "html" ? formData.htmlContent.trim() : null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      clientId: formData.clientId || null,
      weight: parseInt(formData.weight) || 1,
      priority: parseInt(formData.priority) || 0,
    }

    try {
      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : "/api/admin/ads"
      const method = editingAd ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error((await res.json()).error || "Błąd zapisu")
      toast.success(editingAd ? "Zapisano zmiany reklamy" : "Dodano nową reklamę")
      setIsDialogOpen(false)
      onRefresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Szukaj reklamy..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Lokalizacja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie lokalizacje</SelectItem>
                  {AD_LOCATIONS.map(l => <SelectItem key={l.value} value={l.value}>{l.label.split(" (")[0]}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Klient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszyscy klienci</SelectItem>
                  <SelectItem value="none">Bez klienta</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => openDialog()} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" /> Dodaj reklamę
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista reklam</CardTitle>
          <CardDescription>Wszystkie kreacje reklamowe z wydajnością i przypisaniem do klientów.</CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-40" />
              <h3 className="font-semibold text-lg">Brak reklam</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                {searchQuery || filterLocation !== "all" || filterClient !== "all"
                  ? "Brak reklam spełniających kryteria filtrowania."
                  : "Nie dodano jeszcze żadnych reklam."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Podgląd</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Nazwa / Klient</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Lokalizacja</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Okres</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-center">Wyśw.</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-center">Klik.</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-center">CTR</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-center">Waga</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(ad => {
                    const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
                    const locLabel = AD_LOCATIONS.find(l => l.value === ad.location)?.label.split(" (")[0] || ad.location
                    return (
                      <tr key={ad.id} className="hover:bg-accent/40 transition-colors">
                        <td className="py-3 px-4">
                          {ad.htmlContent ? (
                            <Badge variant="outline" className="font-mono bg-blue-500/5 text-blue-500 border-blue-500/25 text-xs">HTML</Badge>
                          ) : ad.imageUrl ? (
                            <div className="relative w-20 h-9 border rounded overflow-hidden bg-neutral-950">
                              <img src={ad.imageUrl} alt={ad.name} className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Brak kreacji</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{ad.name}</div>
                          {ad.client && (
                            <Badge variant="outline" className="text-xs mt-0.5">{ad.client.name}</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{locLabel}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Od: {ad.startDate ? new Date(ad.startDate).toLocaleDateString("pl-PL") : "zawsze"}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Do: {ad.endDate ? new Date(ad.endDate).toLocaleDateString("pl-PL") : "zawsze"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">{ad.impressions.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center font-semibold">{ad.clicks.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center font-semibold text-primary">{ctr.toFixed(2)}%</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="text-xs">{ad.weight}x</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Switch checked={ad.active} onCheckedChange={() => handleToggleActive(ad.id, ad.active)} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(ad)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(ad.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modernized Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-border shadow-2xl">
          <form onSubmit={handleSubmit}>
            {/* Header z akcentem wizualnym */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/60">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-primary/15 text-primary border border-primary/20 shadow-sm shrink-0">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    {editingAd ? "Edytuj reklamę" : "Dodaj nową reklamę"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-1">
                    Skonfiguruj kreację banerową, link docelowy oraz zasady emisji i rotacji.
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Treść formularza */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Sekcja 1: Podstawowe informacje */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  <span>Podstawowe parametry</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ad-name" className="text-xs font-medium">
                    Nazwa reklamy / kampanii <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ad-name"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="np. Baner Główny – Kancelaria XYZ"
                      className="pl-9 bg-background/50 focus:bg-background transition-colors text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Klient reklamowy</Label>
                    <Select value={formData.clientId || "_none"} onValueChange={v => setFormData(p => ({ ...p, clientId: v === "_none" ? "" : v }))}>
                      <SelectTrigger className="bg-background/50 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <SelectValue placeholder="Brak (opcjonalne)" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Brak przypisania (reklama własna)</SelectItem>
                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Lokalizacja / Slot <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.location} onValueChange={v => setFormData(p => ({ ...p, location: v }))}>
                      <SelectTrigger className="bg-background/50 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {AD_LOCATIONS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ad-link" className="text-xs font-medium">
                    Docelowy link URL <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ad-link"
                      type="url"
                      value={formData.linkUrl}
                      onChange={e => setFormData(p => ({ ...p, linkUrl: e.target.value }))}
                      placeholder="https://kancelaria-kowalski.pl/promocja"
                      className="pl-9 bg-background/50 focus:bg-background transition-colors text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Sekcja 2: Kreacja reklamowa */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                    <span>Format kreacji</span>
                  </div>
                </div>

                {/* Przełącznik typu kreacji */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreativeType("image")}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      creativeType === "image"
                        ? "border-primary bg-primary/10 ring-1 ring-primary text-foreground font-medium shadow-sm"
                        : "border-border bg-background/50 hover:bg-accent/40 text-muted-foreground"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${creativeType === "image" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Grafika (Baner)</p>
                      <p className="text-[11px] text-muted-foreground">Plik JPG, PNG, WebP, GIF</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreativeType("html")}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      creativeType === "html"
                        ? "border-primary bg-primary/10 ring-1 ring-primary text-foreground font-medium shadow-sm"
                        : "border-border bg-background/50 hover:bg-accent/40 text-muted-foreground"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${creativeType === "html" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Code2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Kod HTML / Skrypt</p>
                      <p className="text-[11px] text-muted-foreground">AdSense, iframe, widget JS</p>
                    </div>
                  </button>
                </div>

                {/* Grafika Banera */}
                {creativeType === "image" && (
                  <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-muted/20">
                    <Label className="text-xs font-medium flex items-center justify-between">
                      <span>Grafika reklamowa <span className="text-destructive">*</span></span>
                      {formData.imageUrl && (
                        <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                          <Check className="h-3 w-3" /> Wybrano grafikę
                        </span>
                      )}
                    </Label>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          value={formData.imageUrl}
                          onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                          placeholder="Wklej adres URL grafiki lub przesłaj plik z komputera..."
                          className="text-xs bg-background pr-3"
                        />
                      </div>
                      <div className="relative">
                        <input
                          id="banner-file"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => document.getElementById("banner-file")?.click()}
                          disabled={isUploading}
                          className="gap-2 text-xs h-9 px-3 shrink-0"
                        >
                          {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5 text-primary" />}
                          {isUploading ? "Przesyłanie..." : "Wgraj plik"}
                        </Button>
                      </div>
                    </div>

                    {/* Podgląd banera */}
                    {formData.imageUrl ? (
                      <div className="relative border border-border/80 rounded-lg p-3 bg-neutral-950/90 flex flex-col items-center justify-center min-h-[110px] overflow-hidden group">
                        <img
                          src={formData.imageUrl}
                          alt="Podgląd kreacji"
                          className="max-h-[130px] w-auto object-contain rounded"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => setFormData(p => ({ ...p, imageUrl: "" }))}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-border rounded-lg p-5 text-center bg-background/50">
                        <ImageIcon className="h-7 w-7 mx-auto text-muted-foreground/40 mb-1.5" />
                        <p className="text-xs text-muted-foreground">Brak podglądu – wgraj plik lub wpisz URL grafiki</p>
                      </div>
                    )}
                  </div>
                )}

                {/* HTML content */}
                {creativeType === "html" && (
                  <div className="space-y-2 p-4 rounded-xl border border-border/80 bg-muted/20">
                    <Label className="text-xs font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5 text-primary" /> Kod HTML lub Skrypt <span className="text-destructive">*</span>
                      </span>
                    </Label>
                    <Textarea
                      value={formData.htmlContent}
                      onChange={e => setFormData(p => ({ ...p, htmlContent: e.target.value }))}
                      placeholder="<a href='...'><img src='...' /></a> lub kod skryptu Google AdSense..."
                      className="font-mono text-xs h-[110px] bg-neutral-950 text-neutral-100 border-neutral-800 focus:border-primary resize-none"
                      required={creativeType === "html"}
                    />
                  </div>
                )}
              </div>

              {/* Sekcja 3: Rotacja i Harmonogram */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Sliders className="h-3.5 w-3.5 text-primary" />
                  <span>Emisja i Rotacja</span>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-xl border border-border/80 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-primary" /> Waga rotacji (Priorytet wyświetlania)
                    </Label>
                    <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
                      Waga: {formData.weight}x
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.weight}
                      onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))}
                      className="w-20 text-center font-bold text-sm bg-background"
                    />
                    <span className="text-xs text-muted-foreground">
                      Wartość od 1 do 10. Wyższa waga zwiększa szansę w losowaniu reklam w tym samym slocie.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="ad-start" className="text-xs font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Data rozpoczęcia
                    </Label>
                    <Input
                      id="ad-start"
                      type="date"
                      value={formData.startDate}
                      onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                      className="text-xs bg-background/50 focus:bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ad-end" className="text-xs font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Data zakończenia
                    </Label>
                    <Input
                      id="ad-end"
                      type="date"
                      value={formData.endDate}
                      onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                      className="text-xs bg-background/50 focus:bg-background"
                    />
                  </div>
                </div>

                {/* Status aktywności */}
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  formData.active ? "bg-primary/5 border-primary/20" : "bg-muted/40 border-border"
                }`}>
                  <div className="space-y-0.5">
                    <Label htmlFor="ad-active" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${formData.active ? "text-primary" : "text-muted-foreground"}`} />
                      Reklama aktywna
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.active ? "Reklama jest aktywna i bierze udział w rotacji na portalu." : "Reklama jest wstrzymana i nie będzie wyświetlana."}
                    </p>
                  </div>
                  <Switch
                    id="ad-active"
                    checked={formData.active}
                    onCheckedChange={v => setFormData(p => ({ ...p, active: v }))}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 bg-muted/30 border-t border-border/80 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="px-5">
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting} className="px-5 gap-2 font-medium">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    {editingAd ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingAd ? "Zapisz zmiany" : "Dodaj reklamę"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
