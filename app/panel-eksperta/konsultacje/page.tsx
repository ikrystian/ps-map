"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { Calendar, Clock, FileText, Loader2, Mail, Trash2, User, Video } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function ConsultationsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])

  const fetchBookings = async () => {
    if (!session?.user?.lawFirm?.id) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/law-firms/${session.user.lawFirm.id}/consultation-bookings/all`)
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

  const handleStatusChange = async (bookingId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      const response = await fetch(`/api/consultations/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success(`Rezerwacja została ${status === "ACCEPTED" ? "zaakceptowana" : "odrzucona"}.`)
        fetchBookings() // Refresh the list
      } else {
        throw new Error("Failed to update booking status")
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas aktualizacji statusu rezerwacji.")
    }
  }

  const handlePaymentStatusChange = async (bookingId: string, paymentStatus: "ZAPLACONE" | "OCZEKUJE") => {
    try {
      const response = await fetch(`/api/consultations/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      })

      if (response.ok) {
        toast.success(`Status płatności został zaktualizowany.`)
        fetchBookings() // Refresh the list
      } else {
        throw new Error("Failed to update payment status")
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas aktualizacji statusu płatności.")
    }
  }

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Zarządzanie konsultacjami"
        subtitle="Przeglądaj i zarządzaj prośbami o konsultacje od klientów."
      />
      <Card>
        <CardHeader>
          <CardTitle>Prośby o konsultacje</CardTitle>
          <CardDescription>
            Tutaj znajdziesz listę wszystkich próśb o konsultacje. Możesz je akceptować lub odrzucać.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-10 px-4 space-y-6 max-w-lg mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" className="w-full max-w-[260px] h-auto mx-auto mb-2 opacity-95">
                  {/* Background details */}
                  <circle cx="120" cy="180" r="80" fill="#e9e6dc" opacity="0.4" />
                  <circle cx="360" cy="100" r="50" fill="#ede9de" opacity="0.6" />
                  <circle cx="250" cy="270" r="10" fill="#c96442" opacity="0.2" />
                  <circle cx="90" cy="80" r="15" fill="#c96442" opacity="0.15" />
                  <circle cx="410" cy="220" r="12" fill="#c96442" opacity="0.1" />

                  {/* Clipboard / Checklist Card */}
                  <rect x="80" y="60" width="160" height="220" rx="16" fill="#ffffff" stroke="#dad9d4" strokeWidth="3" />
                  {/* Clipboard header */}
                  <path d="M130 50 h60 a10 10 0 0 1 10 10 v10 a0 0 0 0 1 0 0 h-80 a0 0 0 0 1 0 0 v-10 a10 10 0 0 1 10 -10 Z" fill="#b4b2a7" />
                  <circle cx="160" cy="42" r="6" fill="#3d3929" />

                  {/* Checklist lines and checked boxes */}
                  {/* Item 1 */}
                  <rect x="108" y="100" width="20" height="20" rx="4" fill="#c96442" />
                  <path d="M113 110 l3 3 l6 -6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <rect x="138" y="106" width="80" height="8" rx="4" fill="#ede9de" />

                  {/* Item 2 */}
                  <rect x="108" y="145" width="20" height="20" rx="4" fill="#c96442" />
                  <path d="M113 155 l3 3 l6 -6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <rect x="138" y="151" width="70" height="8" rx="4" fill="#ede9de" />

                  {/* Item 3 */}
                  <rect x="108" y="190" width="20" height="20" rx="4" fill="#c96442" />
                  <path d="M113 200 l3 3 l6 -6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <rect x="138" y="196" width="75" height="8" rx="4" fill="#ede9de" />

                  {/* Item 4 */}
                  <rect x="108" y="235" width="20" height="20" rx="4" fill="#c96442" />
                  <path d="M113 245 l3 3 l6 -6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <rect x="138" y="241" width="60" height="8" rx="4" fill="#ede9de" />

                  {/* Character */}
                  {/* Legs */}
                  <path d="M300 220 l-10 80 h15 l10 -80 Z" fill="#3d3929" />
                  <path d="M325 220 l5 80 h15 l-5 -80 Z" fill="#3d3929" />
                  {/* Shoes */}
                  <path d="M280 300 h25 r4 v-8 Z" fill="#141413" />
                  <path d="M335 300 h25 r4 v-8 Z" fill="#141413" />
                  {/* Torso */}
                  <path d="M280 140 h60 l-10 90 h-40 Z" fill="#c96442" />
                  {/* Neck & Head */}
                  <path d="M305 125 h10 v20 h-10 Z" fill="#e9e6dc" />
                  <circle cx="310" cy="115" r="22" fill="#e9e6dc" />
                  {/* Hair */}
                  <path d="M292 108 c0 -15 25 -25 35 -10 c5 15 -10 20 -20 20 Z" fill="#3d3929" />
                  {/* Arms & Hands */}
                  <path d="M282 145 l-40 30 l5 15 l35 -35 Z" fill="#c96442" />
                  <circle cx="242" cy="177" r="8" fill="#e9e6dc" />
                  <path d="M338 145 l35 -10 l10 12 l-35 18 Z" fill="#c96442" />
                  {/* Large completion checkmark */}
                  <path d="M380 115 l12 12 l25 -25" stroke="#c96442" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <circle cx="377" cy="138" r="8" fill="#e9e6dc" />

                  {/* Floor ground line */}
                  <line x1="50" y1="300" x2="450" y2="300" stroke="#dad9d4" strokeWidth="3" strokeLinecap="round" />
                </svg>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Obecnie nie masz żadnych próśb o konsultacje od klientów.
                  </p>
                </div>

                <div className="bg-muted/40 border border-border/80 rounded-xl p-5 text-sm space-y-4 shadow-sm text-left">
                  <p className="text-muted-foreground leading-relaxed">
                    Obecnie nie masz ustawionych <strong>godzin konsultacji</strong>, zmień to w profilu, aby klienci mogli wygodnie rezerwować wolne terminy bezpośrednio z Twojego profilu:
                  </p>

                  <div className="pt-2 text-center">
                    <Button asChild className="w-full sm:w-auto font-semibold shadow-sm hover:shadow-md transition-all duration-200">
                      <Link href="/panel-eksperta/profil?tab=consultations">
                        Ustaw godziny konsultacji
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="border p-4 rounded-lg consulting-item">
                  <div className="flex flex-col gap-4 md:flex-row md:gap-4">
                    <div className="flex gap-4 flex-1">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        {booking.client?.user?.image && (
                          <AvatarImage src={booking.client.user.image} alt={booking.client.user.name} />
                        )}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {booking.client?.user?.name ? booking.client.user.name.substring(0, 2).toUpperCase() : "KL"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{booking.client.user.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(booking.consultationDate), "PPP p", { locale: pl })}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.duration} min
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {booking.topic}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {booking.clientContact}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={booking.status === 'ACCEPTED' ? 'default' : booking.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                            Status: {booking.status}
                          </Badge>
                          <Badge variant={booking.paymentStatus === 'ZAPLACONE' ? 'default' : 'outline'}>
                            Płatność: {booking.paymentStatus}
                          </Badge>
                        </div>
                        {booking.googleMeetUrl && (
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <a href={booking.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                              {booking.googleMeetUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 md:items-end">
                      {booking.status === "PENDING" && (
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" onClick={() => handleStatusChange(booking.id, "ACCEPTED")}>
                            Akceptuj
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleStatusChange(booking.id, "REJECTED")}>
                            Odrzuć
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" onClick={() => handlePaymentStatusChange(booking.id, "ZAPLACONE")} disabled={booking.paymentStatus === "ZAPLACONE"}>
                          Oznacz jako zapłacone
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePaymentStatusChange(booking.id, "OCZEKUJE")} disabled={booking.paymentStatus === "OCZEKUJE"}>
                          Oznacz jako nieopłacone
                        </Button>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(booking.id)} className="w-full md:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
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
    </div>
  )
}
