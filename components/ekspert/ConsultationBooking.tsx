"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CalendarScheduler } from "@/components/calendar/calendar"
import { slotToUtc } from "@/components/calendar/helpers"
import type { BookedSlot } from "@/components/calendar/types"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  Calendar,
  ChevronLeft,
  Video,
  Sparkles,
  User,
  Mail,
  Phone,
  Info,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Loader2
} from "lucide-react"

export function ConsultationBooking({ lawFirm }: { lawFirm: any }) {
  const { data: session } = useSession()
  const router = useRouter()

  const [duration, setDuration] = useState<15 | 30 | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [topic, setTopic] = useState("")
  const [contact, setContact] = useState("")
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  // Map database day integer to string expected by CalendarScheduler
  const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const availabilities = lawFirm.consultationAvailabilities?.map((av: any) => ({
    day: dayMap[av.dayOfWeek],
    startTime: av.startTime,
    endTime: av.endTime,
    enabled: true
  })) || []

  const price15 = lawFirm.consultationAvailabilities?.[0]?.price15min ?? 100
  const price30 = lawFirm.consultationAvailabilities?.[0]?.price30min ?? 150
  const price = duration === 15 ? price15 : price30

  // Fetch already booked slots
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!lawFirm.id) return
      try {
        const response = await fetch(`/api/law-firms/${lawFirm.id}/consultation-bookings`)
        if (response.ok) {
          const data = await response.json()
          setBookedSlots(data.map((booking: any) => {
            const d = new Date(booking.consultationDate)
            return {
              date: format(d, "yyyy-MM-dd"),
              time: format(d, "HH:mm")
            }
          }))
        }
      } catch (error) {
        console.error("Failed to fetch booked slots", error)
      }
    }
    fetchBookedSlots()
  }, [lawFirm.id])

  // Auto-fill contact data from logged-in client
  useEffect(() => {
    if (session?.user?.client) {
      const client = session.user.client
      const contactInfo = [
        `${client.imie || ''} ${client.nazwisko || ''}`.trim(),
        session.user.email || '',
        client.telefon || ''
      ].filter(Boolean).join(', ')
      setContact(contactInfo)
    }
  }, [session])

  const handleSlotSelect = (date: Date, time: string) => {
    setSelectedDate(date)
    setSelectedSlot(time)
    setIsDialogOpen(true)
  }

  const handleBooking = async () => {
    if (!session?.user) {
      toast.error("Musisz być zalogowany, aby zarezerwować konsultację.")
      return
    }
    if (!session.user.client) {
      toast.error("Nie znaleziono danych klienta. Zaloguj się jako klient.")
      return
    }
    if (!selectedDate || !selectedSlot || !duration) return

    setIsBooking(true)
    try {
      // Polish timezone is Europe/Warsaw
      const utcDate = slotToUtc(selectedDate, selectedSlot, "Europe/Warsaw")

      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lawFirmId: lawFirm.id,
          clientId: session.user.client.id,
          consultationDate: utcDate,
          duration,
          price,
          topic,
          clientContact: contact,
        }),
      })

      if (response.ok) {
        toast.success("Twoja prośba o konsultację została wysłana.")
        setBookedSlots([...bookedSlots, { date: format(selectedDate, "yyyy-MM-dd"), time: selectedSlot }])
        setSelectedSlot(null)
        setIsDialogOpen(false)
        setTopic("")
        router.push("/panel-klienta/konsultacje")
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Nie udało się rezerwować konsultacji")
      }
    } catch (error: any) {
      toast.error(error.message || "Wystąpił błąd podczas rezerwacji.")
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="w-full relative">
      <AnimatePresence mode="wait">
        {(!lawFirm.consultationAvailabilities || lawFirm.consultationAvailabilities.length === 0) ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col items-center justify-center p-12 text-center border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/4 w-[200px] h-[200px] bg-[#d7b56d]/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="h-16 w-16 bg-zinc-800/40 rounded-2xl flex items-center justify-center border border-border/50 mb-4">
              <Info className="h-8 w-8 text-[#d7b56d] opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-playfair">Konsultacje niedostępne</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Kancelaria nie oferuje obecnie konsultacji online przez naszą platformę. Skontaktuj się bezpośrednio z ekspertem.
            </p>
          </motion.div>
        ) : !duration ? (
          // DURATION SELECTION VIEW
          <motion.div
            key="duration-select"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0da192]/10 border border-[#0da192]/20 text-[#0da192] text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Konsultacje Online
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-playfair text-white tracking-tight">
                Umów się na spotkanie z ekspertem
              </h2>
              <p className="text-sm text-zinc-400">
                Wybierz dogodny czas trwania konsultacji wideo, aby rozpocząć proces rezerwacji terminu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Option 15 min */}
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setDuration(15)}
                className="relative overflow-hidden group cursor-pointer rounded-2xl border border-border/30 bg-card/25 backdrop-blur-md p-6 flex flex-col justify-between hover:border-[#0da192]/40 hover:bg-card/35 transition-all duration-300 shadow-lg shadow-black/10"
              >
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#0da192]/5 blur-2xl rounded-full group-hover:bg-[#0da192]/10 transition-colors pointer-events-none" />
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-xl bg-[#0da192]/10 flex items-center justify-center border border-[#0da192]/20 group-hover:border-[#0da192]/30 transition-colors">
                      <Clock className="h-6 w-6 text-[#0da192]" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#d7b56d]/10 border border-[#d7b56d]/20 text-[#d7b56d] text-xs font-semibold tracking-wide">
                      15 MINUT
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 font-playfair group-hover:text-[#0da192] transition-colors">
                    Szybka Konsultacja
                  </h3>
                  <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                    Idealna do wstępnego omówienia problemu prawnego, szybkiej porady lub analizy kolejnych kroków działania.
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Wstępna analiza prawna",
                      "Określenie szans powodzenia",
                      "Porada dotycząca dokumentacji",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-[#0da192] flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border/20 pt-4 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-400 uppercase tracking-wider">CENA BRUTTO</span>
                    <span className="text-2xl font-bold font-playfair text-white">
                      {price15} <span className="text-sm font-medium">PLN</span>
                    </span>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-zinc-800 flex items-center justify-center border border-border group-hover:bg-[#0da192] group-hover:border-transparent transition-all duration-300">
                    <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </motion.div>

              {/* Option 30 min */}
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setDuration(30)}
                className="relative overflow-hidden group cursor-pointer rounded-2xl border border-[#d7b56d]/30 bg-card/25 backdrop-blur-md p-6 flex flex-col justify-between hover:border-[#d7b56d]/50 hover:bg-card/35 transition-all duration-300 shadow-lg shadow-black/10"
              >
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#d7b56d]/5 blur-2xl rounded-full group-hover:bg-[#d7b56d]/10 transition-colors pointer-events-none" />
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-xl bg-[#d7b56d]/10 flex items-center justify-center border border-[#d7b56d]/20 group-hover:border-[#d7b56d]/30 transition-colors">
                      <Video className="h-6 w-6 text-[#d7b56d]" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#d7b56d]/20 border border-[#d7b56d]/40 text-[#d7b56d] text-xs font-semibold tracking-wide">
                      30 MINUT
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 font-playfair group-hover:text-[#d7b56d] transition-colors">
                    Pełna Konsultacja
                  </h3>
                  <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                    Szczegółowe omówienie Twojej sprawy z ekspertem. Czas na głęboką analizę dokumentów i opracowanie strategii.
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Kompleksowe omówienie sprawy",
                      "Opracowanie planu taktycznego",
                      "Analiza nadesłanych pism",
                      "Rekomendacje dalszych kroków",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-[#d7b56d] flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border/20 pt-4 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-400 uppercase tracking-wider">CENA BRUTTO</span>
                    <span className="text-2xl font-bold font-playfair text-[#d7b56d]">
                      {price30} <span className="text-sm font-medium">PLN</span>
                    </span>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-zinc-800 flex items-center justify-center border border-border group-hover:bg-[#d7b56d] group-hover:border-transparent transition-all duration-300">
                    <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          // CALENDAR SCHEDULER VIEW
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border/30 bg-card/20 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDuration(null)}
                  className="h-9 w-9 rounded-xl border border-border hover:bg-muted text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h3 className="text-sm font-semibold text-white font-playfair leading-tight">
                    Wybór terminu konsultacji
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-[#0da192] bg-[#0da192]/10 px-2 py-0.5 rounded-full font-medium">
                      {duration} min
                    </span>
                    <span className="text-[11px] text-[#d7b56d] bg-[#d7b56d]/10 px-2 py-0.5 rounded-full font-medium">
                      {price} PLN
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground sm:text-right">
                Prawidłowy czas zostanie automatycznie przeliczony na Twoją strefę czasową.
              </span>
            </div>

            <div className="border border-border/30 bg-card/10 rounded-2xl p-2 sm:p-4 backdrop-blur-sm shadow-xl shadow-black/10">
              <CalendarScheduler
                availability={availabilities}
                bookedSlots={bookedSlots}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onSlotSelect={handleSlotSelect}
                adminTimeZone="Europe/Warsaw"
                slotDuration={duration}
                locale="pl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) setSelectedSlot(null)
      }}>
        <DialogContent className="bg-card border border-border/40 max-w-lg rounded-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-playfair">Zgłoszenie rezerwacji</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs pt-1">
              Podaj szczegóły swojej sprawy, aby ekspert mógł odpowiednio przygotować się do rozmowy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Appointment Summary Box */}
            <div className="grid grid-cols-2 gap-3.5 bg-zinc-800/40 border border-border/40 p-4 rounded-xl text-xs">
              <div className="space-y-1">
                <span className="text-zinc-400 block uppercase tracking-wider text-sm">DATA KONSULTACJI</span>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#0da192]" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: pl }) : ""}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-400 block uppercase tracking-wider text-sm">GODZINA I TRWANIE</span>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#d7b56d]" />
                  {selectedSlot} ({duration} min)
                </span>
              </div>
              <div className="space-y-1 col-span-2 pt-2 border-t border-zinc-800">
                <span className="text-zinc-400 block uppercase tracking-wider text-sm">SZACUNKOWY KOSZT</span>
                <span className="text-sm font-bold text-[#d7b56d]">
                  {price} PLN
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="topic" className="text-xs text-zinc-300 font-medium">Temat rozmowy i opis sprawy</Label>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Opisz krótko z jakim problemem się zwracasz oraz co chcesz osiągnąć podczas konsultacji..."
                  className="min-h-[100px] bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192]"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="contact" className="text-xs text-zinc-300 font-medium">Twoje dane kontaktowe</Label>
                <Input
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Imię, nazwisko, adres e-mail, numer telefonu"
                  className="bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-border/20 pt-4 mt-2">
            <Button
              variant="outline"
              disabled={isBooking}
              onClick={() => setIsDialogOpen(false)}
              className="border-border/50 hover:bg-muted text-white rounded-xl"
            >
              Anuluj
            </Button>
            <Button
              onClick={handleBooking}
              disabled={isBooking || !topic.trim() || !contact.trim()}
              className="bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-medium rounded-xl border-t border-white/10 px-5 gap-2"
            >
              {isBooking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                <>
                  <span>Wyślij prośbę</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
