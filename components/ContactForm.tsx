"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    imieNazwisko: "",
    email: "",
    telefon: "",
    temat: "INFORMACJA",
    tresc: "",
    politykaPrivacy: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.politykaPrivacy) {
      toast.error("Musisz zaakceptować politykę prywatności, aby wysłać wiadomość.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, zrodlo: "KONTAKT" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Coś poszło nie tak")
      }

      toast.success("Wiadomość została wysłana! Odpowiemy najszybciej jak to możliwe.")
      setFormData({
        imieNazwisko: "",
        email: "",
        telefon: "",
        temat: "INFORMACJA",
        tresc: "",
        politykaPrivacy: false,
      })
    } catch (error: any) {
      toast.error(error.message || "Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card className="border-neutral-800 bg-neutral-900 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Formularz kontaktowy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imieNazwisko" className="text-neutral-300">Imię i nazwisko *</Label>
            <Input
              id="imieNazwisko"
              name="imieNazwisko"
              required
              value={formData.imieNazwisko}
              onChange={handleChange}
              placeholder="Jan Kowalski"
              className="bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-[#E2B13C] focus:ring-[#E2B13C]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jan.kowalski@example.com"
                className="bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-[#E2B13C] focus:ring-[#E2B13C]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefon" className="text-neutral-300">Telefon</Label>
              <Input
                id="telefon"
                name="telefon"
                type="tel"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="+48 123 456 789"
                className="bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-[#E2B13C] focus:ring-[#E2B13C]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temat" className="text-neutral-300">Temat zapytania *</Label>
            <Select
              value={formData.temat}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, temat: value }))}
            >
              <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white focus:border-[#E2B13C] focus:ring-[#E2B13C]">
                <SelectValue placeholder="Wybierz temat" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-950 border-neutral-800 text-white">
                <SelectItem value="INFORMACJA">Zapytanie ogólne</SelectItem>
                <SelectItem value="WSPARCIE">Wsparcie techniczne</SelectItem>
                <SelectItem value="WSPOLPRACA">Współpraca</SelectItem>
                <SelectItem value="REKLAMACJA">Reklamacja</SelectItem>
                <SelectItem value="INNE">Inny temat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tresc" className="text-neutral-300">Wiadomość *</Label>
            <Textarea
              id="tresc"
              name="tresc"
              required
              value={formData.tresc}
              onChange={handleChange}
              placeholder="Opisz swoją sprawę..."
              rows={5}
              className="bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-[#E2B13C] focus:ring-[#E2B13C]"
            />
          </div>

          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="politykaPrivacy"
              checked={formData.politykaPrivacy}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, politykaPrivacy: !!checked }))
              }
              className="border-neutral-700 data-[state=checked]:bg-[#E2B13C] mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="politykaPrivacy"
                className="text-xs text-neutral-400 font-normal cursor-pointer select-none"
              >
                Akceptuję {" "}
                <a href="/polityka-prywatnosci" target="_blank" className="text-[#E2B13C] hover:underline">
                  Politykę prywatności
                </a>{" "}
                oraz {" "}
                <a href="/regulamin" target="_blank" className="text-[#E2B13C] hover:underline">
                  Regulamin platformy
                </a>{" "}
                i wyrażam zgodę na przetwarzanie moich danych osobowych w celu obsługi zapytania. *
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#E2B13C] hover:bg-[#cfa130] font-semibold mt-4 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
