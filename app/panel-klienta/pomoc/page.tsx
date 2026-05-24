"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Search,
  Link as LinkIcon,
  HelpCircle,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"

interface HelpCategory {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  ikona?: string | null
  kolejnosc: number
  aktywna: boolean
  questions: HelpQuestion[]
}

interface HelpQuestion {
  id: string
  categoryId: string
  pytanie: string
  odpowiedz: string
  slug: string
  kolejnosc: number
  aktywna: boolean
  wyswietlenia: number
}

export default function HelpCenterPage() {
  const [categories, setCategories] = useState<HelpCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchHelpData()
  }, [])

  // Handle hash navigation
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1)
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 300)
    }
  }, [categories])

  const fetchHelpData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/help/categories?odbiorca=CLIENT")
      if (!response.ok) {
        throw new Error("Nie udało się pobrać danych centrum pomocy")
      }

      const data = await response.json()
      setCategories(data.filter((cat: HelpCategory) => cat.aktywna))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
      toast.error("Nie udało się załadować centrum pomocy")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = (questionId: string, slug: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(questionId)
    toast.success("Link skopiowany do schowka")
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filter questions based on search and category
  const filteredQuestions = categories.flatMap(cat =>
    cat.questions
      .filter(q => q.aktywna)
      .filter(q => {
        const matchesSearch = searchQuery === "" ||
          q.pytanie.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.odpowiedz.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory = selectedCategory === "all" || cat.id === selectedCategory

        return matchesSearch && matchesCategory
      })
      .map(q => ({ ...q, categoryName: cat.nazwa, categorySlug: cat.slug }))
  )

  // Get unique categories that have questions
  const availableCategories = [
    { id: "all", nazwa: "Wszystkie", slug: "all" },
    ...categories.filter(cat => cat.questions.some(q => q.aktywna))
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-playfair tracking-tight">Centrum Pomocy</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Znajdź odpowiedzi na najczęściej zadawane pytania
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Czego szukasz?"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {availableCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            size="sm"
          >
            {category.nazwa}
          </Button>
        ))}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pytania i odpowiedzi</CardTitle>
          <CardDescription>
            {selectedCategory === "all"
              ? "Wszystkie pytania"
              : categories.find(c => c.id === selectedCategory)?.nazwa
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Brak wyników</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Nie znaleziono pytań pasujących do Twojego wyszukiwania"
                  : "W tej kategorii nie ma jeszcze pytań"}
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredQuestions.map((question) => (
                <AccordionItem key={question.id} value={question.id} id={question.slug}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-start gap-3 text-left">
                      <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">{question.pytanie}</div>
                        <Badge variant="outline" className="mt-1">
                          {question.categoryName}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-8 space-y-4">
                      <div
                        className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: question.odpowiedz }}
                      />
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(question.id, question.slug)}
                        >
                          {copiedId === question.id ? (
                            <>
                              <span className="text-green-600">Skopiowano!</span>
                            </>
                          ) : (
                            <>
                              <LinkIcon className="h-4 w-4 mr-2" />
                              Kopiuj link
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle>Potrzebujesz dodatkowej pomocy?</CardTitle>
          <CardDescription>
            Skontaktuj się z naszym zespołem wsparcia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/panel-klienta/wiadomosci">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <MessageSquare className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Wiadomość</div>
                  <div className="text-xs text-muted-foreground">
                    Napisz do nas
                  </div>
                </div>
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4" asChild>
              <a href="mailto:pomoc@prosta-sprawa.pl">
                <Mail className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">E-mail</div>
                  <div className="text-xs text-muted-foreground">
                    pomoc@prosta-sprawa.pl
                  </div>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4" asChild>
              <a href="tel:+48123456789">
                <Phone className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Telefon</div>
                  <div className="text-xs text-muted-foreground">
                    +48 123 456 789
                  </div>
                </div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
