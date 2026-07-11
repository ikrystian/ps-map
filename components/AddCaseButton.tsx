"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"

interface AddCaseButtonProps {
  href: string
  className?: string
  labelClassName?: string
}

export function AddCaseButton({ href, className, labelClassName }: AddCaseButtonProps) {
  return (
    <Link href={href} className={className}>
      <motion.div
        whileHover={{ scale: 1.04, backgroundColor: "rgba(217, 119, 6, 0.18)" }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className="relative overflow-hidden flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/25 hover:border-amber-400/40 cursor-pointer select-none transition-colors"
      >
        <span className={cn(labelClassName)}>Dodaj sprawę</span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none"
          animate={{ x: ["-130%", "130%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
        />
      </motion.div>
    </Link>
  )
}
