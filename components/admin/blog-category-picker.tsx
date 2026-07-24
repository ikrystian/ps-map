"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Check, ChevronRight, FolderTree, Search, X, Layers, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { BlogCategory } from "@/types"
import { buildCategoryTree, getCategoryPath, type BlogCategoryNode } from "@/lib/blog-category-tree"

interface BlogCategoryPickerProps {
  categories: BlogCategory[]
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function BlogCategoryPicker({
  categories,
  value,
  onChange,
  disabled = false,
  className,
}: BlogCategoryPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Active navigation selection within popover (Level 1, Level 2)
  const [selectedL1Id, setSelectedL1Id] = useState<string | null>(null)
  const [selectedL2Id, setSelectedL2Id] = useState<string | null>(null)

  // Build 3-level category tree
  const tree = useMemo(() => {
    return buildCategoryTree(categories)
  }, [categories])

  // Get path for current selected value (if any)
  const currentPath = useMemo(() => {
    if (!value) return []
    return getCategoryPath(categories, value)
  }, [categories, value])

  // Initialize navigation state when popover opens or value changes
  React.useEffect(() => {
    if (open) {
      if (currentPath.length > 0) {
        setSelectedL1Id(currentPath[0]?.id || null)
        setSelectedL2Id(currentPath[1]?.id || null)
      } else if (tree.length > 0) {
        setSelectedL1Id(tree[0].id)
        setSelectedL2Id(tree[0].children[0]?.id || null)
      }
      setSearchQuery("")
    }
  }, [open, currentPath, tree])

  // Flat list of categories with full breadcrumb path for search
  const flatSearchList = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase().trim()

    const results: { category: BlogCategory; path: BlogCategory[] }[] = []
    categories.forEach((cat) => {
      const path = getCategoryPath(categories, cat.id)
      const fullPathName = path.map((p) => p.nazwa).join(" > ").toLowerCase()
      if (fullPathName.includes(query) || cat.nazwa.toLowerCase().includes(query)) {
        results.push({ category: cat, path })
      }
    })
    return results
  }, [categories, searchQuery])

  // Selected Level 1 node
  const activeL1Node = useMemo(() => {
    return tree.find((node) => node.id === selectedL1Id) || tree[0]
  }, [tree, selectedL1Id])

  // Selected Level 2 node
  const activeL2Node = useMemo(() => {
    if (!activeL1Node) return null
    return activeL1Node.children.find((node) => node.id === selectedL2Id) || activeL1Node.children[0]
  }, [activeL1Node, selectedL2Id])

  const handleSelectCategory = (catId: string) => {
    onChange(catId)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-auto min-h-[44px] px-3.5 py-2 text-left font-normal bg-background/50 border-border/50 rounded-xl hover:bg-muted/40 transition-all",
              !value && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2 flex-wrap text-sm overflow-hidden">
              <FolderTree className="h-4 w-4 text-primary shrink-0" />
              {currentPath.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentPath.map((item, index) => {
                    const isLast = index === currentPath.length - 1
                    return (
                      <React.Fragment key={item.id}>
                        {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                        <Badge
                          variant={isLast ? "default" : "secondary"}
                          className={cn(
                            "text-xs px-2.5 py-0.5 font-medium transition-all",
                            index === 0 && "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20",
                            index === 1 && "bg-muted text-foreground border border-border/40",
                            isLast && index > 1 && "bg-primary text-primary-foreground font-semibold shadow-sm"
                          )}
                        >
                          {item.nazwa}
                        </Badge>
                      </React.Fragment>
                    )
                  })}
                </div>
              ) : (
                <span>Wybierz kategorię wpisu...</span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {value && (
                <span
                  onClick={handleClear}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-rose-400 transition-colors"
                  title="Wyczyść kategorię"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-90")} />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[620px] max-w-[92vw] p-0 bg-zinc-950/95 backdrop-blur-xl border border-border/40 shadow-2xl rounded-2xl overflow-hidden text-white"
          align="start"
        >
          {/* Header & Search */}
          <div className="p-3.5 border-b border-border/30 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Wybór kategorii (Struktura 3-poziomowa)
              </span>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="text-[11px] text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  Wyczyść wybór
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Szukaj po nazwie kategorii lub słowie kluczowym..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 bg-background/60 border-border/40 text-xs rounded-xl focus-visible:ring-primary/40 text-zinc-100 placeholder:text-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Mode Results */}
          {searchQuery.trim() ? (
            <div className="max-h-[320px] overflow-y-auto p-2 divide-y divide-border/20">
              {flatSearchList.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  Brak kategorii pasujących do wpisanej frazy &quot;{searchQuery}&quot;
                </div>
              ) : (
                flatSearchList.map(({ category: cat, path }) => {
                  const isSelected = cat.id === value
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between gap-3 transition-colors group hover:bg-primary/10",
                        isSelected ? "bg-primary/15 border border-primary/30 font-medium" : "hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        {path.map((p, idx) => (
                          <React.Fragment key={p.id}>
                            {idx > 0 && <span className="text-zinc-600">/</span>}
                            <span
                              className={cn(
                                idx === path.length - 1 ? "font-semibold text-white" : "text-zinc-400"
                              )}
                            >
                              {p.nazwa}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>
          ) : (
            /* Cascading 3-Column Navigation Mode */
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/20 max-h-[360px] min-h-[280px]">
              {/* Level 1: Main Area */}
              <div className="p-2 space-y-1 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1">
                  <Layers className="h-3 w-3 text-primary" /> Poziom 1: Obszar
                </div>
                {tree.map((node) => {
                  const isActive = node.id === selectedL1Id
                  const isSelected = node.id === value
                  return (
                    <div
                      key={node.id}
                      onClick={() => {
                        setSelectedL1Id(node.id)
                        setSelectedL2Id(node.children[0]?.id || null)
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all border border-transparent",
                        isActive
                          ? "bg-primary/15 border-primary/30 text-white font-medium shadow-sm"
                          : "text-zinc-300 hover:bg-muted/30"
                      )}
                    >
                      <span className="truncate">{node.nazwa}</span>
                      <div className="flex items-center gap-1">
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Level 2: Subcategory */}
              <div className="p-2 space-y-1 overflow-y-auto bg-zinc-950/40">
                <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  Poziom 2: Kategoria
                </div>
                {activeL1Node?.children && activeL1Node.children.length > 0 ? (
                  activeL1Node.children.map((node) => {
                    const isActive = node.id === selectedL2Id
                    const isSelected = node.id === value
                    const hasChildren = node.children.length > 0

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedL2Id(node.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all border border-transparent group",
                          isActive
                            ? "bg-zinc-800 border-zinc-700 text-white font-medium"
                            : "text-zinc-300 hover:bg-muted/30"
                        )}
                      >
                        <span className="truncate">{node.nazwa}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectCategory(node.id)
                            }}
                            title="Wybierz tę kategorię"
                            className={cn(
                              "p-1 rounded-md hover:bg-primary/30 transition-colors",
                              isSelected ? "text-primary" : "text-zinc-400 hover:text-white"
                            )}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          {hasChildren && <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    Brak kategorii
                  </div>
                )}
              </div>

              {/* Level 3: Child Subcategory */}
              <div className="p-2 space-y-1 overflow-y-auto bg-zinc-900/40">
                <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  Poziom 3: Podkategoria
                </div>
                {activeL2Node?.children && activeL2Node.children.length > 0 ? (
                  activeL2Node.children.map((node) => {
                    const isSelected = node.id === value
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => handleSelectCategory(node.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all border border-transparent",
                          isSelected
                            ? "bg-primary/20 border-primary/40 text-primary font-semibold"
                            : "text-zinc-300 hover:bg-primary/10 hover:text-white"
                        )}
                      >
                        <span className="truncate">{node.nazwa}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                      </button>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    {activeL2Node ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectCategory(activeL2Node.id)}
                        className="text-xs text-primary hover:text-primary hover:bg-primary/10 w-full"
                      >
                        Wybierz: {activeL2Node.nazwa}
                      </Button>
                    ) : (
                      "Wybierz kategorię z poziomu 2"
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="p-2.5 px-3 border-t border-border/30 bg-muted/20 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Kliknij nazwę podkategorii lub ikonę ptaszka, aby wybrać.</span>
            {value && (
              <span className="text-primary font-medium">Kategoria wybrana</span>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
