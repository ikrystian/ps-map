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
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  ArrowUpDown,
  BookOpen,
  Calendar,
  CheckCircle2,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  Globe,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface BlogPost {
  id: string
  tytul: string
  slug: string
  tresc: string
  opublikowany: boolean
  dataPublikacji: string | null
  wyswietlenia: number
  createdAt: string
  updatedAt: string
  obrazekWyrozniajacy: string | null
  tagi: string | null
  metaTitle: string | null
  metaDescription: string | null
  categoryId: string | null
  category: {
    id: string
    nazwa: string
  } | null
  lawFirm: {
    id: string
    nazwa: string
    nazwaFirmy: string
  }
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [lawFirms, setLawFirms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  // Filtry, wyszukiwanie i sortowanie
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSort, setSelectedSort] = useState("createdAt_desc")

  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  })

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0,
  })

  // Debouncing dla pola wyszukiwania
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPagination((prev) => ({ ...prev, page: 1 }))
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Pobierz kategorie bloga raz przy montowaniu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/blog/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Błąd podczas pobierania kategorii:", error)
      }
    }
    fetchCategories()
  }, [])

  // Pobierz kancelarie raz przy montowaniu
  useEffect(() => {
    const fetchLawFirms = async () => {
      try {
        const response = await fetch("/api/admin/law-firms?limit=1000")
        if (response.ok) {
          const data = await response.json()
          setLawFirms(data.lawFirms || [])
        }
      } catch (error) {
        console.error("Błąd podczas pobierania kancelarii:", error)
      }
    }
    fetchLawFirms()
  }, [])

  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search: debouncedSearch,
        categoryId: selectedCategory,
        status: selectedStatus,
        sortBy: selectedSort,
      })

      const response = await fetch(`/api/admin/blog?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        setPagination(data.pagination)
        if (data.stats) {
          setStats(data.stats)
        }
      } else {
        throw new Error("Błąd pobierania wpisów")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać wpisów bloga")
    } finally {
      setLoading(false)
    }
  }

  // Odśwież listę, gdy filtry lub strona ulegną zmianie
  useEffect(() => {
    fetchPosts(pagination.page)
  }, [pagination.page, debouncedSearch, selectedCategory, selectedStatus, selectedSort])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleSortChange = (value: string) => {
    setSelectedSort(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleTogglePublish = async (post: BlogPost, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ opublikowany: isPublished }),
      })

      if (response.ok) {
        toast.success(isPublished ? "Wpis został opublikowany" : "Wpis przeniesiono do szkiców")

        // Zaktualizuj stan lokalny
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? {
                ...p,
                opublikowany: isPublished,
                dataPublikacji: isPublished ? new Date().toISOString() : null,
              }
              : p
          )
        )
        // Zaktualizuj statystyki
        setStats((prev) => ({
          ...prev,
          published: isPublished ? prev.published + 1 : prev.published - 1,
          draft: isPublished ? prev.draft - 1 : prev.draft + 1,
        }))
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd zmiany statusu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zmienić statusu")
    }
  }

  const handleDeletePost = async () => {
    if (!selectedPost) return

    try {
      const response = await fetch(`/api/admin/blog/${selectedPost.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Wpis został usunięty")
        setIsDeleteDialogOpen(false)
        setSelectedPost(null)
        fetchPosts(pagination.page)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania wpisu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć wpisu")
    }
  }

  const openDeleteDialog = (post: BlogPost) => {
    setSelectedPost(post)
    setIsDeleteDialogOpen(true)
  }

  const openPreviewDialog = (post: BlogPost) => {
    setSelectedPost(post)
    setIsPreviewOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const renderTags = (tagsString: string | null) => {
    if (!tagsString) return null
    try {
      const parsed = JSON.parse(tagsString)
      if (Array.isArray(parsed)) {
        return parsed.map((tag: string, index: number) => (
          <Badge key={index} variant="secondary" className="mr-1 mt-1">
            {tag}
          </Badge>
        ))
      }
    } catch (e) {
      return tagsString.split(",").map((tag: string, index: number) => {
        const trimmed = tag.trim()
        if (!trimmed) return null
        return (
          <Badge key={index} variant="secondary" className="mr-1 mt-1">
            {trimmed}
          </Badge>
        )
      })
    }
    return null
  }

  // Komponent szkieletowy wczytywania w tabeli
  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><div className="h-4 bg-muted rounded w-3/4 animate-pulse" /></TableCell>
          <TableCell><div className="h-4 bg-muted rounded w-1/2 animate-pulse" /></TableCell>
          <TableCell><div className="h-4 bg-muted rounded w-1/3 animate-pulse" /></TableCell>
          <TableCell><div className="h-6 bg-muted rounded-full w-20 animate-pulse" /></TableCell>
          <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
          <TableCell><div className="h-4 bg-muted rounded w-12 animate-pulse" /></TableCell>
          <TableCell><div className="h-8 bg-muted rounded w-20 ml-auto animate-pulse" /></TableCell>
        </TableRow>
      ))}
    </>
  )

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wpisy blogowe</h1>
          <p className="text-muted-foreground">
            Zarządzaj wpisami blogowymi kancelarii partnerskich, zatwierdzaj publikacje i filtruj dane.
          </p>
        </div>
        <Button asChild className="sm:ml-auto flex items-center gap-1.5 shadow-sm">
          <Link href="/admin/blog/nowy">
            <Plus className="h-4 w-4" />
            Dodaj wpis
          </Link>
        </Button>
      </div>

      {/* Karty statystyk */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Wszystkie wpisy</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Wpisów w bazie danych</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Opublikowane</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.published}
            </div>
            <p className="text-xs text-muted-foreground">Widoczne publicznie</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Szkice</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.draft}
            </div>
            <p className="text-xs text-muted-foreground">Wymagające publikacji</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Suma wyświetleń</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalViews.toLocaleString("pl-PL")}
            </div>
            <p className="text-xs text-muted-foreground">Odsłon wszystkich artykułów</p>
          </CardContent>
        </Card>
      </div>

      {/* Pasek narzędzi i filtrów */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex flex-1 flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Szukaj */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj po tytule, kancelarii..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>

          {/* Kategoria */}
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Kategoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie kategorie</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nazwa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              <SelectItem value="published">Opublikowane</SelectItem>
              <SelectItem value="draft">Szkice</SelectItem>
            </SelectContent>
          </Select>

          {/* Sortowanie */}
          <Select value={selectedSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Sortuj według" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">Najnowsze</SelectItem>
              <SelectItem value="createdAt_asc">Najstarsze</SelectItem>
              <SelectItem value="wyswietlenia_desc">Wyświetlenia (od najwyższych)</SelectItem>
              <SelectItem value="wyswietlenia_asc">Wyświetlenia (od najniższych)</SelectItem>
              <SelectItem value="tytul_asc">Tytuł A-Z</SelectItem>
              <SelectItem value="tytul_desc">Tytuł Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Akcje dodatkowe */}
        <div className="flex items-center gap-2">
          {(searchTerm || selectedCategory !== "all" || selectedStatus !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedStatus("all")
                setSelectedSort("createdAt_desc")
              }}
            >
              Wyczyść filtry
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/admin/blog/categories" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Zarządzaj kategoriami
            </Link>
          </Button>
        </div>
      </div>

      {/* Lista wpisów */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            Lista wpisów ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tytuł</TableHead>
                <TableHead>Kancelaria</TableHead>
                <TableHead>Kategoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Utworzono</TableHead>
                <TableHead>Wyświetlenia</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Brak wpisów pasujących do wybranych filtrów.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium max-w-[200px] truncate" title={post.tytul}>
                      {post.tytul}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-foreground">{post.lawFirm.nazwa}</div>
                        <div className="text-muted-foreground text-xs">
                          {post.lawFirm.nazwaFirmy}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.category ? (
                        <Badge variant="outline" className="bg-primary/5">{post.category.nazwa}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Brak</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={post.opublikowany}
                          onCheckedChange={(checked) => handleTogglePublish(post, checked)}
                          id={`publish-switch-${post.id}`}
                        />
                        <Label
                          htmlFor={`publish-switch-${post.id}`}
                          className="text-xs cursor-pointer font-normal"
                        >
                          {post.opublikowany ? (
                            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                              Opublikowany
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Szkic</Badge>
                          )}
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        {post.wyswietlenia}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPreviewDialog(post)}
                          title="Podgląd wpisu"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          title="Edytuj wpis"
                        >
                          <Link href={`/admin/blog/${post.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        {post.opublikowany && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            title="Otwórz na żywo"
                          >
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(post)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Usuń wpis"
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

          {/* Paginacja */}
          {!loading && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Poprzednia
              </Button>
              <span className="text-sm text-muted-foreground">
                Strona {pagination.page} z {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
              >
                Następna
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog podglądu wpisu */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedPost && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="font-semibold">{selectedPost.lawFirm.nazwa}</span>
                  <span>•</span>
                  <span>{formatDate(selectedPost.createdAt)}</span>
                </div>
                <DialogTitle className="text-2xl font-bold leading-tight">
                  {selectedPost.tytul}
                </DialogTitle>
                <DialogDescription>
                  Podgląd szczegółów wpisu blogowego w panelu administracyjnym.
                </DialogDescription>
              </DialogHeader>

              {/* Szybkie ustawienia admina w modalu */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border">
                <div className="space-y-2">
                  <Label htmlFor="modal-lawfirm" className="text-sm font-semibold">Kancelaria / Autor</Label>
                  <Select
                    value={selectedPost.lawFirmId || selectedPost.lawFirm.id}
                    onValueChange={async (value) => {
                      try {
                        const response = await fetch(`/api/admin/blog/${selectedPost.id}`, {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ lawFirmId: value }),
                        })
                        if (response.ok) {
                          toast.success("Kancelaria została zaktualizowana")
                          const updated = await response.json()
                          setSelectedPost(updated)
                          setPosts((prev) => prev.map((p) => (p.id === selectedPost.id ? updated : p)))
                        } else {
                          throw new Error("Błąd aktualizacji kancelarii")
                        }
                      } catch (err) {
                        toast.error("Nie udało się zaktualizować kancelarii")
                      }
                    }}
                  >
                    <SelectTrigger id="modal-lawfirm" className="bg-background">
                      <SelectValue placeholder="Wybierz kancelarię" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {lawFirms.map((lf) => (
                        <SelectItem key={lf.id} value={lf.id}>
                          {lf.nazwa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modal-category" className="text-sm font-semibold">Kategoria wpisu</Label>
                  <Select
                    value={selectedPost.categoryId || "none"}
                    onValueChange={async (value) => {
                      const newCategoryId = value === "none" ? null : value
                      try {
                        const response = await fetch(`/api/admin/blog/${selectedPost.id}`, {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ categoryId: newCategoryId }),
                        })
                        if (response.ok) {
                          toast.success("Kategoria została zaktualizowana")
                          const updated = await response.json()
                          setSelectedPost(updated)
                          setPosts((prev) => prev.map((p) => (p.id === selectedPost.id ? updated : p)))
                        } else {
                          throw new Error("Błąd aktualizacji kategorii")
                        }
                      } catch (err) {
                        toast.error("Nie udało się zaktualizować kategorii")
                      }
                    }}
                  >
                    <SelectTrigger id="modal-category" className="bg-background">
                      <SelectValue placeholder="Brak kategorii" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Brak kategorii</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nazwa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <Label className="text-sm font-semibold mb-2">Status publikacji</Label>
                  <div className="flex items-center space-x-2 h-10">
                    <Switch
                      checked={selectedPost.opublikowany}
                      onCheckedChange={async (checked) => {
                        await handleTogglePublish(selectedPost, checked)
                        setSelectedPost((prev) => (prev ? { ...prev, opublikowany: checked } : null))
                      }}
                      id="modal-publish-switch"
                    />
                    <Label htmlFor="modal-publish-switch" className="text-sm cursor-pointer">
                      {selectedPost.opublikowany ? "Opublikowany (widoczny)" : "Szkic (ukryty)"}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Informacje o SEO i statystykach */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 border rounded-lg flex flex-col justify-between">
                  <span className="text-muted-foreground text-xs">Wyświetlenia</span>
                  <span className="text-lg font-bold flex items-center gap-1.5 mt-1">
                    <Eye className="h-4 w-4 text-blue-500" />
                    {selectedPost.wyswietlenia}
                  </span>
                </div>
                <div className="p-3 border rounded-lg flex flex-col justify-between">
                  <span className="text-muted-foreground text-xs">Data publikacji</span>
                  <span className="text-sm font-semibold flex items-center gap-1.5 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {selectedPost.dataPublikacji ? formatDate(selectedPost.dataPublikacji) : "Brak"}
                  </span>
                </div>
                <div className="p-3 border rounded-lg flex flex-col justify-between">
                  <span className="text-muted-foreground text-xs">Przyjazny URL (slug)</span>
                  <span className="text-xs font-mono truncate mt-1" title={selectedPost.slug}>
                    {selectedPost.slug}
                  </span>
                </div>
              </div>

              {/* Wyróżniony obrazek */}
              {selectedPost.obrazekWyrozniajacy && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedPost.obrazekWyrozniajacy}
                    alt={selectedPost.tytul}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              {/* SEO preview */}
              <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" /> SEO (Wyszukiwarka Google)
                </h4>
                <div className="space-y-1">
                  <div className="text-blue-700 dark:text-blue-400 font-medium hover:underline text-lg cursor-pointer">
                    {selectedPost.metaTitle || selectedPost.tytul}
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-500 text-xs font-mono">
                    {typeof window !== "undefined" ? window.location.origin : ""}/blog/{selectedPost.slug}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {selectedPost.metaDescription || "Brak opisu meta. System wygeneruje go automatycznie na podstawie treści."}
                  </div>
                </div>
              </div>

              {/* Tagi */}
              {selectedPost.tagi && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Tagi
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {renderTags(selectedPost.tagi)}
                  </div>
                </div>
              )}

              {/* Treść */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Treść artykułu</Label>
                <div
                  className="prose dark:prose-invert max-w-none border rounded-lg p-4 bg-background max-h-[300px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: selectedPost.tresc }}
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Zamknij
                </Button>
                <Button asChild variant="outline" className="flex items-center gap-1.5">
                  <Link href={`/admin/blog/${selectedPost.id}`}>
                    <Edit className="h-4 w-4" />
                    Edytuj wpis
                  </Link>
                </Button>
                {selectedPost.opublikowany && (
                  <Button asChild>
                    <Link href={`/blog/${selectedPost.slug}`} target="_blank" className="flex items-center gap-1.5">
                      <ExternalLink className="h-4 w-4" />
                      Zobacz na żywo
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog usuwania */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć wpis &quot;{selectedPost?.tytul}&quot; kancelarii {selectedPost?.lawFirm.nazwa}?
              Ta operacja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
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
