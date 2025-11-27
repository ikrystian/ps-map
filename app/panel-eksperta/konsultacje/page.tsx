"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2, Trash2, Calendar, Clock, FileText, Mail, Video, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

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
      <div>
        <h1 className="text-3xl font-bold">Zarządzanie konsultacjami</h1>
        <p className="text-muted-foreground">Przeglądaj i zarządzaj prośbami o konsultacje od klientów.</p>
      </div>
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
              <p>Brak próśb o konsultacje.</p>
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
