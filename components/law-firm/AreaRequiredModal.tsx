"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowRight, Globe, ShieldAlert, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AreaRequiredModalProps {
  isOpenOverride?: boolean
  onCloseOverride?: () => void
}

export function AreaRequiredModal({ isOpenOverride, onCloseOverride }: AreaRequiredModalProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const checkArea = async () => {
    if (session?.user?.role !== "LAW_FIRM") return
    if (!pathname?.startsWith("/panel-eksperta/sprawy")) {
      setOpen(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/law-firm/area")
      if (res.ok) {
        const data = await res.json()
        const hasArea = Boolean(
          data.calaPolska ||
          data.onlineOnly ||
          (data.voivodeships && data.voivodeships.length > 0) ||
          (data.counties && data.counties.length > 0) ||
          (data.cities && data.cities.length > 0)
        )
        setOpen(!hasArea)
      }
    } catch (err) {
      console.error("Error checking area for expert:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpenOverride !== undefined) {
      setOpen(isOpenOverride)
    } else {
      checkArea()
    }
  }, [pathname, session, isOpenOverride])

  const handleRedirect = () => {
    setOpen(false)
    if (onCloseOverride) onCloseOverride()
    router.push("/panel-eksperta/zakres-uslug?podswietl=obszar")
  }

  const handleBackToDashboard = () => {
    setOpen(false)
    if (onCloseOverride) onCloseOverride()
    router.push("/panel-eksperta")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          handleRedirect()
        }
      }}
    >
      <DialogContent className="max-w-md sm:max-w-lg border border-primary/30 bg-background/95 p-6 sm:p-8 shadow-2xl shadow-primary/15 backdrop-blur-2xl text-foreground rounded-3xl overflow-hidden [&>button]:hidden">
        {/* Decorative Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

        {/* Header Illustration */}
        <div className="relative mx-auto mb-5 flex flex-col items-center justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/25 via-teal-500/15 to-transparent border border-primary/35 shadow-xl shadow-primary/15">
            {/* Map Grid Pattern Background */}
            <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(var(--primary)_1px,transparent_1px)] [background-size:12px_12px] opacity-25" />
            <div className="absolute h-16 w-16 rounded-full bg-primary/20 animate-ping opacity-35" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-teal-400 text-white shadow-lg shadow-primary/30">
              <MapPin className="h-7 w-7 stroke-[2.5]" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-background border border-primary/50 text-primary shadow-md">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <Badge
            variant="outline"
            className="mt-4 border-primary/40 bg-primary/15 text-primary-hover font-semibold tracking-wider uppercase px-3 py-0.5 rounded-full text-[11px]"
          >
            Wymagana konfiguracja
          </Badge>
        </div>

        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-playfair">
            Uzupełnij obszar działania
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground/80 leading-relaxed max-w-md mx-auto">
            Nie zaznaczono żadnego obszaru działania w Zakresie Usług. Aby móc przeglądać sprawy i składać oferty klientom, wymagane jest określenie swojego zasięgu działania.
          </DialogDescription>
        </DialogHeader>

        {/* Feature Highlights */}
        <div className="my-6 space-y-3 rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Elastyczny wybór zasięgu</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Możesz wybrać Całą Polskę, obsługę wyłącznie online lub wybrane województwa i miasta.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Dopasowane sprawy od klientów</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Dzięki obszarowi działania zobaczysz zlecenia z Twojego rejonu i nie przegapisz nowych spraw.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          <Button
            onClick={handleRedirect}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all text-sm gap-2 group"
          >
            <span>Uzupełnij obszar działania</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>

          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="w-full text-muted-foreground hover:text-foreground hover:bg-card rounded-xl text-xs h-9"
          >
            Wróć do pulpitu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
