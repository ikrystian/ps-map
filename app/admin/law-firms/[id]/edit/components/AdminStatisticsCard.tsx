import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminStatisticsCardProps {
  statistics: {
    wyswietleniaProfilu: number
    zlozoneOferty: number
    wygraneOferty: number
    konwersja: number
    pozycjaRanking: number | null
  }
}

export function AdminStatisticsCard({ statistics }: AdminStatisticsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statystyki</CardTitle>
        <CardDescription>Dane tylko do odczytu - nie można edytować</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Wyświetlenia profilu</p>
            <p className="text-2xl font-bold">{statistics.wyswietleniaProfilu}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Złożone oferty</p>
            <p className="text-2xl font-bold">{statistics.zlozoneOferty}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Wygrane oferty</p>
            <p className="text-2xl font-bold">{statistics.wygraneOferty}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Konwersja</p>
            <p className="text-2xl font-bold">{statistics.konwersja.toFixed(2)}%</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Pozycja w rankingu</p>
            <p className="text-2xl font-bold">{statistics.pozycjaRanking || "—"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
