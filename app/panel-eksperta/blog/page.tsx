"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { FeatureLockedCard } from "@/components/permissions"
import { BorderBeam } from "@/components/ui/border-beam"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePermissions } from "@/hooks/usePermissions"
import { motion } from "framer-motion"
import { BookOpen, Edit, Eye, FileText, Plus, Trash2, Loader2, Calendar, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { PaginationData } from '@/types/pagination';
import { BlogPost } from '@/types/blog';





const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
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

  if (loading || permissionsLoading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie uprawnień i artykułów...</p>
        </div>
      </div>
    )
  }

  // Jeśli brak dostępu do bloga - pokaż kartę upgrade z ładnym tłem
  if (!canAccessBlog) {
    return (
      <div className="relative space-y-6 pb-12 min-h-screen">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold font-playfair text-white">Blog eksperta</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Buduj autorytet i przyciągaj klientów dzięki profesjonalnemu blogowi
          </p>
        </div>

        <div className="relative z-10">
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
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />


      <PageHeader
        title="Mój blog"
        subtitle="Zarządzaj wpisami na blogu swojego profilu i publikuj profesjonalne artykuły."
      >
        <Button id="tour-blog-new" asChild className="h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-semibold rounded-xl shadow-md border-t border-white/10 group gap-2">
          <Link href="/panel-eksperta/blog/nowy">
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Napisz artykuł
          </Link>
        </Button>
      </PageHeader>


      {/* Main Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10"
      >
        <motion.div variants={itemVariants}>
          {posts.length === 0 ? (
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
              <BorderBeam lightColor="#0da192" lightWidth={400} duration={7} borderWidth={1} />
              <CardContent className="flex flex-col items-center justify-center py-16 max-w-md mx-auto text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-zinc-800/40 border border-border/40 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-zinc-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Brak artykułów</h3>
                  <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed font-light">
                    Nie masz jeszcze żadnych artykułów na blogu. Zacznij dzielić się swoją wiedzą i doświadczeniem, aby przyciągać nowych klientów.
                  </p>
                </div>
                <Button asChild className="h-10 px-5 bg-[#0da192] hover:bg-[#0da192]/95 text-white rounded-xl gap-2 mt-2">
                  <Link href="/panel-eksperta/blog/nowy">
                    <Plus className="h-4 w-4" />
                    Napisz pierwszy artykuł
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card id="tour-blog-list" className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
              <BorderBeam lightColor="#0da192" lightWidth={400} duration={7} borderWidth={1} />
              <CardHeader className="border-b border-border/20 py-4 px-6">
                <CardTitle className="text-lg font-playfair text-white">Twoje artykuły ({pagination.total})</CardTitle>
                <CardDescription className="text-zinc-400 text-xs">
                  Lista wszystkich artykułów opublikowanych oraz w wersji roboczej
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/20 hover:bg-transparent">
                        <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Tytuł</TableHead>
                        <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider w-40">Kategoria</TableHead>
                        <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider w-36">Status</TableHead>
                        <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider w-48">Data utworzenia</TableHead>
                        <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider w-32">Wyświetlenia</TableHead>
                        <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider text-right w-36">Akcje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id} className="border-b border-border/10 hover:bg-white/[0.02] text-sm text-zinc-300 transition-colors">
                          <TableCell className="py-4 px-6 font-semibold text-white max-w-md">
                            <div className="truncate" title={post.tytul}>{post.tytul}</div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            {post.category ? (
                              <Badge className="bg-[#0da192]/10 text-[#0da192] border border-[#0da192]/20 px-2.5 py-0.5 rounded-md font-medium">
                                {post.category.nazwa}
                              </Badge>
                            ) : (
                              <span className="text-zinc-500 text-xs font-light italic">Brak</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            {post.opublikowany ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-medium">
                                Opublikowany
                              </Badge>
                            ) : (
                              <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 px-2 py-0.5 rounded-md font-medium">
                                Szkic
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-6 text-xs font-light text-zinc-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                              {formatDate(post.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-xs">
                            <div className="flex items-center gap-1.5 text-zinc-300">
                              <Eye className="h-3.5 w-3.5 text-zinc-400" />
                              <span className="font-medium">{post.wyswietlenia}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                asChild
                                className="h-9 w-9 rounded-lg border border-border/50 text-zinc-400 hover:text-[#0da192] hover:bg-[#0da192]/5 hover:border-[#0da192]/30 transition-all shrink-0"
                                title="Edytuj wpis"
                              >
                                <Link href={`/panel-eksperta/blog/${post.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openDeleteDialog(post)}
                                className="h-9 w-9 rounded-lg border border-border/50 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/30 transition-all shrink-0"
                                title="Usuń wpis"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card List View */}
                <div className="block md:hidden p-4 space-y-3">
                  {posts.map((post) => (
                    <div key={post.id} className="p-4 rounded-xl border border-border/10 bg-zinc-900/40 text-xs space-y-3 relative hover:border-[#0da192]/30 transition-all">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-white text-sm truncate" title={post.tytul}>
                            {post.tytul}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            {post.category ? (
                              <Badge className="bg-[#0da192]/10 text-[#0da192] border border-[#0da192]/20 text-sm px-1.5 py-0">
                                {post.category.nazwa}
                              </Badge>
                            ) : (
                              <span className="text-zinc-500 text-sm italic">Brak kategorii</span>
                            )}
                          </div>
                        </div>
                        {post.opublikowany ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">Opublikowany</Badge>
                        ) : (
                          <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 shrink-0">Szkic</Badge>
                        )}
                      </div>

                      <div className="flex justify-between items-center border-t border-border/5 pt-2 text-sm">
                        <div>
                          <span className="text-zinc-500 block font-light">Utworzono</span>
                          <span className="text-zinc-300 font-medium">{formatDate(post.createdAt)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-500 block font-light">Wyświetlenia</span>
                          <span className="text-zinc-300 font-medium flex items-center gap-1 justify-end">
                            <Eye className="h-3 w-3 text-zinc-400 animate-pulse" />
                            {post.wyswietlenia}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end border-t border-border/5 pt-2.5">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8 rounded-lg border border-border/50 text-zinc-400 hover:text-[#0da192] hover:bg-[#0da192]/5 hover:border-[#0da192]/30 gap-1.5 text-sm"
                        >
                          <Link href={`/panel-eksperta/blog/${post.id}`}>
                            <Edit className="h-3.5 w-3.5" />
                            Edytuj
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(post)}
                          className="h-8 w-8 rounded-lg border border-border/50 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/30 transition-all shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginacja */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-4 py-4 px-6 border-t border-border/20">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchPosts(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="h-9 border-border/50 text-zinc-300 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent rounded-xl transition-all"
                    >
                      Poprzednia
                    </Button>
                    <span className="text-xs text-zinc-400">
                      Strona <span className="text-white font-semibold">{pagination.page}</span> z <span className="text-white font-semibold">{pagination.pages}</span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchPosts(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="h-9 border-border/50 text-zinc-300 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent rounded-xl transition-all"
                    >
                      Następna
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* Dialog usuwania */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border border-border/40 max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-rose-500/5 blur-[50px] rounded-full pointer-events-none" />
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold font-playfair text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
              Usuń wpis
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm pt-2 leading-relaxed">
              Czy na pewno chcesz usunąć wpis <span className="text-white font-semibold">&quot;{selectedPost?.tytul}&quot;</span>?
              Ta operacja jest nieodwracalna, a artykuł zniknie z Twojego bloga.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 pt-6 flex flex-col-reverse sm:flex-row">
            <AlertDialogCancel className="border-border/50 hover:bg-muted text-white rounded-xl h-10 w-full sm:w-auto">
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl border-t border-white/10 h-10 w-full sm:w-auto font-semibold"
            >
              Usuń artykuł
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
