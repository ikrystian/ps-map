"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Check, ChevronDown, Phone, MapPin, Globe, Share2, Loader2, User, Mail, Briefcase } from "lucide-react"
import {
  FaFacebook as Facebook,
  FaInstagram as Instagram,
  FaLinkedin as Linkedin,
  FaTwitter as Twitter,
  FaTiktok as Tiktok
} from "react-icons/fa"
import { cn } from "@/lib/utils"
import { BorderBeam } from "@/components/ui/border-beam"

import type { Voivodeship, City } from "@/types"

// Client-side cache for city searches to avoid redundant api queries
const clientCitiesCache: Record<string, any[]> = {}

function CityLazyLoadTrigger({
  voivodeshipId,
  fetchMoreCities,
  isLoadingMore,
}: {
  voivodeshipId: string
  fetchMoreCities?: (id: string) => void
  isLoadingMore?: boolean
}) {
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!fetchMoreCities || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreCities(voivodeshipId)
        }
      },
      { threshold: 0.1 }
    )

    if (triggerRef.current) {
      observer.observe(triggerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [voivodeshipId, fetchMoreCities, isLoadingMore])

  return (
    <div ref={triggerRef} className="py-2 flex justify-center items-center gap-2 text-xs text-zinc-500">
      {isLoadingMore ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span>Ładowanie kolejnych miast...</span>
        </>
      ) : (
        <span className="opacity-0">Wczytaj więcej</span>
      )}
    </div>
  )
}

interface ContactTabProps {
  formData: {
    imieKontakt: string
    nazwiskoKontakt: string
    numerTelefonu: string
    numerTelefonu2: string
    stronaWww: string
    adres: string
    kodPocztowy: string
    miasto: string
    voivodeshipId: string
    linkLinkedIn: string
    linkFacebook: string
    linkInstagram: string
    linkTwitter: string
    linkTikTok: string
    callaPolska: boolean
    onlineOnly: boolean
    voivodeshipsIds: string[]
    citiesIds: string[]
  }
  handleInputChange: (field: string, value: any) => void
  voivodeships: Voivodeship[]
  maxVoivodeships: number
  maxCities: number
  citiesByVoivodeship: Record<string, City[]>
  loadingCities: Record<string, boolean>
  toggleVoivodeship: (id: string) => void
  toggleCity: (id: string) => void
  hasMoreCities?: Record<string, boolean>
  loadingMoreCities?: Record<string, boolean>
  fetchMoreCities?: (voivodeshipId: string) => void
}

export function ContactTab({
  formData,
  handleInputChange,
  voivodeships,
  maxVoivodeships,
  maxCities,
  citiesByVoivodeship,
  loadingCities,
  toggleVoivodeship,
  toggleCity,
  hasMoreCities,
  loadingMoreCities,
  fetchMoreCities,
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
    <div className="space-y-6">
      {/* Rząd 1: Osoba kontaktowa oraz Dane teleadresowe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Osoba kontaktowa */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300 flex flex-col h-full">
          <BorderBeam lightColor="var(--primary)" lightWidth={350} duration={8} borderWidth={1} />
          <div className="flex flex-col h-full justify-between">
            <CardHeader className="border-b border-border/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-playfair">Osoba kontaktowa</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm">Przedstawiciel profilu eksperta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 flex-grow flex flex-col justify-center">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="imieKontakt" className="text-zinc-300 font-medium text-xs">Imię *</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      id="user.name"
                      value={formData.imieKontakt}
                      onChange={(e) => handleInputChange("imieKontakt", e.target.value)}
                      required
                      className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nazwiskoKontakt" className="text-zinc-300 font-medium text-xs">Nazwisko *</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      id=""
                      value={formData.nazwiskoKontakt}
                      onChange={(e) => handleInputChange("nazwiskoKontakt", e.target.value)}
                      required
                      className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Dane kontaktowe i WWW */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300 flex flex-col h-full">
          <BorderBeam lightColor="var(--primary)" lightWidth={350} duration={9} borderWidth={1} />
          <div className="flex flex-col h-full justify-between">
            <CardHeader className="border-b border-border/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-playfair">Dane teleadresowe</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm">Główne drogi kontaktu dla klientów</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 flex-grow flex flex-col justify-center">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="numerTelefonu" className="text-zinc-300 font-medium text-xs">Telefon główny *</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Phone className="h-4 w-4" />
                    </div>
                    <Input
                      id="numerTelefonu"
                      value={formData.numerTelefonu}
                      onChange={(e) => handleInputChange("numerTelefonu", e.target.value)}
                      required
                      className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="numerTelefonu2" className="text-zinc-300 font-medium text-xs">Telefon dodatkowy</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Phone className="h-4 w-4" />
                    </div>
                    <Input
                      id="numerTelefonu2"
                      value={formData.numerTelefonu2}
                      onChange={(e) => handleInputChange("numerTelefonu2", e.target.value)}
                      className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="emailKontakt" className="text-zinc-300 font-medium text-xs">Email *</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="emailKontakt"
                      type="email"
                      value={formData.emailKontakt}
                      onChange={(e) => handleInputChange("emailKontakt", e.target.value)}
                      required
                      className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stronaWww" className="text-zinc-300 font-medium text-xs">Strona WWW</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Globe className="h-4 w-4" />
                    </div>
                    <Input
                      id="stronaWww"
                      placeholder="https://..."
                      value={formData.stronaWww}
                      onChange={(e) => handleInputChange("stronaWww", e.target.value)}
                      className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>


      {/* Rząd 2: Adres stacjonarny biura oraz Profile społecznościowe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Adres stacjonarny */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300 flex flex-col h-full">
          <BorderBeam lightColor="var(--primary)" lightWidth={350} duration={8} borderWidth={1} />
          <div className="flex flex-col h-full justify-between">
            <CardHeader className="border-b border-border/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-playfair">Adres stacjonarny biura</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm">Główna lokalizacja fizyczna</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 flex-grow flex flex-col justify-center">
              <div className="grid gap-4">

                {/* Row 1: Ulica and Kod Pocztowy */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="adres" className="text-zinc-300 font-medium text-xs">Ulica i numer *</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <Input
                        id="adres"
                        placeholder="np. Al. Jerozolimskie 12/3"
                        value={formData.adres}
                        onChange={(e) => handleInputChange("adres", e.target.value)}
                        required
                        className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2 md:col-span-1">
                    <Label htmlFor="kodPocztowy" className="text-zinc-300 font-medium text-xs">Kod pocztowy *</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <Input
                        id="kodPocztowy"
                        value={formData.kodPocztowy}
                        readOnly
                        className="pl-10 bg-zinc-950/50 border-border/30 text-zinc-400 cursor-not-allowed rounded-xl focus-visible:ring-0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Miasto and Województwo */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="miasto" className="text-zinc-300 font-medium text-xs">Miasto *</Label>
                    <Popover open={locationOpen} onOpenChange={(open) => {
                      setLocationOpen(open)
                      if (!open) {
                        setLocationSearch("")
                      }
                    }}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full text-left justify-between font-normal bg-zinc-950/20 border-border/30 text-white rounded-xl hover:bg-zinc-900/40 h-10 px-3 hover:text-white"
                        >
                          <span className="truncate flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-zinc-500" />
                            {formData.miasto || "Wybierz miasto..."}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-primary" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0 bg-zinc-950 border border-border/30 rounded-xl" align="start">
                        <Command shouldFilter={false} className="bg-transparent text-white">
                          <CommandInput
                            placeholder="Wyszukaj miasto..."
                            value={locationSearch}
                            onValueChange={setLocationSearch}
                            className="border-none text-white focus:ring-0"
                          />
                          <CommandList className="max-h-60 overflow-y-auto custom-scrollbar">
                            {isLoadingCities && (
                              <div className="text-zinc-500 py-3 text-center text-xs">Wyszukiwanie...</div>
                            )}
                            {!isLoadingCities && locationSearch.trim().length === 0 && (
                              <div className="text-zinc-500 py-3 text-center text-xs px-3">
                                Zacznij wpisywać, aby wyszukać miasto...
                              </div>
                            )}
                            {!isLoadingCities && locationSearch.trim().length > 0 && locationSearch.trim().length < 2 && (
                              <div className="text-zinc-500 py-3 text-center text-xs px-3">
                                Wpisz co najmniej 2 znaki...
                              </div>
                            )}
                            {!isLoadingCities && locationSearch.trim().length >= 2 && cities.length === 0 && (
                              <div className="text-zinc-500 py-3 text-center text-xs">Nie znaleziono miasta.</div>
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
                                    className="cursor-pointer flex items-center justify-between gap-2 py-2 px-3 text-sm hover:bg-zinc-900 rounded-lg text-zinc-300 hover:text-white"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Check
                                        className={cn(
                                          "h-4 w-4 text-primary",
                                          formData.miasto === city.nazwa ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <span>{displayValue}</span>
                                    </div>
                                    <span className="text-xs text-zinc-500 ml-2">
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

                  <div className="grid gap-2 md:col-span-1">
                    <Label htmlFor="voivodeshipId" className="text-zinc-300 font-medium text-xs">Województwo *</Label>
                    <Select
                      value={formData.voivodeshipId}
                      onValueChange={(value) => handleInputChange("voivodeshipId", value)}
                      disabled
                    >
                      <SelectTrigger className="bg-zinc-950/50 border-border/30 text-zinc-400 cursor-not-allowed rounded-xl h-10">
                        <SelectValue placeholder="Wybierz województwo" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-border/30 rounded-xl">
                        {voivodeships.map((v) => (
                          <SelectItem key={v.id} value={v.id} className="text-zinc-300 focus:text-white">
                            {v.nazwa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Social Media */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300 flex flex-col h-full">
          <BorderBeam lightColor="var(--primary)" lightWidth={350} duration={8} borderWidth={1} />
          <div className="flex flex-col h-full justify-between">
            <CardHeader className="border-b border-border/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-playfair">Profile społecznościowe</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm">Linki do profili społecznościowych</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 flex-grow flex flex-col justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* LinkedIn */}
                <div className="grid gap-2">
                  <Label htmlFor="linkLinkedIn" className="text-zinc-300 font-medium text-xs">LinkedIn URL</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Linkedin className="h-4 w-4" />
                    </div>
                    <Input
                      id="linkLinkedIn"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkLinkedIn}
                      onChange={(e) => handleInputChange("linkLinkedIn", e.target.value)}
                      className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-[#0077b5]/20 focus-visible:border-[#0077b5] transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Facebook */}
                <div className="grid gap-2">
                  <Label htmlFor="linkFacebook" className="text-zinc-300 font-medium text-xs">Facebook URL</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Facebook className="h-4 w-4" />
                    </div>
                    <Input
                      id="linkFacebook"
                      placeholder="https://facebook.com/..."
                      value={formData.linkFacebook}
                      onChange={(e) => handleInputChange("linkFacebook", e.target.value)}
                      className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-[#1877f2]/20 focus-visible:border-[#1877f2] transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="grid gap-2">
                  <Label htmlFor="linkInstagram" className="text-zinc-300 font-medium text-xs">Instagram URL</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Instagram className="h-4 w-4" />
                    </div>
                    <Input
                      id="linkInstagram"
                      placeholder="https://instagram.com/..."
                      value={formData.linkInstagram}
                      onChange={(e) => handleInputChange("linkInstagram", e.target.value)}
                      className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-[#e4405f]/20 focus-visible:border-[#e4405f] transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Twitter */}
                <div className="grid gap-2">
                  <Label htmlFor="linkTwitter" className="text-zinc-300 font-medium text-xs">Twitter / X URL</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Twitter className="h-4 w-4" />
                    </div>
                    <Input
                      id="linkTwitter"
                      placeholder="https://x.com/..."
                      value={formData.linkTwitter}
                      onChange={(e) => handleInputChange("linkTwitter", e.target.value)}
                      className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white transition-all duration-200"
                    />
                  </div>
                </div>

                {/* TikTok */}
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="linkTikTok" className="text-zinc-300 font-medium text-xs">TikTok URL</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Tiktok className="h-4 w-4" />
                    </div>
                    <Input
                      id="linkTikTok"
                      placeholder="https://tiktok.com/@..."
                      value={formData.linkTikTok}
                      onChange={(e) => handleInputChange("linkTikTok", e.target.value)}
                      className="pl-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-[#ff0050]/20 focus-visible:border-[#ff0050] transition-all duration-200"
                    />
                  </div>
                </div>

              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Obszar działania */}
      <Card id="tour-zakres-area" className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
        <BorderBeam lightColor="var(--primary)" lightWidth={350} duration={10} borderWidth={1} />
        <CardHeader className="border-b border-border/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-white font-playfair">Obszar świadczenia usług</CardTitle>
              <CardDescription className="text-zinc-400 text-sm">
                Zdefiniuj, gdzie i w jaki sposób świadczysz pomoc prawną
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300",
                formData.callaPolska ? "bg-primary/5 border-primary shadow-sm" : "border-border/30 bg-zinc-950/10 hover:bg-zinc-800/10"
              )}
            >
              <Label
                htmlFor="callaPolska-switch"
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors duration-300",
                    formData.callaPolska ? "bg-primary text-white" : "bg-zinc-900 text-zinc-500"
                  )}
                >
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">Cała Polska</p>
                  <p className="text-xs text-zinc-400">Widoczność w całym kraju</p>
                </div>
              </Label>
              <Switch
                id="callaPolska-switch"
                checked={!!formData.callaPolska}
                onCheckedChange={(val) => handleInputChange("callaPolska", val)}
              />
            </div>

            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300",
                formData.onlineOnly ? "bg-primary/5 border-primary shadow-sm" : "border-border/30 bg-zinc-950/10 hover:bg-zinc-800/10"
              )}
            >
              <Label
                htmlFor="onlineOnly-switch"
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors duration-300",
                    formData.onlineOnly ? "bg-primary text-white" : "bg-zinc-900 text-zinc-500"
                  )}
                >
                  <div className="h-5 w-5 flex items-center justify-center font-bold text-xs">WEB</div>
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">Tylko online</p>
                  <p className="text-xs text-zinc-400">Konsultacje wyłącznie zdalne</p>
                </div>
              </Label>
              <Switch
                id="onlineOnly-switch"
                checked={!!formData.onlineOnly}
                onCheckedChange={(val) => handleInputChange("onlineOnly", val)}
              />
            </div>
          </div>

          {!formData.callaPolska && (
            <div className="pt-6 border-t border-border/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h4 className="text-sm font-semibold text-white">Lokalizacje stacjonarne</h4>
                <div className="flex gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-700 border border-zinc-800/50 text-zinc-300">
                    Województwa:{" "}
                    <span className={cn(
                      "font-semibold",
                      formData.voivodeshipsIds.length >= maxVoivodeships ? "text-amber-400" : "text-primary"
                    )}>
                      {formData.voivodeshipsIds.length}
                    </span>
                    <span className="text-zinc-500">/</span>
                    <span className="text-zinc-400">{maxVoivodeships}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-700 border border-zinc-800/50 text-zinc-300">
                    Miasta:{" "}
                    <span className={cn(
                      "font-semibold",
                      formData.citiesIds.length >= maxCities ? "text-amber-400" : "text-primary"
                    )}>
                      {formData.citiesIds.length}
                    </span>
                    <span className="text-zinc-500">/</span>
                    <span className="text-zinc-400">{maxCities}</span>
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Województwa */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase text-zinc-500 tracking-wider px-1">Województwa</h5>
                  <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar border border-border/20 rounded-2xl p-4 bg-zinc-950/40 backdrop-blur-sm shadow-inner">
                    {voivodeships.map((v) => (
                      <div
                        key={v.id}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200",
                          formData.voivodeshipsIds.includes(v.id)
                            ? "bg-primary/5 border-primary/30 text-primary font-medium"
                            : "border-transparent bg-transparent hover:bg-zinc-800/20 text-zinc-300 hover:text-white"
                        )}
                      >
                        <Checkbox
                          id={`voiv-${v.id}`}
                          checked={formData.voivodeshipsIds.includes(v.id)}
                          onCheckedChange={() => toggleVoivodeship(v.id)}
                        />
                        <Label
                          htmlFor={`voiv-${v.id}`}
                          className="text-sm cursor-pointer flex-1 py-1"
                        >
                          {v.nazwa}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Miasta */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase text-zinc-500 tracking-wider px-1">
                    Miasta w wybranych województwach
                  </h5>
                  <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar border border-border/20 rounded-2xl p-4 bg-zinc-950/40 backdrop-blur-sm shadow-inner">
                    {formData.voivodeshipsIds.length === 0 ? (
                      <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-zinc-500 py-16 opacity-60">
                        <MapPin className="h-8 w-8 mb-2 text-zinc-600 animate-pulse" />
                        <p className="text-xs font-medium">Wybierz województwo po lewej stronie</p>
                      </div>
                    ) : (
                      formData.voivodeshipsIds.map((vId) => {
                        const vName = voivodeships.find((v) => v.id === vId)?.nazwa
                        const cities = citiesByVoivodeship[vId] || []
                        const isLoading = loadingCities[vId]

                        return (
                          <div key={vId} className="mb-4 last:mb-0">
                            <div className="text-xs font-bold text-secondary mb-2 flex items-center gap-2 uppercase tracking-wide">
                              <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                              {vName}
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              {isLoading ? (
                                <div className="py-2 flex items-center gap-2 text-xs text-zinc-500">
                                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                  Ładowanie miast...
                                </div>
                              ) : cities.length === 0 ? (
                                <div className="py-2 text-xs italic text-zinc-500">Brak miast w bazie.</div>
                              ) : (
                                <>
                                  {cities.map((city) => (
                                    <div
                                      key={city.id}
                                      className={cn(
                                        "flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200",
                                        formData.citiesIds.includes(city.id)
                                          ? "bg-primary/10 text-primary font-medium border border-primary/20"
                                          : "hover:bg-zinc-800/20 text-zinc-300 hover:text-white border border-transparent"
                                      )}
                                    >
                                      <Checkbox
                                        id={`city-${city.id}`}
                                        checked={formData.citiesIds.includes(city.id)}
                                        onCheckedChange={() => toggleCity(city.id)}
                                      />
                                      <Label
                                        htmlFor={`city-${city.id}`}
                                        className="text-xs cursor-pointer flex-1 py-1"
                                      >
                                        {city.nazwa}
                                      </Label>
                                    </div>
                                  ))}
                                  {hasMoreCities?.[vId] && (
                                    <CityLazyLoadTrigger
                                      voivodeshipId={vId}
                                      fetchMoreCities={fetchMoreCities}
                                      isLoadingMore={loadingMoreCities?.[vId]}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
