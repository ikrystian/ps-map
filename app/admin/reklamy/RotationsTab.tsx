"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutGrid } from "lucide-react"
import type { Advertisement } from "./types"
import { AD_LOCATIONS } from "./types"

interface RotationsTabProps {
  ads: Advertisement[]
}

export function RotationsTab({ ads }: RotationsTabProps) {
  const activeAds = ads.filter(ad => {
    if (!ad.active) return false
    const now = new Date()
    if (ad.startDate && new Date(ad.startDate) > now) return false
    if (ad.endDate && new Date(ad.endDate) < now) return false
    return true
  })

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Poniżej widoczne są aktywne reklamy pogrupowane wg slotów. Reklamy w danym slocie wyświetlają się na zmianę (weighted random) – im wyższa waga, tym częstsze wyświetlenia.
      </p>
      {AD_LOCATIONS.map(loc => {
        const slotAds = activeAds.filter(a => a.location === loc.value)
        const totalWeight = slotAds.reduce((s, a) => s + (a.weight ?? 1), 0)

        return (
          <Card key={loc.value}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    {loc.label.split(" (")[0]}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">{loc.label}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {slotAds.length > 0 ? (
                    <Badge className="text-xs">{slotAds.length} {slotAds.length === 1 ? "reklama" : "reklamy"} w rotacji</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Pusty slot</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {slotAds.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-lg text-sm text-muted-foreground">
                  Brak aktywnych reklam w tym slocie.
                </div>
              ) : (
                <div className="space-y-2">
                  {slotAds
                    .sort((a, b) => (b.weight ?? 1) - (a.weight ?? 1))
                    .map(ad => {
                      const weight = ad.weight ?? 1
                      const pct = totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0
                      return (
                        <div key={ad.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/30 transition-colors">
                          {/* Thumbnail */}
                          <div className="shrink-0">
                            {ad.htmlContent ? (
                              <div className="w-14 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[9px] font-mono text-blue-500">HTML</div>
                            ) : ad.imageUrl ? (
                              <div className="w-14 h-8 border rounded overflow-hidden bg-background">
                                <img src={ad.imageUrl} alt={ad.name} className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-14 h-8 rounded bg-muted flex items-center justify-center text-[9px] text-muted-foreground">Brak</div>
                            )}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{ad.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {ad.client && (
                                <Badge variant="outline" className="text-xs py-0">{ad.client.name}</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">Waga: {weight}</span>
                            </div>
                          </div>
                          {/* Share bar */}
                          <div className="w-32 shrink-0">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Udział</span>
                              <span className="font-semibold text-primary">{pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
