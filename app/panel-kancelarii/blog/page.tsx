"use client"

import React, { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, FileText, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { usePermissions } from "@/hooks/usePermissions"
import { FeatureLockedCard } from "@/components/permissions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface BlogPost {
  id: string
  tytul: string
  slug: string
  opublikowany: boolean
  dataPublikacji: string | null
  wyswietlenia: number
  createdAt: string
  updatedAt: string
  category: {
    id: string
    nazwa: string
  } | null
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

export default function LawFirmBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  })
  const router = useRouter()

  // Sprawdź uprawnienia do bloga
  const { hasFeature, loading: permissionsLoading } = usePermissions()
  const canAccessBlog = hasFeature("canAccessBlog")

  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/law-firms/me/blog?page=${page}&limit=20`)

      if (response.status === 401 || response.status === 403) {
        toast.error("Nie masz uprawnień do tej strony")
        router.push("/")
        return
      }

      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        setPagination(data.pagination)
      } else {
        throw new Error("Błąd pobierania wpisów")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać wpisów bloga")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDeletePost = async () => {
    if (!selectedPost) return

    try {
      const response = await fetch(`/api/law-firms/me/blog/${selectedPost.id}`, {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  // Jeśli ładuje uprawnienia - pokaż loader
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    )
  }

  // Jeśli brak dostępu do bloga - pokaż kartę upgrade
  if (!canAccessBlog) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Blog eksperta</h1>
          <p className="text-muted-foreground">
            Buduj autorytet i przyciągaj klientów dzięki profesjonalnemu blogowi
          </p>
        </div>

        <FeatureLockedCard
          title="Blog eksperta"
          description="Prowadź profesjonalny blog prawniczy, dziel się wiedzą i buduj autorytet w swojej dziedzinie."
          requiredPackage="BIZNES"
          icon={BookOpen}
          features={[
            "Nieograniczona liczba artykułów",
            "Kategorie i tagi dla lepszej organizacji",
            "Edytor WYSIWYG z pełnym formatowaniem",
            "Optymalizacja SEO dla każdego wpisu",
            "Statystyki wyświetleń i zaangażowania",
            "Możliwość publikacji i wersji roboczych",
          ]}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mój blog</h1>
          <p className="text-muted-foreground">
            Zarządzaj wpisami na blogu swojego profilu
          </p>
        </div>
        <Button asChild>
          <Link href="/panel-kancelarii/blog/nowy">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj artykuł
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Brak artykułów</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Nie masz jeszcze żadnych artykułów na blogu. Zacznij dzielić się swoją wiedzą i doświadczeniem.
            </p>
            <Button asChild>
              <Link href="/panel-kancelarii/blog/nowy">
                <Plus className="h-4 w-4 mr-2" />
                Napisz pierwszy artykuł
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Twoje artykuły ({pagination.total})</CardTitle>
            <CardDescription>
              Lista wszystkich artykułów opublikowanych i szkiców
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tytuł</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data utworzenia</TableHead>
                  <TableHead>Wyświetlenia</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-md">
                      <div className="truncate">{post.tytul}</div>
                    </TableCell>
                    <TableCell>
                      {post.category ? (
                        <Badge variant="outline">{post.category.nazwa}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Brak</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.opublikowany ? "default" : "secondary"}>
                        {post.opublikowany ? "Opublikowany" : "Szkic"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {post.wyswietlenia}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/panel-kancelarii/blog/${post.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(post)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Paginacja */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPosts(pagination.page - 1)}
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
                  onClick={() => fetchPosts(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Następna
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog usuwania */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć wpis &quot;{selectedPost?.tytul}&quot;?
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
