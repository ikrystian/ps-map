"use client"

import { BlockImporter } from "@/components/admin/block-importer"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit, Eye, Plus, RefreshCw, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { PaginatedResponse } from '@/types/pagination';

const moduleSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  code: z.string().min(1, "Kod HTML jest wymagany"),
  description: z.string().optional(),
})

type ModuleFormValues = z.infer<typeof moduleSchema>

interface Module {
  id: string
  name: string
  code: string
  description?: string | null
  preview?: string | null
  active: boolean
  type?: 'TEMPLATE' | 'EDITABLE_HTML'
  createdAt: string
  updatedAt: string
  _count?: {
    pages: number
  }
}



function highlightHTML(code: string) {
  if (!code) return ""
  // Escape HTML entities to prevent rendering actual tags
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Highlight HTML Comments: <!-- ... -->
  escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-muted-foreground font-normal">$1</span>')

  // Highlight fields: \{...\}
  escaped = escaped.replace(/(\{[^{}]*?\})/g, '<span class="text-pink-400 font-bold bg-pink-950/40 px-1 rounded border border-pink-800/30">$1</span>')

  // Highlight HTML Tags: &lt;tagname...&gt;
  escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, '<span class="text-cyan-400">$1</span>')
  escaped = escaped.replace(/(\/?&gt;)/g, '<span class="text-cyan-400">$1</span>')

  // Highlight Attributes inside tags
  escaped = escaped.replace(/(\s[a-zA-Z0-9:-]+)(=)/g, '<span class="text-amber-300">$1</span>$2')

  // Highlight Attribute values
  escaped = escaped.replace(/("[^"]*")/g, '<span class="text-emerald-400">$1</span>')
  escaped = escaped.replace(/('[^']*')/g, '<span class="text-emerald-400">$1</span>')

  return escaped
}

export default function AdminModulesPage() {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  })

  const createForm = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  })

  const editForm = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  })

  // Fetch modules
  const fetchModules = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
      })

      const response = await fetch(`/api/admin/modules?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch modules")
      }

      const data: PaginatedResponse<'modules', Module> = await response.json()
      setModules(data.modules)
      setPagination(data.pagination as any)
    } catch (error) {
      console.error("Error fetching modules:", error)
      toast.error("Błąd podczas pobierania modułów")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModules()
  }, [currentPage, searchQuery])

  // Create module
  const handleCreateModule = async (values: ModuleFormValues) => {
    try {
      const response = await fetch("/api/admin/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create module")
      }

      toast.success("Moduł został utworzony")
      setIsCreateDialogOpen(false)
      createForm.reset()
      fetchModules()
    } catch (error: any) {
      console.error("Error creating module:", error)
      toast.error(error.message || "Błąd podczas tworzenia modułu")
    }
  }

  // Update module
  const handleUpdateModule = async (values: ModuleFormValues) => {
    if (!selectedModule) return

    try {
      const response = await fetch(`/api/admin/modules/${selectedModule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update module")
      }

      toast.success("Moduł został zaktualizowany")
      setIsEditDialogOpen(false)
      setSelectedModule(null)
      editForm.reset()
      fetchModules()
    } catch (error: any) {
      console.error("Error updating module:", error)
      toast.error(error.message || "Błąd podczas aktualizacji modułu")
    }
  }

  // Delete module
  const handleDeleteModule = async () => {
    if (!selectedModule) return

    try {
      const response = await fetch(`/api/admin/modules/${selectedModule.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete module")
      }

      toast.success("Moduł został usunięty")
      setIsDeleteDialogOpen(false)
      setSelectedModule(null)
      fetchModules()
    } catch (error: any) {
      console.error("Error deleting module:", error)
      toast.error(error.message || "Błąd podczas usuwania modułu")
    }
  }

  // Open edit dialog
  const openEditDialog = (module: Module) => {
    setSelectedModule(module)
    editForm.reset({
      name: module.name,
      code: module.code,
      description: module.description || "",
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (module: Module) => {
    setSelectedModule(module)
    setIsDeleteDialogOpen(true)
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminHeaderSetter title="Moduły" subtitle="Zarządzaj modułami HTML do budowy stron" />
      <div className="flex items-center justify-between">
        <div />
        <div className="flex gap-2">
          <BlockImporter onImported={fetchModules} />
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Dodaj moduł
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Szukaj po nazwie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={fetchModules}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Odśwież
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modules Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista modułów ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Ładowanie...</div>
          ) : modules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak modułów do wyświetlenia
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Użyto w stronach</TableHead>
                    <TableHead>Data utworzenia</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">{module.name}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {module.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={module.active ? "default" : "secondary"}>
                          {module.active ? "Aktywny" : "Nieaktywny"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {module._count?.pages || 0} stron
                      </TableCell>
                      <TableCell>
                        {new Date(module.createdAt).toLocaleDateString("pl-PL")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/modules/${module.id}/preview`)}
                            title="Podgląd"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(module)}
                            title="Edytuj"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(module)}
                            title="Usuń"
                            disabled={!!module._count?.pages && module._count.pages > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Strona {pagination.page} z {pagination.pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Poprzednia
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                    disabled={currentPage === pagination.pages || loading}
                  >
                    Następna
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Module Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dodaj nowy moduł</DialogTitle>
            <DialogDescription>
              Utwórz nowy moduł HTML. Użyj specjalnych tagów jak {"{input-text}"}, {"{textarea}"}, {"{textarea-wysiwyg}"} aby dodać edytowalne pola.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateModule)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa modułu</FormLabel>
                    <FormControl>
                      <Input placeholder="np. Hero Section" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kod HTML</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='<div class="hero">\n  <h1>{input-text:label:Tytuł,placeholder:Wpisz tytuł}</h1>\n  <p>{textarea:label:Opis}</p>\n</div>'
                        className="font-mono text-sm min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Dostępne tagi: {"{input-text}"}, {"{textarea}"}, {"{textarea-wysiwyg}"}, {"{input-email}"}, {"{input-url}"}, {"{input-number}"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis (opcjonalny)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Krótki opis modułu..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    createForm.reset()
                  }}
                >
                  Anuluj
                </Button>
                <Button type="submit">Utwórz moduł</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edytuj moduł</DialogTitle>
            <DialogDescription>
              Zaktualizuj dane modułu.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateModule)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa modułu</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kod HTML</FormLabel>
                    <FormControl>
                      <Textarea
                        className="font-mono text-sm min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Dostępne tagi: {"{input-text}"}, {"{textarea}"}, {"{textarea-wysiwyg}"}, {"{input-email}"}, {"{input-url}"}, {"{input-number}"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis (opcjonalny)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setSelectedModule(null)
                    editForm.reset()
                  }}
                >
                  Anuluj
                </Button>
                <Button type="submit">Zapisz zmiany</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Module Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten moduł?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Moduł zostanie trwale usunięty.
              {selectedModule?._count?.pages && selectedModule._count.pages > 0 && (
                <div className="mt-2 text-red-600 font-semibold">
                  Nie można usunąć modułu, który jest używany w {selectedModule._count.pages} stronach.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedModule(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModule}
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
