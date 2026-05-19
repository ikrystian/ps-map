"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Zapisz się do newslettera
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Otrzymuj porady prawne, aktualności i informacje o nowych ekspertach
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Twój adres email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" size="lg">
              Zapisz się
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
