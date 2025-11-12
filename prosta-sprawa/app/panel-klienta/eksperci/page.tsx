"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Heart,
  CheckCircle2,
  Briefcase,
  Trash2,
} from "lucide-react"
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

interface FavoriteLawFirm {
  id: string
  addedAt: string
  lawFirm: {
    id: string
    nazwa: string
    nazwaFirmy: string
    typ: string
    opis?: string
    logo?: string
    miasto: string
    voivodeship: {
      nazwa: string
    }
    numerTelefonu: string
    emailKontakt: string
    stronaWww?: string
    zweryfikowana: boolean
    avgRating: number
    reviewCount: number
    categories: Array<{
      category: {
        nazwa: string
        slug: string
      }
    }>
  }
}

const lawFirmTypeLabels: Record<string, string> = {
  OSOBA_FIZYCZNA: "Osoba fizyczna",
  SPOLKA_CYWILNA: "Spółka cywilna",
  SPOLKA_PARTNERSKA: "Spółka partnerska",
  SPOLKA_KOMANDYTOWA: "Spółka komandytowa",
  SPOLKA_JAWNA: "Spółka jawna",
  SPOLKA_ZOO: "Spółka z o.o.",
  INNY: "Inny",
}

export default function ClientFavoritesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<FavoriteLawFirm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/clients/me/favorites")

      if (!response.ok) {
        throw new Error("Nie udało się pobrać ulubionych kancelarii")
      }

      const data = await response.json()
      setFavorites(data)
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFavorite = async (lawFirmId: string) => {
    setRemovingId(lawFirmId)

    try {
      const response = await fetch(`/api/law-firms/${lawFirmId}/favorite`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Nie udało się usunąć kancelarii z ulubionych")
      }

      toast({
        title: "Usunięto z ulubionych",
        description: "Kancelaria została usunięta z Twojej listy ulubionych",
      })

      // Usuń z lokalnej listy
      setFavorites(favorites.filter((fav) => fav.lawFirm.id !== lawFirmId))
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd",
        variant: "destructive",
      })
    } finally {
      setRemovingId(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ładowanie ulubionych kancelarii...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wybrani Eksperci</h1>
        <p className="text-muted-foreground mt-2">
          Twoje ulubione kancelarie prawne i eksperci
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Brak ulubionych kancelarii</h3>
                <p className="text-muted-foreground mt-2">
                  Przeglądaj profile kancelarii i dodaj je do ulubionych, aby łatwo je odnaleźć
                </p>
              </div>
              <Button onClick={() => router.push("/szukaj-prawnika")}>
                Szukaj prawnika
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {favorites.map((favorite) => {
            const { lawFirm } = favorite
            return (
              <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Logo */}
                      {lawFirm.logo && (
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-border bg-card flex-shrink-0">
                          <Image
                            src={lawFirm.logo}
                            alt={lawFirm.nazwa}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">
                            <Link
                              href={`/kancelaria/${lawFirm.id}`}
                              className="hover:underline"
                            >
                              {lawFirm.nazwa}
                            </Link>
                          </CardTitle>
                          {lawFirm.zweryfikowana && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Zweryfikowana
                            </Badge>
                          )}
                        </div>

                        <CardDescription className="mb-2">
                          {lawFirm.nazwaFirmy}
                        </CardDescription>

                        {/* Rating */}
                        {lawFirm.reviewCount > 0 && (
                          <div className="flex items-center gap-3 mb-2">
                            {renderStars(lawFirm.avgRating)}
                            <span className="text-sm font-semibold">
                              {lawFirm.avgRating.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({lawFirm.reviewCount}{" "}
                              {lawFirm.reviewCount === 1 ? "opinia" : "opinii"})
                            </span>
                          </div>
                        )}

                        {/* Location & Type */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {lawFirm.miasto}, {lawFirm.voivodeship.nazwa}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{lawFirmTypeLabels[lawFirm.typ] || lawFirm.typ}</span>
                          </div>
                        </div>

                        {/* Categories */}
                        {lawFirm.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {lawFirm.categories.slice(0, 3).map((cat) => (
                              <Badge key={cat.category.slug} variant="outline">
                                {cat.category.nazwa}
                              </Badge>
                            ))}
                            {lawFirm.categories.length > 3 && (
                              <Badge variant="outline">
                                +{lawFirm.categories.length - 3} więcej
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Description */}
                        {lawFirm.opis && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {lawFirm.opis}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button asChild size="sm">
                        <Link href={`/kancelaria/${lawFirm.id}`}>
                          Zobacz profil
                        </Link>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={removingId === lawFirm.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Usuń
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Usunąć z ulubionych?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Czy na pewno chcesz usunąć {lawFirm.nazwa} z listy
                              ulubionych? Możesz ją dodać ponownie w dowolnym
                              momencie.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveFavorite(lawFirm.id)}
                            >
                              Usuń
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{lawFirm.numerTelefonu}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{lawFirm.emailKontakt}</span>
                    </div>
                    {lawFirm.stronaWww && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <a
                          href={lawFirm.stronaWww}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Strona WWW
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Dodano do ulubionych: {formatDate(favorite.addedAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
