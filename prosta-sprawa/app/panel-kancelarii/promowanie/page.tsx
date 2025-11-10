"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  Sparkles,
  Award,
  Home,
  Loader2,
  AlertCircle,
  Coins,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Info,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LawFirm {
  id: string
  nazwa: string
  punktySaldo: number
}

interface Promotion {
  id: string
  typPromocji: string
  czasTrwaniaDni: number
  kategoriaPromocji: string | null
  wojewodztwoPromocji: string | null
  startPromocji: Date
  koniecPromocji: Date
  kosztPunktow: number
  automatyczneOdnowienie: boolean
  aktywna: boolean
  createdAt: Date
}

interface Category {
  id: string
  nazwa: string
}

interface Voivodeship {
  id: string
  nazwa: string
}

// Typy promocji z cenami
const PROMOTION_TYPES = [
  {
    type: "PODBICIE_OGLOSZENIA",
    label: "Podbicie ogłoszenia",
    description: "Twój profil pojawi się wyżej w wynikach wyszukiwania",
    pointsPerDay: 20,
    icon: TrendingUp,
    color: "text-blue-500",
    features: [
      "Wyższa pozycja w wynikach wyszukiwania",
      "Zwiększona widoczność profilu",
      "Oznaczenie jako aktywna kancelaria",
    ],
  },
  {
    type: "WYROZNIENIE",
    label: "Wyróżnienie",
    description: "Twój profil zostanie wyróżniony wizualnie",
    pointsPerWeek: 50,
    icon: Sparkles,
    color: "text-purple-500",
    features: [
      "Kolorowa ramka wokół profilu",
      "Ikona wyróżnienia",
      "Wyższa pozycja niż standardowe profile",
      "Zwiększenie CTR o 30-50%",
    ],
  },
  {
    type: "TOP_LISTA",
    label: "TOP Lista",
    description: "Pojaw się w TOP 3 wyników w swojej kategorii",
    pointsPerWeek: 100,
    icon: Award,
    color: "text-orange-500",
    features: [
      "Gwarantowana pozycja w TOP 3",
      "Specjalne wyróżnienie wizualne",
      "Badge 'TOP Kancelaria'",
      "Priorytetowe wyświetlanie",
      "Zwiększenie CTR o 70-100%",
    ],
  },
  {
    type: "STRONA_GLOWNA",
    label: "Strona główna",
    description: "Wyświetl swój profil na stronie głównej portalu",
    pointsPerWeek: 200,
    icon: Home,
    color: "text-red-500",
    features: [
      "Wyświetlanie na stronie głównej",
      "Maksymalna widoczność",
      "Badge 'Polecana Kancelaria'",
      "Dotarcie do wszystkich użytkowników",
      "Największy wzrost zapytań",
    ],
  },
]

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getPromotionTypeLabel = (type: string) => {
  const promo = PROMOTION_TYPES.find((p) => p.type === type)
  return promo?.label || type
}

const getPromotionStatusBadge = (promotion: Promotion) => {
  const now = new Date()
  const start = new Date(promotion.startPromocji)
  const end = new Date(promotion.koniecPromocji)

  if (start > now) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Zaplanowana
      </Badge>
    )
  }

  if (end < now) {
    return (
      <Badge variant="outline" className="gap-1">
        <XCircle className="h-3 w-3" />
        Zakończona
      </Badge>
    )
  }

  if (promotion.aktywna) {
    return (
      <Badge variant="default" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Aktywna
      </Badge>
    )
  }

  return <Badge variant="destructive">Nieaktywna</Badge>
}

export default function LawFirmPromotionPage() {
  const { data: session } = useSession()
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog nowej promocji
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("")
  const [duration, setDuration] = useState<number>(7)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedVoivodeship, setSelectedVoivodeship] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [autoRenewal, setAutoRenewal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [session])

  const fetchData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      // Pobierz dane kancelarii
      const lawFirmResponse = await fetch("/api/law-firms/me")
      if (!lawFirmResponse.ok) throw new Error("Nie udało się pobrać danych kancelarii")
      const lawFirmData = await lawFirmResponse.json()
      setLawFirm(lawFirmData)

      // Pobierz promocje
      const promotionsResponse = await fetch("/api/promotions")
      if (!promotionsResponse.ok) throw new Error("Nie udało się pobrać promocji")
      const promotionsData = await promotionsResponse.json()
      setPromotions(promotionsData)

      // Pobierz kategorie
      const categoriesResponse = await fetch("/api/categories")
      if (!categoriesResponse.ok) throw new Error("Nie udało się pobrać kategorii")
      const categoriesData = await categoriesResponse.json()
      setCategories(categoriesData)

      // Pobierz województwa
      const voivodeshipsResponse = await fetch("/api/voivodeships")
      if (!voivodeshipsResponse.ok) throw new Error("Nie udało się pobrać województw")
      const voivodeshipsData = await voivodeshipsResponse.json()
      setVoivodeships(voivodeshipsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  const calculateCost = (): number => {
    if (!selectedType) return 0

    const promoType = PROMOTION_TYPES.find((p) => p.type === selectedType)
    if (!promoType) return 0

    if (selectedType === "PODBICIE_OGLOSZENIA") {
      return (promoType.pointsPerDay || 0) * duration
    } else {
      const weeks = Math.ceil(duration / 7)
      return (promoType.pointsPerWeek || 0) * weeks
    }
  }

  const handleSubmit = async () => {
    if (!selectedType || !startDate) {
      setError("Wypełnij wszystkie wymagane pola")
      return
    }

    const cost = calculateCost()
    if (!lawFirm || lawFirm.punktySaldo < cost) {
      setError("Nie masz wystarczającej liczby punktów")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          typPromocji: selectedType,
          czasTrwaniaDni: duration,
          kategoriaPromocji: selectedCategory || null,
          wojewodztwoPromocji: selectedVoivodeship || null,
          startPromocji: new Date(startDate).toISOString(),
          automatyczneOdnowienie: autoRenewal,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się utworzyć promocji")
      }

      // Zamknij dialog i odśwież dane
      setDialogOpen(false)
      resetForm()
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedType("")
    setDuration(7)
    setSelectedCategory("")
    setSelectedVoivodeship("")
    setStartDate("")
    setAutoRenewal(false)
    setError(null)
  }

  const handleOpenDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const activePromotions = promotions.filter((p) => {
    const now = new Date()
    const end = new Date(p.koniecPromocji)
    return p.aktywna && end > now
  })

  const upcomingPromotions = promotions.filter((p) => {
    const now = new Date()
    const start = new Date(p.startPromocji)
    return start > now
  })

  const pastPromotions = promotions.filter((p) => {
    const now = new Date()
    const end = new Date(p.koniecPromocji)
    return end < now || !p.aktywna
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promowanie</h1>
          <p className="text-muted-foreground mt-2">
            Zwiększ widoczność swojego profilu i zdobądź więcej klientów
          </p>
        </div>
        <Button onClick={handleOpenDialog} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Nowa promocja
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stan punktów */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Stan punktów
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{lawFirm?.punktySaldo || 0} pkt</div>
              <p className="text-sm text-muted-foreground mt-1">
                Dostępne punkty do wykorzystania
              </p>
            </div>
            <a href="/panel-kancelarii/punkty">
              <Button variant="outline">Kup punkty</Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Typy promocji */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Dostępne promocje</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {PROMOTION_TYPES.map((promo) => {
            const Icon = promo.icon
            return (
              <Card key={promo.type} className="relative hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-secondary`}>
                        <Icon className={`h-6 w-6 ${promo.color}`} />
                      </div>
                      <div>
                        <CardTitle>{promo.label}</CardTitle>
                        <CardDescription>{promo.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {promo.type === "PODBICIE_OGLOSZENIA"
                          ? `${promo.pointsPerDay} pkt`
                          : `${promo.pointsPerWeek} pkt`}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{" "}
                        {promo.type === "PODBICIE_OGLOSZENIA" ? "dzień" : "tydzień"}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {promo.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedType(promo.type)
                        handleOpenDialog()
                      }}
                    >
                      Wybierz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Lista promocji */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Twoje promocje</h2>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Aktywne ({activePromotions.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Zaplanowane ({upcomingPromotions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Zakończone ({pastPromotions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {activePromotions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Brak aktywnych promocji
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Typ promocji</TableHead>
                        <TableHead>Kategoria/Województwo</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>Koniec</TableHead>
                        <TableHead className="text-right">Koszt</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activePromotions.map((promo) => (
                        <TableRow key={promo.id}>
                          <TableCell className="font-medium">
                            {getPromotionTypeLabel(promo.typPromocji)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Wszystkie"}
                          </TableCell>
                          <TableCell>{formatDate(promo.startPromocji)}</TableCell>
                          <TableCell>{formatDate(promo.koniecPromocji)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {promo.kosztPunktow} pkt
                          </TableCell>
                          <TableCell>{getPromotionStatusBadge(promo)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4">
            {upcomingPromotions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Brak zaplanowanych promocji
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Typ promocji</TableHead>
                        <TableHead>Kategoria/Województwo</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>Koniec</TableHead>
                        <TableHead className="text-right">Koszt</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingPromotions.map((promo) => (
                        <TableRow key={promo.id}>
                          <TableCell className="font-medium">
                            {getPromotionTypeLabel(promo.typPromocji)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Wszystkie"}
                          </TableCell>
                          <TableCell>{formatDate(promo.startPromocji)}</TableCell>
                          <TableCell>{formatDate(promo.koniecPromocji)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {promo.kosztPunktow} pkt
                          </TableCell>
                          <TableCell>{getPromotionStatusBadge(promo)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {pastPromotions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Brak zakończonych promocji
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Typ promocji</TableHead>
                        <TableHead>Kategoria/Województwo</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>Koniec</TableHead>
                        <TableHead className="text-right">Koszt</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastPromotions.map((promo) => (
                        <TableRow key={promo.id}>
                          <TableCell className="font-medium">
                            {getPromotionTypeLabel(promo.typPromocji)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Wszystkie"}
                          </TableCell>
                          <TableCell>{formatDate(promo.startPromocji)}</TableCell>
                          <TableCell>{formatDate(promo.koniecPromocji)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {promo.kosztPunktow} pkt
                          </TableCell>
                          <TableCell>{getPromotionStatusBadge(promo)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog nowej promocji */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Utwórz nową promocję</DialogTitle>
            <DialogDescription>
              Wypełnij formularz, aby rozpocząć promocję swojego profilu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Typ promocji */}
            <div>
              <Label htmlFor="promotion-type">Typ promocji *</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger id="promotion-type" className="mt-2">
                  <SelectValue placeholder="Wybierz typ promocji" />
                </SelectTrigger>
                <SelectContent>
                  {PROMOTION_TYPES.map((promo) => (
                    <SelectItem key={promo.type} value={promo.type}>
                      {promo.label} -{" "}
                      {promo.type === "PODBICIE_OGLOSZENIA"
                        ? `${promo.pointsPerDay} pkt/dzień`
                        : `${promo.pointsPerWeek} pkt/tydzień`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Czas trwania */}
            <div>
              <Label htmlFor="duration">Czas trwania (dni) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="90"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                className="mt-2"
              />
            </div>

            {/* Kategoria (opcjonalna) */}
            <div>
              <Label htmlFor="category">Kategoria (opcjonalna)</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category" className="mt-2">
                  <SelectValue placeholder="Wszystkie kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Wszystkie kategorie</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nazwa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Województwo (opcjonalne) */}
            <div>
              <Label htmlFor="voivodeship">Województwo (opcjonalne)</Label>
              <Select value={selectedVoivodeship} onValueChange={setSelectedVoivodeship}>
                <SelectTrigger id="voivodeship" className="mt-2">
                  <SelectValue placeholder="Wszystkie województwa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Wszystkie województwa</SelectItem>
                  {voivodeships.map((voivodeship) => (
                    <SelectItem key={voivodeship.id} value={voivodeship.id}>
                      {voivodeship.nazwa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data startu */}
            <div>
              <Label htmlFor="start-date">Data i godzina rozpoczęcia *</Label>
              <Input
                id="start-date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Automatyczne odnowienie */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-renewal"
                checked={autoRenewal}
                onCheckedChange={(checked) => setAutoRenewal(checked as boolean)}
              />
              <Label htmlFor="auto-renewal" className="text-sm cursor-pointer">
                Automatyczne odnowienie po zakończeniu
              </Label>
            </div>

            <Separator />

            {/* Podsumowanie kosztów */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Czas trwania:</span>
                  <span className="font-medium">{duration} dni</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Typ promocji:</span>
                  <span className="font-medium">
                    {selectedType ? getPromotionTypeLabel(selectedType) : "-"}
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Koszt całkowity:</span>
                  <span className="text-2xl font-bold text-primary">
                    {calculateCost()} pkt
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Dostępne punkty: {lawFirm?.punktySaldo || 0} pkt
                </p>
              </CardContent>
            </Card>

            {lawFirm && lawFirm.punktySaldo < calculateCost() && (
              <Card className="border-destructive bg-destructive/10">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <p>Nie masz wystarczającej liczby punktów. Zakup dodatkowe punkty.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Anuluj
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedType || !startDate || (lawFirm ? lawFirm.punktySaldo < calculateCost() : false)}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Utwórz promocję
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
