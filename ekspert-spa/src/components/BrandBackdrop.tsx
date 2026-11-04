import { useEffect, type ReactNode } from "react"
import { setStatusBarStyle, syncStatusBar } from "@/lib/theme"

/** Tło w kolorach marki dla startu aplikacji i logowania; bez treści działa jak ekran powitalny. */
export function BrandBackdrop({ children }: { children?: ReactNode }) {
  useEffect(() => {
    setStatusBarStyle("dark")
    return syncStatusBar
  }, [])

  return (
    <div className="brand-backdrop relative flex h-full flex-col overflow-hidden">
      {children ?? (
        <div className="relative flex flex-1 items-center justify-center">
          <img src="/logo-dark.svg" alt="Prosta Sprawa" className="h-9 animate-pulse" />
        </div>
      )}
    </div>
  )
}
