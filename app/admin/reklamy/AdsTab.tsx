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
  Calendar, Edit, Loader2, Megaphone, Plus, Search, Trash2,
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
      toast.success("Plik przesłany pomyślnie!")
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
    if (!formData.name || !formData.location || !formData.linkUrl) {
      toast.error("Wypełnij wymagane pola")
      return
    }
    if (creativeType === "image" && !formData.imageUrl) { toast.error("Musisz wgrać plik graficzny"); return }
    if (creativeType === "html" && !formData.htmlContent) { toast.error("Musisz wkleić kod HTML"); return }

    const payload = {
      name: formData.name,
      location: formData.location,
      linkUrl: formData.linkUrl,
      active: formData.active,
      imageUrl: creativeType === "image" ? formData.imageUrl : null,
      htmlContent: creativeType === "html" ? formData.htmlContent : null,
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
      toast.success(editingAd ? "Zapisano zmiany" : "Dodano reklamę")
      setIsDialogOpen(false)
      onRefresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd")
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

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[580px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingAd ? "Edytuj reklamę" : "Dodaj nową reklamę"}</DialogTitle>
              <DialogDescription>Zdefiniuj kreację i parametry wyświetlania banneru.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ad-name" className="text-right">Nazwa *</Label>
                <Input id="ad-name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="np. Kancelaria XYZ – Maj 2025" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Klient</Label>
                <div className="col-span-3">
                  <Select value={formData.clientId || "_none"} onValueChange={v => setFormData(p => ({ ...p, clientId: v === "_none" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Brak (opcjonalne)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Brak przypisania</SelectItem>
                      {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Lokalizacja *</Label>
                <div className="col-span-3">
                  <Select value={formData.location} onValueChange={v => setFormData(p => ({ ...p, location: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AD_LOCATIONS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ad-link" className="text-right">Link URL *</Label>
                <Input id="ad-link" type="url" value={formData.linkUrl} onChange={e => setFormData(p => ({ ...p, linkUrl: e.target.value }))} placeholder="https://example.com" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Typ kreacji</Label>
                <div className="col-span-3 flex gap-4">
                  {(["image", "html"] as const).map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" checked={creativeType === t} onChange={() => setCreativeType(t)} className="accent-primary" />
                      {t === "image" ? "Grafika (Baner)" : "Własny HTML / Skrypt"}
                    </label>
                  ))}
                </div>
              </div>
              {creativeType === "image" && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Baner graficzny</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex gap-2">
                      <Input value={formData.imageUrl} onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value }))} placeholder="Link do grafiki lub wgraj plik..." className="flex-1" />
                      <div className="relative">
                        <input id="banner-file" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                        <Button type="button" variant="outline" onClick={() => document.getElementById("banner-file")?.click()} disabled={isUploading}>
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Wgraj plik"}
                        </Button>
                      </div>
                    </div>
                    {formData.imageUrl && (
                      <div className="border rounded p-2 bg-neutral-950 flex justify-center max-h-[120px] overflow-hidden">
                        <img src={formData.imageUrl} alt="Podgląd" className="max-h-[100px] object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {creativeType === "html" && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Kod HTML *</Label>
                  <Textarea value={formData.htmlContent} onChange={e => setFormData(p => ({ ...p, htmlContent: e.target.value }))} placeholder="<a href='...'><img src='...' /></a>" className="col-span-3 font-mono text-xs h-[90px]" required={creativeType === "html"} />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Waga rotacji</Label>
                <div className="col-span-3 flex items-center gap-3">
                  <Input type="number" min="1" max="10" value={formData.weight} onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))} className="w-24" />
                  <span className="text-xs text-muted-foreground">1–10, wyższy = częściej wyświetlana</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ad-start" className="text-right">Data startu</Label>
                <Input id="ad-start" type="date" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ad-end" className="text-right">Data końca</Label>
                <Input id="ad-end" type="date" value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ad-active" className="text-right">Aktywna</Label>
                <Switch id="ad-active" checked={formData.active} onCheckedChange={v => setFormData(p => ({ ...p, active: v }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
              <Button type="submit">{editingAd ? "Zapisz zmiany" : "Dodaj reklamę"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
