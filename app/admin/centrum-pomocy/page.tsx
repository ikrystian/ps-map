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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit, Eye, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import * as z from "zod"

// Schema walidacji dla kategorii
const categorySchema = z.object({
  nazwa: z.string().min(1, "Nazwa jest wymagana"),
  slug: z.string().min(1, "Slug jest wymagany").regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki"),
  opis: z.string().optional(),
  ikona: z.string().optional(),
  kolejnosc: z.number(),
  aktywna: z.boolean(),
  odbiorca: z.string(),
})

// Schema walidacji dla pytań
const questionSchema = z.object({
  categoryId: z.string().min(1, "Kategoria jest wymagana"),
  pytanie: z.string().min(1, "Pytanie jest wymagane"),
  odpowiedz: z.string().min(1, "Odpowiedź jest wymagana"),
  slug: z.string().min(1, "Slug jest wymagany").regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki"),
  kolejnosc: z.number(),
  aktywna: z.boolean(),
})

type CategoryFormValues = z.infer<typeof categorySchema>
type QuestionFormValues = z.infer<typeof questionSchema>

interface HelpCategory {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  ikona?: string | null
  kolejnosc: number
  aktywna: boolean
  odbiorca: string
  createdAt: string
  updatedAt: string
  _count?: {
    questions: number
  }
}

interface HelpQuestion {
  id: string
  categoryId: string
  category: {
    id: string
    nazwa: string
  }
  pytanie: string
  odpowiedz: string
  slug: string
  kolejnosc: number
  aktywna: boolean
  wyswietlenia: number
  pomocne: number
  niepomocne: number
  createdAt: string
  updatedAt: string
}

export default function AdminHelpCenterPage() {
  const [categories, setCategories] = useState<HelpCategory[]>([])
  const [questions, setQuestions] = useState<HelpQuestion[]>([])
  const [loading, setLoading] = useState(true)

  // Category dialogs
  const [isCategoryCreateDialogOpen, setIsCategoryCreateDialogOpen] = useState(false)
  const [isCategoryEditDialogOpen, setIsCategoryEditDialogOpen] = useState(false)
  const [isCategoryDeleteDialogOpen, setIsCategoryDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null)

  // Question dialogs
  const [isQuestionCreateDialogOpen, setIsQuestionCreateDialogOpen] = useState(false)
  const [isQuestionEditDialogOpen, setIsQuestionEditDialogOpen] = useState(false)
  const [isQuestionDeleteDialogOpen, setIsQuestionDeleteDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<HelpQuestion | null>(null)

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nazwa: "",
      slug: "",
      opis: "",
      ikona: "",
      kolejnosc: 0,
      aktywna: true,
      odbiorca: "ALL",
    },
  })

  const questionForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      categoryId: "",
      pytanie: "",
      odpowiedz: "",
      slug: "",
      kolejnosc: 0,
      aktywna: true,
    },
  })

  // Pobieranie danych
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/help/categories")
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

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/admin/help/questions")
      if (response.ok) {
        const data = await response.json()
        setQuestions(data)
      } else {
        throw new Error("Błąd pobierania pytań")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać pytań")
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchQuestions()
  }, [])

  // Generowanie sluga
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9ąćęłńóśźż\s-]/g, "")
      .replace(/[ąćęłńóśźż]/g, (match) => {
        const polishToEnglish: { [key: string]: string } = {
          'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
          'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
        }
        return polishToEnglish[match] || match
      })
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  // CRUD Kategorii
  const handleCategoryNameChange = (value: string) => {
    categoryForm.setValue("nazwa", value)
    if (!categoryForm.getValues("slug") || categoryForm.getValues("slug") === generateSlug(categoryForm.getValues("nazwa"))) {
      categoryForm.setValue("slug", generateSlug(value))
    }
  }

  const handleCreateCategory = async (values: CategoryFormValues) => {
    try {
      const response = await fetch("/api/admin/help/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast.success("Kategoria została utworzona")
        setIsCategoryCreateDialogOpen(false)
        categoryForm.reset()
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
      const response = await fetch(`/api/admin/help/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast.success("Kategoria została zaktualizowana")
        setIsCategoryEditDialogOpen(false)
        setSelectedCategory(null)
        categoryForm.reset()
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
      const response = await fetch(`/api/admin/help/categories/${selectedCategory.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Kategoria została usunięta")
        setIsCategoryDeleteDialogOpen(false)
        setSelectedCategory(null)
        fetchCategories()
        fetchQuestions()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania kategorii")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć kategorii")
    }
  }

  const openCategoryEditDialog = (category: HelpCategory) => {
    setSelectedCategory(category)
    categoryForm.reset({
      nazwa: category.nazwa,
      slug: category.slug,
      opis: category.opis || "",
      ikona: category.ikona || "",
      kolejnosc: category.kolejnosc,
      aktywna: category.aktywna,
      odbiorca: category.odbiorca || "ALL",
    })
    setIsCategoryEditDialogOpen(true)
  }

  const openCategoryDeleteDialog = (category: HelpCategory) => {
    setSelectedCategory(category)
    setIsCategoryDeleteDialogOpen(true)
  }

  // CRUD Pytań
  const handleQuestionTitleChange = (value: string) => {
    questionForm.setValue("pytanie", value)
    if (!questionForm.getValues("slug") || questionForm.getValues("slug") === generateSlug(questionForm.getValues("pytanie"))) {
      questionForm.setValue("slug", generateSlug(value))
    }
  }

  const handleCreateQuestion = async (values: QuestionFormValues) => {
    try {
      const response = await fetch("/api/admin/help/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast.success("Pytanie zostało utworzone")
        setIsQuestionCreateDialogOpen(false)
        questionForm.reset()
        fetchQuestions()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd tworzenia pytania")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się utworzyć pytania")
    }
  }

  const handleEditQuestion = async (values: QuestionFormValues) => {
    if (!selectedQuestion) return

    try {
      const response = await fetch(`/api/admin/help/questions/${selectedQuestion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast.success("Pytanie zostało zaktualizowane")
        setIsQuestionEditDialogOpen(false)
        setSelectedQuestion(null)
        questionForm.reset()
        fetchQuestions()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd aktualizacji pytania")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaktualizować pytania")
    }
  }

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return

    try {
      const response = await fetch(`/api/admin/help/questions/${selectedQuestion.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Pytanie zostało usunięte")
        setIsQuestionDeleteDialogOpen(false)
        setSelectedQuestion(null)
        fetchQuestions()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania pytania")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć pytania")
    }
  }

  const openQuestionEditDialog = (question: HelpQuestion) => {
    setSelectedQuestion(question)
    questionForm.reset({
      categoryId: question.categoryId,
      pytanie: question.pytanie,
      odpowiedz: question.odpowiedz,
      slug: question.slug,
      kolejnosc: question.kolejnosc,
      aktywna: question.aktywna,
    })
    setIsQuestionEditDialogOpen(true)
  }

  const openQuestionDeleteDialog = (question: HelpQuestion) => {
    setSelectedQuestion(question)
    setIsQuestionDeleteDialogOpen(true)
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
      <AdminHeaderSetter 
        title="Centrum pomocy" 
        subtitle="Zarządzaj kategoriami i pytaniami wyświetlanymi w centrum pomocy ekspertów" 
      />

      <Tabs defaultValue="categories" className="w-full">
        <TabsList>
          <TabsTrigger value="categories">Kategorie</TabsTrigger>
          <TabsTrigger value="questions">Pytania</TabsTrigger>
        </TabsList>

        {/* TAB: Kategorie */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Zarządzaj kategoriami centrum pomocy
            </p>
            <Dialog open={isCategoryCreateDialogOpen} onOpenChange={setIsCategoryCreateDialogOpen}>
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
                    Wypełnij formularz, aby dodać nową kategorię pomocy
                  </DialogDescription>
                </DialogHeader>
                <Form {...categoryForm}>
                  <form onSubmit={categoryForm.handleSubmit(handleCreateCategory)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={categoryForm.control}
                        name="nazwa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nazwa</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="np. Pakiety i subskrypcje"
                                {...field}
                                onChange={(e) => handleCategoryNameChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                              <Input placeholder="pakiety-i-subskrypcje" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={categoryForm.control}
                      name="opis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opis</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Krótki opis kategorii..." className="resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={categoryForm.control}
                        name="ikona"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ikona (Lucide)</FormLabel>
                            <FormControl>
                              <Input placeholder="Package" {...field} />
                            </FormControl>
                            <FormDescription>Nazwa ikony z biblioteki Lucide</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={categoryForm.control}
                      name="odbiorca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Odbiorca</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz odbiorcę" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ALL">Wszyscy</SelectItem>
                              <SelectItem value="CLIENT">Klienci</SelectItem>
                              <SelectItem value="LAW_FIRM">Eksperci</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={categoryForm.control}
                      name="aktywna"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Aktywna</FormLabel>
                            <FormDescription>Kategoria będzie widoczna</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                    <TableHead>Ikona</TableHead>
                    <TableHead>Pytania</TableHead>
                    <TableHead>Odbiorca</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
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
                        <TableCell>{category.ikona || "-"}</TableCell>
                        <TableCell>{category._count?.questions || 0}</TableCell>
                        <TableCell>
                          {category.odbiorca === "CLIENT" ? (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              Klient
                            </Badge>
                          ) : category.odbiorca === "LAW_FIRM" ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              Ekspert
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-zinc-500/10 text-muted-foreground border-zinc-500/20">
                              Wszyscy
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.aktywna ? "default" : "secondary"}>
                            {category.aktywna ? "Aktywna" : "Nieaktywna"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => openCategoryEditDialog(category)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCategoryDeleteDialog(category)}
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
        </TabsContent>

        {/* TAB: Pytania */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Zarządzaj pytaniami i odpowiedziami
            </p>
            <Dialog open={isQuestionCreateDialogOpen} onOpenChange={setIsQuestionCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj pytanie
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Dodaj nowe pytanie</DialogTitle>
                  <DialogDescription>
                    Wypełnij formularz, aby dodać nowe pytanie do centrum pomocy
                  </DialogDescription>
                </DialogHeader>
                <Form {...questionForm}>
                  <form onSubmit={questionForm.handleSubmit(handleCreateQuestion)} className="space-y-4">
                    <FormField
                      control={questionForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategoria</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz kategorię" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.filter(c => c.aktywna).map((category) => (
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
                        control={questionForm.control}
                        name="pytanie"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Pytanie</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="np. Jak zmienić pakiet subskrypcji?"
                                {...field}
                                onChange={(e) => handleQuestionTitleChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={questionForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                              <Input placeholder="jak-zmienic-pakiet" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={questionForm.control}
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={questionForm.control}
                      name="odpowiedz"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Odpowiedź</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Szczegółowa odpowiedź na pytanie..."
                              className="resize-none min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Możesz użyć HTML lub markdown</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={questionForm.control}
                      name="aktywna"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Aktywne</FormLabel>
                            <FormDescription>Pytanie będzie widoczne</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Utwórz pytanie</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista pytań</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pytanie</TableHead>
                    <TableHead>Kategoria</TableHead>
                    <TableHead>Wyświetlenia</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Brak pytań. Dodaj pierwsze pytanie, aby rozpocząć.
                      </TableCell>
                    </TableRow>
                  ) : (
                    questions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium max-w-md">{question.pytanie}</TableCell>
                        <TableCell>{question.category.nazwa}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            {question.wyswietlenia}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={question.aktywna ? "default" : "secondary"}>
                            {question.aktywna ? "Aktywne" : "Nieaktywne"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => openQuestionEditDialog(question)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openQuestionDeleteDialog(question)}
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
        </TabsContent>
      </Tabs>

      {/* Category Edit Dialog */}
      <Dialog open={isCategoryEditDialogOpen} onOpenChange={setIsCategoryEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edytuj kategorię</DialogTitle>
            <DialogDescription>Zaktualizuj dane kategorii</DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(handleEditCategory)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={categoryForm.control}
                  name="nazwa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="np. Pakiety i subskrypcje"
                          {...field}
                          onChange={(e) => handleCategoryNameChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={categoryForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="pakiety-i-subskrypcje" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={categoryForm.control}
                name="opis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Krótki opis kategorii..." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={categoryForm.control}
                  name="ikona"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ikona (Lucide)</FormLabel>
                      <FormControl>
                        <Input placeholder="Package" {...field} />
                      </FormControl>
                      <FormDescription>Nazwa ikony z biblioteki Lucide</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={categoryForm.control}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={categoryForm.control}
                name="odbiorca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odbiorca</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz odbiorcę" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">Wszyscy</SelectItem>
                        <SelectItem value="CLIENT">Klienci</SelectItem>
                        <SelectItem value="LAW_FIRM">Eksperci</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="aktywna"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aktywna</FormLabel>
                      <FormDescription>Kategoria będzie widoczna</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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

      {/* Category Delete Dialog */}
      <Dialog open={isCategoryDeleteDialogOpen} onOpenChange={setIsCategoryDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć kategorię "{selectedCategory?.nazwa}"? Wszystkie pytania z tej kategorii również zostaną usunięte. Tej operacji nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDeleteDialogOpen(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Edit Dialog */}
      <Dialog open={isQuestionEditDialogOpen} onOpenChange={setIsQuestionEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj pytanie</DialogTitle>
            <DialogDescription>Zaktualizuj pytanie i odpowiedź</DialogDescription>
          </DialogHeader>
          <Form {...questionForm}>
            <form onSubmit={questionForm.handleSubmit(handleEditQuestion)} className="space-y-4">
              <FormField
                control={questionForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kategorię" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.filter(c => c.aktywna).map((category) => (
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
                  control={questionForm.control}
                  name="pytanie"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Pytanie</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="np. Jak zmienić pakiet subskrypcji?"
                          {...field}
                          onChange={(e) => handleQuestionTitleChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={questionForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="jak-zmienic-pakiet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={questionForm.control}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={questionForm.control}
                name="odpowiedz"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odpowiedź</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Szczegółowa odpowiedź na pytanie..."
                        className="resize-none min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Możesz użyć HTML lub markdown</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={questionForm.control}
                name="aktywna"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aktywne</FormLabel>
                      <FormDescription>Pytanie będzie widoczne</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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

      {/* Question Delete Dialog */}
      <Dialog open={isQuestionDeleteDialogOpen} onOpenChange={setIsQuestionDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć pytanie "{selectedQuestion?.pytanie}"? Tej operacji nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuestionDeleteDialogOpen(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDeleteQuestion}>
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
