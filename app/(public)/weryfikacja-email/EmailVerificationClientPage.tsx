"use client"

import { AuthLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, ArrowRight, Check, Loader2 } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function EmailVerificationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already-verified">("loading")
  const [message, setMessage] = useState("")
  const [showResendButton, setShowResendButton] = useState(false)

  useEffect(() => {
    const statusParam = searchParams.get("status")
    const errorParam = searchParams.get("error")

    if (statusParam === "sukces") {
      setStatus("success")
      setMessage("Twój adres email został pomyślnie zweryfikowany! Możesz się teraz zalogować.")
    } else if (statusParam === "juz-zweryfikowany") {
      setStatus("already-verified")
      setMessage("Ten adres email został już wcześniej zweryfikowany. Możesz się zalogować.")
    } else if (errorParam) {
      setStatus("error")
      setShowResendButton(true)

      switch (errorParam) {
        case "brak-tokenu":
          setMessage("Brak tokenu weryfikacyjnego w linku.")
          break
        case "nieprawidlowy-token":
          setMessage("Nieprawidłowy token weryfikacyjny. Link może być niepoprawny.")
          break
        case "wygasly-token":
          setMessage("Token weryfikacyjny wygasł. Link jest ważny tylko przez 24 godziny.")
          break
        case "nie-znaleziono-uzytkownika":
          setMessage("Nie znaleziono użytkownika powiązanego z tym tokenem.")
          setShowResendButton(false)
          break
        case "blad-serwera":
          setMessage("Wystąpił błąd serwera podczas weryfikacji emaila. Spróbuj ponownie później.")
          break
        default:
          setMessage("Wystąpił nieznany błąd podczas weryfikacji emaila.")
      }
    } else {
      setStatus("error")
      setMessage("Brak informacji o statusie weryfikacji.")
    }
  }, [searchParams])

  const handleResendEmail = () => {
    router.push("/wyslij-ponownie-weryfikacje")
  }

  const getHeroContent = () => {
    switch (status) {
      case "success":
        return {
          heroTitle: "Sukces weryfikacji!",
          heroDescription: "Twój adres e-mail został pomyślnie potwierdzony. Witamy w gronie użytkowników Prosta Sprawa. Możesz teraz w pełni korzystać z naszej platformy.",
          heroImage: "/images/lawyers_meeting.png",
          heroStats: [
            { value: 100, unit: "%", label: "Bezpieczeństwo" },
            { value: 15000, unit: "+", label: "Użytkowników" },
            { value: 1, label: "Kliknięcie do logowania" },
          ]
        }
      case "already-verified":
        return {
          heroTitle: "Konto gotowe do pracy",
          heroDescription: "Twój adres e-mail został już zweryfikowany wcześniej. Nie musisz nic więcej robić – wystarczy się zalogować.",
          heroImage: "/images/lawyer_with_coffee.png",
          heroStats: [
            { value: 100, unit: "%", label: "Gotowość" },
            { value: 200, unit: "+", label: "Ekspertów" },
          ]
        }
      case "error":
        return {
          heroTitle: "Napotkaliśmy problem",
          heroDescription: "Link weryfikacyjny może być nieaktualny lub uszkodzony. Wygeneruj nowy link weryfikacyjny, aby aktywować konto.",
          heroImage: "/images/security-lock.png",
          heroStats: [
            { value: 24, unit: "h", label: "Ważność linku" },
          ]
        }
      default:
        return {
          heroTitle: "Weryfikacja konta",
          heroDescription: "Trwa sprawdzanie tokenu weryfikacyjnego. Bezpieczeństwo Twojego konta jest dla nas najważniejsze.",
          heroImage: undefined,
          heroStats: []
        }
    }
  }

  const hero = getHeroContent()

  return (
    <AuthLayout
      heroTitle={hero.heroTitle}
      heroDescription={hero.heroDescription}
      heroStats={hero.heroStats}
      heroImage={hero.heroImage}
    >
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="px-0 space-y-6">
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Green check animated badge */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="relative flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-emerald-100/50 dark:bg-emerald-950/20"
                  />
                  <CheckCircle2 className="w-12 h-12 relative z-10 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
              </div>

              <div className="text-center space-y-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-playfair sm:text-4xl">
                  Email zweryfikowany!
                </h1>
                <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
                  Twój adres email został pomyślnie zweryfikowany! Możesz się teraz zalogować i korzystać ze wszystkich funkcji platformy.
                </p>
              </div>

              {/* What you can do section */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-4 bg-muted/40 border border-border/80 rounded-xl p-5"
              >
                <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                  Co możesz teraz zrobić?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>Opisać swój problem prawny i bezpłatnie otrzymać oferty pomocy.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>Wyszukać i skonsultować się ze sprawdzonymi specjalistami.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>Wygodnie zarządzać swoimi sprawami i dokumentami w panelu.</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="pt-2"
              >
                <Button asChild size="lg" className="w-full text-base font-semibold group h-12 shadow-md hover:shadow-lg transition-all">
                  <Link href="/logowanie" className="flex items-center justify-center gap-2">
                    Przejdź do logowania
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          )}

          {status === "already-verified" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Blue check animated badge */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="relative flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-500"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-blue-100/50 dark:bg-blue-950/20"
                  />
                  <CheckCircle2 className="w-12 h-12 relative z-10 text-blue-600 dark:text-blue-400" />
                </motion.div>
              </div>

              <div className="text-center space-y-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-playfair sm:text-4xl">
                  Konto już aktywne
                </h1>
                <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
                  Ten adres email został już wcześniej zweryfikowany. Możesz się od razu zalogować na swoje konto.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="pt-4"
              >
                <Button asChild size="lg" className="w-full text-base font-semibold group h-12 shadow-md hover:shadow-lg transition-all">
                  <Link href="/logowanie" className="flex items-center justify-center gap-2">
                    Zaloguj się
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Red X animated badge */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="relative flex items-center justify-center w-24 h-24 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-red-100/50 dark:bg-red-950/20"
                  />
                  <XCircle className="w-12 h-12 relative z-10 text-red-600 dark:text-red-400" />
                </motion.div>
              </div>

              <div className="text-center space-y-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-playfair sm:text-4xl">
                  Weryfikacja nieudana
                </h1>
                <div className="rounded-lg bg-destructive/15 p-4 text-sm text-destructive border border-destructive/30 max-w-md mx-auto">
                  {message}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-4 bg-muted/40 border border-border/80 rounded-xl p-5 text-sm text-foreground/80 leading-relaxed"
              >
                <p>
                  Link weryfikacyjny mógł wygasnąć (jest ważny przez 24 godziny od rejestracji) lub został już użyty.
                </p>
                <p>
                  Jeśli potrzebujesz nowego linku weryfikacyjnego, skorzystaj z poniższego przycisku, aby wygenerować go ponownie.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-3 pt-2"
              >
                {showResendButton && (
                  <Button
                    onClick={handleResendEmail}
                    className="w-full text-base font-semibold h-12 shadow-sm"
                    variant="default"
                    size="lg"
                  >
                    Wyślij link weryfikacyjny ponownie
                  </Button>
                )}
                <Button
                  asChild
                  className="w-full text-base h-12"
                  variant="outline"
                  size="lg"
                >
                  <Link href="/">
                    Powrót do strony głównej
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          )}

          {status === "loading" && (
            <div className="text-center py-16 space-y-4">
              <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto" />
              <p className="text-muted-foreground font-medium animate-pulse">
                Weryfikowanie adresu e-mail, proszę czekać...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
