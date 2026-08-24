"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { expertAvatar } from "@/lib/expert-avatar"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { motion } from "framer-motion"
import { AlertCircle, ArrowRight, Clock, Loader2, LogIn, MapPin, UserPlus } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

interface ReferralData {
  token: string
  ekspert: { id: string; nazwa: string; slug: string; logo: string | null }
  kategorie: { id: string; nazwa: string }[]
  miasto: { id: string; nazwa: string } | null
  wojewodztwo: { id: string; nazwa: string; slug: string } | null
  typSprawy: string
  nazwaSprawy: string | null
  wiadomosc: string | null
  expiresAt: string
  emailMasked: string
  emailZarejestrowany: boolean
  email?: string
}

export default function ReferralLandingClientPage({ token }: { token: string }) {
  const { data: session, status: sessionStatus } = useSession()
  const [referral, setReferral] = useState<ReferralData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Czekamy na sesję — od niej zależy, czy API odda dane do prefillu i jakie CTA pokażemy
  useEffect(() => {
    if (sessionStatus === "loading") return

    const fetchReferral = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/case-referrals/token/${token}`)
        const data = await response.json()
        if (!response.ok) {
          setError(data.error || "Nie udało się wczytać polecenia")
          return
        }
        setReferral(data)
        setError(null)
      } catch {
        setError("Nie udało się wczytać polecenia. Spróbuj ponownie później.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReferral()
  }, [token, sessionStatus])

  if (isLoading || sessionStatus === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-light text-muted-foreground">Wczytywanie polecenia...</p>
        </div>
      </div>
    )
  }

  if (error || !referral) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4">
        <Card variant="glass" className="w-full">
          <CardContent className="space-y-5 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10">
              <AlertCircle className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <Heading level="h2" size="h3">
                Link jest nieaktywny
              </Heading>
              <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">{error}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="outline" asChild>
                <Link href="/">Strona główna</Link>
              </Button>
              <Button variant="primary" asChild>
                <Link href="/rejestracja/klient">Załóż konto samodzielnie</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const role = session?.user?.role
  const sessionEmail = session?.user?.email?.toLowerCase()
  const isMatchingClient = role === "CLIENT" && !!referral.email && sessionEmail === referral.email

  const renderCta = () => {
    if (isMatchingClient) {
      return (
        <Button variant="primary" size="lg" asChild className="w-full sm:w-auto">
          <Link href={`/panel-klienta/sprawy/dodaj?referral=${referral.token}`}>
            Dokończ zgłoszenie sprawy
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )
    }

    if (role === "CLIENT") {
      return (
        <div className="space-y-3">
          <p className="text-sm font-light text-amber-400">
            Jesteś zalogowany na inne konto niż adres, na który wysłano to polecenie
            ({referral.emailMasked}).
          </p>
          <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
            <Link href={`/api/auth/signout?callbackUrl=/polecenie/${referral.token}`}>
              Wyloguj się i użyj linku ponownie
            </Link>
          </Button>
        </div>
      )
    }

    if (role === "LAW_FIRM" || role === "ADMIN") {
      return (
        <p className="text-sm font-light text-amber-400">
          Ten link jest przeznaczony dla klienta ({referral.emailMasked}). Zaloguj się na konto
          klienta lub przekaż mu tę wiadomość.
        </p>
      )
    }

    if (referral.emailZarejestrowany) {
      return (
        <div className="space-y-3">
          <p className="text-sm font-light text-muted-foreground">
            Pod adresem {referral.emailMasked} istnieje już konto — zaloguj się, aby dokończyć
            zgłoszenie.
          </p>
          <Button variant="primary" size="lg" asChild className="w-full sm:w-auto">
            <Link href={`/logowanie?callbackUrl=${encodeURIComponent(`/polecenie/${referral.token}`)}`}>
              <LogIn className="mr-2 h-4 w-4" />
              Zaloguj się
            </Link>
          </Button>
        </div>
      )
    }

    return (
      <Button variant="primary" size="lg" asChild className="w-full sm:w-auto">
        <Link href={`/rejestracja/klient?referral=${referral.token}`}>
          <UserPlus className="mr-2 h-4 w-4" />
          Załóż konto i dodaj sprawę
        </Link>
      </Button>
    )
  }

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="absolute left-1/4 top-0 pointer-events-none h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 space-y-6"
      >
        <div className="space-y-2 text-center">
          <Badge className="border border-primary/30 bg-primary/10 text-primary">
            Polecenie od eksperta
          </Badge>
          <Heading level="h1" size="h2">
            Twoja sprawa jest już wstępnie przygotowana
          </Heading>
          <p className="text-sm font-light leading-relaxed text-muted-foreground">
            Wystarczy, że {referral.emailZarejestrowany ? "zalogujesz się" : "założysz konto"} i
            uzupełnisz pozostałe informacje. Zakres i lokalizację wybrał już ekspert.
          </p>
        </div>

        <Card variant="glass">
          <CardContent className="space-y-6 p-6 sm:p-8">
            {/* Ekspert */}
            <div className="flex items-center gap-4">
              <Image
                src={expertAvatar(referral.ekspert.logo)}
                alt={referral.ekspert.nazwa}
                width={56}
                height={56}
                className="h-14 w-14 rounded-xl border border-border/30 object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-light uppercase tracking-wider text-muted-foreground">
                  Sprawę poleca
                </p>
                <Link
                  href={`/ekspert/${referral.ekspert.slug}`}
                  className="font-playfair text-lg font-semibold text-foreground hover:text-primary"
                >
                  {referral.ekspert.nazwa}
                </Link>
              </div>
            </div>

            {referral.wiadomosc && (
              <blockquote className="rounded-lg border-l-2 border-primary/60 bg-primary/5 px-4 py-3 text-sm font-light italic leading-relaxed text-foreground/80">
                {referral.wiadomosc}
              </blockquote>
            )}

            <div className="h-px bg-border/20" />

            {/* Przygotowany zakres */}
            <div className="space-y-3">
              {referral.nazwaSprawy && (
                <div>
                  <p className="text-xs font-light uppercase tracking-wider text-muted-foreground">Sprawa</p>
                  <p className="mt-1 font-medium text-foreground">{referral.nazwaSprawy}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-light uppercase tracking-wider text-muted-foreground">Zakres</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {referral.kategorie.map((category) => (
                    <Badge
                      key={category.id}
                      className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary"
                    >
                      {category.nazwa}
                    </Badge>
                  ))}
                </div>
              </div>

              {referral.miasto && (
                <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {referral.miasto.nazwa}
                  {referral.wojewodztwo ? `, ${referral.wojewodztwo.nazwa}` : ""}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Link ważny do{" "}
                {format(new Date(referral.expiresAt), "d MMMM yyyy", { locale: pl })}
              </div>
            </div>

            <div className="h-px bg-border/20" />

            {renderCta()}
          </CardContent>
        </Card>

        <p className="text-center text-xs font-light text-muted-foreground">
          Skorzystanie z linku jest bezpłatne i niezobowiązujące. Po dodaniu sprawy otrzymasz oferty
          od ekspertów — również innych niż polecający.
        </p>
      </motion.div>
    </div>
  )
}
