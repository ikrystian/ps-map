"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { Calendar, Clock, CreditCard, FileText, Loader2, Trash2, Video, Sparkles } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { BorderBeam } from "@/components/ui/border-beam"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

function ConsultationTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isOver: boolean
  } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime()
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) return null
  if (timeLeft.isOver) {
    return (
      <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
        Konsultacja w toku / zakończona
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-[#d7b56d] font-medium bg-[#d7b56d]/10 px-2.5 py-1 rounded-md border border-[#d7b56d]/20">
      <Clock className="h-3.5 w-3.5 text-[#d7b56d]" />
      <span>Do konsultacji:</span>
      <span className="font-bold font-mono">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours.toString().padStart(2, "0")}h:
        {timeLeft.minutes.toString().padStart(2, "0")}m:
        {timeLeft.seconds.toString().padStart(2, "0")}s
      </span>
    </div>
  )
}

export default function ClientConsultationsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])

  const fetchBookings = async () => {
    if (!session?.user?.client?.id) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/clients/${session.user.client.id}/consultation-bookings`)
      if (response.ok) {
        const data = await response.json()
        const now = new Date()
        const future = data.filter((b: any) => new Date(b.consultationDate) >= now)
        const past = data.filter((b: any) => new Date(b.consultationDate) < now)
        
        future.sort((a: any, b: any) => new Date(a.consultationDate).getTime() - new Date(b.consultationDate).getTime())
        past.sort((a: any, b: any) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime())
        
        setBookings([...future, ...past])
      } else {
        throw new Error("Failed to fetch bookings")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać rezerwacji.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [session])

  const handleDelete = async (bookingId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę konsultację?")) return

    try {
      const response = await fetch(`/api/consultations/${bookingId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Konsultacja została usunięta.")
        fetchBookings() // Refresh the list
      } else {
        throw new Error("Failed to delete booking")
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas usuwania konsultacji.")
    }
  }

  if (isLoading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie Twoich konsultacji...</p>
        </div>
      </div>
    )
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
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair tracking-tight text-white">Moje Konsultacje</h1>
        <p className="text-sm text-zinc-400 mt-1.5 font-light">
          Przeglądaj status swoich umówionych konsultacji, dołączaj do spotkań wideo oraz zarządzaj rezerwacjami.
        </p>

      </motion.div>

      {/* Main Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10"
      >
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                    <div className="h-14 w-14 rounded-full bg-zinc-800/40 border border-border/40 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-zinc-500 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white">Brak rezerwacji</h4>
                      <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed font-light">
                        Nie masz obecnie żadnych umówionych konsultacji prawnych. Możesz umówić się na rozmowę bezpośrednio na profilu wybranego eksperta.
                      </p>
                    </div>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-border/10 bg-zinc-950/20 hover:border-[#0da192]/30 hover:bg-zinc-950/30 transition-all p-5 rounded-2xl relative overflow-hidden group"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                        <div className="flex gap-4 flex-1 min-w-0">
                          <Link href={`/ekspert/${booking.lawFirm.slug}`} className="flex-shrink-0 hover:opacity-80 transition-opacity">
                            <Avatar className="h-36 w-36 rounded-xl border border-border/40">
                              {booking.lawFirm?.logo && (
                                <AvatarImage src={booking.lawFirm.logo} alt={booking.lawFirm.nazwa} />
                              )}
                              <AvatarFallback className="bg-zinc-800 text-zinc-200 font-semibold text-sm">
                                {booking.lawFirm?.nazwa ? booking.lawFirm.nazwa.substring(0, 2).toUpperCase() : "KA"}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex flex-col gap-2.5 min-w-0">
                            <Link href={`/ekspert/${booking.lawFirm.slug}`} className="font-semibold text-base text-white hover:text-[#0da192] transition-colors truncate">
                              {booking.lawFirm.nazwa}
                            </Link>

                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-[#0da192]/10 text-[#0da192] border border-[#0da192]/20 gap-1.5 py-0.5 px-2.5 rounded-md font-medium text-sm">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(booking.consultationDate), "PPP p", { locale: pl })}
                              </Badge>
                              <Badge className="bg-zinc-950/40 text-zinc-300 border border-border/10 gap-1.5 py-0.5 px-2.5 rounded-md font-medium text-sm">
                                <Clock className="h-3 w-3" />
                                {booking.duration} min
                              </Badge>
                              <Badge className="bg-zinc-950/40 text-zinc-300 border border-border/10 gap-1.5 py-0.5 px-2.5 rounded-md font-medium text-sm max-w-[200px] truncate" title={booking.topic}>
                                <FileText className="h-3 w-3" />
                                {booking.topic}
                              </Badge>
                              <Badge className="bg-[#d7b56d]/10 text-[#d7b56d] border border-[#d7b56d]/20 gap-1.5 py-0.5 px-2.5 rounded-md font-bold text-sm">
                                <CreditCard className="h-3 w-3" />
                                {booking.price.toFixed(2)} zł
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {booking.status === 'ACCEPTED' ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-sm py-0 px-2 rounded-md">Zaakceptowana</Badge>
                              ) : booking.status === 'REJECTED' ? (
                                <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-sm py-0 px-2 rounded-md">Odrzucona</Badge>
                              ) : (
                                <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-sm py-0 px-2 rounded-md">Oczekuje na akceptację</Badge>
                              )}

                              {booking.paymentStatus === 'ZAPLACONE' ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-sm py-0 px-2 rounded-md">Zapłacona</Badge>
                              ) : (
                                <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 text-sm py-0 px-2 rounded-md">Nieopłacona</Badge>
                              )}

                              {booking.status === 'ACCEPTED' && (
                                <ConsultationTimer targetDate={booking.consultationDate} />
                              )}
                            </div>

                            {booking.status === "ACCEPTED" && (
                              <div className="mt-1">
                                {booking.googleMeetUrl ? (
                                  <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl">
                                    <Video className="h-4 w-4 text-blue-400 shrink-0" />
                                    <span className="text-zinc-500 text-xs font-light pr-1">Link do pokoju:</span>
                                    <a href={booking.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline truncate">
                                      {booking.googleMeetUrl}
                                    </a>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                                    <Video className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
                                    <p className="text-xs text-zinc-400 font-light">
                                      Link do Google Meet pojawi się na 5 minut przed planowaną konsultacją.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            {booking.status === "PENDING" && (
                              <p className="text-sm text-zinc-500 italic font-light mt-1">Link do wirtualnego pokoju spotkania (Google Meet) pojawi się po zaakceptowaniu rezerwacji.</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 md:self-center">
                          <Button
                            asChild
                            size="sm"
                            className="w-full md:w-auto h-9 px-4 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white rounded-xl text-xs font-semibold shadow-md border-t border-white/10 transition-all"
                          >
                            <Link href={`/ekspert/${booking.lawFirm.slug}`}>
                              Przejdź do strony eksperta
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(booking.id)}
                            className="w-full md:w-auto h-9 border-border/50 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/30 rounded-xl transition-all text-xs font-semibold"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Usuń
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
