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
import { parseModuleCode } from "@/lib/module-parser"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Check, Code, Copy, Edit, Eye, Monitor, Plus, RefreshCw, Search, Smartphone, Tablet, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

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

interface PaginatedResponse {
  modules: Module[]
  pagination: {
    total: number
    page: number
    limit: number
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
  escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-slate-500 font-normal">$1</span>')

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
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  })
  const [previewMode, setPreviewMode] = useState<"visual" | "code">("visual")
  const [viewportDevice, setViewportDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [liveValues, setLiveValues] = useState<Record<string, any>>({})
  const [copied, setCopied] = useState(false)

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

      const data: PaginatedResponse = await response.json()
      setModules(data.modules)
      setPagination(data.pagination)
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

  // Open preview dialog
  const openPreviewDialog = (module: Module) => {
    setSelectedModule(module)
    setPreviewMode("visual")
    setViewportDevice("desktop")
    
    // Parse fields and initialize live values
    const parsed = parseModuleCode(module.code)
    const initialValues: Record<string, any> = {}
    parsed.fields.forEach((field) => {
      initialValues[field.name] = field.defaultValue || field.placeholder || `Przykładowy ${(field.label || field.name).toLowerCase()}`
    })
    setLiveValues(initialValues)
    setIsPreviewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Moduły</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj modułami HTML do budowy stron
          </p>
        </div>
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
                            onClick={() => openPreviewDialog(module)}
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

      {/* Preview Module Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="fixed inset-0 left-0 top-0 translate-x-0 translate-y-0 max-w-none w-screen h-screen m-0 p-0 border-none bg-[#090d16] flex flex-col focus:outline-none overflow-hidden duration-200 [&>button]:hidden">
          {selectedModule && (
            <div className="flex flex-col h-full w-full">
              {/* Header Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#0c1220] shrink-0">
                {/* Left: Close Button & Title */}
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPreviewDialogOpen(false)}
                    className="text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Zamknij</span>
                  </Button>
                  <div className="h-4 w-[1px] bg-slate-800" />
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg text-white">
                      {selectedModule.name}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
                      Podgląd modułu
                    </span>
                  </div>
                </div>

                {/* Center: Device Viewport Switcher */}
                {previewMode === "visual" && (
                  <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setViewportDevice("desktop")}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                        viewportDevice === "desktop"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportDevice("tablet")}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                        viewportDevice === "tablet"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Tablet className="h-3.5 w-3.5" />
                      <span>Tablet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportDevice("mobile")}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                        viewportDevice === "mobile"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>Mobilny</span>
                    </button>
                  </div>
                )}

                {/* Right: Mode Toggle Button */}
                <div>
                  <Button
                    type="button"
                    onClick={() => setPreviewMode(previewMode === "visual" ? "code" : "visual")}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-md shadow-indigo-600/20 transition-all gap-2 px-4"
                  >
                    {previewMode === "visual" ? (
                      <>
                        <Code className="h-4 w-4" />
                        <span>Pokaż kod</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        <span>Pokaż podgląd</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Main Content Workspace */}
              <div className="flex-1 flex overflow-hidden bg-[#070b13]">
                {previewMode === "visual" ? (
                  <>
                    {/* Visual Preview Area */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-[#070b13] overflow-auto">
                      {/* Frame Container */}
                      <div
                        className="transition-all duration-300 ease-in-out flex flex-col shadow-2xl shadow-black/60 rounded-xl overflow-hidden border border-slate-800 bg-[#0e1626]"
                        style={{
                          width:
                            viewportDevice === "desktop"
                              ? "100%"
                              : viewportDevice === "tablet"
                              ? "768px"
                              : "375px",
                          height: viewportDevice === "desktop" ? "100%" : "667px",
                          maxHeight: "100%",
                        }}
                      >
                        {/* Device Frame Header */}
                        <div className="bg-[#0b0f19] px-4 py-2 flex items-center gap-2 border-b border-slate-800 shrink-0">
                          {/* Colored Dots */}
                          <div className="flex gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                          </div>
                          {/* Address Bar mock */}
                          <div className="mx-auto max-w-md w-full bg-slate-900 border border-slate-800/80 rounded-md py-0.5 px-3 text-[10px] text-slate-500 text-center truncate">
                            https://prosta-sprawa.pl/modules/{selectedModule.name.toLowerCase().replace(/\s+/g, '-')}
                          </div>
                        </div>

                        {/* Iframe */}
                        <iframe
                          className="w-full flex-1 bg-white border-0"
                          srcDoc={`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1">
                                <script src="https://cdn.tailwindcss.com"></script>
                                <script>
                                  tailwind.config = {
                                    theme: {
                                      extend: {
                                        colors: {
                                          primary: {
                                            DEFAULT: '#4f46e5',
                                            hover: '#4338ca',
                                          }
                                        }
                                      }
                                    }
                                  }
                                </script>
                                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
                                <style>
                                  body {
                                    font-family: 'Poppins', sans-serif;
                                    margin: 0;
                                    padding: 0;
                                    background-color: #f8fafc;
                                    color: #0f172a;
                                  }
                                </style>
                              </head>
                              <body>
                                \${renderModule(selectedModule.code, liveValues)}
                              </body>
                            </html>
                          `}
                        />
                      </div>
                    </div>

                    {/* Right Panel: Live Customizer / Fields */}
                    <div className="w-80 border-l border-slate-800 bg-[#090d16] flex flex-col shrink-0">
                      <div className="p-5 border-b border-slate-800">
                        <h4 className="font-semibold text-slate-200">
                          Pola edytowalne
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Wpisz tekst poniżej, aby na żywo edytować moduł w podglądzie
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {(() => {
                          const parsed = parseModuleCode(selectedModule.code)
                          return parsed.fields.length > 0 ? (
                            parsed.fields.map((field) => (
                              <div key={field.name} className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-300">
                                  {field.label}
                                </label>
                                {field.type === "textarea" || field.type === "textarea-wysiwyg" ? (
                                  <textarea
                                    value={liveValues[field.name] || ""}
                                    onChange={(e) =>
                                      setLiveValues((prev) => ({
                                        ...prev,
                                        [field.name]: e.target.value,
                                      }))
                                    }
                                    className="w-full min-h-[80px] bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder={field.placeholder || "Wpisz tekst..."}
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={liveValues[field.name] || ""}
                                    onChange={(e) =>
                                      setLiveValues((prev) => ({
                                        ...prev,
                                        [field.name]: e.target.value,
                                      }))
                                    }
                                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder={field.placeholder || "Wpisz tekst..."}
                                  />
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-slate-500 text-sm">
                              Ten moduł nie ma dynamicznych pól edytowalnych (kod statyczny)
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Code Viewer Area */
                  <div className="flex-1 flex flex-col p-8 overflow-hidden">
                    <div className="flex-1 flex flex-col bg-[#0b0f19] border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
                      {/* Code Header */}
                      <div className="px-5 py-3.5 bg-[#0e1626] border-b border-slate-800/80 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-indigo-400" />
                          <span className="text-xs font-mono text-slate-300">
                            {selectedModule.name.toLowerCase().replace(/\s+/g, '-')}.html
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedModule.code)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                          }}
                          className="text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors gap-2"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 text-emerald-400" />
                              <span className="text-emerald-400">Skopiowano!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              <span>Kopiuj kod</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Code Content */}
                      <div className="flex-1 p-6 overflow-auto font-mono text-sm leading-relaxed text-indigo-200 select-all">
                        <pre className="whitespace-pre-wrap font-mono">
                          <code
                            dangerouslySetInnerHTML={{
                              __html: highlightHTML(selectedModule.code),
                            }}
                          />
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
