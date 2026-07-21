"use client"

import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/sonner"
import { ChevronLeft, Plus, Trash2, GripVertical, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Option = { tresc: string }
type Question = { tresc: string; typ: "SINGLE" | "MULTIPLE"; opcje: Option[] }

const emptyQuestion = (): Question => ({
  tresc: "",
  typ: "SINGLE",
  opcje: [{ tresc: "" }, { tresc: "" }],
})

export default function NowaAnkietaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tytul, setTytul] = useState("")
  const [opis, setOpis] = useState("")
  const [nagrodaPunktow, setNagrodaPunktow] = useState(10)
  const [pytania, setPytania] = useState<Question[]>([emptyQuestion()])

  const updateQuestion = (qi: number, updates: Partial<Question>) => {
    setPytania((prev) => prev.map((q, i) => (i === qi ? { ...q, ...updates } : q)))
  }

  const addOption = (qi: number) => {
    setPytania((prev) =>
      prev.map((q, i) => i === qi ? { ...q, opcje: [...q.opcje, { tresc: "" }] } : q)
    )
  }

  const updateOption = (qi: number, oi: number, tresc: string) => {
    setPytania((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, opcje: q.opcje.map((o, j) => (j === oi ? { tresc } : o)) }
          : q
      )
    )
  }

  const removeOption = (qi: number, oi: number) => {
    setPytania((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, opcje: q.opcje.filter((_, j) => j !== oi) } : q
      )
    )
  }

  const removeQuestion = (qi: number) => {
    setPytania((prev) => prev.filter((_, i) => i !== qi))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tytul.trim()) { toast.error("Podaj tytuł ankiety"); return }
    for (const [qi, q] of pytania.entries()) {
      if (!q.tresc.trim()) { toast.error(`Pytanie ${qi + 1}: brak treści`); return }
      if (q.opcje.filter((o) => o.tresc.trim()).length < 2) {
        toast.error(`Pytanie ${qi + 1}: minimum 2 opcje`)
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/ankiety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tytul,
          opis: opis || null,
          nagrodaPunktow,
          pytania: pytania.map((q) => ({
            ...q,
            opcje: q.opcje.filter((o) => o.tresc.trim()),
          })),
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Ankieta została utworzona")
      router.push("/admin/ankiety")
      router.refresh()
    } catch {
      toast.error("Błąd podczas tworzenia ankiety")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <AdminHeaderSetter title="Nowa ankieta" subtitle="Utwórz ankietę dla ekspertów" />

      <Link href="/admin/ankiety">
        <Button variant="ghost" size="sm" className="mb-2">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Wróć do listy
        </Button>
      </Link>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Podstawowe dane */}
        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="font-semibold text-lg">Podstawowe informacje</h2>

          <div className="space-y-2">
            <Label>Tytuł ankiety *</Label>
            <Input
              value={tytul}
              onChange={(e) => setTytul(e.target.value)}
              placeholder="np. Jak pozyskujesz klientów?"
            />
          </div>

          <div className="space-y-2">
            <Label>Opis (opcjonalny)</Label>
            <Textarea
              value={opis}
              onChange={(e) => setOpis(e.target.value)}
              placeholder="Krótki opis ankiety widoczny dla ekspertów"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Nagroda za wypełnienie (pkt)</Label>
            <Input
              type="number"
              min={0}
              value={nagrodaPunktow}
              onChange={(e) => setNagrodaPunktow(Number(e.target.value))}
              className="w-32"
            />
          </div>
        </div>

        {/* Pytania */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Pytania</h2>

          {pytania.map((q, qi) => (
            <div key={qi} className="rounded-lg border p-5 space-y-4 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Pytanie {qi + 1} *</Label>
                  <Textarea
                    value={q.tresc}
                    onChange={(e) => updateQuestion(qi, { tresc: e.target.value })}
                    placeholder="Treść pytania"
                    rows={2}
                  />
                </div>
                <div className="space-y-2 w-48 shrink-0">
                  <Label>Typ</Label>
                  <Select
                    value={q.typ}
                    onValueChange={(v) => updateQuestion(qi, { typ: v as "SINGLE" | "MULTIPLE" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Jednokrotny</SelectItem>
                      <SelectItem value="MULTIPLE">Wielokrotny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {pytania.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive mt-6 shrink-0"
                    onClick={() => removeQuestion(qi)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Opcje odpowiedzi</Label>
                {q.opcje.map((o, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <Input
                      value={o.tresc}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      placeholder={`Opcja ${oi + 1}`}
                    />
                    {q.opcje.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeOption(qi, oi)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(qi)}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Dodaj opcję
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => setPytania((prev) => [...prev, emptyQuestion()])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Dodaj pytanie
          </Button>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Zapisywanie..." : "Utwórz ankietę"}
          </Button>
          <Link href="/admin/ankiety">
            <Button type="button" variant="outline">Anuluj</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
