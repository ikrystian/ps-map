"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { EXPERTS_ROOT_NAME } from "@/lib/expertise-category"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

type ExpertiseNode = {
  id: string
  nazwa: string
  children?: ExpertiseNode[]
}

interface ExpertiseLinksPickerProps {
  value: string[]
  onChange: (ids: string[]) => void
}

/**
 * Wybór specjalizacji z gałęzi „Eksperci” (ExpertiseCategory), z którymi ma być
 * powiązana kategoria. Krok „Kategorie” rejestracji eksperta pokazuje ekspertowi
 * tylko kategorie powiązane z wybraną przez niego specjalizacją.
 *
 * Zaznaczenia spoza wyświetlanej listy (np. specjalizacja wyłączona) zostają
 * w `value` bez zmian — picker dodaje i usuwa wyłącznie widoczne pozycje.
 */
export function ExpertiseLinksPicker({ value, onChange }: ExpertiseLinksPickerProps) {
  const [groups, setGroups] = useState<ExpertiseNode[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch("/api/expertise-categories")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((tree: ExpertiseNode[]) => {
        if (cancelled) return
        const root = tree.find((node) => node.nazwa === EXPERTS_ROOT_NAME)
        const subcategories = root?.children ?? []

        // Tak jak w kroku 1 rejestracji: bez podkategorii specjalizacje wiszą bezpośrednio pod korzeniem
        const hasSubcategories = subcategories.some((sub) => (sub.children?.length ?? 0) > 0)
        setGroups(
          hasSubcategories
            ? subcategories.filter((sub) => (sub.children?.length ?? 0) > 0)
            : root && subcategories.length > 0
              ? [{ id: root.id, nazwa: root.nazwa, children: subcategories }]
              : []
        )
      })
      .catch((error) => {
        console.error("Error fetching expertise categories:", error)
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const selected = new Set(value)

  const setMany = (ids: string[], checked: boolean) => {
    const next = new Set(value)
    ids.forEach((id) => (checked ? next.add(id) : next.delete(id)))
    onChange(Array.from(next))
  }

  if (failed) {
    return (
      <p className="text-sm text-destructive">
        Nie udało się pobrać listy specjalizacji. Odśwież stronę.
      </p>
    )
  }

  if (groups === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Ładowanie specjalizacji...
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Brak specjalizacji w gałęzi „{EXPERTS_ROOT_NAME}”. Dodaj je w sekcji kategorii rejestracji ekspertów.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const specializations = group.children ?? []
        const ids = specializations.map((spec) => spec.id)
        const selectedCount = ids.filter((id) => selected.has(id)).length
        const allSelected = selectedCount === ids.length

        return (
          <div key={group.id} className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <Checkbox
                checked={allSelected ? true : selectedCount > 0 ? "indeterminate" : false}
                onCheckedChange={(checked) => setMany(ids, checked === true)}
              />
              {group.nazwa}
              <span className="text-xs font-normal text-muted-foreground">
                {selectedCount}/{ids.length}
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pl-6">
              {specializations.map((spec) => (
                <label
                  key={spec.id}
                  className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground has-[[data-state=checked]]:text-foreground"
                >
                  <Checkbox
                    checked={selected.has(spec.id)}
                    onCheckedChange={(checked) => setMany([spec.id], checked === true)}
                  />
                  {spec.nazwa}
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
