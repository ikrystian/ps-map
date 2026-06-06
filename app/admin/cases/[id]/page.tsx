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
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { AlertCircle, Archive, ArrowLeft, Building2, Clock, Edit, MessageSquare, Trash2, User } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

interface User {
  id: string
  email: string
  name?: string
  role: string
}

interface Client {
  id: string
  imie: string
  nazwisko: string
  telefon?: string
  adres?: string
  kodPocztowy?: string
  miasto?: string
  user: {
    email: string
    createdAt: string
  }
  voivodeship?: {
    nazwa: string
  }
}

import { Category } from "@/types/categories"
import type { LawFirm } from "@/types"

interface Voivodeship {
  id: string
  nazwa: string
}

interface Offer {
  id: string
  kwotaNetto: number
  kwotaBrutto: number
  vat: number
  terminRealizacjiDni: number
  opisOferty: string
  zakresUslug: string
  status: string
  createdAt: string
  lawFirm: LawFirm
  negotiations: any[]
}

interface Message {
  id: string
  temat: string
  tresc: string
  przeczytana: boolean
  createdAt: string
  sender: User
  receiver: User
}

interface CaseDetails {
  id: string
  nazwaSprawy: string
  opisSprawy: string
  status: string
  typSprawy: string
  trybPilny: boolean
  isArchived: boolean
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  zamknieto: string | null
  budzetOd?: number
  budzetDo?: number
  doNegocjacji: boolean
  oczekiwanyTerminRealizacji?: string
  imieNazwisko: string
  emailKontakt: string
  telefonKontakt: string
  preferowanyKontakt: string
  zalaczniki?: string
  wybranadziedzinaPrawa?: string
  wybranaSpecyfikacja?: string
  specjalizacja?: string
  client: Client
  category: Category
  voivodeship: Voivodeship
  offers: Offer[]
  messages: Message[]
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  NOWA: { label: "Nowa", variant: "secondary" },
  OFERTY_OTRZYMANE: { label: "Oferty otrzymane", variant: "default" },
  W_TRAKCIE: { label: "W toku", variant: "default" },
  ZAKONCZONA: { label: "Zakończona", variant: "outline" },
  ANULOWANA: { label: "Anulowana", variant: "destructive" },
}

const offerStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ZLOZONA: { label: "Złożona", variant: "secondary" },
  ZAAKCEPTOWANA: { label: "Zaakceptowana", variant: "default" },
  ODRZUCONA: { label: "Odrzucona", variant: "destructive" },
  NEGOCJACJE: { label: "Negocjacje", variant: "outline" },
  WYGASLA: { label: "Wygasła", variant: "destructive" },
}

export default function CaseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [caseData, setCaseData] = useState<CaseDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<"archive" | "hard">("archive")

  useEffect(() => {
    fetchCaseDetails()
  }, [params.id])

  const fetchCaseDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/cases/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCaseData(data)
      } else {
        throw new Error("Błąd pobierania danych sprawy")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać danych sprawy")
      router.push("/admin/cases")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!caseData) return

    try {
      const url =
        deleteType === "hard"
          ? `/api/admin/cases/${caseData.id}?hardDelete=true`
          : `/api/admin/cases/${caseData.id}`

      const response = await fetch(url, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success(deleteType === "hard" ? "Sprawa została trwale usunięta" : "Sprawa została zarchiwizowana")
        router.push("/admin/cases")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania sprawy")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć sprawy")
    }
  }

  const openDeleteDialog = (type: "archive" | "hard" = "archive") => {
    setDeleteType(type)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Sprawa nie została znaleziona</div>
      </div>
    )
  }

  const acceptedOffer = caseData.offers.find((offer) => offer.status === "ZAAKCEPTOWANA")

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title={caseData.nazwaSprawy} subtitle={`ID: ${caseData.id}`} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/cases">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/cases/${caseData.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edytuj
            </Link>
          </Button>
          {!caseData.isArchived && (
            <>
              <Button variant="outline" onClick={() => openDeleteDialog("archive")} className="text-orange-600">
                <Archive className="h-4 w-4 mr-2" />
                Archiwizuj
              </Button>
              <Button variant="outline" onClick={() => openDeleteDialog("hard")} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Usuń
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status and badges */}
      <div className="flex items-center gap-2">
        <Badge variant={statusLabels[caseData.status]?.variant || "secondary"}>
          {statusLabels[caseData.status]?.label || caseData.status}
        </Badge>
        {caseData.trybPilny && (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pilne
          </Badge>
        )}
        {caseData.isArchived && <Badge variant="outline">Zarchiwizowana</Badge>}
        <Badge variant="outline">{caseData.typSprawy.replace("_", " ")}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Opis sprawy */}
          <Card>
            <CardHeader>
              <CardTitle>Opis sprawy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Kategoria</p>
                <p className="font-medium">{caseData.category.nazwa}</p>
                {caseData.wybranadziedzinaPrawa && (
                  <p className="text-sm text-muted-foreground mt-1">{caseData.wybranadziedzinaPrawa}</p>
                )}
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Opis</p>
                <p className="whitespace-pre-wrap">{caseData.opisSprawy}</p>
              </div>
              {caseData.specjalizacja && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Dodatkowe wymagania</p>
                    <p>{caseData.specjalizacja}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Budżet i termin */}
          <Card>
            <CardHeader>
              <CardTitle>Budżet i termin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Budżet</p>
                  {caseData.budzetOd || caseData.budzetDo ? (
                    <p className="font-medium">
                      {caseData.budzetOd && formatCurrency(caseData.budzetOd)}
                      {caseData.budzetOd && caseData.budzetDo && " - "}
                      {caseData.budzetDo && formatCurrency(caseData.budzetDo)}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Nie określono</p>
                  )}
                  {caseData.doNegocjacji && <Badge variant="outline" className="mt-1">Do negocjacji</Badge>}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Oczekiwany termin realizacji</p>
                  {caseData.oczekiwanyTerminRealizacji ? (
                    <p className="font-medium">{formatDate(caseData.oczekiwanyTerminRealizacji)}</p>
                  ) : (
                    <p className="text-muted-foreground">Nie określono</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Oferty */}
          <Card>
            <CardHeader>
              <CardTitle>Oferty ({caseData.offers.length})</CardTitle>
              <CardDescription>Lista ofert od ekspertów prawnych</CardDescription>
            </CardHeader>
            <CardContent>
              {caseData.offers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Brak ofert</p>
              ) : (
                <div className="space-y-4">
                  {caseData.offers.map((offer) => (
                    <Card key={offer.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-semibold">{offer.lawFirm.nazwa}</p>
                            <p className="text-sm text-muted-foreground">{offer.lawFirm.nazwaFirmy}</p>
                          </div>
                          <Badge variant={offerStatusLabels[offer.status]?.variant || "secondary"}>
                            {offerStatusLabels[offer.status]?.label || offer.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Cena</p>
                            <p className="font-semibold text-lg">{formatCurrency(offer.kwotaBrutto)}</p>
                            <p className="text-xs text-muted-foreground">
                              Netto: {formatCurrency(offer.kwotaNetto)} (VAT {offer.vat}%)
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Termin realizacji</p>
                            <p className="font-medium">{offer.terminRealizacjiDni} dni roboczych</p>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Opis oferty</p>
                          <p className="text-sm">{offer.opisOferty}</p>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-1">Zakres usług</p>
                          <p className="text-sm">{offer.zakresUslug}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                          Złożona: {formatDate(offer.createdAt)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wiadomości */}
          <Card>
            <CardHeader>
              <CardTitle>Wiadomości ({caseData.messages.length})</CardTitle>
              <CardDescription>Historia komunikacji</CardDescription>
            </CardHeader>
            <CardContent>
              {caseData.messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Brak wiadomości</p>
              ) : (
                <div className="space-y-4">
                  {caseData.messages.map((message) => (
                    <Card key={message.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{message.temat}</p>
                            <p className="text-sm text-muted-foreground">
                              Od: {message.sender.email} ({message.sender.role})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Do: {message.receiver.email} ({message.receiver.role})
                            </p>
                          </div>
                          {!message.przeczytana && (
                            <Badge variant="secondary">Nieprzeczytana</Badge>
                          )}
                        </div>
                        <p className="text-sm mt-3 whitespace-pre-wrap">{message.tresc}</p>
                        <p className="text-xs text-muted-foreground mt-3">
                          {formatDate(message.createdAt)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Klient */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Klient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Imię i nazwisko</p>
                <p className="font-medium">
                  {caseData.client.imie} {caseData.client.nazwisko}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{caseData.client.user.email}</p>
              </div>
              {caseData.client.telefon && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{caseData.client.telefon}</p>
                  </div>
                </>
              )}
              {caseData.client.miasto && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Lokalizacja</p>
                    <p className="font-medium">
                      {caseData.client.miasto}
                      {caseData.client.voivodeship && `, ${caseData.client.voivodeship.nazwa}`}
                    </p>
                  </div>
                </>
              )}
              <Separator />
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/admin/users?clientId=${caseData.client.id}`}>
                  Zobacz profil klienta
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Dane kontaktowe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Dane kontaktowe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Osoba kontaktowa</p>
                <p className="font-medium">{caseData.imieNazwisko}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{caseData.emailKontakt}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="font-medium">{caseData.telefonKontakt}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Preferowany kontakt</p>
                <Badge variant="outline">{caseData.preferowanyKontakt}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Przydzielona ekspert */}
          {acceptedOffer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Przydzielona ekspert
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nazwa</p>
                  <p className="font-medium">{acceptedOffer.lawFirm.nazwa}</p>
                  <p className="text-sm text-muted-foreground">{acceptedOffer.lawFirm.nazwaFirmy}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Kwota</p>
                  <p className="font-semibold text-lg">{formatCurrency(acceptedOffer.kwotaBrutto)}</p>
                </div>
                <Separator />
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/admin/law-firms/${acceptedOffer.lawFirm.id}`}>
                    Zobacz profil eksperta
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Informacje systemowe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Informacje systemowe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Utworzona</p>
                <p className="font-medium">{formatDate(caseData.createdAt)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Ostatnia aktualizacja</p>
                <p className="font-medium">{formatDate(caseData.updatedAt)}</p>
              </div>
              {caseData.zamknieto && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Zamknięta</p>
                    <p className="font-medium">{formatDate(caseData.zamknieto)}</p>
                  </div>
                </>
              )}
              {caseData.isArchived && caseData.archivedAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Zarchiwizowana</p>
                    <p className="font-medium">{formatDate(caseData.archivedAt)}</p>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Województwo</p>
                <p className="font-medium">{caseData.voivodeship.nazwa}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog usuwania/archiwizacji */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteType === "hard" ? "Trwałe usunięcie sprawy" : "Archiwizacja sprawy"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === "hard" ? (
                <>
                  Czy na pewno chcesz <strong>trwale usunąć</strong> sprawę &quot;{caseData.nazwaSprawy}&quot;?
                  <br />
                  <br />
                  Ta operacja jest <strong>nieodwracalna</strong> i spowoduje usunięcie wszystkich powiązanych danych
                  (ofert, wiadomości, itp.).
                </>
              ) : (
                <>
                  Czy na pewno chcesz <strong>zarchiwizować</strong> sprawę &quot;{caseData.nazwaSprawy}&quot;?
                  <br />
                  <br />
                  Sprawa zostanie ukryta, ale będzie można ją przywrócić w przyszłości.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className={
                deleteType === "hard"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }
            >
              {deleteType === "hard" ? "Usuń trwale" : "Archiwizuj"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
