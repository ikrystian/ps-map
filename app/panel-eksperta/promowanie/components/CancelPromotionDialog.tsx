import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertCircle, Loader2 } from "lucide-react"
import { Promotion } from "../types"

interface CancelPromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion: Promotion | null
  cancelling: boolean
  onCancel: () => void
}

export function CancelPromotionDialog({
  open,
  onOpenChange,
  promotion,
  cancelling,
  onCancel,
}: CancelPromotionDialogProps) {
  if (!promotion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#20201d] border-[#3e3e38] text-white rounded-2xl sm:max-w-[420px]">
        <DialogHeader className="pb-3 border-b border-[#3e3e38]/60">
          <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-400" />
            Anuluj Promocję
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Czy na pewno chcesz wyłączyć i usunąć wybrane promowanie?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Anulowanie aktywnej promocji spowoduje jej <strong>natychmiastowe zatrzymanie</strong>{" "}
            w portalu. Wyświetlanie profilu w sekcji promowanej zostanie wyłączone.
          </p>
          <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="h-4.5 w-4.5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-[11px] text-red-400/80 leading-normal">
              <strong>Ważne:</strong> Punkty wykorzystane na zakup tego promowania nie zostaną
              zwrócone na Twoje saldo. Czy chcesz kontynuować?
            </span>
          </div>
        </div>

        <DialogFooter className="border-t border-[#3e3e38]/60 pt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={cancelling}
            className="border-[#3e3e38] bg-[#363431]/20 hover:bg-[#363431] text-white rounded-xl"
          >
            Cofnij
          </Button>
          <Button
            onClick={onCancel}
            disabled={cancelling}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 rounded-xl transition-all duration-200"
          >
            {cancelling ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              "Tak, anuluj bez zwrotu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
