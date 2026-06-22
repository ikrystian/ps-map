"use client"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/sonner"
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"
import React, { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

type Testimonial = {
  id: string
  name: string
  designation: string
  quote: string
  src: string
  active: boolean
  order: number
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)

  // Form fields
  const [name, setName] = useState("")
  const [designation, setDesignation] = useState("")
  const [quote, setQuote] = useState("")
  const [src, setSrc] = useState("")
  const [active, setActive] = useState(true)
  const [order, setOrder] = useState(0)

  const [submitting, setSubmitting] = useState(false)

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/testimonials")
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data.testimonials || [])
      } else {
        toast.error("Nie udało się pobrać opinii")
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast.error("Wystąpił błąd połączenia przy pobieraniu opinii")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const openAddModal = () => {
    setEditingTestimonial(null)
    setName("")
    setDesignation("")
    setQuote("")
    setSrc("")
    setActive(true)
    setOrder(testimonials.length)
    setIsModalOpen(true)
  }

  const openEditModal = (t: Testimonial) => {
    setEditingTestimonial(t)
    setName(t.name)
    setDesignation(t.designation)
    setQuote(t.quote)
    setSrc(t.src)
    setActive(t.active)
    setOrder(t.order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTestimonial(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !designation || !quote || !src) {
      toast.error("Wypełnij wszystkie wymagane pola")
      return
    }

    setSubmitting(true)
    try {
      const payload = { name, designation, quote, src, active, order }
      const url = editingTestimonial
        ? `/api/admin/testimonials/${editingTestimonial.id}`
        : "/api/admin/testimonials"

      const res = await fetch(url, {
        method: editingTestimonial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        closeModal()
        fetchTestimonials()
        toast.success(editingTestimonial ? "Opinia została zaktualizowana" : "Opinia została dodana")
      } else {
        const err = await res.json()
        toast.error(err.error || "Wystąpił błąd podczas zapisywania.")
      }
    } catch (err) {
      console.error("Submit error:", err)
      toast.error("Wystąpił błąd sieci.")
    } finally {
      setSubmitting(false)
    }
  }

  const openDeleteDialog = (t: Testimonial) => {
    setSelectedTestimonial(t)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedTestimonial) return

    try {
      const id = selectedTestimonial.id
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== id))
        toast.success("Opinia została usunięta")
      } else {
        toast.error("Nie udało się usunąć opinii")
      }
    } catch (err) {
      console.error("Delete error:", err)
      toast.error("Wystąpił błąd sieci.")
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedTestimonial(null)
    }
  }

  const handleToggleActive = async (t: Testimonial) => {
    const updatedStatus = !t.active
    // Optimistic update
    setTestimonials(prev =>
      prev.map(item => item.id === t.id ? { ...item, active: updatedStatus } : item)
    )

    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: updatedStatus })
      })

      if (res.ok) {
        toast.success(updatedStatus ? "Opinia została włączona" : "Opinia została ukryta")
      } else {
        throw new Error("Failed to update active state")
      }
    } catch (err) {
      console.error("Status update error:", err)
      toast.error("Błąd aktualizacji statusu")
      // Rollback
      setTestimonials(prev =>
        prev.map(item => item.id === t.id ? { ...item, active: t.active } : item)
      )
    }
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === testimonials.length - 1) return

    const targetIdx = direction === "up" ? index - 1 : index + 1
    const newList = [...testimonials]
    const temp = newList[index]
    newList[index] = newList[targetIdx]
    newList[targetIdx] = temp

    // Re-assign order numbers
    const updatedList = newList.map((item, idx) => ({ ...item, order: idx }))
    setTestimonials(updatedList)

    // Save orders sequentially
    try {
      await Promise.all([
        fetch(`/api/admin/testimonials/${updatedList[index].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: updatedList[index].order })
        }),
        fetch(`/api/admin/testimonials/${updatedList[targetIdx].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: updatedList[targetIdx].order })
        })
      ])
      toast.success("Kolejność została zaktualizowana")
    } catch (err) {
      console.error("Error sorting testimonials:", err)
      toast.error("Błąd podczas zmiany kolejności")
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Opinie główne" subtitle="Zarządzaj referencjami w karuzeli Aceternity UI 3D na głównej landing page" />

      {/* Upper header action row */}
      <div className="flex items-center justify-end">
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj opinię
        </Button>
      </div>

      {/* Main content card */}
      <Card>
        <CardHeader>
          <CardTitle>Opinie na stronie głównej ({testimonials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
              Ładowanie opinii...
            </div>
          ) : testimonials.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground px-4">
              <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Brak opinii</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                Nie zdefiniowano jeszcze żadnych referencji. Kliknij przycisk powyżej, aby dodać pierwszą opinię!
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 text-center">Kolejność</TableHead>
                    <TableHead className="w-16">Zdjęcie</TableHead>
                    <TableHead>Autor i Rola</TableHead>
                    <TableHead className="max-w-md">Treść opinii</TableHead>
                    <TableHead className="w-28 text-center">Widoczność</TableHead>
                    <TableHead className="w-32 text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((t, idx) => (
                    <TableRow key={t.id}>
                      {/* Order buttons */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, "up")}
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            title="Przesuń w górę"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            disabled={idx === testimonials.length - 1}
                            onClick={() => handleMove(idx, "down")}
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            title="Przesuń w dół"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>

                      {/* Image Avatar */}
                      <TableCell>
                        <Avatar className="h-10 w-10 border">
                          {t.src ? (
                            <AvatarImage src={t.src} alt={t.name} className="object-cover" />
                          ) : null}
                          <AvatarFallback>
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>

                      {/* Name & Designation */}
                      <TableCell className="font-medium">
                        <div className="font-semibold text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{t.designation}</div>
                      </TableCell>

                      {/* Testimonial Quote */}
                      <TableCell className="max-w-md">
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed italic">
                          &quot;{t.quote}&quot;
                        </p>
                      </TableCell>

                      {/* Active toggle */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(t)}
                            title={t.active ? "Ukryj na stronie" : "Pokaż na stronie"}
                            className="h-8 w-8 p-0"
                          >
                            {t.active ? (
                              <Eye className="h-4.5 w-4.5 text-green-600" />
                            ) : (
                              <EyeOff className="h-4.5 w-4.5 text-muted-foreground" />
                            )}
                          </Button>
                          <Badge variant={t.active ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                            {t.active ? "Widoczna" : "Ukryta"}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Actions (Edit / Delete) */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(t)}
                            title="Edytuj opinię"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(t)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Usuń opinię"
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

      {/* Dialog for adding and editing testimonials */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? "Edytuj opinię" : "Dodaj nową opinię"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="name">Autor (Imię i nazwisko)</Label>
              <Input
                id="name"
                required
                placeholder="np. Anna Kowalska"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Designation field (Fixed - previously missing in the form) */}
            <div className="space-y-2">
              <Label htmlFor="designation">Rola / Stanowisko / Firma</Label>
              <Input
                id="designation"
                required
                placeholder="np. Dyrektor Finansowy lub Klient Indywidualny"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>

            {/* Src image url field */}
            <div className="space-y-2">
              <Label htmlFor="src">URL Zdjęcia (Kwadratowe, Unsplash)</Label>
              <Input
                id="src"
                required
                placeholder="https://images.unsplash.com/photo-..."
                value={src}
                onChange={(e) => setSrc(e.target.value)}
              />
            </div>

            {/* Quote field */}
            <div className="space-y-2">
              <Label htmlFor="quote">Treść opinii</Label>
              <Textarea
                id="quote"
                required
                rows={4}
                placeholder="Wpisz treść opinii udzielonej przez klienta..."
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="resize-none leading-relaxed text-sm"
              />
            </div>

            {/* Visibility active checkbox & sorting order row */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
                <Label htmlFor="active" className="cursor-pointer font-semibold">Widoczna na stronie</Label>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="order" className="font-semibold">Kolejność:</Label>
                <Input
                  id="order"
                  type="number"
                  required
                  min={0}
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  className="w-20 text-center"
                />
              </div>
            </div>

            {/* Form actions */}
            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Zapisywanie..." : "Zapisz"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę opinię?</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć opinię, której autorem jest <strong>{selectedTestimonial?.name}</strong>?
              Ta operacja jest nieodwracalna, a opinia zostanie trwale usunięta z bazy danych.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedTestimonial(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń opinię
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
