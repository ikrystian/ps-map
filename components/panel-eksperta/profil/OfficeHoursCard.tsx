"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Building, Clock } from "lucide-react"

interface OfficeHoursCardProps {
  formData: {
    statusGodzinyOtwarcia: boolean
    godzinyOtwarcia: {
      poniedzialek: string
      wtorek: string
      sroda: string
      czwartek: string
      piatek: string
      sobota: string
      niedziela: string
    }
  }
  handleInputChange: (field: string, value: any) => void
}

const dayNamesPolish: Record<string, string> = {
  poniedzialek: "Poniedziałek",
  wtorek: "Wtorek",
  sroda: "Środa",
  czwartek: "Czwartek",
  piatek: "Piątek",
  sobota: "Sobota",
  niedziela: "Niedziela",
}

export function OfficeHoursCard({
  formData,
  handleInputChange,
}: OfficeHoursCardProps) {
  return (
    <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
      <CardHeader className="border-b border-border/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#0da192]/10 p-2 rounded-xl text-[#0da192]">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl text-white font-playfair">Godziny otwarcia biura stacjonarnego</CardTitle>
            <CardDescription className="text-zinc-400 text-sm">Zarządzaj standardowymi godzinami pracy Twojego biura</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center space-x-3 p-3 rounded-xl border border-border/20 bg-zinc-950/10">
          <Switch
            id="statusGodzinyOtwarcia"
            checked={formData.statusGodzinyOtwarcia}
            onCheckedChange={(checked) => handleInputChange("statusGodzinyOtwarcia", checked)}
          />
          <Label htmlFor="statusGodzinyOtwarcia" className="text-white cursor-pointer font-medium">
            Wyświetlaj godziny otwarcia biura na profilu publicznym
          </Label>
        </div>

        {formData.statusGodzinyOtwarcia && formData.godzinyOtwarcia && (
          <div className="grid gap-3 pt-2 animate-in slide-in-from-top-1 duration-200">
            {Object.keys(formData.godzinyOtwarcia).map((day) => {
              const currentValue = formData.godzinyOtwarcia[day as keyof typeof formData.godzinyOtwarcia] || ""
              const [fromTime, toTime] = currentValue.split("-").map((t) => t.trim())
              const isClosed = currentValue.toLowerCase() === "zamknięte" || currentValue.toLowerCase() === "zamkniete"

              return (
                <div key={day} className="grid grid-cols-1 sm:grid-cols-[140px_1fr_auto_1fr] gap-3 items-center p-2 rounded-xl border border-border/10 bg-zinc-950/5">
                  <span className="font-semibold text-zinc-300 text-sm sm:pl-2">{dayNamesPolish[day] || day}</span>
                  
                  <Select
                    value={isClosed ? "zamkniete" : fromTime || ""}
                    onValueChange={(value) => {
                      const to = toTime || "17:00"
                      handleInputChange("godzinyOtwarcia", {
                        ...formData.godzinyOtwarcia,
                        [day]: value === "zamkniete" ? "Zamknięte" : `${value}-${to}`,
                      })
                    }}
                  >
                    <SelectTrigger className="bg-zinc-950/20 border-border/30 text-white rounded-xl">
                      <SelectValue placeholder="Od" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-border/30 rounded-xl">
                      <SelectItem value="zamkniete" className="text-zinc-300 focus:text-white">Zamknięte</SelectItem>
                      {Array.from({ length: 48 }, (_, i) => {
                        const hour = Math.floor(i / 2)
                        const minute = i % 2 === 0 ? "00" : "30"
                        const time = `${hour.toString().padStart(2, "0")}:${minute}`
                        return (
                          <SelectItem key={time} value={time} className="text-zinc-300 focus:text-white">
                            {time}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  <span className="text-center text-zinc-500 hidden sm:inline">-</span>

                  <Select
                    value={isClosed ? "" : toTime || ""}
                    onValueChange={(value) => {
                      const from = fromTime || "09:00"
                      if (!isClosed && from !== "zamkniete" && from !== "Zamknięte") {
                        handleInputChange("godzinyOtwarcia", {
                          ...formData.godzinyOtwarcia,
                          [day]: `${from}-${value}`,
                        })
                      }
                    }}
                    disabled={isClosed}
                  >
                    <SelectTrigger className="bg-zinc-950/20 border-border/30 text-white rounded-xl">
                      <SelectValue placeholder="Do" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-border/30 rounded-xl">
                      {Array.from({ length: 48 }, (_, i) => {
                        const hour = Math.floor(i / 2)
                        const minute = i % 2 === 0 ? "00" : "30"
                        const time = `${hour.toString().padStart(2, "0")}:${minute}`

                        const timeToMinutes = (t: string) => {
                          const [h, m] = t.split(":").map(Number)
                          return h * 60 + m
                        }

                        const fromMinutes = fromTime ? timeToMinutes(fromTime) : 0
                        const currentMinutes = timeToMinutes(time)

                        if (currentMinutes <= fromMinutes) return null

                        return (
                          <SelectItem key={time} value={time} className="text-zinc-300 focus:text-white">
                            {time}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
