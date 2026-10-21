"use client"

/**
 * Przycisk + modal zmiany adresu e-mail konta (panel klienta i eksperta).
 *
 * Wysyła prośbę do POST /api/account/email-change — adres zmienia się dopiero
 * po kliknięciu linku, który przychodzi na NOWY adres (mail ZMIANA_EMAIL).
 */

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, MailCheck } from "lucide-react"
import { useState } from "react"

export function ChangeEmailDialog({ currentEmail }: { currentEmail: string }) {
  const [open, setOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [sentTo, setSentTo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setNewEmail("")
      setPassword("")
      setError("")
      setSentTo("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Modal bywa renderowany wewnątrz formularza profilu — zdarzenie z portalu
    // propaguje się po drzewie Reacta i wysłałoby też tamten formularz
    e.stopPropagation()
    setError("")
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/account/email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Nie udało się zmienić adresu e-mail")
        return
      }
      setSentTo(newEmail.trim().toLowerCase())
    } catch {
      setError("Nie udało się połączyć z serwerem. Spróbuj ponownie.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="ml-auto shrink-0" onClick={() => setOpen(true)}>
        Zmień
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Zmiana adresu e-mail</DialogTitle>
            <DialogDescription>
              Obecny adres: <span className="font-medium text-foreground break-all">{currentEmail}</span>
            </DialogDescription>
          </DialogHeader>

          {sentTo ? (
            <div className="flex gap-3 rounded-lg border border-border/50 p-4">
              <MailCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Wysłaliśmy link na <span className="font-medium text-foreground break-all">{sentTo}</span>. Adres
                zmieni się po jego kliknięciu. Link jest ważny 24 godziny.
              </p>
            </div>
          ) : (
            <form id="change-email-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="change-email-new">Nowy adres e-mail</Label>
                <Input
                  id="change-email-new"
                  type="email"
                  autoComplete="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="change-email-password">Aktualne hasło</Label>
                <Input
                  id="change-email-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Nie wpisuj nic, jeśli logujesz się tylko przez Google, Facebook lub LinkedIn.
                </p>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </form>
          )}

          <DialogFooter>
            {sentTo ? (
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Gotowe
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Anuluj
                </Button>
                <Button type="submit" form="change-email-form" disabled={isSubmitting || !newEmail}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Wyślij link
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
