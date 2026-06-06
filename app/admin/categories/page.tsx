"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

interface Category {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  opisDodatkowy?: string | null
  ikona?: string | null
  ikonaUrl?: string | null
  typ: "SPRAWY_FIRMOWE" | "SPRAWY_PRYWATNE"
  parentId?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  aktywna: boolean
  kolejnosc: number
  wyswietlajNaGlownejPrywatne?: boolean
  wyswietlajNaGlownejFirmowe?: boolean
  createdAt: string
  updatedAt: string
  parent?: {
    id: string
    nazwa: string
  } | null
  children?: {
    id: string
    nazwa: string
  }[]
  _count?: {
    lawFirms: number
    cases: number
  }
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Pobieranie kategorii
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        throw new Error("Błąd pobierania kategorii")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać kategorii")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])


  // Usuwanie kategorii
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    try {
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Kategoria została usunięta")
        setIsDeleteDialogOpen(false)
        setSelectedCategory(null)
        fetchCategories()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania kategorii")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć kategorii")
    }
  }


  // Otwieranie dialogu usuwania
  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  // Przełączanie rozwinięcia wiersza
  const toggleRowExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedRows(newExpanded)
  }

  // Rozwijanie wszystkich kategorii
  const handleExpandAll = () => {
    const allIds = categories.map(cat => cat.id)
    setExpandedRows(new Set(allIds))
  }

  // Zwijanie wszystkich kategorii
  const handleCollapseAll = () => {
    setExpandedRows(new Set())
  }


  // Budowanie hierarchii kategorii
  const buildCategoryHierarchy = (categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category & { children: Category[] }>()
    const rootCategories: (Category & { children: Category[] })[] = []

    // Tworzenie mapy kategorii
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // Budowanie hierarchii
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children.push(categoryWithChildren)
        }
      } else {
        rootCategories.push(categoryWithChildren)
      }
    })

    return rootCategories
  }

  // Renderowanie wiersza kategorii
  const renderCategoryRow = (category: Category & { children: Category[] }, level: number = 0) => {
    const hasChildren = category.children.length > 0
    const isExpanded = expandedRows.has(category.id)

    return (
      <React.Fragment key={category.id}>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRowExpansion(category.id)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
              <span className="font-medium">{category.nazwa}</span>
            </div>
          </TableCell>
          <TableCell>
            <code className="text-sm bg-muted px-2 py-1 rounded">{category.slug}</code>
          </TableCell>
          <TableCell>
            <Badge variant={category.typ === "SPRAWY_FIRMOWE" ? "default" : "secondary"}>
              {category.typ === "SPRAWY_FIRMOWE" ? "Firmowe" : "Prywatne"}
            </Badge>
          </TableCell>
          <TableCell>
            {category.parent?.nazwa || "-"}
          </TableCell>
          <TableCell>
            <div className="flex flex-col gap-1.5 items-start">
              <Badge variant={category.aktywna ? "default" : "secondary"}>
                {category.aktywna ? "Aktywna" : "Nieaktywna"}
              </Badge>
              {category.wyswietlajNaGlownejPrywatne && (
                <Badge variant="outline" className="border-teal-500 text-teal-500 bg-teal-500/10">
                  Główna (prywatne)
                </Badge>
              )}
              {category.wyswietlajNaGlownejFirmowe && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500 bg-yellow-500/10">
                  Główna (firmowe)
                </Badge>
              )}
            </div>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm text-muted-foreground">
                {category._count?.lawFirms || 0} ekspertów
              </span>
              <Button

                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/categories/${category.id}/edit`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDeleteDialog(category)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && category.children.map(child =>
          renderCategoryRow(child as Category & { children: Category[] }, level + 1)
        )}
      </React.Fragment>
    )
  }

  const hierarchicalCategories = buildCategoryHierarchy(categories)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zarządzanie kategoriami</h1>
          <p className="text-muted-foreground">
            Dodawaj, edytuj i zarządzaj kategoriami prawnymi
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExpandAll}>
            Rozwiń wszystkie
          </Button>
          <Button variant="outline" onClick={handleCollapseAll}>
            Zwiń wszystkie
          </Button>
          <Button onClick={() => router.push("/admin/categories/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj kategorię
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista kategorii</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Kategoria nadrzędna</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hierarchicalCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Brak kategorii. Dodaj pierwszą kategorię, aby rozpocząć.
                  </TableCell>
                </TableRow>
              ) : (
                hierarchicalCategories.map((category) => renderCategoryRow(category as Category & { children: Category[] }))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Dialog usuwania */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć kategorię &quot;{selectedCategory?.nazwa}&quot;? Tej operacji nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
            >
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
