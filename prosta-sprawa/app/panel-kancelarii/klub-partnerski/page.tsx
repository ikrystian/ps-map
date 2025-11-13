"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Award,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Globe,
  Code,
  TrendingUp,
  Calendar,
  Gift,
  ExternalLink
} from "lucide-react"
import { generateBannerHtml, generateBannerScript } from "@/lib/partner-program"

// Format date helper
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const formatDateTime = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface PointsHistory {
  id: string
  pointsAwarded: number
  month: number
  year: number
  verificationStatus: boolean
  createdAt: Date
}

interface PartnerStatus {
  enrolled: boolean
  active?: boolean
  bannerCode?: string
  bannerPlaced?: boolean
  lastVerificationDate?: Date | null
  lastVerificationStatus?: boolean
  verificationFailCount?: number
  daysSinceVerification?: number | null
  monthlyPoints?: number
  totalPointsEarned?: number
  currentPoints?: number
  joinedAt?: Date
  pointsHistory?: PointsHistory[]
  lawFirmName?: string
  websiteUrl?: string
  hasWebsite?: boolean
}

const MONTH_NAMES = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
]

export default function KlubPartnerskiPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [joining, setJoining] = useState(false)
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedScript, setCopiedScript] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/logowanie")
    } else if (status === "authenticated" && session?.user?.role !== "LAW_FIRM") {
      router.push("/")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchPartnerStatus()
    }
  }, [status])

  const fetchPartnerStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/partner-program/status")
      if (response.ok) {
        const data = await response.json()
        setPartnerStatus(data)
      }
    } catch (error) {
      console.error("Error fetching partner status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinProgram = async () => {
    try {
      setJoining(true)
      const response = await fetch("/api/partner-program/join", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationMessage({
          type: 'success',
          message: 'Pomyślnie dołączono do programu partnerskiego!'
        })
        await fetchPartnerStatus()
      } else {
        setVerificationMessage({
          type: 'error',
          message: data.error || 'Błąd podczas dołączania do programu'
        })
      }
    } catch (error) {
      setVerificationMessage({
        type: 'error',
        message: 'Wystąpił błąd podczas dołączania do programu'
      })
    } finally {
      setJoining(false)
    }
  }

  const handleVerifyBanner = async () => {
    try {
      setVerifying(true)
      setVerificationMessage(null)

      const response = await fetch("/api/partner-program/verify", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationMessage({
          type: data.found ? 'success' : 'error',
          message: data.message
        })
        await fetchPartnerStatus()
      } else {
        setVerificationMessage({
          type: 'error',
          message: data.error || 'Błąd podczas weryfikacji'
        })
      }
    } catch (error) {
      setVerificationMessage({
        type: 'error',
        message: 'Wystąpił błąd podczas weryfikacji bannera'
      })
    } finally {
      setVerifying(false)
    }
  }

  const copyToClipboard = (text: string, type: 'code' | 'script') => {
    navigator.clipboard.writeText(text)
    if (type === 'code') {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } else {
      setCopiedScript(true)
      setTimeout(() => setCopiedScript(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Nie ma programu partnerskiego - formularz dołączenia
  if (!partnerStatus?.enrolled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Klub Partnerski</h1>
          <p className="text-gray-600 mt-2">
            Dołącz do programu partnerskiego i zarabiaj punkty za promowanie ProstaSprawa.pl
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Dołącz do Klubu Partnerskiego
            </CardTitle>
            <CardDescription>
              Umieść nasz banner na swojej stronie i otrzymuj 100 punktów miesięcznie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!partnerStatus?.hasWebsite && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Brak strony WWW</AlertTitle>
                <AlertDescription>
                  Aby dołączyć do programu partnerskiego, musisz mieć podaną stronę WWW w swoim profilu.
                  <Button
                    variant="link"
                    className="p-0 h-auto ml-2"
                    onClick={() => router.push("/panel-kancelarii/profil")}
                  >
                    Uzupełnij profil
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Korzyści programu:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Gift className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>100 punktów miesięcznie</strong> za umieszczenie i utrzymanie bannera na stronie</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Automatyczne przyznawanie</strong> punktów co miesiąc</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Prosta weryfikacja</strong> - automatyczne sprawdzanie obecności bannera</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Dodatkowe korzyści</strong> - wsparcie marketingowe i promocja Twojej kancelarii</span>
                </li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Jak to działa?</h3>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Dołącz do programu partnerskiego (przycisk poniżej)</li>
                <li>Otrzymasz unikalny kod bannera do umieszczenia na swojej stronie</li>
                <li>Umieść kod na swojej stronie WWW</li>
                <li>Zweryfikuj umieszczenie bannera</li>
                <li>Otrzymuj 100 punktów co miesiąc automatycznie!</li>
              </ol>
            </div>

            {verificationMessage && (
              <Alert variant={verificationMessage.type === 'success' ? 'default' : 'destructive'}>
                {verificationMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{verificationMessage.message}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleJoinProgram}
              disabled={joining || !partnerStatus?.hasWebsite}
              className="w-full"
              size="lg"
            >
              {joining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Dołącz do Klubu Partnerskiego
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Uczestnik programu partnerskiego - panel główny
  const bannerHtml = partnerStatus.bannerCode ? generateBannerHtml(partnerStatus.bannerCode) : ""
  const bannerScript = partnerStatus.bannerCode ? generateBannerScript(partnerStatus.bannerCode) : ""

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Klub Partnerski</h1>
        <p className="text-gray-600 mt-2">
          Zarządzaj swoim udziałem w programie partnerskim
        </p>
      </div>

      {/* Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Status programu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {partnerStatus.active ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-600">Aktywny</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-600">Nieaktywny</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Miesięczna nagroda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{partnerStatus.monthlyPoints} pkt</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Łącznie zdobyte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{partnerStatus.totalPointsEarned} pkt</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Status weryfikacji bannera
          </CardTitle>
          <CardDescription>
            {partnerStatus.websiteUrl && (
              <a
                href={partnerStatus.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {partnerStatus.websiteUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {partnerStatus.bannerPlaced ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-600">Banner zweryfikowany</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-muted-foreground">Banner nie został jeszcze zweryfikowany</span>
                  </>
                )}
              </div>
              {partnerStatus.lastVerificationDate && (
                <p className="text-sm text-gray-600">
                  Ostatnia weryfikacja: {formatDateTime(partnerStatus.lastVerificationDate)}
                  {partnerStatus.daysSinceVerification !== null && (
                    <span className="ml-1">({partnerStatus.daysSinceVerification} dni temu)</span>
                  )}
                </p>
              )}
              {(partnerStatus.verificationFailCount ?? 0) > 0 && (
                <p className="text-sm text-red-600">
                  Nieudane weryfikacje: {partnerStatus.verificationFailCount}/3
                </p>
              )}
            </div>
            <Button
              onClick={handleVerifyBanner}
              disabled={verifying}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              {verifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Weryfikuj teraz
            </Button>
          </div>

          {verificationMessage && (
            <Alert variant={verificationMessage.type === 'success' ? 'default' : 'destructive'}>
              {verificationMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{verificationMessage.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Banner Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Kod bannera do umieszczenia
          </CardTitle>
          <CardDescription>
            Skopiuj i wklej jeden z poniższych kodów na swojej stronie WWW
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Kod HTML (zalecany)</Label>
              <Button
                onClick={() => copyToClipboard(bannerHtml, 'code')}
                variant="ghost"
                size="sm"
              >
                {copiedCode ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Skopiowano!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Kopiuj
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{bannerHtml}</code>
            </pre>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Kod JavaScript (alternatywny)</Label>
              <Button
                onClick={() => copyToClipboard(bannerScript, 'script')}
                variant="ghost"
                size="sm"
              >
                {copiedScript ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Skopiowano!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Kopiuj
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{bannerScript}</code>
            </pre>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ważne!</AlertTitle>
            <AlertDescription>
              Banner musi być widoczny w kodzie HTML Twojej strony. Umieść go w stopce lub innym widocznym miejscu.
              Po umieszczeniu kodu, kliknij przycisk "Weryfikuj teraz" aby sprawdzić poprawność instalacji.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Points History */}
      {partnerStatus.pointsHistory && partnerStatus.pointsHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Historia przyznanych punktów
            </CardTitle>
            <CardDescription>
              Ostatnie {partnerStatus.pointsHistory.length} miesięcy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miesiąc</TableHead>
                  <TableHead>Punkty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Data przyznania</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnerStatus.pointsHistory.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell className="font-medium">
                      {MONTH_NAMES[history.month - 1]} {history.year}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        +{history.pointsAwarded} pkt
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {history.verificationStatus ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Zweryfikowane
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          <XCircle className="mr-1 h-3 w-3" />
                          Błąd weryfikacji
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-600">
                      {formatDate(history.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-foreground">Jak zdobywać punkty?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground">
          <p>✓ Upewnij się, że banner jest umieszczony na Twojej stronie</p>
          <p>✓ Co miesiąc automatycznie weryfikujemy obecność bannera</p>
          <p>✓ Jeśli banner jest aktywny, otrzymujesz {partnerStatus.monthlyPoints} punktów</p>
          <p>✓ Możesz w każdej chwili samodzielnie zweryfikować banner</p>
          <p className="text-destructive font-semibold mt-4">
            ⚠️ Uwaga: Po 3 nieudanych weryfikacjach program zostanie automatycznie dezaktywowany
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
