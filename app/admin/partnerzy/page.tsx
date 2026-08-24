"use client"

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
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Handshake,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
} from "lucide-react"
import React, { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

type PartnerLogo = {
  id: string
  name: string
  imageUrl: string
  linkUrl: string | null
  active: boolean
  order: number
}

export default function AdminPartnerLogosPage() {
  const [logos, setLogos] = useState<PartnerLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingLogo, setEditingLogo] = useState<PartnerLogo | null>(null)
  const [selectedLogo, setSelectedLogo] = useState<PartnerLogo | null>(null)

  // Form fields
  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [active, setActive] = useState(true)
  const [order, setOrder] = useState(0)

  const [submitting, setSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const fetchLogos = async () => {
    try {
      const res = await fetch("/api/admin/partner-logos")
      if (res.ok) {
        const data = await res.json()
        setLogos(data.logos || [])
      } else {
        toast.error("Nie udało się pobrać logotypów")
      }
    } catch (error) {
      console.error("Error fetching partner logos:", error)
      toast.error("Wystąpił błąd połączenia przy pobieraniu logotypów")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    fetch("/api/admin/partner-logos")
      .then(async (res) => {
        if (cancelled) return
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setLogos(data.logos || [])
        } else {
          toast.error("Nie udało się pobrać logotypów")
        }
      })
      .catch((error) => {
        console.error("Error fetching partner logos:", error)
        if (!cancelled) toast.error("Wystąpił błąd połączenia przy pobieraniu logotypów")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const openAddModal = () => {
    setEditingLogo(null)
    setName("")
    setImageUrl("")
    setLinkUrl("")
    setActive(true)
    setOrder(logos.length)
    setIsModalOpen(true)
  }

  const openEditModal = (logo: PartnerLogo) => {
    setEditingLogo(logo)
    setName(logo.name)
    setImageUrl(logo.imageUrl)
    setLinkUrl(logo.linkUrl || "")
    setActive(logo.active)
    setOrder(logo.order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingLogo(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/upload/image", { method: "POST", body: fd })
      if (!res.ok) throw new Error((await res.json()).error || "Upload failed")
      const data = await res.json()
      setImageUrl(data.url)
      toast.success("Logotyp przesłany pomyślnie!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd przesyłania")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !imageUrl) {
      toast.error("Podaj nazwę partnera i prześlij logotyp")
      return
    }

    setSubmitting(true)
    try {
      const payload = { name, imageUrl, linkUrl: linkUrl.trim() || null, active, order }
      const url = editingLogo
        ? `/api/admin/partner-logos/${editingLogo.id}`
        : "/api/admin/partner-logos"

      const res = await fetch(url, {
        method: editingLogo ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        closeModal()
        fetchLogos()
        toast.success(editingLogo ? "Logotyp został zaktualizowany" : "Logotyp został dodany")
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

  const openDeleteDialog = (logo: PartnerLogo) => {
    setSelectedLogo(logo)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedLogo) return

    try {
      const id = selectedLogo.id
      const res = await fetch(`/api/admin/partner-logos/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setLogos(prev => prev.filter(l => l.id !== id))
        toast.success("Logotyp został usunięty")
      } else {
        toast.error("Nie udało się usunąć logotypu")
      }
    } catch (err) {
      console.error("Delete error:", err)
      toast.error("Wystąpił błąd sieci.")
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedLogo(null)
    }
  }

  const handleToggleActive = async (logo: PartnerLogo) => {
    const updatedStatus = !logo.active
    // Optimistic update
    setLogos(prev =>
      prev.map(item => item.id === logo.id ? { ...item, active: updatedStatus } : item)
    )

    try {
      const res = await fetch(`/api/admin/partner-logos/${logo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: updatedStatus })
      })

      if (res.ok) {
        toast.success(updatedStatus ? "Logotyp został włączony" : "Logotyp został ukryty")
      } else {
        throw new Error("Failed to update active state")
      }
    } catch (err) {
      console.error("Status update error:", err)
      toast.error("Błąd aktualizacji statusu")
      // Rollback
      setLogos(prev =>
        prev.map(item => item.id === logo.id ? { ...item, active: logo.active } : item)
      )
    }
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === logos.length - 1) return

    const targetIdx = direction === "up" ? index - 1 : index + 1
    const newList = [...logos]
    const temp = newList[index]
    newList[index] = newList[targetIdx]
    newList[targetIdx] = temp

    // Re-assign order numbers
    const updatedList = newList.map((item, idx) => ({ ...item, order: idx }))
    setLogos(updatedList)

    try {
      await Promise.all([
        fetch(`/api/admin/partner-logos/${updatedList[index].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: updatedList[index].order })
        }),
        fetch(`/api/admin/partner-logos/${updatedList[targetIdx].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: updatedList[targetIdx].order })
        })
      ])
      toast.success("Kolejność została zaktualizowana")
    } catch (err) {
      console.error("Error sorting partner logos:", err)
      toast.error("Błąd podczas zmiany kolejności")
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Partnerzy" subtitle="Zarządzaj logotypami partnerów wyświetlanymi w belce na dole panelu klienta i panelu eksperta" />

      {/* Upper header action row */}
      <div className="flex items-center justify-end">
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj logotyp
        </Button>
      </div>

      {/* Main content card */}
      <Card>
        <CardHeader>
          <CardTitle>Logotypy partnerów ({logos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
              Ładowanie logotypów...
            </div>
          ) : logos.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground px-4">
              <Handshake className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Brak logotypów</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                Nie dodano jeszcze żadnych logotypów partnerów. Kliknij przycisk powyżej, aby dodać pierwszy logotyp!
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 text-center">Kolejność</TableHead>
                    <TableHead className="w-32">Logotyp</TableHead>
                    <TableHead>Nazwa partnera</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="w-28 text-center">Widoczność</TableHead>
                    <TableHead className="w-32 text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logos.map((logo, idx) => (
                    <TableRow key={logo.id}>
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
                            disabled={idx === logos.length - 1}
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

                      {/* Logo preview */}
                      <TableCell>
                        <div className="flex h-12 w-24 items-center justify-center rounded-md border bg-card/80 p-1.5">
                          {logo.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={logo.imageUrl}
                              alt={logo.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>

                      {/* Name */}
                      <TableCell className="font-medium">
                        <div className="font-semibold text-foreground">{logo.name}</div>
                      </TableCell>

                      {/* Link */}
                      <TableCell>
                        {logo.linkUrl ? (
                          <a
                            href={logo.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline break-all"
                          >
                            {logo.linkUrl}
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">Brak linku</span>
                        )}
                      </TableCell>

                      {/* Active toggle */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(logo)}
                            title={logo.active ? "Ukryj w panelach" : "Pokaż w panelach"}
                            className="h-8 w-8 p-0"
                          >
                            {logo.active ? (
                              <Eye className="h-4.5 w-4.5 text-green-600" />
                            ) : (
                              <EyeOff className="h-4.5 w-4.5 text-muted-foreground" />
                            )}
                          </Button>
                          <Badge variant={logo.active ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                            {logo.active ? "Widoczny" : "Ukryty"}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Actions (Edit / Delete) */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(logo)}
                            title="Edytuj logotyp"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(logo)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Usuń logotyp"
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

      {/* Dialog for adding and editing partner logos */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLogo ? "Edytuj logotyp" : "Dodaj nowy logotyp"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa partnera</Label>
              <Input
                id="name"
                required
                placeholder="np. IdentyfikacjaFirm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Logo upload */}
            <div className="space-y-2">
              <Label htmlFor="logo-file">Logotyp</Label>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-28 flex-shrink-0 items-center justify-center rounded-md border bg-card/80 p-1.5">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt="Podgląd logotypu"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor="logo-file"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? "Przesyłanie..." : imageUrl ? "Zmień plik" : "Wybierz plik"}
                  </label>
                  <input
                    id="logo-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={isUploading}
                    onChange={handleFileUpload}
                  />
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WEBP lub GIF, maks. 5MB. Najlepiej sprawdzi się logotyp na przezroczystym tle.
                  </p>
                </div>
              </div>
            </div>

            {/* Link URL field */}
            <div className="space-y-2">
              <Label htmlFor="linkUrl">Link (otwierany w nowym oknie)</Label>
              <Input
                id="linkUrl"
                type="url"
                placeholder="https://partner.pl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Pole opcjonalne — bez linku logotyp będzie wyświetlany bez przekierowania.
              </p>
            </div>

            {/* Visibility active switch & sorting order row */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
                <Label htmlFor="active" className="cursor-pointer font-semibold">Widoczny w panelach</Label>
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
                disabled={submitting || isUploading}
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
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten logotyp?</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć logotyp partnera <strong>{selectedLogo?.name}</strong>?
              Ta operacja jest nieodwracalna, a logotyp zniknie z belki w panelu klienta i panelu eksperta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedLogo(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń logotyp
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
