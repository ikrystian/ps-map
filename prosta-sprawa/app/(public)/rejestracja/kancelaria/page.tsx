"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Voivodeship {
  id: string
  nazwa: string
}

interface Category {
  id: string
  nazwa: string
}

export default function LawFirmRegistrationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [categories, setCategories] = useState<Category[]>([])
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

  const totalSteps = 8

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
        if (!formData.email || !formData.password) {
          setError("Wypełnij email i hasło")
          return false
        }
        if (formData.password !== formData.confirmPassword) {
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
              <Label htmlFor="typ">Typ działalności *</Label>
              <select
                id="typ"
                value={formData.typ}
                onChange={(e) => setFormData({ ...formData, typ: e.target.value })}
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
            {formData.typ === "INNY" && (
              <div className="space-y-2">
                <Label htmlFor="typInny">Podaj typ działalności</Label>
                <Input
                  id="typInny"
                  value={formData.typInny}
                  onChange={(e) => setFormData({ ...formData, typInny: e.target.value })}
                />
              </div>
            )}
          </div>
        )

      case 2:
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
              <Label htmlFor="nazwaFirmy">Nazwa firmy *</Label>
              <Input
                id="nazwaFirmy"
                type="text"
                required
                value={formData.nazwaFirmy}
                onChange={(e) => setFormData({ ...formData, nazwaFirmy: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nip">NIP *</Label>
              <Input
                id="nip"
                type="text"
                required
                placeholder="0000000000"
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
              <Label htmlFor="imieKontakt">Imię kontaktowe *</Label>
              <Input
                id="imieKontakt"
                type="text"
                required
                value={formData.imieKontakt}
                onChange={(e) => setFormData({ ...formData, imieKontakt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nazwiskoKontakt">Nazwisko kontaktowe *</Label>
              <Input
                id="nazwiskoKontakt"
                type="text"
                required
                value={formData.nazwiskoKontakt}
                onChange={(e) => setFormData({ ...formData, nazwiskoKontakt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stanowisko">Stanowisko</Label>
              <Input
                id="stanowisko"
                type="text"
                value={formData.stanowisko}
                onChange={(e) => setFormData({ ...formData, stanowisko: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numerTelefonu">Telefon główny *</Label>
              <Input
                id="numerTelefonu"
                type="tel"
                required
                value={formData.numerTelefonu}
                onChange={(e) => setFormData({ ...formData, numerTelefonu: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numerTelefonu2">Telefon dodatkowy</Label>
              <Input
                id="numerTelefonu2"
                type="tel"
                value={formData.numerTelefonu2}
                onChange={(e) => setFormData({ ...formData, numerTelefonu2: e.target.value })}
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
              <Label htmlFor="kodPocztowy">Kod pocztowy *</Label>
              <Input
                id="kodPocztowy"
                type="text"
                placeholder="00-000"
                required
                value={formData.kodPocztowy}
                onChange={(e) => setFormData({ ...formData, kodPocztowy: e.target.value })}
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
              <Label htmlFor="voivodeshipId">Województwo *</Label>
              <select
                id="voivodeshipId"
                value={formData.voivodeshipId}
                onChange={(e) => setFormData({ ...formData, voivodeshipId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Wybierz województwo</option>
                {voivodeships.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nazwa}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="callaPolska"
                checked={formData.callaPolska}
                onCheckedChange={(checked) => setFormData({ ...formData, callaPolska: checked === true })}
              />
              <label htmlFor="callaPolska" className="text-sm cursor-pointer">
                Działam w całej Polsce
              </label>
            </div>
            {!formData.callaPolska && (
              <div className="space-y-2">
                <Label>Województwa działania *</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Wybierz dodatkowe województwa, w których działasz
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                  {voivodeships.map((v) => (
                    <div key={v.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`voiv-${v.id}`}
                        checked={formData.voivodeshipsIds.includes(v.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, voivodeshipsIds: [...formData.voivodeshipsIds, v.id] })
                          } else {
                            setFormData({ ...formData, voivodeshipsIds: formData.voivodeshipsIds.filter((id) => id !== v.id) })
                          }
                        }}
                      />
                      <label htmlFor={`voiv-${v.id}`} className="text-sm cursor-pointer">
                        {v.nazwa}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={formData.categoriesIds.includes(cat.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, categoriesIds: [...formData.categoriesIds, cat.id] })
                        } else {
                          setFormData({ ...formData, categoriesIds: formData.categoriesIds.filter((id) => id !== cat.id) })
                        }
                      }}
                    />
                    <label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
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
              <Label htmlFor="email">Email (login) *</Label>
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.pl"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
            </div>
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
                Akceptuję <Link href="/regulamin" className="text-primary hover:underline">regulamin</Link> *
              </label>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="zgodaPrzetwarzanie"
                required
                checked={formData.zgodaPrzetwarzanie}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, zgodaPrzetwarzanie: checked === true })
                }
                disabled={isLoading}
              />
              <label htmlFor="zgodaPrzetwarzanie" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Zgadzam się na <Link href="/polityka-prywatnosci" className="text-primary hover:underline">przetwarzanie danych osobowych</Link> *
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
    <div className="flex items-center justify-center p-4 py-12">
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
