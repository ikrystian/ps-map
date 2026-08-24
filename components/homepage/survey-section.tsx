"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { Coins, CheckCircle2, ClipboardList } from "lucide-react"
import { useEffect, useState } from "react"

type Option = { id: string; tresc: string }
type Question = { id: string; tresc: string; typ: "SINGLE" | "MULTIPLE"; opcje: Option[] }
type Survey = {
  id: string
  tytul: string
  opis: string | null
  nagrodaPunktow: number
  pytania: Question[]
  wypelniona: boolean
}

export function SurveySection({ isExpert }: { isExpert: boolean }) {
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})

  useEffect(() => {
    fetch("/api/ankiety/aktywna")
      .then((r) => r.json())
      .then((data) => {
        setSurvey(data)
        if (data?.wypelniona) setDone(true)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !survey) return null

  const toggleOption = (questionId: string, optionId: string, typ: "SINGLE" | "MULTIPLE") => {
    setAnswers((prev) => {
      if (typ === "SINGLE") {
        return { ...prev, [questionId]: [optionId] }
      }
      const current = prev[questionId] ?? []
      const has = current.includes(optionId)
      return {
        ...prev,
        [questionId]: has ? current.filter((id) => id !== optionId) : [...current, optionId],
      }
    })
  }

  const handleSubmit = async () => {
    for (const q of survey.pytania) {
      if (!answers[q.id]?.length) {
        toast.error(`Odpowiedz na pytanie: „${q.tresc.slice(0, 50)}…"`)
        return
      }
    }

    setSubmitting(true)
    try {
      const payload = survey.pytania.map((q) => ({
        questionId: q.id,
        optionIds: answers[q.id] ?? [],
      }))

      const res = await fetch(`/api/ankiety/${survey.id}/odpowiedz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      })

      if (!res.ok) throw new Error()
      setDone(true)
      toast.success(
        survey.nagrodaPunktow > 0
          ? `Dziękujemy! Otrzymałeś ${survey.nagrodaPunktow} punktów.`
          : "Dziękujemy za wypełnienie ankiety!"
      )
    } catch {
      toast.error("Wystąpił błąd podczas wysyłania odpowiedzi")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-16 bg-card border-t border-border/60">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">{survey.tytul}</h2>
        </div>

        {survey.opis && (
          <p className="text-muted-foreground mb-4">{survey.opis}</p>
        )}

        {survey.nagrodaPunktow > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-4 py-1.5 text-sm font-medium mb-6">
            <Coins className="h-4 w-4" />
            Za wypełnienie otrzymasz {survey.nagrodaPunktow} punktów
          </div>
        )}

        {done ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-500" />
            <p className="text-xl font-semibold">Dziękujemy za wypełnienie ankiety!</p>
            {survey.nagrodaPunktow > 0 && (
              <p className="text-muted-foreground">
                Twoje konto zostało zasilone o {survey.nagrodaPunktow} punktów.
              </p>
            )}
          </div>
        ) : !isExpert ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <p className="mb-2 font-medium">Ta ankieta jest przeznaczona dla ekspertów.</p>
            <p className="text-sm">Zaloguj się jako ekspert, aby wziąć udział.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {survey.pytania.map((q, qi) => (
              <div key={q.id} className="space-y-3">
                <p className="font-medium">
                  {qi + 1}. {q.tresc}
                  {q.typ === "MULTIPLE" && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">(wielokrotny)</span>
                  )}
                </p>

                {q.typ === "SINGLE" ? (
                  <RadioGroup
                    value={answers[q.id]?.[0] ?? ""}
                    onValueChange={(v) => toggleOption(q.id, v, "SINGLE")}
                    className="space-y-2"
                  >
                    {q.opcje.map((o) => (
                      <div key={o.id} className="flex items-center space-x-3">
                        <RadioGroupItem value={o.id} id={`${q.id}-${o.id}`} />
                        <Label htmlFor={`${q.id}-${o.id}`} className="cursor-pointer font-normal">
                          {o.tresc}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    {q.opcje.map((o) => (
                      <div key={o.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`${q.id}-${o.id}`}
                          checked={answers[q.id]?.includes(o.id) ?? false}
                          onCheckedChange={() => toggleOption(q.id, o.id, "MULTIPLE")}
                        />
                        <Label htmlFor={`${q.id}-${o.id}`} className="cursor-pointer font-normal">
                          {o.tresc}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Button onClick={handleSubmit} disabled={submitting} size="lg">
              {submitting ? "Wysyłanie..." : "Wyślij odpowiedzi"}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
