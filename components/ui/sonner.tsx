"use client"

import type { GooeyToasterProps } from "goey-toast"
import { GooeyToaster as GooeyToasterPrimitive, gooeyToast as toast } from "goey-toast"
import "goey-toast/styles.css"
import { useTheme } from "next-themes"

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

export { toast, Toaster }
