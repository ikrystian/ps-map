"use client"

import React, { useState, useEffect } from "react"
import { Award, RefreshCw, Search, CheckCircle, XCircle, AlertCircle, TrendingUp, Users, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/sonner"

interface PartnerProgram {
  id: string
  lawFirmId: string
  lawFirmName: string
  lawFirmEmail: string
  websiteUrl: string | null
  currentPoints: number
  subscriptionPackage: string
  bannerCode: string
  bannerPlaced: boolean
  lastVerificationDate: Date | null
  lastVerificationStatus: boolean
  verificationFailCount: number
  active: boolean
  monthlyPoints: number
  joinedAt: Date
  recentHistory: Array<{
    id: string
    pointsAwarded: number
    month: number
    year: number
    verificationStatus: boolean
    createdAt: Date
  }>
}

interface Stats {
  total: number
  active: number
  verified: number
  totalPointsAllocated: number
}

const formatDate = (date: Date | string | null) => {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

const formatDateTime = (date: Date | string | null) => {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const MONTH_NAMES = [
  "Sty", "Lut", "Mar", "Kwi", "Maj", "Cze",
  "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"
]

export default function AdminKlubPartnerskiPage() {
  const [partnerPrograms, setPartnerPrograms] = useState<PartnerProgram[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<PartnerProgram[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    verified: 0,
    totalPointsAllocated: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "verified">("all")
  const [allocating, setAllocating] = useState(false)

  useEffect(() => {
    fetchPartnerPrograms()
  }, [])

  useEffect(() => {
    filterPrograms()
  }, [searchQuery, statusFilter, partnerPrograms])

  const fetchPartnerPrograms = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/partner-program")
      if (response.ok) {
        const data = await response.json()
        setPartnerPrograms(data.partnerPrograms)
        setStats(data.stats)
      } else {
        toast.error("Błąd podczas pobierania programów partnerskich")
      }
    } catch (error) {
      console.error("Error fetching partner programs:", error)
      toast.error("Błąd podczas pobierania danych")
    } finally {
      setLoading(false)
    }
  }

  const filterPrograms = () => {
    let filtered = partnerPrograms

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.lawFirmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lawFirmEmail.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter === "active") {
      filtered = filtered.filter(p => p.active)
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(p => !p.active)
    } else if (statusFilter === "verified") {
      filtered = filtered.filter(p => p.bannerPlaced)
    }

    setFilteredPrograms(filtered)
  }

  const handleAllocatePoints = async () => {
    try {
      setAllocating(true)
      const now = new Date()
      const response = await fetch("/api/partner-program/allocate-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: now.getFullYear(),
          month: now.getMonth() + 1
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(
          `Przyznano punkty! Sukces: ${data.results.successful}, Błędy: ${data.results.failed}, Łącznie punktów: ${data.results.totalPointsAllocated}`
        )
        await fetchPartnerPrograms()
      } else {
        toast.error(data.error || "Błąd podczas przyznawania punktów")
      }
    } catch (error) {
      console.error("Error allocating points:", error)
      toast.error("Błąd podczas przyznawania punktów")
    } finally {
      setAllocating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Klub Partnerski</h1>
          <p className="text-gray-600 mt-2">
            Zarządzanie programem partnerskim
          </p>
        </div>
        <Button
          onClick={handleAllocatePoints}
          disabled={allocating}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {allocating ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Gift className="mr-2 h-4 w-4" />
          )}
          Przyznaj punkty (bieżący miesiąc)
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Łączna liczba partnerów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Aktywni partnerzy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Zweryfikowane bannery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold">{stats.verified}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Przyznane punkty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold">{stats.totalPointsAllocated}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Szukaj po nazwie kancelarii lub email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
              >
                Wszystkie
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
              >
                Aktywne
              </Button>
              <Button
                variant={statusFilter === "verified" ? "default" : "outline"}
                onClick={() => setStatusFilter("verified")}
              >
                Zweryfikowane
              </Button>
              <Button
                variant={statusFilter === "inactive" ? "default" : "outline"}
                onClick={() => setStatusFilter("inactive")}
              >
                Nieaktywne
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kancelaria</TableHead>
                <TableHead>Strona WWW</TableHead>
                <TableHead>Banner</TableHead>
                <TableHead>Ostatnia weryfikacja</TableHead>
                <TableHead>Punkty/mies.</TableHead>
                <TableHead>Historia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data dołączenia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    Brak programów partnerskich
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrograms.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{program.lawFirmName}</div>
                        <div className="text-sm text-gray-500">{program.lawFirmEmail}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {program.subscriptionPackage}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {program.websiteUrl ? (
                        <a
                          href={program.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:underline text-sm"
                        >
                          {program.websiteUrl.length > 30
                            ? program.websiteUrl.substring(0, 30) + "..."
                            : program.websiteUrl}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">Brak</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {program.bannerPlaced ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Umieszczony
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          <XCircle className="mr-1 h-3 w-3" />
                          Brak
                        </Badge>
                      )}
                      {program.verificationFailCount > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          Błędy: {program.verificationFailCount}/3
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateTime(program.lastVerificationDate)}
                        {program.lastVerificationStatus ? (
                          <CheckCircle className="inline-block ml-1 h-3 w-3 text-green-600" />
                        ) : program.lastVerificationDate ? (
                          <XCircle className="inline-block ml-1 h-3 w-3 text-red-600" />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {program.monthlyPoints} pkt
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {program.recentHistory.length > 0 ? (
                        <div className="text-xs space-y-1">
                          {program.recentHistory.slice(0, 2).map((h) => (
                            <div key={h.id} className="text-gray-600">
                              {MONTH_NAMES[h.month - 1]} {h.year}: +{h.pointsAwarded}
                              {h.verificationStatus ? (
                                <CheckCircle className="inline-block ml-1 h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="inline-block ml-1 h-3 w-3 text-red-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Brak historii</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {program.active ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Aktywny
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          <XCircle className="mr-1 h-3 w-3" />
                          Nieaktywny
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(program.joinedAt)}
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
