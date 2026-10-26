"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, Loader2, Plus, Search, X } from "lucide-react"
import { useEffect, useState } from "react"

export interface RelatedPostOption {
  id: string
  tytul: string
}

interface BlogRelatedPostsPickerProps {
  value: RelatedPostOption[]
  onChange: (value: RelatedPostOption[]) => void
  /** ID edytowanego wpisu — nie da się powiązać wpisu z samym sobą */
  excludeId?: string
  max: number
}

/**
 * Wybór powiązanych artykułów wpisu spośród opublikowanych wpisów bloga.
 * Kolejność na liście = kolejność wyświetlania pod artykułem.
 */
export function BlogRelatedPostsPicker({ value, onChange, excludeId, max }: BlogRelatedPostsPickerProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<RelatedPostOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ limit: "8" })
        if (query.trim()) params.set("search", query.trim())
        const response = await fetch(`/api/blog/posts?${params}`)
        if (!response.ok) throw new Error(String(response.status))
        const data = await response.json()
        if (!cancelled) {
          setResults((data.posts || []).map((post: RelatedPostOption) => ({ id: post.id, tytul: post.tytul })))
        }
      } catch (error) {
        console.error("Error searching blog posts:", error)
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query])

  const selectedIds = new Set(value.map((post) => post.id))
  const available = results.filter((post) => post.id !== excludeId && !selectedIds.has(post.id))
  const isFull = value.length >= max

  const move = (index: number, direction: -1 | 1) => {
    const next = [...value]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {value.length > 0 ? (
        <ol className="space-y-2">
          {value.map((post, index) => (
            <li
              key={post.id}
              className="flex items-center gap-2 rounded-xl border bg-muted/20 py-2 pl-3 pr-1.5 text-sm"
            >
              <span className="w-5 shrink-0 text-xs font-bold tabular-nums text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium" title={post.tytul}>
                {post.tytul}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                aria-label="Przesuń wyżej"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                disabled={index === value.length - 1}
                onClick={() => move(index, 1)}
                aria-label="Przesuń niżej"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 hover:text-destructive"
                onClick={() => onChange(value.filter((item) => item.id !== post.id))}
                aria-label={`Usuń „${post.tytul}” z powiązanych`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-xl border border-dashed p-4 text-xs leading-relaxed text-muted-foreground">
          Nie wybrano powiązanych artykułów — pod wpisem pojawią się najnowsze artykuły z tej samej
          kategorii lub o tych samych słowach kluczowych.
        </p>
      )}

      <div className="space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              // Enter w polu wyszukiwania nie może wysłać formularza wpisu
              if (e.key === "Enter") e.preventDefault()
            }}
            placeholder="Szukaj artykułu po tytule..."
            className="h-11 pl-9"
            disabled={isFull}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {isFull ? (
          <p className="text-xs text-muted-foreground">Wybrano maksymalną liczbę artykułów ({max}).</p>
        ) : (
          <ul className="max-h-60 overflow-y-auto rounded-xl border divide-y">
            {available.length > 0 ? (
              available.map((post) => (
                <li key={post.id}>
                  <button
                    type="button"
                    onClick={() => onChange([...value, post])}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                      "hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                    )}
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate">{post.tytul}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                {loading ? "Wyszukiwanie..." : "Brak pasujących opublikowanych artykułów"}
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
