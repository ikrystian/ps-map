"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ChevronDown, FilePlus2, MessagesSquare, Plus } from "lucide-react"
import Link from "next/link"

interface AddMenuButtonProps {
  className?: string
}

const ADD_OPTIONS = [
  {
    href: "/dodaj-sprawe",
    label: "Dodaj sprawę",
    description: "Opisz problem i otrzymaj oferty od ekspertów",
    icon: FilePlus2,
  },
  {
    href: "/panel-klienta/konsultacje/zapytaj",
    label: "Konsultacja online",
    description: "Zapytaj eksperta o poradę na odległość",
    icon: MessagesSquare,
  },
]

// Jeden przycisk "Dodaj" (w stylu AddCaseButton) z wyborem: sprawa albo konsultacja online.
export function AddMenuButton({ className }: AddMenuButtonProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <motion.button
          type="button"
          whileHover={{ scale: 1.04, backgroundColor: "rgba(217, 119, 6, 0.18)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "group relative overflow-hidden flex items-center gap-1.5 pl-2.5 pr-2 h-9 rounded-lg text-sm font-medium text-secondary bg-secondary/10 border border-secondary/25 hover:border-secondary/40 data-[state=open]:border-secondary/50 cursor-pointer select-none transition-colors outline-none focus-visible:ring-2 focus-visible:ring-secondary/50",
            className
          )}
        >
          <Plus className="h-4 w-4" />
          <span className="whitespace-nowrap">Dodaj</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          <motion.span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none"
            animate={{ x: ["-130%", "130%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
          />
        </motion.button>
      </DropdownMenuTrigger>
      {/* Portal wychodzi poza nagłówek — klasa `dark` trzyma ten sam (ciemny) wygląd co pasek. */}
      <DropdownMenuContent align="end" sideOffset={8} className="dark w-80 p-1.5 bg-card border-border text-foreground shadow-xl shadow-black/40">
        {ADD_OPTIONS.map(({ href, label, description, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild className="cursor-pointer rounded-md p-2.5 focus:bg-muted">
            <Link href={href} className="group/add-item flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-secondary/25 bg-secondary/10 text-secondary transition-colors group-hover/add-item:bg-secondary/20">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className="text-xs leading-snug text-muted-foreground">{description}</span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
