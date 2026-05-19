"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthLayout } from "@/components/auth"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"

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
    miasto: "",
    zgodaRegulamin: false,
    zgodaNewsletter: false,
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [cities, setCities] = useState<string[]>([])
  const [locationOpen, setLocationOpen] = useState(false)

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

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch("/api/cities")
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            setCities(data.map((c: any) => c.nazwa))
          }
        }
      } catch (error) {
        console.error("Error fetching cities:", error)
      }
    }
    fetchCities()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Walidacja
    // Walidacja
    if (!session?.user && formData.password !== formData.confirmPassword) {
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
          password: session?.user ? undefined : formData.password,
          isSocialRegistration: !!session?.user,
          role: "CLIENT",
          name: `${formData.imie} ${formData.nazwisko}`,
          client: {
            imie: formData.imie,
            nazwisko: formData.nazwisko,
            telefon: formData.telefon,
            miasto: formData.miasto,
            zgodaRegulamin: formData.zgodaRegulamin,
            zgodaNewsletter: formData.zgodaNewsletter,
            zgodaMarketing: false,
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

      // Przekieruj na stronę logowania
      router.push("/logowanie?registered=true")
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="imie">Imię *</Label>
              <Input
                id="imie"
                type="text"
                required
                value={formData.imie}
                onChange={(e) => setFormData({ ...formData, imie: e.target.value })}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nazwisko">Nazwisko *</Label>
              <Input
                id="nazwisko"
                type="text"
                required
                value={formData.nazwisko}
                onChange={(e) => setFormData({ ...formData, nazwisko: e.target.value })}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                type="tel"
                value={formData.telefon}
                onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="miasto">Miasto</Label>
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={locationOpen}
                    className="w-full justify-between h-11 font-normal"
                    disabled={isLoading || !!session?.user}
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
                            key={city}
                            value={city}
                            onSelect={(currentValue) => {
                              const matchedCity = cities.find(c => c.toLowerCase() === currentValue.toLowerCase()) || city
                              setFormData({ ...formData, miasto: matchedCity })
                              setLocationOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.miasto === city ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {!session && (
              <>
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
              </>
            )}

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

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Rejestrowanie..." : session ? "Dokończ rejestrację" : "Zarejestruj się"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
