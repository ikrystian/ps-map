/**
 * Komponent UpgradeAlert
 *
 * Wyświetla alert zachęcający do upgrade pakietu
 * gdy użytkownik próbuje uzyskać dostęp do funkcji premium
 */

"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Lock, Zap } from "lucide-react";
import Link from "next/link";

interface UpgradeAlertProps {
  feature?: string;
  requiredPackage?: string | string[];
  description?: string;
  className?: string;
  variant?: "default" | "destructive";
  showUpgradeButton?: boolean;
}

export function UpgradeAlert({
  feature = "Ta funkcja",
  requiredPackage,
  description,
  className,
  variant = "default",
  showUpgradeButton = true,
}: UpgradeAlertProps) {
  // Formatuj listę wymaganych pakietów
  const formatPackages = () => {
    if (!requiredPackage) return "wyższym pakiecie";

    if (Array.isArray(requiredPackage)) {
      if (requiredPackage.length === 1) return `pakiecie ${requiredPackage[0]}`;
      return `pakietach ${requiredPackage.slice(0, -1).join(", ")} lub ${requiredPackage[requiredPackage.length - 1]}`;
    }

    return `pakiecie ${requiredPackage}`;
  };

  return (
    <Alert className={className} variant={variant}>
      <Lock className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {feature} - Dostępne w {formatPackages()}
        {variant === "default" && <Zap className="h-4 w-4 text-yellow-500" />}
      </AlertTitle>
      <AlertDescription>
        {description || `${feature} jest dostępne w ${formatPackages()}. Ulepsz swój pakiet, aby uzyskać dostęp do tej funkcji.`}

        {showUpgradeButton && (
          <div className="mt-3">
            <Button asChild size="sm">
              <Link href="/panel-eksperta/pakiet">
                Ulepsz pakiet
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
