/**
 * Komponent ExpiredPackageModal
 *
 * Modal wyświetlany gdy pakiet subskrypcji wygasł
 * Informuje użytkownika o wygaśnięciu i zachęca do odnowienia
 */

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Calendar, Lock } from "lucide-react";
import { useState } from "react";

interface ExpiredPackageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageName: string;
  expiryDate: Date | null;
  blockedFeatures?: string[];
}

export function ExpiredPackageModal({
  open,
  onOpenChange,
  packageName,
  expiryDate,
  blockedFeatures = [
    "Dodawanie nowych ofert do spraw",
    "Dostęp do statystyk",
    "Promowanie profilu",
    "Zarządzanie blogiem (pakiety wyższe)",
  ],
}: ExpiredPackageModalProps) {
  const [remindLater, setRemindLater] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return "Nieznana data";
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const handleRemindLater = () => {
    setRemindLater(true);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>

          <AlertDialogTitle className="text-center text-xl">
            Twój pakiet {packageName} wygasł
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>Data wygaśnięcia: {formatDate(expiryDate)}</span>
            </div>

            <div className="rounded-lg bg-muted p-4 text-left">
              <div className="flex items-start gap-2 mb-2">
                <Lock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <p className="text-sm font-medium">Zablokowane funkcje:</p>
              </div>
              <ul className="space-y-1 ml-6">
                {blockedFeatures.map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {feature}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm">
              Odnów swój pakiet, aby przywrócić pełny dostęp do wszystkich funkcji platformy.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <Button asChild className="w-full" size="lg">
            <Link href="/panel-kancelarii/pakiet">
              Odnów pakiet teraz
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <AlertDialogCancel asChild>
            <Button variant="outline" className="w-full" onClick={handleRemindLater}>
              Przypomnij później
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
