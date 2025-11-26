"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowRight, Sparkles, Trophy, Info } from "lucide-react"

interface LawFirm {
  id: string
  nazwa: string
  pozycjaRanking: number | null
  punktySaldo: number
  mainCategoryName?: string
}

interface Competitor {
  id: string
  nazwa: string
  pozycjaRanking: number | null
}

export default function RankingBoostPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [points, setPoints] = useState(0)
  const [currentRank, setCurrentRank] = useState(0)
  const [newRank, setNewRank] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return
      try {
        const response = await fetch("/api/law-firms/ranking-boost")
        if (!response.ok) throw new Error("Nie udało się pobrać danych")
        const data = await response.json()
        setLawFirm(data.lawFirm)
        setCompetitors(data.competitors)
      } catch (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych rankingu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [session, toast])

  useEffect(() => {
    if (!lawFirm) return

    const allFirms = [...competitors, { ...lawFirm, pozycjaRanking: lawFirm.pozycjaRanking ?? 0 }]
      .sort((a, b) => (b.pozycjaRanking ?? 0) - (a.pozycjaRanking ?? 0))

    const rank = allFirms.findIndex(f => f.id === lawFirm.id) + 1
    setCurrentRank(rank)

    const newRankingScore = (lawFirm.pozycjaRanking ?? 0) + points
    const newAllFirms = [...competitors, { ...lawFirm, pozycjaRanking: newRankingScore }]
      .sort((a, b) => (b.pozycjaRanking ?? 0) - (a.pozycjaRanking ?? 0))

    const newCalculatedRank = newAllFirms.findIndex(f => f.id === lawFirm.id) + 1
    setNewRank(newCalculatedRank)
  }, [lawFirm, competitors, points])

  const handleBoost = async () => {
    if (!lawFirm) return
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/law-firms/ranking-boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się podnieść rankingu")
      }

      const updatedLawFirm = await response.json()
      setLawFirm(updatedLawFirm)
      setPoints(0)
      toast({
        title: "Sukces",
        description: "Twój ranking został pomyślnie zaktualizowany.",
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!lawFirm) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Nie udało się załadować danych kancelarii.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zwiększ swoją pozycję w rankingu</CardTitle>
          <CardDescription>
            Zwiększ swoją widoczność w głównej kategorii: <strong>{lawFirm.mainCategoryName}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                  <span>Obecna pozycja</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold">#{currentRank}</p>
                <p className="text-muted-foreground">
                  z {lawFirm.pozycjaRanking ?? 0} punktami rankingu
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Potencjalna pozycja</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold">#{newRank}</p>
                <p className="text-muted-foreground">
                  z {(lawFirm.pozycjaRanking ?? 0) + points} punktami rankingu
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium">Punkty do wydania</label>
                <span className="font-bold">{points}</span>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  value={[points]}
                  onValueChange={(value) => setPoints(value[0])}
                  max={lawFirm.punktySaldo}
                  step={10}
                />
                <Input
                  type="number"
                  className="w-24"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  max={lawFirm.punktySaldo}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Masz dostępnych <strong>{lawFirm.punktySaldo}</strong> punktów.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="lg" className="w-full" disabled={points <= 0 || isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Zwiększ pozycję za {points} punktów
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Czy jesteś pewien?</AlertDialogTitle>
                  <AlertDialogDescription>
                    To spowoduje odjęcie <strong>{points} punktów</strong> z Twojego salda i zaktualizuje
                    Twój wynik w rankingu do <strong>{(lawFirm.pozycjaRanking ?? 0) + points}</strong>. Ta akcja jest nieodwracalna.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBoost}>Potwierdź</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ranking konkurencji</CardTitle>
          <CardDescription>
            Zobacz, jak wypadasz na tle innych w Twojej głównej kategorii.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pozycja</TableHead>
                <TableHead>Kancelaria</TableHead>
                <TableHead className="text-right">Punkty rankingu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...competitors, { ...lawFirm, pozycjaRanking: (lawFirm.pozycjaRanking ?? 0) + points }]
                .sort((a, b) => (b.pozycjaRanking ?? 0) - (a.pozycjaRanking ?? 0))
                .map((firm, index) => (
                  <TableRow key={firm.id} className={firm.id === lawFirm.id ? "bg-primary/10" : ""}>
                    <TableCell className="font-bold">#{index + 1}</TableCell>
                    <TableCell>{firm.nazwa} {firm.id === lawFirm.id && "(Ty)"}</TableCell>
                    <TableCell className="text-right">{firm.pozycjaRanking ?? 0}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
