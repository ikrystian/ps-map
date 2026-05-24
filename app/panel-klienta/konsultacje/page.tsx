"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Trash2, Calendar, Clock, FileText, CreditCard, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { toast } from "sonner"

export default function ClientConsultationsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      let clientId = session?.user?.client?.id
      if (!clientId) {
        const meRes = await fetch("/api/clients/me")
        if (meRes.ok) {
          const meData = await meRes.json()
          clientId = meData?.id
        }
      }

      if (!clientId) {
        setIsLoading(false)
        return
      }

      const response = await fetch(`/api/clients/${clientId}/consultation-bookings`)
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moje konsultacje</h1>
        <p className="text-muted-foreground">Przeglądaj status swoich umówionych konsultacji.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Historia konsultacji</CardTitle>
          <CardDescription>
            Tutaj znajdziesz listę wszystkich swoich konsultacji, zarówno tych nadchodzących, jak i
            zakończonych.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <p>Nie masz żadnych umówionych konsultacji.</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="border p-4 rounded-lg consulting-item">
                  <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                    <div className="flex gap-4 flex-1">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        {booking.lawFirm?.logo && (
                          <AvatarImage src={booking.lawFirm.logo} alt={booking.lawFirm.nazwa} />
                        )}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {booking.lawFirm?.nazwa ? booking.lawFirm.nazwa.substring(0, 2).toUpperCase() : "KA"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{booking.lawFirm.nazwa}</span>
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
                            <CreditCard className="h-3 w-3" />
                            {booking.price.toFixed(2)} zł
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
                        {booking.googleMeetUrl && booking.status === "ACCEPTED" ? (
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <a href={booking.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                              {booking.googleMeetUrl}
                            </a>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Link do spotkania pojawi się po zaakceptowaniu rezerwacji.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex md:items-start">
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
