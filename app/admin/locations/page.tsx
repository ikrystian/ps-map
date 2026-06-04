"use client"

import { CITIES } from "@/components/homepage/cities-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Loader2, MapPin, Plus, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

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
  postalCodes?: Array<{ id: string; code: string }>
}

export default function AdminLocationsPage() {
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [totalCities, setTotalCities] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedVoivodeship, setSelectedVoivodeship] = useState<string>("all")

  // Form states
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSeedDialogOpen, setIsSeedDialogOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [cityToDelete, setCityToDelete] = useState<City | null>(null)
  const [cityName, setCityName] = useState("")
  const [cityVoivodeshipId, setCityVoivodeshipId] = useState("")
  const [cityPostalCodes, setCityPostalCodes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Fetch voivodeships on mount
  useEffect(() => {
    const fetchVoivodeships = async () => {
      try {
        const res = await fetch("/api/voivodeships")
        const data = await res.json()
        setVoivodeships(data)
      } catch (error) {
        toast.error("Błąd podczas pobierania województw")
      }
    }
    fetchVoivodeships()
  }, [])

  const fetchCities = async (page: number, searchVal: string, voivodeshipVal: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("page", page.toString())
      params.append("limit", "50")
      if (voivodeshipVal !== "all") {
        params.append("voivodeshipId", voivodeshipVal)
      }
      if (searchVal) {
        params.append("search", searchVal)
      }

      const res = await fetch(`/api/admin/cities?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      
      setCities(data.cities || [])
      setTotalCities(data.total || 0)
    } catch (error) {
      toast.error("Błąd podczas pobierania miast")
    } finally {
      setLoading(false)
    }
  }

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page when voivodeship filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedVoivodeship])

  // Fetch cities when dependencies change
  useEffect(() => {
    fetchCities(currentPage, debouncedSearch, selectedVoivodeship)
  }, [currentPage, debouncedSearch, selectedVoivodeship])

  const handleOpenAddDialog = () => {
    setEditingCity(null)
    setCityName("")
    setCityVoivodeshipId(selectedVoivodeship !== "all" ? selectedVoivodeship : "")
    setCityPostalCodes("")
    setIsCityDialogOpen(true)
  }

  const handleOpenEditDialog = (city: City) => {
    setEditingCity(city)
    setCityName(city.nazwa)
    setCityVoivodeshipId(city.voivodeshipId)
    const codesStr = city.postalCodes 
      ? city.postalCodes.map(pc => pc.code).join(", ") 
      : ""
    setCityPostalCodes(codesStr)
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
          voivodeshipId: cityVoivodeshipId,
          postalCodes: cityPostalCodes,
        })
      })

      if (!res.ok) throw new Error()

      toast.success(editingCity ? "Miasto zaktualizowane" : "Miasto dodane")
      setIsCityDialogOpen(false)
      fetchCities(currentPage, debouncedSearch, selectedVoivodeship)
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
      
      const nextTotal = totalCities - 1
      const maxPages = Math.ceil(nextTotal / 50) || 1
      const targetPage = currentPage > maxPages ? maxPages : currentPage
      setCurrentPage(targetPage)
      fetchCities(targetPage, debouncedSearch, selectedVoivodeship)
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
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/cities/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cities: CITIES
        })
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      toast.success(`Zaimportowano ${data.count} miast`)
      setIsSeedDialogOpen(false)
      setCurrentPage(1)
      fetchCities(1, debouncedSearch, selectedVoivodeship)
    } catch (error) {
      toast.error("Błąd podczas importu")
    } finally {
      setIsSaving(false)
    }
  }

  const totalPages = Math.ceil(totalCities / 50)

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      let start = Math.max(1, currentPage - 2)
      let end = Math.min(totalPages, currentPage + 2)
      
      if (start === 1) {
        end = maxVisible
      } else if (end === totalPages) {
        start = totalPages - maxVisible + 1
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }
    return pages
  }

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
            ) : cities.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                Nie znaleziono miast spełniających kryteria.
              </div>
            ) : (
              <div className="space-y-4">
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
                      {cities.map((city) => (
                        <TableRow key={city.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2 flex-wrap">
                              <MapPin className="h-4 w-4 text-primary shrink-0" />
                              <span>{city.nazwa}</span>
                              {city.postalCodes && city.postalCodes.length > 0 && (
                                <span className="text-xs text-muted-foreground bg-muted/80 px-2 py-0.5 rounded font-normal select-all">
                                  {city.postalCodes.map(pc => pc.code).join(", ")}
                                </span>
                              )}
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-muted">
                    <div className="text-sm text-muted-foreground">
                      Pokazywanie <span className="font-semibold">{((currentPage - 1) * 50) + 1}</span> -{" "}
                      <span className="font-semibold">{Math.min(currentPage * 50, totalCities)}</span> z{" "}
                      <span className="font-semibold">{totalCities}</span> miast
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 transition-transform hover:scale-105 active:scale-95"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 transition-transform hover:scale-105 active:scale-95"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {getPageNumbers().map((pageNumber) => (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`h-8 min-w-[32px] px-2 transition-all hover:scale-105 active:scale-95 ${
                            currentPage === pageNumber 
                              ? "shadow-md bg-primary text-primary-foreground font-semibold" 
                              : "hover:bg-accent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 transition-transform hover:scale-105 active:scale-95"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 transition-transform hover:scale-105 active:scale-95"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
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
              Wprowadź nazwę miasta, kody pocztowe i wybierz województwo.
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
              <label className="text-sm font-medium">Kody pocztowe (rozdzielone przecinkami)</label>
              <Input 
                placeholder="np. 00-001, 00-002" 
                value={cityPostalCodes}
                onChange={(e) => setCityPostalCodes(e.target.value)}
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
              To spowoduje zaimportowanie {CITIES.length} miast z domyślnej listy wraz z ich przypisaniem do województw.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Miasta zostaną automatycznie przypisane do odpowiednich województw. Już istniejące miasta zostaną pominięte.
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
