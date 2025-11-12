"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Eye, User, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + "..."
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
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-lg text-muted-foreground">
              Brak artykułów w tej kategorii.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {post.obrazekWyrozniajacy && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img
                        src={post.obrazekWyrozniajacy}
                        alt={post.tytul}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.category && (
                        <Badge variant="secondary">{post.category.nazwa}</Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{post.tytul}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {getExcerpt(post.tresc)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {post.lawFirm.logo ? (
                          <img
                            src={post.lawFirm.logo}
                            alt={post.lawFirm.nazwa}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span className="text-xs">{post.lawFirm.nazwa}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.dataPublikacji)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.wyswietlenia}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

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
