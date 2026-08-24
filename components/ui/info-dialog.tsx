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
import { CheckCircle2, Info, Sparkles } from "lucide-react"

interface InfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  buttonText?: string
  variant?: "success" | "info"
}

export function InfoDialog({
  open,
  onOpenChange,
  title,
  description,
  buttonText = "OK",
  variant = "success",
}: InfoDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] border border-border/80 bg-background/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl shadow-black/10 dark:shadow-black/50 text-foreground">
        <AlertDialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className={`p-3.5 rounded-full ${variant === "success"
                ? "bg-emerald-500/10 text-emerald-400 ring-8 ring-emerald-500/5"
                : "bg-[#0da192]/10 text-[#0da192] ring-8 ring-[#0da192]/5"
              }`}>
              {variant === "success" ? (
                <CheckCircle2 className="h-6 w-6 animate-pulse" />
              ) : (
                <Info className="h-6 w-6" />
              )}
            </div>
          </div>

          <div className="space-y-2 text-center">
            <AlertDialogTitle className="font-playfair text-xl font-semibold text-foreground tracking-tight leading-6">
              {title}
            </AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="text-muted-foreground text-sm md:text-base font-light leading-relaxed">
                {description}
              </AlertDialogDescription>
            )}
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className={`w-full rounded-xl h-11 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${variant === "success"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:bg-emerald-700"
                : "bg-[#0da192] hover:bg-[#0fbaa8] text-white shadow-lg shadow-[#0da192]/20 active:bg-[#0c9082]"
              }`}
          >
            {variant === "success" && <Sparkles className="h-4 w-4" />}
            {buttonText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
