"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { Laptop, Loader2, MapPin, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"

interface LoginRecord {
  id: string
  success: boolean
  ipAddress: string | null
  userAgent: string | null
  location: string | null
  createdAt: string
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Nieznane urządzenie"

  let browser = "Nieznana przeglądarka"
  let os = "Nieznany system"

  // Proste wykrywanie systemu operacyjnego
  if (ua.includes("Windows")) os = "Windows"
  else if (ua.includes("Macintosh") || ua.includes("Mac OS X")) os = "macOS"
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS"
  else if (ua.includes("Android")) os = "Android"
  else if (ua.includes("Linux")) os = "Linux"

  // Proste wykrywanie przeglądarki
  if (ua.includes("Firefox/")) browser = "Firefox"
  else if (ua.includes("Chrome/")) browser = "Chrome"
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari"
  else if (ua.includes("Edge/") || ua.includes("Edg/")) browser = "Edge"
  else if (ua.includes("Opera/") || ua.includes("OPR/")) browser = "Opera"

  return `${browser} (${os})`
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function LoginHistory({ noCard = false }: { noCard?: boolean }) {
  const [history, setHistory] = useState<LoginRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHistory = async (showToast = false) => {
    if (showToast) setRefreshing(true)
    else setLoading(true)

    try {
      const response = await fetch("/api/auth/login-history")
      if (response.ok) {
        const data = await response.json()
        setHistory(data.loginHistory || [])
        if (showToast) {
          toast.success("Odświeżono historię logowań")
        }
      } else {
        toast.error("Nie udało się pobrać historii logowań")
      }
    } catch (error) {
      console.error("Error fetching login history:", error)
      toast.error("Błąd połączenia podczas pobierania historii")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const renderContent = () => (
    <div className="space-y-4">
      {noCard && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchHistory(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Odśwież
          </Button>
        </div>
      )}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Ładowanie historii logowań...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Brak zarejestrowanych logowań w historii.
        </div>
      ) : (
        <>
          {/* Mobilny widok listy kart (ukryty na desktopie) */}
          <div className="block md:hidden space-y-4">
            {history.map((record) => (
              <div key={record.id} className="p-4 rounded-lg border border-border bg-muted/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatDateTime(record.createdAt)}
                  </span>
                  {record.success ? (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1 w-fit text-[11px]"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      Udane
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1 w-fit text-[11px]"
                    >
                      <ShieldAlert className="h-3 w-3" />
                      Nieudane
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Adres IP</span>
                    <span className="font-mono text-foreground font-medium">{record.ipAddress || "Brak danych"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Lokalizacja</span>
                    <span className="flex items-center gap-1 text-foreground font-medium">
                      <MapPin className="h-3 w-3 text-muted-foreground/75 shrink-0" />
                      <span className="truncate">{record.location || "Nieznana"}</span>
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-2.5 text-xs">
                  <span className="text-muted-foreground block mb-0.5">Urządzenie</span>
                  <span className="flex items-center gap-1.5 text-foreground font-medium truncate" title={record.userAgent || ""}>
                    <Laptop className="h-3.5 w-3.5 text-muted-foreground/75 shrink-0" />
                    <span className="truncate">{parseUserAgent(record.userAgent)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktopowy widok tabeli (ukryty na mobilkach) */}
          <div className="hidden md:block relative overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th scope="col" className="px-4 py-3">Data i godzina</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Adres IP</th>
                  <th scope="col" className="px-4 py-3">Lokalizacja</th>
                  <th scope="col" className="px-4 py-3">Urządzenie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-muted/30 transition-colors duration-150"
                  >
                    <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                      {formatDateTime(record.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {record.success ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1 w-fit"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          Udane
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1 w-fit"
                        >
                          <ShieldAlert className="h-3 w-3" />
                          Nieudane
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-mono">
                      {record.ipAddress || "Brak danych"}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/75" />
                        {record.location || "Nieznana"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground max-w-[200px] truncate" title={record.userAgent || ""}>
                      <span className="flex items-center gap-1.5">
                        <Laptop className="h-3.5 w-3.5 text-muted-foreground/75" />
                        {parseUserAgent(record.userAgent)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )

  if (noCard) {
    return renderContent()
  }

  return (
    <Card className="w-full border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Historia Logowań
          </CardTitle>
          <CardDescription>
            Przejrzyj ostatnie 20 prób logowania do swojego konta
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fetchHistory(true)}
          disabled={loading || refreshing}
          className="h-9 w-9 transition-transform duration-300 active:scale-95"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  )
}
