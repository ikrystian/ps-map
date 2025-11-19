"use client"

import React, { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, FileText, Award, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Certificate {
  id: string
  nazwaCertyfikatu: string
  wydawca: string
  dataUzyskania: string
  dataWaznosci: string | null
  numerCertyfikatu: string | null
  skanCertyfikatu: string
  aktywny: boolean
  createdAt: string
  updatedAt: string
}

export default function LawFirmCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const router = useRouter()

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/certificates")

      if (response.status === 401 || response.status === 403) {
        toast.error("Nie masz uprawnień do tej strony")
        router.push("/")
        return
      }

      if (response.ok) {
        const data = await response.json()
        setCertificates(data)
      } else {
        throw new Error("Błąd pobierania certyfikatów")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać certyfikatów")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const handleDeleteCertificate = async () => {
    if (!selectedCertificate) return

    try {
      const response = await fetch(`/api/certificates/${selectedCertificate.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Certyfikat został usunięty")
        fetchCertificates()
      } else {
        throw new Error("Nie udało się usunąć certyfikatu")
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas usuwania certyfikatu")
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedCertificate(null)
    }
  }

  const openDeleteDialog = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isExpired = (dateString: string | null) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ładowanie certyfikatów...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Certyfikaty i uprawnienia
          </h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj swoimi certyfikatami, uprawnieniami i osiągnięciami zawodowymi
          </p>
        </div>
        <Button asChild>
          <Link href="/panel-kancelarii/certyfikaty/dodaj">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj certyfikat
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista certyfikatów</CardTitle>
          <CardDescription>
            Certyfikaty i uprawnienia Twojej kancelarii ({certificates.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Nie masz jeszcze żadnych certyfikatów
              </p>
              <Button asChild variant="outline">
                <Link href="/panel-kancelarii/certyfikaty/dodaj">
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj pierwszy certyfikat
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa certyfikatu</TableHead>
                  <TableHead>Wydawca</TableHead>
                  <TableHead>Data uzyskania</TableHead>
                  <TableHead>Data ważności</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((certificate) => (
                  <TableRow key={certificate.id}>
                    <TableCell className="font-medium">
                      {certificate.nazwaCertyfikatu}
                    </TableCell>
                    <TableCell>{certificate.wydawca}</TableCell>
                    <TableCell>{formatDate(certificate.dataUzyskania)}</TableCell>
                    <TableCell>
                      {certificate.dataWaznosci ? (
                        <span className={isExpired(certificate.dataWaznosci) ? "text-destructive" : ""}>
                          {formatDate(certificate.dataWaznosci)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Bezterminowy</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {certificate.dataWaznosci && isExpired(certificate.dataWaznosci) ? (
                        <Badge variant="destructive">Wygasł</Badge>
                      ) : (
                        <Badge variant="secondary">Aktywny</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={certificate.skanCertyfikatu} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/panel-kancelarii/certyfikaty/${certificate.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(certificate)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten certyfikat?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Certyfikat zostanie trwale usunięty z systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCertificate}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
