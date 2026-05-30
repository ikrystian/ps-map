"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface AdditionalTabProps {
  formData: {
    oirpStatus: boolean
    oirpMiasto: string
    oirpWpis: string
    oraStatus: boolean
    oraMiasto: string
    oraWpis: string
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

export function AdditionalTab({
  formData,
  handleInputChange,
}: AdditionalTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wpisy do rejestrów</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="oirpStatus"
                checked={formData.oirpStatus}
                onCheckedChange={(checked) => handleInputChange("oirpStatus", checked)}
              />
              <Label htmlFor="oirpStatus">Wpis do OIRP</Label>
            </div>

            {formData.oirpStatus && (
              <div className="grid md:grid-cols-2 gap-4 ml-8">
                <Input
                  placeholder="Miasto OIRP"
                  value={formData.oirpMiasto}
                  onChange={(e) => handleInputChange("oirpMiasto", e.target.value)}
                />
                <Input
                  placeholder="Numer wpisu"
                  value={formData.oirpWpis}
                  onChange={(e) => handleInputChange("oirpWpis", e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="oraStatus"
                checked={formData.oraStatus}
                onCheckedChange={(checked) => handleInputChange("oraStatus", checked)}
              />
              <Label htmlFor="oraStatus">Wpis do ORA</Label>
            </div>

            {formData.oraStatus && (
              <div className="grid md:grid-cols-2 gap-4 ml-8">
                <Input
                  placeholder="Miasto ORA"
                  value={formData.oraMiasto}
                  onChange={(e) => handleInputChange("oraMiasto", e.target.value)}
                />
                <Input
                  placeholder="Numer wpisu"
                  value={formData.oraWpis}
                  onChange={(e) => handleInputChange("oraWpis", e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Godziny otwarcia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="statusGodzinyOtwarcia"
              checked={formData.statusGodzinyOtwarcia}
              onCheckedChange={(checked) => handleInputChange("statusGodzinyOtwarcia", checked)}
            />
            <Label htmlFor="statusGodzinyOtwarcia">Wyświetl godziny otwarcia</Label>
          </div>

          {formData.statusGodzinyOtwarcia && formData.godzinyOtwarcia && (
            <div className="grid gap-3">
              {Object.keys(formData.godzinyOtwarcia).map((day) => {
                const currentValue = formData.godzinyOtwarcia[day as keyof typeof formData.godzinyOtwarcia]
                const [fromTime, toTime] = currentValue.split("-").map((t) => t.trim())

                return (
                  <div key={day} className="grid md:grid-cols-[120px_1fr_auto_1fr] gap-2 items-center">
                    <Label className="capitalize">{day}</Label>
                    <Select
                      value={fromTime || ""}
                      onValueChange={(value) => {
                        const to = toTime || "17:00"
                        handleInputChange("godzinyOtwarcia", {
                          ...formData.godzinyOtwarcia,
                          [day]: value === "zamkniete" ? "Zamknięte" : `${value}-${to}`,
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Od" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zamkniete">Zamknięte</SelectItem>
                        {Array.from({ length: 48 }, (_, i) => {
                          const hour = Math.floor(i / 2)
                          const minute = i % 2 === 0 ? "00" : "30"
                          const time = `${hour.toString().padStart(2, "0")}:${minute}`
                          return (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <span className="text-center text-muted-foreground">-</span>
                    <Select
                      value={toTime || ""}
                      onValueChange={(value) => {
                        const from = fromTime || "09:00"
                        if (from !== "zamkniete" && from !== "Zamknięte") {
                          handleInputChange("godzinyOtwarcia", {
                            ...formData.godzinyOtwarcia,
                            [day]: `${from}-${value}`,
                          })
                        }
                      }}
                      disabled={fromTime === "zamkniete" || !fromTime || currentValue === "Zamknięte"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Do" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 48 }, (_, i) => {
                          const hour = Math.floor(i / 2)
                          const minute = i % 2 === 0 ? "00" : "30"
                          const time = `${hour.toString().padStart(2, "0")}:${minute}`

                          // Porównanie czasów - konwertuj do minut od północy
                          const timeToMinutes = (t: string) => {
                            const [h, m] = t.split(":").map(Number)
                            return h * 60 + m
                          }

                          const fromMinutes = fromTime ? timeToMinutes(fromTime) : 0
                          const currentMinutes = timeToMinutes(time)

                          // Tylko czasy po godzinie "od"
                          if (currentMinutes <= fromMinutes) return null

                          return (
                            <SelectItem key={time} value={time}>
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
    </div>
  )
}
