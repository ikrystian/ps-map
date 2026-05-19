"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  Briefcase,
  Building2,
  User,
  MapPin,
  Globe,
  Scale,
  Zap,
  Lock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { AuthLayout } from "@/components/auth"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, X } from "lucide-react"

interface Voivodeship {
  id: string
  nazwa: string
}

interface Category {
  id: string
  nazwa: string
  parentId?: string | null
}

const steps = [
  { id: 1, title: "Działalność", icon: Briefcase },
  { id: 2, title: "Firma", icon: Building2 },
  { id: 3, title: "Kontakt", icon: User },
  { id: 4, title: "Adres", icon: MapPin },
  { id: 5, title: "Obszar", icon: Globe },
  { id: 6, title: "Specjalizacje", icon: Scale },
  { id: 7, title: "Oferta", icon: Zap },
  { id: 8, title: "Konto", icon: Lock },
]

export default function LawFirmRegistrationPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Odczytaj krok z URL lub localStorage
  const [currentStep, setCurrentStep] = useState(1)
  const [isInitialized, setIsInitialized] = useState(false)

  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [locationOpen, setLocationOpen] = useState(false)
  const [formData, setFormData] = useState({
    // Krok 1: Typ działalności
    typ: "",
    typInny: "",

    // Krok 2: Dane firmy
    nazwa: "",
    nazwaFirmy: "",
    nip: "",
    regon: "",
    krs: "",

    // Krok 3: Dane kontaktowe
    imieKontakt: "",
    nazwiskoKontakt: "",
    stanowisko: "",
    numerTelefonu: "",
    numerTelefonu2: "",
    emailKontakt: "",

    // Krok 4: Adres siedziby
    adres: "",
    kodPocztowy: "",
    miasto: "",
    voivodeshipId: "",

    // Krok 5: Obszar działania
    voivodeshipsIds: [] as string[],
    callaPolska: false,

    // Krok 6: Specjalizacje
    categoriesIds: [] as string[],

    // Krok 7: Typ oferty
    typOferty: "",

    // Krok 8: Dane logowania
    email: "",
    password: "",
    confirmPassword: "",
    zgodaRegulamin: false,
    zgodaPrzetwarzanie: false,
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const totalSteps = steps.length

  // Synchronizacja kroku z URL
  useEffect(() => {
    const stepParam = searchParams.get("step")
    if (stepParam) {
      const step = parseInt(stepParam)
      if (step >= 1 && step <= totalSteps && step !== currentStep) {
        setCurrentStep(step)
      }
    }
  }, [searchParams, totalSteps])

  // Inicjalizacja danych z localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("law_firm_registration_data")
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
        console.error("Error loading registration data:", e)
      }
    }

    const savedStep = localStorage.getItem("law_firm_registration_step")
    if (savedStep && !searchParams.get("step")) {
      const step = parseInt(savedStep)
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step)
        const params = new URLSearchParams(searchParams)
        params.set("step", step.toString())
        router.replace(`${pathname}?${params.toString()}`)
      }
    }

    setIsInitialized(true)
  }, [])

  // Zapisywanie danych do localStorage
  useEffect(() => {
    if (!isInitialized) return

    const { password, confirmPassword, ...dataToSave } = formData
    localStorage.setItem("law_firm_registration_data", JSON.stringify(dataToSave))
    localStorage.setItem("law_firm_registration_step", currentStep.toString())
  }, [formData, currentStep, isInitialized])

  useEffect(() => {
    if (session?.user?.email) {
      setFormData(prev => {
        if (prev.email === session.user.email && prev.emailKontakt === session.user.email) {
          return prev
        }
        return {
          ...prev,
          email: session.user.email || prev.email,
          emailKontakt: session.user.email || prev.emailKontakt,
        }
      })
    }
  }, [session?.user?.email])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voivRes, catRes] = await Promise.all([
          fetch("/api/voivodeships"),
          fetch("/api/categories"),
        ])

        if (voivRes.ok) {
          const voivData = await voivRes.json()
          setVoivodeships(voivData)
        }

        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData)
        }

        const cityRes = await fetch("/api/cities")
        if (cityRes.ok) {
          const cityData = await cityRes.json()
          if (Array.isArray(cityData)) {
            setCities(cityData)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.typ) {
          setError("Wybierz typ działalności")
          return false
        }
        break
      case 2:
        if (!formData.nazwa || !formData.nazwaFirmy || !formData.nip) {
          setError("Wypełnij nazwę kancelarii, nazwę firmy i NIP")
          return false
        }
        if (formData.nip.length < 10) {
          setError("NIP musi mieć co najmniej 10 znaków")
          return false
        }
        break
      case 3:
        if (!formData.imieKontakt || !formData.nazwiskoKontakt || !formData.numerTelefonu || !formData.emailKontakt) {
          setError("Wypełnij wszystkie wymagane dane kontaktowe")
          return false
        }
        break
      case 4:
        if (!formData.adres || !formData.kodPocztowy || !formData.miasto || !formData.voivodeshipId) {
          setError("Wypełnij wszystkie dane adresowe")
          return false
        }
        break
      case 7:
        if (!formData.typOferty) {
          setError("Wybierz typ oferty")
          return false
        }
        break
      case 8:
        if (!session && (!formData.email || !formData.password)) {
          setError("Wypełnij email i hasło")
          return false
        }
        if (!session && formData.password !== formData.confirmPassword) {
          setError("Hasła nie są identyczne")
          return false
        }
        if (!formData.zgodaRegulamin || !formData.zgodaPrzetwarzanie) {
          setError("Musisz zaakceptować regulamin i zgodę na przetwarzanie danych")
          return false
        }
        break
    }
    return true
  }

  const updateUrlWithStep = (step: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("step", step.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const nextStep = () => {
    setError("")
    if (!validateStep()) {
      return
    }
    if (currentStep < totalSteps) {
      updateUrlWithStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setError("")
    if (currentStep > 1) {
      updateUrlWithStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (currentStep < totalSteps) {
      nextStep()
      return
    }

    // Walidacja finalna
    if (!validateStep()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/law-firms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          typ: formData.typ,
          typInny: formData.typInny || null,
          nazwa: formData.nazwa,
          nazwaFirmy: formData.nazwaFirmy,
          nip: formData.nip,
          regon: formData.regon || null,
          krs: formData.krs || null,
          imieKontakt: formData.imieKontakt,
          nazwiskoKontakt: formData.nazwiskoKontakt,
          stanowisko: formData.stanowisko || null,
          numerTelefonu: formData.numerTelefonu,
          numerTelefonu2: formData.numerTelefonu2 || null,
          emailKontakt: formData.emailKontakt,
          adres: formData.adres,
          kodPocztowy: formData.kodPocztowy,
          miasto: formData.miasto,
          voivodeshipId: formData.voivodeshipId,
          typOferty: formData.typOferty,
          zgodaRegulamin: formData.zgodaRegulamin,
          zgodaPrzetwarzanie: formData.zgodaPrzetwarzanie,
          callaPolska: formData.callaPolska,
          voivodeshipsIds: formData.voivodeshipsIds,
          categoriesIds: formData.categoriesIds,
          isSocialRegistration: !!session?.user,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Wystąpił błąd podczas rejestracji")
        setIsLoading(false)
        return
      }

      // Wyczyść dane z localStorage po pomyślnej rejestracji
      localStorage.removeItem("law_firm_registration_data")
      localStorage.removeItem("law_firm_registration_step")

      router.push("/logowanie?registered=true")
    } catch (error) {
      setError("Wystąpił błąd podczas rejestracji")
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="typ">Typ działalności *</Label>
              <Select
                value={formData.typ}
                onValueChange={(value) => setFormData({ ...formData, typ: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Wybierz typ działalności" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OSOBA_FIZYCZNA">Osoba fizyczna</SelectItem>
                  <SelectItem value="SPOLKA_CYWILNA">Spółka cywilna</SelectItem>
                  <SelectItem value="SPOLKA_PARTNERSKA">Spółka partnerska</SelectItem>
                  <SelectItem value="SPOLKA_KOMANDYTOWA">Spółka komandytowa</SelectItem>
                  <SelectItem value="SPOLKA_JAWNA">Spółka jawna</SelectItem>
                  <SelectItem value="SPOLKA_ZOO">Spółka z o.o.</SelectItem>
                  <SelectItem value="INNY">Inny</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.typ === "INNY" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label htmlFor="typInny">Podaj typ działalności</Label>
                <Input
                  id="typInny"
                  value={formData.typInny}
                  onChange={(e) => setFormData({ ...formData, typInny: e.target.value })}
                  placeholder="Np. fundacja, stowarzyszenie..."
                  className="h-11"
                />
              </motion.div>
            )}
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Wybierz formę prawną Twojej działalności. Pomoże nam to dostosować dalsze kroki rejestracji.
              </p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nazwa">Nazwa kancelarii *</Label>
              <Input
                id="nazwa"
                type="text"
                required
                value={formData.nazwa}
                onChange={(e) => setFormData({ ...formData, nazwa: e.target.value })}
                placeholder="Np. Kancelaria Adwokacka Jan Kowalski"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nazwaFirmy">Pełna nazwa firmy (do faktur) *</Label>
              <Input
                id="nazwaFirmy"
                type="text"
                required
                value={formData.nazwaFirmy}
                onChange={(e) => setFormData({ ...formData, nazwaFirmy: e.target.value })}
                placeholder="Pełna nazwa zarejestrowana w CEIDG/KRS"
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nip">NIP *</Label>
                <Input
                  id="nip"
                  type="text"
                  required
                  placeholder="1234567890"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regon">REGON</Label>
                <Input
                  id="regon"
                  type="text"
                  placeholder="Opcjonalnie"
                  value={formData.regon}
                  onChange={(e) => setFormData({ ...formData, regon: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="krs">KRS</Label>
              <Input
                id="krs"
                type="text"
                placeholder="Dla spółek handlowych"
                value={formData.krs}
                onChange={(e) => setFormData({ ...formData, krs: e.target.value })}
                className="h-11"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imieKontakt">Imię *</Label>
                <Input
                  id="imieKontakt"
                  type="text"
                  required
                  value={formData.imieKontakt}
                  onChange={(e) => setFormData({ ...formData, imieKontakt: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nazwiskoKontakt">Nazwisko *</Label>
                <Input
                  id="nazwiskoKontakt"
                  type="text"
                  required
                  value={formData.nazwiskoKontakt}
                  onChange={(e) => setFormData({ ...formData, nazwiskoKontakt: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stanowisko">Stanowisko / Tytuł zawodowy</Label>
              <Input
                id="stanowisko"
                type="text"
                placeholder="Np. Adwokat, Radca Prawny"
                value={formData.stanowisko}
                onChange={(e) => setFormData({ ...formData, stanowisko: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailKontakt">Email kontaktowy *</Label>
              <Input
                id="emailKontakt"
                type="email"
                placeholder="kontakt@kancelaria.pl"
                required
                value={formData.emailKontakt}
                onChange={(e) => setFormData({ ...formData, emailKontakt: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numerTelefonu">Telefon główny *</Label>
                <Input
                  id="numerTelefonu"
                  type="tel"
                  required
                  value={formData.numerTelefonu}
                  onChange={(e) => setFormData({ ...formData, numerTelefonu: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numerTelefonu2">Telefon dodatkowy</Label>
                <Input
                  id="numerTelefonu2"
                  type="tel"
                  placeholder="Opcjonalnie"
                  value={formData.numerTelefonu2}
                  onChange={(e) => setFormData({ ...formData, numerTelefonu2: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="adres">Adres (ulica i numer) *</Label>
              <Input
                id="adres"
                type="text"
                required
                value={formData.adres}
                onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                placeholder="Np. ul. Warszawska 1/2"
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kodPocztowy">Kod pocztowy *</Label>
                <Input
                  id="kodPocztowy"
                  type="text"
                  placeholder="00-000"
                  required
                  value={formData.kodPocztowy}
                  onChange={(e) => setFormData({ ...formData, kodPocztowy: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="miasto">Miasto *</Label>
                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={locationOpen}
                      className="w-full justify-between h-11 font-normal"
                      disabled={isLoading}
                    >
                      {formData.miasto || "Wybierz miasto..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Szukaj miasta..." />
                      <CommandList>
                        <CommandEmpty>Nie znaleziono miasta.</CommandEmpty>
                        <CommandGroup>
                          {cities.map((city) => (
                            <CommandItem
                              key={city.id}
                              value={city.nazwa}
                              onSelect={(currentValue) => {
                                const matchedCity = cities.find(c => c.nazwa.toLowerCase() === currentValue.toLowerCase()) || city
                                setFormData({ 
                                  ...formData, 
                                  miasto: matchedCity.nazwa,
                                  voivodeshipId: matchedCity.voivodeshipId
                                })
                                setLocationOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.miasto === city.nazwa ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {city.nazwa}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="voivodeshipId">Województwo siedziby *</Label>
              <Select
                value={formData.voivodeshipId}
                onValueChange={(value) => setFormData({ ...formData, voivodeshipId: value })}
              >
                <SelectTrigger className="h-11">
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
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 rounded-xl border border-primary/20 bg-primary/5 cursor-pointer transition-all hover:bg-primary/10"
              onClick={() => setFormData(prev => ({ ...prev, callaPolska: !prev.callaPolska }))}>
              <Checkbox
                id="callaPolska"
                checked={formData.callaPolska}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, callaPolska: checked === true }))}
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="callaPolska" className="text-sm font-medium cursor-pointer flex-1" onClick={(e) => e.stopPropagation()}>
                Działam na terenie całej Polski
              </label>
            </div>

            <AnimatePresence mode="wait">
              {!formData.callaPolska && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <Label>Województwa działania</Label>
                  <p className="text-sm text-muted-foreground">Wybierz województwa, w których świadczysz usługi stacjonarnie.</p>
                  <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-3 border rounded-xl bg-card">
                    {voivodeships.map((v) => (
                      <div key={v.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => {
                          setFormData(prev => {
                            const exists = prev.voivodeshipsIds.includes(v.id)
                            if (exists) {
                              return { ...prev, voivodeshipsIds: prev.voivodeshipsIds.filter(id => id !== v.id) }
                            } else {
                              return { ...prev, voivodeshipsIds: [...prev.voivodeshipsIds, v.id] }
                            }
                          })
                        }}>
                        <Checkbox
                          id={`voiv-${v.id}`}
                          checked={formData.voivodeshipsIds.includes(v.id)}
                          onCheckedChange={(checked) => {
                            setFormData(prev => {
                              const exists = prev.voivodeshipsIds.includes(v.id)
                              if (checked && !exists) {
                                return { ...prev, voivodeshipsIds: [...prev.voivodeshipsIds, v.id] }
                              } else if (!checked && exists) {
                                return { ...prev, voivodeshipsIds: prev.voivodeshipsIds.filter(id => id !== v.id) }
                              }
                              return prev
                            })
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <label htmlFor={`voiv-${v.id}`} className="text-sm cursor-pointer flex-1" onClick={(e) => e.stopPropagation()}>
                          {v.nazwa}
                        </label>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Twoje specjalizacje *</Label>
              <p className="text-sm text-muted-foreground">
                Zaznacz dziedziny prawa, w których posiadasz największe doświadczenie.
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto p-4 border rounded-xl bg-card">
                {categories
                  .filter((cat) => !cat.parentId)
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                        formData.categoriesIds.includes(cat.id)
                          ? "bg-primary/10 border-primary/30"
                          : "hover:bg-muted border-transparent"
                      )}
                      onClick={() => {
                        setFormData(prev => {
                          const exists = prev.categoriesIds.includes(cat.id)
                          if (exists) {
                            return { ...prev, categoriesIds: prev.categoriesIds.filter(id => id !== cat.id) }
                          } else {
                            return { ...prev, categoriesIds: [...prev.categoriesIds, cat.id] }
                          }
                        })
                      }}
                    >
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={formData.categoriesIds.includes(cat.id)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => {
                            const exists = prev.categoriesIds.includes(cat.id)
                            if (checked && !exists) {
                              return { ...prev, categoriesIds: [...prev.categoriesIds, cat.id] }
                            } else if (!checked && exists) {
                              return { ...prev, categoriesIds: prev.categoriesIds.filter(id => id !== cat.id) }
                            }
                            return prev
                          })
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label htmlFor={`cat-${cat.id}`} className="text-sm font-medium cursor-pointer flex-1" onClick={(e) => e.stopPropagation()}>
                        {cat.nazwa}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="typOferty">Preferowany typ współpracy *</Label>
              <Select
                value={formData.typOferty}
                onValueChange={(value) => setFormData({ ...formData, typOferty: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Wybierz typ współpracy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KONSULTACJA">Jednorazowa konsultacja</SelectItem>
                  <SelectItem value="JEDNORAZOWA_USLUGA">Konkretna usługa prawna</SelectItem>
                  <SelectItem value="STALA_WSPOLPRACA">Stała obsługa prawna</SelectItem>
                  <SelectItem value="WSZYSTKIE">Wszystkie rodzaje współpracy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Informacja o preferowanym typie współpracy pomoże nam lepiej dopasować zapytania klientów do Twojej praktyki.
              </p>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            {!session ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email logowania (Twój login) *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="login@portal.pl"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Hasło *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Potwierdź hasło *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-center gap-3">
                <CheckCircle2 className="text-primary w-6 h-6 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Zalogowano przez Google/Facebook</p>
                  <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-start space-x-3 group cursor-pointer"
                onClick={() => setFormData(prev => ({ ...prev, zgodaRegulamin: !prev.zgodaRegulamin }))}>
                <Checkbox
                  id="zgodaRegulamin"
                  required
                  checked={formData.zgodaRegulamin}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, zgodaRegulamin: checked === true }))}
                  disabled={isLoading}
                  className="mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                />
                <label htmlFor="zgodaRegulamin" className="text-sm leading-tight cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  Akceptuję <Link href="/regulamin" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>regulamin portalu</Link> *
                </label>
              </div>

              <div className="flex items-start space-x-3 group cursor-pointer"
                onClick={() => setFormData(prev => ({ ...prev, zgodaPrzetwarzanie: !prev.zgodaPrzetwarzanie }))}>
                <Checkbox
                  id="zgodaPrzetwarzanie"
                  required
                  checked={formData.zgodaPrzetwarzanie}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, zgodaPrzetwarzanie: checked === true }))}
                  disabled={isLoading}
                  className="mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                />
                <label htmlFor="zgodaPrzetwarzanie" className="text-sm leading-tight cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  Zgadzam się na <Link href="/polityka-prywatnosci" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>przetwarzanie moich danych osobowych</Link> w celu realizacji usług *
                </label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AuthLayout
      heroTitle="Rozwijaj swoją kancelarię z nami"
      heroDescription="Dołącz do największej w Polsce platformy łączącej prawników z klientami. Zyskaj dostęp do nowych spraw i buduj swoją markę online."
      heroStats={[
        { value: 2500, unit: "+", label: "Kancelarii" },
        { value: 12000, unit: "+", label: "Zapytań/mies." },
        { value: 96, unit: "%", label: "Zadowolenia" },
      ]}
    >
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="space-y-2 px-0 pt-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-extrabold tracking-tight">Rejestracja</CardTitle>
            <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
              Krok {currentStep} / {totalSteps}
            </span>
          </div>
          <CardDescription className="text-base">
            {steps[currentStep - 1].title}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pt-6">
          {/* Enhanced Progress Stepper */}
          <div className="relative flex justify-between mb-16 px-2">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
            <motion.div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 origin-left"
              initial={false}
              animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = step.id <= currentStep
              const isCurrent = step.id === currentStep

              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{
                      scale: isCurrent ? 1.15 : 1,
                      backgroundColor: isActive ? "var(--primary)" : "var(--muted)",
                      color: isActive ? "white" : "var(--muted-foreground)",
                    }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-shadow duration-300",
                      isActive ? "shadow-primary/25" : "shadow-none"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <span className={cn(
                    "absolute -bottom-8 text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap transition-all duration-300 hidden md:block",
                    isActive ? "text-primary opacity-100" : "text-muted-foreground opacity-60",
                    isCurrent ? "scale-110" : "scale-100"
                  )}>
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 min-h-[400px] flex flex-col">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-between gap-4 pt-8 border-t border-border/50">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-xl text-base font-semibold group"
                >
                  <ChevronLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  Wstecz
                </Button>
              ) : (
                <div className="flex-1 flex flex-col justify-center">
                  <Link href="/rejestracja" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center">
                    <ChevronLeft className="mr-1 h-4 w-4" /> Zmień typ konta
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 rounded-xl text-base font-bold shadow-xl shadow-primary/20 group"
              >
                {currentStep === totalSteps
                  ? isLoading
                    ? "Rejestrowanie..."
                    : "Zarejestruj się"
                  : (
                    <>
                      Dalej
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )
                }
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Masz już konto?{" "}
                <Link href="/logowanie" className="text-primary font-bold hover:underline">
                  Zaloguj się
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
