"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { addDays, format, startOfWeek } from "date-fns"
import { pl } from "date-fns/locale"

export function ConsultationBooking({ lawFirm }: { lawFirm: any }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [duration, setDuration] = useState<15 | 30 | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [topic, setTopic] = useState("")
  const [contact, setContact] = useState("")
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!lawFirm.id) return
      try {
        const response = await fetch(`/api/law-firms/${lawFirm.id}/consultation-bookings`)
        if (response.ok) {
          const data = await response.json()
          setBookedSlots(data.map((booking: any) => new Date(booking.consultationDate).toISOString()))
        }
      } catch (error) {
        console.error("Failed to fetch booked slots", error)
      }
    }
    fetchBookedSlots()
  }, [lawFirm.id])

  // Auto-fill contact data from logged-in client
  useEffect(() => {
    if (session?.user) {
      const user = session.user
      const client = user.client
      const name = `${user.firstName || client?.imie || ""} ${user.lastName || client?.nazwisko || ""}`.trim()
      const contactInfo = [
        name || user.name || "",
        user.email || "",
        client?.telefon || ""
      ].filter(Boolean).join(', ')
      setContact(contactInfo)
    }
  }, [session])


  const handleBooking = async () => {
    if (!session?.user) {
      toast.error("Musisz być zalogowany, aby zarezerwować konsultację.")
      return
    }
    if (!session.user.client) {
      toast.error("Nie znaleziono danych klienta.")
      return
    }
    if (!selectedDate || !selectedSlot || !duration) return

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lawFirmId: lawFirm.id,
          clientId: session.user.client.id,
          consultationDate: new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedSlot}`),
          duration,
          price: duration === 15 ? lawFirm.consultationAvailabilities[0]?.price15min : lawFirm.consultationAvailabilities[0]?.price30min,
          topic,
          clientContact: contact,
        }),
      })

      if (response.ok) {
        const newBooking = await response.json();
        toast.success("Twoja prośba o konsultację została wysłana.")
        setBookedSlots([...bookedSlots, new Date(newBooking.consultationDate).toISOString()])
        setSelectedSlot(null)
        setIsDialogOpen(false)
        // Redirect to client consultations page
        router.push("/panel-klienta/konsultacje")
      } else {
        throw new Error("Failed to book consultation")
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas rezerwacji.")
    }
  }

  const generateTimeSlots = (start: string, end: string, interval: number) => {
    const slots = []
    let current = new Date(`1970-01-01T${start}:00`)
    const endTime = new Date(`1970-01-01T${end}:00`)

    while (current < endTime) {
      slots.push(format(current, "HH:mm"))
      current.setMinutes(current.getMinutes() + interval)
    }
    return slots
  }

  const renderWeekView = () => {
    if (!duration) return null
    const start = startOfWeek(selectedDate || new Date(), { weekStartsOn: 1 })
    const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i))

    return (
      <div className="grid grid-cols-7 gap-4 mt-4">
        {days.map((day) => {
          const dayAvailability = lawFirm.consultationAvailabilities.find(
            (a: any) => a.dayOfWeek === day.getDay()
          )
          const slots = dayAvailability
            ? generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime, duration)
            : []

          return (
            <div key={day.toISOString()}>
              <h4 className="font-semibold text-center">{format(day, "EEE dd.MM", { locale: pl })}</h4>
              <div className="flex flex-col gap-2 mt-2">
                {slots.map((slot) => {
                  const slotDateTime = new Date(`${format(day, "yyyy-MM-dd")}T${slot}:00`)
                  const isBooked = bookedSlots.includes(slotDateTime.toISOString())
                  const dialogKey = `${day.toISOString()}-${slot}`
                  return (
                    <Dialog key={slot} open={isDialogOpen && selectedSlot === slot && selectedDate?.toISOString() === day.toISOString()} onOpenChange={(open) => {
                      setIsDialogOpen(open)
                      if (!open) {
                        setSelectedSlot(null)
                      }
                    }}>
                      <DialogTrigger asChild>
                         <Button variant="outline" size="sm" disabled={isBooked} onClick={() => {
                             setSelectedDate(day)
                             setSelectedSlot(slot)
                             setIsDialogOpen(true)
                         }}>
                          {slot}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Potwierdź rezerwację</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>Data: {format(day, "PPP", { locale: pl })}</p>
                          <p>Godzina: {slot}</p>
                          <div className="grid gap-2">
                            <Label htmlFor="topic">Temat rozmowy</Label>
                            <Textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="contact">Dane kontaktowe</Label>
                            <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Imię, nazwisko, email, telefon" />
                          </div>
                          <Button onClick={handleBooking}>Wyślij prośbę</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Umów się na spotkanie online</CardTitle>
      </CardHeader>
      <CardContent>
        {(!lawFirm.consultationAvailabilities || lawFirm.consultationAvailabilities.length === 0) ? (
            <p className="text-muted-foreground">Kancelaria nie oferuje obecnie konsultacji online.</p>
        ) : !duration ? (
          <div className="flex gap-4">
            <Button onClick={() => setDuration(15)}>
              Konsultacja 15 min - {lawFirm.consultationAvailabilities[0]?.price15min || 100} zł
            </Button>
            <Button onClick={() => setDuration(30)}>
              Konsultacja 30 min - {lawFirm.consultationAvailabilities[0]?.price30min || 150} zł
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Wybierz termin ({duration} min)</h3>
                <Button variant="ghost" onClick={() => setDuration(null)}>Zmień</Button>
            </div>
            {renderWeekView()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
