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
      className: "border-neutral-600 bg-neutral-900/60 text-neutral-300",
    },
    STANDARD: {
      label: "Standard",
      icon: Star,
      variant: "outline" as const,
      className: "border-blue-500/70 bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-cyan-500/10 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]",
    },
    PREMIUM: {
      label: "Premium",
      icon: Zap,
      variant: "outline" as const,
      className: "border-purple-500/80 bg-gradient-to-r from-purple-500/15 via-fuchsia-500/15 to-pink-500/15 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)] animate-pulse",
    },
    BIZNES: {
      label: "Biznes",
      icon: Crown,
      variant: "outline" as const,
      className: "border-amber-500/90 bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-orange-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse font-bold tracking-wide uppercase",
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
