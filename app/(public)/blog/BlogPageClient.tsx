"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconArticle,
  IconFileText,
  IconGavel,
  IconScale,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  HelpCircle,
  Search,
  User,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface BlogPost {
  id: string;
  tytul: string;
  slug: string;
  tresc: string;
  obrazekWyrozniajacy: string | null;
  dataPublikacji: string;
  wyswietlenia: number;
  category: {
    id: string;
    nazwa: string;
    slug: string;
  } | null;
  lawFirm: {
    id: string;
    nazwa: string;
    nazwaFirmy: string;
    logo: string | null;
  };
}

interface BlogCategory {
  id: string;
  nazwa: string;
  slug: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10, // 1 featured + 9 grid items is 10 per page
    pages: 0,
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, debouncedSearch, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/blog/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedCategory) {
        params.append("categoryId", selectedCategory);
      }

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      const response = await fetch(`/api/blog/posts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getExcerpt = (content: string, maxLength: number = 140) => {
    const stripped = content.replace(/<[^>]*>/g, "");
    if (stripped.length <= maxLength) return stripped;
    return stripped.slice(0, maxLength).trim() + "...";
  };

  const getReadingTime = (content: string) => {
    const stripped = content.replace(/<[^>]*>/g, "");
    const words = stripped.split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // Average reading speed
    return minutes;
  };

  const getCategoryIcon = (
    categoryName: string | undefined,
    className = "h-4 w-4",
  ) => {
    if (!categoryName) return <IconArticle className={className} />;

    const name = categoryName.toLowerCase();
    if (name.includes("prawo") || name.includes("cywilne")) {
      return <IconScale className={className} />;
    }
    if (name.includes("karne") || name.includes("sąd")) {
      return <IconGavel className={className} />;
    }
    if (
      name.includes("dokument") ||
      name.includes("umowa") ||
      name.includes("administracyjne")
    ) {
      return <IconFileText className={className} />;
    }
    return <IconArticle className={className} />;
  };

  // Splitting posts to featured vs grid
  const hasFeatured =
    posts.length > 0 && pagination.page === 1 && !debouncedSearch;
  const featuredPost = hasFeatured ? posts[0] : null;
  const gridPosts = hasFeatured ? posts.slice(1) : posts;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen bg-background-sec selection:bg-primary/20 selection:text-primary-foreground">
      {/* Hero Header Section */}
      <section className="relative py-20 px-4 border-b border-border/40 overflow-hidden bg-gradient-to-b from-muted/30 via-background to-background-sec">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            Baza Wiedzy
          </Badge>

          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-foreground tracking-tight leading-none">
            Poradniki i Analizy Prawne
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Artykuły, opinie i porady prawne pisane bezpośrednio przez
            zweryfikowane kancelarie i ekspertów
          </p>

          {/* Clean Floating Search Bar */}
          <div className="relative max-w-xl mx-auto mt-10 group">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative flex items-center bg-card border border-border/80 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 rounded-full shadow-sm px-4 py-1.5 transition-all">
              <Search className="w-5 h-5 text-muted-foreground ml-1" />
              <input
                type="text"
                placeholder="Szukaj zagadnień lub artykułów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none focus:ring-0 text-sm py-2 px-3 placeholder-muted-foreground text-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:bg-muted rounded-full transition-colors flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Filter */}
      <section className="px-4 py-8">
        <div className="flex flex-wrap gap-2 justify-center max-w-5xl mx-auto">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`relative px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors z-10 cursor-pointer ${selectedCategory === null
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {selectedCategory === null && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-primary rounded-full -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
            Wszystkie
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`relative px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors z-10 cursor-pointer ${selectedCategory === category.id
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {selectedCategory === category.id && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              {category.nazwa}
            </button>
          ))}
        </div>
      </section>

      {/* Articles Main Container */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        {loading ? (
          /* Premium Loading Skeletons */
          <div className="space-y-12">
            {/* Featured skeleton */}
            {pagination.page === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-card/40 border border-border/50 rounded-3xl p-6 md:p-8">
                <Skeleton className="lg:col-span-7 aspect-[16/9] w-full rounded-2xl" />
                <div className="lg:col-span-5 flex flex-col justify-between py-4 space-y-4">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-6 w-5/6 rounded-md" />
                  </div>
                  <Skeleton className="h-16 w-full rounded-md" />
                  <div className="flex items-center gap-3 pt-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3.5 w-24 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="border border-border/50 bg-card/40 rounded-2xl p-5 space-y-4"
                >
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-6 w-full rounded-md" />
                  <Skeleton className="h-14 w-full rounded-md" />
                  <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3.5 w-24 rounded-md" />
                      <Skeleton className="h-3 w-16 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          /* Sleek Empty State */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-card/20 border border-border/40 rounded-3xl max-w-xl mx-auto p-8 backdrop-blur-sm"
          >
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Brak artykułów
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Nie znaleźliśmy wpisów pasujących do podanych kryteriów
              wyszukiwania lub kategorii.
            </p>
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="rounded-xl border-border px-6 hover:bg-muted cursor-pointer"
            >
              Wyczyść filtry i wyszukiwanie
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {/* Featured Post Card (only page 1 & no search query) */}
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="group relative overflow-hidden bg-card border border-border/60 hover:border-primary/30 rounded-3xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300"
              >
                {/* Subtle visual glow on hover */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center cursor-pointer"
                >
                  {/* Image container */}
                  <div className="lg:col-span-7 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted relative">
                    {featuredPost.obrazekWyrozniajacy ? (
                      <img
                        src={featuredPost.obrazekWyrozniajacy}
                        alt={featuredPost.tytul}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                      />
                    ) : (
                      /* Custom Mesh Gradient Design */
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 via-background to-secondary/30 flex items-center justify-center">
                        <div className="absolute bottom-4 right-4 opacity-[0.03] text-foreground pointer-events-none">
                          {getCategoryIcon(
                            featuredPost.category?.nazwa,
                            "w-48 h-48",
                          )}
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-card border border-border/80 flex items-center justify-center shadow-md">
                          {getCategoryIcon(
                            featuredPost.category?.nazwa,
                            "w-8 h-8 text-primary",
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content details */}
                  <div className="lg:col-span-5 flex flex-col justify-between h-full py-2 space-y-6">
                    <div className="space-y-4">
                      {/* Meta: Category & Reading Time */}
                      <div className="flex items-center gap-3">
                        {featuredPost.category && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1.5 px-3 py-1 bg-secondary/80 text-secondary-foreground text-xs font-semibold rounded-full border-transparent"
                          >
                            {getCategoryIcon(
                              featuredPost.category.nazwa,
                              "w-3.5 h-3.5 text-primary",
                            )}
                            {featuredPost.category.nazwa}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {getReadingTime(featuredPost.tresc)} min czytania
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {featuredPost.tytul}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-muted-foreground text-sm md:text-base font-light leading-relaxed line-clamp-4">
                        {getExcerpt(featuredPost.tresc, 240)}
                      </p>
                    </div>

                    {/* Author, Date & Visual Trigger */}
                    <div className="pt-6 border-t border-border/40 flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        {featuredPost.lawFirm.logo ? (
                          <img
                            src={featuredPost.lawFirm.logo}
                            alt={featuredPost.lawFirm.nazwa}
                            className="w-10 h-10 rounded-full object-cover border border-border/50 bg-neutral-900"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border/50">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <span className="block text-sm font-semibold text-foreground leading-none mb-1">
                            {featuredPost.lawFirm.nazwa}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(featuredPost.dataPublikacji)}
                          </span>
                        </div>
                      </div>

                      {/* Read Button */}
                      <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:translate-x-1.5 transition-transform duration-300">
                        Czytaj artykuł
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Grid Articles Section */}
            {gridPosts.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {gridPosts.map((post) => (
                  <motion.div key={post.id} variants={itemVariants}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block h-full group"
                    >
                      <Card className="flex flex-col h-full bg-card hover:bg-card/80 border border-border/60 hover:border-primary/20 hover:shadow-xl rounded-2xl overflow-hidden transition-all duration-300">
                        {/* Cover Image */}
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          {post.obrazekWyrozniajacy ? (
                            <img
                              src={post.obrazekWyrozniajacy}
                              alt={post.tytul}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                            />
                          ) : (
                            /* Custom Placeholder design */
                            <div className="w-full h-full bg-gradient-to-br from-primary/5 via-background to-secondary/15 flex items-center justify-center relative">
                              <div className="absolute bottom-2 right-2 opacity-[0.02] text-foreground pointer-events-none">
                                {getCategoryIcon(
                                  post.category?.nazwa,
                                  "w-32 h-32",
                                )}
                              </div>
                              <div className="w-12 h-12 rounded-xl bg-card border border-border/80 flex items-center justify-center shadow-sm">
                                {getCategoryIcon(
                                  post.category?.nazwa,
                                  "w-6 h-6 text-primary/80",
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Header details */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            {/* Category & Read Time */}
                            <div className="flex items-center justify-between gap-2">
                              {post.category && (
                                <Badge
                                  variant="secondary"
                                  className="flex items-center gap-1.5 px-2.5 py-0.5 bg-secondary/80 text-secondary-foreground text-sm font-semibold tracking-wider rounded-full border-transparent"
                                >
                                  {getCategoryIcon(
                                    post.category.nazwa,
                                    "w-3 h-3 text-primary",
                                  )}
                                  {post.category.nazwa}
                                </Badge>
                              )}
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-light">
                                <Clock className="w-3 h-3" />
                                {getReadingTime(post.tresc)} min
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="font-playfair text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                              {post.tytul}
                            </h3>

                            {/* Excerpt */}
                            <p className="text-muted-foreground text-xs md:text-sm font-light leading-relaxed line-clamp-3">
                              {getExcerpt(post.tresc)}
                            </p>
                          </div>

                          {/* Card Footer author detail */}
                          <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              {post.lawFirm.logo ? (
                                <img
                                  src={post.lawFirm.logo}
                                  alt={post.lawFirm.nazwa}
                                  className="w-7 h-7 rounded-full object-cover border border-border/60 bg-neutral-900"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center border border-border/60">
                                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                              )}
                              <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                                {post.lawFirm.nazwa}
                              </span>
                            </div>

                            {/* Views / Date */}
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <Eye className="w-3 h-3" />
                                {post.wyswietlenia}
                              </span>
                              <span>
                                {new Date(
                                  post.dataPublikacji,
                                ).toLocaleDateString("pl-PL", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Premium Pagination controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-10">
                <Button
                  variant="outline"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="rounded-xl border-border hover:bg-muted flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Poprzednia
                </Button>

                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Strona {pagination.page} z {pagination.pages}
                </span>

                <Button
                  variant="outline"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.pages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.pages}
                  className="rounded-xl border-border hover:bg-muted flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  Następna
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
