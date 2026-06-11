"use client"

import {
  AlertCircle,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Lock,
  MapPin,
  Scale,
  User,
  Zap
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { AuthLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { z } from "zod"

const specializationsData = {
  "Prawnicy": [
    "Adwokat",
    "Radca prawny",
    "Doradca podatkowy",
    "Rzecznik patentowy",
    "Doradca restrukturyzacyjny",
    "Mediator",
    "Syndyk"
  ],
  "Eksperci": {
    "Finanse": [
      "Doradca finansowy",
      "Księgowy",
      "Biegły rewident"
    ],
    "Budownictwo i nieruchomości": [
      "Rzeczoznawca majątkowy",
      "Geodeta",
      "Inspektor nadzoru budowlanego",
      "Kierownik budowy",
      "Kosztorysant budowlany",
      "Audytor energetyczny"
    ],
    "Motoryzacja i szkody": [
      "Rzeczoznawca samochodowy",
      "Ekspert ds. odszkodowań"
    ],
    "Biznes i firmy": [
      "Specjalista BHP",
      "Specjalista PPOŻ",
      "Specjalista RODO",
      "Specjalista Compliance",
      "Specjalista ds. zamówień publicznych",
      "Doradca biznesowy"
    ],
    "Medycyna i opinie": [
      "Psycholog",
      "Psycholog sądowy",
      "Lekarz biegły"
    ]
  },
  "Biegli i rzeczoznawcy": [
    "Biegły sądowy",
    "Rzeczoznawca majątkowy",
    "Rzeczoznawca samochodowy",
    "Rzeczoznawca budowlany",
    "Biegły księgowy",
    "Biegły z zakresu informatyki",
    "Biegły medyczny"
  ]
}

const step1Schema = z.object({
  category: z.string().min(1, "Wybierz kategorię"),
  subcategory: z.string().optional(),
  specialization: z.string().min(1, "Wybierz specjalizację"),
}).superRefine((data, ctx) => {
  const specData = specializationsData as any
  const categoryContent = specData[data.category]
  if (categoryContent && !Array.isArray(categoryContent)) {
    if (!data.subcategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wybierz podkategorię",
        path: ["subcategory"],
      })
    }
  }
})

const step6Schema = z.object({
  categoriesIds: z.array(z.string()).min(1, "Wybierz główną specjalizację"),
})

const step5Schema = z.object({
  voivodeshipsIds: z.array(z.string()).length(1, "Wybierz dokładnie jedno województwo"),
})

const step4Schema = z.object({
  // Dane firmy
  nazwaFirmy: z.string().min(3, "Pełna nazwa firmy musi mieć co najmniej 3 znaki"),
  nip: z.string().transform(v => v.replace(/[-\s]/g, "")).pipe(z.string().regex(/^\d{10}$/, "NIP musi składać się z 10 cyfr")),
  regon: z.string().transform(v => v ? v.replace(/[-\s]/g, "") : "").pipe(z.string().regex(/^\d{9}(\d{5})?$/, "REGON musi mieć 9 lub 14 cyfr").or(z.literal(""))).optional(),
  krs: z.string().transform(v => v ? v.replace(/[-\s]/g, "") : "").pipe(z.string().regex(/^\d{10}$/, "KRS musi mieć 10 cyfr").or(z.literal(""))).optional(),

  // Dane kontaktowe
  imieKontakt: z.string().min(2, "Imię jest wymagane"),
  nazwiskoKontakt: z.string().min(2, "Nazwisko jest wymagane"),
  numerTelefonu: z.string().min(9, "Podaj poprawny numer telefonu"),
  numerTelefonu2: z.string().optional(),

  // Adres
  adres: z.string().min(3, "Adres jest wymagany"),
  kodPocztowy: z.string().regex(/^\d{2}-\d{3}$/, "Wpisz poprawny kod pocztowy (np. 00-000)"),
  miasto: z.string().min(2, "Miasto jest wymagane"),
  voivodeshipId: z.string().min(1, "Województwo jest wymagane"),

  // Konto i zgody
  email: z.string().email("Podaj poprawny adres email"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
  confirmPassword: z.string(),
  zgodaRegulamin: z.boolean().refine(v => v === true, "Musisz zaakceptować regulamin"),
  zgodaPrzetwarzanie: z.boolean().refine(v => v === true, "Musisz zaakceptować przetwarzanie danych"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"]
})

import { Category, Voivodeship } from "@/types"

const steps = [
  { id: 1, title: "Działalność", icon: Briefcase },
  { id: 6, title: "Specjalizacje", icon: Scale },
  { id: 5, title: "Obszar", icon: Globe },
  { id: 4, title: "Dane kontaktowe", icon: User },
]

// Client-side cache for city searches to avoid redundant api queries
const clientCitiesCache: Record<string, any[]> = {}

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
  const [locationSearch, setLocationSearch] = useState("")
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [formData, setFormData] = useState({
    // Krok 1: Typ działalności
    typ: "INNY",
    typInny: "",
    category: "",
    subcategory: "",
    specialization: "",

    // Krok 2: Dane firmy
    nazwa: "",
    nazwaFirmy: "",
    nip: "",
    regon: "",
    krs: "",

    // Krok 3: Dane kontaktowe
    imieKontakt: "",
    nazwiskoKontakt: "",
    numerTelefonu: "",
    numerTelefonu2: "",
    emailKontakt: "",

    adres: "",
    kodPocztowy: "",
    miasto: "",
    voivodeshipId: "",

    // Krok 5: Obszar działania
    voivodeshipsIds: [] as string[],
    callaPolska: false,

    // Krok 6: Specjalizacje
    categoriesIds: [] as string[],

    // Krok 7: Typ oferty (domyślny)
    typOferty: "WSZYSTKIE",

    // Krok 8: Dane logowania
    email: "",
    password: "",
    confirmPassword: "",
    zgodaRegulamin: false,
    zgodaPrzetwarzanie: false,
  })
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const totalSteps = steps.length

  // Synchronizacja kroku z URL
  useEffect(() => {
    const stepParam = searchParams.get("step")
    if (stepParam) {
      const step = parseInt(stepParam)
      const isValidStep = steps.some(s => s.id === step)
      if (isValidStep && step !== currentStep) {
        setCurrentStep(step)
        setError("")
        setFieldErrors({})
      }
    }
  }, [searchParams])

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
      const isValidStep = steps.some(s => s.id === step)
      if (isValidStep) {
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
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  // Dynamic fetch and caching for cities and postal codes
  useEffect(() => {
    const query = locationSearch.trim().toLowerCase()

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

                  setFieldErrors(prev => {
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

    if (fieldErrors.kodPocztowy) {
      const newErrors = { ...fieldErrors }
      delete newErrors.kodPocztowy
      setFieldErrors(newErrors)
    }
  }

  const validateStep = () => {
    setError("")
    setFieldErrors({})

    let schema
    let dataToValidate = formData

    switch (currentStep) {
      case 1:
        schema = step1Schema
        break
      case 6:
        schema = step6Schema
        break
      case 5:
        schema = step5Schema
        break
      case 4:
        schema = step4Schema
        if (session) {
          dataToValidate = {
            ...formData,
            email: session.user?.email || "dummy@example.com",
            password: "dummypassword",
            confirmPassword: "dummypassword",
          }
        }
        break
      default:
        return true
    }

    if (schema) {
      const result = schema.safeParse(dataToValidate)
      if (!result.success) {
        const errors: Record<string, string> = {}
        result.error.issues.forEach((issue) => {
          const path = issue.path[0] as string
          if (!errors[path]) {
            errors[path] = issue.message
          }
        })
        setFieldErrors(errors)
        if (result.error.issues.length > 0) {
          setError(result.error.issues[0].message)
        }
        return false
      }
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
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex < steps.length - 1) {
      const nextStepId = steps[currentIndex + 1].id
      updateUrlWithStep(nextStepId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setError("")
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex > 0) {
      const prevStepId = steps[currentIndex - 1].id
      updateUrlWithStep(prevStepId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (currentStep !== 4) {
      nextStep()
      return
    }

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

      setIsInitialized(false)
      localStorage.removeItem("law_firm_registration_data")
      localStorage.removeItem("law_firm_registration_step")

      router.push(`/rejestracja/sukces?email=${encodeURIComponent(formData.email)}&role=LAW_FIRM`)
    } catch (error) {
      setError("Wystąpił błąd podczas rejestracji")
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: {
        const specData = specializationsData as any
        const categoriesList = Object.keys(specData)

        const selectedCategoryContent = formData.category ? specData[formData.category] : null
        const hasSubcategories = selectedCategoryContent && !Array.isArray(selectedCategoryContent)

        const subcategoriesList = hasSubcategories ? Object.keys(selectedCategoryContent) : []

        let specializationsList: string[] = []
        if (formData.category) {
          if (Array.isArray(selectedCategoryContent)) {
            specializationsList = selectedCategoryContent
          } else if (formData.subcategory && selectedCategoryContent[formData.subcategory]) {
            specializationsList = selectedCategoryContent[formData.subcategory]
          }
        }

        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category" className={cn(fieldErrors.category && "text-destructive")}>Kategoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(val) => {
                  setFormData(prev => ({
                    ...prev,
                    category: val,
                    subcategory: "",
                    specialization: "",
                    typ: "INNY",
                    typInny: val
                  }))
                  if (fieldErrors.category || fieldErrors.subcategory || fieldErrors.specialization) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev }
                      delete newErrors.category
                      delete newErrors.subcategory
                      delete newErrors.specialization
                      return newErrors
                    })
                  }
                }}
              >
                <SelectTrigger className={cn("h-11", fieldErrors.category && "border-destructive")}>
                  <SelectValue placeholder="Wybierz kategorię..." />
                </SelectTrigger>
                <SelectContent>
                  {categoriesList.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.category && <p className="text-xs text-destructive">{fieldErrors.category}</p>}
            </div>

            {hasSubcategories && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label htmlFor="subcategory" className={cn(fieldErrors.subcategory && "text-destructive")}>Podkategoria *</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(val) => {
                    setFormData(prev => ({
                      ...prev,
                      subcategory: val,
                      specialization: "",
                      typInny: `${prev.category} > ${val}`
                    }))
                    if (fieldErrors.subcategory || fieldErrors.specialization) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.subcategory
                        delete newErrors.specialization
                        return newErrors
                      })
                    }
                  }}
                >
                  <SelectTrigger className={cn("h-11", fieldErrors.subcategory && "border-destructive")}>
                    <SelectValue placeholder="Wybierz podkategorię..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategoriesList.map((subcat) => (
                      <SelectItem key={subcat} value={subcat}>
                        {subcat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.subcategory && <p className="text-xs text-destructive">{fieldErrors.subcategory}</p>}
              </motion.div>
            )}

            {formData.category && (!hasSubcategories || formData.subcategory) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label htmlFor="specialization" className={cn(fieldErrors.specialization && "text-destructive")}>Specjalizacja *</Label>
                <Select
                  value={formData.specialization}
                  onValueChange={(val) => {
                    setFormData(prev => {
                      const typInnyVal = prev.subcategory
                        ? `${prev.category} > ${prev.subcategory} > ${val}`
                        : `${prev.category} > ${val}`
                      return {
                        ...prev,
                        specialization: val,
                        typInny: typInnyVal
                      }
                    })
                    if (fieldErrors.specialization) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.specialization
                        return newErrors
                      })
                    }
                  }}
                >
                  <SelectTrigger className={cn("h-11", fieldErrors.specialization && "border-destructive")}>
                    <SelectValue placeholder="Wybierz specjalizację..." />
                  </SelectTrigger>
                  <SelectContent>
                    {specializationsList.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.specialization && <p className="text-xs text-destructive">{fieldErrors.specialization}</p>}
              </motion.div>
            )}

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Wybierz kategorię, podkategorię oraz swoją główną specjalizację zawodową. Pomoże nam to dostosować Twój profil dla potencjalnych klientów.
              </p>
            </div>
          </div>
        )
      }

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className={cn("text-base font-semibold", fieldErrors.categoriesIds && "text-destructive")}>Główna specjalizacja *</Label>
                <span className="text-xs text-muted-foreground">Wybierz jedną główną dziedzinę</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Zaznacz główną dziedzinę prawa, w której się specjalizujesz.
                Pomoże nam to lepiej dopasować zapytania od klientów.
              </p>
              <div className={cn("grid grid-cols-1 gap-3 max-h-[450px] overflow-y-auto p-2", fieldErrors.categoriesIds && "border-2 border-destructive rounded-xl")}>
                {categories
                  .filter((cat) => !cat.parentId)
                  .sort((a, b) => a.nazwa.localeCompare(b.nazwa))
                  .map((cat) => {
                    const isSelected = formData.categoriesIds.includes(cat.id)
                    return (
                      <div
                        key={cat.id}
                        className={cn(
                          "group relative flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary/5 border-primary shadow-sm"
                            : "bg-card border-transparent hover:border-primary/30 hover:bg-muted/50"
                        )}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            categoriesIds: [cat.id]
                          }))
                          if (fieldErrors.categoriesIds) {
                            const newErrors = { ...fieldErrors }
                            delete newErrors.categoriesIds
                            setFieldErrors(newErrors)
                          }
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                            isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/30"
                          )}>
                            {isSelected && <Check className="w-4 h-4" />}
                          </div>
                          <span className={cn(
                            "text-sm font-medium transition-colors",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {cat.nazwa}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="flex items-center text-sm font-bold uppercase tracking-wider text-primary px-2 py-1 bg-primary/10 rounded-md">
                            Wybrano
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
              {fieldErrors.categoriesIds && <p className="text-xs text-destructive">{fieldErrors.categoriesIds}</p>}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className={cn("text-base font-semibold", fieldErrors.voivodeshipsIds && "text-destructive")}>Województwo działania *</Label>
              </div>
              <p className="text-sm text-muted-foreground">Wybierz województwo, w którym świadczysz usługi stacjonarnie.</p>
              <div className={cn("grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-3 border rounded-xl bg-card", fieldErrors.voivodeshipsIds && "border-2 border-destructive")}>
                {voivodeships.map((v) => {
                  const isSelected = formData.voivodeshipsIds.includes(v.id)
                  return (
                    <div
                      key={v.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary/5 border-primary shadow-sm"
                          : "hover:bg-muted border-transparent"
                      )}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, voivodeshipsIds: [v.id], callaPolska: false }))
                        if (fieldErrors.voivodeshipsIds) {
                          const newErrors = { ...fieldErrors }
                          delete newErrors.voivodeshipsIds
                          setFieldErrors(newErrors)
                        }
                      }}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected ? "border-primary" : "border-muted-foreground/30"
                      )}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <span className={cn(
                        "text-sm transition-colors",
                        isSelected ? "text-primary font-medium" : "text-muted-foreground"
                      )}>
                        {v.nazwa}
                      </span>
                    </div>
                  )
                })}
              </div>
              {fieldErrors.voivodeshipsIds && <p className="text-sm text-destructive font-medium">{fieldErrors.voivodeshipsIds}</p>}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            {/* Dane firmy */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Dane firmy</h3>
              <div className="space-y-4">

                {/* nazwaFirmy */}
                <div className="space-y-2">
                  <Label htmlFor="nazwaFirmy" className={cn(fieldErrors.nazwaFirmy && "text-destructive")}>Pełna nazwa firmy (do faktur) *</Label>
                  <Input
                    id="nazwaFirmy"
                    type="text"
                    value={formData.nazwaFirmy}
                    onChange={(e) => {
                      setFormData({ ...formData, nazwaFirmy: e.target.value })
                      if (fieldErrors.nazwaFirmy) {
                        const newErrors = { ...fieldErrors }
                        delete newErrors.nazwaFirmy
                        setFieldErrors(newErrors)
                      }
                    }}
                    placeholder="Pełna nazwa zarejestrowana w CEIDG/KRS"
                    className={cn("h-11", fieldErrors.nazwaFirmy && "border-destructive")}
                  />
                  {fieldErrors.nazwaFirmy && <p className="text-xs text-destructive">{fieldErrors.nazwaFirmy}</p>}
                </div>
                {/* nip, regon, krs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nip" className={cn(fieldErrors.nip && "text-destructive")}>NIP *</Label>
                    <Input
                      id="nip"
                      type="text"
                      placeholder="1234567890"
                      value={formData.nip}
                      onChange={(e) => {
                        setFormData({ ...formData, nip: e.target.value })
                        if (fieldErrors.nip) {
                          const newErrors = { ...fieldErrors }
                          delete newErrors.nip
                          setFieldErrors(newErrors)
                        }
                      }}
                      className={cn("h-11", fieldErrors.nip && "border-destructive")}
                    />
                    {fieldErrors.nip && <p className="text-xs text-destructive">{fieldErrors.nip}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regon" className={cn(fieldErrors.regon && "text-destructive")}>REGON</Label>
                    <Input
                      id="regon"
                      type="text"
                      placeholder="Opcjonalnie"
                      value={formData.regon}
                      onChange={(e) => {
                        setFormData({ ...formData, regon: e.target.value })
                        if (fieldErrors.regon) {
                          const newErrors = { ...fieldErrors }
                          delete newErrors.regon
                          setFieldErrors(newErrors)
                        }
                      }}
                      className={cn("h-11", fieldErrors.regon && "border-destructive")}
                    />
                    {fieldErrors.regon && <p className="text-xs text-destructive">{fieldErrors.regon}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="krs" className={cn(fieldErrors.krs && "text-destructive")}>KRS</Label>
                    <Input
                      id="krs"
                      type="text"
                      placeholder="Dla spółek handlowych"
                      value={formData.krs}
                      onChange={(e) => {
                        setFormData({ ...formData, krs: e.target.value })
                        if (fieldErrors.krs) {
                          const newErrors = { ...fieldErrors }
                          delete newErrors.krs
                          setFieldErrors(newErrors)
                        }
                      }}
                      className={cn("h-11", fieldErrors.krs && "border-destructive")}
                    />
                    {fieldErrors.krs && <p className="text-xs text-destructive">{fieldErrors.krs}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Dane adresowe */}
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adres" className={cn(fieldErrors.adres && "text-destructive")}>Adres (ulica i numer) *</Label>
                  <Input
                    id="adres"
                    type="text"
                    value={formData.adres}
                    onChange={(e) => {
                      setFormData({ ...formData, adres: e.target.value })
                      if (fieldErrors.adres) {
                        const newErrors = { ...fieldErrors }
                        delete newErrors.adres
                        setFieldErrors(newErrors)
                      }
                    }}
                    placeholder="Np. ul. Warszawska 1/2"
                    className={cn("h-11", fieldErrors.adres && "border-destructive")}
                  />
                  {fieldErrors.adres && <p className="text-xs text-destructive">{fieldErrors.adres}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kodPocztowy" className={cn(fieldErrors.kodPocztowy && "text-destructive")}>Kod pocztowy *</Label>
                    <Input
                      id="kodPocztowy"
                      type="text"
                      value={formData.kodPocztowy}
                      onChange={handlePostalCodeChange}
                      placeholder="00-000"
                      className={cn("h-11", fieldErrors.kodPocztowy && "border-destructive")}
                    />
                    {fieldErrors.kodPocztowy && <p className="text-xs text-destructive">{fieldErrors.kodPocztowy}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="miasto" className={cn(fieldErrors.miasto && "text-destructive")}>Miasto *</Label>
                    <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={locationOpen}
                          className={cn("w-full justify-between h-11 font-normal text-left", fieldErrors.miasto && "border-destructive")}
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
                                      setFormData({
                                        ...formData,
                                        miasto: city.nazwa,
                                        voivodeshipId: city.voivodeshipId,
                                        kodPocztowy: selectedPostalCode,
                                      })
                                      if (fieldErrors.miasto) {
                                        const newErrors = { ...fieldErrors }
                                        delete newErrors.miasto
                                        setFieldErrors(newErrors)
                                      }
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
                    {fieldErrors.miasto && <p className="text-xs text-destructive">{fieldErrors.miasto}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="voivodeshipId" className={cn(fieldErrors.voivodeshipId && "text-destructive")}>Województwo *</Label>
                    <Select
                      value={formData.voivodeshipId}
                      onValueChange={(val) => {
                        setFormData({ ...formData, voivodeshipId: val })
                        if (fieldErrors.voivodeshipId) {
                          const newErrors = { ...fieldErrors }
                          delete newErrors.voivodeshipId
                          setFieldErrors(newErrors)
                        }
                      }}
                    >
                      <SelectTrigger className={cn("h-11", fieldErrors.voivodeshipId && "border-destructive")}>
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
                    {fieldErrors.voivodeshipId && <p className="text-xs text-destructive">{fieldErrors.voivodeshipId}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Dane kontaktowe */}
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imieKontakt" className={cn(fieldErrors.imieKontakt && "text-destructive")}>Imię *</Label>
                    <Input
                      id="imieKontakt"
                      type="text"
                      value={formData.imieKontakt}
                      onChange={(e) => {
                        setFormData({ ...formData, imieKontakt: e.target.value })
                        if (fieldErrors.imieKontakt) {
                          const newErrors = { ...fieldErrors }
                          delete newErrors.imieKontakt
                          setFieldErrors(newErrors)
                        }
                      }}
                      className={cn("h-11", fieldErrors.imieKontakt && "border-destructive")}
                    />
                    {fieldErrors.imieKontakt && <p className="text-xs text-destructive">{fieldErrors.imieKontakt}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nazwiskoKontakt" className={cn(fieldErrors.nazwiskoKontakt && "text-destructive")}>Nazwisko *</Label>
                    <Input
                      id="nazwiskoKontakt"
                      type="text"
                      value={formData.nazwiskoKontakt}
                      onChange={(e) => {
                        setFormData({ ...formData, nazwiskoKontakt: e.target.value })
                        if (fieldErrors.nazwiskoKontakt) {
                          const newErrors = { ...fieldErrors }
                          delete newErrors.nazwiskoKontakt
                          setFieldErrors(newErrors)
                        }
                      }}
                      className={cn("h-11", fieldErrors.nazwiskoKontakt && "border-destructive")}
                    />
                    {fieldErrors.nazwiskoKontakt && <p className="text-xs text-destructive">{fieldErrors.nazwiskoKontakt}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numerTelefonu" className={cn(fieldErrors.numerTelefonu && "text-destructive")}>Telefon główny *</Label>
                    <Input
                      id="numerTelefonu"
                      type="tel"
                      value={formData.numerTelefonu}
                      onChange={(e) => {
                        setFormData({ ...formData, numerTelefonu: e.target.value })
                        if (fieldErrors.numerTelefonu) {
                          const newErrors = { ...fieldErrors }
                          delete newErrors.numerTelefonu
                          setFieldErrors(newErrors)
                        }
                      }}
                      className={cn("h-11", fieldErrors.numerTelefonu && "border-destructive")}
                    />
                    {fieldErrors.numerTelefonu && <p className="text-xs text-destructive">{fieldErrors.numerTelefonu}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numerTelefonu2" className={cn(fieldErrors.numerTelefonu2 && "text-destructive")}>Telefon dodatkowy</Label>
                    <Input
                      id="numerTelefonu2"
                      type="tel"
                      placeholder="Opcjonalnie"
                      value={formData.numerTelefonu2}
                      onChange={(e) => {
                        setFormData({ ...formData, numerTelefonu2: e.target.value })
                        if (fieldErrors.numerTelefonu2) {
                          const newErrors = { ...fieldErrors }
                          delete newErrors.numerTelefonu2
                          setFieldErrors(newErrors)
                        }
                      }}
                      className={cn("h-11", fieldErrors.numerTelefonu2 && "border-destructive")}
                    />
                    {fieldErrors.numerTelefonu2 && <p className="text-xs text-destructive">{fieldErrors.numerTelefonu2}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Dane logowania i zgody */}
            <div className="space-y-4">
              <div className="space-y-4">
                {!session ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className={cn(fieldErrors.email && "text-destructive")}>Email logowania (Twój login) *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="login@portal.pl"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value })
                          if (fieldErrors.email) {
                            const newErrors = { ...fieldErrors }
                            delete newErrors.email
                            setFieldErrors(newErrors)
                          }
                        }}
                        disabled={isLoading}
                        className={cn("h-11", fieldErrors.email && "border-destructive")}
                      />
                      {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className={cn(fieldErrors.password && "text-destructive")}>Hasło *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => {
                              setFormData({ ...formData, password: e.target.value })
                              if (fieldErrors.password) {
                                const newErrors = { ...fieldErrors }
                                delete newErrors.password
                                setFieldErrors(newErrors)
                              }
                            }}
                            disabled={isLoading}
                            className={cn("h-11 pr-10", fieldErrors.password && "border-destructive")}
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
                        {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className={cn(fieldErrors.confirmPassword && "text-destructive")}>Potwierdź hasło *</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => {
                              setFormData({ ...formData, confirmPassword: e.target.value })
                              if (fieldErrors.confirmPassword) {
                                const newErrors = { ...fieldErrors }
                                delete newErrors.confirmPassword
                                setFieldErrors(newErrors)
                              }
                            }}
                            disabled={isLoading}
                            className={cn("h-11 pr-10", fieldErrors.confirmPassword && "border-destructive")}
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
                        {fieldErrors.confirmPassword && <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
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
                  <div
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer",
                      formData.zgodaRegulamin
                        ? "bg-primary/5 border-primary shadow-sm"
                        : "bg-card border-transparent hover:border-primary/30 hover:bg-muted/50",
                      fieldErrors.zgodaRegulamin && "border-destructive bg-destructive/5"
                    )}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, zgodaRegulamin: !prev.zgodaRegulamin }))
                      if (fieldErrors.zgodaRegulamin) {
                        const newErrors = { ...fieldErrors }
                        delete newErrors.zgodaRegulamin
                        setFieldErrors(newErrors)
                      }
                    }}
                  >
                    <div className={cn(
                      "w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                      formData.zgodaRegulamin ? "border-primary bg-primary text-white" : "border-muted-foreground/30",
                      fieldErrors.zgodaRegulamin && "border-destructive"
                    )}>
                      {formData.zgodaRegulamin && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <label htmlFor="zgodaRegulamin" className={cn("text-sm leading-tight cursor-pointer", fieldErrors.zgodaRegulamin && "text-destructive")} onClick={(e) => e.stopPropagation()}>
                        Akceptuję <Link href="/regulamin" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>regulamin portalu</Link> *
                      </label>
                      {fieldErrors.zgodaRegulamin && <p className="text-xs text-destructive mt-1">{fieldErrors.zgodaRegulamin}</p>}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer",
                      formData.zgodaPrzetwarzanie
                        ? "bg-primary/5 border-primary shadow-sm"
                        : "bg-card border-transparent hover:border-primary/30 hover:bg-muted/50",
                      fieldErrors.zgodaPrzetwarzanie && "border-destructive bg-destructive/5"
                    )}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, zgodaPrzetwarzanie: !prev.zgodaPrzetwarzanie }))
                      if (fieldErrors.zgodaPrzetwarzanie) {
                        const newErrors = { ...fieldErrors }
                        delete newErrors.zgodaPrzetwarzanie
                        setFieldErrors(newErrors)
                      }
                    }}
                  >
                    <div className={cn(
                      "w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                      formData.zgodaPrzetwarzanie ? "border-primary bg-primary text-white" : "border-muted-foreground/30",
                      fieldErrors.zgodaPrzetwarzanie && "border-destructive"
                    )}>
                      {formData.zgodaPrzetwarzanie && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <label htmlFor="zgodaPrzetwarzanie" className={cn("text-sm leading-tight cursor-pointer", fieldErrors.zgodaPrzetwarzanie && "text-destructive")} onClick={(e) => e.stopPropagation()}>
                        Zgadzam się na <Link href="/polityka-prywatnosci" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>przetwarzanie moich danych osobowych</Link> w celu realizacji usług *
                      </label>
                      {fieldErrors.zgodaPrzetwarzanie && <p className="text-xs text-destructive mt-1">{fieldErrors.zgodaPrzetwarzanie}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <AuthLayout
      heroTitle="Rozwijaj swój profil z nami"
      heroDescription="Dołącz do największej w Polsce platformy łączącej ekspertów i specjalistów z klientami. Zyskaj dostęp do nowych spraw i buduj swoją markę online."
      heroStats={[
        { value: 2500, unit: "+", label: "Ekspertów" },
        { value: 12000, unit: "+", label: "Zapytań/mies." },
        { value: 96, unit: "%", label: "Zadowolenia" },
      ]}
    >
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="space-y-2 px-0 pt-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-extrabold tracking-tight">Rejestracja</CardTitle>
            <span className="text-xs font-light bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
              Krok {currentStepIndex + 1} / {totalSteps}
            </span>
          </div>
          <CardDescription className="text-base">
            {steps[currentStepIndex]?.title}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pt-6">
          {/* Enhanced Progress Stepper */}
          <div className="relative flex justify-between mb-16 px-2">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
            <motion.div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 origin-left"
              initial={false}
              animate={{ width: `${(currentStepIndex / (totalSteps - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isActive = idx <= currentStepIndex
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
                    "absolute -bottom-8 text-sm font-light tracking-tighter whitespace-nowrap transition-all duration-300 hidden md:block",
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
              {currentStepIndex > 0 ? (
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
                className="flex-1 h-12 rounded-xl text-base font-light shadow-xl shadow-primary/20 group"
              >
                {currentStep === 4
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
