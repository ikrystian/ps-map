"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { Building2, Eye, Loader2, Megaphone, MousePointerClick, Percent, LayoutGrid } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "@/components/ui/sonner"
import type { AdClient, Advertisement } from "./types"
import { ClientsTab } from "./ClientsTab"
import { AdsTab } from "./AdsTab"
import { RotationsTab } from "./RotationsTab"

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [clients, setClients] = useState<AdClient[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [adsRes, clientsRes] = await Promise.all([
        fetch("/api/admin/ads"),
        fetch("/api/admin/ad-clients"),
      ])
      if (!adsRes.ok || !clientsRes.ok) throw new Error("Fetch failed")
      const [adsData, clientsData] = await Promise.all([adsRes.json(), clientsRes.json()])
      setAds(adsData.ads)
      setClients(clientsData.clients)
    } catch {
      toast.error("Nie udało się pobrać danych")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0)
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0)
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const activeAdsCount = ads.filter(a => a.active).length
  const activeClientsCount = clients.filter(c => c.active).length

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Ładowanie...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter
        title="Reklamy"
        subtitle="Zarządzaj klientami reklamowymi, kreacjami banerów oraz rotacją reklam w slotach."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Klienci</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">{activeClientsCount}</span>
              <span className="text-muted-foreground ml-1 text-sm">/ {clients.length}</span>
              <p className="text-xs text-muted-foreground mt-1">aktywnych</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktywne reklamy</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">{activeAdsCount}</span>
              <span className="text-muted-foreground ml-1 text-sm">/ {ads.length}</span>
              <p className="text-xs text-muted-foreground mt-1">kreacji</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Megaphone className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suma wyświetleń</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">{totalImpressions.toLocaleString()}</span>
              <p className="text-xs text-muted-foreground mt-1">odsłon na portalu</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Eye className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Średni CTR</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">{avgCtr.toFixed(2)}%</span>
              <p className="text-xs text-muted-foreground mt-1">{totalClicks.toLocaleString()} kliknięć</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="clients">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="clients" className="gap-2">
            <Building2 className="h-4 w-4" /> Klienci
          </TabsTrigger>
          <TabsTrigger value="ads" className="gap-2">
            <Megaphone className="h-4 w-4" /> Reklamy
          </TabsTrigger>
          <TabsTrigger value="rotations" className="gap-2">
            <LayoutGrid className="h-4 w-4" /> Rotacje
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="mt-4">
          <ClientsTab clients={clients} onRefresh={fetchAll} />
        </TabsContent>

        <TabsContent value="ads" className="mt-4">
          <AdsTab ads={ads} clients={clients} onRefresh={fetchAll} />
        </TabsContent>

        <TabsContent value="rotations" className="mt-4">
          <RotationsTab ads={ads} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
