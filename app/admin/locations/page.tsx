"use client"

import React, { useState, useEffect } from "react"
import { Plus, Edit, Trash2, MapPin, Search, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { toast } from "sonner"
import { CITIES } from "@/components/homepage/cities-list"

interface Voivodeship {
  id: string
  nazwa: string
  slug: string
}

interface City {
  id: string
  nazwa: string
  voivodeshipId: string
  voivodeship: Voivodeship
}

export default function AdminLocationsPage() {
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedVoivodeship, setSelectedVoivodeship] = useState<string>("all")

  // Form states
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSeedDialogOpen, setIsSeedDialogOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [cityToDelete, setCityToDelete] = useState<City | null>(null)
  const [cityName, setCityName] = useState("")
  const [cityVoivodeshipId, setCityVoivodeshipId] = useState("")
  const [seedVoivodeshipId, setSeedVoivodeshipId] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [vRes, cRes] = await Promise.all([
        fetch("/api/voivodeships"),
        fetch("/api/cities")
      ])
      
      const vData = await vRes.json()
      const cData = await cRes.json()
      
      setVoivodeships(vData)
      setCities(cData)
    } catch (error) {
      toast.error("Błąd podczas pobierania danych")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddDialog = () => {
    setEditingCity(null)
    setCityName("")
    setCityVoivodeshipId(selectedVoivodeship !== "all" ? selectedVoivodeship : "")
    setIsCityDialogOpen(true)
  }

  const handleOpenEditDialog = (city: City) => {
    setEditingCity(city)
    setCityName(city.nazwa)
    setCityVoivodeshipId(city.voivodeshipId)
    setIsCityDialogOpen(true)
  }

  const handleOpenDeleteDialog = (city: City) => {
    setCityToDelete(city)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveCity = async () => {
    if (!cityName || !cityVoivodeshipId) {
      toast.error("Wypełnij wszystkie pola")
      return
    }

    setIsSaving(true)
    try {
      const url = editingCity 
        ? `/api/admin/cities/${editingCity.id}` 
        : "/api/admin/cities"
      const method = editingCity ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nazwa: cityName,
          voivodeshipId: cityVoivodeshipId
        })
      })

      if (!res.ok) throw new Error()

      toast.success(editingCity ? "Miasto zaktualizowane" : "Miasto dodane")
      setIsCityDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Błąd podczas zapisywania")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCity = async () => {
    if (!cityToDelete) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/cities/${cityToDelete.id}`, {
        method: "DELETE"
      })

      if (!res.ok) throw new Error()

      toast.success("Miasto usunięte")
      setIsDeleteDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Błąd podczas usuwania")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSeed = () => {
    setIsSeedDialogOpen(true)
  }

  const executeSeed = async () => {
    if (!seedVoivodeshipId) {
      toast.error("Wybierz województwo")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/cities/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cities: CITIES,
          voivodeshipId: seedVoivodeshipId
        })
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      toast.success(`Zaimportowano ${data.count} miast`)
      setIsSeedDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Błąd podczas importu")
    } finally {
      setIsSaving(false)
    }
  }

  const filteredCities = cities.filter(city => {
    const matchesSearch = city.nazwa.toLowerCase().includes(search.toLowerCase())
    const matchesVoivodeship = selectedVoivodeship === "all" || city.voivodeshipId === selectedVoivodeship
    return matchesSearch && matchesVoivodeship
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lokalizacje</h1>
          <p className="text-muted-foreground">
            Zarządzaj miastami i ich przypisaniem do województw.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={handleSeed} variant="outline" className="gap-2 flex-1 md:flex-none" disabled={isSaving}>
            <Plus className="h-4 w-4" /> Importuj z listy
          </Button>
          <Button onClick={handleOpenAddDialog} className="gap-2 flex-1 md:flex-none">
            <Plus className="h-4 w-4" /> Dodaj miasto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Województwa</CardTitle>
            <CardDescription>Filtruj wg regionu</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col max-h-[600px] overflow-y-auto">
              <button
                onClick={() => setSelectedVoivodeship("all")}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-accent text-left ${
                  selectedVoivodeship === "all" ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                Wszystkie
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
              {voivodeships.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoivodeship(v.id)}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-accent text-left ${
                    selectedVoivodeship === v.id ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  {v.nazwa}
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Miasta</CardTitle>
                <CardDescription>
                  {selectedVoivodeship === "all" 
                    ? "Wszystkie zarejestrowane miasta" 
                    : `Miasta w województwie ${voivodeships.find(v => v.id === selectedVoivodeship)?.nazwa}`}
                </CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj miasta..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                Nie znaleziono miast spełniających kryteria.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa</TableHead>
                      <TableHead>Województwo</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCities.map((city) => (
                      <TableRow key={city.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {city.nazwa}
                          </div>
                        </TableCell>
                        <TableCell>{city.voivodeship.nazwa}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenEditDialog(city)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleOpenDeleteDialog(city)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCity ? "Edytuj miasto" : "Dodaj nowe miasto"}</DialogTitle>
            <DialogDescription>
              Wprowadź nazwę miasta i wybierz województwo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nazwa miasta</label>
              <Input 
                placeholder="np. Warszawa" 
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Województwo</label>
              <Select 
                value={cityVoivodeshipId} 
                onValueChange={setCityVoivodeshipId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz województwo" />
                </SelectTrigger>
                <SelectContent>
                  {voivodeships.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nazwa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCityDialogOpen(false)}>Anuluj</Button>
            <Button onClick={handleSaveCity} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCity ? "Zapisz zmiany" : "Dodaj miasto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seed Dialog */}
      <Dialog open={isSeedDialogOpen} onOpenChange={setIsSeedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importuj miasta z listy</DialogTitle>
            <DialogDescription>
              To spowoduje zaimportowanie {CITIES.length} miast z domyślnej listy. Wybierz województwo, do którego zostaną przypisane.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Województwo docelowe</label>
              <Select 
                value={seedVoivodeshipId} 
                onValueChange={setSeedVoivodeshipId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz województwo" />
                </SelectTrigger>
                <SelectContent>
                  {voivodeships.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nazwa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Miasta, które już istnieją w wybranym województwie, zostaną pominięte.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSeedDialogOpen(false)}>Anuluj</Button>
            <Button onClick={executeSeed} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Importuj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Czy na pewno chcesz usunąć to miasto?</DialogTitle>
            <DialogDescription>
              Ta operacja jest nieodwracalna. Miasto <strong>{cityToDelete?.nazwa}</strong> zostanie trwale usunięte z bazy danych.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Anuluj</Button>
            <Button variant="destructive" onClick={handleDeleteCity} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
