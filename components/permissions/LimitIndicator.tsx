/**
 * Komponent LimitIndicator
 *
 * Wyświetla wskaźnik wykorzystania limitu (np. spraw, kategorii)
 * z paskiem postępu i informacją o możliwości upgrade
 */

"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, Check, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";

interface LimitIndicatorProps {
  current: number;
  limit: number | null;
  label: string;
  type?: "activeCases" | "categories" | "voivodeships" | "cities";
  className?: string;
  showUpgradeButton?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LimitIndicator({
  current,
  limit,
  label,
  type,
  className,
  showUpgradeButton = true,
  size = "md",
}: LimitIndicatorProps) {
  // Oblicz procent wykorzystania
  const percentage = limit === null ? 0 : Math.min((current / limit) * 100, 100);
  const isUnlimited = limit === null;
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && current >= limit;

  // Kolory w zależności od wykorzystania
  const getProgressColor = () => {
    if (isUnlimited) return "bg-blue-500";
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Rozmiary
  const sizeClasses = {
    sm: {
      container: "p-3",
      title: "text-sm",
      value: "text-lg",
      progress: "h-1.5",
    },
    md: {
      container: "p-4",
      title: "text-sm",
      value: "text-xl",
      progress: "h-2",
    },
    lg: {
      container: "p-5",
      title: "text-base",
      value: "text-2xl",
      progress: "h-2.5",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground", sizes.container, className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn("font-medium", sizes.title)}>{label}</span>

          {isUnlimited && (
            <Badge variant="secondary" className="gap-1">
              <Infinity className="h-3 w-3" />
              Nieograniczone
            </Badge>
          )}

          {isAtLimit && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Limit
            </Badge>
          )}

          {isNearLimit && !isAtLimit && (
            <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700 dark:text-yellow-500">
              <AlertCircle className="h-3 w-3" />
              Blisko limitu
            </Badge>
          )}

          {!isUnlimited && !isNearLimit && !isAtLimit && (
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700 dark:text-green-500">
              <Check className="h-3 w-3" />
              OK
            </Badge>
          )}
        </div>

        <div className={cn("font-bold tabular-nums", sizes.value)}>
          {current}
          {!isUnlimited && (
            <span className="text-muted-foreground font-normal">/{limit}</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!isUnlimited && (
        <div className="mb-3">
          <Progress value={percentage} className={cn(sizes.progress, "bg-gray-200 dark:bg-gray-800")}>
            <div
              className={cn("h-full rounded-full transition-all", getProgressColor())}
              style={{ width: `${percentage}%` }}
            />
          </Progress>
        </div>
      )}

      {/* Status message i upgrade button */}
      {!isUnlimited && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {isAtLimit && "Osiągnięto limit. Ulepsz pakiet, aby zwiększyć."}
            {isNearLimit && !isAtLimit && `Pozostało ${limit - current} z ${limit}`}
            {!isNearLimit && !isAtLimit && `Wykorzystano ${current} z ${limit}`}
          </p>

          {showUpgradeButton && (isAtLimit || isNearLimit) && (
            <Button asChild size="sm" variant={isAtLimit ? "destructive" : "outline"}>
              <Link href="/panel-eksperta/pakiet">
                Zwiększ limit
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Message for unlimited */}
      {isUnlimited && (
        <p className="text-xs text-muted-foreground">
          Możesz dodać nieograniczoną liczbę {label.toLowerCase()}
        </p>
      )}
    </div>
  );
}
