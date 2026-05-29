"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Loader2 } from "lucide-react"
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
    const [price15min, setPrice15min] = useState(100);
    const [price30min, setPrice30min] = useState(150);


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
                setPrice15min(data[0].price15min || 100);
                setPrice30min(data[0].price30min || 150);
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
        if(enabled) {
            const dayExists = prev.some(d => d.dayOfWeek === dayOfWeek);
            if(!dayExists) {
                return [...prev, { dayOfWeek, startTime: "09:00", endTime: "17:00", price15min, price30min }];
            }
            return prev;
        } else {
            return prev.filter(d => d.dayOfWeek !== dayOfWeek);
        }
    });
  };

  const handleSubmit = async () => {
    if (!session?.user?.lawFirm?.id) {
      toast.error("Nie znaleziono danych kancelarii. Spróbuj zalogować się ponownie.")
      return
    }
    setIsSaving(true)
    try {
      const response = await fetch(`/api/law-firms/${session.user.lawFirm.id}/consultation-availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({availability: availability.map(a => ({...a, price15min, price30min}))}),
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session?.user?.lawFirm?.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Godziny konsultacji</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">Brak danych kancelarii</p>
              <p className="text-sm text-muted-foreground">
                Zaloguj się ponownie, aby zaktualizować swoje dane sesji.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Godziny konsultacji</CardTitle>
          <CardDescription>
            Ustaw swoją dostępność na konsultacje online. Klienci będą mogli rezerwować spotkania w
            tych godzinach.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price15min">Cena za 15 min (zł)</Label>
              <Input
                id="price15min"
                type="number"
                value={price15min}
                onChange={(e) => setPrice15min(parseFloat(e.target.value))}
                placeholder="np. 100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price30min">Cena za 30 min (zł)</Label>
              <Input
                id="price30min"
                type="number"
                value={price30min}
                onChange={(e) => setPrice30min(parseFloat(e.target.value))}
                placeholder="np. 150"
              />
            </div>
          </div>

          <div className="space-y-4">
            {daysOfWeek.map(({ id, name }) => {
              const dayAvailability = availability.find((a) => a.dayOfWeek === id)
              const isEnabled = !!dayAvailability

              return (
                <div key={id} className="grid grid-cols-[120px_auto_1fr_auto_1fr] gap-2 items-center">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`switch-${id}`}
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleEnabledChange(id, checked)}
                    />
                    <Label htmlFor={`switch-${id}`} className="font-semibold">{name}</Label>
                  </div>

                  {isEnabled && (
                    <>
                      <Label htmlFor={`from-${id}`}>Od</Label>
                      <Select
                        value={dayAvailability.startTime}
                        onValueChange={(value) => handleTimeChange(id, "startTime", value)}
                      >
                        <SelectTrigger id={`from-${id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 48 }, (_, i) => {
                            const hour = Math.floor(i / 2)
                            const minute = i % 2 === 0 ? "00" : "30"
                            const time = `${hour.toString().padStart(2, "0")}:${minute}`
                            return <SelectItem key={time} value={time}>{time}</SelectItem>
                          })}
                        </SelectContent>
                      </Select>

                      <Label htmlFor={`to-${id}`}>Do</Label>
                      <Select
                        value={dayAvailability.endTime}
                        onValueChange={(value) => handleTimeChange(id, "endTime", value)}
                      >
                        <SelectTrigger id={`to-${id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 48 }, (_, i) => {
                            const hour = Math.floor(i / 2)
                            const minute = i % 2 === 0 ? "00" : "30"
                            const time = `${hour.toString().padStart(2, "0")}:${minute}`
                            return <SelectItem key={time} value={time}>{time}</SelectItem>
                          })}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Zapisz godziny konsultacji
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
