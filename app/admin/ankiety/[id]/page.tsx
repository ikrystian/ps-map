import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { db } from "@/lib/db"
import { ChevronLeft, Coins, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function AnkietaWynikiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const survey = await db.survey.findUnique({
    where: { id },
    include: {
      pytania: {
        orderBy: { kolejnosc: "asc" },
        include: {
          opcje: { orderBy: { kolejnosc: "asc" } },
          odpowiedzi: { include: { option: true } },
        },
      },
      _count: { select: { odpowiedzi: true } },
    },
  })

  if (!survey) notFound()

  const totalResponses = survey._count.odpowiedzi

  return (
    <div className="space-y-6 max-w-4xl">
      <AdminHeaderSetter
        title={survey.tytul}
        subtitle="Wyniki ankiety"
      />

      <div className="flex items-center gap-3">
        <Link href="/admin/ankiety">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Wróć
          </Button>
        </Link>
        <Badge variant={survey.aktywna ? "default" : "secondary"}>
          {survey.aktywna ? "Aktywna" : "Nieaktywna"}
        </Badge>
      </div>

      {/* Podsumowanie */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4 space-y-1">
          <div className="text-sm text-muted-foreground">Wypełnień</div>
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Users className="h-5 w-5 text-primary" />
            {totalResponses}
          </div>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <div className="text-sm text-muted-foreground">Pytań</div>
          <div className="text-2xl font-bold">{survey.pytania.length}</div>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <div className="text-sm text-muted-foreground">Nagroda</div>
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Coins className="h-5 w-5 text-yellow-500" />
            {survey.nagrodaPunktow} pkt
          </div>
        </div>
      </div>

      {/* Wyniki per pytanie */}
      {totalResponses === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Brak odpowiedzi — nikt jeszcze nie wypełnił tej ankiety.
        </div>
      ) : (
        <div className="space-y-6">
          {survey.pytania.map((question, qi) => {
            const totalAnswers = question.typ === "SINGLE" ? totalResponses : question.odpowiedzi.length

            const optionCounts = question.opcje.map((option) => ({
              tresc: option.tresc,
              count: question.odpowiedzi.filter((a) => a.optionId === option.id).length,
            }))

            return (
              <div key={question.id} className="rounded-lg border p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium">
                    {qi + 1}. {question.tresc}
                  </h3>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {question.typ === "SINGLE" ? "Jednokrotny" : "Wielokrotny"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {optionCounts
                    .sort((a, b) => b.count - a.count)
                    .map((opt) => {
                      const pct = totalAnswers > 0 ? Math.round((opt.count / totalAnswers) * 100) : 0
                      return (
                        <div key={opt.tresc} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{opt.tresc}</span>
                            <span className="text-muted-foreground font-medium">
                              {opt.count} ({pct}%)
                            </span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      )
                    })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
