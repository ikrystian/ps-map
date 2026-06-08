"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { BorderBeam } from "@/components/ui/border-beam"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { Download, FileText, Loader2, Plus, Sparkles, Trash2, Upload, Search, Users, HardDrive, Clock, ShieldAlert, Eye } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"

// Schema walidacji formularza
const documentSchema = z.object({
  nazwa: z.string().min(1, "Nazwa jest wymagana"),
  typDokumentu: z.string().min(1, "Typ dokumentu jest wymagany"),
  file: z.any().refine((files) => files?.length > 0, "Plik jest wymagany"),
})

type DocumentFormValues = z.infer<typeof documentSchema>

interface Document {
  id: string
  nazwa: string
  typDokumentu: string
  rozmiar: number
  sciezka: string
  rozszerzenie: string
  zrodlo?: string
  createdAt: string
  updatedAt: string
  clientUser?: {
    id: string
    name: string
    email: string
    client?: {
      imie: string
      nazwisko: string
    }
  }
  conversation?: {
    id: string
    clientUser: {
      name: string
      client?: {
        imie: string
        nazwisko: string
      }
    }
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getExtensionStyles = (ext: string) => {
  const normalized = ext.toLowerCase().trim()
  switch (normalized) {
    case "pdf":
      return {
        bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
        label: "PDF",
      }
    case "doc":
    case "docx":
      return {
        bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        label: "Word",
      }
    case "xls":
    case "xlsx":
    case "csv":
      return {
        bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        label: "Excel",
      }
    case "txt":
    case "rtf":
    case "odt":
      return {
        bg: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
        label: "Tekst",
      }
    default:
      return {
        bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        label: normalized.toUpperCase() || "Plik",
      }
  }
}

const getDocumentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    umowa: "Umowa",
    regulamin: "Regulamin",
    "wzor-pisma": "Wzór pisma",
    pelnomocnictwo: "Pełnomocnictwo",
    oswiadczenie: "Oświadczenie",
    procedura: "Procedura",
    polityka: "Polityka",
    instrukcja: "Instrukcja",
    inny: "Inny",
  }
  return labels[type] || type.replace("-", " ")
}

// Framer motion variants
const statsContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const statsItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
}


export default function DocumentsPage() {
  const { data: session } = useSession()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [uploadProgress, setUploadProgress] = useState(false)
  const [isDeletingDocument, setIsDeletingDocument] = useState(false)

  // Preview state variables
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewContent, setPreviewContent] = useState<{
    type: "pdf" | "text" | "docx" | "unsupported"
    url?: string
    text?: string
    blob?: Blob
  } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [sourceFilter, setSourceFilter] = useState("ALL")

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      nazwa: "",
      typDokumentu: "",
    },
  })

  // Pobieranie dokumentów
  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/law-firms/documents")
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      } else {
        throw new Error("Błąd pobierania dokumentów")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać dokumentów")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  // Dodawanie dokumentu
  const handleCreateDocument = async (values: DocumentFormValues) => {
    try {
      setUploadProgress(true)
      const file = values.file[0]

      const formData = new FormData()
      formData.append("nazwa", values.nazwa)
      formData.append("typDokumentu", values.typDokumentu)
      formData.append("file", file)

      const response = await fetch("/api/law-firms/documents", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success("Dokument został dodany")
        setIsCreateDialogOpen(false)
        form.reset()
        fetchDocuments()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Błąd zapisywania dokumentu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się dodać dokumentu")
    } finally {
      setUploadProgress(false)
    }
  }

  // Pobieranie dokumentu
  const handleDownloadDocument = async (doc: Document) => {
    try {
      const response = await fetch(`/api/law-firms/documents/${doc.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${doc.nazwa}.${doc.rozszerzenie}`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success("Pobieranie dokumentu rozpoczęte")
      } else {
        throw new Error("Błąd pobierania dokumentu")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać dokumentu")
    }
  }

  // Usuwanie dokumentu
  const handleDeleteDocument = async () => {
    if (!selectedDocument) return
    setIsDeletingDocument(true)
    try {
      const response = await fetch(`/api/law-firms/documents/${selectedDocument.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Dokument został usunięty")
        setIsDeleteDialogOpen(false)
        setSelectedDocument(null)
        fetchDocuments()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania dokumentu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć dokumentu")
    } finally {
      setIsDeletingDocument(false)
    }
  }

  const openDeleteDialog = (document: Document) => {
    setSelectedDocument(document)
    setIsDeleteDialogOpen(true)
  }

  // Preview handlers
  const handlePreviewDocument = async (doc: Document) => {
    setSelectedDocument(doc)
    setIsPreviewDialogOpen(true)
    setPreviewLoading(true)
    setPreviewContent(null)

    try {
      const response = await fetch(`/api/law-firms/documents/${doc.id}/download`)
      if (!response.ok) throw new Error("Błąd pobierania pliku")

      const blob = await response.blob()
      const extension = doc.rozszerzenie.toLowerCase()

      if (extension === "pdf") {
        const pdfBlob = new Blob([blob], { type: "application/pdf" })
        const url = URL.createObjectURL(pdfBlob)
        setPreviewContent({ type: "pdf", url, blob: pdfBlob })
      } else if (extension === "txt") {
        const text = await blob.text()
        setPreviewContent({ type: "text", text })
      } else if (extension === "docx") {
        setPreviewContent({ type: "docx", blob })
      } else {
        setPreviewContent({ type: "unsupported" })
      }
    } catch (error) {
      toast.error("Nie udało się otworzyć podglądu pliku")
      setIsPreviewDialogOpen(false)
    } finally {
      setPreviewLoading(false)
    }
  }

  const closePreviewDialog = () => {
    setIsPreviewDialogOpen(false)
    if (previewContent?.url) {
      URL.revokeObjectURL(previewContent.url)
    }
    setPreviewContent(null)
  }

  useEffect(() => {
    if (isPreviewDialogOpen && previewContent?.type === "docx" && previewContent.blob && containerRef.current) {
      import("docx-preview").then(({ renderAsync }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = ""
          renderAsync(previewContent.blob, containerRef.current, undefined, {
            className: "docx-preview",
            inWrapper: false,
            ignoreWidth: true,
            ignoreHeight: true,
          }).catch((err) => {
            console.error("Error rendering docx:", err)
          })
        }
      })
    }
  }, [isPreviewDialogOpen, previewContent])

  // Stats calculation
  const totalDocsCount = documents.length
  const clientDocsCount = documents.filter((d) => d.zrodlo === "KLIENT").length
  const expertDocsCount = documents.filter((d) => d.zrodlo !== "KLIENT").length
  const totalSizeInBytes = documents.reduce((sum, d) => sum + d.rozmiar, 0)
  const totalSizeFormatted = formatFileSize(totalSizeInBytes)
  const simulatedLimitBytes = 100 * 1024 * 1024 // 100 MB
  const diskPercentage = Math.min(100, Math.round((totalSizeInBytes / simulatedLimitBytes) * 100))

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.nazwa.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "ALL" || doc.typDokumentu === typeFilter
    const matchesSource =
      sourceFilter === "ALL" ||
      (sourceFilter === "KLIENT" && doc.zrodlo === "KLIENT") ||
      (sourceFilter === "EKSPERT" && doc.zrodlo !== "KLIENT")
    return matchesSearch && matchesType && matchesSource
  })

  if (loading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie biblioteki dokumentów...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Dokumenty"
          subtitle="Biblioteka wzorów, umów, pełnomocnictw i plików przesłanych bezpośrednio przez Twoich klientów."
        >
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 bg-gradient-to-r from-primary to-[var(--primary-dark)] hover:from-[var(--primary-hover)] hover:to-primary text-white font-semibold rounded-xl shadow-md border-t border-white/10 group gap-2">
                <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                Dodaj dokument
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950/95 backdrop-blur-md border border-border/30 shadow-2xl rounded-2xl p-6 relative overflow-hidden">
              <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={8} borderWidth={1} />
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 blur-[60px] rounded-full pointer-events-none" />
              <DialogHeader>
                <DialogTitle className="text-xl font-bold font-playfair text-white flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Dodaj nowy dokument
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-xs">
                  Prześlij plik do biblioteki dokumentów swojej eksperta, aby mieć do niego szybki dostęp i móc go udostępniać.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateDocument)} className="space-y-5 pt-2">
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { onChange, value, ...field } }) => {
                      const watchFile = form.watch("file")
                      const fileSelected = watchFile && watchFile.length > 0 ? watchFile[0] : null

                      return (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-300">Prześlij plik</FormLabel>
                          <FormControl>
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 bg-background/30 rounded-xl p-6 cursor-pointer transition-all duration-300 group">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
                                className="sr-only"
                                onChange={(e) => {
                                  onChange(e.target.files)
                                  if (e.target.files && e.target.files.length > 0) {
                                    const file = e.target.files[0]
                                    const currentName = form.getValues("nazwa")
                                    if (!currentName) {
                                      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
                                      form.setValue("nazwa", nameWithoutExt)
                                    }
                                  }
                                }}
                                {...field}
                              />
                              <div className="h-12 w-12 rounded-full bg-zinc-800/50 group-hover:bg-primary/10 border border-border/40 group-hover:border-primary/30 flex items-center justify-center transition-all duration-300 mb-3">
                                {fileSelected ? (
                                  <FileText className="h-6 w-6 text-primary" />
                                ) : (
                                  <Upload className="h-6 w-6 text-zinc-400 group-hover:text-primary transition-colors duration-300" />
                                )}
                              </div>
                              {fileSelected ? (
                                <div className="text-center">
                                  <p className="text-sm font-semibold text-white max-w-[280px] truncate">{fileSelected.name}</p>
                                  <p className="text-[11px] text-zinc-400 mt-1">{formatFileSize(fileSelected.size)}</p>
                                  <span className="inline-flex text-sm text-primary font-semibold bg-primary/10 px-2.5 py-0.5 rounded-full mt-2.5 border border-primary/20">
                                    Wybrano plik
                                  </span>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors duration-300">
                                    Wybierz plik z dysku
                                  </p>
                                  <p className="text-[11px] text-zinc-500 mt-1">
                                    lub przeciągnij go tutaj
                                  </p>
                                </div>
                              )}
                            </label>
                          </FormControl>
                          <FormDescription className="text-sm text-zinc-500">
                            Obsługiwane formaty: PDF, DOC, DOCX, TXT, RTF, ODT (max 10MB)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="nazwa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-zinc-300">Nazwa dokumentu w systemie</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="np. Umowa ramowa zlecenia"
                            className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-white text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="typDokumentu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-zinc-300">Typ dokumentu</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-primary/40 focus:border-primary focus:bg-background/80 text-zinc-300 font-medium text-sm">
                              <SelectValue placeholder="Wybierz typ dokumentu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
                            <SelectItem value="umowa" className="hover:bg-primary/10 focus:bg-primary/10">Umowa</SelectItem>
                            <SelectItem value="regulamin" className="hover:bg-primary/10 focus:bg-primary/10">Regulamin</SelectItem>
                            <SelectItem value="wzor-pisma" className="hover:bg-primary/10 focus:bg-primary/10">Wzór pisma</SelectItem>
                            <SelectItem value="pelnomocnictwo" className="hover:bg-primary/10 focus:bg-primary/10">Pełnomocnictwo</SelectItem>
                            <SelectItem value="oswiadczenie" className="hover:bg-primary/10 focus:bg-primary/10">Oświadczenie</SelectItem>
                            <SelectItem value="procedura" className="hover:bg-primary/10 focus:bg-primary/10">Procedura</SelectItem>
                            <SelectItem value="polityka" className="hover:bg-primary/10 focus:bg-primary/10">Polityka</SelectItem>
                            <SelectItem value="instrukcja" className="hover:bg-primary/10 focus:bg-primary/10">Instrukcja</SelectItem>
                            <SelectItem value="inny" className="hover:bg-primary/10 focus:bg-primary/10">Inny</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="h-11 px-6 border-border/50 hover:bg-muted text-white rounded-xl w-full sm:w-auto"
                    >
                      Anuluj
                    </Button>
                    <Button type="submit" disabled={uploadProgress} className="h-11 px-6 bg-gradient-to-r from-primary to-[var(--primary-dark)] hover:from-[var(--primary-hover)] hover:to-primary text-white font-semibold rounded-xl border-t border-white/10 shadow-md flex items-center justify-center gap-2 w-full sm:w-auto">
                      {uploadProgress ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          Przesyłanie...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 text-white" />
                          Dodaj dokument
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </PageHeader>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={statsContainerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 z-10 relative"
      >
        {/* Card 1: Wszystkie dokumenty */}
        <motion.div variants={statsItemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md hover:border-border/50 hover:bg-card/30 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 font-light tracking-wide">Wszystkie dokumenty</p>
                <h3 className="text-3xl font-playfair font-semibold text-white tracking-tight">{totalDocsCount}</h3>
                <p className="text-sm text-zinc-500">Suma rozmiarów: {totalSizeFormatted}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: Moje pliki */}
        <motion.div variants={statsItemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md hover:border-border/50 hover:bg-card/30 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 font-light tracking-wide">Moje dokumenty</p>
                <h3 className="text-3xl font-playfair font-semibold text-white tracking-tight">{expertDocsCount}</h3>
                <p className="text-sm text-zinc-500">Przesłane wzory i umowy</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Od klientów */}
        <motion.div variants={statsItemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md hover:border-border/50 hover:bg-card/30 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 font-light tracking-wide">Od klientów</p>
                <h3 className="text-3xl font-playfair font-semibold text-white tracking-tight">{clientDocsCount}</h3>
                <p className="text-sm text-zinc-500">Dokumenty spraw i załączniki</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: Limit miejsca */}
        <motion.div variants={statsItemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md hover:border-border/50 hover:bg-card/30 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between w-full mb-1">
                <div>
                  <p className="text-xs text-zinc-400 font-light tracking-wide">Użycie dysku</p>
                  <h3 className="text-xl font-semibold text-white tracking-tight mt-1">{totalSizeFormatted} <span className="text-sm text-zinc-500 font-light">/ 100 MB</span></h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <HardDrive className="h-5 w-5" />
                </div>
              </div>
              <div className="w-full mt-2">
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${diskPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-zinc-500 text-right mt-1 font-mono">{diskPercentage}% wykorzystane</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Search & Filter Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10"
      >
        <div className="p-4 bg-card/15 backdrop-blur-sm border border-border/20 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-inner">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Szukaj dokumentu po nazwie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-background/40 border-border/30 rounded-xl text-white placeholder-zinc-500 focus-visible:ring-primary/40 focus-visible:border-primary transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Typ dokumentu */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-11 bg-background/40 border-border/30 rounded-xl focus:ring-primary/40 focus:border-primary focus:bg-background/80 text-zinc-300 font-medium text-xs w-full sm:w-[180px]">
                <SelectValue placeholder="Typ dokumentu" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
                <SelectItem value="ALL" className="hover:bg-primary/10 focus:bg-primary/10">Wszystkie typy</SelectItem>
                <SelectItem value="umowa" className="hover:bg-primary/10 focus:bg-primary/10">Umowa</SelectItem>
                <SelectItem value="regulamin" className="hover:bg-primary/10 focus:bg-primary/10">Regulamin</SelectItem>
                <SelectItem value="wzor-pisma" className="hover:bg-primary/10 focus:bg-primary/10">Wzór pisma</SelectItem>
                <SelectItem value="pelnomocnictwo" className="hover:bg-primary/10 focus:bg-primary/10">Pełnomocnictwo</SelectItem>
                <SelectItem value="oswiadczenie" className="hover:bg-primary/10 focus:bg-primary/10">Oświadczenie</SelectItem>
                <SelectItem value="procedura" className="hover:bg-primary/10 focus:bg-primary/10">Procedura</SelectItem>
                <SelectItem value="polityka" className="hover:bg-primary/10 focus:bg-primary/10">Polityka</SelectItem>
                <SelectItem value="instrukcja" className="hover:bg-primary/10 focus:bg-primary/10">Instrukcja</SelectItem>
                <SelectItem value="inny" className="hover:bg-primary/10 focus:bg-primary/10">Inny</SelectItem>
              </SelectContent>
            </Select>

            {/* Źródło */}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-11 bg-background/40 border-border/30 rounded-xl focus:ring-primary/40 focus:border-primary focus:bg-background/80 text-zinc-300 font-medium text-xs w-full sm:w-[180px]">
                <SelectValue placeholder="Źródło dokumentu" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
                <SelectItem value="ALL" className="hover:bg-primary/10 focus:bg-primary/10">Wszystkie źródła</SelectItem>
                <SelectItem value="EKSPERT" className="hover:bg-primary/10 focus:bg-primary/10">Od eksperta</SelectItem>
                <SelectItem value="KLIENT" className="hover:bg-primary/10 focus:bg-primary/10">Od klienta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Main card list */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="relative z-10"
      >
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={6} borderWidth={1} />
          <CardHeader className="border-b border-border/20 py-4 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-playfair text-white">Wszystkie pliki</CardTitle>
              <p className="text-xs text-zinc-400 mt-1 font-light">
                {searchQuery || typeFilter !== "ALL" || sourceFilter !== "ALL"
                  ? `Znaleziono ${filteredDocuments.length} pasujących plików`
                  : `Łącznie ${totalDocsCount} dokumentów w systemie`}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/20 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Nazwa dokumentu</TableHead>
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-4 uppercase tracking-wider">Data dodania</TableHead>
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-4 uppercase tracking-wider">Typ dokumentu</TableHead>
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-4 uppercase tracking-wider">Źródło</TableHead>
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-4 uppercase tracking-wider">Rozmiar</TableHead>
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredDocuments.length === 0 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="text-center py-16 bg-transparent border-0">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                            <div className="h-14 w-14 rounded-full bg-zinc-800/40 flex items-center justify-center border border-border/40">
                              <FileText className="h-6 w-6 text-zinc-500" />
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-white">Brak dokumentów</h4>
                              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed font-light">
                                Nie znaleziono żadnych plików odpowiadających Twoim kryteriom wyszukiwania. Spróbuj zmienić filtry lub wyszukiwaną frazę.
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                setSearchQuery("")
                                setTypeFilter("ALL")
                                setSourceFilter("ALL")
                              }}
                              variant="outline"
                              className="h-10 px-5 border-border/50 hover:bg-muted text-white rounded-xl gap-2 mt-2"
                            >
                              Resetuj filtry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocuments.map((document) => {
                        const clientName =
                          document.zrodlo === "KLIENT"
                            ? document.clientUser?.client
                              ? `${document.clientUser.client.imie} ${document.clientUser.client.nazwisko}`
                              : document.clientUser?.name || "Nieznany klient"
                            : null

                        const extStyle = getExtensionStyles(document.rozszerzenie)

                        return (
                          <motion.tr
                            key={document.id}
                            variants={rowVariants}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            layoutId={`doc-row-${document.id}`}
                            className="border-b border-border/20 hover:bg-white/[0.02] transition-colors text-zinc-300 text-sm group"
                          >
                            <TableCell className="font-semibold py-4 px-6 text-white">
                              <div className="flex items-center gap-3">
                                <div className={cn("h-9 w-9 rounded-lg border flex flex-col items-center justify-center font-bold text-sm tracking-wider shadow-md shrink-0 transition-transform duration-300 group-hover:scale-105", extStyle.bg)}>
                                  <FileText className="h-4 w-4 mb-0.5" />
                                  <span className="text-[8px] font-mono leading-none">{extStyle.label}</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="truncate max-w-xs sm:max-w-md text-zinc-100 group-hover:text-white transition-colors duration-200">{document.nazwa}</span>
                                  <span className="text-sm text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">.{document.rozszerzenie}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4 font-light text-xs text-zinc-400">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-zinc-500" />
                                {formatDate(document.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <span className="text-xs px-2.5 py-0.5 rounded-md bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 font-medium capitalize">
                                {getDocumentTypeLabel(document.typDokumentu)}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              {document.zrodlo === "KLIENT" ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="inline-flex max-w-fit text-sm font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
                                    Od klienta
                                  </span>
                                  {clientName && (
                                    <span className="text-sm text-zinc-400 font-light truncate max-w-[120px] block mt-0.5" title={clientName}>
                                      {clientName}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex text-sm font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                                  Ekspert (Ty)
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="py-4 px-4 text-xs font-light text-zinc-400">{formatFileSize(document.rozmiar)}</TableCell>
                            <TableCell className="py-4 px-6 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handlePreviewDocument(document)}
                                  className="h-9 w-9 rounded-lg border border-border/50 text-zinc-400 hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all shrink-0"
                                  title="Podgląd dokumentu"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDownloadDocument(document)}
                                  className="h-9 w-9 rounded-lg border border-border/50 text-zinc-400 hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all shrink-0"
                                  title="Pobierz dokument"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openDeleteDialog(document)}
                                  className="h-9 w-9 rounded-lg border border-border/50 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/30 transition-all shrink-0"
                                  title="Usuń dokument"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        )
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden p-4">
              <AnimatePresence mode="popLayout">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-12 w-12 rounded-full bg-zinc-800/40 flex items-center justify-center border border-border/40 mx-auto mb-3">
                      <FileText className="h-5 w-5 text-zinc-500" />
                    </div>
                    <h4 className="text-base font-semibold text-white">Brak dokumentów</h4>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[240px] mx-auto font-light leading-relaxed">
                      Brak plików pasujących do wybranych filtrów wyszukiwania.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDocuments.map((document) => {
                      const clientName =
                        document.zrodlo === "KLIENT"
                          ? document.clientUser?.client
                            ? `${document.clientUser.client.imie} ${document.clientUser.client.nazwisko}`
                            : document.clientUser?.name || "Nieznany klient"
                          : null

                      const extStyle = getExtensionStyles(document.rozszerzenie)

                      return (
                        <motion.div
                          key={document.id}
                          variants={rowVariants}
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          layoutId={`doc-card-${document.id}`}
                          className="bg-zinc-900/40 border border-border/20 rounded-xl p-4 flex flex-col gap-3 relative hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={cn("h-9 w-9 rounded-lg border flex flex-col items-center justify-center font-bold text-sm tracking-wider shadow-md shrink-0", extStyle.bg)}>
                                <FileText className="h-4 w-4 mb-0.5" />
                                <span className="text-[8px] font-mono leading-none">{extStyle.label}</span>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <h4 className="text-sm font-semibold text-white truncate max-w-[180px]">{document.nazwa}</h4>
                                <p className="text-sm text-zinc-500 mt-0.5">.{document.rozszerzenie} • {formatFileSize(document.rozmiar)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePreviewDocument(document)}
                                className="h-8 w-8 rounded-lg border border-border/50 text-zinc-400 hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all"
                                title="Podgląd dokumentu"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDownloadDocument(document)}
                                className="h-8 w-8 rounded-lg border border-border/50 text-zinc-400 hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openDeleteDialog(document)}
                                className="h-8 w-8 rounded-lg border border-border/50 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/30 transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/10">
                            <span className="text-sm px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50 capitalize font-medium">
                              {getDocumentTypeLabel(document.typDokumentu)}
                            </span>
                            {document.zrodlo === "KLIENT" ? (
                              <span className="inline-flex text-sm font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
                                Od: {clientName || "Klient"}
                              </span>
                            ) : (
                              <span className="inline-flex text-sm font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                                Moje (Ekspert)
                              </span>
                            )}
                            <span className="text-sm text-zinc-500 ml-auto flex items-center gap-1 font-light">
                              <Clock className="h-3 w-3 text-zinc-600" />
                              {formatDate(document.createdAt)}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog usuwania */}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteDocument}
        isPending={isDeletingDocument}
        title="Usuń dokument"
        description={`Czy na pewno chcesz usunąć dokument "${selectedDocument?.nazwa}"? Tej operacji nie można cofnąć, a plik zostanie trwale usunięty z serwera.`}
        confirmText="Usuń dokument"
        cancelText="Anuluj"
      />

      {/* Dialog podglądu */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={(open) => {
        if (!open) closePreviewDialog()
      }}>
        <DialogContent className="max-w-4xl w-[95vw] bg-zinc-950/95 backdrop-blur-md border border-border/30 shadow-2xl rounded-2xl p-6 overflow-hidden flex flex-col max-h-[90vh] relative">
          <BorderBeam lightColor="var(--primary)" lightWidth={450} duration={8} borderWidth={1} />
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 blur-[60px] rounded-full pointer-events-none" />

          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/20 shrink-0">
            <div>
              <DialogTitle className="text-xl font-bold font-playfair text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {selectedDocument?.nazwa}
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-xs mt-1">
                Typ: <span className="capitalize">{getDocumentTypeLabel(selectedDocument?.typDokumentu || "")}</span> • Rozmiar: {selectedDocument && formatFileSize(selectedDocument.rozmiar)}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden py-4 flex flex-col items-center justify-center min-h-[300px]">
            {previewLoading ? (
              <div className="text-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground text-sm font-light">Wczytywanie podglądu...</p>
              </div>
            ) : previewContent ? (
              <>
                {previewContent.type === "pdf" && previewContent.url && (
                  <iframe
                    src={previewContent.url}
                    className="w-full h-full min-h-[50vh] md:min-h-[60vh] rounded-lg border border-border/20 bg-white"
                    title={selectedDocument?.nazwa}
                  />
                )}

                {previewContent.type === "text" && (
                  <div className="w-full h-full min-h-[50vh] md:min-h-[60vh] bg-zinc-950 rounded-lg border border-border/20 overflow-auto p-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-300 select-text">
                      {previewContent.text}
                    </pre>
                  </div>
                )}

                {previewContent.type === "docx" && (
                  <div className="w-full h-full min-h-[50vh] md:min-h-[60vh] bg-white rounded-lg border border-border/20 overflow-auto p-4 md:p-8 shadow-inner select-text">
                    <div ref={containerRef} className="docx-preview-container text-black" />
                  </div>
                )}

                {previewContent.type === "unsupported" && (
                  <div className="text-center py-12 space-y-4 max-w-md">
                    <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                      <ShieldAlert className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Podgląd niedostępny</h4>
                      <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                        Natywny podgląd dla formatu <span className="font-semibold text-white">.{selectedDocument?.rozszerzenie}</span> nie jest bezpośrednio obsługiwany w przeglądarce. Pobierz plik na swój dysk, aby go otworzyć.
                      </p>
                    </div>
                    <Button
                      onClick={() => selectedDocument && handleDownloadDocument(selectedDocument)}
                      className="h-11 px-6 bg-gradient-to-r from-primary to-[var(--primary-dark)] hover:from-[var(--primary-hover)] hover:to-primary text-white font-semibold rounded-xl border-t border-white/10 shadow-md gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Pobierz plik
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-zinc-500 text-sm">Wystąpił błąd podczas ładowania podglądu.</div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-border/20 shrink-0 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={closePreviewDialog}
              className="border-border/50 hover:bg-muted text-white rounded-xl h-11 w-full sm:w-auto"
            >
              Zamknij
            </Button>
            {selectedDocument && (
              <Button
                onClick={() => handleDownloadDocument(selectedDocument)}
                className="h-11 px-6 bg-gradient-to-r from-primary to-[var(--primary-dark)] hover:from-[var(--primary-hover)] hover:to-primary text-white font-semibold rounded-xl border-t border-white/10 shadow-md gap-2 w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                Pobierz
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}