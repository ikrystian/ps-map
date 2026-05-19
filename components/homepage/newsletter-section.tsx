"use client"

import { useState } from "react"
import { toast } from "sonner"

export function NewsletterSection() {
  const [email, setEmail] = useState("")

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

      toast.success("Dziękujemy za zapis do newslettera!")
      setEmail("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
    }
  }

  return (
    <section className="relative overflow-hidden w-full bg-[#141414] border-t border-b border-neutral-900">
      {/* Left 25% green side panel background */}
      <div className="absolute inset-y-0 left-0 w-[25%] bg-[#1e5e4e] z-0" />
      
      {/* Repeating labyrinth pattern overlay on both panels */}
      <div className="absolute inset-0 bg-pattern-labyrinth opacity-100 z-10 pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative container mx-auto px-4 py-16 md:py-20 z-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-playfair text-white text-3xl md:text-4xl font-normal tracking-wide mb-4">
            Zapisz się do newslettera
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
            Otrzymuj porady prawne, nowości i przydatne informacje od prostasprawa.pl – bez spamu, tylko wartościowe treści.
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="flex max-w-md mx-auto items-stretch shadow-2xl relative z-30">
            <input
              type="email"
              placeholder="Wpisz swój adres e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-black text-white placeholder-neutral-600 px-4 py-3 outline-none border border-neutral-800 border-r-0 rounded-none focus:border-[#1e5e4e] focus:ring-1 focus:ring-[#1e5e4e] transition-all text-xs md:text-sm"
            />
            <button
              type="submit"
              className="bg-[#1e5e4e] hover:bg-[#154338] active:bg-[#0f3028] text-white font-medium px-6 py-3 rounded-none transition-colors text-xs md:text-sm whitespace-nowrap cursor-pointer"
            >
              Zapisz się
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
