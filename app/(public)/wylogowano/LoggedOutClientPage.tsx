"use client"

import ParticlesBackground from "@/components/ParticlesBackground"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Clock, Home, LogIn, LogOut, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LogoutSuccessPage() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(10)
  const [autoRedirect, setAutoRedirect] = useState(true)

  useEffect(() => {
    if (!autoRedirect) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [autoRedirect])

  useEffect(() => {
    if (autoRedirect && timeLeft === 0) {
      router.push("/")
    }
  }, [timeLeft, autoRedirect, router])

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  } as const

  const childVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  } as const

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 150, damping: 10 },
    },
  } as const

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex items-center justify-center py-12 md:py-24 px-4 overflow-hidden bg-background">
      {/* Dynamic Background Particles */}
      <ParticlesBackground />

      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-primary/10 rounded-full blur-[80px] md:blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-secondary/5 rounded-full blur-[90px] pointer-events-none z-0" />

      {/* Main Glass Card Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl backdrop-blur-md bg-card/45 border border-border/50 rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden"
      >
        {/* Left Column - Business Hero Image */}
        <div className="hidden md:block relative w-full h-full min-h-[450px]">
          <Image
            src="/images/logout-hero.webp"
            alt="Prosta Sprawa Partner"
            fill
            sizes="(max-width: 768px) 0vw, 50vw"
            priority
            className="object-cover"
          />
          {/* Subtle brand color overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-card/10 to-card/45" />
        </div>

        {/* Right Column - Logout Content */}
        <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-8">
          {/* Animated Double-Ring Icon Section */}
          <motion.div variants={iconVariants} className="relative w-24 h-24 flex items-center justify-center">
            {/* Rotating outer rings */}
            <div className="absolute inset-0 rounded-full border border-primary/30 border-dashed animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-primary/20 border-dotted animate-[spin_15s_linear_infinite_reverse]" />
            {/* Glowing central circle */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary/25 to-primary/5 flex items-center justify-center shadow-inner border border-primary/20">
              <LogOut className="w-8 h-8 text-primary animate-[pulse_2s_infinite]" />
            </div>
          </motion.div>

          {/* Text Headers */}
          <motion.div variants={childVariants} className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-playfair tracking-tight text-foreground bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text">
              Pomyślnie wylogowano
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-md mx-auto">
              Twoja sesja została bezpiecznie zakończona. Dziękujemy za skorzystanie z platformy <strong>Prosta Sprawa</strong>!
            </p>
          </motion.div>

          {/* Dynamic Redirect Progress Banner */}
          <motion.div variants={childVariants} className="w-full">
            {autoRedirect ? (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span>
                      Przekierowanie na stronę główną za <strong className="text-base font-bold">{timeLeft}</strong> s
                    </span>
                  </div>
                  <button
                    onClick={() => setAutoRedirect(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors hover:underline cursor-pointer"
                  >
                    Anuluj
                  </button>
                </div>
                <div className="w-full bg-border/20 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${(timeLeft / 10) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-muted/20 border border-border/40 rounded-2xl p-3 text-center text-sm text-muted-foreground">
                Automatyczne przekierowanie zostało anulowane.
              </div>
            )}
          </motion.div>

          {/* Quick Action Navigation Buttons */}
          <motion.div variants={childVariants} className="w-full space-y-3 pt-2">
            <Link href="/logowanie" className="block w-full">
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/10 h-12 rounded-xl group transition-all duration-300 hover:scale-[1.01]"
              >
                <LogIn className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                Zaloguj się ponownie
                <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5" />
              </Button>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/" className="w-full">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-border/60 hover:bg-accent/40 h-12 rounded-xl hover:text-foreground transition-colors"
                >
                  <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                  Strona główna
                </Button>
              </Link>
              <Link href="/szukaj-prawnika" className="w-full">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-border/60 hover:bg-accent/40 h-12 rounded-xl hover:text-foreground transition-colors"
                >
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  Szukaj prawnika
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Footer Support Info */}
          <motion.div variants={childVariants} className="pt-6 border-t border-border/40 w-full">
            <p className="text-xs text-muted-foreground">
              Masz pytania?{" "}
              <Link href="/kontakt" className="text-primary hover:underline hover:text-primary/90 font-medium">
                Skontaktuj się z nami
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
