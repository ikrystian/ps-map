"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BorderBeam } from "@/components/ui/border-beam"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check, ChevronLeft, ChevronRight, FolderOpen, Search, Upload, X, Sparkles, Loader2, User, Building2, Landmark } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type CaseType = "OSOBA_PRYWATNA" | "FIRMA" | "ORGANIZACJA"
type PreferredContact = "EMAIL" | "TELEFON" | "OBA"

interface FileAttachment {
  url: string
  originalName: string
}

interface FormData {
  // Krok 1: Typ sprawy
  typSprawy: CaseType | ""

  // Krok 2: Kategoria
  categoryId: string
  voivodeshipId: string
  cityId: string

  // Krok 3: Opis
  nazwaSprawy: string
  opisSprawy: string
  zalaczniki: string[]

  // Krok 4: Termin i budżet
  oczekiwanyTerminRealizacji: string
  trybPilny: boolean
  budzetOd: string
  budzetDo: string
  doNegocjacji: boolean

  // Krok 5: Dane kontaktowe
  imieNazwisko: string
  emailKontakt: string
  telefonKontakt: string
  preferowanyKontakt: PreferredContact | ""
  akceptujeKlauzule: boolean
}

const stepContainerVariants = {
  hidden: { opacity: 0, x: 15 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const
    }
  },
  exit: {
    opacity: 0,
    x: -15,
    transition: {
      duration: 0.25,
      ease: "easeIn" as const
    }
  }
}

export default function ClientAddCasePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [categorySearchQuery, setCategorySearchQuery] = useState("")
  const [selectedParentIdForModal, setSelectedParentIdForModal] = useState<string | null>(null)

  const [categories, setCategories] = useState<any[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [voivodeships, setVoivodeships] = useState<any[]>([])
  const [isLoadingVoivodeships, setIsLoadingVoivodeships] = useState(true)
  const [cities, setCities] = useState<any[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    typSprawy: "",
    categoryId: "",
    voivodeshipId: "",
    cityId: "",
    nazwaSprawy: "",
    opisSprawy: "",
    zalaczniki: [],
    oczekiwanyTerminRealizacji: "",
    trybPilny: false,
    budzetOd: "",
    budzetDo: "",
    doNegocjacji: false,
    imieNazwisko: "",
    emailKontakt: "",
    telefonKontakt: "",
    preferowanyKontakt: "",
    akceptujeKlauzule: false,
  })

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

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
      } finally {
        setIsLoadingVoivodeships(false)
      }
    }
    fetchVoivodeships()
  }, [])

  useEffect(() => {
    if (!formData.voivodeshipId) {
      setCities([])
      return
    }
    const selectedVoivodeship = voivodeships.find(v => v.slug === formData.voivodeshipId)
    if (!selectedVoivodeship) return

    const fetchCities = async () => {
      setIsLoadingCities(true)
      try {
        const response = await fetch(`/api/cities?voivodeshipId=${selectedVoivodeship.id}`)
        if (response.ok) {
          const data = await response.json()
          setCities(data)
        }
      } catch (error) {
        console.error("Error fetching cities:", error)
      } finally {
        setIsLoadingCities(false)
      }
    }
    fetchCities()
  }, [formData.voivodeshipId, voivodeships])

  const getFilteredCategories = () => {
    const isPrivate = formData.typSprawy === "OSOBA_PRYWATNA"
    const targetType = isPrivate ? "SPRAWY_PRYWATNE" : "SPRAWY_FIRMOWE"

    // Filter active categories of targetType
    const activeCats = categories.filter((cat: any) => cat.aktywna && cat.typ === targetType)

    // Build root categories (those without parentId)
    const rootCats = activeCats.filter((cat: any) => !cat.parentId)

    return rootCats.map((root: any) => {
      // Find children belonging to this root
      const children = activeCats.filter((cat: any) => cat.parentId === root.id)
      return {
        ...root,
        children
      }
    })
  }

  const getSelectedCategoryPath = () => {
    if (!formData.categoryId) return null
    const selected = categories.find((cat: any) => cat.id === formData.categoryId)
    if (!selected) return null
    if (selected.parentId) {
      const parent = categories.find((cat: any) => cat.id === selected.parentId)
      if (parent) {
        return `${parent.nazwa} → ${selected.nazwa}`
      }
    }
    return selected.nazwa
  }

  const getSearchResults = () => {
    const isPrivate = formData.typSprawy === "OSOBA_PRYWATNA"
    const targetType = isPrivate ? "SPRAWY_PRYWATNE" : "SPRAWY_FIRMOWE"
    const query = categorySearchQuery.toLowerCase().trim()
    if (!query) return []

    const activeCats = categories.filter((cat: any) => cat.aktywna && cat.typ === targetType)

    return activeCats
      .filter((cat: any) => cat.nazwa.toLowerCase().includes(query))
      .map((cat: any) => {
        let parentName = ""
        if (cat.parentId) {
          const parent = activeCats.find((p: any) => p.id === cat.parentId)
          if (parent) {
            parentName = parent.nazwa
          }
        }
        return {
          ...cat,
          parentName
        }
      })
  }

  // Obsługa uploadu plików
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Sprawdź czy nie przekroczono limitu 5 plików
    if (uploadedFiles.length + files.length > 5) {
      alert("Możesz dodać maksymalnie 5 plików")
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload/document", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }

        const data = await response.json()
        return {
          url: data.url,
          originalName: data.originalName,
        }
      })

      const newFiles = await Promise.all(uploadPromises)
      setUploadedFiles(prev => [...prev, ...newFiles])
      updateFormData("zalaczniki", [...formData.zalaczniki, ...newFiles.map(f => f.url)])
    } catch (error) {
      console.error("Error uploading files:", error)
      alert("Błąd podczas uploadu plików. Spróbuj ponownie.")
    } finally {
      setIsUploading(false)
      // Reset input
      event.target.value = ""
    }
  }

  // Usuń plik z listy
  const handleRemoveFile = (index: number) => {
    const newUploadedFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newUploadedFiles)
    updateFormData("zalaczniki", newUploadedFiles.map(f => f.url))
  }

  // Pobierz dane użytkownika i uzupełnij dane kontaktowe
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/clients/me")
        if (response.ok) {
          const userData = await response.json()

          // Uzupełnij dane kontaktowe danymi użytkownika
          setFormData(prev => ({
            ...prev,
            imieNazwisko: `${userData.imie || ""} ${userData.nazwisko || ""}`.trim(),
            emailKontakt: userData.user?.email || "",
            telefonKontakt: userData.telefon || "",
          }))
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [])

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.typSprawy
      case 2:
        return !!formData.categoryId && !!formData.voivodeshipId && !!formData.cityId
      case 3:
        return !!formData.nazwaSprawy && formData.opisSprawy.length >= 50
      case 4:
        return true // Termin i budżet są opcjonalne
      case 5:
        return (
          !!formData.imieNazwisko &&
          !!formData.emailKontakt &&
          !!formData.telefonKontakt &&
          !!formData.preferowanyKontakt &&
          formData.akceptujeKlauzule
        )
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          oczekiwanyTerminRealizacji: formData.oczekiwanyTerminRealizacji || null,
          budzetOd: formData.budzetOd ? parseFloat(formData.budzetOd) : null,
          budzetDo: formData.budzetDo ? parseFloat(formData.budzetDo) : null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/panel-klienta/sprawy/${data.id}`)
      } else {
        alert("Błąd podczas dodawania sprawy")
      }
    } catch (error) {
      console.error("Error submitting case:", error)
      alert("Wystąpił błąd podczas dodawania sprawy")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-xl mx-auto px-4">
        {[1, 2, 3, 4, 5].map((step) => {
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep
          return (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all duration-300 relative",
                  isCompleted
                    ? "border-transparent bg-[#0da192] text-white"
                    : isCurrent
                      ? "border-[#0da192] bg-[#0da192]/10 text-white shadow-[0_0_15px_rgba(13,161,146,0.3)] animate-pulse"
                      : "border-border/40 bg-zinc-950/20 text-zinc-500"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5 stroke-[2.5]" /> : step}
              </div>
              {step < 5 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 w-12 sm:w-16 rounded-full transition-all duration-300",
                    step < currentStep ? "bg-[#0da192]" : "bg-zinc-800"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-5 text-center">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-[#0da192]">
          {currentStep === 1 && "Krok 1: Typ sprawy"}
          {currentStep === 2 && "Krok 2: Kategoria i Lokalizacja"}
          {currentStep === 3 && "Krok 3: Opis i Szczegóły"}
          {currentStep === 4 && "Krok 4: Harmonogram i Budżet"}
          {currentStep === 5 && "Krok 5: Kontakt i Weryfikacja"}
        </h3>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-zinc-300 text-sm font-semibold mb-4 block">Wybierz typ sprawy *</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: "OSOBA_PRYWATNA", label: "Osoba prywatna", icon: User, description: "Sprawa dotyczy osoby fizycznej, np. prawo pracy, rozwód, spadek." },
            { value: "FIRMA", label: "Firma / JDG", icon: Building2, description: "Sprawa dotyczy przedsiębiorstwa, spółek handlowych, kontraktów biznesowych." },
            { value: "ORGANIZACJA", label: "Organizacja / NGO", icon: Landmark, description: "Sprawa dotyczy stowarzyszeń, fundacji lub innych organizacji pożytku publicznego." },
          ].map((option) => {
            const isSelected = formData.typSprawy === option.value
            const OptionIcon = option.icon
            return (
              <Card
                key={option.value}
                className={cn(
                  "cursor-pointer border transition-all duration-300 rounded-2xl relative overflow-hidden p-6 group hover:bg-zinc-950/20 flex flex-col justify-between h-full min-h-[160px]",
                  isSelected
                    ? "border-[#0da192] bg-[#0da192]/5 shadow-[0_0_20px_rgba(13,161,146,0.1)]"
                    : "border-border/30 bg-zinc-950/10 hover:border-zinc-700/60"
                )}
                onClick={() => {
                  updateFormData("typSprawy", option.value)
                  updateFormData("categoryId", "") // Reset selected category
                  setSelectedParentIdForModal(null) // Reset selected parent category in modal
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-300",
                      isSelected
                        ? "bg-[#0da192]/10 border-[#0da192]/30 text-[#0da192]"
                        : "bg-zinc-900/60 border-border/10 text-zinc-400 group-hover:text-zinc-300"
                    )}>
                      <OptionIcon className="h-5 w-5" />
                    </div>
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected
                          ? "border-[#0da192]"
                          : "border-zinc-700 group-hover:border-zinc-500"
                      )}
                    >
                      {isSelected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-[#0da192]" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-semibold text-white">{option.label}</h4>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">{option.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => {
    const filteredCats = getFilteredCategories()
    const selectedPath = getSelectedCategoryPath()
    const activeParentId = selectedParentIdForModal || (filteredCats.length > 0 ? filteredCats[0].id : null)
    const activeParent = filteredCats.find((cat: any) => cat.id === activeParentId)
    const activeChildren = activeParent?.children || []

    return (
      <div className="space-y-5">
        <div>
          <Label className="text-zinc-300 text-xs font-semibold mb-2 block">Kategoria sprawy *</Label>
          <Dialog open={isCategoryModalOpen} onOpenChange={(open) => {
            setIsCategoryModalOpen(open)
            if (!open) {
              setCategorySearchQuery("")
            }
          }}>
            {selectedPath ? (
              <Card className="border border-[#0da192]/30 bg-[#0da192]/5 rounded-2xl shadow-md overflow-hidden relative">
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#0da192]/10 flex items-center justify-center text-[#0da192] border border-[#0da192]/20">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Wybrana kategoria</p>
                      <h4 className="text-sm font-bold text-white mt-0.5">{selectedPath}</h4>
                    </div>
                  </div>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="h-9 rounded-xl border-border/50 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-semibold shrink-0">
                      Zmień kategorię
                    </Button>
                  </DialogTrigger>
                </CardHeader>
              </Card>
            ) : (
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="w-full flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-border/20 hover:border-[#0da192]/40 rounded-2xl hover:bg-zinc-950/20 transition-all text-center group"
                >
                  <div className="h-11 w-11 rounded-xl bg-zinc-900/60 border border-border/10 group-hover:bg-[#0da192]/10 group-hover:text-[#0da192] group-hover:border-[#0da192]/20 flex items-center justify-center text-zinc-400 transition-all mb-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-[#0da192] transition-colors">Wybierz kategorię sprawy</span>
                  <span className="text-xs text-zinc-500 mt-1 font-light">Kliknij, aby otworzyć wyszukiwarkę i spis dziedzin prawa</span>
                </button>
              </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-3xl w-full bg-zinc-900 border border-border/40 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#0da192]/5 blur-[70px] rounded-full pointer-events-none" />
              <DialogHeader>
                <DialogTitle className="text-xl font-bold font-playfair text-white">Wybierz kategorię sprawy</DialogTitle>
                <DialogDescription className="text-zinc-400 text-xs">
                  Wyszukaj odpowiednią kategorię prawną lub wybierz ją ręcznie z podziału tematycznego.
                </DialogDescription>
              </DialogHeader>

              {/* Wyszukiwarka */}
              <div className="relative my-3 group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#0da192] transition-colors" />
                <Input
                  placeholder="Wpisz np. rozwód, praca, spółka..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-11 bg-zinc-950/40 border-border/40 rounded-xl text-white placeholder:text-zinc-500 focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-zinc-950/60 transition-all text-sm"
                />
                {categorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCategorySearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {categorySearchQuery ? (
                /* Wyniki wyszukiwania */
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 my-2">
                  {getSearchResults().length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 text-sm font-light">
                      Nie znaleziono kategorii dla frazy &quot;{categorySearchQuery}&quot;
                    </div>
                  ) : (
                    getSearchResults().map((cat: any) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          updateFormData("categoryId", cat.id)
                          setIsCategoryModalOpen(false)
                          setCategorySearchQuery("")
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all",
                          formData.categoryId === cat.id
                            ? "border-[#0da192] bg-[#0da192]/5 text-[#0da192]"
                            : "border-border/10 hover:border-zinc-700 hover:bg-zinc-950/20"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-zinc-200">
                            {cat.nazwa}
                          </span>
                          {cat.parentName && (
                            <span className="text-[10px] text-zinc-500 font-light mt-0.5">
                              Dziedzina nadrzędna: {cat.parentName}
                            </span>
                          )}
                        </div>
                        {formData.categoryId === cat.id && (
                          <Check className="h-4 w-4 text-[#0da192] shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              ) : (
                /* Układ dwukolumnowy */
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[320px] my-2">
                  {/* Lewa kolumna: Kategorie główne (2/5) */}
                  <div className="md:col-span-2 border border-border/10 rounded-xl p-2 overflow-y-auto bg-zinc-950/30 space-y-1">
                    <div className="text-[9px] font-semibold text-zinc-500 px-2.5 py-1 uppercase tracking-wider mb-1">
                      Działy prawa
                    </div>
                    {isLoadingCategories ? (
                      <div className="text-xs text-zinc-500 px-2 py-2 flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin text-[#0da192]" /> Ładowanie...</div>
                    ) : filteredCats.length === 0 ? (
                      <div className="text-xs text-zinc-500 px-2 py-2">Brak dostępnych kategorii</div>
                    ) : (
                      filteredCats.map((parent: any) => (
                        <button
                          key={parent.id}
                          type="button"
                          onClick={() => setSelectedParentIdForModal(parent.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-all",
                            activeParentId === parent.id
                              ? "bg-[#0da192] text-white font-semibold shadow-md"
                              : "text-zinc-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <span className="truncate">{parent.nazwa}</span>
                          <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 opacity-70", activeParentId === parent.id ? "text-white" : "text-zinc-500")} />
                        </button>
                      ))
                    )}
                  </div>

                  {/* Prawa kolumna: Podkategorie (3/5) */}
                  <div className="md:col-span-3 border border-border/10 rounded-xl p-2 overflow-y-auto space-y-2">
                    {activeParent ? (
                      <>
                        <div className="text-[9px] font-semibold text-zinc-500 px-2.5 py-1 uppercase tracking-wider">
                          Specjalizacje: {activeParent.nazwa}
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {/* Opcja wyboru samej kategorii głównej */}
                          <button
                            type="button"
                            onClick={() => {
                              updateFormData("categoryId", activeParent.id)
                              setIsCategoryModalOpen(false)
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                              formData.categoryId === activeParent.id
                                ? "border-[#0da192] bg-[#0da192]/5 text-[#0da192]"
                                : "border-dashed border-border/20 hover:border-[#0da192]/50 hover:bg-zinc-950/20"
                            )}
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs text-white">
                                Ogólny zakres: {activeParent.nazwa}
                              </span>
                              <span className="text-[9px] text-zinc-500 font-light mt-0.5 leading-normal">
                                Wybierz, jeśli sprawa dotyczy całego zakresu tej dziedziny
                              </span>
                            </div>
                            {formData.categoryId === activeParent.id && (
                              <Check className="h-4 w-4 text-[#0da192] shrink-0" />
                            )}
                          </button>

                          {/* Separator */}
                          {activeChildren.length > 0 && <div className="h-px bg-zinc-800/60 my-2" />}

                          {/* Lista podkategorii */}
                          {activeChildren.map((child: any) => (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => {
                                updateFormData("categoryId", child.id)
                                setIsCategoryModalOpen(false)
                              }}
                              className={cn(
                                "w-full flex items-center justify-between p-3 rounded-xl border border-border/10 text-left transition-all text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-950/20",
                                formData.categoryId === child.id && "border-[#0da192] bg-[#0da192]/5 text-[#0da192] hover:border-[#0da192]"
                              )}
                            >
                              <span>{child.nazwa}</span>
                              {formData.categoryId === child.id && (
                                <Check className="h-3.5 w-3.5 text-[#0da192] shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 text-zinc-500 text-xs font-light">
                        Wybierz dziedzinę główną z panelu po lewej stronie.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="voivodeshipId" className="text-zinc-300 text-xs font-semibold">Województwo *</Label>
            <Select
              value={formData.voivodeshipId}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, voivodeshipId: value, cityId: "" }))
              }}
            >
              <SelectTrigger id="voivodeshipId" className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-[#0da192]/40 focus:border-[#0da192] focus:bg-background/80 text-zinc-300 text-sm mt-1.5">
                <SelectValue placeholder={isLoadingVoivodeships ? "Ładowanie województw..." : "Wybierz województwo"} />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
                {voivodeships.map((voivodeship: any) => (
                  <SelectItem key={voivodeship.id} value={voivodeship.slug} className="hover:bg-[#0da192]/10 focus:bg-[#0da192]/10">
                    {voivodeship.nazwa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cityId" className="text-zinc-300 text-xs font-semibold">Miasto *</Label>
            <Select
              value={formData.cityId}
              onValueChange={(value) => updateFormData("cityId", value)}
              disabled={!formData.voivodeshipId || isLoadingCities}
            >
              <SelectTrigger id="cityId" className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-[#0da192]/40 focus:border-[#0da192] focus:bg-background/80 text-zinc-300 text-sm mt-1.5">
                <SelectValue placeholder={
                  !formData.voivodeshipId
                    ? "Wybierz najpierw województwo"
                    : isLoadingCities
                      ? "Ładowanie miast..."
                      : "Wybierz miasto"
                } />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
                {cities.length === 0 ? (
                  <SelectItem value="none" disabled>Brak dostępnych miast</SelectItem>
                ) : (
                  cities.map((city: any) => (
                    <SelectItem key={city.id} value={city.id} className="hover:bg-[#0da192]/10 focus:bg-[#0da192]/10">
                      {city.nazwa}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  const renderStep3 = () => (
    <div className="space-y-5">
      <div>
        <Label htmlFor="nazwaSprawy" className="text-zinc-300 text-xs font-semibold">Nazwa sprawy *</Label>
        <Input
          id="nazwaSprawy"
          value={formData.nazwaSprawy}
          onChange={(e) => updateFormData("nazwaSprawy", e.target.value)}
          placeholder="np. Sporządzenie umowy najmu lokalu komercyjnego"
          className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="opisSprawy" className="text-zinc-300 text-xs font-semibold">Opis sprawy * (minimum 50 znaków)</Label>
        <Textarea
          id="opisSprawy"
          value={formData.opisSprawy}
          onChange={(e) => updateFormData("opisSprawy", e.target.value)}
          placeholder="Opisz szczegółowo stan faktyczny, kluczowe okoliczności, cele oraz pytania prawne, na które szukasz odpowiedzi..."
          rows={8}
          className="bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm mt-1.5 resize-none"
        />
        <div className="flex justify-between items-center mt-2.5">
          <span className="text-[10px] text-zinc-500 font-light">Opisz problem prawny jak najdokładniej.</span>
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md", formData.opisSprawy.length >= 50 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-500')}>
            Znaki: {formData.opisSprawy.length} / 50
          </span>
        </div>
      </div>

      <div>
        <Label className="text-zinc-300 text-xs font-semibold">Załączniki (opcjonalnie, maks. 5 plików)</Label>
        <div className="mt-2 space-y-2.5">
          {uploadedFiles.length < 5 && (
            <div>
              <input
                type="file"
                id="file-upload"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp"
              />
              <div
                className={cn(
                  "border border-dashed border-border/30 rounded-xl transition-all text-center p-6 mt-1",
                  isUploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-[#0da192]/40 hover:bg-zinc-950/15 cursor-pointer group"
                )}
                onClick={() => {
                  if (!isUploading) {
                    document.getElementById("file-upload")?.click()
                  }
                }}
              >
                <div className={cn(
                  "mx-auto h-9 w-9 rounded-lg bg-zinc-900/60 border border-border/10 flex items-center justify-center text-zinc-400 transition-all mb-2.5",
                  !isUploading && "group-hover:bg-[#0da192]/10 group-hover:text-[#0da192] group-hover:border-[#0da192]/20"
                )}>
                  {isUploading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-[#0da192]" />
                  ) : (
                    <Upload className="h-4.5 w-4.5" />
                  )}
                </div>
                <span className={cn(
                  "font-semibold text-xs text-white transition-colors block",
                  !isUploading && "group-hover:text-[#0da192]"
                )}>
                  {isUploading ? "Przesyłanie plików..." : "Wybierz dokumenty do dodania"}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1 block font-light">
                  Kliknij, aby wybrać pliki z dysku
                </span>
              </div>
            </div>
          )}
          <p className="text-[10px] text-zinc-500 font-light">
            Obsługiwane pliki: PDF, DOC, DOCX, XLS, XLSX, TXT oraz grafiki (maksymalnie 10MB na plik).
          </p>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between rounded-xl border border-border/10 bg-zinc-950/20 p-3.5 mt-2">
              <span className="text-xs text-zinc-300 truncate max-w-md">{file.originalName}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(index)}
                disabled={isUploading}
                className="h-8 w-8 rounded-lg hover:text-rose-400 hover:bg-[#ff0000]/5 transition-colors p-0 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-5">
      <div>
        <Label htmlFor="oczekiwanyTerminRealizacji" className="text-zinc-300 text-xs font-semibold">Oczekiwany termin realizacji (opcjonalnie)</Label>
        <Input
          id="oczekiwanyTerminRealizacji"
          type="date"
          value={formData.oczekiwanyTerminRealizacji}
          className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm mt-1.5 text-zinc-300"
          onChange={(e) => updateFormData("oczekiwanyTerminRealizacji", e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-3 py-1.5">
        <Checkbox
          id="trybPilny"
          checked={formData.trybPilny}
          onCheckedChange={(checked) => updateFormData("trybPilny", checked)}
          className="h-5 w-5 border-border/50 text-[#0da192] focus:ring-[#0da192]/30 data-[state=checked]:bg-[#0da192] data-[state=checked]:border-transparent rounded"
        />
        <Label htmlFor="trybPilny" className="cursor-pointer text-sm text-zinc-300 font-medium">
          Sprawa pilna - wymaga natychmiastowej interwencji
        </Label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budzetOd" className="text-zinc-300 text-xs font-semibold">Szacowany budżet od (PLN)</Label>
          <Input
            id="budzetOd"
            type="number"
            min="0"
            step="0.01"
            value={formData.budzetOd}
            onChange={(e) => updateFormData("budzetOd", e.target.value)}
            placeholder="0.00"
            className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="budzetDo" className="text-zinc-300 text-xs font-semibold">Szacowany budżet do (PLN)</Label>
          <Input
            id="budzetDo"
            type="number"
            min="0"
            step="0.01"
            value={formData.budzetDo}
            onChange={(e) => updateFormData("budzetDo", e.target.value)}
            placeholder="0.00"
            className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm mt-1.5"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 py-1.5">
        <Checkbox
          id="doNegocjacji"
          checked={formData.doNegocjacji}
          onCheckedChange={(checked) => updateFormData("doNegocjacji", checked)}
          className="h-5 w-5 border-border/50 text-[#0da192] focus:ring-[#0da192]/30 data-[state=checked]:bg-[#0da192] data-[state=checked]:border-transparent rounded"
        />
        <Label htmlFor="doNegocjacji" className="cursor-pointer text-sm text-zinc-300 font-medium">
          Budżet pozostawiam do negocjacji z ekspertem
        </Label>
      </div>

      <div className="rounded-xl border border-[#0da192]/20 bg-[#0da192]/5 p-4 mt-6 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-[#0da192] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h5 className="text-xs font-semibold text-[#0da192] uppercase tracking-wider">Wskazówka</h5>
          <p className="text-xs text-zinc-300 leading-relaxed font-light">
            Określenie zakresu finansowego pozwala ekspertom dopasować wycenę do Twoich możliwości. Jeśli nie znasz szacowanego kosztu, zostaw pola puste i zaznacz opcję budżetu do negocjacji.
          </p>
        </div>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-5">
      <div>
        <Label htmlFor="imieNazwisko" className="text-zinc-300 text-xs font-semibold">Imię i nazwisko / Nazwa podmiotu *</Label>
        <Input
          id="imieNazwisko"
          value={formData.imieNazwisko}
          onChange={(e) => updateFormData("imieNazwisko", e.target.value)}
          placeholder="Jan Kowalski"
          className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm mt-1.5"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="emailKontakt" className="text-zinc-300 text-xs font-semibold">Adres e-mail *</Label>
          <Input
            id="emailKontakt"
            type="email"
            value={formData.emailKontakt}
            onChange={(e) => updateFormData("emailKontakt", e.target.value)}
            placeholder="jan.kowalski@example.com"
            className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="telefonKontakt" className="text-zinc-300 text-xs font-semibold">Numer telefonu *</Label>
          <Input
            id="telefonKontakt"
            type="tel"
            value={formData.telefonKontakt}
            onChange={(e) => updateFormData("telefonKontakt", e.target.value)}
            placeholder="+48 123 456 789"
            className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="preferowanyKontakt" className="text-zinc-300 text-xs font-semibold">Preferowana forma kontaktu *</Label>
        <Select
          value={formData.preferowanyKontakt}
          onValueChange={(value) => updateFormData("preferowanyKontakt", value)}
        >
          <SelectTrigger id="preferowanyKontakt" className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-[#0da192]/40 focus:border-[#0da192] focus:bg-background/80 text-zinc-300 text-sm mt-1.5">
            <SelectValue placeholder="Wybierz sposób kontaktu" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
            <SelectItem value="EMAIL" className="hover:bg-[#0da192]/10 focus:bg-[#0da192]/10">E-mail</SelectItem>
            <SelectItem value="TELEFON" className="hover:bg-[#0da192]/10 focus:bg-[#0da192]/10">Telefon komórkowy</SelectItem>
            <SelectItem value="OBA" className="hover:bg-[#0da192]/10 focus:bg-[#0da192]/10">Zarówno e-mail, jak i telefon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start space-x-3 rounded-xl border border-border/10 p-4 bg-zinc-950/25 mt-6">
        <Checkbox
          id="akceptujeKlauzule"
          checked={formData.akceptujeKlauzule}
          onCheckedChange={(checked) => updateFormData("akceptujeKlauzule", checked)}
          className="mt-1 h-5 w-5 border-border/50 text-[#0da192] focus:ring-[#0da192]/30 data-[state=checked]:bg-[#0da192] data-[state=checked]:border-transparent rounded shrink-0"
        />
        <Label htmlFor="akceptujeKlauzule" className="cursor-pointer text-xs text-zinc-300 leading-relaxed font-light">
          Oświadczam, że zapoznałem się i akceptuję klauzulę informacyjną oraz regulamin portalu odnośnie przetwarzania danych osobowych w celu realizacji zlecenia. *
          <br />
          <span className="text-zinc-500 text-[10px] block mt-1 font-light">
            Podane dane kontaktowe zostaną udostępnione wyłącznie wybranym ekspertom po złożeniu przez nich ofert.
          </span>
        </Label>
      </div>
    </div>
  )

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair tracking-tight text-white">Dodaj nową sprawę</h1>
        <p className="text-sm text-zinc-400 mt-1.5 font-light">
          Wypełnij poniższy formularz krok po kroku. Umożliwi to prawnikom dokładną analizę i rzetelną wycenę Twojej sprawy.
        </p>
        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0da192]/10 border border-[#0da192]/20 text-[#0da192] text-xs font-semibold tracking-wide">
          <Sparkles className="h-3 w-3 animate-pulse" />
          KREATOR NOWEGO ZLECENIA PRAWNEGO
        </div>
      </motion.div>

      {/* Main Form Area */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative z-10"
      >
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <BorderBeam lightColor="#0da192" lightWidth={400} duration={8} borderWidth={1} />
          <CardContent className="p-6">
            {renderStepIndicator()}

            <div className="min-h-[300px] py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={stepContainerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                  {currentStep === 5 && renderStep5()}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-between pt-6 border-t border-border/20 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="h-11 px-5 border-border/50 hover:bg-muted text-white rounded-xl gap-2 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Wstecz
              </Button>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  className="h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-semibold rounded-xl shadow-md border-t border-white/10 group gap-1.5 transition-all disabled:opacity-50"
                >
                  Dalej
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!validateStep(5) || isSubmitting}
                  className="h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-semibold rounded-xl shadow-md border-t border-white/10 group gap-1.5 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5 text-white" />
                      Dodawanie...
                    </>
                  ) : (
                    <>
                      Utwórz sprawę
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
