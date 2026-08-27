"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useId, useState } from "react"

interface ThemeToggleProps {
  className?: string
  /** "icon" – okrągły przycisk do headerów, "switch" – przełącznik z torem (np. ustawienia), "segmented" – pigułka z ikonami systemowy/jasny/ciemny i przesuwanym tłem */
  variant?: "icon" | "switch" | "segmented"
}

/**
 * Przełącznik motywu jasny/ciemny.
 *
 * Przed hydracją `next-themes` nie zna jeszcze motywu, więc renderujemy
 * placeholder o identycznych wymiarach — inaczej header „skacze".
 */
export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const activeLayoutId = useId()

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"
  const toggle = () => setTheme(isDark ? "light" : "dark")
  const label = isDark ? "Włącz jasny motyw" : "Włącz ciemny motyw"

  if (variant === "segmented") {
    if (!mounted) {
      return <div className={cn("h-9 w-[7.5rem] rounded-full bg-muted", className)} />
    }

    const segments = [
      { key: "system" as const, icon: Monitor, label: "Systemowy motyw" },
      { key: "light" as const, icon: Sun, label: "Jasny motyw" },
      { key: "dark" as const, icon: Moon, label: "Ciemny motyw" },
    ]

    return (
      <div
        role="radiogroup"
        aria-label="Motyw"
        className={cn(
          "relative isolate inline-flex h-9 items-center gap-0.5 rounded-full border border-border bg-muted p-1",
          className
        )}
      >
        {segments.map(({ key, icon: Icon, label: segmentLabel }) => {
          const isActive = theme === key

          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={segmentLabel}
              title={segmentLabel}
              onClick={() => setTheme(key)}
              className="relative h-7 w-9 rounded-full cursor-pointer"
            >
              {isActive && (
                <motion.span
                  layoutId={activeLayoutId}
                  className="absolute inset-0 rounded-full bg-background shadow-sm"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <Icon
                className={cn(
                  "relative z-10 m-auto h-4 w-4 transition-colors duration-200",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              />
            </button>
          )
        })}
      </div>
    )
  }

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
