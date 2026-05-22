"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  MousePointerClick,
  Percent,
  Calendar,
  Loader2,
  ExternalLink,
  Search,
} from "lucide-react"

interface Advertisement {
  id: string
  name: string
  imageUrl: string | null
  linkUrl: string
  htmlContent: string | null
  location: string
  active: boolean
  impressions: number
  clicks: number
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

const AD_LOCATIONS = [
  { value: "search_top", label: "Szukaj - Baner Góra (970x90 / 728x90)" },
  { value: "search_list_middle", label: "Szukaj - Baner Środek Listy (728x90)" },
  { value: "category_top", label: "Kategoria - Baner Góra (970x90 / 728x90)" },
  { value: "category_sidebar", label: "Kategoria - Baner Sidebar (300x250)" },
]

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilterLocation, setSelectedFilterLocation] = useState("all")

  // Modal dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [creativeType, setCreativeType] = useState<"image" | "html">("image")

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
    linkUrl: "",
    htmlContent: "",
    location: "",
    active: true,
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/ads")
      if (!response.ok) throw new Error("Failed to fetch ads")
      const data = await response.json()
      setAds(data.ads)
    } catch (error) {
      toast.error("Nie udało się pobrać listy reklam")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (ad?: Advertisement) => {
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
      })
    } else {
      setEditingAd(null)
      setCreativeType("image")
      setFormData({
        name: "",
        imageUrl: "",
        linkUrl: "",
        htmlContent: "",
        location: "search_top",
        active: true,
        startDate: "",
        endDate: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingAd(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formDataToSend = new FormData()
    formDataToSend.append("file", file)

    try {
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload image")
      }

      const data = await response.json()
      setFormData((prev) => ({ ...prev, imageUrl: data.url }))
      toast.success("Plik graficzny został przesłany pomyślnie!")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error(error instanceof Error ? error.message : "Błąd podczas przesyłania grafiki")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      })

      if (!response.ok) throw new Error("Failed to toggle status")

      setAds((prev) =>
        prev.map((ad) => (ad.id === id ? { ...ad, active: !currentStatus } : ad))
      )
      toast.success(`Reklama została ${!currentStatus ? "aktywowana" : "dezaktywowana"}`)
    } catch (error) {
      toast.error("Nie udało się zmienić statusu reklamy")
    }
  }

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę reklamę?")) return

    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      setAds((prev) => prev.filter((ad) => ad.id !== id))
      toast.success("Reklama została pomyślnie usunięta")
    } catch (error) {
      toast.error("Nie udało się usunąć reklamy")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.location || !formData.linkUrl) {
      toast.error("Wypełnij wymagane pola (nazwa, lokalizacja, link docelowy)")
      return
    }

    if (creativeType === "image" && !formData.imageUrl) {
      toast.error("Musisz wgrać plik graficzny baneru")
      return
    }

    if (creativeType === "html" && !formData.htmlContent) {
      toast.error("Musisz wkleić kod HTML reklamy")
      return
    }

    const payload = {
      name: formData.name,
      location: formData.location,
      linkUrl: formData.linkUrl,
      active: formData.active,
      imageUrl: creativeType === "image" ? formData.imageUrl : null,
      htmlContent: creativeType === "html" ? formData.htmlContent : null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    }

    try {
      let response
      if (editingAd) {
        response = await fetch(`/api/admin/ads/${editingAd.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch("/api/admin/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Błąd zapisu")
      }

      toast.success(editingAd ? "Zapisano zmiany w reklamie" : "Dodano nową reklamę")
      handleCloseDialog()
      fetchAds()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zapisać reklamy")
    }
  }

  // Obliczenia statystyk globalnych
  const totalImpressions = ads.reduce((acc, curr) => acc + curr.impressions, 0)
  const totalClicks = ads.reduce((acc, curr) => acc + curr.clicks, 0)
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const activeAdsCount = ads.filter((ad) => ad.active).length

  // Filtrowanie listy reklam
  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLocation = selectedFilterLocation === "all" || ad.location === selectedFilterLocation
    return matchesSearch && matchesLocation
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zarządzanie Reklamami</h1>
          <p className="text-muted-foreground mt-1">
            Definiuj miejsca na banery reklamowe, włączaj kreacje, przeglądaj statystyki wyświetleń i kliknięć.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 self-start md:self-auto">
          <Plus className="h-4 w-4" />
          Dodaj reklamę
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktywne / Wszystkie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{activeAdsCount}</span>
              <span className="text-muted-foreground">/ {ads.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Konfiguracji reklamowych</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suma Wyświetleń</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">{totalImpressions.toLocaleString()}</span>
              <p className="text-xs text-muted-foreground mt-1">Odsłon na portalu</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Eye className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suma Kliknięć</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">{totalClicks.toLocaleString()}</span>
              <p className="text-xs text-muted-foreground mt-1">Przejść na strony docelowe</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Średni CTR</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">{avgCtr.toFixed(2)}%</span>
              <p className="text-xs text-muted-foreground mt-1">Współczynnik klikalności</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj reklamy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label htmlFor="filter-location" className="text-sm whitespace-nowrap hidden md:inline-block">
                Umiejscowienie:
              </Label>
              <Select value={selectedFilterLocation} onValueChange={setSelectedFilterLocation}>
                <SelectTrigger id="filter-location" className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Wszystkie lokalizacje" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie lokalizacje</SelectItem>
                  {AD_LOCATIONS.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label.split(" (")[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ads Table / List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Zdefiniowanych Reklam</CardTitle>
          <CardDescription>
            Poniższa lista zawiera wszystkie kreacje reklamowe wraz z ich wydajnością statystyczną.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Ładowanie reklam...</span>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-40" />
              <h3 className="font-semibold text-lg">Brak reklam</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                {searchQuery || selectedFilterLocation !== "all"
                  ? "Brak reklam spełniających kryteria filtrowania."
                  : "Nie dodano jeszcze żadnych reklam. Kliknij przycisk powyżej, aby dodać pierwszy baner."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Podgląd / Typ</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Nazwa i Lokalizacja</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Okres Wyświetlania</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-center">Wyświetlenia</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-center">Kliknięcia</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-center">CTR</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAds.map((ad) => {
                    const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
                    const locationLabel = AD_LOCATIONS.find((l) => l.value === ad.location)?.label.split(" (")[0] || ad.location

                    return (
                      <tr key={ad.id} className="hover:bg-accent/40 transition-colors">
                        <td className="py-3 px-4">
                          {ad.htmlContent ? (
                            <Badge variant="outline" className="font-mono bg-blue-500/5 text-blue-500 border-blue-500/25">
                              KOD HTML
                            </Badge>
                          ) : ad.imageUrl ? (
                            <div className="relative w-24 h-10 border rounded overflow-hidden bg-neutral-950">
                              <img
                                src={ad.imageUrl}
                                alt={ad.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Brak kreacji</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{ad.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{locationLabel}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5 text-xs">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              Od: {ad.startDate ? new Date(ad.startDate).toLocaleDateString("pl-PL") : "zawsze"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              Do: {ad.endDate ? new Date(ad.endDate).toLocaleDateString("pl-PL") : "zawsze"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">{ad.impressions.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center font-semibold">{ad.clicks.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center font-semibold text-primary">{ctr.toFixed(2)}%</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={ad.active}
                              onCheckedChange={() => handleToggleActive(ad.id, ad.active)}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(ad)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAd(ad.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
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

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingAd ? "Edytuj reklamę" : "Dodaj nową reklamę"}</DialogTitle>
              <DialogDescription>
                Zdefiniuj kreację i parametry wyświetlania banneru reklamowego.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nazwa reklamy *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="np. Kancelaria XYZ - Kampania Maj"
                  className="col-span-3"
                  required
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Lokalizacja *
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.location}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, location: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz umiejscowienie" />
                    </SelectTrigger>
                    <SelectContent>
                      {AD_LOCATIONS.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Link URL */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="linkUrl" className="text-right">
                  Link URL *
                </Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="https://example.com/kampania"
                  className="col-span-3"
                  required
                />
              </div>

              {/* Creative Type Toggle */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Typ kreacji</Label>
                <div className="col-span-3 flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={creativeType === "image"}
                      onChange={() => setCreativeType("image")}
                      className="accent-primary"
                    />
                    Grafika (Baner)
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={creativeType === "html"}
                      onChange={() => setCreativeType("html")}
                      className="accent-primary"
                    />
                    Własny kod HTML / Skrypt
                  </label>
                </div>
              </div>

              {/* Banner Image Upload / Preview */}
              {creativeType === "image" && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="banner-file" className="text-right pt-2">
                    Baner graficzny
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="Link do grafiki lub wgraj plik..."
                        className="flex-1"
                      />
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
                          variant="outline"
                          onClick={() => document.getElementById("banner-file")?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Wgraj plik"
                          )}
                        </Button>
                      </div>
                    </div>
                    {formData.imageUrl && (
                      <div className="border rounded p-2 bg-neutral-950 flex justify-center max-h-[140px] overflow-hidden">
                        <img
                          src={formData.imageUrl}
                          alt="Podgląd baneru"
                          className="max-h-[120px] object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom HTML code */}
              {creativeType === "html" && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="htmlContent" className="text-right pt-2">
                    Kod HTML *
                  </Label>
                  <Textarea
                    id="htmlContent"
                    value={formData.htmlContent}
                    onChange={(e) => setFormData((prev) => ({ ...prev, htmlContent: e.target.value }))}
                    placeholder="<a href='...'><img src='...' /></a> lub kod skryptu reklamowego Google AdSense..."
                    className="col-span-3 font-mono text-xs h-[100px]"
                    required={creativeType === "html"}
                  />
                </div>
              )}

              {/* Start & End Dates */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Data startu
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  Data końca
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="col-span-3"
                />
              </div>

              {/* Active Toggle */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ad-active" className="text-right">
                  Aktywna
                </Label>
                <div className="col-span-3">
                  <Switch
                    id="ad-active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Anuluj
              </Button>
              <Button type="submit">
                {editingAd ? "Zapisz zmiany" : "Dodaj reklamę"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
