"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Mail, Phone, MapPin, Lock, User } from "lucide-react"

export default function LawFirmProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ustawienia konta</h1>
        <p className="text-muted-foreground">Zarządzaj informacjami o swojej kancelarii</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Podstawowe dane</TabsTrigger>
          <TabsTrigger value="contact">Kontakt</TabsTrigger>
          <TabsTrigger value="company">Informacje o firmie</TabsTrigger>
          <TabsTrigger value="security">Bezpieczeństwo</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe informacje</CardTitle>
              <CardDescription>Zaktualizuj podstawowe dane swojej kancelarii</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/avatars/law-firm.jpg" alt="Logo kancelarii" />
                  <AvatarFallback>
                    <Building2 className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label>Logo kancelarii</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Zmień zdjęcie</Button>
                    <Button variant="outline" size="sm">Usuń</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">JPG, PNG lub SVG. Max 2MB.</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nazwa kancelarii *</Label>
                  <Input id="name" placeholder="Kancelaria Prawna XYZ" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Opis kancelarii</Label>
                  <Textarea
                    id="description"
                    placeholder="Krótki opis Twojej kancelarii..."
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">Max 500 znaków</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nip">NIP *</Label>
                    <Input id="nip" placeholder="1234567890" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="regon">REGON</Label>
                    <Input id="regon" placeholder="123456789" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="krs">KRS</Label>
                  <Input id="krs" placeholder="0000123456" />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Anuluj</Button>
                <Button>Zapisz zmiany</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dane kontaktowe</CardTitle>
              <CardDescription>Informacje kontaktowe widoczne dla klientów</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="kontakt@kancelaria.pl" className="pl-10" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefon *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" placeholder="+48 123 456 789" className="pl-10" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="website">Strona internetowa</Label>
                  <Input id="website" placeholder="https://kancelaria.pl" />
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="address">Ulica i numer *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="address" placeholder="ul. Przykładowa 123" className="pl-10" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="postal">Kod pocztowy *</Label>
                    <Input id="postal" placeholder="00-000" />
                  </div>

                  <div className="col-span-2 grid gap-2">
                    <Label htmlFor="city">Miasto *</Label>
                    <Input id="city" placeholder="Warszawa" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="voivodeship">Województwo *</Label>
                  <Select>
                    <SelectTrigger id="voivodeship">
                      <SelectValue placeholder="Wybierz województwo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mazowieckie">Mazowieckie</SelectItem>
                      <SelectItem value="slaskie">Śląskie</SelectItem>
                      <SelectItem value="wielkopolskie">Wielkopolskie</SelectItem>
                      <SelectItem value="malopolskie">Małopolskie</SelectItem>
                      <SelectItem value="dolnoslaskie">Dolnośląskie</SelectItem>
                      <SelectItem value="lodzkie">Łódzkie</SelectItem>
                      <SelectItem value="zachodniopomorskie">Zachodniopomorskie</SelectItem>
                      <SelectItem value="pomorskie">Pomorskie</SelectItem>
                      <SelectItem value="kujawsko-pomorskie">Kujawsko-Pomorskie</SelectItem>
                      <SelectItem value="lubelskie">Lubelskie</SelectItem>
                      <SelectItem value="podkarpackie">Podkarpackie</SelectItem>
                      <SelectItem value="podlaskie">Podlaskie</SelectItem>
                      <SelectItem value="swietokrzyskie">Świętokrzyskie</SelectItem>
                      <SelectItem value="warminsko-mazurskie">Warmińsko-Mazurskie</SelectItem>
                      <SelectItem value="lubuskie">Lubuskie</SelectItem>
                      <SelectItem value="opolskie">Opolskie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Anuluj</Button>
                <Button>Zapisz zmiany</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informacje o firmie</CardTitle>
              <CardDescription>Dodatkowe informacje o Twojej kancelarii</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="founding-year">Rok założenia</Label>
                  <Input id="founding-year" type="number" placeholder="2020" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="employees">Liczba pracowników</Label>
                  <Select>
                    <SelectTrigger id="employees">
                      <SelectValue placeholder="Wybierz przedział" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2-5">2-5</SelectItem>
                      <SelectItem value="6-10">6-10</SelectItem>
                      <SelectItem value="11-20">11-20</SelectItem>
                      <SelectItem value="21-50">21-50</SelectItem>
                      <SelectItem value="50+">Powyżej 50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="languages">Języki obsługi</Label>
                  <Input id="languages" placeholder="Polski, Angielski, Niemiecki" />
                  <p className="text-sm text-muted-foreground">Oddziel przecinkami</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="office-hours">Godziny otwarcia</Label>
                  <Textarea
                    id="office-hours"
                    placeholder="Pon-Pt: 9:00 - 17:00&#10;Sob: 10:00 - 14:00"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="about">O nas</Label>
                  <Textarea
                    id="about"
                    placeholder="Rozszerzona informacja o kancelarii, osiągnięcia, specjalizacje..."
                    rows={6}
                  />
                  <p className="text-sm text-muted-foreground">Max 2000 znaków</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Anuluj</Button>
                <Button>Zapisz zmiany</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Zmiana hasła</CardTitle>
              <CardDescription>Zaktualizuj hasło do swojego konta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Obecne hasło *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="current-password" type="password" className="pl-10" />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="new-password">Nowe hasło *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="new-password" type="password" className="pl-10" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Minimum 8 znaków, wielka litera, cyfra i znak specjalny
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Potwierdź nowe hasło *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="confirm-password" type="password" className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Anuluj</Button>
                <Button>Zmień hasło</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ustawienia konta</CardTitle>
              <CardDescription>Zarządzaj swoim kontem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Weryfikacja dwuetapowa</p>
                  <p className="text-sm text-muted-foreground">
                    Dodaj dodatkową warstwę bezpieczeństwa do swojego konta
                  </p>
                </div>
                <Button variant="outline">Włącz</Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Powiadomienia email</p>
                  <p className="text-sm text-muted-foreground">
                    Otrzymuj powiadomienia o nowych sprawach i wiadomościach
                  </p>
                </div>
                <Button variant="outline">Zarządzaj</Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-destructive">Usuń konto</p>
                  <p className="text-sm text-muted-foreground">
                    Trwale usuń swoje konto i wszystkie dane
                  </p>
                </div>
                <Button variant="destructive">Usuń konto</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
