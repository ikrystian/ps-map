"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Upload, X, Search, Check, FolderOpen } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"

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
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${step === currentStep
                ? "border-primary bg-primary text-primary-foreground"
                : step < currentStep
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted-foreground/30 bg-muted text-muted-foreground"
                }`}
            >
              {step}
            </div>
            {step < 5 && (
              <div
                className={`mx-2 h-0.5 w-12 ${step < currentStep ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold">
          {currentStep === 1 && "Krok 1: Typ sprawy"}
          {currentStep === 2 && "Krok 2: Kategoria sprawy"}
          {currentStep === 3 && "Krok 3: Opis sprawy"}
          {currentStep === 4 && "Krok 4: Termin i budżet"}
          {currentStep === 5 && "Krok 5: Dane kontaktowe"}
        </h3>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base mb-4 block">Wybierz typ sprawy</Label>
        <div className="grid gap-4">
          {[
            { value: "OSOBA_PRYWATNA", label: "Osoba prywatna", description: "Sprawa dotycząca osoby fizycznej" },
            { value: "FIRMA", label: "Firma", description: "Sprawa dotycząca przedsiębiorstwa" },
            { value: "ORGANIZACJA", label: "Organizacja", description: "Sprawa dotycząca organizacji lub fundacji" },
          ].map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-colors ${formData.typSprawy === option.value
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
                }`}
              onClick={() => {
                updateFormData("typSprawy", option.value)
                updateFormData("categoryId", "") // Reset selected category
                setSelectedParentIdForModal(null) // Reset selected parent category in modal
              }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${formData.typSprawy === option.value
                      ? "border-primary"
                      : "border-muted-foreground/30"
                      }`}
                  >
                    {formData.typSprawy === option.value && (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">{option.label}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
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
      <div className="space-y-6">
        <div>
          <Label className="mb-2 block">Kategoria *</Label>
          <Dialog open={isCategoryModalOpen} onOpenChange={(open) => {
            setIsCategoryModalOpen(open)
            if (!open) {
              setCategorySearchQuery("")
            }
          }}>
            {selectedPath ? (
              <Card className="border-primary bg-primary/5 transition-all">
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Wybrana kategoria</p>
                      <h4 className="text-sm font-semibold text-foreground mt-0.5">{selectedPath}</h4>
                    </div>
                  </div>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="ml-4">
                      Zmień kategorię
                    </Button>
                  </DialogTrigger>
                </CardHeader>
              </Card>
            ) : (
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="w-full flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-muted hover:border-primary/50 rounded-xl hover:bg-accent/30 transition-all text-center group"
                >
                  <div className="h-10 w-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all mb-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">Wybierz kategorię sprawy</span>
                  <span className="text-xs text-muted-foreground mt-1">Kliknij, aby wyszukać lub wybrać z listy</span>
                </button>
              </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-3xl w-full p-6">
              <DialogHeader>
                <DialogTitle>Wybierz kategorię sprawy</DialogTitle>
                <DialogDescription>
                  Wyszukaj odpowiednią kategorię wpisując jej nazwę lub wybierz ją z listy poniżej.
                </DialogDescription>
              </DialogHeader>

              {/* Wyszukiwarka */}
              <div className="relative my-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Wyszukaj kategorię..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="pl-9 pr-8"
                />
                {categorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCategorySearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {categorySearchQuery ? (
                /* Wyniki wyszukiwania */
                <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 my-2">
                  {getSearchResults().length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Brak wyników dla frazy "{categorySearchQuery}"
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
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${formData.categoryId === cat.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-muted hover:border-primary/50 hover:bg-accent/50"
                          }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-foreground">
                            {cat.nazwa}
                          </span>
                          {cat.parentName && (
                            <span className="text-xs text-muted-foreground mt-0.5">
                              {cat.parentName}
                            </span>
                          )}
                        </div>
                        {formData.categoryId === cat.id && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              ) : (
                /* Układ dwukolumnowy */
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[350px] my-2">
                  {/* Lewa kolumna: Kategorie główne (2/5) */}
                  <div className="md:col-span-2 border rounded-lg p-2 overflow-y-auto bg-muted/20 space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider mb-1">
                      Kategorie główne
                    </div>
                    {isLoadingCategories ? (
                      <div className="text-sm text-muted-foreground px-2 py-1">Ładowanie...</div>
                    ) : filteredCats.length === 0 ? (
                      <div className="text-sm text-muted-foreground px-2 py-1">Brak kategorii</div>
                    ) : (
                      filteredCats.map((parent: any) => (
                        <button
                          key={parent.id}
                          type="button"
                          onClick={() => setSelectedParentIdForModal(parent.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left text-sm transition-all ${activeParentId === parent.id
                              ? "bg-primary text-primary-foreground font-medium shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                        >
                          <span className="truncate">{parent.nazwa}</span>
                          <ChevronRight className={`h-4 w-4 shrink-0 opacity-70 ${activeParentId === parent.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        </button>
                      ))
                    )}
                  </div>

                  {/* Prawa kolumna: Podkategorie (3/5) */}
                  <div className="md:col-span-3 border rounded-lg p-2 overflow-y-auto space-y-2">
                    {activeParent ? (
                      <>
                        <div className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                          Podkategorie: {activeParent.nazwa}
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {/* Opcja wyboru samej kategorii głównej */}
                          <button
                            type="button"
                            onClick={() => {
                              updateFormData("categoryId", activeParent.id)
                              setIsCategoryModalOpen(false)
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${formData.categoryId === activeParent.id
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-dashed border-muted hover:border-primary/50 hover:bg-accent/50"
                              }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm text-foreground">
                                Cała kategoria: {activeParent.nazwa}
                              </span>
                              <span className="text-xs text-muted-foreground mt-0.5">
                                Wybierz, jeśli sprawa dotyczy ogólnego zakresu
                              </span>
                            </div>
                            {formData.categoryId === activeParent.id && (
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </button>

                          {/* Separator */}
                          {activeChildren.length > 0 && <div className="h-px bg-muted my-2" />}

                          {/* Lista podkategorii */}
                          {activeChildren.map((child: any) => (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => {
                                updateFormData("categoryId", child.id)
                                setIsCategoryModalOpen(false)
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${formData.categoryId === child.id
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-muted hover:border-primary/50 hover:bg-accent/50"
                                }`}
                            >
                              <span className="text-sm font-medium text-foreground">{child.nazwa}</span>
                              {formData.categoryId === child.id && (
                                <Check className="h-4 w-4 text-primary shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        Wybierz kategorię główną z lewej strony, aby zobaczyć szczegóły.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <Label htmlFor="voivodeshipId">Województwo *</Label>
          <Select
            value={formData.voivodeshipId}
            onValueChange={(value) => {
              setFormData(prev => ({ ...prev, voivodeshipId: value, cityId: "" }))
            }}
          >
            <SelectTrigger id="voivodeshipId">
              <SelectValue placeholder={isLoadingVoivodeships ? "Ładowanie województw..." : "Wybierz województwo"} />
            </SelectTrigger>
            <SelectContent>
              {voivodeships.map((voivodeship: any) => (
                <SelectItem key={voivodeship.id} value={voivodeship.slug}>
                  {voivodeship.nazwa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cityId">Miasto *</Label>
          <Select
            value={formData.cityId}
            onValueChange={(value) => updateFormData("cityId", value)}
            disabled={!formData.voivodeshipId || isLoadingCities}
          >
            <SelectTrigger id="cityId">
              <SelectValue placeholder={
                !formData.voivodeshipId
                  ? "Wybierz najpierw województwo"
                  : isLoadingCities
                    ? "Ładowanie miast..."
                    : "Wybierz miasto"
              } />
            </SelectTrigger>
            <SelectContent>
              {cities.length === 0 ? (
                <SelectItem value="none" disabled>Brak dostępnych miast</SelectItem>
              ) : (
                cities.map((city: any) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.nazwa}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="nazwaSprawy">Nazwa sprawy *</Label>
        <Input
          id="nazwaSprawy"
          value={formData.nazwaSprawy}
          onChange={(e) => updateFormData("nazwaSprawy", e.target.value)}
          placeholder="Krótki tytuł sprawy"
        />
      </div>

      <div>
        <Label htmlFor="opisSprawy">Opis sprawy * (minimum 50 znaków)</Label>
        <Textarea
          id="opisSprawy"
          value={formData.opisSprawy}
          onChange={(e) => updateFormData("opisSprawy", e.target.value)}
          placeholder="Szczegółowy opis sprawy..."
          rows={8}
          className="resize-none"
        />
        <p className={`text-sm mt-2 ${formData.opisSprawy.length >= 50 ? 'text-green-600' : 'text-muted-foreground'}`}>
          Znaki: {formData.opisSprawy.length} / 50 (minimum)
        </p>
      </div>

      <div>
        <Label>Załączniki (opcjonalnie, max 5 plików)</Label>
        <div className="mt-2 space-y-2">
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
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Dodaj załącznik"}
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Dozwolone typy: PDF, DOC, DOCX, XLS, XLSX, TXT, obrazy (max 10MB każdy)
          </p>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm truncate">{file.originalName}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(index)}
                disabled={isUploading}
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
    <div className="space-y-6">
      <div>
        <Label htmlFor="oczekiwanyTerminRealizacji">Oczekiwany termin realizacji (opcjonalnie)</Label>
        <Input
          id="oczekiwanyTerminRealizacji"
          type="date"
          value={formData.oczekiwanyTerminRealizacji}
          onChange={(e) => updateFormData("oczekiwanyTerminRealizacji", e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="trybPilny"
          checked={formData.trybPilny}
          onCheckedChange={(checked) => updateFormData("trybPilny", checked)}
        />
        <Label htmlFor="trybPilny" className="cursor-pointer font-normal">
          Sprawa pilna - wymaga szybkiej reakcji
        </Label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budzetOd">Budżet od (PLN)</Label>
          <Input
            id="budzetOd"
            type="number"
            min="0"
            step="0.01"
            value={formData.budzetOd}
            onChange={(e) => updateFormData("budzetOd", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="budzetDo">Budżet do (PLN)</Label>
          <Input
            id="budzetDo"
            type="number"
            min="0"
            step="0.01"
            value={formData.budzetDo}
            onChange={(e) => updateFormData("budzetDo", e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="doNegocjacji"
          checked={formData.doNegocjacji}
          onCheckedChange={(checked) => updateFormData("doNegocjacji", checked)}
        />
        <Label htmlFor="doNegocjacji" className="cursor-pointer font-normal">
          Budżet do negocjacji
        </Label>
      </div>

      <div className="rounded-lg border border-muted bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          💡 Określenie budżetu pomoże ekspertom przygotować odpowiednie oferty.
          Możesz pozostawić te pola puste, jeśli nie masz określonych preferencji.
        </p>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="imieNazwisko">Imię i nazwisko *</Label>
        <Input
          id="imieNazwisko"
          value={formData.imieNazwisko}
          onChange={(e) => updateFormData("imieNazwisko", e.target.value)}
          placeholder="Jan Kowalski"
        />
      </div>

      <div>
        <Label htmlFor="emailKontakt">Email kontaktowy *</Label>
        <Input
          id="emailKontakt"
          type="email"
          value={formData.emailKontakt}
          onChange={(e) => updateFormData("emailKontakt", e.target.value)}
          placeholder="jan.kowalski@example.com"
        />
      </div>

      <div>
        <Label htmlFor="telefonKontakt">Telefon kontaktowy *</Label>
        <Input
          id="telefonKontakt"
          type="tel"
          value={formData.telefonKontakt}
          onChange={(e) => updateFormData("telefonKontakt", e.target.value)}
          placeholder="+48 123 456 789"
        />
      </div>

      <div>
        <Label htmlFor="preferowanyKontakt">Preferowany sposób kontaktu *</Label>
        <Select
          value={formData.preferowanyKontakt}
          onValueChange={(value) => updateFormData("preferowanyKontakt", value)}
        >
          <SelectTrigger id="preferowanyKontakt">
            <SelectValue placeholder="Wybierz sposób kontaktu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EMAIL">Email</SelectItem>
            <SelectItem value="TELEFON">Telefon</SelectItem>
            <SelectItem value="OBA">Email i telefon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start space-x-2 rounded-lg border p-4">
        <Checkbox
          id="akceptujeKlauzule"
          checked={formData.akceptujeKlauzule}
          onCheckedChange={(checked) => updateFormData("akceptujeKlauzule", checked)}
          className="mt-1"
        />
        <Label htmlFor="akceptujeKlauzule" className="cursor-pointer text-sm leading-relaxed">
          Akceptuję klauzulę informacyjną dotyczącą przetwarzania danych osobowych *
          <br />
          <span className="text-muted-foreground">
            Podane dane będą widoczne dla ekspertów rozpatrujących Twoją sprawę.
          </span>
        </Label>
      </div>
    </div>
  )

  return (
    <div className="w-full space-y-6">
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-playfair tracking-tight">Dodaj Nową Sprawę</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Wypełnij formularz, aby dodać nową sprawę i otrzymać oferty od ekspertów prawnych
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {renderStepIndicator()}

            <form className="space-y-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}

              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Wstecz
                </Button>

                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                  >
                    Dalej
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!validateStep(5) || isSubmitting}
                  >
                    {isSubmitting ? "Dodawanie..." : "Dodaj sprawę"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
