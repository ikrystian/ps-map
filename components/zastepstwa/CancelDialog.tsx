"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/sonner"
import { errorMessage, notifySubstitutionsChanged, postJson } from "@/lib/substitutions/client"
import { Loader2 } from "lucide-react"
import { useState } from "react"

/** Anulowanie zlecenia — pyta o powód i powiadamia zgłoszonych oraz wybranego zastępcę. */
export function CancelDialog({
  order,
  onClose,
  onDone,
}: {
  order: { id: string; numer: string | null; tytul: string; hasSubstitute: boolean } | null
  onClose: () => void
  onDone: () => void
}) {
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!order) return
    if (reason.trim().length < 3) {
      toast.error("Podaj powód anulowania.")
      return
    }
    setBusy(true)
    try {
      const result = await postJson(`/api/substitutions/${order.id}/actions`, { action: "cancel", powod: reason.trim() })
      toast.success(result.message)
      notifySubstitutionsChanged()
      setReason("")
      onDone()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anulować zlecenie {order?.numer ?? ""}?</DialogTitle>
          <DialogDescription>
            {order?.hasSubstitute
              ? "Wybrany zastępca dostanie maila (a przy terminie do 24 h także SMS), że nie musi się stawiać."
              : "Wszyscy zgłoszeni dostaną informację, że zlecenie jest nieaktualne."}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="powod-anulowania" className="mb-1.5 block text-[12.5px]">
            Powód <span className="text-error">*</span>
          </Label>
          <Textarea
            id="powod-anulowania"
            rows={3}
            maxLength={500}
            placeholder="Np. klient cofnął zlecenie, termin zdjęty z wokandy."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Zostaw aktywne
          </Button>
          <Button variant="destructive" onClick={submit} disabled={busy}>
            {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Anuluj zlecenie
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
