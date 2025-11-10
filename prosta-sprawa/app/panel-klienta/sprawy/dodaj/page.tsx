"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react"

type CaseType = "OSOBA_PRYWATNA" | "FIRMA" | "ORGANIZACJA"
type PreferredContact = "EMAIL" | "TELEFON" | "OBA"

interface FormData {
  // Krok 1: Typ sprawy
  typSprawy: CaseType | ""

  // Krok 2: Kategoria
  categoryId: string
  wybranadziedzinaPrawa: string
  wybranaSpecyfikacja: string
  voivodeshipId: string

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

  const [formData, setFormData] = useState<FormData>({
    typSprawy: "",
    categoryId: "",
    wybranadziedzinaPrawa: "",
    wybranaSpecyfikacja: "",
    voivodeshipId: "",
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
        return !!formData.categoryId && !!formData.voivodeshipId
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
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${
                step === currentStep
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
                className={`mx-2 h-0.5 w-12 ${
                  step < currentStep ? "bg-primary" : "bg-muted-foreground/30"
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
              className={`cursor-pointer transition-colors ${
                formData.typSprawy === option.value
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => updateFormData("typSprawy", option.value)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      formData.typSprawy === option.value
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

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="categoryId">Kategoria główna *</Label>
        <Select value={formData.categoryId} onValueChange={(value) => updateFormData("categoryId", value)}>
          <SelectTrigger id="categoryId">
            <SelectValue placeholder="Wybierz kategorię" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prawo-cywilne">Prawo cywilne</SelectItem>
            <SelectItem value="prawo-karne">Prawo karne</SelectItem>
            <SelectItem value="prawo-rodzinne">Prawo rodzinne</SelectItem>
            <SelectItem value="prawo-pracy">Prawo pracy</SelectItem>
            <SelectItem value="prawo-gospodarcze">Prawo gospodarcze</SelectItem>
            <SelectItem value="prawo-administracyjne">Prawo administracyjne</SelectItem>
            <SelectItem value="prawo-podatkowe">Prawo podatkowe</SelectItem>
            <SelectItem value="prawo-medyczne">Prawo medyczne</SelectItem>
            <SelectItem value="prawo-nieruchomosci">Prawo nieruchomości</SelectItem>
            <SelectItem value="prawo-spadkowe">Prawo spadkowe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="wybranadziedzinaPrawa">Dziedzina prawa</Label>
        <Input
          id="wybranadziedzinaPrawa"
          value={formData.wybranadziedzinaPrawa}
          onChange={(e) => updateFormData("wybranadziedzinaPrawa", e.target.value)}
          placeholder="np. Umowy, Odszkodowania"
        />
      </div>

      <div>
        <Label htmlFor="wybranaSpecyfikacja">Specyfikacja</Label>
        <Input
          id="wybranaSpecyfikacja"
          value={formData.wybranaSpecyfikacja}
          onChange={(e) => updateFormData("wybranaSpecyfikacja", e.target.value)}
          placeholder="Dokładne określenie problemu prawnego"
        />
      </div>

      <div>
        <Label htmlFor="voivodeshipId">Województwo *</Label>
        <Select value={formData.voivodeshipId} onValueChange={(value) => updateFormData("voivodeshipId", value)}>
          <SelectTrigger id="voivodeshipId">
            <SelectValue placeholder="Wybierz województwo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dolnoslaskie">Dolnośląskie</SelectItem>
            <SelectItem value="kujawsko-pomorskie">Kujawsko-pomorskie</SelectItem>
            <SelectItem value="lubelskie">Lubelskie</SelectItem>
            <SelectItem value="lubuskie">Lubuskie</SelectItem>
            <SelectItem value="lodzkie">Łódzkie</SelectItem>
            <SelectItem value="malopolskie">Małopolskie</SelectItem>
            <SelectItem value="mazowieckie">Mazowieckie</SelectItem>
            <SelectItem value="opolskie">Opolskie</SelectItem>
            <SelectItem value="podkarpackie">Podkarpackie</SelectItem>
            <SelectItem value="podlaskie">Podlaskie</SelectItem>
            <SelectItem value="pomorskie">Pomorskie</SelectItem>
            <SelectItem value="slaskie">Śląskie</SelectItem>
            <SelectItem value="swietokrzyskie">Świętokrzyskie</SelectItem>
            <SelectItem value="warminsko-mazurskie">Warmińsko-mazurskie</SelectItem>
            <SelectItem value="wielkopolskie">Wielkopolskie</SelectItem>
            <SelectItem value="zachodniopomorskie">Zachodniopomorskie</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

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
          {formData.zalaczniki.length < 5 && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                // W rzeczywistej implementacji tutaj byłby upload plików
                alert("Funkcja uploadu plików zostanie dodana w przyszłości")
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              Dodaj załącznik
            </Button>
          )}
          {formData.zalaczniki.map((file, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">{file}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newFiles = formData.zalaczniki.filter((_, i) => i !== index)
                  updateFormData("zalaczniki", newFiles)
                }}
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
          💡 Określenie budżetu pomoże kancelariom przygotować odpowiednie oferty.
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
            Podane dane będą widoczne dla kancelarii rozpatrujących Twoją sprawę.
          </span>
        </Label>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dodaj nową sprawę</h1>
        <p className="text-muted-foreground mt-2">
          Wypełnij formularz, aby dodać nową sprawę i otrzymać oferty od kancelarii prawnych
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
  )
}
