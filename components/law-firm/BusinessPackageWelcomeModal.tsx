/**
 * Komponent BusinessPackageWelcomeModal
 *
 * Wyświetla się po pierwszym zalogowaniu eksperta,
 * informując o automatycznym przyznaniu pakietu Biznes na 3 miesiące.
 */

"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Award, BookOpen, CheckCircle2, Globe, Loader2, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

interface BusinessPackageWelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function BusinessPackageWelcomeModal({
  open,
  onOpenChange,
  onConfirm,
}: BusinessPackageWelcomeModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/notification-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ welcomePackageSeen: true }),
      });

      if (res.ok) {
        onConfirm();
        onOpenChange(false);
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error setting welcome package seen:", error);
      toast.error("Wystąpił problem z zapisaniem statusu. Spróbuj ponownie.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl border border-amber-500/20 bg-zinc-950 p-6 shadow-2xl shadow-amber-500/5 backdrop-blur-xl md:p-8 text-white">
        <AlertDialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-lg shadow-amber-500/20">
            <Zap className="h-8 w-8 text-zinc-950 fill-zinc-950 animate-bounce" />
          </div>

          <AlertDialogTitle className="text-center text-2xl font-bold tracking-tight text-white md:text-3xl font-playfair">
            Pakiet Biznes VIP Aktywowany!
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-sm text-zinc-400 md:text-base max-w-lg mx-auto">
            Jako powitanie na naszej platformie, automatycznie przyznaliśmy Twojego profilu najwyższy pakiet <span className="text-amber-400 font-semibold">Biznes VIP na okres 3 miesięcy całkowicie za darmo</span>!
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Korzyści pakietu */}
        <div className="my-6 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 md:p-6">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Co zyskujesz dzięki pakietowi Biznes:
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm text-zinc-200">Zlecenia i kategorie bez limitu</h5>
                <p className="text-xs text-zinc-400 mt-1">Dostęp do wszystkich spraw i nieograniczona liczba specjalizacji.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Award className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm text-zinc-200">Wyróżnienie VIP "Skill Law Focus"</h5>
                <p className="text-xs text-zinc-400 mt-1">Twój profil otrzyma unikalną odznakę i będzie promowany na szczycie list.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Globe className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm text-zinc-200">Maksymalny zasięg działania</h5>
                <p className="text-xs text-zinc-400 mt-1">Możliwość pozyskiwania klientów z 6 województw oraz 35 miast.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <BookOpen className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm text-zinc-200">Własny Blog Ekspercki</h5>
                <p className="text-xs text-zinc-400 mt-1">Publikuj artykuły i buduj pozycję lidera w swojej dziedzinie prawa.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-zinc-800 text-center text-xs text-zinc-500">
            Pakiet został włączony automatycznie. Po 3 miesiącach pakiet wygaśnie bez żadnych zobowiązań ani opłat.
          </div>
        </div>

        <AlertDialogFooter className="pt-2">
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-zinc-950 font-bold py-6 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all text-base"
            onClick={handleClose}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uruchamianie panelu...
              </>
            ) : (
              "Zaczynamy korzystać z konta VIP"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
