"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  isPending?: boolean
  variant?: "danger" | "warning"
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Czy na pewno chcesz usunąć ten element?",
  description = "Tej operacji nie można cofnąć. Wszystkie powiązane dane zostaną trwale usunięte.",
  confirmText = "Usuń",
  cancelText = "Anuluj",
  isPending = false,
  variant = "danger",
}: ConfirmDeleteDialogProps) {
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl shadow-black/50 text-white">
        <AlertDialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className={`p-3.5 rounded-full ${
              variant === "danger" 
                ? "bg-rose-500/10 text-rose-500 ring-8 ring-rose-500/5" 
                : "bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5"
            }`}>
              {variant === "danger" ? (
                <Trash2 className="h-6 w-6 animate-pulse" />
              ) : (
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              )}
            </div>
          </div>
          
          <div className="space-y-2 text-center">
            <AlertDialogTitle className="font-playfair text-xl font-semibold text-white tracking-tight leading-6">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm font-light leading-relaxed">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="w-full sm:w-1/2 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white text-zinc-300 h-11 text-sm font-medium transition-all"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={`w-full sm:w-1/2 rounded-xl h-11 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:bg-rose-700"
                : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 active:bg-amber-700"
            }`}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              variant === "danger" ? <Trash2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />
            )}
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
