"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, Loader2, Briefcase } from "lucide-react"
import { toast } from "sonner"

interface Service {
  id: string
  nazwaUslugi: string
  opisUslugi: string
  cenaOd: number | null
  cenaDo: number | null
  jednostka: string
  aktywna: boolean
  createdAt: string
}

const getUnitLabel = (unit: string) => {
  switch (unit) {
    case "ZA_USLUGE":
      return "za usługę"
    case "ZA_GODZINE":
      return "za godzinę"
    case "RYCZALT":
      return "ryczałt"
    case "DO_UZGODNIENIA":
      return "do uzgodnienia"
    default:
      return unit
  }
}

export default function LawFirmServicesPage() {
  const router = useRouter()

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    nazwaUslugi: "",
    opisUslugi: "",
    cenaOd: "",
    cenaDo: "",
    jednostka: "DO_UZGODNIENIA",
    aktywna: true,
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/services")
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      } else {
        toast.error("Nie udało się pobrać usług")
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      toast.error("Nie udało się pobrać usług")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        nazwaUslugi: service.nazwaUslugi,
        opisUslugi: service.opisUslugi,
        cenaOd: service.cenaOd?.toString() || "",
        cenaDo: service.cenaDo?.toString() || "",
        jednostka: service.jednostka,
        aktywna: service.aktywna,
      })
    } else {
      setEditingService(null)
      setFormData({
        nazwaUslugi: "",
        opisUslugi: "",
        cenaOd: "",
        cenaDo: "",
        jednostka: "DO_UZGODNIENIA",
        aktywna: true,
      })
    }
    setModalOpen(true)
  }

  const handleSaveService = async () => {
    if (!formData.nazwaUslugi || !formData.opisUslugi) {
      toast.error("Nazwa i opis usługi są wymagane")
      return
    }

    try {
      const body = {
        nazwaUslugi: formData.nazwaUslugi,
        opisUslugi: formData.opisUslugi,
        cenaOd: formData.cenaOd ? parseFloat(formData.cenaOd) : null,
        cenaDo: formData.cenaDo ? parseFloat(formData.cenaDo) : null,
        jednostka: formData.jednostka,
        aktywna: formData.aktywna,
      }

      const response = editingService
        ? await fetch(`/api/services/${editingService.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })

      if (response.ok) {
        toast.success(editingService
          ? "Usługa została pomyślnie zaktualizowana"
          : "Usługa została pomyślnie dodana")
        fetchServices()
        setModalOpen(false)
      } else {
        const error = await response.json()
        toast.error(error.error || "Nie udało się zapisać usługi")
      }
    } catch (error) {
      console.error("Error saving service:", error)
      toast.error("Nie udało się zapisać usługi")
    }
  }

  const handleDeleteService = async () => {
    if (!serviceToDelete) return

    try {
      const response = await fetch(`/api/services/${serviceToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Usługa została pomyślnie usunięta")
        fetchServices()
        setDeleteModalOpen(false)
        setServiceToDelete(null)
      } else {
        toast.error("Nie udało się usunąć usługi")
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Nie udało się usunąć usługi")
    }
  }

  const formatPrice = (od: number | null, do_: number | null) => {
    if (od && do_) return `${od} - ${do_} PLN`
    if (od) return `Od ${od} PLN`
    if (do_) return `Do ${do_} PLN`
    return "-"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Zakres usług</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj usługami oferowanymi przez Twoją kancelarię
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj usługę
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Brak usług</h3>
            <p className="text-muted-foreground mb-4">
              Nie masz jeszcze żadnych usług. Dodaj pierwszą usługę, aby rozpocząć
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj usługę
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.nazwaUslugi}</CardTitle>
                    <CardDescription className="mt-2">
                      {service.opisUslugi.length > 100
                        ? `${service.opisUslugi.substring(0, 100)}...`
                        : service.opisUslugi}
                    </CardDescription>
                  </div>
                  <Badge variant={service.aktywna ? "default" : "secondary"}>
                    {service.aktywna ? "Aktywna" : "Nieaktywna"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cena:</span>
                    <span className="font-medium">{formatPrice(service.cenaOd, service.cenaDo)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Jednostka:</span>
                    <span className="font-medium">{getUnitLabel(service.jednostka)}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenModal(service)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edytuj
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setServiceToDelete(service.id)
                        setDeleteModalOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edytuj usługę" : "Dodaj usługę"}</DialogTitle>
            <DialogDescription>
              Uzupełnij dane dotyczące usługi oferowanej przez Twoją kancelarię
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nazwaUslugi">Nazwa usługi *</Label>
              <Input
                id="nazwaUslugi"
                value={formData.nazwaUslugi}
                onChange={(e) => setFormData({ ...formData, nazwaUslugi: e.target.value })}
                placeholder="np. Sporządzenie umowy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opisUslugi">Opis usługi *</Label>
              <Textarea
                id="opisUslugi"
                value={formData.opisUslugi}
                onChange={(e) => setFormData({ ...formData, opisUslugi: e.target.value })}
                placeholder="Opisz zakres usługi, co obejmuje, jakie korzyści dla klienta..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cenaOd">Cena od (PLN)</Label>
                <Input
                  id="cenaOd"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cenaOd}
                  onChange={(e) => setFormData({ ...formData, cenaOd: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cenaDo">Cena do (PLN)</Label>
                <Input
                  id="cenaDo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cenaDo}
                  onChange={(e) => setFormData({ ...formData, cenaDo: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jednostka">Jednostka rozliczenia</Label>
              <Select
                value={formData.jednostka}
                onValueChange={(value) => setFormData({ ...formData, jednostka: value })}
              >
                <SelectTrigger id="jednostka">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZA_USLUGE">Za usługę</SelectItem>
                  <SelectItem value="ZA_GODZINE">Za godzinę</SelectItem>
                  <SelectItem value="RYCZALT">Ryczałt</SelectItem>
                  <SelectItem value="DO_UZGODNIENIA">Do uzgodnienia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="aktywna" className="flex-1">
                Usługa aktywna
              </Label>
              <Switch
                id="aktywna"
                checked={formData.aktywna}
                onCheckedChange={(checked) => setFormData({ ...formData, aktywna: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleSaveService}>
              {editingService ? "Zapisz zmiany" : "Dodaj usługę"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Czy na pewno chcesz usunąć tę usługę?</DialogTitle>
            <DialogDescription>
              Ta akcja jest nieodwracalna. Usługa zostanie trwale usunięta z Twojego profilu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDeleteService}>
              Usuń usługę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
