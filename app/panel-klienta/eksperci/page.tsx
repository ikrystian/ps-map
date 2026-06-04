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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import {
  Briefcase,
  CheckCircle2,
  Globe,
  Heart,
  Mail,
  MapPin,
  Phone,
  Star,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FavoriteLawFirm {
  id: string
  addedAt: string
  lawFirm: {
    id: string
    slug: string
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
        throw new Error("Nie udało się pobrać ulubionych ekspertów")
      }

      const data = await response.json()
      setFavorites(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
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
        throw new Error("Nie udało się usunąć eksperta z ulubionych")
      }

      toast.success("Ekspert został usunięty z Twojej listy ulubionych")

      // Usuń z lokalnej listy
      setFavorites(favorites.filter((fav) => fav.lawFirm.id !== lawFirmId))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
    } finally {
      setRemovingId(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-zinc-800 text-zinc-800"
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#0da192]" />
        <p className="text-zinc-400 text-sm font-light">Ładowanie ulubionych ekspertów...</p>
      </div>
    )
  }

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair tracking-tight text-white">Wybrani Eksperci</h1>
        <p className="text-sm text-zinc-400 mt-1.5 font-light">
          Lista Twoich ulubionych kancelarii i ekspertów prawnych, z którymi chcesz pozostać w kontakcie.
        </p>

      </motion.div>

      {favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative z-10"
        >
          <Card className="border border-border/20 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
            <CardContent className="py-16 px-4">
              <div className="text-center max-w-md mx-auto space-y-5">
                <div className="h-16 w-16 rounded-full bg-zinc-950/40 border border-border/10 flex items-center justify-center mx-auto text-zinc-500 shadow-inner">
                  <Heart className="h-8 w-8 text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Brak ulubionych ekspertów</h3>
                  <p className="text-zinc-400 text-sm font-light leading-relaxed">
                    Przeglądaj profile ekspertów w naszym katalogu i dodaj ich do ulubionych, aby mieć do nich szybki dostęp w przyszłości.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/szukaj-prawnika")}
                  className="h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-semibold rounded-xl shadow-md border-t border-white/10 transition-all"
                >
                  Szukaj prawnika
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 relative z-10"
        >
          {favorites.map((favorite) => {
            const { lawFirm } = favorite
            return (
              <motion.div key={favorite.id} variants={itemVariants}>
                <Card className="border border-border/20 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden hover:border-[#0da192]/30 hover:bg-zinc-950/20 transition-all duration-300">
                  <CardHeader className="p-6 pb-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                      <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                        {/* Logo */}
                        <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-border/30 bg-zinc-950/60 flex-shrink-0 flex items-center justify-center p-2">
                          {lawFirm.logo ? (
                            <Image
                              src={lawFirm.logo}
                              alt={lawFirm.nazwa}
                              fill
                              className="object-contain p-2"
                            />
                          ) : (
                            <Briefcase className="h-8 w-8 text-zinc-600" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold text-white leading-tight">
                              <Link
                                href={`/ekspert/${lawFirm.slug}`}
                                className="hover:text-[#0da192] transition-colors"
                              >
                                {lawFirm.nazwa}
                              </Link>
                            </h3>
                            {lawFirm.zweryfikowana && (
                              <Badge className="bg-[#0da192]/10 border border-[#0da192]/30 text-[#0da192] text-[10px] font-semibold tracking-wider uppercase py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Zweryfikowana
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-zinc-400 font-light">
                            {lawFirm.nazwaFirmy}
                          </p>

                          {/* Rating */}
                          {lawFirm.reviewCount > 0 && (
                            <div className="flex items-center gap-2.5 flex-wrap">
                              {renderStars(lawFirm.avgRating)}
                              <span className="text-xs font-bold text-white mt-0.5">
                                {lawFirm.avgRating.toFixed(1)}
                              </span>
                              <span className="text-xs text-zinc-500 font-light mt-0.5">
                                ({lawFirm.reviewCount}{" "}
                                {lawFirm.reviewCount === 1 ? "opinia" : "opinii"})
                              </span>
                            </div>
                          )}

                          {/* Location & Type */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-400 pt-0.5 font-light">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-[#0da192]" />
                              <span>
                                {lawFirm.miasto}, {lawFirm.voivodeship.nazwa}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5 text-[#d7b56d]" />
                              <span>{lawFirmTypeLabels[lawFirm.typ] || lawFirm.typ}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-row md:flex-col gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto md:w-[150px]">
                        <Button asChild size="sm" className="h-9 w-full rounded-xl bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-semibold shadow-sm border-t border-white/5 transition-all text-xs">
                          <Link href={`/ekspert/${lawFirm.slug}`}>
                            Zobacz profil
                          </Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={removingId === lawFirm.id}
                              className="h-9 w-full rounded-xl border-border/40 hover:bg-rose-500/5 hover:text-rose-400 hover:border-rose-500/20 text-zinc-400 text-xs font-semibold"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Usuń
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-zinc-900 border border-border/40 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden max-w-md w-[calc(100%-2rem)] mx-auto">
                            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-rose-500/5 blur-[80px] rounded-full pointer-events-none" />
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-lg font-bold text-white">Usunąć z ulubionych?</AlertDialogTitle>
                              <AlertDialogDescription className="text-zinc-400 text-xs font-light leading-relaxed">
                                Czy na pewno chcesz usunąć eksperta <strong className="text-white font-semibold">{lawFirm.nazwa}</strong> z listy ulubionych? Będziesz mógł dodać go ponownie w dowolnym momencie.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4 gap-2">
                              <AlertDialogCancel className="h-9 rounded-xl border-border/50 bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-semibold">Anuluj</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveFavorite(lawFirm.id)}
                                className="h-9 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                              >
                                Usuń
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Categories */}
                    {lawFirm.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {lawFirm.categories.slice(0, 4).map((cat) => (
                          <Badge key={cat.category.slug} className="bg-zinc-950/40 border-border/10 text-zinc-300 text-[10px] font-normal px-2.5 py-0.5 rounded-lg">
                            {cat.category.nazwa}
                          </Badge>
                        ))}
                        {lawFirm.categories.length > 4 && (
                          <Badge className="bg-[#d7b56d]/10 border border-[#d7b56d]/20 text-[#d7b56d] text-[10px] font-normal px-2.5 py-0.5 rounded-lg">
                            +{lawFirm.categories.length - 4} więcej
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-6 pt-0">
                    {/* Description */}
                    {lawFirm.opis && (
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 font-light">
                        {lawFirm.opis}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs pt-4 border-t border-border/10">
                      <div className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <Phone className="h-3.5 w-3.5 text-[#0da192] shrink-0" />
                        <span className="font-light">{lawFirm.numerTelefonu}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <Mail className="h-3.5 w-3.5 text-[#0da192] shrink-0" />
                        <span className="font-light">{lawFirm.emailKontakt}</span>
                      </div>
                      {lawFirm.stronaWww && (
                        <div className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                          <Globe className="h-3.5 w-3.5 text-[#0da192] shrink-0" />
                          <a
                            href={lawFirm.stronaWww}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline font-light"
                          >
                            Strona WWW
                          </a>
                        </div>
                      )}

                      <div className="ml-auto text-[10px] text-zinc-500 font-light">
                        Dodano: {formatDate(favorite.addedAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
