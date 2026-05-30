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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Clock } from "lucide-react"
import { Promotion } from "../types"
import { getPromotionTypeLabel, formatDate, getPromotionStatusBadge } from "../utils"

interface PromotionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotions: Promotion[]
  promotionTypes: any[]
}

export function PromotionHistoryDialog({
  open,
  onOpenChange,
  promotions,
  promotionTypes,
}: PromotionHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[768px] max-h-[85vh] overflow-y-auto bg-[#20201d] border-[#3e3e38] text-white rounded-2xl">
        <DialogHeader className="pb-3 border-b border-[#3e3e38]/60">
          <DialogTitle className="flex items-center gap-2 text-white font-bold">
            <Clock className="h-5 w-5 text-[#0da192]" />
            Historia Zamówień Promowań
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Pełny wykaz zakupionych przez Ciebie promowań, kosztów punktowych i statusów
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {promotions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Brak zarejestrowanych operacji marketingowych na tym koncie.
            </div>
          ) : (
            <div className="border border-[#3e3e38] bg-[#363431]/10 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-[#20201d]/60 border-b border-[#3e3e38]/60">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">
                      Format promowania
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">
                      Zasięg / Kategoria
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">
                      Data zakupu
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">
                      Okres ważności
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right py-3">
                      Koszt
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promo) => (
                    <TableRow
                      key={promo.id}
                      className="hover:bg-[#363431]/40 border-b border-[#3e3e38]/30 transition-colors"
                    >
                      <TableCell className="font-bold text-xs text-white py-3">
                        {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                      </TableCell>
                      <TableCell className="text-xs text-[#b7b5a9]">
                        {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                      </TableCell>
                      <TableCell className="text-[11px] text-[#b7b5a9]">
                        {formatDate(promo.createdAt)}
                      </TableCell>
                      <TableCell className="text-[11px] text-[#b7b5a9] space-y-0.5">
                        <div>Od: {new Date(promo.startPromocji).toLocaleDateString("pl-PL")}</div>
                        <div>Do: {new Date(promo.koniecPromocji).toLocaleDateString("pl-PL")}</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs text-[#d7b56d] py-3">
                        {promo.kosztPunktow} pkt
                      </TableCell>
                      <TableCell className="py-3">{getPromotionStatusBadge(promo)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-[#3e3e38]/60 pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#363431] hover:bg-[#3e3e38] text-white rounded-xl px-5"
          >
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
