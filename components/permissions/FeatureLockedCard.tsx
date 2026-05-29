/**
 * Komponent FeatureLockedCard
 *
 * Wyświetla kartę przedstawiającą zablokowaną funkcję premium
 * z informacją o wymaganym pakiecie i przyciskiem upgrade
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Lock, Zap, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface FeatureLockedCardProps {
  title: string;
  description: string;
  requiredPackage: string | string[];
  icon?: LucideIcon;
  features?: string[];
  className?: string;
  children?: ReactNode;
}

export function FeatureLockedCard({
  title,
  description,
  requiredPackage,
  icon: Icon,
  features,
  className,
  children,
}: FeatureLockedCardProps) {
  // Formatuj wymagany pakiet
  const packageText = Array.isArray(requiredPackage)
    ? requiredPackage.join(" lub ")
    : requiredPackage;

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Overlay z ikoną blokady */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-transparent dark:from-gray-900/50 pointer-events-none z-0" />
      <div className="absolute top-4 right-4 z-10">
        <div className="rounded-full bg-gray-200 dark:bg-gray-800 p-3">
          <Lock className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
      </div>

      <CardHeader className="relative z-10">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2 mt-1">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{title}</CardTitle>
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                Premium
              </Badge>
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {features && features.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Co zyskasz:</p>
            <ul className="space-y-1.5">
              {features.map((feature, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {children}
      </CardContent>

      <CardFooter className="relative z-10 flex-col items-start gap-3">
        <div className="text-sm text-muted-foreground">
          Dostępne w pakiecie: <span className="font-semibold text-foreground">{packageText}</span>
        </div>

        <Button asChild className="w-full">
          <Link href="/panel-eksperta/pakiet">
            Ulepsz do {packageText}
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
