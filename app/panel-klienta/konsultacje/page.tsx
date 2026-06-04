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
        setBookings(data)
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
                          <Avatar className="h-12 w-12 flex-shrink-0 border border-border/40">
                            {booking.lawFirm?.logo && (
                              <AvatarImage src={booking.lawFirm.logo} alt={booking.lawFirm.nazwa} />
                            )}
                            <AvatarFallback className="bg-zinc-800 text-zinc-200 font-semibold text-sm">
                              {booking.lawFirm?.nazwa ? booking.lawFirm.nazwa.substring(0, 2).toUpperCase() : "KA"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-2.5 min-w-0">
                            <span className="font-semibold text-base text-white truncate">{booking.lawFirm.nazwa}</span>

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

                            <div className="flex flex-wrap gap-2">
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
                            </div>

                            {booking.googleMeetUrl && booking.status === "ACCEPTED" ? (
                              <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl mt-1">
                                <Video className="h-4 w-4 text-blue-400 shrink-0" />
                                <span className="text-zinc-500 text-xs font-light pr-1">Link do pokoju:</span>
                                <a href={booking.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline truncate">
                                  {booking.googleMeetUrl}
                                </a>
                              </div>
                            ) : (
                              <p className="text-sm text-zinc-500 italic font-light mt-1">Link do wirtualnego pokoju spotkania (Google Meet) pojawi się tutaj po zaakceptowaniu rezerwacji.</p>
                            )}
                          </div>
                        </div>
                        <div className="flex md:self-center">
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
