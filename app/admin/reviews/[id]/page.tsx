"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle, Save, Star, Trash2, XCircle } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

interface Review {
  id: string
  ocenaOgolna: number
  profesjonalizm: number | null
  komunikacja: number | null
  terminowosc: number | null
  stosunekJakosci: number | null
  tytulOpinii: string
  trescOpinii: string
  polecam: boolean
  anonimowa: boolean
  zweryfikowana: boolean
  aktywna: boolean
  odpowiedz: string | null
  dataOdpowiedzi: string | null
  createdAt: string
  updatedAt: string
  lawFirm: {
    id: string
    nazwa: string
    nazwaFirmy: string
    email: string
    telefon: string
    miasto: string
  }
  client: {
    id: string
    imie: string
    nazwisko: string
    email: string
  }
}

export default function ReviewDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const reviewId = params.id as string

  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Form fields
  const [tytulOpinii, setTytulOpinii] = useState("")
  const [trescOpinii, setTrescOpinii] = useState("")
  const [ocenaOgolna, setOcenaOgolna] = useState(5)
  const [profesjonalizm, setProfesjonalizm] = useState<number | null>(null)
  const [komunikacja, setKomunikacja] = useState<number | null>(null)
  const [terminowosc, setTerminowosc] = useState<number | null>(null)
  const [stosunekJakosci, setStosunekJakosci] = useState<number | null>(null)
  const [polecam, setPolecam] = useState(true)
  const [anonimowa, setAnonimowa] = useState(false)
  const [zweryfikowana, setZweryfikowana] = useState(false)
  const [aktywna, setAktywna] = useState(true)
  const [odpowiedz, setOdpowiedz] = useState("")

  useEffect(() => {
    fetchReview()
  }, [reviewId])

  const fetchReview = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reviews/${reviewId}`)
      if (response.ok) {
        const data = await response.json()
        setReview(data)

        // Set form fields
        setTytulOpinii(data.tytulOpinii)
        setTrescOpinii(data.trescOpinii)
        setOcenaOgolna(data.ocenaOgolna)
        setProfesjonalizm(data.profesjonalizm)
        setKomunikacja(data.komunikacja)
        setTerminowosc(data.terminowosc)
        setStosunekJakosci(data.stosunekJakosci)
        setPolecam(data.polecam)
        setAnonimowa(data.anonimowa)
        setZweryfikowana(data.zweryfikowana)
        setAktywna(data.aktywna)
        setOdpowiedz(data.odpowiedz || "")
      } else {
        throw new Error("Nie znaleziono opinii")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się pobrać opinii")
      router.push("/admin/reviews")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validate
      if (trescOpinii.length < 50) {
        toast.error("Treść opinii musi zawierać minimum 50 znaków")
        return
      }

      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tytulOpinii,
          trescOpinii,
          ocenaOgolna,
          profesjonalizm,
          komunikacja,
          terminowosc,
          stosunekJakosci,
          polecam,
          anonimowa,
          zweryfikowana,
          aktywna,
          odpowiedz: odpowiedz || null,
        }),
      })

      if (response.ok) {
        toast.success("Opinia została zaktualizowana")
        setIsEditing(false)
        fetchReview()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd aktualizacji opinii")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaktualizować opinii")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Opinia została usunięta")
        router.push("/admin/reviews")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania opinii")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć opinii")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  if (!review) {
    return null
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Szczegóły opinii" subtitle={`ID: ${review.id}`} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/reviews">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót do listy
            </Link>
          </Button>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)}>
                Edytuj
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Usuń
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => {
                setIsEditing(false)
                fetchReview()
              }}>
                Anuluj
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Zapisywanie..." : "Zapisz"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2">
        <Badge variant={review.zweryfikowana ? "default" : "secondary"}>
          {review.zweryfikowana ? "Zweryfikowana" : "Niezweryfikowana"}
        </Badge>
        <Badge variant={review.aktywna ? "default" : "destructive"}>
          {review.aktywna ? "Aktywna" : "Nieaktywna"}
        </Badge>
        {review.anonimowa && (
          <Badge variant="outline">Anonimowa</Badge>
        )}
        {review.polecam && (
          <Badge variant="outline" className="bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Polecana
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Content */}
          <Card>
            <CardHeader>
              <CardTitle>Treść opinii</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="tytul">Tytuł</Label>
                    <Input
                      id="tytul"
                      value={tytulOpinii}
                      onChange={(e) => setTytulOpinii(e.target.value)}
                      placeholder="Tytuł opinii"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tresc">Treść (min. 50 znaków)</Label>
                    <Textarea
                      id="tresc"
                      value={trescOpinii}
                      onChange={(e) => setTrescOpinii(e.target.value)}
                      placeholder="Treść opinii"
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {trescOpinii.length} / 50 znaków
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{review.tytulOpinii}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{review.trescOpinii}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>Oceny</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ocena ogólna {isEditing && "*"}</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={ocenaOgolna}
                    onChange={(e) => setOcenaOgolna(parseInt(e.target.value) || 1)}
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.ocenaOgolna)}
                    <span className="text-sm font-medium">({review.ocenaOgolna}/5)</span>
                  </div>
                )}
              </div>

              {isEditing ? (
                <>
                  <div>
                    <Label>Profesjonalizm</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={profesjonalizm || ""}
                      onChange={(e) => setProfesjonalizm(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Opcjonalne (1-5)"
                    />
                  </div>
                  <div>
                    <Label>Komunikacja</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={komunikacja || ""}
                      onChange={(e) => setKomunikacja(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Opcjonalne (1-5)"
                    />
                  </div>
                  <div>
                    <Label>Terminowość</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={terminowosc || ""}
                      onChange={(e) => setTerminowosc(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Opcjonalne (1-5)"
                    />
                  </div>
                  <div>
                    <Label>Stosunek jakości do ceny</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={stosunekJakosci || ""}
                      onChange={(e) => setStosunekJakosci(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Opcjonalne (1-5)"
                    />
                  </div>
                </>
              ) : (
                <>
                  {review.profesjonalizm && (
                    <div>
                      <Label>Profesjonalizm</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.profesjonalizm)}
                        <span className="text-sm">({review.profesjonalizm}/5)</span>
                      </div>
                    </div>
                  )}
                  {review.komunikacja && (
                    <div>
                      <Label>Komunikacja</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.komunikacja)}
                        <span className="text-sm">({review.komunikacja}/5)</span>
                      </div>
                    </div>
                  )}
                  {review.terminowosc && (
                    <div>
                      <Label>Terminowość</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.terminowosc)}
                        <span className="text-sm">({review.terminowosc}/5)</span>
                      </div>
                    </div>
                  )}
                  {review.stosunekJakosci && (
                    <div>
                      <Label>Stosunek jakości do ceny</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.stosunekJakosci)}
                        <span className="text-sm">({review.stosunekJakosci}/5)</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Law Firm Response */}
          <Card>
            <CardHeader>
              <CardTitle>Odpowiedź eksperta</CardTitle>
              <CardDescription>
                {review.dataOdpowiedzi
                  ? `Odpowiedź dodana: ${formatDate(review.dataOdpowiedzi)}`
                  : "Brak odpowiedzi"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <Label htmlFor="odpowiedz">Odpowiedź</Label>
                  <Textarea
                    id="odpowiedz"
                    value={odpowiedz}
                    onChange={(e) => setOdpowiedz(e.target.value)}
                    placeholder="Odpowiedź eksperta (opcjonalna)"
                    rows={4}
                    className="resize-none"
                  />
                </div>
              ) : (
                <>
                  {review.odpowiedz ? (
                    <p className="text-muted-foreground whitespace-pre-wrap">{review.odpowiedz}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Brak odpowiedzi</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Law Firm Info */}
          <Card>
            <CardHeader>
              <CardTitle>Ekspert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-muted-foreground">Nazwa</Label>
                <p className="font-medium">{review.lawFirm.nazwa}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Firma</Label>
                <p className="font-medium">{review.lawFirm.nazwaFirmy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-sm">{review.lawFirm.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Telefon</Label>
                <p className="text-sm">{review.lawFirm.telefon}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Miasto</Label>
                <p className="text-sm">{review.lawFirm.miasto}</p>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Klient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {review.anonimowa ? (
                <p className="text-sm text-muted-foreground italic">Opinia anonimowa</p>
              ) : (
                <>
                  <div>
                    <Label className="text-muted-foreground">Imię i nazwisko</Label>
                    <p className="font-medium">{review.client.imie} {review.client.nazwisko}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-sm">{review.client.email}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="zweryfikowana">Zweryfikowana</Label>
                    <Switch
                      id="zweryfikowana"
                      checked={zweryfikowana}
                      onCheckedChange={setZweryfikowana}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="aktywna">Aktywna</Label>
                    <Switch
                      id="aktywna"
                      checked={aktywna}
                      onCheckedChange={setAktywna}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="polecam">Polecana</Label>
                    <Switch
                      id="polecam"
                      checked={polecam}
                      onCheckedChange={setPolecam}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="anonimowa">Anonimowa</Label>
                    <Switch
                      id="anonimowa"
                      checked={anonimowa}
                      onCheckedChange={setAnonimowa}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <Label>Zweryfikowana</Label>
                    {review.zweryfikowana ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Aktywna</Label>
                    {review.aktywna ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Polecana</Label>
                    {review.polecam ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Anonimowa</Label>
                    {review.anonimowa ? (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadane</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-muted-foreground">Utworzono</Label>
                <p className="text-sm">{formatDate(review.createdAt)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Zaktualizowano</Label>
                <p className="text-sm">{formatDate(review.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć opinię &quot;{review.tytulOpinii}&quot;?
              Ta operacja jest nieodwracalna i opinia zostanie całkowicie usunięta z systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
