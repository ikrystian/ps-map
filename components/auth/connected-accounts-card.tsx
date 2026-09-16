"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { Info, Link2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { FaFacebook, FaGoogle, FaLinkedinIn } from "react-icons/fa"
import type { IconType } from "react-icons"

type ProviderId = "google" | "facebook" | "linkedin"

interface ProviderConfig {
  id: ProviderId
  label: string
  // Parametr statusu, z którym trasa łącząca wraca na stronę ustawień
  statusParam: string
  Icon: IconType
  iconClassName: string
  iconWrapperClassName: string
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "google",
    label: "Google",
    statusParam: "google_link",
    Icon: FaGoogle,
    iconClassName: "text-foreground",
    iconWrapperClassName: "bg-foreground/10",
  },
  // {
  //   id: "facebook",
  //   label: "Facebook",
  //   statusParam: "fb_link",
  //   Icon: FaFacebook,
  //   iconClassName: "text-[#1877F2]",
  //   iconWrapperClassName: "bg-[#1877F2]/15",
  // },
  {
    id: "linkedin",
    label: "LinkedIn",
    statusParam: "linkedin_link",
    Icon: FaLinkedinIn,
    iconClassName: "text-[#0A66C2]",
    iconWrapperClassName: "bg-[#0A66C2]/15",
  },
]

interface ConnectedAccountsCardProps {
  /**
   * Ścieżka, na którą dostawca ma wrócić po zakończeniu procesu łączenia.
   * Musi znajdować się na liście dozwolonych ścieżek w lib/account-link.ts.
   */
  returnTo: string
  /** Styl karty dopasowany do panelu, w którym komponent jest osadzony. */
  variant?: "client" | "expert"
}

export function ConnectedAccountsCard({ returnTo, variant = "client" }: ConnectedAccountsCardProps) {
  const router = useRouter()
  const [connectedProviders, setConnectedProviders] = useState<string[]>([])
  const [hasPassword, setHasPassword] = useState(true)
  const [disconnecting, setDisconnecting] = useState<ProviderId | null>(null)

  const isExpert = variant === "expert"

  useEffect(() => {
    let active = true

    fetch("/api/account/linked-providers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return
        setConnectedProviders(data.providers || [])
        setHasPassword(data.hasPassword !== false)
      })
      .catch((error) => {
        console.error("Error fetching connected accounts:", error)
      })

    return () => {
      active = false
    }
  }, [])

  // Obsługa powrotu z procesu łączenia konta (Google / Facebook / LinkedIn)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    let handled = false

    for (const provider of PROVIDERS) {
      const status = params.get(provider.statusParam)
      if (!status) continue
      handled = true

      if (status === "success") {
        // Lista dostawców pobierana przy montowaniu komponentu zawiera już nowe powiązanie
        toast.success(
          `Konto zostało połączone z ${provider.label}. Możesz teraz logować się przez ${provider.label}.`
        )
      } else if (status === "cancelled") {
        toast.info(`Łączenie z ${provider.label} zostało anulowane`)
      } else if (status === "in_use") {
        toast.error(`To konto ${provider.label} jest już połączone z innym kontem w serwisie`)
      } else {
        toast.error(`Nie udało się połączyć konta z ${provider.label}. Spróbuj ponownie.`)
      }
    }

    if (handled) {
      router.replace(returnTo, { scroll: false })
    }
  }, [router, returnTo])

  const handleConnect = useCallback(
    (provider: ProviderId) => {
      // Pełne przekierowanie do przepływu OAuth (poza routerem Next.js)
      window.location.href = `/api/account/link/${provider}?returnTo=${encodeURIComponent(returnTo)}`
    },
    [returnTo]
  )

  const handleDisconnect = useCallback(async (provider: ProviderConfig) => {
    setDisconnecting(provider.id)
    try {
      const response = await fetch(`/api/account/linked-providers?provider=${provider.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setConnectedProviders((prev) => prev.filter((p) => p !== provider.id))
        toast.success(`Konto ${provider.label} zostało odłączone`)
      } else {
        const error = await response.json()
        toast.error(error.error || `Nie udało się odłączyć konta ${provider.label}`)
      }
    } catch (error) {
      console.error(`Error disconnecting ${provider.id}:`, error)
      toast.error("Wystąpił błąd podczas odłączania konta")
    } finally {
      setDisconnecting(null)
    }
  }, [])

  // Ostatnia metoda logowania nie może zostać odłączona
  const isLastLoginMethod = !hasPassword && connectedProviders.length <= 1

  return (
    <Card variant="glass" className={cn(isExpert && "rounded-2xl shadow-lg")}>
      <CardHeader className={cn(isExpert && "border-b border-border/20 py-4 px-6")}>
        <CardTitle
          className={cn(
            "font-playfair text-foreground",
            isExpert ? "text-lg flex items-center gap-2" : "text-base"
          )}
        >
          {isExpert && <Link2 className="h-5 w-5 text-primary" />}
          Połączone konta
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Połącz konto z Google, Facebookiem lub LinkedIn, aby logować się jednym kliknięciem.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3", isExpert && "p-6")}>
        {PROVIDERS.map((provider) => {
          const isConnected = connectedProviders.includes(provider.id)
          const isDisconnecting = disconnecting === provider.id

          return (
            <div
              key={provider.id}
              className="flex items-center justify-between rounded-lg border border-border/30 bg-background-sec/20 p-3 gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    provider.iconWrapperClassName
                  )}
                >
                  <provider.Icon className={cn("h-5 w-5", provider.iconClassName)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{provider.label}</p>
                  <p
                    className={cn(
                      "text-sm truncate",
                      isConnected ? "text-success" : "text-muted-foreground"
                    )}
                  >
                    {isConnected ? "Połączono" : "Nie połączono"}
                  </p>
                </div>
              </div>
              {isConnected ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-error hover:text-error hover:bg-error/10"
                  onClick={() => handleDisconnect(provider)}
                  disabled={isDisconnecting || isLastLoginMethod}
                >
                  {isDisconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Odłącz"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => handleConnect(provider.id)}
                >
                  Połącz
                </Button>
              )}
            </div>
          )
        })}
        {isLastLoginMethod && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nie możesz odłączyć tego konta, ponieważ jest to Twoja jedyna metoda logowania.
              Najpierw ustaw hasło do konta.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
