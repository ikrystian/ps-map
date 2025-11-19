"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock, User } from "lucide-react"
import { toast } from "sonner"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Implement actual form submission
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Wiadomość została wysłana! Odpowiemy najszybciej jak to możliwe.")
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      toast.error("Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.")
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Skontaktuj się z nami</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Masz pytania? Chętnie na nie odpowiemy. Skorzystaj z formularza kontaktowego lub skontaktuj się z nami
            bezpośrednio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information Cards */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Email</h3>
                <a
                  href="mailto:kontakt@prosta-sprawa.pl"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  kontakt@prosta-sprawa.pl
                </a>
                <a
                  href="mailto:pomoc@prosta-sprawa.pl"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  pomoc@prosta-sprawa.pl
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Telefon</h3>
                <a
                  href="tel:+48123456789"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  +48 123 456 789
                </a>
                <p className="text-sm text-muted-foreground">pon-pt: 9:00 - 17:00</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Adres</h3>
                <p className="text-muted-foreground">
                  ul. Przykładowa 123
                  <br />
                  00-001 Warszawa
                  <br />
                  Polska
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Formularz kontaktowy</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Imię i nazwisko *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jan Kowalski"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jan.kowalski@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+48 123 456 789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Temat *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="W jakiej sprawie się kontaktujesz?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Wiadomość *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Opisz swoją sprawę..."
                    rows={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Person & Additional Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Osoba kontaktowa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Anna Kowalska</h3>
                    <p className="text-sm text-muted-foreground">Specjalista ds. Obsługi Klienta</p>
                    <div className="space-y-1 pt-2">
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <a href="mailto:anna.kowalska@prosta-sprawa.pl" className="hover:text-primary">
                          anna.kowalska@prosta-sprawa.pl
                        </a>
                      </p>
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <a href="tel:+48123456789" className="hover:text-primary">
                          +48 123 456 789
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Godziny otwarcia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Poniedziałek - Piątek</span>
                        <span className="text-muted-foreground">9:00 - 17:00</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Sobota - Niedziela</span>
                        <span className="text-muted-foreground">Nieczynne</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Poland Map Card */}
            <Card>
              <CardHeader>
                <CardTitle>Działamy w całej Polsce</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 flex items-center justify-center min-h-[200px]">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Nasza platforma obsługuje prawników<br />z wszystkich województw w Polsce
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Google Maps */}
        <Card>
          <CardHeader>
            <CardTitle>Znajdź nas na mapie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2443.3287367871634!2d21.01223431593449!3d52.22967797975674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecc669a869f01%3A0x72f0be2a88ead3fc!2sPalace%20of%20Culture%20and%20Science!5e0!3m2!1sen!2spl!4v1234567890123!5m2!1sen!2spl"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokalizacja na mapie"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              ul. Przykładowa 123, 00-001 Warszawa
            </p>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Często zadawane pytania</h2>
          <p className="text-muted-foreground mb-6">
            Szukasz odpowiedzi na najczęściej zadawane pytania? Odwiedź nasze centrum pomocy.
          </p>
          <Button variant="outline" asChild>
            <a href="/panel-klienta/pomoc">Centrum pomocy</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
