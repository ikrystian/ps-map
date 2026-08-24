"use client"

import { AuthLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { AlertCircle, ArrowRight, Inbox, Mail, RefreshCw } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const role = searchParams.get("role") || "CLIENT"
  const referral = searchParams.get("referral")

  const [isLoading, setIsLoading] = useState(false)
  const [resendCount, setResendCount] = useState(0)

  // Helper to determine the webmail URL for common providers
  const getMailProvider = (emailStr: string) => {
    if (!emailStr) return null
    const domain = emailStr.split("@")[1]?.toLowerCase()
    if (!domain) return null

    if (domain.includes("gmail.com")) {
      return { name: "Gmail", url: "https://mail.google.com" }
    }
    if (domain.includes("wp.pl")) {
      return { name: "WP Poczta", url: "https://poczta.wp.pl" }
    }
    if (domain.includes("onet.pl")) {
      return { name: "Onet Poczta", url: "https://poczta.onet.pl" }
    }
    if (domain.includes("o2.pl")) {
      return { name: "o2 Poczta", url: "https://poczta.o2.pl" }
    }
    if (domain.includes("interia.pl")) {
      return { name: "Interia Poczta", url: "https://poczta.interia.pl" }
    }
    if (
      domain.includes("outlook.com") ||
      domain.includes("hotmail.com") ||
      domain.includes("live.com") ||
      domain.includes("msn.com")
    ) {
      return { name: "Outlook / Hotmail", url: "https://outlook.live.com" }
    }
    if (domain.includes("yahoo.com")) {
      return { name: "Yahoo Mail", url: "https://mail.yahoo.com" }
    }
    return null
  }

  const mailProvider = getMailProvider(email)

  const handleResend = async () => {
    if (!email) {
      toast.error("Brak adresu email. Spróbuj zalogować się, aby wysłać link ponownie.")
      return
    }

    if (resendCount >= 3) {
      toast.error("Osiągnięto limit prób ponownego wysłania. Spróbuj ponownie później.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.includes("already verified")) {
          toast.info("Ten adres email jest już zweryfikowany. Możesz się zalogować.")
        } else {
          toast.error(data.error || "Wystąpił błąd podczas wysyłania wiadomości.")
        }
        return
      }

      setResendCount((prev) => prev + 1)
      toast.success("Nowy link weryfikacyjny został wysłany!", {
        description: "Sprawdź swoją skrzynkę pocztową.",
        duration: 5000,
      })
    } catch (err) {
      console.error(err)
      toast.error("Nie udało się wysłać linku weryfikacyjnego. Spróbuj ponownie.")
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  } as any

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  } as any

  return (
    <AuthLayout
      heroTitle="Aktywacja Twojego konta"
      heroDescription={
        role === "LAW_FIRM"
          ? "Zarejestrowałeś się jako Ekspert/Prawnik. Potwierdź swój adres e-mail, aby móc skonfigurować swój profil eksperta i docierać do klientów."
          : "Zarejestrowałeś się jako Klient. Weryfikacja e-maila jest niezbędna, aby zapewnić bezpieczeństwo Twoich danych i spraw."
      }
      heroStats={[
        { value: 1, label: "Krok do końca" },
        { value: 24, unit: "h", label: "Ważność linku" },
      ]}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Animated Header & Icon */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 15,
              delay: 0.1,
            }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary relative"
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-primary/5 pointer-events-none"
            />
            <Mail className="w-10 h-10" />
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-3xl font-light font-playfair tracking-tight">
            Sprawdź skrzynkę pocztową
          </motion.h2>

          <motion.p variants={itemVariants} className="text-muted-foreground max-w-md mx-auto">
            Wysłaliśmy link aktywacyjny. Kliknij w niego, aby potwierdzić rejestrację i aktywować swoje konto.
          </motion.p>
        </div>

        {/* Email Highlight Card */}
        {email && (
          <motion.div variants={itemVariants}>
            <Card className="border border-primary/20 bg-primary/5 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Wysłano na adres:
                  </span>
                  <p className="font-medium text-foreground break-all">{email}</p>
                </div>
                {mailProvider && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shrink-0 bg-background border-primary/20 hover:border-primary hover:bg-primary/5 text-xs h-9"
                  >
                    <a
                      href={mailProvider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      Otwórz {mailProvider.name}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {referral && (
          <motion.div variants={itemVariants}>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              <p className="font-semibold text-amber-100">Twoja sprawa z polecenia czeka</p>
              <p className="mt-1 text-xs font-light leading-relaxed">
                Po potwierdzeniu adresu e-mail i zalogowaniu otwórz link z polecenia — dokończysz
                zgłoszenie z gotowym zakresem i lokalizacją.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-3">
                <Link href={`/polecenie/${referral}`}>
                  Otwórz link z polecenia
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Action Steps */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Co należy zrobić teraz:
          </h3>

          <div className="grid gap-3">
            {[
              {
                step: "1",
                title: "Otwórz swoją pocztę",
                desc: "Wejdź na swoją skrzynkę pocztową i poszukaj wiadomości od ProstaSprawa.",
              },
              {
                step: "2",
                title: "Kliknij w link weryfikacyjny",
                desc: "Kliknij przycisk lub link w otrzymanej wiadomości, aby potwierdzić swój adres.",
              },
              {
                step: "3",
                title: "Zaloguj się",
                desc: "Po pomyślnej weryfikacji zostaniesz automatycznie przekierowany do logowania.",
              },
              // Rejestracja z polecenia eksperta — sprawa czeka pod tym samym linkiem
              ...(referral
                ? [
                    {
                      step: "4",
                      title: "Dokończ zgłoszenie sprawy",
                      desc: "Wróć do linku z polecenia — zakres i lokalizacja będą już uzupełnione.",
                    },
                  ]
                : []),
            ].map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-3 rounded-lg border border-border/40 bg-card hover:bg-accent/10 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                  {step.step}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-medium text-sm text-foreground">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Resend Action & Info Alert */}
        <motion.div variants={itemVariants} className="space-y-4 pt-2">
          <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground flex gap-2 items-start border border-border/40">
            <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p>
                Nie widzisz wiadomości? Sprawdź folder <strong>SPAM</strong>, Oferty lub Społeczności. Wiadomość powinna dotrzeć w ciągu kilku minut.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleResend}
              disabled={isLoading || resendCount >= 3}
              variant="outline"
              className="flex-1 h-11 text-sm inline-flex items-center justify-center gap-2 group"
            >
              <RefreshCw className={`w-4 h-4 shrink-0 ${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              {isLoading
                ? "Wysyłanie..."
                : resendCount > 0
                  ? `Wyślij ponownie (${3 - resendCount})`
                  : "Nie otrzymałem maila"}
            </Button>

            <Button asChild className="flex-1 h-11 text-sm">
              <Link href="/logowanie" className="inline-flex items-center justify-center gap-1.5">
                Przejdź do logowania
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AuthLayout>
  )
}
