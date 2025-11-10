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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nazwa: "",
    telefon: "",
    miasto: "",
    kodPocztowy: "",
    adres: "",
    nip: "",
    regon: "",
    krs: "",
    wojewodztwoId: "",
    zgodaRegulamin: false,
    zgodaNewsletter: false,
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Walidacja
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
            nazwa: formData.nazwa,
            email: formData.email,
            telefon: formData.telefon,
            miasto: formData.miasto,
            kodPocztowy: formData.kodPocztowy,
            adres: formData.adres,
            nip: formData.nip,
            regon: formData.regon,
            krs: formData.krs,
            wojewodztwoId: formData.wojewodztwoId || undefined,
            zgodaRegulamin: formData.zgodaRegulamin,
            zgodaNewsletter: formData.zgodaNewsletter,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Wystąpił błąd podczas rejestracji")
        setIsLoading(false)
        return
      }

      // Przekieruj na stronę logowania
      router.push("/logowanie?registered=true")
    } catch (error) {
      setError("Wystąpił błąd podczas rejestracji")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Rejestracja kancelarii</CardTitle>
          <CardDescription className="text-center">
            Już masz konto?{" "}
            <Link href="/logowanie" className="text-primary hover:underline">
              Zaloguj się
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nazwa">Nazwa kancelarii *</Label>
                <Input
                  id="nazwa"
                  type="text"
                  required
                  value={formData.nazwa}
                  onChange={(e) => setFormData({ ...formData, nazwa: e.target.value })}
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adres">Adres</Label>
                <Input
                  id="adres"
                  type="text"
                  value={formData.adres}
                  onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nip">NIP</Label>
                <Input
                  id="nip"
                  type="text"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regon">REGON</Label>
                <Input
                  id="regon"
                  type="text"
                  value={formData.regon}
                  onChange={(e) => setFormData({ ...formData, regon: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="krs">KRS</Label>
                <Input
                  id="krs"
                  type="text"
                  value={formData.krs}
                  onChange={(e) => setFormData({ ...formData, krs: e.target.value })}
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Rejestrowanie..." : "Zarejestruj się"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
