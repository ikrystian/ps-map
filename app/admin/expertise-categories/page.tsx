"use client"

import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronRight, Edit, Plus, Trash2 } from "lucide-react"
import React, { useEffect, useState } from "react"

type ExpertiseCategory = {
  id: string
  nazwa: string
  parentId: string | null
  kolejnosc: number
  aktywna: boolean
  parent?: { id: string; nazwa: string } | null
  children?: ExpertiseCategory[]
}

type FlatItem = ExpertiseCategory & { children: ExpertiseCategory[] }

const emptyForm = { nazwa: "", parentId: "", kolejnosc: 0, aktywna: true }

export default function ExpertiseCategoriesPage() {
  const [items, setItems] = useState<FlatItem[]>([])
  const [allFlat, setAllFlat] = useState<ExpertiseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExpertiseCategory | null>(null)
  const [deletingItem, setDeletingItem] = useState<ExpertiseCategory | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/expertise-categories?all=true")
      if (!res.ok) throw new Error()
      const data: FlatItem[] = await res.json()
      setItems(data)

      const flat: ExpertiseCategory[] = []
      const flatten = (arr: FlatItem[]) => {
        arr.forEach((item) => {
          flat.push(item)
          if (item.children?.length) flatten(item.children as FlatItem[])
        })
      }
      flatten(data)
      setAllFlat(flat)
    } catch {
      toast.error("Nie udało się pobrać danych")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const openAdd = (parentId?: string) => {
    setEditingItem(null)
    setForm({ ...emptyForm, parentId: parentId || "" })
    setDialogOpen(true)
  }

  const openEdit = (item: ExpertiseCategory) => {
    setEditingItem(item)
    setForm({
      nazwa: item.nazwa,
      parentId: item.parentId || "",
      kolejnosc: item.kolejnosc,
      aktywna: item.aktywna,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.nazwa.trim()) {
      toast.error("Nazwa jest wymagana")
      return
    }
    setSaving(true)
    try {
      const body = {
        nazwa: form.nazwa,
        parentId: form.parentId || null,
        kolejnosc: form.kolejnosc,
        aktywna: form.aktywna,
      }

      const res = editingItem
        ? await fetch(`/api/expertise-categories/${editingItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/expertise-categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Błąd")
      }

      toast.success(editingItem ? "Zaktualizowano" : "Dodano")
      setDialogOpen(false)
      fetchItems()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd zapisu")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    try {
      const res = await fetch(`/api/expertise-categories/${deletingItem.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Błąd")
      }
      toast.success("Usunięto")
      setDeleteDialogOpen(false)
      setDeletingItem(null)
      fetchItems()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd usuwania")
    }
  }

  const getDepth = (item: ExpertiseCategory): number => {
    if (!item.parentId) return 0
    const parent = allFlat.find(f => f.id === item.parentId)
    return parent ? getDepth(parent) + 1 : 0
  }

  const renderRow = (item: FlatItem, level: number = 0): React.ReactNode => {
    const hasChildren = item.children.length > 0
    const isExpanded = expanded.has(item.id)
    const depth = level

    return (
      <React.Fragment key={item.id}>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(item.id)}
                  className="h-6 w-6 p-0 shrink-0"
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              ) : (
                <span className="h-6 w-6 shrink-0" />
              )}
              <span className={depth === 0 ? "font-semibold" : depth === 1 ? "font-medium" : "text-muted-foreground"}>
                {item.nazwa}
              </span>
              {depth === 0 && <span className="text-xs text-muted-foreground ml-1">(kategoria)</span>}
              {depth === 1 && <span className="text-xs text-muted-foreground ml-1">(podkategoria)</span>}
              {depth === 2 && <span className="text-xs text-muted-foreground ml-1">(specjalizacja)</span>}
            </div>
          </TableCell>
          <TableCell>
            <span className={`text-xs px-2 py-0.5 rounded-full ${item.aktywna ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {item.aktywna ? "Aktywna" : "Nieaktywna"}
            </span>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center gap-2 justify-end">
              {depth < 2 && (
                <Button variant="outline" size="sm" onClick={() => { openAdd(item.id); setExpanded(prev => new Set([...prev, item.id])) }}>
                  <Plus className="h-3 w-3 mr-1" />
                  Dodaj {depth === 0 ? "podkategorię" : "specjalizację"}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => { setDeletingItem(item); setDeleteDialogOpen(true) }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && item.children.map(child =>
          renderRow(child as FlatItem, level + 1)
        )}
      </React.Fragment>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter
        title="Typy działalności ekspertów"
        subtitle="Drzewo kategorii używane w formularzu rejestracji (krok 1)"
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Struktura 3-poziomowa: Kategoria → Podkategoria (opcjonalna) → Specjalizacja
        </p>
        <Button onClick={() => openAdd()}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj kategorię
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drzewo kategorii rejestracji</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Ładowanie...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Brak kategorii. Dodaj pierwszą kategorię.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map(item => renderRow(item))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog dodawania/edytowania */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edytuj" : "Dodaj"} pozycję</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nazwa">Nazwa *</Label>
              <Input
                id="nazwa"
                value={form.nazwa}
                onChange={e => setForm(p => ({ ...p, nazwa: e.target.value }))}
                placeholder="Np. Prawnicy, Adwokat, Finanse..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Kategoria nadrzędna</Label>
              <Select
                value={form.parentId || "none"}
                onValueChange={val => setForm(p => ({ ...p, parentId: val === "none" ? "" : val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Brak (kategoria główna)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Brak (kategoria główna)</SelectItem>
                  {allFlat
                    .filter(f => f.id !== editingItem?.id)
                    .filter(f => {
                      if (!form.parentId) return getDepth(f) < 2
                      return getDepth(f) < 2
                    })
                    .map(f => (
                      <SelectItem key={f.id} value={f.id}>
                        {"—".repeat(getDepth(f))} {f.nazwa}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kolejnosc">Kolejność</Label>
              <Input
                id="kolejnosc"
                type="number"
                value={form.kolejnosc}
                onChange={e => setForm(p => ({ ...p, kolejnosc: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="aktywna"
                checked={form.aktywna}
                onCheckedChange={val => setForm(p => ({ ...p, aktywna: val }))}
              />
              <Label htmlFor="aktywna">Aktywna (widoczna w formularzu rejestracji)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Anuluj</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog usuwania */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdź usunięcie</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Czy na pewno chcesz usunąć &quot;{deletingItem?.nazwa}&quot;?
            {(deletingItem as FlatItem)?.children?.length ? (
              <span className="text-destructive font-medium block mt-1">
                Ta kategoria ma podkategorie — usuń je najpierw.
              </span>
            ) : null}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Anuluj</Button>
            <Button variant="destructive" onClick={handleDelete}>Usuń</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
