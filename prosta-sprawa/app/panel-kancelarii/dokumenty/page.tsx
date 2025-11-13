"use client"

import React, { useState, useEffect } from "react"
import { Plus, Download, Trash2, FileText, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSession } from "next-auth/react"

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
  createdAt: string
  updatedAt: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function DocumentsPage() {
  const { data: session } = useSession()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [uploadProgress, setUploadProgress] = useState(false)

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

      // Przygotowanie FormData
      const formData = new FormData()
      formData.append("file", file)
      formData.append("nazwa", values.nazwa)
      formData.append("typDokumentu", values.typDokumentu)

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
        const error = await response.json()
        throw new Error(error.error || "Błąd dodawania dokumentu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się dodać dokumentu")
    } finally {
      setUploadProgress(false)
    }
  }

  // Pobieranie dokumentu
  const handleDownloadDocument = async (document: Document) => {
    try {
      const response = await fetch(`/api/law-firms/documents/${document.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${document.nazwa}.${document.rozszerzenie}`
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
    }
  }

  const openDeleteDialog = (document: Document) => {
    setSelectedDocument(document)
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
          <h1 className="text-3xl font-bold">Dokumenty</h1>
          <p className="text-muted-foreground">
            Zarządzaj dokumentami swojej kancelarii
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj dokument
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Dodaj nowy dokument</DialogTitle>
              <DialogDescription>
                Wypełnij formularz, aby dodać dokument do swojej biblioteki
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateDocument)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nazwa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa dokumentu</FormLabel>
                      <FormControl>
                        <Input placeholder="np. Umowa zlecenia" {...field} />
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
                      <FormLabel>Typ dokumentu</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz typ dokumentu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="umowa">Umowa</SelectItem>
                          <SelectItem value="regulamin">Regulamin</SelectItem>
                          <SelectItem value="wzor-pisma">Wzór pisma</SelectItem>
                          <SelectItem value="pelnomocnictwo">Pełnomocnictwo</SelectItem>
                          <SelectItem value="oswiadczenie">Oświadczenie</SelectItem>
                          <SelectItem value="procedura">Procedura</SelectItem>
                          <SelectItem value="polityka">Polityka</SelectItem>
                          <SelectItem value="instrukcja">Instrukcja</SelectItem>
                          <SelectItem value="inny">Inny</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Plik dokumentu</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
                            onChange={(e) => onChange(e.target.files)}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Obsługiwane formaty: PDF, DOC, DOCX, TXT, RTF, ODT (max 10MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={uploadProgress}>
                    {uploadProgress ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Przesyłanie...
                      </>
                    ) : (
                      <>Dodaj dokument</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista dokumentów</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa dokumentu</TableHead>
                <TableHead>Data dodania</TableHead>
                <TableHead>Typ dokumentu</TableHead>
                <TableHead>Rozmiar</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Brak dokumentów. Dodaj pierwszy dokument, aby rozpocząć.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {document.nazwa}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(document.createdAt)}</TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{document.typDokumentu.replace('-', ' ')}</span>
                    </TableCell>
                    <TableCell>{formatFileSize(document.rozmiar)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(document)}
                          title="Pobierz dokument"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(document)}
                          className="text-destructive hover:text-destructive"
                          title="Usuń dokument"
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

      {/* Dialog usuwania */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć dokument "{selectedDocument?.nazwa}"? Tej operacji nie można cofnąć.
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
              onClick={handleDeleteDocument}
            >
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
