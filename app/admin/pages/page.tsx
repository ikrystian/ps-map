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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Eye, Plus, RefreshCw, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { PaginatedResponse } from '@/types/pagination';

interface Page {
  id: string
  title: string
  slug: string
  metaTitle?: string | null
  metaDescription?: string | null
  published: boolean
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  modules: any[]
}



export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [publishedFilter, setPublishedFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  })

  // Fetch pages
  const fetchPages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
        ...(publishedFilter !== "" && { published: publishedFilter }),
      })

      const response = await fetch(`/api/admin/pages?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch pages")
      }

      const data: PaginatedResponse<'pages', Page> = await response.json()
      setPages(data.pages)
      setPagination(data.pagination as any)
    } catch (error) {
      console.error("Error fetching pages:", error)
      toast.error("Błąd podczas pobierania stron")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
  }, [currentPage, searchQuery, publishedFilter])

  // Delete page
  const handleDeletePage = async () => {
    if (!selectedPage) return

    try {
      const response = await fetch(`/api/admin/pages/${selectedPage.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete page")
      }

      toast.success("Strona została usunięta")
      setIsDeleteDialogOpen(false)
      setSelectedPage(null)
      fetchPages()
    } catch (error: any) {
      console.error("Error deleting page:", error)
      toast.error(error.message || "Błąd podczas usuwania strony")
    }
  }

  // Open delete dialog
  const openDeleteDialog = (page: Page) => {
    setSelectedPage(page)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminHeaderSetter title="Strony" subtitle="Zarządzaj stronami budowanymi z modułów" />
      <div className="flex items-center justify-between">
        <div />
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Dodaj stronę
          </Button>
        </Link>
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
                  placeholder="Szukaj po tytule lub slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={publishedFilter} onValueChange={setPublishedFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status publikacji" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Wszystkie</SelectItem>
                <SelectItem value="true">Opublikowane</SelectItem>
                <SelectItem value="false">Nieopublikowane</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchPages}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Odśwież
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista stron ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Ładowanie...</div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak stron do wyświetlenia
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tytuł</TableHead>
                    <TableHead>Slug (URL)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Liczba modułów</TableHead>
                    <TableHead>Data utworzenia</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          /{page.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={page.published ? "default" : "secondary"}>
                          {page.published ? "Opublikowana" : "Nieopublikowana"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {page.modules?.length || 0} modułów
                      </TableCell>
                      <TableCell>
                        {new Date(page.createdAt).toLocaleDateString("pl-PL")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {page.published && (
                            <Link href={`/${page.slug}`} target="_blank">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Zobacz stronę"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/admin/pages/${page.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edytuj"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(page)}
                            title="Usuń"
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

      {/* Delete Page Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę stronę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Strona <strong>{selectedPage?.title}</strong> zostanie trwale usunięta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPage(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePage}
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
