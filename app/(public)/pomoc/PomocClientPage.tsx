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
import { cn } from "@/lib/utils"
import type { PublicHelpCategory } from "@/lib/help"
import { motion } from "framer-motion"
import { Check, HelpCircle, Link as LinkIcon, Mail, MessageSquare, Phone, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

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

interface PomocClientPageProps {
  categories: PublicHelpCategory[]
}

export default function PomocClientPage({ categories }: PomocClientPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyLink = (questionId: string, slug: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(questionId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredQuestions = categories.flatMap((category) =>
    category.questions
      .filter((question) => {
        const matchesSearch =
          searchQuery === "" ||
          question.pytanie.toLowerCase().includes(searchQuery.toLowerCase()) ||
          question.odpowiedz.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory = selectedCategory === "all" || category.id === selectedCategory

        return matchesSearch && matchesCategory
      })
      .map((question) => ({ ...question, categoryName: category.nazwa }))
  )

  const availableCategories = [
    { id: "all", nazwa: "Wszystkie" },
    ...categories,
  ]

  return (
    <div className="relative container mx-auto px-4 py-12 md:py-16">
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center mb-10 relative z-10">
        <h1 className="text-3xl md:text-5xl font-playfair text-foreground mb-4">Centrum pomocy</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące korzystania z Prosta Sprawa.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-6 relative z-10"
      >
        {/* Search Bar */}
        <motion.div variants={itemVariants}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-5 w-5" />
            <Input
              placeholder="Czego potrzebujesz? Wpisz słowo kluczowe..."
              className="pl-12 h-14 bg-background/40 border-border/30 rounded-md text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/60 transition-all text-base shadow-lg shadow-black/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 justify-center">
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
                    ? "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-hover hover:to-primary text-white border-transparent shadow-md"
                    : "bg-card/40 border-border/30 text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                {category.nazwa}
              </Button>
            )
          })}
        </motion.div>

        {/* FAQ Accordion Section */}
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="rounded-lg shadow-lg relative overflow-hidden">
            <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={8} borderWidth={1} />
            <CardHeader className="border-b border-border/20 py-5 px-6">
              <CardTitle className="text-lg font-playfair text-foreground">Najczęstsze pytania i odpowiedzi</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                {selectedCategory === "all"
                  ? "Przeglądaj wszystkie tematy pomocy"
                  : `Pytania z kategorii: ${categories.find((c) => c.id === selectedCategory)?.nazwa}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                  <div className="h-14 w-14 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-muted-foreground animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Brak wyników</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-light">
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
                      className="border border-border/10 bg-background/15 rounded-md px-4 overflow-hidden transition-all hover:border-primary/20"
                    >
                      <AccordionTrigger className="hover:no-underline py-4 text-sm font-medium text-foreground hover:text-foreground transition-colors">
                        <div className="flex items-start gap-3.5 text-left">
                          <HelpCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5 transition-transform duration-300" />
                          <div className="min-w-0">
                            <span className="leading-snug">{question.pytanie}</span>
                            <div className="mt-1">
                              <Badge className="bg-primary/10 text-primary border border-primary/20 text-sm font-medium py-0 px-2 rounded-md">
                                {question.categoryName}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="border-t border-border/5 pt-4 pb-4">
                        <div className="pl-8 space-y-4">
                          <div
                            className="text-foreground/80 text-sm leading-relaxed font-light prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-a:text-primary prose-strong:text-foreground prose-strong:font-semibold"
                            dangerouslySetInnerHTML={{ __html: question.odpowiedz }}
                          />
                          <div className="flex items-center gap-2 pt-3 border-t border-border/5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyLink(question.id, question.slug)}
                              className="h-8 px-3 rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:bg-foreground/5 hover:border-border/80 transition-all text-xs gap-1.5"
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
          <Card variant="glass" className="rounded-lg shadow-lg relative overflow-hidden">
            <CardHeader className="py-5 px-6 border-b border-border/20">
              <CardTitle className="text-lg font-playfair text-foreground">Nadal potrzebujesz pomocy?</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Skontaktuj się z naszym zespołem wsparcia. Odpowiadamy zwykle w ciągu 24 h.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Formularz kontaktowy */}
                <Link href="/kontakt" className="group">
                  <div className="flex flex-col items-center text-center p-5 rounded-lg border border-border/30 bg-background/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 h-full justify-between">
                    <div className="h-12 w-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all mb-4">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">Formularz kontaktowy</h4>
                      <p className="text-muted-foreground text-xs leading-relaxed font-light">
                        Napisz do nas, korzystając z formularza na stronie kontaktowej.
                      </p>
                    </div>
                    <Button variant="link" className="text-primary hover:text-primary-hover text-xs font-semibold gap-1 mt-4 p-0">
                      Przejdź do kontaktu &rarr;
                    </Button>
                  </div>
                </Link>

                {/* Email */}
                <a href="mailto:bok@prostasprawa.pl" className="group">
                  <div className="flex flex-col items-center text-center p-5 rounded-lg border border-border/30 bg-background/20 hover:bg-secondary/5 hover:border-secondary/40 transition-all duration-300 h-full justify-between">
                    <div className="h-12 w-12 rounded-md bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 group-hover:bg-secondary/20 transition-all mb-4">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground text-sm group-hover:text-secondary transition-colors">Wyślij e-mail</h4>
                      <p className="text-muted-foreground text-xs leading-relaxed font-light">
                        Napisz wiadomość e-mail. Pomożemy w ciągu kilku godzin.
                      </p>
                    </div>
                    <Button variant="link" className="text-secondary hover:text-secondary-hover text-xs font-semibold gap-1 mt-4 p-0">
                      bok@prostasprawa.pl
                    </Button>
                  </div>
                </a>

                {/* Telefon */}
                <a href="tel:+48534888555" className="group">
                  <div className="flex flex-col items-center text-center p-5 rounded-lg border border-border/30 bg-background/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 h-full justify-between">
                    <div className="h-12 w-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all mb-4">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">Zadzwoń do nas</h4>
                      <p className="text-muted-foreground text-xs leading-relaxed font-light">
                        Poniedziałek – piątek 8:00 – 18:00, sobota 9:00 – 14:00.
                      </p>
                    </div>
                    <Button variant="link" className="text-primary hover:text-primary-hover text-xs font-semibold gap-1 mt-4 p-0">
                      +48 534 888 555
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
