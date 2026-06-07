/**
 * Komponent PackageBadge
 *
 * Wyświetla badge z nazwą pakietu subskrypcji
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown, Sparkles, Star, Zap } from "lucide-react";

export type PackageType = "PODSTAWOWY" | "STANDARD" | "PREMIUM" | "BIZNES" | null;

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

  const packageConfig = {
    PODSTAWOWY: {
      label: "Podstawowy",
      icon: Sparkles,
      variant: "outline" as const,
      className: "border-neutral-700 bg-neutral-900/60 text-neutral-400",
    },
    STANDARD: {
      label: "Standard",
      icon: Star,
      variant: "outline" as const,
      className: "border-[#0da192]/30 bg-[#0da192]/5 text-[#0da192]/80 font-medium",
    },
    PREMIUM: {
      label: "Premium",
      icon: Zap,
      variant: "outline" as const,
      className: "border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400 font-semibold shadow-[0_0_10px_rgba(168,85,247,0.15)]",
    },
    BIZNES: {
      label: "Biznes",
      icon: Crown,
      variant: "outline" as const,
      className: "border-[#e2b13c]/40 bg-[#e2b13c]/10 text-[#e2b13c] shadow-[0_0_15px_rgba(226,177,60,0.2)] font-bold tracking-wide uppercase",
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
