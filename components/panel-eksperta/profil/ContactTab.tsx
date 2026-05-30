"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface Voivodeship {
  id: string
  nazwa: string
}

interface ContactTabProps {
  formData: {
    imieKontakt: string
    nazwiskoKontakt: string
    numerTelefonu: string
    numerTelefonu2: string
    emailKontakt: string
    stronaWww: string
    adres: string
    kodPocztowy: string
    miasto: string
    voivodeshipId: string
    linkLinkedIn: string
    linkFacebook: string
    linkInstagram: string
    linkTwitter: string
  }
  handleInputChange: (field: string, value: any) => void
  voivodeships: Voivodeship[]
}

export function ContactTab({
  formData,
  handleInputChange,
  voivodeships,
}: ContactTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dane kontaktowe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="imieKontakt">Imię kontaktowe *</Label>
            <Input
              id="imieKontakt"
              value={formData.imieKontakt}
              onChange={(e) => handleInputChange("imieKontakt", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nazwiskoKontakt">Nazwisko kontaktowe *</Label>
            <Input
              id="nazwiskoKontakt"
              value={formData.nazwiskoKontakt}
              onChange={(e) => handleInputChange("nazwiskoKontakt", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="numerTelefonu">Telefon główny *</Label>
            <Input
              id="numerTelefonu"
              value={formData.numerTelefonu}
              onChange={(e) => handleInputChange("numerTelefonu", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="numerTelefonu2">Telefon dodatkowy</Label>
            <Input
              id="numerTelefonu2"
              value={formData.numerTelefonu2}
              onChange={(e) => handleInputChange("numerTelefonu2", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="emailKontakt">Email *</Label>
            <Input
              id="emailKontakt"
              type="email"
              value={formData.emailKontakt}
              onChange={(e) => handleInputChange("emailKontakt", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stronaWww">Strona WWW</Label>
            <Input
              id="stronaWww"
              value={formData.stronaWww}
              onChange={(e) => handleInputChange("stronaWww", e.target.value)}
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="adres">Adres *</Label>
            <Input
              id="adres"
              value={formData.adres}
              onChange={(e) => handleInputChange("adres", e.target.value)}
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="kodPocztowy">Kod pocztowy *</Label>
              <Input
                id="kodPocztowy"
                value={formData.kodPocztowy}
                onChange={(e) => handleInputChange("kodPocztowy", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="miasto">Miasto *</Label>
              <Input
                id="miasto"
                value={formData.miasto}
                onChange={(e) => handleInputChange("miasto", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="voivodeshipId">Województwo *</Label>
            <Select
              value={formData.voivodeshipId}
              onValueChange={(value) => handleInputChange("voivodeshipId", value)}
            >
              <SelectTrigger>
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

        <Separator />

        <div className="space-y-4">
          <Label>Social Media</Label>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="LinkedIn URL"
              value={formData.linkLinkedIn}
              onChange={(e) => handleInputChange("linkLinkedIn", e.target.value)}
            />
            <Input
              placeholder="Facebook URL"
              value={formData.linkFacebook}
              onChange={(e) => handleInputChange("linkFacebook", e.target.value)}
            />
            <Input
              placeholder="Instagram URL"
              value={formData.linkInstagram}
              onChange={(e) => handleInputChange("linkInstagram", e.target.value)}
            />
            <Input
              placeholder="Twitter URL"
              value={formData.linkTwitter}
              onChange={(e) => handleInputChange("linkTwitter", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
