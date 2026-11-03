"use client"

import { SubstitutionAccessProvider } from "@/components/zastepstwa/access-context"
import { LoadingState, Panel } from "@/components/zastepstwa/ui"
import { Button } from "@/components/ui/button"
import { apiFetch, errorMessage, SUBSTITUTIONS_CHANGED_EVENT } from "@/lib/substitutions/client"
import type { AccessResponse } from "@/lib/substitutions/types"
import { Repeat, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

/**
 * Strażnik modułu zastępstw: moduł widzą tylko zweryfikowani adwokaci,
 * radcowie i aplikanci. Pozostałym (np. wejście z linku) pokazujemy powód.
 */
export default function SubstitutionsLayout({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<AccessResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setAccess(await apiFetch<AccessResponse>("/api/substitutions/access"))
      setError(null)
    } catch (e) {
      setError(errorMessage(e))
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      await refresh()
    }
    load()
    window.addEventListener(SUBSTITUTIONS_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(SUBSTITUTIONS_CHANGED_EVENT, refresh)
  }, [refresh])

  if (error) {
    return (
      <Panel className="mx-auto mt-10 max-w-xl text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button className="mt-4" variant="outline" onClick={refresh}>
          Spróbuj ponownie
        </Button>
      </Panel>
    )
  }

  if (!access) return <LoadingState text="Wczytywanie zastępstw..." />

  if (!access.dostep) {
    return (
      <Panel className="mx-auto mt-10 max-w-xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10">
          <ShieldAlert className="h-6 w-6 text-secondary" />
        </div>
        <h1 className="font-playfair text-xl font-semibold">Zastępstwa procesowe</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{access.powod}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/panel-eksperta/profil">Uzupełnij profil</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/panel-eksperta">
              <Repeat className="mr-1.5 h-4 w-4" />
              Wróć do panelu
            </Link>
          </Button>
        </div>
      </Panel>
    )
  }

  return <SubstitutionAccessProvider value={{ access, refresh }}>{children}</SubstitutionAccessProvider>
}
