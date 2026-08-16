"use client"

import { cn } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ThemeToggleProps {
  className?: string
  /** "icon" – okrągły przycisk do headerów, "switch" – przełącznik z torem (np. ustawienia) */
  variant?: "icon" | "switch"
}

/**
 * Przełącznik motywu jasny/ciemny.
 *
 * Przed hydracją `next-themes` nie zna jeszcze motywu, więc renderujemy
 * placeholder o identycznych wymiarach — inaczej header „skacze".
 */
export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"
  const toggle = () => setTheme(isDark ? "light" : "dark")
  const label = isDark ? "Włącz jasny motyw" : "Włącz ciemny motyw"

  if (variant === "switch") {
    if (!mounted) {
      return <div className={cn("h-9 w-[4.5rem] rounded-full bg-muted", className)} />
    }

    return (
      <button
        type="button"
        onClick={toggle}
        role="switch"
        aria-checked={isDark}
        aria-label={label}
        title={label}
        className={cn(
          "relative inline-flex h-9 w-[4.5rem] items-center rounded-full border border-border bg-muted p-1",
          "transition-colors duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
      >
        {/* Ikony w torze — podświetla się ta nieaktywna strona */}
        <Sun
          className={cn(
            "absolute left-2.5 h-4 w-4 transition-opacity duration-300",
            isDark ? "opacity-40 text-muted-foreground" : "opacity-0"
          )}
        />
        <Moon
          className={cn(
            "absolute right-2.5 h-4 w-4 transition-opacity duration-300",
            isDark ? "opacity-0" : "opacity-40 text-muted-foreground"
          )}
        />
        <span
          className={cn(
            "relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm",
            "transition-transform duration-300 ease-out",
            isDark ? "translate-x-[2.25rem]" : "translate-x-0"
          )}
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </span>
      </button>
    )
  }

  if (!mounted) {
    return <div className={cn("h-9 w-9 rounded-full", className)} aria-hidden />
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "group relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        "text-muted-foreground transition-colors duration-200",
        "hover:bg-accent hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <Sun
        className={cn(
          "absolute h-[1.15rem] w-[1.15rem] transition-all duration-300",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        )}
      />
      <Moon
        className={cn(
          "absolute h-[1.15rem] w-[1.15rem] transition-all duration-300",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
      />
    </button>
  )
}

export default ThemeToggle
