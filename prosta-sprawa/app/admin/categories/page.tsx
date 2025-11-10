"use client"

import React, { useState, useEffect } from "react"
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Schema walidacji formularza
const categorySchema = z.object({
  nazwa: z.string().min(1, "Nazwa jest wymagana"),
  slug: z.string().min(1, "Slug jest wymagany").regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki"),
  opis: z.string().optional(),
  parentId: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  aktywna: z.boolean(),
  kolejnosc: z.number(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface Category {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  parentId?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  aktywna: boolean
  kolejnosc: number
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
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nazwa: "",
      slug: "",
      opis: "",
      parentId: "none",
      metaTitle: null,
      metaDescription: null,
      aktywna: true,
      kolejnosc: 0,
    },
  })

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
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać kategorii",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Generowanie sluga z nazwy
  const generateSlug = (nazwa: string) => {
    return nazwa
      .toLowerCase()
      .replace(/[^a-z0-9ąćęłńóśźż]/g, "-")
      .replace(/[ąćęłńóśźż]/g, (match) => {
        const polishToEnglish: { [key: string]: string } = {
          'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
          'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
        }
        return polishToEnglish[match] || match
      })
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  // Obsługa zmiany nazwy - automatyczne generowanie sluga
  const handleNameChange = (value: string) => {
    form.setValue("nazwa", value)
    if (!form.getValues("slug") || form.getValues("slug") === generateSlug(form.getValues("nazwa"))) {
      form.setValue("slug", generateSlug(value))
    }
  }

  // Tworzenie kategorii
  const handleCreateCategory = async (values: CategoryFormValues) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Kategoria została utworzona",
        })
        setIsCreateDialogOpen(false)
        form.reset()
        fetchCategories()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd tworzenia kategorii")
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się utworzyć kategorii",
        variant: "destructive",
      })
    }
  }

  // Edycja kategorii
  const handleEditCategory = async (values: CategoryFormValues) => {
    if (!selectedCategory) return

    try {
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Kategoria została zaktualizowana",
        })
        setIsEditDialogOpen(false)
        setSelectedCategory(null)
        form.reset()
        fetchCategories()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd aktualizacji kategorii")
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się zaktualizować kategorii",
        variant: "destructive",
      })
    }
  }

  // Usuwanie kategorii
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    try {
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Kategoria została usunięta",
        })
        setIsDeleteDialogOpen(false)
        setSelectedCategory(null)
        fetchCategories()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania kategorii")
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się usunąć kategorii",
        variant: "destructive",
      })
    }
  }

  // Otwieranie dialogu edycji
  const openEditDialog = (category: Category) => {
    setSelectedCategory(category)
    form.reset({
      nazwa: category.nazwa,
      slug: category.slug,
      opis: category.opis || "",
      parentId: category.parentId || "none",
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
      aktywna: category.aktywna,
      kolejnosc: category.kolejnosc,
    })
    setIsEditDialogOpen(true)
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

  // Pobieranie kategorii nadrzędnych (bez cykli)
  const getParentCategories = (excludeId?: string) => {
    return categories.filter(cat =>
      !excludeId || cat.id !== excludeId
    )
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
            {category.parent?.nazwa || "-"}
          </TableCell>
          <TableCell>
            <Badge variant={category.aktywna ? "default" : "secondary"}>
              {category.aktywna ? "Aktywna" : "Nieaktywna"}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm text-muted-foreground">
                {category._count?.lawFirms || 0} kancelarii
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(category)}
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj kategorię
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Dodaj nową kategorię</DialogTitle>
              <DialogDescription>
                Wypełnij formularz, aby dodać nową kategorię prawną
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateCategory)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nazwa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nazwa</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="np. Prawo cywilne"
                            {...field}
                            onChange={(e) => handleNameChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="prawo-cywilne" {...field} />
                        </FormControl>
                        <FormDescription>
                          Unikalny identyfikator URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="opis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Krótki opis kategorii..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategoria nadrzędna</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz kategorię nadrzędną (opcjonalnie)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Brak kategorii nadrzędnej</SelectItem>
                          {getParentCategories().map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.nazwa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tytuł SEO"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kolejnosc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kolejność</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Niższa liczba = wyższa pozycja
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Opis SEO..."
                          className="resize-none"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aktywna"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Aktywna</FormLabel>
                        <FormDescription>
                          Kategoria będzie widoczna na stronie
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Utwórz kategorię</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                <TableHead>Kategoria nadrzędna</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hierarchicalCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
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

      {/* Dialog edycji */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edytuj kategorię</DialogTitle>
            <DialogDescription>
              Zaktualizuj dane kategorii
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditCategory)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nazwa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="np. Prawo cywilne"
                          {...field}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="prawo-cywilne" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unikalny identyfikator URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="opis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Krótki opis kategorii..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria nadrzędna</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kategorię nadrzędną (opcjonalnie)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Brak kategorii nadrzędnej</SelectItem>
                        {getParentCategories(selectedCategory?.id).map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.nazwa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tytuł SEO"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kolejnosc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kolejność</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Niższa liczba = wyższa pozycja
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Opis SEO..."
                        className="resize-none"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aktywna"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aktywna</FormLabel>
                      <FormDescription>
                        Kategoria będzie widoczna na stronie
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Zapisz zmiany</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog usuwania */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć kategorię "{selectedCategory?.nazwa}"? Tej operacji nie można cofnąć.
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
