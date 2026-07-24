"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { clearAppCacheAndStorage } from "@/lib/utils"
import { AlertTriangle, FileText, Info, Loader2, ShieldCheck, Trash2 } from "lucide-react"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"

/** Fraza, którą użytkownik musi przepisać, aby potwierdzić usunięcie konta. */
const CONFIRMATION_PHRASE = "USUWAM KONTO"

interface RetentionSummary {
  role: "CLIENT" | "LAW_FIRM" | "ADMIN"
  invoices: number
  paidOrders: number
  cases: number
  offers: number
  retentionUntil: string
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Sekcja "Usuń konto" wraz z oknem potwierdzenia.
 *
 * Usunięcie konta polega na anonimizacji danych osobowych — dane, których
 * przechowywania wymagają przepisy prawa (faktury, dowody księgowe,
 * dokumentacja transakcji), zostają zachowane do końca okresu retencji.
 * Użytkownik jest o tym informowany przed potwierdzeniem operacji
 * (art. 13 ust. 2 lit. a RODO).
 */
export function DeleteAccountSection({ variant = "expert" }: { variant?: "expert" | "client" }) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [summary, setSummary] = useState<RetentionSummary | null>(null)
  // Stan końcowy ustawiany także po błędzie — inaczej efekt odpytywałby endpoint w pętli.
  const [summaryState, setSummaryState] = useState<"idle" | "loading" | "done" | "error">("idle")

  useEffect(() => {
    if (!open || summaryState !== "idle") return

    const fetchSummary = async () => {
      setSummaryState("loading")
      try {
        const response = await fetch("/api/auth/me/deletion-summary")
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        setSummary(await response.json())
        setSummaryState("done")
      } catch (error) {
        console.error("Error fetching retention summary:", error)
        setSummaryState("error")
      }
    }

    fetchSummary()
  }, [open, summaryState])

  const handleDelete = async () => {
    if (confirmation.trim().toUpperCase() !== CONFIRMATION_PHRASE) {
      toast.error(`Wpisz „${CONFIRMATION_PHRASE}”, aby potwierdzić`)
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch("/api/auth/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Żądanie usunięcia konta z panelu użytkownika" }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Failed to delete account")
      }

      toast.success("Konto zostało usunięte, a Twoje dane osobowe zanonimizowane")
      await clearAppCacheAndStorage()
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć konta")
      setIsDeleting(false)
    }
  }

  const retainedItems = summary
    ? [
        summary.invoices > 0 && {
          label: `Faktury (${summary.invoices})`,
          basis: "art. 106e ustawy o VAT, art. 74 ustawy o rachunkowości — faktura nie może zostać zmieniona",
        },
        summary.paidOrders > 0 && {
          label: `Opłacone zamówienia (${summary.paidOrders})`,
          basis: "art. 86 § 1 Ordynacji podatkowej — dowody księgowe przechowywane 5 lat",
        },
        summary.cases > 0 && {
          label: `Zgłoszone sprawy (${summary.cases})`,
          basis: "art. 118 Kodeksu cywilnego — dokumentacja zlecenia do upływu przedawnienia roszczeń",
        },
        summary.offers > 0 && {
          label: `Złożone oferty (${summary.offers})`,
          basis: "art. 118 Kodeksu cywilnego — dokumentacja kontraktowa",
        },
      ].filter((item): item is { label: string; basis: string } => Boolean(item))
    : []

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 group hover:border-rose-500/40 transition-all duration-200">
        <div className="min-w-0">
          <h4 className="font-semibold text-rose-400 text-sm">Usuń konto</h4>
          <p className="text-xs text-muted-foreground/80 font-light mt-0.5 leading-relaxed">
            {variant === "expert"
              ? "Zamknij profil eksperta i zanonimizuj swoje dane osobowe."
              : "Zamknij konto i zanonimizuj swoje dane osobowe."}{" "}
            Dokumentacja wymagana przepisami prawa zostanie zachowana przez okres retencji.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className="shrink-0 h-10 px-5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl gap-2 transition-all"
        >
          <Trash2 className="h-4.5 w-4.5" />
          Usuń konto
        </Button>
      </div>

      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (isDeleting) return
          setOpen(next)
          if (!next) setConfirmation("")
        }}
      >
        <AlertDialogContent className="max-w-[560px] border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl shadow-black/50 text-white max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3.5 rounded-full bg-rose-500/10 text-rose-500 ring-8 ring-rose-500/5">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-2 text-center">
              <AlertDialogTitle className="font-playfair text-xl font-semibold text-white tracking-tight leading-6">
                Usunięcie konta i anonimizacja danych
              </AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400 text-sm font-light leading-relaxed">
                Tej operacji nie można cofnąć. Utracisz dostęp do konta, a Twoje dane osobowe
                zostaną trwale zanonimizowane.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <div className="mt-5 space-y-4 text-left">
            <div className="rounded-xl border border-border/30 bg-background/30 p-4 space-y-2">
              <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                Zostanie usunięte bezpowrotnie
              </h4>
              <ul className="text-xs text-zinc-400 font-light space-y-1 list-disc list-inside leading-relaxed">
                <li>dane logowania, hasło i powiązane konta społecznościowe</li>
                <li>imię, nazwisko, adres, numer telefonu i adres e-mail</li>
                <li>
                  {variant === "expert"
                    ? "logo, zdjęcia profilu, galeria, certyfikaty i cennik usług"
                    : "zdjęcie profilowe oraz zapisane ulubione profile ekspertów"}
                </li>
                <li>zapis do newslettera, powiadomienia i preferencje komunikacji</li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
              <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Zostanie zachowane — wymagają tego przepisy prawa
              </h4>

              {summaryState === "idle" || summaryState === "loading" ? (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sprawdzanie dokumentacji powiązanej z kontem...
                </div>
              ) : summaryState === "error" ? (
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Nie udało się pobrać zestawienia dokumentacji. Dane wymagane przepisami prawa
                  (m.in. faktury i dowody księgowe) zostaną zachowane przez okres retencji opisany
                  w Polityce prywatności.
                </p>
              ) : retainedItems.length > 0 ? (
                <ul className="space-y-2">
                  {retainedItems.map((item) => (
                    <li key={item.label} className="text-xs leading-relaxed">
                      <span className="font-semibold text-amber-200">{item.label}</span>
                      <span className="block text-zinc-400 font-light">{item.basis}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Z Twoim kontem nie są powiązane dokumenty księgowe. Zachowane zostaną wyłącznie
                  zanonimizowane zapisy techniczne (bez danych osobowych).
                </p>
              )}

              {summary && (
                <p className="text-xs text-zinc-300 font-light pt-1 leading-relaxed">
                  Dokumentacja zostanie usunięta automatycznie po{" "}
                  <span className="font-semibold text-white">
                    {formatDate(summary.retentionUntil)}
                  </span>
                  . Do tego czasu nie jest wykorzystywana w serwisie i nie jest powiązana z Twoimi
                  danymi kontaktowymi.
                </p>
              )}
            </div>

            <Alert className="bg-secondary/5 border-secondary/20 text-secondary rounded-xl flex items-start gap-2.5">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <AlertDescription className="text-xs leading-relaxed font-light">
                {variant === "expert"
                  ? "Przed usunięciem konta wykorzystaj opłacone punkty — po anonimizacji saldo zostanie wyzerowane, a niezrealizowane oferty wygasną."
                  : "Sprawy w toku zostaną anulowane, a złożone do nich oferty wygasną. Umówione konsultacje zostaną odwołane."}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="text-xs font-semibold text-zinc-300">
                Wpisz „{CONFIRMATION_PHRASE}”, aby potwierdzić
              </Label>
              <Input
                id="delete-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder={CONFIRMATION_PHRASE}
                autoComplete="off"
                disabled={isDeleting}
                className="h-11 bg-background/20 border-border/30 rounded-xl text-white"
              />
            </div>
          </div>

          <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
              className="w-full sm:w-1/2 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white text-zinc-300 h-11 text-sm font-medium transition-all"
            >
              Anuluj
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || confirmation.trim().toUpperCase() !== CONFIRMATION_PHRASE}
              className="w-full sm:w-1/2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white h-11 text-sm font-semibold transition-all gap-2 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Anonimizacja danych...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Usuń konto i zanonimizuj dane
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
