"use client"

import { toast } from "@/components/ui/sonner"
import { MailCheck } from "lucide-react"
import { useState } from "react"
import { Input } from "../ui/input"
import { InteractiveHoverButton } from "../ui/interactive-hover-button"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [subscribedEmail, setSubscribedEmail] = useState("")

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!consent) {
      toast.error("Musisz wyrazić zgodę RODO, aby zapisać się do newslettera.")
      return
    }

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Nie udało się zapisać do newslettera")
      }

      setSubscribedEmail(email)
      setSubscribed(true)
      setEmail("")
      setConsent(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
    }
  }

  return (
    <section className="relative overflow-hidden w-full bg-[#141414] border-t border-b border-neutral-900" id="newsletter-section">
      {/* Left 25% green side panel background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent z-0" />

      {/* Repeating labyrinth pattern overlay on both panels */}
      <div className="absolute inset-0 opacity-100 z-10 pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative container mx-auto px-4 py-16 md:py-20 z-20 " id="newsletter-wrapper">
        {subscribed ? (
          <div className="max-w-xl mx-auto text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-primary/15 animate-pulse" />
              <span className="absolute inset-2 rounded-full border border-primary/30" />
              <MailCheck className="relative h-9 w-9 text-primary" strokeWidth={1.75} />
            </div>

            <h2 className="font-playfair text-white text-3xl md:text-4xl font-normal tracking-wide mb-4">
              Jeszcze tylko jeden krok!
            </h2>

            <p className="text-sm md:text-base text-neutral-300 font-light leading-relaxed mb-2">
              Na adres{" "}
              <span className="text-primary font-medium break-all">{subscribedEmail}</span>{" "}
              wysłaliśmy wiadomość z linkiem potwierdzającym.
            </p>
            <p className="text-xs md:text-sm text-neutral-400 font-light leading-relaxed mb-8">
              Kliknij w link w wiadomości, aby aktywować subskrypcję i zacząć otrzymywać porady prawne oraz najważniejsze
              nowości od prostasprawa.pl. Link jest ważny przez 24 godziny. Nie widzisz e-maila? Sprawdź folder ze spamem
              lub ofertami.
            </p>

            <button
              type="button"
              onClick={() => setSubscribed(false)}
              className="text-xs text-neutral-500 hover:text-primary underline underline-offset-4 transition-colors cursor-pointer"
            >
              Podałeś błędny adres e-mail? Spróbuj ponownie
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-playfair font-light mb-4">
              Zapisz się do newslettera
            </h2>
            <p className="text-xs md:text-sm text-neutral-400 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
              Otrzymuj porady prawne, nowości i przydatne informacje od prostasprawa.pl – bez spamu, tylko wartościowe treści.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col gap-4 relative z-30">
              <div className="flex items-stretch shadow-2xl">
                <Input
                  type="email"
                  placeholder="Wpisz swój adres e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="w-36 min-w-36 flex mr-1">
                  <InteractiveHoverButton type="submit" className="whitespace-nowrap">Zapisz się</InteractiveHoverButton>
                </div>
              </div>

              {/* RODO Consent */}
              <div className="flex items-start gap-2.5 text-left pt-1 px-1">
                <input
                  id="homepage-newsletter-consent"
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-neutral-800 bg-[#1c1c1c] text-primary focus:ring-primary accent-primary cursor-pointer flex-shrink-0"
                />
                <label
                  htmlFor="homepage-newsletter-consent"
                  className="text-xs text-neutral-400 font-light leading-relaxed select-none cursor-pointer"
                >
                  Wyrażam zgodę na otrzymywanie informacji handlowych i marketingowych za pośrednictwem newslettera od ProstaSprawa.pl. Szczegóły dotyczące przetwarzania danych osobowych znajdują się w{" "}
                  <a href="/polityka-prywatnosci" target="_blank" className="text-primary hover:underline font-medium">
                    Polityce Prywatności
                  </a>.
                </label>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}
