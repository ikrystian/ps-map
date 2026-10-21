"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface ReasonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  /** Pusty powód = decyzja bez maila do użytkownika (tylko gdy `required` = false). */
  required?: boolean
  /** Rzucony wyjątek zostawia okno otwarte (błąd pokazuje wywołujący). */
  onConfirm: (reason: string) => Promise<void>
}

/**
 * Decyzja admina z uzasadnieniem, które trafia do maila użytkownika
 * (odrzucenie opinii / weryfikacji, blokada konta, wycofanie sprawy).
 */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  required = true,
  onConfirm,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Zamknięcie czyści pole — kolejne otwarcie zaczyna od pustego uzasadnienia
  const handleOpenChange = (next: boolean) => {
    if (!next) setReason("")
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await onConfirm(reason.trim())
      handleOpenChange(false)
    } catch {
      // Wywołujący pokazał już błąd — okno zostaje otwarte z wpisanym uzasadnieniem
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason-dialog-text">
            Uzasadnienie {required ? "(wysyłane użytkownikowi)" : "(opcjonalne — wypełnione wysyła mail z decyzją)"}
          </Label>
          <Textarea
            id="reason-dialog-text"
            rows={5}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={2000}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Anuluj
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={submitting || (required && !reason.trim())}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
