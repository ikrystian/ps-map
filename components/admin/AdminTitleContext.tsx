"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"

interface TitleContextType {
  title: string
  subtitle: string
  setTitleAndSubtitle: (title: string, subtitle: string) => void
}

const TitleContext = createContext<TitleContextType | undefined>(undefined)

interface AdminTitleProviderProps {
  children: React.ReactNode
  defaultTitle?: string
  defaultSubtitle?: string
}

export function AdminTitleProvider({
  children,
  defaultTitle = "",
  defaultSubtitle = "1"
}: AdminTitleProviderProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [subtitle, setSubtitle] = useState(defaultSubtitle)
  const pathname = usePathname()

  // Reset to default values when pathname or default props change
  useEffect(() => {
    setTitle(defaultTitle)
    setSubtitle(defaultSubtitle)
  }, [pathname, defaultTitle, defaultSubtitle])

  const setTitleAndSubtitle = (newTitle: string, newSubtitle: string) => {
    setTitle(newTitle)
    setSubtitle(newSubtitle)
  }

  return (
    <TitleContext.Provider value={{ title, subtitle, setTitleAndSubtitle }}>
      {children}
    </TitleContext.Provider>
  )
}

export function useAdminTitle(title: string, subtitle: string) {
  const context = useContext(TitleContext)

  useEffect(() => {
    if (context) {
      context.setTitleAndSubtitle(title, subtitle)
    }
  }, [title, subtitle, context])
}

export function useAdminTitleContext() {
  const context = useContext(TitleContext)
  if (!context) {
    throw new Error("useAdminTitleContext must be used within an AdminTitleProvider")
  }
  return context
}

interface AdminHeaderSetterProps {
  title: string
  subtitle: string
}

/**
 * A declarative component that can be placed at the top of any admin page
 * to set the header title and subtitle.
 */
export function AdminHeaderSetter({ title, subtitle }: AdminHeaderSetterProps) {
  useAdminTitle(title, subtitle)
  return null
}
