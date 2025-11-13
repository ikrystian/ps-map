"use client"

import React, { useState, useEffect } from "react"
import { Mail, Calendar, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

interface NewsletterSubscriber {
  id: string
  email: string
  imie: string | null
  zgoda: boolean
  aktywny: boolean
  dataZapisu: string
  dataRezygnacji: string | null
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  })

  const fetchSubscribers = async () => {
    try {
      const response = await fetch("/api/admin/newsletter")
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data)

        // Calculate stats
        const total = data.length
        const active = data.filter((s: NewsletterSubscriber) => s.aktywny).length
        const inactive = total - active
        setStats({ total, active, inactive })
      } else {
        throw new Error("Błąd pobierania subskrybentów")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać listy subskrybentów")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Newsletter</h1>
        <p className="text-muted-foreground">
          Zarządzaj subskrybentami newslettera
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wszyscy subskrybenci
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Łączna liczba zapisów
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktywni
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Aktywne subskrypcje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nieaktywni
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Wypisani z newslettera
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista subskrybentów</CardTitle>
          <CardDescription>
            Wszystkie adresy e-mail zapisane do newslettera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Imię</TableHead>
                <TableHead>Data zapisu</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data rezygnacji</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Mail className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Brak subskrybentów
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {subscriber.email}
                      </div>
                    </TableCell>
                    <TableCell>{subscriber.imie || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(subscriber.dataZapisu)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscriber.aktywny ? "default" : "secondary"}>
                        {subscriber.aktywny ? "Aktywny" : "Nieaktywny"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subscriber.dataRezygnacji ? (
                        <div className="text-sm text-muted-foreground">
                          {formatDate(subscriber.dataRezygnacji)}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
