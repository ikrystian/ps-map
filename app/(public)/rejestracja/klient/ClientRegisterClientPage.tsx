"use client"

import { AuthLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, Eye, EyeOff } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Voivodeship {
  id: string
  nazwa: string
}

// Client-side cache for city searches to avoid redundant api queries
const clientCitiesCache: Record<string, any[]> = {}

export default function ClientRegistrationPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    imie: "",
    nazwisko: "",
    telefon: "",
    kodPocztowy: "",
    miasto: "",
    voivodeshipId: "",
    zgodaRegulamin: false,
    zgodaNewsletter: false,
    zgodaMarketing: false,
    clientType: "INDIVIDUAL",
    nazwaFirmy: "",
    nip: "",
    regon: "",
    krs: "",
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Inicjalizacja danych z localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("client_registration_data")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData(prev => ({
          ...prev,
          ...parsedData,
          password: "",
          confirmPassword: "",
        }))
      } catch (e) {
        console.error("Error loading client registration data:", e)
      }
    }
    setIsInitialized(true)
  }, [])

  // Zapisywanie danych do localStorage
  useEffect(() => {
    if (!isInitialized) return
    const { password, confirmPassword, ...dataToSave } = formData
    localStorage.setItem("client_registration_data", JSON.stringify(dataToSave))
  }, [formData, isInitialized])

  // Pobieranie listy województw
  useEffect(() => {
    const fetchVoivodeships = async () => {
      try {
        const response = await fetch("/api/voivodeships")
        if (response.ok) {
          const data = await response.json()
          setVoivodeships(data)
        }
      } catch (error) {
        console.error("Error fetching voivodeships:", error)
      }
    }
    fetchVoivodeships()
  }, [])

  // Dynamic fetch and caching for cities and postal codes
  useEffect(() => {
    const query = locationSearch.trim().toLowerCase()

    // If search query is short/empty, check if we can show cities for the postal code
    if (query.length < 2) {
      if (formData.kodPocztowy && formData.kodPocztowy.length === 6) {
        const fetchCitiesForPostal = async () => {
          setIsLoadingCities(true)
          try {
            const response = await fetch(`/api/cities?search=${formData.kodPocztowy}`)
            if (response.ok) {
              const data = await response.json()
              if (Array.isArray(data)) {
                setCities(data)

                // If exactly 1 city matches and is different from current form data
                if (data.length === 1) {
                  const matchedCity = data[0]
                  setFormData(prev => {
                    if (prev.miasto === matchedCity.nazwa && prev.voivodeshipId === matchedCity.voivodeshipId) {
                      return prev
                    }
                    return {
                      ...prev,
                      miasto: matchedCity.nazwa,
                      voivodeshipId: matchedCity.voivodeshipId
                    }
                  })

                  // Clear errors
                  setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors.miasto
                    delete newErrors.voivodeshipId
                    return newErrors
                  })
                }
              }
            }
          } catch (error) {
            console.error("Error fetching cities by postal code:", error)
          } finally {
            setIsLoadingCities(false)
          }
        }
        fetchCitiesForPostal()
      } else {
        setCities([])
        setIsLoadingCities(false)
      }
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
  }, [locationSearch, formData.kodPocztowy])

  // Reset location search when popover closes
  useEffect(() => {
    if (!locationOpen) {
      setLocationSearch("")
      // Keep cities list if we have a valid postal code so it is shown when popover opens next time
      if (formData.kodPocztowy?.length !== 6) {
        setCities([])
      }
    }
  }, [locationOpen, formData.kodPocztowy])

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, "")
    if (val.length > 5) val = val.slice(0, 5)

    let formatted = val
    if (val.length > 2) {
      formatted = `${val.slice(0, 2)}-${val.slice(2)}`
    }

    setFormData(prev => {
      const shouldClear = formatted.length < 6 && prev.kodPocztowy !== formatted
      return {
        ...prev,
        kodPocztowy: formatted,
        ...(shouldClear ? { miasto: "", voivodeshipId: "" } : {})
      }
    })

    if (errors.kodPocztowy) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.kodPocztowy
        return newErrors
      })
    }
  }

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        email: session.user.email || "",
        imie: session.user.name?.split(" ")[0] || "",
        nazwisko: session.user.name?.split(" ").slice(1).join(" ") || "",
      }))
    }
  }, [session])

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError("")
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Imię
    if (!formData.imie.trim()) {
      newErrors.imie = "Imię jest wymagane"
    } else if (formData.imie.trim().length < 2) {
      newErrors.imie = "Imię musi mieć co najmniej 2 znaki"
    }

    // Nazwisko
    if (!formData.nazwisko.trim()) {
      newErrors.nazwisko = "Nazwisko jest wymagane"
    } else if (formData.nazwisko.trim().length < 2) {
      newErrors.nazwisko = "Nazwisko musi mieć co najmniej 2 znaki"
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Adres email jest wymagany"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Podaj poprawny adres email"
      }
    }

    // Telefon (opcjonalny, ale jeśli wpisany, to musi być poprawny)
    if (formData.telefon && formData.telefon.trim()) {
      const phoneRegex = /^[+0-9\s-]{9,15}$/
      if (!phoneRegex.test(formData.telefon)) {
        newErrors.telefon = "Podaj poprawny numer telefonu (9-15 cyfr)"
      }
    }

    // Walidacja NIP dla firm, jeśli podano
    if (formData.clientType === "BUSINESS" && formData.nip && formData.nip.trim()) {
      const cleanNip = formData.nip.replace(/[^0-9]/g, "")
      if (cleanNip.length !== 10) {
        newErrors.nip = "Numer NIP musi składać się z 10 cyfr"
      }
    }

    // Kod pocztowy
    if (!formData.kodPocztowy) {
      newErrors.kodPocztowy = "Kod pocztowy jest wymagany"
    } else {
      const postalRegex = /^\d{2}-\d{3}$/
      if (!postalRegex.test(formData.kodPocztowy)) {
        newErrors.kodPocztowy = "Wpisz poprawny kod pocztowy (np. 00-000)"
      }
    }

    // Miasto
    if (!formData.miasto.trim()) {
      newErrors.miasto = "Miasto jest wymagane"
    }

    // Województwo
    if (!formData.voivodeshipId) {
      newErrors.voivodeshipId = "Województwo jest wymagane"
    }

    // Hasło i potwierdzenie (tylko przy rejestracji tradycyjnej, bez sesji social)
    if (!session) {
      if (!formData.password) {
        newErrors.password = "Hasło jest wymagane"
      } else if (formData.password.length < 8) {
        newErrors.password = "Hasło musi mieć co najmniej 8 znaków"
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Potwierdzenie hasła jest wymagane"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Hasła nie są identyczne"
      }
    }

    // Regulamin
    if (!formData.zgodaRegulamin) {
      newErrors.zgodaRegulamin = "Musisz zaakceptować regulamin i politykę prywatności"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Walidacja
    if (!validateForm()) {
      setError("Formularz zawiera błędy. Popraw zaznaczone pola.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: session?.user ? undefined : formData.password,
          isSocialRegistration: !!session?.user,
          role: "CLIENT",
          name: formData.clientType === "BUSINESS" && formData.nazwaFirmy.trim()
            ? formData.nazwaFirmy.trim()
            : `${formData.imie} ${formData.nazwisko}`,
          client: {
            clientType: formData.clientType,
            imie: formData.imie,
            nazwisko: formData.nazwisko,
            telefon: formData.telefon,
            miasto: formData.miasto,
            kodPocztowy: formData.kodPocztowy || null,
            voivodeshipId: formData.voivodeshipId || null,
            nazwaFirmy: formData.clientType === "BUSINESS" ? (formData.nazwaFirmy || null) : null,
            nip: formData.clientType === "BUSINESS" ? (formData.nip || null) : null,
            regon: formData.clientType === "BUSINESS" ? (formData.regon || null) : null,
            krs: formData.clientType === "BUSINESS" ? (formData.krs || null) : null,
            zgodaRegulamin: formData.zgodaRegulamin,
            zgodaNewsletter: formData.zgodaNewsletter,
            zgodaMarketing: formData.zgodaMarketing,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Wystąpił błąd podczas rejestracji")
        setIsLoading(false)
        return
      }

      // Wyczyść dane z localStorage po pomyślnej rejestracji
      localStorage.removeItem("client_registration_data")

      // Przekieruj na stronę sukcesu rejestracji z e-mailem w parametrze
      router.push(`/rejestracja/sukces?email=${encodeURIComponent(formData.email)}&role=CLIENT`)
    } catch (error) {
      setError("Wystąpił błąd podczas rejestracji")
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      heroTitle="Dołącz do tysięcy zadowolonych klientów"
      heroDescription="Znajdź najlepszych prawników w Polsce. Szybko, łatwo i bezpiecznie rozwiąż swoje problemy prawne."
      heroStats={[
        { value: 10, unit: " min", label: "Średni czas odpowiedzi" },
        { value: 5000, unit: "+", label: "Rozwiązanych spraw" },
        { value: 4.8, unit: "/5", label: "Średnia ocena" },
      ]}
    >
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="space-y-1 px-0">
          <CardTitle className="text-2xl font-bold">Rejestracja klienta</CardTitle>
          <CardDescription>
            Już masz konto?{" "}
            <Link href="/logowanie" className="text-primary hover:underline">
              Zaloguj się
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Typ konta */}
              <div className="space-y-2 md:col-span-2">
                <Label>Typ konta</Label>
                <div className="flex gap-4 p-1.5 bg-muted rounded-xl w-full border border-border">
                  <button
                    type="button"
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200",
                      formData.clientType === "INDIVIDUAL"
                        ? "bg-background text-foreground shadow-sm scale-100"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => handleChange("clientType", "INDIVIDUAL")}
                  >
                    Osoba Prywatna
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200",
                      formData.clientType === "BUSINESS"
                        ? "bg-background text-foreground shadow-sm scale-100"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => handleChange("clientType", "BUSINESS")}
                  >
                    Firma / Organizacja
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imie" className={cn(errors.imie && "text-destructive")}>Imię *</Label>
                <Input
                  id="imie"
                  type="text"
                  value={formData.imie}
                  onChange={(e) => handleChange("imie", e.target.value)}
                  disabled={isLoading}
                  className={cn("h-11", errors.imie && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.imie && (
                  <p className="text-xs text-destructive mt-1">{errors.imie}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nazwisko" className={cn(errors.nazwisko && "text-destructive")}>Nazwisko *</Label>
                <Input
                  id="nazwisko"
                  type="text"
                  value={formData.nazwisko}
                  onChange={(e) => handleChange("nazwisko", e.target.value)}
                  disabled={isLoading}
                  className={cn("h-11", errors.nazwisko && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.nazwisko && (
                  <p className="text-xs text-destructive mt-1">{errors.nazwisko}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className={cn(errors.email && "text-destructive")}>Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={isLoading}
                  className={cn("h-11", errors.email && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefon" className={cn(errors.telefon && "text-destructive")}>Telefon</Label>
                <Input
                  id="telefon"
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => handleChange("telefon", e.target.value)}
                  disabled={isLoading}
                  className={cn("h-11", errors.telefon && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.telefon && (
                  <p className="text-xs text-destructive mt-1">{errors.telefon}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="kodPocztowy" className={cn(errors.kodPocztowy && "text-destructive")}>Kod pocztowy *</Label>
                  <Input
                    id="kodPocztowy"
                    type="text"
                    value={formData.kodPocztowy}
                    onChange={handlePostalCodeChange}
                    placeholder="00-000"
                    disabled={isLoading}
                    className={cn("h-11", errors.kodPocztowy && "border-destructive focus-visible:ring-destructive")}
                  />
                  {errors.kodPocztowy && <p className="text-xs text-destructive mt-1">{errors.kodPocztowy}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="miasto" className={cn(errors.miasto && "text-destructive")}>Miasto *</Label>
                  <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={locationOpen}
                        className={cn("w-full justify-between h-11 font-normal text-left", errors.miasto && "border-destructive")}
                        disabled={isLoading}
                      >
                        <span className="truncate">{formData.miasto || "Wybierz miasto..."}</span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Szukaj miasta..."
                          value={locationSearch}
                          onValueChange={setLocationSearch}
                        />
                        <CommandList>
                          {isLoadingCities && (
                            <div className="text-neutral-500 py-3 text-center text-xs">Wyszukiwanie...</div>
                          )}
                          {!isLoadingCities && locationSearch.trim().length < 2 && cities.length === 0 && (
                            <div className="text-neutral-500 py-3 text-center text-xs px-3">
                              Wpisz co najmniej 2 znaki...
                            </div>
                          )}
                          {!isLoadingCities && (locationSearch.trim().length >= 2 || cities.length > 0) && cities.length === 0 && (
                            <div className="text-neutral-500 py-3 text-center text-xs">Nie znaleziono miasta.</div>
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
                                    const selectedPostalCode = matchedPostal?.code || city.postalCodes?.[0]?.code || "00-000"
                                    setFormData(prev => ({
                                      ...prev,
                                      miasto: city.nazwa,
                                      voivodeshipId: city.voivodeshipId,
                                      kodPocztowy: selectedPostalCode,
                                    }))
                                    setErrors(prev => {
                                      const newErrors = { ...prev }
                                      delete newErrors.miasto
                                      delete newErrors.voivodeshipId
                                      delete newErrors.kodPocztowy
                                      return newErrors
                                    })
                                    setLocationOpen(false)
                                  }}
                                  className="cursor-pointer flex items-center justify-between gap-2 py-2 px-3 text-sm rounded-md data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
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
                  {errors.miasto && <p className="text-xs text-destructive mt-1">{errors.miasto}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voivodeshipId" className={cn(errors.voivodeshipId && "text-destructive")}>Województwo *</Label>
                  <Select
                    value={formData.voivodeshipId}
                    onValueChange={(val) => {
                      setFormData(prev => ({ ...prev, voivodeshipId: val }))
                      if (errors.voivodeshipId) {
                        setErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.voivodeshipId
                          return newErrors
                        })
                      }
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={cn("h-11", errors.voivodeshipId && "border-destructive focus:ring-destructive")}>
                      <SelectValue placeholder="Wybierz..." />
                    </SelectTrigger>
                    <SelectContent>
                      {voivodeships.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.nazwa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.voivodeshipId && <p className="text-xs text-destructive mt-1">{errors.voivodeshipId}</p>}
                </div>
              </div>

              {formData.clientType === "BUSINESS" && (
                <div className="space-y-4 p-4 border border-border rounded-xl bg-card/50 animate-in fade-in slide-in-from-top-4 duration-300 md:col-span-2">
                  <h3 className="font-semibold text-sm">Dane firmy / organizacji (opcjonalnie)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nazwaFirmy">Nazwa firmy</Label>
                      <Input
                        id="nazwaFirmy"
                        placeholder="ACME Sp. z o.o."
                        value={formData.nazwaFirmy}
                        onChange={(e) => handleChange("nazwaFirmy", e.target.value)}
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nip" className={cn(errors.nip && "text-destructive")}>NIP</Label>
                      <Input
                        id="nip"
                        placeholder="1234567890"
                        value={formData.nip}
                        onChange={(e) => handleChange("nip", e.target.value)}
                        disabled={isLoading}
                        className={cn("h-11", errors.nip && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.nip && (
                        <p className="text-xs text-destructive mt-1">{errors.nip}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regon">REGON</Label>
                      <Input
                        id="regon"
                        placeholder="123456789"
                        value={formData.regon}
                        onChange={(e) => handleChange("regon", e.target.value)}
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="krs">KRS</Label>
                      <Input
                        id="krs"
                        placeholder="0000123456"
                        value={formData.krs}
                        onChange={(e) => handleChange("krs", e.target.value)}
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              )}

              {!session && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password" className={cn(errors.password && "text-destructive")}>Hasło *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        disabled={isLoading}
                        className={cn("h-11 pr-10", errors.password && "border-destructive focus-visible:ring-destructive")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className={cn(errors.confirmPassword && "text-destructive")}>Potwierdź hasło *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        disabled={isLoading}
                        className={cn("h-11 pr-10", errors.confirmPassword && "border-destructive focus-visible:ring-destructive")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="zgodaRegulamin"
                  checked={formData.zgodaRegulamin}
                  onCheckedChange={(checked) =>
                    handleChange("zgodaRegulamin", checked === true)
                  }
                  disabled={isLoading}
                  className={cn(errors.zgodaRegulamin && "border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive")}
                />
                <label htmlFor="zgodaRegulamin" className={cn("text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer", errors.zgodaRegulamin && "text-destructive")}>
                  Akceptuję <Link href="/regulamin" className="text-primary hover:underline">regulamin</Link> i <Link href="/polityka-prywatnosci" className="text-primary hover:underline">politykę prywatności</Link> *
                </label>
              </div>
              {errors.zgodaRegulamin && (
                <p className="text-xs text-destructive mt-1 ml-7">{errors.zgodaRegulamin}</p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="zgodaNewsletter"
                checked={formData.zgodaNewsletter}
                onCheckedChange={(checked) =>
                  handleChange("zgodaNewsletter", checked === true)
                }
                disabled={isLoading}
              />
              <label htmlFor="zgodaNewsletter" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Chcę otrzymywać newsletter
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="zgodaMarketing"
                checked={formData.zgodaMarketing}
                onCheckedChange={(checked) =>
                  handleChange("zgodaMarketing", checked === true)
                }
                disabled={isLoading}
              />
              <label htmlFor="zgodaMarketing" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Chcę otrzymywać informacje marketingowe
              </label>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Rejestrowanie..." : session ? "Dokończ rejestrację" : "Zarejestruj się"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
