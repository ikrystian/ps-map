"use client"

import { useTheme } from "next-themes"
import { GooeyToaster as GooeyToasterPrimitive, gooeyToast as toast } from "goey-toast"
import type { GooeyToasterProps } from "goey-toast"
import "goey-toast/styles.css"

const Toaster = ({ ...props }: GooeyToasterProps) => {
  const { theme = "system" } = useTheme()

  // Map system/etc theme to light or dark. By default if not light, use dark.
  const resolvedTheme = theme === "light" ? "light" : "dark"

  return (
    <GooeyToasterPrimitive
      theme={resolvedTheme}
      position="bottom-right"
      {...props}
    />
  )
}

export { Toaster, toast }
