"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Calendar, Eye, User, ArrowLeft, Building2, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface BlogPost {
  id: string
  tytul: string
  slug: string
  tresc: string
  obrazekWyrozniajacy: string | null
  dataPublikacji: string
  wyswietlenia: number
  metaTitle: string | null
  metaDescription: string | null
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
    opis: string | null
    miasto: string
    voivodeship: {
      id: string
      nazwa: string
    }
  }
}

export default function BlogPostPage() {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blog/posts/${slug}`)

      if (response.status === 404) {
        setError("Nie znaleziono artykułu")
        return
      }

      if (response.ok) {
        const data = await response.json()
        setPost(data)
      } else {
        throw new Error("Błąd pobierania artykułu")
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      setError("Wystąpił błąd podczas ładowania artykułu")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Ładowanie artykułu...</div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-2xl font-bold mb-2">Artykuł nie znaleziony</h2>
            <p className="text-muted-foreground mb-6">
              {error || "Nie można znaleźć tego artykułu"}
            </p>
            <Button asChild>
              <Link href="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Wróć do bloga
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć do bloga
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <article>
            {/* Header */}
            <div className="mb-6">
              {post.category && (
                <Badge variant="secondary" className="mb-4">
                  {post.category.nazwa}
                </Badge>
              )}
              <h1 className="text-4xl font-bold mb-4">{post.tytul}</h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.dataPublikacji)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.wyswietlenia} wyświetleń
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {post.obrazekWyrozniajacy && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={post.obrazekWyrozniajacy}
                  alt={post.tytul}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <div className="whitespace-pre-wrap">{post.tresc}</div>
            </div>

            <Separator className="my-8" />

            {/* Share or other actions could go here */}
          </article>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Author Info */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">O autorze</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo */}
              {post.lawFirm.logo && (
                <div className="flex justify-center">
                  <img
                    src={post.lawFirm.logo}
                    alt={post.lawFirm.nazwa}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
              )}

              {/* Name */}
              <div className="text-center">
                <h3 className="font-semibold text-lg">{post.lawFirm.nazwa}</h3>
                <p className="text-sm text-muted-foreground">
                  {post.lawFirm.nazwaFirmy}
                </p>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {post.lawFirm.miasto}, {post.lawFirm.voivodeship.nazwa}
                </span>
              </div>

              {/* Description */}
              {post.lawFirm.opis && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.lawFirm.opis}
                </p>
              )}

              {/* View Profile Button */}
              <Button asChild className="w-full">
                <Link href={`/kancelaria/${post.lawFirm.id}`}>
                  Zobacz profil kancelarii
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
