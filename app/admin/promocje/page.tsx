"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Edit,
  Plus,
  Trash2,
  TrendingUp,
  X
} from "lucide-react"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

interface PromotionConfig {
  id: string
  type: string
  label: string
  description: string
  pointsPerDay: number | null
  pointsPerWeek: number | null
  pointsPerMonth: number | null
  features: string[]
  icon: string | null
  color: string | null
  aktywna: boolean
  kolejnosc: number
  createdAt: string
  updatedAt: string
}

const PROMOTION_TYPES = [
  { value: "PODBICIE_OGLOSZENIA", label: "Podbicie ogłoszenia" },
  { value: "WYROZNIENIE", label: "Wyróżnienie" },
  { value: "TOP_LISTA", label: "TOP Lista" },
  { value: "STRONA_GLOWNA", label: "Strona główna" },
  { value: "POLECANI_PRAWNICY", label: "Polecani prawnicy i adwokaci" },
  { value: "NAJCZESCIEJ_KONSULTOWANE", label: "Najczęściej konsultowane kategorie" },
]

export default function AdminPromotionsPage() {
  const [configs, setConfigs] = useState<PromotionConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<PromotionConfig | null>(null)
  const [formData, setFormData] = useState({
    type: "",
    label: "",
    description: "",
    pointsPerDay: "",
    pointsPerWeek: "",
    pointsPerMonth: "",
    features: [""],
    icon: "",
    color: "#3b82f6",
    aktywna: true,
    kolejnosc: "0",
  })

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const response = await fetch("/api/admin/promotion-configs")
      if (!response.ok) throw new Error("Failed to fetch configs")
      const data = await response.json()
      setConfigs(data.configs.map((config: any) => ({
        ...config,
        features: config.features && config.features.trim() ? JSON.parse(config.features) : [],
      })))
    } catch (error) {
      toast.error("Nie udało się pobrać konfiguracji promocji")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (config?: PromotionConfig) => {
    if (config) {
      setEditingConfig(config)
      setFormData({
        type: config.type,
        label: config.label,
        description: config.description,
        pointsPerDay: config.pointsPerDay?.toString() || "",
        pointsPerWeek: config.pointsPerWeek?.toString() || "",
        pointsPerMonth: config.pointsPerMonth?.toString() || "",
        features: config.features,
        icon: config.icon || "",
        color: config.color || "#3b82f6",
        aktywna: config.aktywna,
        kolejnosc: config.kolejnosc.toString(),
      })
    } else {
      setEditingConfig(null)
      setFormData({
        type: "",
        label: "",
        description: "",
        pointsPerDay: "",
        pointsPerWeek: "",
        pointsPerMonth: "",
        features: [""],
        icon: "",
        color: "#3b82f6",
        aktywna: true,
        kolejnosc: "0",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingConfig(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.type || !formData.label || !formData.description) {
      toast.error("Wypełnij wszystkie wymagane pola")
      return
    }

    if (!formData.pointsPerDay && !formData.pointsPerWeek && !formData.pointsPerMonth) {
      toast.error("Podaj koszt dziennie, tygodniowo lub miesięcznie")
      return
    }

    const filteredFeatures = formData.features.filter((f) => f.trim() !== "")
    if (filteredFeatures.length === 0) {
      toast.error("Dodaj przynajmniej jedną cechę")
      return
    }

    try {
      const url = editingConfig
        ? `/api/admin/promotion-configs/${editingConfig.id}`
        : "/api/admin/promotion-configs"

      const method = editingConfig ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          label: formData.label,
          description: formData.description,
          pointsPerDay: formData.pointsPerDay ? parseInt(formData.pointsPerDay) : null,
          pointsPerWeek: formData.pointsPerWeek ? parseInt(formData.pointsPerWeek) : null,
          pointsPerMonth: formData.pointsPerMonth ? parseInt(formData.pointsPerMonth) : null,
          features: filteredFeatures,
          icon: formData.icon || null,
          color: formData.color || null,
          aktywna: formData.aktywna,
          kolejnosc: parseInt(formData.kolejnosc),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save config")
      }

      toast.success(
        editingConfig
          ? "Konfiguracja promocji została zaktualizowana"
          : "Konfiguracja promocji została utworzona"
      )
      handleCloseDialog()
      fetchConfigs()
    } catch (error: any) {
      toast.error(error.message || "Nie udało się zapisać konfiguracji")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę konfigurację promocji?")) return

    try {
      const response = await fetch(`/api/admin/promotion-configs/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete config")

      toast.success("Konfiguracja promocji została usunięta")
      fetchConfigs()
    } catch (error) {
      toast.error("Nie udało się usunąć konfiguracji")
    }
  }

  const addFeatureField = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""],
    })
  }

  const removeFeatureField = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      features: newFeatures.length > 0 ? newFeatures : [""],
    })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({
      ...formData,
      features: newFeatures,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter 
        title="Zarządzanie promocjami" 
        subtitle="Konfiguruj typy promocji dostępne dla ekspertów" 
      />
      <div className="flex items-center justify-end">
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj typ promocji
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {configs.map((config) => (
          <Card key={config.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {config.label}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {config.description}
                  </CardDescription>
                </div>
                <Badge variant={config.aktywna ? "default" : "secondary"}>
                  {config.aktywna ? "Aktywna" : "Nieaktywna"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Typ:</p>
                <Badge variant="outline">{config.type}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Koszt:</p>
                <div className="flex flex-wrap gap-2">
                  {config.pointsPerDay && (
                    <Badge variant="secondary">
                      {config.pointsPerDay} pkt/dzień
                    </Badge>
                  )}
                  {config.pointsPerWeek && (
                    <Badge variant="secondary">
                      {config.pointsPerWeek} pkt/tydzień
                    </Badge>
                  )}
                  {config.pointsPerMonth && (
                    <Badge variant="secondary">
                      {config.pointsPerMonth} pkt/miesiąc
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Cechy:</p>
                <ul className="list-disc list-inside space-y-1">
                  {config.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Kolejność:</p>
                <Badge variant="outline">{config.kolejnosc}</Badge>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(config)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(config.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Usuń
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {configs.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Brak konfiguracji promocji</h3>
              <p className="text-muted-foreground mb-4">
                Dodaj pierwszą konfigurację promocji dla ekspertów
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj typ promocji
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? "Edytuj konfigurację promocji" : "Dodaj konfigurację promocji"}
            </DialogTitle>
            <DialogDescription>
              Skonfiguruj parametry typu promocji dostępnego dla ekspertów
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Typ promocji *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                disabled={!!editingConfig}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz typ" />
                </SelectTrigger>
                <SelectContent>
                  {PROMOTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="label">Nazwa wyświetlana *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="np. Podbicie ogłoszenia"
              />
            </div>

            <div>
              <Label htmlFor="description">Opis *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Krótki opis promocji"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pointsPerDay">Punkty/dzień</Label>
                <Input
                  id="pointsPerDay"
                  type="number"
                  min="0"
                  value={formData.pointsPerDay}
                  onChange={(e) => setFormData({ ...formData, pointsPerDay: e.target.value })}
                  placeholder="20"
                />
              </div>

              <div>
                <Label htmlFor="pointsPerWeek">Punkty/tydzień</Label>
                <Input
                  id="pointsPerWeek"
                  type="number"
                  min="0"
                  value={formData.pointsPerWeek}
                  onChange={(e) => setFormData({ ...formData, pointsPerWeek: e.target.value })}
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="pointsPerMonth">Punkty/miesiąc</Label>
                <Input
                  id="pointsPerMonth"
                  type="number"
                  min="0"
                  value={formData.pointsPerMonth}
                  onChange={(e) => setFormData({ ...formData, pointsPerMonth: e.target.value })}
                  placeholder="500"
                />
              </div>
            </div>

            <div>
              <Label>Cechy promocji *</Label>
              <div className="space-y-2 mt-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="np. Wyższa pozycja w wynikach wyszukiwania"
                    />
                    {formData.features.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFeatureField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeatureField}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj cechę
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Ikona (opcjonalnie)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="np. TrendingUp"
                />
              </div>

              <div>
                <Label htmlFor="color">Kolor (opcjonalnie)</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="kolejnosc">Kolejność wyświetlania</Label>
              <Input
                id="kolejnosc"
                type="number"
                min="0"
                value={formData.kolejnosc}
                onChange={(e) => setFormData({ ...formData, kolejnosc: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="aktywna"
                checked={formData.aktywna}
                onCheckedChange={(checked) => setFormData({ ...formData, aktywna: checked })}
              />
              <Label htmlFor="aktywna">Aktywna</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Anuluj
              </Button>
              <Button type="submit">
                {editingConfig ? "Zapisz zmiany" : "Utwórz"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
