"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  Calendar,
  Eye,
  MapPin,
  Tag,
  BookOpen
} from "lucide-react"
import type { BlogCategory } from "@/types"

interface BlogPostPreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  tytul: string
  tresc: string
  obrazekWyrozniajacy?: string
  categoryId?: string
  categories: BlogCategory[]
  isSponsored?: boolean
  sponsoredLawFirmId?: string
  sponsoredLawFirmName?: string
  authorName?: string
}

export function BlogPostPreviewDialog({
  isOpen,
  onClose,
  tytul,
  tresc,
  obrazekWyrozniajacy,
  categoryId,
  categories,
  isSponsored = false,
  sponsoredLawFirmId,
  sponsoredLawFirmName,
  authorName = "Redakcja",
}: BlogPostPreviewDialogProps) {
  // Find selected category name
  const selectedCategory = React.useMemo(() => {
    if (!categoryId || !categories) return null
    
    // Recursively find category in flat or nested structure
    const findCategory = (list: BlogCategory[]): BlogCategory | null => {
      for (const cat of list) {
        if (cat.id === categoryId) return cat
        if (cat.children && cat.children.length > 0) {
          const found = findCategory(cat.children)
          if (found) return found
        }
      }
      return null
    }
    
    return findCategory(categories)
  }, [categoryId, categories])

  // Calculate estimated reading time
  const estimatedReadingTime = React.useMemo(() => {
    if (!tresc) return 0
    const plainText = tresc.replace(/<[^>]*>/g, "")
    const wordCount = plainText.trim().split(/\s+/).length
    return Math.ceil(wordCount / 200)
  }, [tresc])

  const currentDateFormatted = React.useMemo(() => {
    return new Date().toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-border/80 text-foreground selection:bg-primary/30 selection:text-primary-foreground shadow-2xl">
        <DialogHeader className="p-4 border-b border-border bg-background flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-sm font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Podgląd wpisu (Aesthetic Live View)
          </DialogTitle>
          <div className="text-xs text-muted-foreground mr-8 font-light italic">
            To jest symulacja rzeczywistego wyglądu artykułu na blogu
          </div>
        </DialogHeader>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-background">
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/5 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[280px] h-[280px] rounded-full bg-teal-500/3 blur-[90px] pointer-events-none" />

          {/* Hero Banner / Image */}
          {obrazekWyrozniajacy ? (
            <div className="on-dark relative h-[40vh] min-h-[300px] w-full overflow-hidden bg-background">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${obrazekWyrozniajacy})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-background" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-0 right-0 px-6 md:px-12 z-10">
                <div className="max-w-4xl">
                  {/* Category & Tags & Sponsored Badge */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Blog
                    </span>
                    <span className="text-neutral-600 text-xs">/</span>
                    {selectedCategory && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border border-primary/20 text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5"
                      >
                        {selectedCategory.nazwa}
                      </Badge>
                    )}
                    {isSponsored && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 animate-pulse"
                      >
                        Sponsorowany
                      </Badge>
                    )}
                  </div>

                  <h1 className="font-playfair text-2xl md:text-4xl font-bold text-foreground tracking-tight leading-tight mb-4">
                    {tytul || "Tytuł artykułu"}
                  </h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative border-b border-border bg-gradient-to-br from-background via-background to-background py-12 px-6 md:px-12 overflow-hidden">
              <div className="max-w-4xl relative z-10">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Blog
                  </span>
                  <span className="text-neutral-600 text-xs">/</span>
                  {selectedCategory && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border border-primary/20 text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5"
                    >
                      {selectedCategory.nazwa}
                    </Badge>
                  )}
                  {isSponsored && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5"
                    >
                      Sponsorowany
                    </Badge>
                  )}
                </div>

                <h1 className="font-playfair text-2xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight mb-4">
                  {tytul || "Tytuł artykułu"}
                </h1>
              </div>
            </div>
          )}

          {/* Metadata bar */}
          <div className="px-6 md:px-12 py-4 bg-background border-y border-border/60 flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-muted-foreground">
            {/* Author Info */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-primary/80 font-semibold text-[10px]">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-foreground">
                {isSponsored && sponsoredLawFirmName ? sponsoredLawFirmName : authorName}
              </span>
            </div>

            <div className="w-1 h-1 rounded-full bg-muted hidden sm:block" />

            {/* Date */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary/80" />
              <span>{currentDateFormatted}</span>
            </div>

            <div className="w-1 h-1 rounded-full bg-muted hidden sm:block" />

            {/* Views Mock */}
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary/80" />
              <span>0 wyświetleń</span>
            </div>

            {estimatedReadingTime > 0 && (
              <>
                <div className="w-1 h-1 rounded-full bg-muted hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary/80" />
                  <span>{estimatedReadingTime} min czytania</span>
                </div>
              </>
            )}
          </div>

          {/* Main Layout Grid */}
          <div className="px-6 md:px-12 py-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left/Center Column: Article Body */}
              <div className="lg:col-span-2 space-y-6">
                <article className="bg-card/40 border border-border/60 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
                  {tresc ? (
                    <div
                      className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-playfair prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-white prose-p:text-foreground/80 dark:prose-p:text-neutral-350 prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-foreground/80 prose-img:rounded-2xl prose-img:shadow-2xl prose-li:text-foreground/80"
                      dangerouslySetInnerHTML={{ __html: tresc }}
                    />
                  ) : (
                    <p className="text-muted-foreground italic text-center py-12">
                      Treść artykułu jest pusta. Wprowadź zawartość w edytorze.
                    </p>
                  )}
                </article>

                {/* Sponsored Partner Card */}
                {isSponsored && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#1f1a0e]/60 to-background border border-amber-500/20 rounded-3xl p-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                      <div className="w-16 h-16 rounded-xl bg-background flex items-center justify-center border border-amber-500/20 shadow-md">
                        <Building2 className="w-8 h-8 text-amber-500/60" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase tracking-wider font-semibold mb-1">
                          Partner merytoryczny publikacji
                        </Badge>
                        <h3 className="font-playfair text-lg font-bold text-foreground mb-2">
                          {sponsoredLawFirmName || "Wybrany ekspert (nieokreślony)"}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {sponsoredLawFirmName 
                            ? `Publikacja sponsorowana przez ${sponsoredLawFirmName}. Zapraszamy do zapoznania się z ofertą eksperta.`
                            : "Ten wpis jest oznaczony jako sponsorowany, ale nie przypisano do niego konkretnego eksperta."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Mini Sidebar Info */}
              <aside className="lg:col-span-1 space-y-6">
                {/* About Author Card */}
                <div className="bg-card/60 border border-border/60 rounded-3xl p-5 shadow-md relative overflow-hidden">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Autor wpisu
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-primary">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground text-sm">
                        {isSponsored && sponsoredLawFirmName ? sponsoredLawFirmName : authorName}
                      </h5>
                      <p className="text-[10px] text-muted-foreground">
                        {isSponsored ? "Partner portalu" : "Autor portalu"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-background/40 border border-border/40 rounded-3xl p-5 text-xs text-muted-foreground space-y-2">
                  <div className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                    Status podglądu
                  </div>
                  <p>
                    Ten widok prezentuje responsywny układ strony docelowej bloga. Niektóre interaktywne funkcje i linki mogą być nieaktywne w tym trybie.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-background flex justify-end shrink-0">
          <Button
            type="button"
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 rounded-xl text-sm"
          >
            Zamknij podgląd
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
