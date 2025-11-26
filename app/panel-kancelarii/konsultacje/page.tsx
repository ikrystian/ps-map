"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
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
                <div key={booking.id} className="border p-4 rounded-lg flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Klient: {booking.client.user.name}</p>
                    <p>Data: {format(new Date(booking.consultationDate), "PPP p", { locale: pl })}</p>
                    <p>Czas trwania: {booking.duration} min</p>
                    <p>Temat: {booking.topic}</p>
                    <p>Kontakt: {booking.clientContact}</p>
                    <p>Status: {booking.status}</p>
                    <p>Status płatności: {booking.paymentStatus}</p>
                    {booking.googleMeetUrl && <p>Link do spotkania: <a href={booking.googleMeetUrl} target="_blank" rel="noopener noreferrer">{booking.googleMeetUrl}</a></p>}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {booking.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleStatusChange(booking.id, "ACCEPTED")}>
                          Akceptuj
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange(booking.id, "REJECTED")}>
                          Odrzuć
                        </Button>
                      </div>
                    )}
                     <div className="flex gap-2">
                        <Button size="sm" onClick={() => handlePaymentStatusChange(booking.id, "ZAPLACONE")} disabled={booking.paymentStatus === "ZAPLACONE"}>
                          Oznacz jako zapłacone
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePaymentStatusChange(booking.id, "OCZEKUJE")} disabled={booking.paymentStatus === "OCZEKUJE"}>
                          Oznacz jako nieopłacone
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
