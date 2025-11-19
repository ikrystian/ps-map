"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Eye, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MasonryGrid, MasonryGridItem } from "@/components/ui/masonry-grid"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  IconArticle,
  IconScale,
  IconGavel,
  IconFileText,
} from "@tabler/icons-react"

interface BlogPost {
  id: string
  tytul: string
  slug: string
  tresc: string
  obrazekWyrozniajacy: string | null
  dataPublikacji: string
  wyswietlenia: number
  category: {
    id: string
    nazwa: string
    slug: string
  } | null
  lawFirm: {
    id: string
    nazwa: string
    nazwaFirmy: string
    logo: string | null
  }
}

interface BlogCategory {
  id: string
  nazwa: string
  slug: string
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  })

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [selectedCategory, pagination.page])

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

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    setPagination({ ...pagination, page: 1 })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getExcerpt = (content: string, maxLength: number = 150) => {
    // Strip HTML tags
    const stripped = content.replace(/<[^>]*>/g, "")
    if (stripped.length <= maxLength) return stripped
    return stripped.slice(0, maxLength) + "..."
  }

  const getCategoryIcon = (categoryName: string | undefined) => {
    if (!categoryName) return <IconArticle className="h-4 w-4 text-neutral-500" />

    const name = categoryName.toLowerCase()
    if (name.includes("prawo") || name.includes("cywilne")) {
      return <IconScale className="h-4 w-4 text-neutral-500" />
    }
    if (name.includes("karne") || name.includes("sąd")) {
      return <IconGavel className="h-4 w-4 text-neutral-500" />
    }
    if (name.includes("dokument") || name.includes("umowa")) {
      return <IconFileText className="h-4 w-4 text-neutral-500" />
    }
    return <IconArticle className="h-4 w-4 text-neutral-500" />
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog prawniczy</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Najnowsze artykuły, porady i analizy prawne od ekspertów
        </p>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => handleCategoryChange(null)}
        >
          Wszystkie
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.nazwa}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Ładowanie artykułów...</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Brak artykułów w tej kategorii.
          </p>
        </div>
      ) : (
        <>
          {/* Blog Posts Masonry Grid */}
          <MasonryGrid className="max-w-7xl mx-auto mb-12">
            {posts.map((post) => (
              <MasonryGridItem key={post.id}>
                <Link href={`/blog/${post.slug}`}>
                  <Card className="group overflow-hidden transition-all duration-200 hover:shadow-xl">
                    {/* Featured Image */}
                    {post.obrazekWyrozniajacy ? (
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={post.obrazekWyrozniajacy}
                          alt={post.tytul}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
                    )}

                    <CardHeader className="space-y-3">
                      {/* Category Badge */}
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(post.category?.nazwa)}
                        {post.category && (
                          <Badge variant="secondary" className="text-xs">
                            {post.category.nazwa}
                          </Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-lg leading-tight text-neutral-800 dark:text-neutral-100 group-hover:text-primary transition-colors">
                        {post.tytul}
                      </h3>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Excerpt */}
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3">
                        {getExcerpt(post.tresc)}
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        {post.lawFirm.logo ? (
                          <img
                            src={post.lawFirm.logo}
                            alt={post.lawFirm.nazwa}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span className="font-medium">{post.lawFirm.nazwa}</span>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-xs text-neutral-500 pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.dataPublikacji)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {post.wyswietlenia}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </MasonryGridItem>
            ))}
          </MasonryGrid>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
              >
                Poprzednia
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Strona {pagination.page} z {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
              >
                Następna
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
