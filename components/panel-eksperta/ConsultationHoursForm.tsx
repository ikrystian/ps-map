"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Loader2, Calendar, Clock, Save } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const daysOfWeek = [
  { id: 1, name: "Poniedziałek" },
  { id: 2, name: "Wtorek" },
  { id: 3, name: "Środa" },
  { id: 4, name: "Czwartek" },
  { id: 5, name: "Piątek" },
  { id: 6, name: "Sobota" },
  { id: 0, name: "Niedziela" },
]

export function ConsultationHoursForm() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [availability, setAvailability] = useState<any[]>([])
  const [price15min, setPrice15min] = useState(100)
  const [price30min, setPrice30min] = useState(150)

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!session?.user?.lawFirm?.id) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const response = await fetch(`/api/law-firms/${session.user.lawFirm.id}/consultation-availability`)
        if (response.ok) {
          const data = await response.json()
          setAvailability(data)
          if (data.length > 0) {
            setPrice15min(data[0].price15min || 100)
            setPrice30min(data[0].price30min || 150)
          }
        } else {
          throw new Error("Failed to fetch availability")
        }
      } catch (error) {
        toast.error("Nie udało się pobrać godzin dostępności.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAvailability()
  }, [session])

  const handleTimeChange = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
    setAvailability((prev) => {
      const dayExists = prev.some((d) => d.dayOfWeek === dayOfWeek)
      if (dayExists) {
        return prev.map((day) =>
          day.dayOfWeek === dayOfWeek ? { ...day, [field]: value, price15min, price30min } : day
        )
      } else {
        return [
          ...prev,
          {
            dayOfWeek,
            startTime: field === "startTime" ? value : "09:00",
            endTime: field === "endTime" ? value : "17:00",
            price15min,
            price30min,
          },
        ]
      }
    })
  }

  const handleEnabledChange = (dayOfWeek: number, enabled: boolean) => {
    setAvailability((prev) => {
      if (enabled) {
        const dayExists = prev.some(d => d.dayOfWeek === dayOfWeek)
        if (!dayExists) {
          return [...prev, { dayOfWeek, startTime: "09:00", endTime: "17:00", price15min, price30min }]
        }
        return prev
      } else {
        return prev.filter(d => d.dayOfWeek !== dayOfWeek)
      }
    })
  }

  const handleSubmit = async () => {
    if (!session?.user?.lawFirm?.id) {
      toast.error("Nie znaleziono danych eksperta. Spróbuj zalogować się ponownie.")
      return
    }
    setIsSaving(true)
    try {
      const response = await fetch(`/api/law-firms/${session.user.lawFirm.id}/consultation-availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: availability.map(a => ({ ...a, price15min, price30min })) }),
      })
      if (!response.ok) throw new Error("Failed to save availability")
      toast.success("Godziny konsultacji zostały zaktualizowane.")
    } catch (error) {
      toast.error("Nie udało się zapisać godzin konsultacji.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0da192]" />
      </div>
    )
  }

  if (!session?.user?.lawFirm?.id) {
    return (
      <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white">Godziny konsultacji</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-zinc-500 animate-bounce" />
            <div>
              <p className="text-lg font-semibold text-white">Brak danych eksperta</p>
              <p className="text-sm text-zinc-400">
                Zaloguj się ponownie, aby zaktualizować swoje dane sesji.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
      <CardHeader className="border-b border-border/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#0da192]/10 p-2 rounded-xl text-[#0da192]">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl text-white font-playfair">Dostępność konsultacji online</CardTitle>
            <CardDescription className="text-zinc-400 text-sm">
              Ustaw swoją dostępność na konsultacje online. Klienci będą mogli rezerwować spotkania w tych godzinach.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Cennik */}
        <div className="grid md:grid-cols-2 gap-4 p-4 border border-border/20 rounded-xl bg-zinc-950/10">
          <div className="grid gap-2">
            <Label htmlFor="price15min" className="text-zinc-300">Cena za konsultację 15 min (zł)</Label>
            <Input
              id="price15min"
              type="number"
              value={price15min}
              onChange={(e) => setPrice15min(parseFloat(e.target.value))}
              placeholder="np. 100"
              className="bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-[#0da192]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price30min" className="text-zinc-300">Cena za konsultację 30 min (zł)</Label>
            <Input
              id="price30min"
              type="number"
              value={price30min}
              onChange={(e) => setPrice30min(parseFloat(e.target.value))}
              placeholder="np. 150"
              className="bg-zinc-950/20 border-border/30 text-white rounded-xl focus:border-[#0da192]"
            />
          </div>
        </div>

        {/* Dni tygodnia */}
        <div className="space-y-3 pt-2">
          {daysOfWeek.map(({ id, name }) => {
            const dayAvailability = availability.find((a) => a.dayOfWeek === id)
            const isEnabled = !!dayAvailability

            return (
              <div key={id} className="grid grid-cols-1 sm:grid-cols-[160px_1fr_auto_1fr] gap-3 items-center p-2.5 rounded-xl border border-border/10 bg-zinc-950/5">
                <div className="flex items-center space-x-3 sm:pl-2">
                  <Switch
                    id={`switch-${id}`}
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleEnabledChange(id, checked)}
                  />
                  <Label htmlFor={`switch-${id}`} className="font-semibold text-white cursor-pointer text-sm">{name}</Label>
                </div>

                {isEnabled ? (
                  <>
                    <Select
                      value={dayAvailability.startTime}
                      onValueChange={(value) => handleTimeChange(id, "startTime", value)}
                    >
                      <SelectTrigger id={`from-${id}`} className="bg-zinc-950/20 border-border/30 text-white rounded-xl">
                        <SelectValue placeholder="Od" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-border/30 rounded-xl">
                        {Array.from({ length: 48 }, (_, i) => {
                          const hour = Math.floor(i / 2)
                          const minute = i % 2 === 0 ? "00" : "30"
                          const time = `${hour.toString().padStart(2, "0")}:${minute}`
                          return <SelectItem key={time} value={time} className="text-zinc-300 focus:text-white">{time}</SelectItem>
                        })}
                      </SelectContent>
                    </Select>

                    <span className="text-center text-zinc-500 hidden sm:inline">-</span>

                    <Select
                      value={dayAvailability.endTime}
                      onValueChange={(value) => handleTimeChange(id, "endTime", value)}
                    >
                      <SelectTrigger id={`to-${id}`} className="bg-zinc-950/20 border-border/30 text-white rounded-xl">
                        <SelectValue placeholder="Do" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-border/30 rounded-xl">
                        {Array.from({ length: 48 }, (_, i) => {
                          const hour = Math.floor(i / 2)
                          const minute = i % 2 === 0 ? "00" : "30"
                          const time = `${hour.toString().padStart(2, "0")}:${minute}`
                          return <SelectItem key={time} value={time} className="text-zinc-300 focus:text-white">{time}</SelectItem>
                        })}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <div className="sm:col-span-3 text-xs italic text-zinc-500 py-1.5 sm:pl-4">
                    Brak dostępności w tym dniu
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex justify-end pt-4 border-t border-border/10">
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isSaving}
            className="h-10 px-5 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-semibold rounded-xl shadow-md transition-all duration-200 gap-1.5"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Zapisz godziny konsultacji
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
