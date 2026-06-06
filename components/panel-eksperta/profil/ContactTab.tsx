"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Client-side cache for city searches to avoid redundant api queries
const clientCitiesCache: Record<string, any[]> = {}

interface Voivodeship {
  id: string
  nazwa: string
}

interface ContactTabProps {
  formData: {
    imieKontakt: string
    nazwiskoKontakt: string
    numerTelefonu: string
    numerTelefonu2: string
    emailKontakt: string
    stronaWww: string
    adres: string
    kodPocztowy: string
    miasto: string
    voivodeshipId: string
    linkLinkedIn: string
    linkFacebook: string
    linkInstagram: string
    linkTwitter: string
  }
  handleInputChange: (field: string, value: any) => void
  voivodeships: Voivodeship[]
}

export function ContactTab({
  formData,
  handleInputChange,
  voivodeships,
}: ContactTabProps) {
  const [cities, setCities] = useState<any[]>([])
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  // Dynamic fetch and caching for cities and postal codes
  useEffect(() => {
    const query = locationSearch.trim().toLowerCase()
    if (query.length < 2) {
      setCities([])
      setIsLoadingCities(false)
      return
    }

    if (clientCitiesCache[query]) {
      setCities(clientCitiesCache[query])
      setIsLoadingCities(false)
      return
    }

    setIsLoadingCities(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/cities?search=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            clientCitiesCache[query] = data
            setCities(data)
          }
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching cities:", error)
        }
      } finally {
        setIsLoadingCities(false)
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [locationSearch])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dane kontaktowe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="imieKontakt">Imię kontaktowe *</Label>
            <Input
              id="imieKontakt"
              value={formData.imieKontakt}
              onChange={(e) => handleInputChange("imieKontakt", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nazwiskoKontakt">Nazwisko kontaktowe *</Label>
            <Input
              id="nazwiskoKontakt"
              value={formData.nazwiskoKontakt}
              onChange={(e) => handleInputChange("nazwiskoKontakt", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="numerTelefonu">Telefon główny *</Label>
            <Input
              id="numerTelefonu"
              value={formData.numerTelefonu}
              onChange={(e) => handleInputChange("numerTelefonu", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="numerTelefonu2">Telefon dodatkowy</Label>
            <Input
              id="numerTelefonu2"
              value={formData.numerTelefonu2}
              onChange={(e) => handleInputChange("numerTelefonu2", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="emailKontakt">Email *</Label>
            <Input
              id="emailKontakt"
              type="email"
              value={formData.emailKontakt}
              onChange={(e) => handleInputChange("emailKontakt", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stronaWww">Strona WWW</Label>
            <Input
              id="stronaWww"
              value={formData.stronaWww}
              onChange={(e) => handleInputChange("stronaWww", e.target.value)}
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="adres">Adres *</Label>
            <Input
              id="adres"
              value={formData.adres}
              onChange={(e) => handleInputChange("adres", e.target.value)}
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="kodPocztowy">Kod pocztowy *</Label>
              <Input
                id="kodPocztowy"
                value={formData.kodPocztowy}
                readOnly
                className="bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed"
                required
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="miasto">Miasto *</Label>
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full text-left justify-between font-normal"
                  >
                    <span className="truncate">{formData.miasto || "Wybierz miasto..."}</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Wyszukaj miasto..."
                      value={locationSearch}
                      onValueChange={setLocationSearch}
                    />
                    <CommandList className="max-h-60 overflow-y-auto">
                      {isLoadingCities && (
                        <div className="text-neutral-400 py-3 text-center text-xs">Wyszukiwanie...</div>
                      )}
                      {!isLoadingCities && locationSearch.trim().length < 2 && (
                        <div className="text-neutral-400 py-3 text-center text-xs px-3">
                          Wpisz co najmniej 2 znaki...
                        </div>
                      )}
                      {!isLoadingCities && locationSearch.trim().length >= 2 && cities.length === 0 && (
                        <div className="text-neutral-400 py-3 text-center text-xs">Nie znaleziono miasta.</div>
                      )}
                      <CommandGroup>
                        {cities.map((city) => {
                          const matchedPostal = city.postalCodes?.find((p: any) =>
                            p.code.toLowerCase().includes(locationSearch.trim().toLowerCase())
                          )
                          const displayValue = matchedPostal
                            ? `${city.nazwa} (${matchedPostal.code})`
                            : city.nazwa

                          return (
                            <CommandItem
                              key={city.id}
                              value={city.nazwa}
                              onSelect={() => {
                                handleInputChange("miasto", city.nazwa)
                                const selectedPostalCode = matchedPostal?.code || city.postalCodes?.[0]?.code || ""
                                handleInputChange("kodPocztowy", selectedPostalCode)
                                handleInputChange("voivodeshipId", city.voivodeshipId)
                                setLocationOpen(false)
                              }}
                              className="cursor-pointer flex items-center justify-between gap-2 py-2 px-3 text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <Check
                                  className={cn(
                                    "h-4 w-4 text-teal-500",
                                    formData.miasto === city.nazwa ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span>{displayValue}</span>
                              </div>
                              <span className="text-xs text-muted-foreground ml-2 text-right">
                                {city.voivodeship?.nazwa}
                              </span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="voivodeshipId">Województwo *</Label>
            <Select
              value={formData.voivodeshipId}
              onValueChange={(value) => handleInputChange("voivodeshipId", value)}
              disabled
            >
              <SelectTrigger className="bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed">
                <SelectValue placeholder="Wybierz województwo" />
              </SelectTrigger>
              <SelectContent>
                {voivodeships.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.nazwa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label>Social Media</Label>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="LinkedIn URL"
              value={formData.linkLinkedIn}
              onChange={(e) => handleInputChange("linkLinkedIn", e.target.value)}
            />
            <Input
              placeholder="Facebook URL"
              value={formData.linkFacebook}
              onChange={(e) => handleInputChange("linkFacebook", e.target.value)}
            />
            <Input
              placeholder="Instagram URL"
              value={formData.linkInstagram}
              onChange={(e) => handleInputChange("linkInstagram", e.target.value)}
            />
            <Input
              placeholder="Twitter URL"
              value={formData.linkTwitter}
              onChange={(e) => handleInputChange("linkTwitter", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
