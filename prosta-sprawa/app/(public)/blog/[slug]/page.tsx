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
    slug: string
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

  // Calculate estimated reading time (assuming 200 words per minute)
  const estimatedReadingTime = post ? Math.ceil(post.tresc.replace(/<[^>]*>/g, '').split(/\s+/).length / 200) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Featured Image */}
      {post.obrazekWyrozniajacy && (
        <div className="relative h-[400px] md:h-[500px] bg-gradient-to-b from-black/50 to-black/70">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${post.obrazekWyrozniajacy})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="container mx-auto px-4 h-full flex items-end pb-12 relative z-10">
            <div className="max-w-4xl">
              {post.category && (
                <Badge variant="secondary" className="mb-4 bg-white/90 hover:bg-white">
                  {post.category.nazwa}
                </Badge>
              )}
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {post.tytul}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.dataPublikacji)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.wyswietlenia} wyświetleń
                </div>
                {estimatedReadingTime > 0 && (
                  <div className="flex items-center gap-1">
                    <span>📖 {estimatedReadingTime} min czytania</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
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
            <article className="bg-card rounded-lg shadow-sm">
              {/* Header (only if no featured image) */}
              {!post.obrazekWyrozniajacy && (
                <div className="p-6 md:p-8 border-b">
                  {post.category && (
                    <Badge variant="secondary" className="mb-4">
                      {post.category.nazwa}
                    </Badge>
                  )}
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.tytul}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.dataPublikacji)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.wyswietlenia} wyświetleń
                    </div>
                    {estimatedReadingTime > 0 && (
                      <div className="flex items-center gap-1">
                        <span>📖 {estimatedReadingTime} min czytania</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 md:p-8">
                <div className="prose prose-lg md:prose-xl max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:mb-4 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-img:rounded-lg prose-img:shadow-md">
                  <div dangerouslySetInnerHTML={{ __html: post.tresc }} />
                </div>
              </div>

              <Separator />

              {/* Footer with tags or share */}
              <div className="p-6 md:p-8 bg-muted/30">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Artykuł przygotowany przez{" "}
                    <Link
                      href={`/kancelaria/${post.lawFirm.slug}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {post.lawFirm.nazwa}
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            {/* CTA Section */}
            <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-2">Potrzebujesz pomocy prawnej?</h3>
                <p className="text-muted-foreground mb-4">
                  Skontaktuj się z naszą kancelarią, aby uzyskać profesjonalne wsparcie w Twojej sprawie.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href={`/kancelaria/${post.lawFirm.slug}`}>
                      Zobacz profil kancelarii
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/dodaj-sprawe">Dodaj sprawę</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Author Info */}
            <Card className="sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">O autorze</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Logo */}
                {post.lawFirm.logo ? (
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={post.lawFirm.logo}
                        alt={post.lawFirm.nazwa}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/10"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/10">
                      <Building2 className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                )}

                {/* Name */}
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-1">{post.lawFirm.nazwa}</h3>
                  <p className="text-sm text-muted-foreground">
                    {post.lawFirm.nazwaFirmy}
                  </p>
                </div>

                <Separator />

                {/* Location */}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {post.lawFirm.miasto}, {post.lawFirm.voivodeship.nazwa}
                  </span>
                </div>

                {/* Description */}
                {post.lawFirm.opis && (
                  <>
                    <Separator />
                    <p className="text-sm text-muted-foreground">
                      {post.lawFirm.opis}
                    </p>
                  </>
                )}

                <Separator />

                {/* View Profile Button */}
                <Button asChild className="w-full" size="lg">
                  <Link href={`/kancelaria/${post.lawFirm.slug}`}>
                    <Building2 className="w-4 h-4 mr-2" />
                    Zobacz profil kancelarii
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Contact Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Szybki kontakt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Masz pytania? Skontaktuj się z kancelarią już teraz.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/kancelaria/${post.lawFirm.slug}#kontakt`}>
                    Skontaktuj się
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
