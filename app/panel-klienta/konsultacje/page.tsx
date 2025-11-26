"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { toast } from "sonner"

export default function ClientConsultationsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
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
    fetchBookings()
  }, [session])

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
                <div key={booking.id} className="border p-4 rounded-lg">
                  <p className="font-semibold">Kancelaria: {booking.lawFirm.nazwa}</p>
                  <p>Data: {format(new Date(booking.consultationDate), "PPP p", { locale: pl })}</p>
                  <p>Czas trwania: {booking.duration} min</p>
                  <p>Temat: {booking.topic}</p>
                  <p>Kwota płatności: {booking.price.toFixed(2)} zł</p>
                  <p>Status: {booking.status}</p>
                  <p>Status płatności: {booking.paymentStatus}</p>
                  {booking.googleMeetUrl && booking.status === "ACCEPTED" ? (
                     <p>Link do spotkania: <a href={booking.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{booking.googleMeetUrl}</a></p>
                  ) : (
                    <p>Link do spotkania pojawi się po zaakceptowaniu rezerwacji przez kancelarię.</p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
