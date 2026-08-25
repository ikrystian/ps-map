"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconArticle,
  IconFileText,
  IconGavel,
  IconScale,
  IconBriefcase,
  IconBuildingBank,
  IconHeartHandshake,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Flame,
  Search,
  SearchX,
  Sparkles,
  User,
  X,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { expertAvatar } from "@/lib/expert-avatar";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { BlogCategory } from "@/types";
import { PaginationData } from "@/types/pagination";
import { BlogPost } from "@/types/blog";
import {
  buildCategoryTree,
  getCategoryPath,
  type BlogCategoryNode,
} from "@/lib/blog-category-tree";

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const plural = (count: number, forms: [string, string, string]) => {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (count === 1) return forms[0];
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 10 || lastTwo >= 20)) {
    return forms[1];
  }
  return forms[2];
};

const formatDate = (dateString?: string | Date | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatShortDate = (dateString?: string | Date | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
  });
};

const formatViews = (views?: number): string => {
  const value = views ?? 0;
  return `${value} ${plural(value, ["wyświetlenie", "wyświetlenia", "wyświetleń"])}`;
};

const stripHtml = (content?: string | null) =>
  content ? content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

const getExcerpt = (content?: string | null, maxLength = 140) => {
  const stripped = stripHtml(content);
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trim() + "…";
};

const getReadingTime = (content?: string | null) => {
  const stripped = stripHtml(content);
  if (!stripped) return 1;
  return Math.max(1, Math.ceil(stripped.split(/\s+/).length / 200));
};

interface CategoryTheme {
  icon: React.ReactNode;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentGradient: string;
  topLineBg: string;
}

const getCategoryTheme = (categoryName?: string): CategoryTheme => {
  const name = (categoryName ?? "").toLowerCase();

  if (name.includes("cywilne") || name.includes("odszkodow") || name.includes("nieruchomości")) {
    return {
      icon: <IconScale className="h-3.5 w-3.5" />,
      badgeBg: "bg-teal-500/10 dark:bg-teal-500/20",
      badgeText: "text-teal-700 dark:text-teal-300",
      badgeBorder: "border-teal-500/30",
      accentGradient: "from-teal-500/20 via-teal-500/5 to-transparent",
      topLineBg: "bg-gradient-to-r from-teal-500 via-teal-400 to-transparent",
    };
  }

  if (name.includes("karne") || name.includes("sąd") || name.includes("wykroczen")) {
    return {
      icon: <IconGavel className="h-3.5 w-3.5" />,
      badgeBg: "bg-rose-500/10 dark:bg-rose-500/20",
      badgeText: "text-rose-700 dark:text-rose-300",
      badgeBorder: "border-rose-500/30",
      accentGradient: "from-rose-500/20 via-rose-500/5 to-transparent",
      topLineBg: "bg-gradient-to-r from-rose-500 via-rose-400 to-transparent",
    };
  }

  if (name.includes("prac") || name.includes("b2b") || name.includes("umow") || name.includes("firm")) {
    return {
      icon: <IconBriefcase className="h-3.5 w-3.5" />,
      badgeBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      badgeText: "text-indigo-700 dark:text-indigo-300",
      badgeBorder: "border-indigo-500/30",
      accentGradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
      topLineBg: "bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent",
    };
  }

  if (name.includes("rodzin") || name.includes("aliment") || name.includes("spad")) {
    return {
      icon: <IconHeartHandshake className="h-3.5 w-3.5" />,
      badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
      badgeText: "text-amber-700 dark:text-amber-300",
      badgeBorder: "border-amber-500/30",
      accentGradient: "from-amber-500/20 via-amber-500/5 to-transparent",
      topLineBg: "bg-gradient-to-r from-amber-500 via-amber-400 to-transparent",
    };
  }

  if (name.includes("podat") || name.includes("finans") || name.includes("gospodar")) {
    return {
      icon: <IconBuildingBank className="h-3.5 w-3.5" />,
      badgeBg: "bg-violet-500/10 dark:bg-violet-500/20",
      badgeText: "text-violet-700 dark:text-violet-300",
      badgeBorder: "border-violet-500/30",
      accentGradient: "from-violet-500/20 via-violet-500/5 to-transparent",
      topLineBg: "bg-gradient-to-r from-violet-500 via-violet-400 to-transparent",
    };
  }

  return {
    icon: <IconArticle className="h-3.5 w-3.5" />,
    badgeBg: "bg-primary/10 dark:bg-primary/20",
    badgeText: "text-primary",
    badgeBorder: "border-primary/25",
    accentGradient: "from-primary/20 via-primary/5 to-transparent",
    topLineBg: "bg-gradient-to-r from-primary via-primary/70 to-transparent",
  };
};

const getPageNumbers = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
};

/* -------------------------------------------------------------------------- */
/*                              Shared fragments                              */
/* -------------------------------------------------------------------------- */

function AuthorAvatar({
  post,
  size = "sm",
}: {
  post: BlogPost;
  size?: "sm" | "md";
}) {
  const dimensions = size === "md" ? "h-10 w-10" : "h-7 w-7";
  const iconSize = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";

  // Ekspert bez wgranego logo dostaje domyślny avatar zamiast ikony sylwetki
  if (post.lawFirm) {
    return (
      <img
        src={expertAvatar(post.lawFirm.logo)}
        alt={post.lawFirm.nazwa ?? "Autor"}
        className={`${dimensions} shrink-0 rounded-full border border-border/60 bg-card object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${dimensions} flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-primary/10 text-primary shadow-sm`}
    >
      <User className={`${iconSize}`} />
    </div>
  );
}

function CoverArt({
  post,
  className = "",
}: {
  post: BlogPost;
  className?: string;
}) {
  const theme = getCategoryTheme(post.category?.nazwa);

  if (post.obrazekWyrozniajacy) {
    return (
      <img
        src={post.obrazekWyrozniajacy}
        alt={post.tytul}
        className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${theme.accentGradient} bg-muted/60`}
    >
      {/* Abstract geometric background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-8 -right-8 text-foreground/5">
        <div className="scale-[3.5]">{theme.icon}</div>
      </div>
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-card/90 shadow-md backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
        <span className={theme.badgeText}>{theme.icon}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

interface BlogPageClientProps {
  initialPosts: BlogPost[];
  initialPagination: PaginationData;
  initialCategories: BlogCategory[];
  initialPopularPosts: BlogPost[];
  initialTotalPublished: number;
}

export default function BlogPageClient({
  initialPosts,
  initialPagination,
  initialCategories,
  initialPopularPosts,
  initialTotalPublished,
}: BlogPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");
  const activeTag = searchParams.get("tag");

  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  // Kategorie/popularne wpisy są dostarczane raz przez server-side render strony
  // i nie wymagają odświeżania w trakcie życia tego komponentu.
  const categories = initialCategories;
  const popularPosts = initialPopularPosts;
  const totalPublished = initialTotalPublished;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    if (!categorySlug) return null;
    const found = initialCategories.find((c) => c.slug === categorySlug);
    return found ? found.id : null;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>(initialPagination);
  const isFirstPostsFetch = useRef(true);

  const resultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Obsługa skrótu klawiszowego / do szybkiego wyszukiwania
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounce pola wyszukiwania
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Synchronizuj selectedCategory z parametrem category (slug) w URL
  useEffect(() => {
    if (categories.length > 0) {
      if (categorySlug) {
        const found = categories.find((c) => c.slug === categorySlug);
        setSelectedCategory(found ? found.id : null);
      } else {
        setSelectedCategory(null);
      }
    }
  }, [categorySlug, categories]);

  // Po zmianie tagu w URL wróć na pierwszą stronę wyników
  useEffect(() => {
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, [activeTag]);

  useEffect(() => {
    // Pierwsze wywołanie pomijamy — dane początkowe (zgodne z bieżącym URL)
    // zostały już dostarczone przez server-side render strony.
    if (isFirstPostsFetch.current) {
      isFirstPostsFetch.current = false;
      return;
    }
    fetchPosts();
  }, [selectedCategory, debouncedSearch, activeTag, pagination.page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (activeTag) params.append("tag", activeTag);

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

    const tagSuffix = activeTag ? `tag=${encodeURIComponent(activeTag)}` : "";

    if (categoryId === null) {
      router.push(tagSuffix ? `/blog?${tagSuffix}` : "/blog", { scroll: false });
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);
    if (cat) {
      router.push(
        `/blog?category=${cat.slug}${tagSuffix ? `&${tagSuffix}` : ""}`,
        { scroll: false },
      );
    }
  };

  const handleClearTag = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    const cat = selectedCategory
      ? categories.find((c) => c.id === selectedCategory)
      : null;
    router.push(cat ? `/blog?category=${cat.slug}` : "/blog", { scroll: false });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedCategory(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    router.push("/blog", { scroll: false });
  };

  const handlePageChange = (page: number) => {
    if (page === pagination.page) return;
    setPagination((prev) => ({ ...prev, page }));
    requestAnimationFrame(() => {
      const el = resultsRef.current;
      if (!el) return;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 160,
        behavior: "smooth",
      });
    });
  };

  // Hierarchia kategorii: korzenie + ścieżka wybranej kategorii (wiersze podkategorii)
  const categoryTree = buildCategoryTree(categories);
  const nodeById = new Map<string, BlogCategoryNode>();
  const indexNodes = (nodes: BlogCategoryNode[]) => {
    nodes.forEach((node) => {
      nodeById.set(node.id, node);
      indexNodes(node.children);
    });
  };
  indexNodes(categoryTree);
  const selectedPath = selectedCategory
    ? getCategoryPath(categories, selectedCategory)
    : [];
  const selectedPathIds = selectedPath.map((c) => c.id);

  // Podział wpisów: wyróżniony vs siatka
  const hasFeatured =
    posts.length > 0 && pagination.page === 1 && !debouncedSearch && !activeTag;
  const featuredPost = hasFeatured ? posts[0] : null;
  const gridPosts = hasFeatured ? posts.slice(1) : posts;

  const hasActiveFilters = Boolean(
    debouncedSearch || selectedCategory || activeTag,
  );
  const highlights = popularPosts.slice(0, 3);
  const showHighlights = highlights.length >= 3;
  const totalPages = pagination.pages ?? 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* ------------------------------- HERO SECTION ------------------------------- */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/5 via-background to-background">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-70" />
          <div className="absolute top-10 right-1/4 h-80 w-80 rounded-full bg-secondary/15 blur-3xl opacity-60" />
          <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top_left,black_20%,transparent_75%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
          <div
            className={`grid items-start gap-12 ${showHighlights ? "lg:grid-cols-12 lg:gap-14" : ""}`}
          >
            {/* Kolumna główna */}
            <div className={showHighlights ? "lg:col-span-7" : "max-w-3xl"}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Baza Wiedzy Prawnej
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="mt-5 font-playfair text-4xl leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                Poradniki i analizy{" "}
                <span className="relative inline-block text-primary">
                  prawne
                  <span className="absolute bottom-1 left-0 -z-10 h-3 w-full bg-primary/15 rounded-full" />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className="mt-5 max-w-xl text-base font-normal leading-relaxed text-muted-foreground sm:text-lg"
              >
                Czytaj zweryfikowane artykuły, opracowania i porady prawne
                przygotowywane bezpośrednio przez doświadczonych prawników i kancelarie.
              </motion.p>

              {/* Pole wyszukiwania z ulepszonym UX */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="group relative mt-8 max-w-xl"
              >
                <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/50 via-primary/10 to-secondary/40 opacity-0 blur-md transition-opacity duration-500 group-focus-within:opacity-100" />
                <div className="relative flex items-center gap-3 rounded-2xl border border-border/80 bg-card/90 px-4 py-3 shadow-lg backdrop-blur-md transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                  <Search className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Szukaj zagadnienia, przepisu lub słowa kluczowego…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Szukaj artykułów"
                    className="w-full border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/75 focus:ring-0 sm:text-base"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setDebouncedSearch("");
                        setPagination((prev) => ({ ...prev, page: 1 }));
                      }}
                      aria-label="Wyczyść wyszukiwanie"
                      className="flex shrink-0 cursor-pointer items-center justify-center rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <kbd className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded border border-border/70 bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-xs">
                      <span className="text-[11px]">/</span>
                    </kbd>
                  )}
                </div>
              </motion.div>

              {/* Wskaźniki statystyczne */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4"
              >
                {totalPublished !== null && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <IconArticle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-playfair text-xl font-bold text-foreground">
                        {totalPublished}
                      </div>
                      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {plural(totalPublished, [
                          "artykuł",
                          "artykuły",
                          "artykułów",
                        ])}
                      </div>
                    </div>
                  </div>
                )}
                {categories.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20 text-foreground">
                      <SlidersHorizontal className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-playfair text-xl font-bold text-foreground">
                        {categories.length}
                      </div>
                      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {plural(categories.length, [
                          "kategoria",
                          "kategorie",
                          "kategorii",
                        ])}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Weryfikowane przez radców i adwokatów
                </div>
              </motion.div>
            </div>

            {/* Najczęściej czytane (Trending Widget) */}
            {showHighlights && (
              <motion.aside
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-5"
              >
                <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-md backdrop-blur-md sm:p-7">
                  <div className="flex items-center justify-between pb-4 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                        <Flame className="h-4 w-4" />
                      </div>
                      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Najczęściej czytane
                      </h2>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-primary/80 tracking-wider">
                      Popularne
                    </span>
                  </div>

                  <ol className="divide-y divide-border/40">
                    {highlights.map((post, index) => {
                      const rankColors = [
                        "text-amber-500 bg-amber-500/10 border-amber-500/20",
                        "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
                        "text-teal-500 bg-teal-500/10 border-teal-500/20",
                      ];
                      const rankColor = rankColors[index] || "text-primary bg-primary/10";

                      return (
                        <li key={post.id}>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="group flex items-start gap-4 py-4 transition-colors"
                          >
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold font-playfair ${rankColor}`}
                            >
                              0{index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                                {post.tytul}
                              </h3>
                              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                                {post.category?.nazwa && (
                                  <span className="truncate font-medium text-foreground/80">
                                    {post.category.nazwa}
                                  </span>
                                )}
                                <span className="flex shrink-0 items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {post.wyswietlenia ?? 0}
                                </span>
                                <span className="flex shrink-0 items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {getReadingTime(post.tresc)} min
                                </span>
                              </div>
                            </div>
                            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </motion.aside>
            )}
          </div>
        </div>
      </section>

      {/* --------------------------- PASEK FILTRÓW (STICKY) --------------------------- */}
      <div className="sticky top-[65px] z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-3">
            <div className="relative min-w-0 flex-1">
              <div className="scrollbar-none flex gap-2 overflow-x-auto py-1">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`relative z-10 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    selectedCategory === null
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {selectedCategory === null && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 -z-10 rounded-full bg-primary shadow-xs"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  Wszystkie
                </button>

                {categoryTree.map((category) => {
                  const isSelected = selectedCategory === category.id;
                  const isParentSelected = selectedPathIds.includes(category.id);
                  const theme = getCategoryTheme(category.nazwa);

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`relative z-10 flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isSelected
                          ? "text-primary-foreground"
                          : isParentSelected
                            ? "text-primary font-bold"
                            : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activeCategory"
                          className="absolute inset-0 -z-10 rounded-full bg-primary shadow-xs"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className={isSelected ? "text-primary-foreground" : theme.badgeText}>
                        {theme.icon}
                      </span>
                      {category.nazwa}
                    </button>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent md:hidden" />
            </div>

            {!loading && (
              <span className="hidden shrink-0 text-xs font-medium text-muted-foreground lg:block">
                Wpisów: <span className="font-semibold text-foreground">{pagination.total}</span>
              </span>
            )}
          </div>

          {/* Podkategorie wybranej ścieżki */}
          <AnimatePresence>
            {selectedPath.map((pathCategory) => {
              const node = nodeById.get(pathCategory.id);
              if (!node || node.children.length === 0) return null;
              return (
                <motion.div
                  key={pathCategory.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="scrollbar-none flex gap-2 overflow-x-auto border-t border-border/40 py-2.5"
                >
                  {node.children.map((child) => {
                    const isChildSelected = selectedCategory === child.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => handleCategoryChange(child.id)}
                        className={`relative z-10 shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                          isChildSelected
                            ? "border-transparent text-primary-foreground"
                            : selectedPathIds.includes(child.id)
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                      >
                        {isChildSelected && (
                          <motion.div
                            layoutId="activeSubcategory"
                            className="absolute inset-0 -z-10 rounded-full bg-primary"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        {child.nazwa}
                      </button>
                    );
                  })}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ------------------------------ SEKJA WYNIKÓW ------------------------------ */}
      <section
        ref={resultsRef}
        className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pt-12"
      >
        {/* Aktywne filtry */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-sm"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mr-1">
              Aktywne filtry:
            </span>

            {debouncedSearch && (
              <Badge className="flex items-center gap-1.5 rounded-full border border-border/80 bg-muted py-1 pl-3 pr-1.5 text-xs font-medium text-foreground shadow-2xs">
                Szukaj: „{debouncedSearch}”
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  aria-label="Usuń frazę wyszukiwania"
                  className="cursor-pointer rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}

            {activeTag && (
              <Badge className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 py-1 pl-3 pr-1.5 text-xs font-semibold text-primary shadow-2xs">
                <Tag className="h-3 w-3" />#{activeTag}
                <button
                  onClick={handleClearTag}
                  aria-label="Usuń filtr tagu"
                  className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-primary/20"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}

            {selectedPath.length > 0 && (
              <Badge className="flex items-center gap-1.5 rounded-full border border-border/80 bg-muted py-1 pl-3 pr-1.5 text-xs font-medium text-foreground shadow-2xs">
                {selectedPath.map((c) => c.nazwa).join(" › ")}
                <button
                  onClick={() => handleCategoryChange(null)}
                  aria-label="Usuń filtr kategorii"
                  className="cursor-pointer rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}

            <button
              onClick={handleResetFilters}
              className="ml-auto cursor-pointer text-xs font-semibold text-primary underline-offset-4 transition-colors hover:underline"
            >
              Wyczyść wszystkie
            </button>
          </motion.div>
        )}

        {loading ? (
          /* ------------------------- Stan ładowania ------------------------ */
          <div className="space-y-12">
            {pagination.page === 1 && !hasActiveFilters && (
              <Skeleton className="h-[420px] w-full rounded-[2rem] lg:h-[480px]" />
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8" id="blog-grid">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-xs"
                >
                  <Skeleton className="aspect-[16/10] w-full rounded-none" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-5 w-full rounded-md" />
                    <Skeleton className="h-5 w-4/5 rounded-md" />
                    <Skeleton className="h-12 w-full rounded-md" />
                    <div className="flex items-center gap-3 border-t border-border/40 pt-4">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-3.5 w-24 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          /* --------------------------- Brak wyników ------------------------ */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg rounded-[2rem] border border-dashed border-border/80 bg-card/40 px-8 py-20 text-center shadow-xs backdrop-blur-sm"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/70 bg-muted/60 text-muted-foreground shadow-xs">
              <SearchX className="h-8 w-8" />
            </div>
            <h3 className="font-playfair text-2xl font-bold text-foreground">
              Brak wyników
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Nie znaleźliśmy artykułów pasujących do wpisanych kryteriów. Spróbuj
              użyć innego słowa kluczowego lub zresetuj filtry.
            </p>
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="mt-7 cursor-pointer rounded-xl border-border px-6 hover:bg-muted"
            >
              Wyczyść filtry
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-12 lg:space-y-16">
            {/* ------------------------ ARTYKUŁ WYRÓŻNIONY ------------------- */}
            {featuredPost && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group relative flex min-h-[440px] flex-col justify-end overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-xl transition-all duration-500 hover:border-primary/40 hover:shadow-2xl lg:min-h-[500px]"
                >
                  <div className="absolute inset-0">
                    <CoverArt post={featuredPost} />
                  </div>

                  {/* Gradienty osłaniające pod treść */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/15" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                  <div className="relative max-w-4xl p-6 sm:p-10 lg:p-12">
                    <div className="mb-4 flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-xs">
                        <Sparkles className="h-3 w-3" />
                        Wyróżniony artykuł
                      </span>
                      {featuredPost.category && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                          {getCategoryTheme(featuredPost.category.nazwa).icon}
                          {featuredPost.category.nazwa}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground/80">
                        <Clock className="h-3 w-3" />
                        {getReadingTime(featuredPost.tresc)} min czytania
                      </span>
                    </div>

                    <h2 className="font-playfair text-2xl leading-[1.12] tracking-tight text-foreground transition-colors group-hover:text-primary-foreground sm:text-4xl lg:text-5xl font-bold">
                      {featuredPost.tytul}
                    </h2>

                    <p className="mt-3.5 line-clamp-2 max-w-3xl text-sm font-normal leading-relaxed text-foreground/80 sm:text-base">
                      {getExcerpt(featuredPost.tresc, 240)}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-border pt-5">
                      <div className="flex items-center gap-3">
                        <AuthorAvatar post={featuredPost} size="md" />
                        <div>
                          <span className="block text-sm font-semibold leading-tight text-foreground">
                            {featuredPost.lawFirm?.nazwa ?? "Administracja"}
                          </span>
                          <span className="mt-1 flex items-center gap-3 text-xs text-foreground/70">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(featuredPost.dataPublikacji)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatViews(featuredPost.wyswietlenia)}
                            </span>
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all duration-300 group-hover:gap-3 group-hover:bg-primary group-hover:text-primary-foreground">
                        Czytaj artykuł
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            {/* ---------------------------- SIATKA WPISÓW --------------------------- */}
            {gridPosts.length > 0 && (
              <motion.div
                key={`${pagination.page}-${selectedCategory}-${debouncedSearch}-${activeTag}`}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
                id="blog-grid"
              >
                {gridPosts.map((post) => {
                  const theme = getCategoryTheme(post.category?.nazwa);

                  return (
                    <motion.article key={post.id} variants={itemVariants}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                      >
                        {/* Pasek akcentujący u góry */}
                        <div className={`h-1 w-full ${theme.topLineBg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                        {/* Okładka */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                          <CoverArt post={post} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90" />

                          {post.category && (
                            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                              {theme.icon}
                              <span className="max-w-[9rem] truncate">
                                {post.category.nazwa}
                              </span>
                            </span>
                          )}

                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                            <Clock className="h-3 w-3" />
                            {getReadingTime(post.tresc)} min
                          </span>
                        </div>

                        {/* Treść kafelka */}
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="font-playfair text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-xl">
                            <span className="line-clamp-2">{post.tytul}</span>
                          </h3>

                          <p className="mt-2.5 line-clamp-3 flex-1 text-xs sm:text-sm font-normal leading-relaxed text-muted-foreground">
                            {getExcerpt(post.tresc)}
                          </p>

                          {/* Stopka kafelka */}
                          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <AuthorAvatar post={post} />
                              <span className="truncate text-xs font-semibold text-foreground">
                                {post.lawFirm?.nazwa ?? "Administracja"}
                              </span>
                            </div>
                            <div className="flex shrink-0 items-center gap-3 text-[11px] text-muted-foreground">
                              <span
                                className="flex items-center gap-1"
                                title={formatViews(post.wyswietlenia)}
                              >
                                <Eye className="h-3 w-3" />
                                {post.wyswietlenia ?? 0}
                              </span>
                              <span>{formatShortDate(post.dataPublikacji)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}

            {/* -------------------------- PAGINACJA -------------------------- */}
            {totalPages > 1 && (
              <nav
                aria-label="Paginacja artykułów"
                className="flex items-center justify-center gap-2 pt-6"
              >
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  aria-label="Poprzednia strona"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border/70"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  {getPageNumbers(pagination.page, totalPages).map(
                    (page, index) =>
                      page === "…" ? (
                        <span
                          key={`gap-${index}`}
                          className="px-1 text-sm text-muted-foreground"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          aria-current={
                            page === pagination.page ? "page" : undefined
                          }
                          className={`h-10 min-w-10 cursor-pointer rounded-xl px-3.5 text-sm font-semibold transition-colors ${
                            page === pagination.page
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "border border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                  aria-label="Następna strona"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border/70"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
