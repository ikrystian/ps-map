"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion"
import {
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  Search,
  User,
  X,
  Newspaper,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  Share2,
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { BlogPost } from "@/types/blog"
import type { BlogCategory } from "@/types"
import { PaginationData } from "@/types/pagination"
import { buildCategoryTree, pruneEmptyCategoryTree, type BlogCategoryNode } from "@/lib/blog-category-tree"
import { cn } from "@/lib/utils"

export default function ClientNewsCenterPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  
  // Dialog scroll progress tracking
  const dialogContentRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 9,
    pages: 0,
  })

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPagination((prev) => ({ ...prev, page: 1 }))
    }, 450)

    return () => clearTimeout(handler)
  }, [searchQuery])

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/blog/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch posts on category, search or page changes
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        })

        if (selectedCategory) {
          params.append("categoryId", selectedCategory)
        }

        if (debouncedSearch) {
          params.append("search", debouncedSearch)
        }

        const response = await fetch(`/api/blog/posts?${params}`)
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [selectedCategory, debouncedSearch, pagination.page])

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("")
    setDebouncedSearch("")
    setSelectedCategory(null)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Formatting date
  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Reading time calculator
  const getReadingTime = (content?: string | null) => {
    if (!content) return 0
    const stripped = content.replace(/<[^>]*>/g, "")
    const words = stripped.split(/\s+/).length
    return Math.ceil(words / 200) || 1
  }

  // Get first 150 chars of content as text excerpt
  const getExcerpt = (content?: string | null, maxLength = 120) => {
    if (!content) return ""
    const stripped = content.replace(/<[^>]*>/g, "")
    if (stripped.length <= maxLength) return stripped
    return stripped.slice(0, maxLength).trim() + "..."
  }

  // Format tags string array
  const parseTags = (tagsString?: string | null): string[] => {
    if (!tagsString) return []
    try {
      const parsed = JSON.parse(tagsString)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  // Dialog scroll handler for progress tracking
  const handleDialogScroll = () => {
    const el = dialogContentRef.current
    if (!el) return
    const totalHeight = el.scrollHeight - el.clientHeight
    if (totalHeight > 0) {
      setScrollProgress(el.scrollTop / totalHeight)
    }
  }

  // Trigger scroll progress calculation whenever selected post is set
  useEffect(() => {
    if (selectedPost) {
      setScrollProgress(0)
      // Lock main scrollbar
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [selectedPost])

  // Drzewo kategorii bez pustych gałęzi (rodzic zostaje, jeśli podkategorie mają wpisy)
  const categoryTree = pruneEmptyCategoryTree(buildCategoryTree(categories))

  // Ścieżka od korzenia do wybranej kategorii — na jej podstawie pokazujemy rzędy podkategorii
  const selectedPath: BlogCategoryNode[] = []
  if (selectedCategory) {
    const findPath = (nodes: BlogCategoryNode[], path: BlogCategoryNode[]): boolean => {
      for (const node of nodes) {
        const next = [...path, node]
        if (node.id === selectedCategory) {
          selectedPath.push(...next)
          return true
        }
        if (findPath(node.children, next)) return true
      }
      return false
    }
    findPath(categoryTree, [])
  }
  const subcategoryRows = selectedPath.filter((node) => node.children.length > 0)

  const handleSelectCategory = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="relative space-y-8 pb-12">
      {/* Background glow animations */}
      <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Page Header */}
      <PageHeader
        title="Centrum Newsów i Wiedzy"
        subtitle="Przeczytaj najnowsze informacje prawne, poradniki i nowości ze świata prawa przygotowane przez ekspertów."
      />

      {/* Search and Category Filter Section */}
      <div className="flex flex-col gap-6 bg-card/30 backdrop-blur-md border border-border/40 p-6 rounded-2xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant={selectedCategory === null ? "primary" : "outline"}
              onClick={() => handleSelectCategory(null)}
              className="rounded-full text-xs font-semibold uppercase tracking-wider h-9 px-4"
            >
              Wszystkie
            </Button>
            {categoryTree.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "primary" : "outline"}
                onClick={() => handleSelectCategory(cat.id)}
                className={cn(
                  "rounded-full text-xs font-semibold uppercase tracking-wider h-9 px-4",
                  // Przodek wybranej podkategorii — zaznaczony subtelniej niż aktywna kategoria
                  selectedCategory !== cat.id &&
                    selectedPath.some((node) => node.id === cat.id) &&
                    "border-primary/50 text-primary"
                )}
              >
                {cat.nazwa}
              </Button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-[320px] group">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative flex items-center bg-zinc-950/40 border border-border/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 rounded-full px-4 py-1.5 transition-all">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Wyszukaj newsy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none focus:ring-0 text-xs py-1 px-2.5 placeholder-muted-foreground text-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setDebouncedSearch("")
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subcategory rows — po jednym rzędzie dla każdego poziomu ścieżki wybranej kategorii */}
        <AnimatePresence initial={false}>
          {subcategoryRows.map((parent) => (
            <motion.div
              key={parent.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 items-center pt-1">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pr-1">
                  <CornerDownRight className="w-3.5 h-3.5" />
                  {parent.nazwa}
                </span>
                {parent.children.map((child) => (
                  <Button
                    key={child.id}
                    variant={selectedCategory === child.id ? "primary" : "outline"}
                    onClick={() => handleSelectCategory(child.id)}
                    className={cn(
                      "rounded-full text-xs font-medium h-8 px-3.5",
                      selectedCategory !== child.id &&
                        selectedPath.some((node) => node.id === child.id) &&
                        "border-primary/50 text-primary"
                    )}
                  >
                    {child.nazwa}
                  </Button>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Blog Posts Grid */}
      <div className="relative z-10">
        {loading ? (
          /* Premium Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="border border-border/40 bg-card/30 rounded-2xl p-5 space-y-4 animate-pulse"
              >
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-6 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
                <div className="flex items-center gap-3 pt-3 border-t border-border/20">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3.5 w-24 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* Clean empty state */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-card/20 border border-border/40 rounded-2xl max-w-md mx-auto p-8 backdrop-blur-sm shadow-xl"
          >
            <div className="w-14 h-14 bg-zinc-800/40 border border-border/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-6 h-6 text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Brak wpisów</h3>
            <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed mb-6">
              Nie odnaleźliśmy newsów pasujących do wybranych filtrów lub wyszukiwanej frazy.
            </p>
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="rounded-xl border-border/80 px-6 hover:bg-white/5 transition-colors cursor-pointer text-xs"
            >
              Wyczyść filtry i wyszukiwanie
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {/* Grid of posts */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 25 } },
                  }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedPost(post)}
                  className="cursor-pointer group flex flex-col h-full bg-card/30 backdrop-blur-sm hover:bg-card/50 border border-border/40 hover:border-primary/30 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
                >
                  {/* Card Cover Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-muted-foreground/10 border-b border-border/20">
                    {post.obrazekWyrozniajacy ? (
                      <img
                        src={post.obrazekWyrozniajacy}
                        alt={post.tytul}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                      />
                    ) : (
                      /* Minimal mesh mockup background */
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 via-background to-secondary/15 flex items-center justify-center relative">
                        <Newspaper className="w-10 h-10 text-primary/30" />
                      </div>
                    )}
                    {post.isSponsored && (
                      <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground border-transparent px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                        Sponsorowany
                      </Badge>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Meta data */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        {post.category && (
                          <Badge
                            variant="secondary"
                            className="bg-secondary/40 text-secondary-foreground border-transparent rounded px-2 py-0.5 font-semibold"
                          >
                            {post.category.nazwa}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          {getReadingTime(post.tresc)} min
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-playfair text-base font-bold text-white group-hover:text-primary leading-snug transition-colors line-clamp-2">
                        {post.tytul}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-zinc-400 text-xs font-light leading-relaxed line-clamp-3">
                        {getExcerpt(post.tresc, 130)}
                      </p>
                    </div>

                    {/* Author & Footer info */}
                    <div className="pt-4 border-t border-border/20 flex items-center justify-between text-xs text-zinc-400">
                      <div className="flex items-center gap-2 truncate pr-2">
                        {post.lawFirm?.logo ? (
                          <img
                            src={post.lawFirm.logo}
                            alt={post.lawFirm.nazwa}
                            className="w-6 h-6 rounded-full object-cover border border-border/50 bg-neutral-900 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-border/50 flex-shrink-0">
                            <User className="w-3 h-3 text-zinc-400" />
                          </div>
                        )}
                        <span className="font-semibold text-white truncate max-w-[120px]">
                          {post.lawFirm ? post.lawFirm.nazwa : "Administracja"}
                        </span>
                      </div>

                      {/* Date & Views */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="flex items-center gap-0.5" title={`${post.wyswietlenia} wyświetleń`}>
                          <Eye className="w-3.5 h-3.5 text-zinc-500" />
                          {post.wyswietlenia}
                        </span>
                        <span>•</span>
                        <span>
                          {post.dataPublikacji && new Date(post.dataPublikacji).toLocaleDateString("pl-PL", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination Controls */}
            {pagination.pages && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="rounded-xl border-border/50 hover:bg-white/5 flex items-center gap-1.5 h-9 text-xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Poprzednia
                </Button>

                <span className="text-xs font-semibold tracking-wider text-zinc-400">
                  Strona {pagination.page} z {pagination.pages}
                </span>

                <Button
                  variant="outline"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.pages || 1, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.pages}
                  className="rounded-xl border-border/50 hover:bg-white/5 flex items-center gap-1.5 h-9 text-xs transition-colors cursor-pointer"
                >
                  Następna
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reader Modal Overlay */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop Blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-zinc-950/75 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
              className="relative w-full max-w-4xl h-[85vh] max-h-[800px] flex flex-col bg-zinc-900 border border-border/60 rounded-3xl overflow-hidden shadow-2xl z-10"
            >
              {/* Reading Progress Indicator */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-zinc-800 z-50">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-teal-400 origin-left"
                  style={{ scaleX: scrollProgress }}
                />
              </div>

              {/* Modal Top Header (Sticky) */}
              <div className="flex items-center justify-between border-b border-border/20 px-6 py-4 bg-zinc-900/90 backdrop-blur-sm z-30 shrink-0">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Czytasz wpis
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const shareData = {
                        title: selectedPost.tytul,
                        text: getExcerpt(selectedPost.tresc, 100),
                        url: `${window.location.origin}/blog/${selectedPost.slug}`,
                      }
                      if (navigator.share) {
                        navigator.share(shareData).catch((err) => console.log(err))
                      } else {
                        navigator.clipboard.writeText(shareData.url)
                        alert("Skopiowano link do wpisu!")
                      }
                    }}
                    className="h-9 w-9 rounded-full border-border/50 text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Udostępnij artykuł"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedPost(null)}
                    className="h-9 w-9 rounded-full border-border/50 text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Scrollable Reader Content */}
              <div
                ref={dialogContentRef}
                onScroll={handleDialogScroll}
                className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth"
              >
                {/* Hero Featured Image */}
                {selectedPost.obrazekWyrozniajacy ? (
                  <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden bg-muted relative">
                    <img
                      src={selectedPost.obrazekWyrozniajacy}
                      alt={selectedPost.tytul}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-4 w-full bg-gradient-to-r from-primary/5 via-secondary/10 to-primary/5 rounded-2xl" />
                )}

                {/* Article Header Details */}
                <div className="space-y-4">
                  {/* Category & Badge Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedPost.category && (
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-2.5 py-1 rounded">
                        {selectedPost.category.nazwa}
                      </Badge>
                    )}
                    {selectedPost.isSponsored && (
                      <Badge className="bg-secondary text-secondary-foreground text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded">
                        Sponsorowany
                      </Badge>
                    )}
                    <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      {getReadingTime(selectedPost.tresc)} min czytania
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Eye className="w-4 h-4 text-zinc-500" />
                      {selectedPost.wyswietlenia} wyświetleń
                    </span>
                  </div>

                  {/* Main Title */}
                  <h1 className="text-2xl md:text-4xl font-playfair font-bold text-white leading-tight tracking-tight">
                    {selectedPost.tytul}
                  </h1>

                  {/* Author Detail Row */}
                  <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-border/20">
                    <div className="flex items-center gap-3">
                      {selectedPost.lawFirm?.logo ? (
                        <img
                          src={selectedPost.lawFirm.logo}
                          alt={selectedPost.lawFirm.nazwa}
                          className="w-10 h-10 rounded-full object-cover border border-border/50 bg-neutral-900"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-border/50">
                          <User className="w-5 h-5 text-zinc-400" />
                        </div>
                      )}
                      <div>
                        <span className="block text-sm font-semibold text-white leading-none mb-1">
                          {selectedPost.lawFirm ? selectedPost.lawFirm.nazwa : "Administracja"}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          Opublikowano: {formatDate(selectedPost.dataPublikacji)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HTML content rendering in a beautiful tailwind prose wrapper */}
                <article
                  className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-playfair prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-white prose-p:text-neutral-300 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary/85 prose-strong:text-white prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-zinc-300 prose-img:rounded-2xl prose-img:shadow-2xl prose-li:text-zinc-300"
                  dangerouslySetInnerHTML={{ __html: selectedPost.tresc || "" }}
                />

                {/* Tag Chips Row */}
                {parseTags(selectedPost.tagi).length > 0 && (
                  <div className="pt-6 border-t border-border/20">
                    <div className="flex flex-wrap gap-2">
                      {parseTags(selectedPost.tagi).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[11px] font-medium text-zinc-400 border-border/60 hover:text-white hover:border-primary/40 rounded px-2.5 py-0.5 transition-colors"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
