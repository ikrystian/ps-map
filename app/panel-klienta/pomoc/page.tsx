"use client"

import { BorderBeam } from "@/components/ui/border-beam"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  AlertCircle,
  HelpCircle,
  Link as LinkIcon,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Sparkles,
  Check,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

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

  // Obsługa nawigacji po kotwicach (hash)
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

  // Filtrowanie pytań w oparciu o zapytanie i kategorię
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

  // Pobranie unikalnych kategorii, które posiadają aktywne pytania
  const availableCategories = [
    { id: "all", nazwa: "Wszystkie", slug: "all" },
    ...categories.filter(cat => cat.questions.some(q => q.aktywna))
  ]

  if (loading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie centrum pomocy...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-rose-500/30 bg-rose-500/5 backdrop-blur-md rounded-2xl p-6">
        <div className="flex items-center gap-3 text-rose-400">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div>
            <h4 className="font-semibold">Błąd ładowania</h4>
            <p className="text-xs text-rose-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair tracking-tight text-white">Centrum pomocy</h1>
        <p className="text-sm text-zinc-400 mt-1.5 font-light">
          Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące funkcjonowania platformy dla klientów.
        </p>
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0da192]/10 border border-[#0da192]/20 text-[#0da192] text-xs font-semibold tracking-wide">
          <Sparkles className="h-3 w-3 animate-pulse" />
          CENTRUM WSPARCIA I WIEDZY KLIENTA
        </div>
      </motion.div>

      {/* Search Bar & Filters */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 relative z-10"
      >
        {/* Search Bar */}
        <motion.div variants={itemVariants}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-[#0da192] transition-colors h-5 w-5" />
            <Input
              placeholder="Czego potrzebujesz? Wpisz słowo kluczowe..."
              className="pl-12 h-14 bg-zinc-950/40 border-border/30 rounded-2xl text-white placeholder:text-zinc-500 focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-zinc-950/60 transition-all text-base shadow-lg shadow-black/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
          {availableCategories.map((category) => {
            const isActive = selectedCategory === category.id
            return (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
                className={cn(
                  "h-9 px-4 rounded-full font-medium text-xs transition-all duration-300 border",
                  isActive
                    ? "bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white border-transparent shadow-md"
                    : "bg-zinc-900/40 border-border/30 text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                {category.nazwa}
              </Button>
            )
          })}
        </motion.div>

        {/* FAQ Accordion Section */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
            <BorderBeam lightColor="#0da192" lightWidth={400} duration={8} borderWidth={1} />
            <CardHeader className="border-b border-border/20 py-5 px-6">
              <CardTitle className="text-lg font-playfair text-white">Najczęstsze pytania i odpowiedzi</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                {selectedCategory === "all"
                  ? "Przeglądaj wszystkie tematy pomocy"
                  : `Pytania z kategorii: ${categories.find(c => c.id === selectedCategory)?.nazwa}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                  <div className="h-14 w-14 rounded-full bg-zinc-800/40 border border-border/40 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-zinc-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Brak wyników</h4>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-light">
                      {searchQuery
                        ? "Nie znaleźliśmy pytań spełniających Twoje kryteria wyszukiwania. Spróbuj użyć innych słów kluczowych."
                        : "W wybranej kategorii nie ma obecnie żadnych opublikowanych pytań."}
                    </p>
                  </div>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full space-y-1">
                  {filteredQuestions.map((question) => (
                    <AccordionItem
                      key={question.id}
                      value={question.id}
                      id={question.slug}
                      className="border border-border/10 bg-zinc-950/15 rounded-xl px-4 overflow-hidden transition-all hover:border-[#0da192]/20"
                    >
                      <AccordionTrigger className="hover:no-underline py-4 text-sm font-medium text-zinc-200 hover:text-white transition-colors">
                        <div className="flex items-start gap-3.5 text-left">
                          <HelpCircle className="h-5 w-5 text-[#d7b56d] shrink-0 mt-0.5 transition-transform duration-300" />
                          <div className="min-w-0">
                            <span className="leading-snug">{question.pytanie}</span>
                            <div className="mt-1">
                              <Badge className="bg-[#0da192]/10 text-[#0da192] border border-[#0da192]/20 text-sm font-medium py-0 px-2 rounded-md">
                                {question.categoryName}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="border-t border-border/5 pt-4 pb-4">
                        <div className="pl-8 space-y-4">
                          <div
                            className="text-zinc-300 text-sm leading-relaxed font-light prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-a:text-[#0da192] prose-strong:text-white prose-strong:font-semibold"
                            dangerouslySetInnerHTML={{ __html: question.odpowiedz }}
                          />
                          <div className="flex items-center gap-2 pt-3 border-t border-border/5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyLink(question.id, question.slug)}
                              className="h-8 px-3 rounded-lg border border-border/50 text-zinc-400 hover:text-white hover:bg-white/5 hover:border-border/80 transition-all text-xs gap-1.5"
                            >
                              {copiedId === question.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Skopiowano link</span>
                                </>
                              ) : (
                                <>
                                  <LinkIcon className="h-3.5 w-3.5" />
                                  <span>Skopiuj bezpośredni link</span>
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
        </motion.div>

        {/* Contact Support Section */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
            <CardHeader className="py-5 px-6 border-b border-border/20">
              <CardTitle className="text-lg font-playfair text-white">Nadal potrzebujesz pomocy?</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                Skontaktuj się z naszym zespołem wsparcia. Pomagamy klientom w rozwiązywaniu spraw.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Wiadomość */}
                <Link href="/panel-klienta/wiadomosci" className="group">
                  <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-border/30 bg-zinc-950/20 hover:bg-[#0da192]/5 hover:border-[#0da192]/40 transition-all duration-300 h-full justify-between">
                    <div className="h-12 w-12 rounded-xl bg-[#0da192]/10 border border-[#0da192]/20 flex items-center justify-center text-[#0da192] group-hover:scale-110 group-hover:bg-[#0da192]/20 transition-all mb-4">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white text-sm group-hover:text-[#0da192] transition-colors">Wewnętrzny czat</h4>
                      <p className="text-zinc-500 text-xs leading-relaxed font-light">
                        Napisz do nas bezpośrednio z panelu klienta/eksperta.
                      </p>
                    </div>
                    <Button variant="link" className="text-[#0da192] hover:text-[#0fbaa8] text-xs font-semibold gap-1 mt-4 p-0">
                      Otwórz wiadomości &rarr;
                    </Button>
                  </div>
                </Link>

                {/* Email */}
                <a href="mailto:pomoc@prosta-sprawa.pl" className="group">
                  <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-border/30 bg-zinc-950/20 hover:bg-[#d7b56d]/5 hover:border-[#d7b56d]/40 transition-all duration-300 h-full justify-between">
                    <div className="h-12 w-12 rounded-xl bg-[#d7b56d]/10 border border-[#d7b56d]/20 flex items-center justify-center text-[#d7b56d] group-hover:scale-110 group-hover:bg-[#d7b56d]/20 transition-all mb-4">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white text-sm group-hover:text-[#d7b56d] transition-colors">Wyślij e-mail</h4>
                      <p className="text-zinc-500 text-xs leading-relaxed font-light">
                        Napisz wiadomość e-mail. Pomożemy w ciągu kilku godzin.
                      </p>
                    </div>
                    <Button variant="link" className="text-[#d7b56d] hover:text-[#e5c47f] text-xs font-semibold gap-1 mt-4 p-0">
                      pomoc@prosta-sprawa.pl
                    </Button>
                  </div>
                </a>

                {/* Telefon */}
                <a href="tel:+48123456789" className="group">
                  <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-border/30 bg-zinc-950/20 hover:bg-[#0da192]/5 hover:border-[#0da192]/40 transition-all duration-300 h-full justify-between">
                    <div className="h-12 w-12 rounded-xl bg-[#0da192]/10 border border-[#0da192]/20 flex items-center justify-center text-[#0da192] group-hover:scale-110 group-hover:bg-[#0da192]/20 transition-all mb-4">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white text-sm group-hover:text-[#0da192] transition-colors">Zadzwoń do nas</h4>
                      <p className="text-zinc-500 text-xs leading-relaxed font-light">
                        Infolinia czynna od poniedziałku do piątku w godz. 9:00 - 17:00.
                      </p>
                    </div>
                    <Button variant="link" className="text-[#0da192] hover:text-[#0fbaa8] text-xs font-semibold gap-1 mt-4 p-0">
                      +48 123 456 789
                    </Button>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
