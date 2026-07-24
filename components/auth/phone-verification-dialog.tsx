"use client"

/**
 * Modal weryfikacji numeru telefonu kodem SMS.
 *
 * Wspólny dla rejestracji klienta i eksperta. Otwiera się po kliknięciu
 * „Zarejestruj się" — dopiero po poprawnym kodzie wywołuje `onVerified(token)`,
 * a formularz wysyła właściwe żądanie rejestracji z tym tokenem.
 */

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Loader2, ShieldCheck } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

const CODE_LENGTH = 6

interface PhoneVerificationDialogProps {
  open: boolean
  /** Numer telefonu z formularza (dowolny format — serwer go normalizuje). */
  phone: string
  onOpenChange: (open: boolean) => void
  /** Wywoływane po poprawnym kodzie — token przekazujemy do żądania rejestracji. */
  onVerified: (token: string) => void
}

export function PhoneVerificationDialog({
  open,
  phone,
  onOpenChange,
  onVerified,
}: PhoneVerificationDialogProps) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const [maskedPhone, setMaskedPhone] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  // Chroni przed podwójną wysyłką SMS-a w StrictMode (dev montuje efekt dwa razy).
  const sentForPhoneRef = useRef<string | null>(null)

  const code = digits.join("")

  const sendCode = useCallback(async () => {
    setError("")
    setInfo("")
    setIsSending(true)

    try {
      const response = await fetch("/api/auth/phone-verification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Nie udało się wysłać kodu SMS.")
        if (typeof data.retryAfterSeconds === "number") {
          setCooldown(data.retryAfterSeconds)
        }
        return
      }

      setMaskedPhone(data.maskedPhone || "")
      setCooldown(45)
      setInfo(
        data.simulated
          ? "Tryb deweloperski: SMS nie został wysłany, kod znajdziesz w logach serwera."
          : "Kod został wysłany."
      )
    } catch {
      setError("Nie udało się wysłać kodu SMS. Sprawdź połączenie i spróbuj ponownie.")
    } finally {
      setIsSending(false)
    }
  }, [phone])

  // Pierwszy SMS wychodzi automatycznie przy otwarciu modala.
  useEffect(() => {
    if (!open) {
      sentForPhoneRef.current = null
      return
    }
    if (sentForPhoneRef.current === phone) return

    sentForPhoneRef.current = phone
    setDigits(Array(CODE_LENGTH).fill(""))
    setError("")
    setInfo("")
    void sendCode()
  }, [open, phone, sendCode])

  // Odliczanie do ponownej wysyłki.
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  useEffect(() => {
    if (open) {
      // Kursor od razu w pierwszym polu — bez dodatkowego kliknięcia.
      setTimeout(() => inputsRef.current[0]?.focus(), 100)
    }
  }, [open])

  const verifyCode = useCallback(
    async (submittedCode: string) => {
      setError("")
      setIsVerifying(true)

      try {
        const response = await fetch("/api/auth/phone-verification/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, code: submittedCode }),
        })
        const data = await response.json()

        if (!response.ok) {
          const attemptsSuffix =
            typeof data.attemptsLeft === "number" && data.attemptsLeft > 0
              ? ` Pozostało prób: ${data.attemptsLeft}.`
              : ""
          setError(`${data.error || "Weryfikacja nie powiodła się."}${attemptsSuffix}`)
          setDigits(Array(CODE_LENGTH).fill(""))
          setTimeout(() => inputsRef.current[0]?.focus(), 50)
          if (data.canResend) setCooldown(0)
          return
        }

        onVerified(data.token)
      } catch {
        setError("Weryfikacja nie powiodła się. Sprawdź połączenie i spróbuj ponownie.")
      } finally {
        setIsVerifying(false)
      }
    },
    [phone, onVerified]
  )

  const handleDigitChange = (index: number, value: string) => {
    const onlyDigits = value.replace(/\D/g, "")
    if (!onlyDigits) {
      setDigits((prev) => prev.map((d, i) => (i === index ? "" : d)))
      return
    }

    // Nowy stan liczymy poza updaterem setState — updater bywa wywoływany
    // dwukrotnie (StrictMode), więc nie może mieć efektów ubocznych, inaczej
    // komplet cyfr wysłałby dwa żądania weryfikacji naraz.
    const next = [...digits]
    // Wklejenie/wpisanie kilku cyfr naraz rozkłada się na kolejne pola.
    for (let offset = 0; offset < onlyDigits.length && index + offset < CODE_LENGTH; offset++) {
      next[index + offset] = onlyDigits[offset]
    }
    setDigits(next)

    const filled = next.join("")
    if (filled.length === CODE_LENGTH) {
      // Komplet cyfr — sprawdzamy od razu, bez klikania „Potwierdź".
      void verifyCode(filled)
      return
    }

    const nextIndex = Math.min(index + onlyDigits.length, CODE_LENGTH - 1)
    setTimeout(() => inputsRef.current[nextIndex]?.focus(), 0)
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      // Backspace w pustym polu cofa do poprzedniego — typowe zachowanie pól OTP.
      inputsRef.current[index - 1]?.focus()
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const isBusy = isSending || isVerifying

  return (
    <Dialog open={open} onOpenChange={(next) => !isBusy && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Weryfikacja numeru telefonu</DialogTitle>
          <DialogDescription className="text-center">
            {maskedPhone
              ? <>Kod wysłaliśmy SMS-em na numer <span className="font-medium text-foreground">{maskedPhone}</span>. Wpisz go poniżej, aby dokończyć rejestrację.</>
              : "Wysyłamy kod SMS na podany numer telefonu…"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-center gap-2" onPaste={(e) => {
            e.preventDefault()
            handleDigitChange(0, e.clipboardData.getData("text"))
          }}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputsRef.current[index] = el }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={CODE_LENGTH}
                value={digit}
                disabled={isBusy}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={cn(
                  "h-12 w-11 rounded-md border border-input bg-background text-center text-lg font-semibold",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:opacity-50",
                  error && "border-destructive focus-visible:ring-destructive"
                )}
              />
            ))}
          </div>

          {error && <p className="text-center text-sm text-destructive">{error}</p>}
          {!error && info && <p className="text-center text-sm text-muted-foreground">{info}</p>}

          <div className="text-center text-sm">
            {cooldown > 0 ? (
              <span className="text-muted-foreground">
                Wyślij ponownie za {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, "0")}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void sendCode()}
                disabled={isBusy}
                className="text-primary hover:underline disabled:opacity-50"
              >
                Wyślij kod ponownie
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
          >
            Anuluj
          </Button>
          <Button
            type="button"
            onClick={() => void verifyCode(code)}
            disabled={isBusy || code.length !== CODE_LENGTH}
          >
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Potwierdź
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
