"use client"

import { Badge } from "@/components/ui/badge"
import { ArrowRight, ShieldCheck, Users } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

// Cząsteczki są dekoracją w tle — ładujemy je po stronie klienta, żeby nie blokowały hydracji
// ani renderowania LCP (nagłówka).
const ParticlesBackground = dynamic(() => import("@/components/ParticlesBackground"), { ssr: false })

const TYPED_PHRASES = [
  "problemy prawne",
  "spory sądowe",
  "sprawy spadkowe",
  "kłopoty z umowami",
  "spory z pracodawcą",
  "sprawy rozwodowe",
  "problemy firmowe",
]

function TypedPhrases() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [text, setText] = useState(TYPED_PHRASES[0])
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const phrase = TYPED_PHRASES[phraseIndex]
    // Pauza na pełnej frazie, szybkie kasowanie, spokojne wypisywanie
    const delay = !isDeleting && text === phrase ? 2400 : isDeleting ? 40 : 90

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (text === phrase) {
          setIsDeleting(true)
        } else {
          setText(phrase.slice(0, text.length + 1))
        }
      } else if (text.length > 0) {
        setText(text.slice(0, -1))
      } else {
        setIsDeleting(false)
        setPhraseIndex((phraseIndex + 1) % TYPED_PHRASES.length)
      }
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, isDeleting, phraseIndex])

  return (
    <span
      className="italic font-bold text-foreground underline decoration-primary/50 underline-offset-8"
      aria-label={TYPED_PHRASES[0]}
    >
      <span aria-hidden="true">
        {text}
        <span className="inline-block w-[3px] h-[0.85em] bg-primary/80 ml-1 align-baseline animate-pulse" />
      </span>
    </span>
  )
}

export function HeroSection() {
  return (
    <section className="dark relative min-h-screen flex items-center justify-center overflow-hidden hero-image pt-16">
      {/* Sekcja ma zawsze wyglądać jak w motywie ciemnym (niezależnie od
          wybranego motywu strony) — stąd klasa `dark` na kontenerze, która
          spina tokeny i warianty `dark:` w środku. */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-0" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-1/4 w-[60%] h-[60%] bg-primary/20 rounded-full blur-[160px] animate-pulse z-0" />
      <div className="absolute bottom-1/4 -right-1/4 w-[60%] h-[60%] bg-teal-500/10 rounded-full blur-[160px] animate-pulse z-0" />

      <ParticlesBackground />

      <div className="container mx-auto px-4 relative z-11 relative py-12">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center animate-hero-fade-up">
            <Badge variant="outline" className="font-light px-5 py-2 border-primary/40 text-foreground bg-primary/5 backdrop-blur-md rounded-full text-xs tracking-widest uppercase text-center">
              Opisz sprawę. <span className="font-bold mx-1"> Specjaliści </span>  zgłoszą się sami.
            </Badge>
          </div>

          {/* Main Title */}
          {/* Nagłówek jest elementem LCP — nie animujemy go z opacity 0, tylko renderujemy od razu */}
          <h1
            className="text-5xl sm:text-7xl md:text-9xl tracking-tight mb-8 font-playfair text-foreground drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
          >
            Prosta Sprawa
          </h1>

          {/* Subtitle & Description */}
          <div className="mb-12 animate-hero-fade-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-2xl md:text-4xl font-light mb-6 font-playfair text-foreground">
              Rozwiązujemy Twoje <TypedPhrases /> w kilku krokach.
            </h2>
            <p className="text-base md:text-xl text-foreground/90 max-w-2xl mx-auto leading-relaxed ">
              Dodaj sprawę i otrzymaj oferty od zweryfikowanych prawników i ekspertów.
              Szybko, bezpiecznie i na Twoich zasadach.
            </p>
          </div>

          {/* Buttons */}
          <div
            className="animate-hero-fade-up flex flex-col sm:flex-row gap-3 sm:gap-6 mb-14 sm:mb-20 justify-center items-center px-4"
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={() => document.getElementById("categories-private")?.scrollIntoView({ behavior: "smooth" })}
              className="group flex items-center justify-center w-full max-w-[280px] sm:w-auto sm:min-w-[280px] h-14 sm:h-[72px] bg-foreground/5 hover:bg-foreground/10 backdrop-blur-xl border border-border hover:border-border text-foreground font-medium text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-foreground/5"
            >
              Sprawy prywatne
              <ArrowRight className="ml-3 h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => document.getElementById("categories-business")?.scrollIntoView({ behavior: "smooth" })}
              className="group flex items-center justify-center w-full max-w-[280px] sm:w-auto sm:min-w-[280px] h-14 sm:h-[72px] bg-foreground/5 hover:bg-foreground/10 backdrop-blur-xl border border-border hover:border-border text-foreground font-medium text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-foreground/5"
            >
              Sprawy firmowe
              <ArrowRight className="ml-3 h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Indicators */}
          <div
            className="animate-hero-fade-in flex flex-wrap justify-center gap-x-12 gap-y-6 pt-12 border-t border-border"
            style={{ animationDelay: "1s" }}
          >
            <div className="flex items-center gap-3 group">
              <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-foreground font-bold text-xl leading-none">0zł</p>
                <p className="text-xs text-foreground/90 uppercase tracking-widest mt-1">Za dodanie sprawy</p>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="bg-teal-500/10 p-2 rounded-lg group-hover:bg-teal-500/20 transition-colors">
                <ShieldCheck className="h-5 w-5 text-teal-500" />
              </div>
              <div className="text-left">
                <p className="text-foreground font-bold text-xl leading-none">0%</p>
                <p className="text-xs text-foreground/90 uppercase tracking-widest mt-1">Prowizji od Twojej sprawy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom radial fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  )
}
