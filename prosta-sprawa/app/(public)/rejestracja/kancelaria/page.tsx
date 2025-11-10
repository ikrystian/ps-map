"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LawFirmRegistrationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Krok 1: Typ działalności
    typDzialnosci: "",

    // Krok 2: Dane firmy
    nip: "",
    regon: "",
    krs: "",

    // Krok 3: Dane kontaktowe
    nazwa: "",
    email: "",
    telefon: "",

    // Krok 4: Adres siedziby
    adres: "",
    miasto: "",
    kodPocztowy: "",

    // Krok 5: Obszar działania
    wojewodztwa: [] as string[],

    // Krok 6: Specjalizacje
    specjalizacje: [] as string[],

    // Krok 7: Typ oferty
    typOferty: "",

    // Krok 8: Dane logowania
    password: "",
    confirmPassword: "",
    zgodaRegulamin: false,
    zgodaNewsletter: false,
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const totalSteps = 8

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.typDzialnosci) {
          setError("Wybierz typ działalności")
          return false
        }
        break
      case 3:
        if (!formData.nazwa || !formData.email) {
          setError("Wypełnij nazwę kancelarii i email")
          return false
        }
        break
      case 4:
        if (!formData.adres || !formData.miasto) {
          setError("Wypełnij adres i miasto")
          return false
        }
        break
      case 7:
        if (!formData.typOferty) {
          setError("Wybierz typ oferty")
          return false
        }
        break
    }
    return true
  }

  const nextStep = () => {
    setError("")
    if (!validateStep()) {
      return
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setError("")
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (currentStep < totalSteps) {
      if (!validateStep()) {
        return
      }
      nextStep()
      return
    }

    // Walidacja finalna (krok 8)
    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są identyczne")
      return
    }

    if (!formData.zgodaRegulamin) {
      setError("Musisz zaakceptować regulamin")
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
          password: formData.password,
          role: "LAW_FIRM",
          name: formData.nazwa,
          lawFirm: {
            typ: formData.typDzialnosci,
            typInny: null,
            nazwa: formData.nazwa,
            nazwaFirmy: formData.nazwa,
            nip: formData.nip || null,
            regon: formData.regon || null,
            krs: formData.krs || null,
            imieKontakt: null,
            nazwiskoKontakt: null,
            stanowisko: null,
            numerTelefonu: formData.telefon || null,
            numerTelefonu2: null,
            emailKontakt: formData.email,
            adres: formData.adres,
            kodPocztowy: formData.kodPocztowy || null,
            miasto: formData.miasto,
            voivodeshipId: null,
            typOferty: formData.typOferty,
            zgodaRegulamin: formData.zgodaRegulamin,
            zgodaPrzetwarzanie: formData.zgodaRegulamin,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Wystąpił błąd podczas rejestracji")
        setIsLoading(false)
        return
      }

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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typDzialnosci">Typ działalności *</Label>
              <select
                id="typDzialnosci"
                value={formData.typDzialnosci}
                onChange={(e) => setFormData({ ...formData, typDzialnosci: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Wybierz typ działalności</option>
                <option value="OSOBA_FIZYCZNA">Osoba fizyczna</option>
                <option value="SPOLKA_CYWILNA">Spółka cywilna</option>
                <option value="SPOLKA_PARTNERSKA">Spółka partnerska</option>
                <option value="SPOLKA_KOMANDYTOWA">Spółka komandytowa</option>
                <option value="SPOLKA_JAWNA">Spółka jawna</option>
                <option value="SPOLKA_ZOO">Spółka z o.o.</option>
                <option value="INNY">Inny</option>
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nip">NIP</Label>
              <Input
                id="nip"
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regon">REGON</Label>
              <Input
                id="regon"
                type="text"
                value={formData.regon}
                onChange={(e) => setFormData({ ...formData, regon: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="krs">KRS</Label>
              <Input
                id="krs"
                type="text"
                value={formData.krs}
                onChange={(e) => setFormData({ ...formData, krs: e.target.value })}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nazwa">Nazwa kancelarii *</Label>
              <Input
                id="nazwa"
                type="text"
                required
                value={formData.nazwa}
                onChange={(e) => setFormData({ ...formData, nazwa: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="kontakt@kancelaria.pl"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                type="tel"
                value={formData.telefon}
                onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adres">Adres *</Label>
              <Input
                id="adres"
                type="text"
                required
                value={formData.adres}
                onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="miasto">Miasto *</Label>
              <Input
                id="miasto"
                type="text"
                required
                value={formData.miasto}
                onChange={(e) => setFormData({ ...formData, miasto: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kodPocztowy">Kod pocztowy</Label>
              <Input
                id="kodPocztowy"
                type="text"
                placeholder="00-000"
                value={formData.kodPocztowy}
                onChange={(e) => setFormData({ ...formData, kodPocztowy: e.target.value })}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Województwa, w których działasz *</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Wybierz obszar swojej działalności (wielokrotny wybór)
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {["dolnośląskie", "kujawsko-pomorskie", "lubelskie", "lubuskie", "łódzkie", "małopolskie", "mazowieckie", "opolskie", "podkarpackie", "podlaskie", "pomorskie", "śląskie", "świętokrzyskie", "warmińsko-mazurskie", "wielkopolskie", "zachodniopomorskie"].map((woj) => (
                  <div key={woj} className="flex items-center space-x-2">
                    <Checkbox
                      id={woj}
                      checked={formData.wojewodztwa.includes(woj)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, wojewodztwa: [...formData.wojewodztwa, woj] })
                        } else {
                          setFormData({ ...formData, wojewodztwa: formData.wojewodztwa.filter(w => w !== woj) })
                        }
                      }}
                    />
                    <label htmlFor={woj} className="text-sm capitalize cursor-pointer">
                      {woj}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Specjalizacje prawne *</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Wybierz dziedziny prawa, w których się specjalizujesz
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {["Prawo rodzinne", "Prawo karne", "Prawo cywilne", "Prawo pracy", "Prawo gospodarcze", "Prawo spadkowe", "Prawo administracyjne", "Prawo podatkowe", "Prawo nieruchomości", "Prawo ubezpieczeń"].map((spec) => (
                  <div key={spec} className="flex items-center space-x-2">
                    <Checkbox
                      id={spec}
                      checked={formData.specjalizacje.includes(spec)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, specjalizacje: [...formData.specjalizacje, spec] })
                        } else {
                          setFormData({ ...formData, specjalizacje: formData.specjalizacje.filter(s => s !== spec) })
                        }
                      }}
                    />
                    <label htmlFor={spec} className="text-sm cursor-pointer">
                      {spec}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typOferty">Typ oferty *</Label>
              <select
                id="typOferty"
                value={formData.typOferty}
                onChange={(e) => setFormData({ ...formData, typOferty: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Wybierz typ oferty</option>
                <option value="KONSULTACJA">Konsultacja</option>
                <option value="JEDNORAZOWA_USLUGA">Jednorazowa usługa</option>
                <option value="STALA_WSPOLPRACA">Stała współpraca</option>
                <option value="WSZYSTKIE">Wszystkie rodzaje</option>
              </select>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-4">
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
              />
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="zgodaRegulamin"
                required
                checked={formData.zgodaRegulamin}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, zgodaRegulamin: checked === true })
                }
                disabled={isLoading}
              />
              <label htmlFor="zgodaRegulamin" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Akceptuję <Link href="/regulamin" className="text-primary hover:underline">regulamin</Link> i <Link href="/polityka-prywatnosci" className="text-primary hover:underline">politykę prywatności</Link> *
              </label>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="zgodaNewsletter"
                checked={formData.zgodaNewsletter}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, zgodaNewsletter: checked === true })
                }
                disabled={isLoading}
              />
              <label htmlFor="zgodaNewsletter" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Chcę otrzymywać newsletter
              </label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Typ działalności"
      case 2: return "Dane firmy"
      case 3: return "Dane kontaktowe"
      case 4: return "Adres siedziby"
      case 5: return "Obszar działania"
      case 6: return "Specjalizacje"
      case 7: return "Typ oferty"
      case 8: return "Dane logowania"
      default: return ""
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Rejestracja kancelarii</CardTitle>
          <CardDescription className="text-center">
            Krok {currentStep} z {totalSteps}: {getStepTitle()}
          </CardDescription>
          <CardDescription className="text-center">
            Już masz konto?{" "}
            <Link href="/logowanie" className="text-primary hover:underline">
              Zaloguj się
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 mx-1 rounded-full ${
                    i + 1 <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {renderStep()}

            <div className="flex justify-between gap-4 pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isLoading}
                  className="w-full"
                >
                  Wstecz
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {currentStep === totalSteps
                  ? isLoading
                    ? "Rejestrowanie..."
                    : "Zarejestruj się"
                  : "Dalej"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
