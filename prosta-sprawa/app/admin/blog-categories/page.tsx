"use client"

import React, { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const categorySchema = z.object({
  nazwa: z.string().min(1, "Nazwa jest wymagana"),
  slug: z.string().min(1, "Slug jest wymagany").regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki"),
  opis: z.string().optional(),
  aktywna: z.boolean(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface BlogCategory {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  aktywna: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    blogPosts: number
  }
}

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nazwa: "",
      slug: "",
      opis: "",
      aktywna: true,
    },
  })

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/blog/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        throw new Error("Błąd pobierania kategorii")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać kategorii bloga")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const generateSlug = (nazwa: string) => {
    const polishChars: Record<string, string> = {
      'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
      'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
      'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
      'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    }

    return nazwa
      .split('')
      .map(char => polishChars[char] || char)
      .join('')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (value: string) => {
    form.setValue("nazwa", value)
    if (!form.getValues("slug") || form.getValues("slug") === generateSlug(form.formState.defaultValues?.nazwa || "")) {
      form.setValue("slug", generateSlug(value))
    }
  }

  const handleCreateCategory = async (values: CategoryFormValues) => {
    try {
      const response = await fetch("/api/blog/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast.success("Kategoria została utworzona")
        setIsCreateDialogOpen(false)
        form.reset()
        fetchCategories()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd tworzenia kategorii")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się utworzyć kategorii")
    }
  }

  const handleEditCategory = async (values: CategoryFormValues) => {
    if (!selectedCategory) return

    try {
      const response = await fetch(`/api/blog/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast.success("Kategoria została zaktualizowana")
        setIsEditDialogOpen(false)
        setSelectedCategory(null)
        form.reset()
        fetchCategories()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd aktualizacji kategorii")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaktualizować kategorii")
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    try {
      const response = await fetch(`/api/blog/categories/${selectedCategory.id}`, {
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

  const openEditDialog = (category: BlogCategory) => {
    setSelectedCategory(category)
    form.reset({
      nazwa: category.nazwa,
      slug: category.slug,
      opis: category.opis || "",
      aktywna: category.aktywna,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (category: BlogCategory) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

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
          <h1 className="text-3xl font-bold">Kategorie bloga</h1>
          <p className="text-muted-foreground">
            Zarządzaj kategoriami wpisów blogowych
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj kategorię
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Dodaj nową kategorię</DialogTitle>
              <DialogDescription>
                Wypełnij formularz, aby dodać nową kategorię bloga
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateCategory)} className="space-y-4">
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
                <FormField
                  control={form.control}
                  name="opis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opis (opcjonalnie)</FormLabel>
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Brak kategorii. Dodaj pierwszą kategorię, aby rozpocząć.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.nazwa}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{category.slug}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.aktywna ? "default" : "secondary"}>
                        {category.aktywna ? "Aktywna" : "Nieaktywna"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm text-muted-foreground">
                          {category._count?.blogPosts || 0} wpisów
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog edycji */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edytuj kategorię</DialogTitle>
            <DialogDescription>
              Zaktualizuj dane kategorii
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditCategory)} className="space-y-4">
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
              <FormField
                control={form.control}
                name="opis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis (opcjonalnie)</FormLabel>
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć kategorię "{selectedCategory?.nazwa}"?
              {selectedCategory?._count?.blogPosts && selectedCategory._count.blogPosts > 0 && (
                <> Ta kategoria jest używana przez {selectedCategory._count.blogPosts} wpis(ów).</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
