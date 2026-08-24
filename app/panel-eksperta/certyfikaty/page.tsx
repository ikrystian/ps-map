"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { BorderBeam } from "@/components/ui/border-beam"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Award, Download, Edit, Plus, Trash2, Loader2, Calendar, Clock, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
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
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie uprawnień i certyfikatów...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Certyfikaty i uprawnienia"
          subtitle="Zarządzaj swoimi certyfikatami, licencjami zawodowymi oraz osiągnięciami w jednym miejscu."
        >
          <Button asChild variant="primary" className="h-11 px-6 rounded-xl shadow-md border-t border-border group gap-2">
            <Link href="/panel-eksperta/certyfikaty/dodaj">
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              Dodaj certyfikat
            </Link>
          </Button>
        </PageHeader>

      </motion.div>

      {/* Main card list */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10"
      >
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="rounded-2xl shadow-lg relative overflow-hidden">
            <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={7} borderWidth={1} />
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-foreground">Lista certyfikatów</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Certyfikaty zatwierdzające Twoje specjalizacje i kwalifikacje widoczne na profilu ({certificates.length})
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {certificates.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                  <div className="h-14 w-14 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center">
                    <Award className="h-6 w-6 text-muted-foreground animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Brak certyfikatów</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-light">
                      Nie dodałeś jeszcze żadnych dokumentów potwierdzających Twoje kwalifikacje. Dodaj pierwszy, aby wyróżnić się w katalogu.
                    </p>
                  </div>
                  <Button asChild variant="outline" className="h-10 px-5 border-border/50 hover:bg-muted text-foreground rounded-xl gap-2 mt-2">
                    <Link href="/panel-eksperta/certyfikaty/dodaj">
                      <Plus className="h-4 w-4" />
                      Dodaj pierwszy certyfikat
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-border/20 hover:bg-transparent">
                          <TableHead className="text-muted-foreground font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Nazwa certyfikatu</TableHead>
                          <TableHead className="text-muted-foreground font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Organ wydający</TableHead>
                          <TableHead className="text-muted-foreground font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Data uzyskania</TableHead>
                          <TableHead className="text-muted-foreground font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Data ważności</TableHead>
                          <TableHead className="text-muted-foreground font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider w-36">Status</TableHead>
                          <TableHead className="text-muted-foreground font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider text-right w-44">Akcje</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {certificates.map((certificate) => {
                          const expired = isExpired(certificate.dataWaznosci)
                          return (
                            <TableRow key={certificate.id} className="border-b border-border/10 hover:bg-white/[0.02] text-sm text-foreground/80 transition-colors">
                              <TableCell className="py-4 px-6 font-semibold text-foreground">
                                <div className="flex items-center gap-2.5">
                                  <Award className="h-4.5 w-4.5 text-secondary" />
                                  <span>{certificate.nazwaCertyfikatu}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6 font-light">{certificate.wydawca}</TableCell>
                              <TableCell className="py-4 px-6 text-xs font-light text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  {formatDate(certificate.dataUzyskania)}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6 text-xs font-light text-muted-foreground">
                                {certificate.dataWaznosci ? (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className={cn("h-3.5 w-3.5", expired ? "text-error" : "text-muted-foreground")} />
                                    <span className={cn(expired ? "text-error font-medium" : "")}>
                                      {formatDate(certificate.dataWaznosci)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground font-light italic">Bezterminowy</span>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                {certificate.dataWaznosci && expired ? (
                                  <Badge className="bg-error/10 text-error border border-error/30 px-2 py-0.5 rounded-md font-medium">Wygasł</Badge>
                                ) : (
                                  <Badge className="bg-success/10 text-success border border-success/30 px-2 py-0.5 rounded-md font-medium">Aktywny</Badge>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    asChild
                                    className="h-9 w-9 rounded-lg border border-border/50 text-muted-foreground hover:text-info hover:bg-info/5 hover:border-info/30 transition-all shrink-0"
                                    title="Pobierz plik certyfikatu"
                                  >
                                    <a href={certificate.skanCertyfikatu} target="_blank" rel="noopener noreferrer">
                                      <Download className="h-4 w-4" />
                                    </a>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    asChild
                                    className="h-9 w-9 rounded-lg border border-border/50 text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all shrink-0"
                                    title="Edytuj certyfikat"
                                  >
                                    <Link href={`/panel-eksperta/certyfikaty/${certificate.id}`}>
                                      <Edit className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openDeleteDialog(certificate)}
                                    className="h-9 w-9 rounded-lg border border-border/50 text-muted-foreground hover:text-error hover:bg-error/5 hover:border-error/30 transition-all shrink-0"
                                    title="Usuń certyfikat"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card List View */}
                  <div className="block md:hidden p-4 space-y-3">
                    {certificates.map((certificate) => {
                       const expired = isExpired(certificate.dataWaznosci)
                      return (
                        <div key={certificate.id} className="p-4 rounded-xl border border-border/10 bg-card/40 text-xs space-y-3 relative hover:border-primary/30 transition-all">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h4 className="font-semibold text-foreground text-sm truncate flex items-center gap-1.5">
                                <Award className="h-4 w-4 text-secondary shrink-0" />
                                {certificate.nazwaCertyfikatu}
                              </h4>
                              <p className="text-sm text-muted-foreground font-light mt-0.5">{certificate.wydawca}</p>
                            </div>
                            {certificate.dataWaznosci && expired ? (
                              <Badge className="bg-error/10 text-error border border-error/30 shrink-0">Wygasł</Badge>
                            ) : (
                              <Badge className="bg-success/10 text-success border border-success/30 shrink-0">Aktywny</Badge>
                            )}
                          </div>

                          <div className="flex justify-between items-center border-t border-border/5 pt-2 text-sm">
                            <div>
                              <span className="text-muted-foreground block font-light">Uzyskanie</span>
                              <span className="text-foreground/80 font-medium">{formatDate(certificate.dataUzyskania)}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-muted-foreground block font-light">Ważność</span>
                              <span className={cn("font-medium", expired ? "text-error" : "text-foreground/80")}>
                                {certificate.dataWaznosci ? formatDate(certificate.dataWaznosci) : "Bezterminowy"}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end border-t border-border/5 pt-2.5">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-8 rounded-lg border border-border/50 text-muted-foreground hover:text-info hover:bg-info/5 hover:border-info/30 gap-1.5 text-sm"
                            >
                              <a href={certificate.skanCertyfikatu} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3.5 w-3.5" />
                                Podgląd skanu
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-8 rounded-lg border border-border/50 text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/30 gap-1.5 text-sm"
                            >
                              <Link href={`/panel-eksperta/certyfikaty/${certificate.id}`}>
                                <Edit className="h-3.5 w-3.5" />
                                Edytuj
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openDeleteDialog(certificate)}
                              className="h-8 w-8 rounded-lg border border-border/50 text-muted-foreground hover:text-error hover:bg-error/5 hover:border-error/30 transition-all shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Dialog usuwania */}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteCertificate}
        title="Usuń certyfikat"
        description={`Czy na pewno chcesz usunąć certyfikat "${selectedCertificate?.nazwaCertyfikatu}"? Ta akcja jest nieodwracalna, a plik zostanie trwale usunięty z systemu.`}
        confirmText="Usuń certyfikat"
        cancelText="Anuluj"
      />
    </div>
  )
}