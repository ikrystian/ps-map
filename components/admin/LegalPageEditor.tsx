"use client"

import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import type { LegalPageContent, LegalPageSlug } from "@/lib/legal-pages/types"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface EditorSection {
  id: string
  number: string
  title: string
  paragraphsText: string
}

interface EditorDefinition {
  term: string
  desc: string
}

interface LegalPageEditorProps {
  slug: LegalPageSlug
  pageName: string
  publicPath: string
  /** Czy pokazywać pole „Data ostatniej aktualizacji” (stopka polityki prywatności) */
  showLastUpdated?: boolean
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/ź|ż/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export default function LegalPageEditor({
  slug,
  pageName,
  publicPath,
  showLastUpdated = false,
}: LegalPageEditorProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [isCustomized, setIsCustomized] = useState(false)

  const [heroTitle, setHeroTitle] = useState("")
  const [heroSubtitle, setHeroSubtitle] = useState("")
  const [lastUpdated, setLastUpdated] = useState("")
  const [definitions, setDefinitions] = useState<EditorDefinition[]>([])
  const [sections, setSections] = useState<EditorSection[]>([])

  const applyContent = (content: LegalPageContent) => {
    setHeroTitle(content.heroTitle)
    setHeroSubtitle(content.heroSubtitle)
    setLastUpdated(content.lastUpdated || "")
    setDefinitions(content.definitions.map(def => ({ ...def })))
    setSections(
      content.sections.map(section => ({
        id: section.id,
        number: section.number,
        title: section.title,
        paragraphsText: section.paragraphs.join("\n"),
      }))
    )
  }

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/legal-pages/${slug}`)
        if (!response.ok) {
          throw new Error("Failed to fetch legal page content")
        }
        const data = await response.json()
        applyContent(data.content)
        setIsCustomized(data.isCustomized)
      } catch (error) {
        console.error("Error fetching legal page content:", error)
        toast.error("Błąd podczas pobierania treści strony")
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [slug])

  const buildContent = (): LegalPageContent | null => {
    const usedIds = new Set<string>()
    const builtSections = sections.map((section, index) => {
      let id = section.id.trim() || slugify(section.title) || `sekcja-${index + 1}`
      while (usedIds.has(id)) id = `${id}-2`
      usedIds.add(id)

      return {
        id,
        number: section.number.trim(),
        title: section.title.trim(),
        paragraphs: section.paragraphsText
          .split("\n")
          .map(paragraph => paragraph.trim())
          .filter(Boolean),
      }
    })

    const invalidIndex = builtSections.findIndex(
      section => !section.title || section.paragraphs.length === 0
    )
    if (invalidIndex !== -1) {
      toast.error(`Rozdział ${invalidIndex + 1} musi mieć tytuł i co najmniej jeden akapit`)
      return null
    }
    if (builtSections.length === 0) {
      toast.error("Strona musi zawierać co najmniej jeden rozdział")
      return null
    }

    return {
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim(),
      ...(showLastUpdated && lastUpdated.trim() ? { lastUpdated: lastUpdated.trim() } : {}),
      definitions: definitions
        .map(def => ({ term: def.term.trim(), desc: def.desc.trim() }))
        .filter(def => def.term && def.desc),
      sections: builtSections,
    }
  }

  const handleSave = async () => {
    const content = buildContent()
    if (!content) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/legal-pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save legal page content")
      }

      const data = await response.json()
      applyContent(data.content)
      setIsCustomized(true)
      toast.success("Treść strony została zapisana")
    } catch (error) {
      console.error("Error saving legal page content:", error)
      toast.error(error instanceof Error ? error.message : "Błąd podczas zapisywania treści")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm(`Czy na pewno chcesz usunąć treść strony „${pageName}”? Strona przestanie być wyświetlana publicznie.`)) {
      return
    }

    try {
      setResetting(true)
      const response = await fetch(`/api/admin/legal-pages/${slug}`, { method: "DELETE" })
      if (!response.ok) {
        throw new Error("Failed to reset legal page content")
      }
      const data = await response.json()
      applyContent(data.content)
      setIsCustomized(false)
      toast.success("Treść strony została usunięta")
    } catch (error) {
      console.error("Error resetting legal page content:", error)
      toast.error("Błąd podczas usuwania treści strony")
    } finally {
      setResetting(false)
    }
  }

  const updateSection = (index: number, patch: Partial<EditorSection>) => {
    setSections(prev => prev.map((section, i) => (i === index ? { ...section, ...patch } : section)))
  }

  const moveSection = (index: number, direction: -1 | 1) => {
    setSections(prev => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const removeSection = (index: number) => {
    if (!confirm(`Usunąć rozdział „${sections[index]?.title || index + 1}”?`)) return
    setSections(prev => prev.filter((_, i) => i !== index))
  }

  const addSection = () => {
    setSections(prev => [
      ...prev,
      { id: "", number: `${prev.length + 1}`, title: "", paragraphsText: "" },
    ])
  }

  const updateDefinition = (index: number, patch: Partial<EditorDefinition>) => {
    setDefinitions(prev => prev.map((def, i) => (i === index ? { ...def, ...patch } : def)))
  }

  const removeDefinition = (index: number) => {
    setDefinitions(prev => prev.filter((_, i) => i !== index))
  }

  const addDefinition = () => {
    setDefinitions(prev => [...prev, { term: "", desc: "" }])
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter
        title={pageName}
        subtitle={`Edycja treści strony ${publicPath} — układ graficzny strony pozostaje bez zmian`}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="text-sm text-muted-foreground">
            {isCustomized ? (
              <span>Treść jest opublikowana</span>
            ) : (
              <span>Brak treści (strona nie jest wyświetlana publicznie)</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href={publicPath} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Podgląd strony
            </Button>
          </a>
          {isCustomized && (
            <Button variant="outline" onClick={handleReset} disabled={resetting || saving} className="text-destructive hover:text-destructive">
              {resetting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Usuń treść strony
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving || resetting}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Zapisywanie..." : "Zapisz treść"}
          </Button>
        </div>
      </div>

      {/* Hero */}
      <Card>
        <CardHeader>
          <CardTitle>Nagłówek strony</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-title">Tytuł</Label>
            <Input
              id="hero-title"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder={pageName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-subtitle">Podtytuł</Label>
            <Textarea
              id="hero-subtitle"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={2}
              placeholder="Krótki opis widoczny pod tytułem strony"
            />
          </div>
          {showLastUpdated && (
            <div className="space-y-2">
              <Label htmlFor="last-updated">Data ostatniej aktualizacji</Label>
              <Input
                id="last-updated"
                value={lastUpdated}
                onChange={(e) => setLastUpdated(e.target.value)}
                placeholder="np. 22 czerwca 2026 r."
              />
              <p className="text-xs text-muted-foreground">
                Wyświetlana w stopce dokumentu. Pozostaw puste, aby ukryć.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Definitions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Słownik pojęć</CardTitle>
          <Button variant="outline" size="sm" onClick={addDefinition}>
            <Plus className="mr-2 h-4 w-4" />
            Dodaj pojęcie
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {definitions.length === 0 && (
            <p className="text-sm text-muted-foreground">Brak pojęć w słowniku.</p>
          )}
          {definitions.map((definition, index) => (
            <div key={index} className="flex gap-3 items-start rounded-lg border border-border p-4">
              <div className="flex-1 space-y-3">
                <Input
                  value={definition.term}
                  onChange={(e) => updateDefinition(index, { term: e.target.value })}
                  placeholder="Pojęcie (np. Administrator)"
                />
                <Textarea
                  value={definition.desc}
                  onChange={(e) => updateDefinition(index, { desc: e.target.value })}
                  rows={3}
                  placeholder="Opis pojęcia"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => removeDefinition(index)}
                title="Usuń pojęcie"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Rozdziały dokumentu</CardTitle>
          <Button variant="outline" size="sm" onClick={addSection}>
            <Plus className="mr-2 h-4 w-4" />
            Dodaj rozdział
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex gap-3 items-center flex-wrap">
                <Input
                  value={section.number}
                  onChange={(e) => updateSection(index, { number: e.target.value })}
                  placeholder="Nr"
                  className="w-20"
                  title="Numer rozdziału (np. I, II, III)"
                />
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(index, { title: e.target.value })}
                  placeholder="Tytuł rozdziału"
                  className="flex-1 min-w-48"
                />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSection(index, -1)}
                    disabled={index === 0}
                    title="Przenieś wyżej"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSection(index, 1)}
                    disabled={index === sections.length - 1}
                    title="Przenieś niżej"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeSection(index)}
                    title="Usuń rozdział"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={section.paragraphsText}
                onChange={(e) => updateSection(index, { paragraphsText: e.target.value })}
                rows={Math.min(14, Math.max(4, section.paragraphsText.split("\n").length + 1))}
                placeholder="Treść rozdziału — każdy akapit w osobnej linii"
                className="text-sm"
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Każdy akapit wpisz w osobnej linii.
            {slug === "polityka-prywatnosci" &&
              " Linie zaczynające się od „•” zostaną wyświetlone jako punkty listy."}
          </p>
        </CardContent>
      </Card>

      {/* Sticky Actions Bar */}
      <div className="sticky bottom-4 left-0 right-0 z-20 bg-background/90 backdrop-blur border border-border p-4 rounded-xl flex justify-end items-center gap-3 shadow-lg">
        <Link href="/admin/pages">
          <Button type="button" variant="outline" className="h-9">
            Anuluj
          </Button>
        </Link>
        <Button onClick={handleSave} disabled={saving || resetting} className="h-9 font-semibold px-5">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Zapisz treść
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
