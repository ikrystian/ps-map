"use client"

import { AuthLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { ArrowLeft, Clock, HelpCircle, Loader2, MailCheck } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { useState } from "react"

// Ilustracja kłódki z kluczem — rysowana kolorem primary, dziedziczy motyw (jasny/ciemny)
function LostPasswordIllustration() {
  return (
    <motion.svg
      viewBox="0 0 240 150"
      className="w-44 h-auto mx-auto text-primary"
      fill="none"
      aria-hidden="true"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      {/* Tło - miękkie plamy */}
      <circle cx="120" cy="78" r="62" fill="currentColor" fillOpacity="0.06" />
      <circle cx="120" cy="78" r="46" fill="currentColor" fillOpacity="0.08" />

      {/* Dekoracyjne kropki i iskierki */}
      <circle cx="42" cy="46" r="4" fill="currentColor" fillOpacity="0.25" />
      <circle cx="200" cy="38" r="3" fill="currentColor" fillOpacity="0.3" />
      <circle cx="208" cy="104" r="5" fill="currentColor" fillOpacity="0.15" />
      <circle cx="34" cy="102" r="3" fill="currentColor" fillOpacity="0.2" />
      <path d="M58 22l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2 2.2-5z" fill="currentColor" fillOpacity="0.35" />
      <path d="M186 118l1.8 4 4 1.8-4 1.8-1.8 4-1.8-4-4-1.8 4-1.8 1.8-4z" fill="currentColor" fillOpacity="0.3" />

      {/* Pałąk kłódki */}
      <path
        d="M98 72V54a22 22 0 0 1 44 0v18"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Korpus kłódki */}
      <rect x="84" y="70" width="72" height="54" rx="14" fill="currentColor" />
      <rect x="84" y="70" width="72" height="54" rx="14" fill="url(#lockShine)" />

      {/* Dziurka na klucz */}
      <circle cx="120" cy="92" r="7.5" fill="white" fillOpacity="0.92" />
      <rect x="116.5" y="96" width="7" height="14" rx="3.5" fill="white" fillOpacity="0.92" />

      {/* Klucz lecący do kłódki */}
      <g transform="rotate(-28 186 78)">
        <circle cx="186" cy="66" r="8" stroke="currentColor" strokeOpacity="0.7" strokeWidth="4.5" />
        <path
          d="M186 74v26m0-6h7m-7-12h7"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>

      <defs>
        <linearGradient id="lockShine" x1="84" y1="70" x2="156" y2="124" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.18" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}

export default function LostPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast.success("Link do resetowania hasła został wysłany na podany adres email")
      } else {
        toast.error(data.error || "Wystąpił błąd. Spróbuj ponownie.")
      }
    } catch (error) {
      toast.error("Wystąpił błąd połączenia. Spróbuj ponownie.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout
        heroTitle="Odzyskaj dostęp do konta"
        heroDescription="Bezpiecznie zresetuj swoje hasło i wróć do pracy z najlepszymi prawnikami w Polsce."
      >
        {/* Success Card */}
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="space-y-1 px-0 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="relative mx-auto w-20 h-20 mb-4"
            >
              <span className="absolute inset-0 rounded-full bg-primary/15 animate-ping [animation-duration:2s]" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <MailCheck className="w-9 h-9 text-primary" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold">Sprawdź swoją skrzynkę email</CardTitle>
            <CardDescription className="text-base">
              Jeśli konto z adresem <strong className="text-foreground">{email}</strong> istnieje w naszym systemie,
              wysłaliśmy na nie link do resetowania hasła.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 text-sm">
              <p className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                <HelpCircle className="w-4 h-4 text-primary" />
                Nie otrzymałeś wiadomości?
              </p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  Sprawdź folder SPAM
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  Upewnij się, że podałeś poprawny adres email
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  Poczekaj kilka minut — dostarczenie może potrwać chwilę
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                className="w-full h-11"
                onClick={() => setIsSuccess(false)}
              >
                Wyślij ponownie
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => window.location.href = '/logowanie'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Wróć do logowania
              </Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      heroTitle="Odzyskaj dostęp do konta"
      heroDescription="Bezpiecznie zresetuj swoje hasło i wróć do pracy z najlepszymi prawnikami w Polsce."
    >
      {/* Form Card */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="space-y-3 px-0 text-center">
          <LostPasswordIllustration />
          <CardTitle className="text-2xl font-bold">Zapomniałeś hasła?</CardTitle>
          <CardDescription>
            Wprowadź swój adres email, a wyślemy Ci link do zresetowania hasła
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adres e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nazwa@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-11"
                autoFocus
              />
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 text-sm text-muted-foreground flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p>
                Link do resetowania hasła będzie ważny przez <strong className="text-foreground">1 godzinę</strong>.
              </p>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                "Wyślij link resetujący"
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/logowanie"
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Wróć do logowania
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Potrzebujesz pomocy?{" "}
          <Link href="/kontakt" className="underline hover:text-primary">
            Skontaktuj się z nami
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
