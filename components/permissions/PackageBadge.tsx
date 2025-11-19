/**
 * Komponent PackageBadge
 *
 * Wyświetla badge z nazwą pakietu subskrypcji
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type PackageType = "PODSTAWOWY" | "STANDARD" | "PREMIUM" | "BIZNES" | null;

interface PackageBadgeProps {
  packageType: PackageType;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PackageBadge({
  packageType,
  className,
  showIcon = true,
  size = "md",
}: PackageBadgeProps) {
  // Rozmiary
  const sizeClasses = {
    sm: {
      badge: "text-xs px-2 py-0.5",
      icon: "h-3 w-3",
    },
    md: {
      badge: "text-sm px-2.5 py-1",
      icon: "h-3.5 w-3.5",
    },
    lg: {
      badge: "text-base px-3 py-1.5",
      icon: "h-4 w-4",
    },
  };

  const sizes = sizeClasses[size];

  // Jeśli brak pakietu, wyświetl odpowiedni badge
  if (!packageType) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1 font-semibold border-gray-300 text-gray-500 dark:text-gray-400",
          sizes.badge,
          className
        )}
      >
        Brak pakietu
      </Badge>
    );
  }

  // Konfiguracja dla każdego pakietu
  const packageConfig = {
    PODSTAWOWY: {
      label: "Podstawowy",
      icon: Sparkles,
      variant: "outline" as const,
      className: "border-gray-400 text-gray-700 dark:text-gray-300",
    },
    STANDARD: {
      label: "Standard",
      icon: Star,
      variant: "secondary" as const,
      className: "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    },
    PREMIUM: {
      label: "Premium",
      icon: Zap,
      variant: "default" as const,
      className: "border-purple-500 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    },
    BIZNES: {
      label: "Biznes",
      icon: Crown,
      variant: "default" as const,
      className: "border-yellow-500 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 dark:from-yellow-950 dark:to-orange-950 dark:text-orange-300",
    },
  };

  const config = packageConfig[packageType];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "gap-1 font-semibold",
        config.className,
        sizes.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizes.icon} />}
      {config.label}
    </Badge>
  );
}
