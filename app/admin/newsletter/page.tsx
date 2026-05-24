"use client"

import React, { useState, useEffect } from "react"
import { Mail, Calendar, CheckCircle, XCircle, Download, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/sonner"

interface NewsletterSubscriber {
  id: string
  email: string
  imie: string | null
  zgoda: boolean
  aktywny: boolean
  potwierdzony: boolean
  dataPotwierdzenia: string | null
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
    unconfirmed: 0,
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
        const active = data.filter((s: NewsletterSubscriber) => s.potwierdzony && s.aktywny).length
        const unconfirmed = data.filter((s: NewsletterSubscriber) => !s.potwierdzony).length
        const inactive = data.filter((s: NewsletterSubscriber) => s.potwierdzony && !s.aktywny).length
        setStats({ total, active, unconfirmed, inactive })
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

  const exportToCSV = () => {
    try {
      // Prepare CSV header
      const header = ["Email", "Imię", "Data zapisu", "Potwierdzony", "Data potwierdzenia", "Status", "Data rezygnacji"]

      // Prepare CSV rows
      const rows = subscribers.map((sub) => {
        let statusStr = "Niepotwierdzony"
        if (sub.potwierdzony) {
          statusStr = sub.aktywny ? "Aktywny" : "Wypisany"
        }
        return [
          sub.email,
          sub.imie || "",
          formatDate(sub.dataZapisu),
          sub.potwierdzony ? "Tak" : "Nie",
          sub.dataPotwierdzenia ? formatDate(sub.dataPotwierdzenia) : "",
          statusStr,
          sub.dataRezygnacji ? formatDate(sub.dataRezygnacji) : "",
        ]
      })

      // Create CSV content
      const csvContent = [
        header.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n")

      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = "\uFEFF"
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `newsletter-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Lista została wyeksportowana do pliku CSV")
    } catch (error) {
      toast.error("Nie udało się wyeksportować listy")
    }
  }

  const getStatusBadge = (sub: NewsletterSubscriber) => {
    if (!sub.potwierdzony) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800">
          Niepotwierdzony
        </Badge>
      )
    }
    if (sub.aktywny) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
          Aktywny
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        Wypisany
      </Badge>
    )
  }

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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wszyscy zapisani
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Łączna liczba rekordów
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktywni subskrybenci
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Potwierdzone subskrypcje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Oczekujący (Double Opt-In)
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.unconfirmed}</div>
            <p className="text-xs text-muted-foreground">
              Wysłane linki, niepotwierdzone
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wypisani
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Rezygnacja z subskrypcji
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista subskrybentów</CardTitle>
              <CardDescription>
                Wszystkie adresy e-mail zapisane do newslettera
              </CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" disabled={subscribers.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Eksportuj do CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Imię</TableHead>
                <TableHead>Data zapisu</TableHead>
                <TableHead>Potwierdzony</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data rezygnacji</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
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
                      <Badge variant="outline" className={
                        subscriber.potwierdzony 
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800" 
                          : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800"
                      }>
                        {subscriber.potwierdzony ? "Tak" : "Nie"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(subscriber)}
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
