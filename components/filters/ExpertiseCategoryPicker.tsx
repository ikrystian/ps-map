"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, ChevronRight, X } from "lucide-react"
import { useState } from "react"

export interface ExpertiseCategoryNode {
  id: string
  nazwa: string
  children?: ExpertiseCategoryNode[]
}

interface ExpertiseCategoryPickerProps {
  categories: ExpertiseCategoryNode[]
  /** Id wybranej kategorii lub "all" gdy brak wyboru */
  value: string
  /** Zwraca id wybranej kategorii lub "all" po wyczyszczeniu */
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  contentClassName?: string
  align?: "start" | "center" | "end"
}

const findCategoryById = (cats: ExpertiseCategoryNode[], id: string): ExpertiseCategoryNode | null => {
  for (const cat of cats) {
    if (cat.id === id) return cat
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryById(cat.children, id)
      if (found) return found
    }
  }
  return null
}

/**
 * Wybór specjalizacji z zagnieżdżonym drill-down menu — to samo rozwiązanie
 * co pole "Kogo szukasz?" w wyszukiwarce w PublicHeader.
 */
export function ExpertiseCategoryPicker({
  categories,
  value,
  onChange,
  placeholder = "Wszystkie specjalizacje",
  className,
  contentClassName,
  align = "start",
}: ExpertiseCategoryPickerProps) {
  const [open, setOpen] = useState(false)
  const [menuPath, setMenuPath] = useState<string[]>([])

  // Reset drill-down menu path when popover closes
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setMenuPath([])
  }

  const selectedCategory = value && value !== "all" ? findCategoryById(categories, value) : null
  const selectedName = selectedCategory?.nazwa || ""

  // Kategoria, w której aktualnie jesteśmy (dowolny poziom zagnieżdżenia)
  const getParentItem = (): ExpertiseCategoryNode | null => {
    let list = categories
    let node: ExpertiseCategoryNode | null = null
    for (const id of menuPath) {
      const found = list.find(c => c.id === id)
      if (!found) return null
      node = found
      list = found.children || []
    }
    return node
  }

  const getVisibleCategories = (): ExpertiseCategoryNode[] => {
    if (menuPath.length === 0) return categories
    return getParentItem()?.children || []
  }

  const getMenuTitle = () => {
    if (menuPath.length === 0) return "Wybierz kategorię"
    const parent = getParentItem()
    return parent ? parent.nazwa : "Specjalizacja"
  }

  const handleSelect = (id: string) => {
    onChange(id)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            className
          )}
        >
          <span className={cn("truncate", !selectedName && "text-muted-foreground")}>
            {selectedName || placeholder}
          </span>
          <div className="flex items-center gap-1">
            {selectedName && (
              <X
                className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange("all")
                }}
              />
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[280px] p-0 bg-card border-neutral-800 text-white", contentClassName)}
        align={align}
      >
        <div className="flex flex-col">
          {/* Header with back button */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-800 bg-[#161614]">
            {menuPath.length > 0 ? (
              <button
                type="button"
                onClick={() => setMenuPath(menuPath.slice(0, -1))}
                className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer border-0 bg-transparent p-0"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                Powrót
              </button>
            ) : (
              <span className="text-xs text-neutral-400 font-semibold">Wybierz kategorię</span>
            )}
            <span className="text-xs font-medium text-neutral-300 truncate max-w-[150px]">
              {getMenuTitle()}
            </span>
          </div>

          {/* Selectable categories list */}
          <div className="max-h-64 overflow-y-auto p-1 space-y-0.5">
            {/* Option to select parent category if we are inside one */}
            {menuPath.length > 0 && getParentItem() && (
              <button
                type="button"
                onClick={() => {
                  const parent = getParentItem()
                  if (parent) handleSelect(parent.id)
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-md text-teal-400 hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer font-semibold border-0 bg-transparent"
              >
                <Check className="h-3.5 w-3.5" />
                Wybierz całe &quot;{getParentItem()?.nazwa}&quot;
              </button>
            )}

            {getVisibleCategories().map((cat) => {
              const hasChildren = !!cat.children && cat.children.length > 0
              const isSelected = value === cat.id

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    if (hasChildren) {
                      setMenuPath([...menuPath, cat.id])
                    } else {
                      handleSelect(cat.id)
                    }
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between cursor-pointer border-0 bg-transparent text-white hover:bg-primary",
                    isSelected && "bg-neutral-800 text-teal-400 font-semibold"
                  )}
                >
                  <span className="truncate">{cat.nazwa}</span>
                  {hasChildren ? (
                    <ChevronRight className="h-4 w-4 text-neutral-500" />
                  ) : (
                    isSelected && <Check className="h-4 w-4 text-teal-400" />
                  )}
                </button>
              )
            })}

            {getVisibleCategories().length === 0 && (
              <div className="text-neutral-400 py-3 text-center text-xs">Brak kategorii.</div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
