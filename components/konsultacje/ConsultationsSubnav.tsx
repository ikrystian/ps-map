"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const CLIENT_LINKS = [
  { name: "Umówione konsultacje", href: "/panel-klienta/konsultacje" },
  { name: "Moje zapytania", href: "/panel-klienta/konsultacje/zapytania" },
]

const EXPERT_LINKS = [
  { name: "Umówione konsultacje", href: "/panel-eksperta/konsultacje" },
  { name: "Zapytania o konsultacje", href: "/panel-eksperta/konsultacje/zapytania" },
]

/**
 * Przełącznik między listą umówionych konsultacji a marketplace'em zapytań.
 * Ten sam komponent obsługuje panel klienta i panel eksperta.
 */
export function ConsultationsSubnav({ variant }: { variant: "client" | "expert" }) {
  const pathname = usePathname()
  const links = variant === "client" ? CLIENT_LINKS : EXPERT_LINKS

  return (
    <div className="relative z-10 flex w-full max-w-lg items-center gap-1 rounded-md border border-border/10 bg-background/40 p-1">
      {links.map((link) => {
        // Ostatni link jest bardziej szczegółowy, więc dopasowanie po prefiksie
        const isActive =
          link.href === links[0].href
            ? pathname === link.href
            : pathname.startsWith(link.href)

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex-1 rounded-lg py-2 text-center text-sm font-medium transition-all",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.name}
          </Link>
        )
      })}
    </div>
  )
}
