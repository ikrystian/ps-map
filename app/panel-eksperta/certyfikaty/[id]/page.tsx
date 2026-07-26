"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { BorderBeam } from "@/components/ui/border-beam"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { motion } from "framer-motion"
import { ArrowLeft, Award, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

interface Certificate {
  id: string
  nazwaCertyfikatu: string
  wydawca: string
  dataUzyskania: string
  dataWaznosci: string | null
  numerCertyfikatu: string | null
  skanCertyfikatu: string
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

export default function LawFirmEditCertificatePage() {
  const router = useRouter()
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("")
  const [uploadedFileName, setUploadedFileName] = useState<string>("")

  const [formData, setFormData] = useState({
    nazwaCertyfikatu: "",
    wydawca: "",
    dataUzyskania: "",
    dataWaznosci: "",
    numerCertyfikatu: "",
  })

  useEffect(() => {
    fetchCertificate()
  }, [params.id])

  const fetchCertificate = async () => {
    try {
      const response = await fetch(`/api/certificates/${params.id}`)

      if (!response.ok) {
        throw new Error("Nie udało się pobrać certyfikatu")
      }

      const certificate: Certificate = await response.json()

      setFormData({
        nazwaCertyfikatu: certificate.nazwaCertyfikatu,
        wydawca: certificate.wydawca,
        dataUzyskania: certificate.dataUzyskania.split("T")[0],
        dataWaznosci: certificate.dataWaznosci ? certificate.dataWaznosci.split("T")[0] : "",
        numerCertyfikatu: certificate.numerCertyfikatu || "",
      })

      setUploadedFileUrl(certificate.skanCertyfikatu)
      // Extract filename from URL
      const filename = certificate.skanCertyfikatu.split("/").pop() || "certyfikat"
      setUploadedFileName(decodeURIComponent(filename))
    } catch (error) {
      console.error("Error fetching certificate:", error)
      toast.error("Nie udało się pobrać danych certyfikatu")
      router.push("/panel-eksperta/certyfikaty")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const response = await fetch("/api/upload/certificate", {
        method: "POST",
        body: formDataUpload,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      setUploadedFileUrl(data.url)
      setUploadedFileName(data.originalName)
      toast.success("Nowy plik został przesłany pomyślnie")
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Błąd podczas uploadu pliku. Spróbuj ponownie.")
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nazwaCertyfikatu || !formData.wydawca || !formData.dataUzyskania || !uploadedFileUrl) {
      toast.error("Wypełnij wszystkie wymagane pola")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/certificates/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nazwaCertyfikatu: formData.nazwaCertyfikatu,
          wydawca: formData.wydawca,
          dataUzyskania: formData.dataUzyskania,
          dataWaznosci: formData.dataWaznosci || null,
          numerCertyfikatu: formData.numerCertyfikatu || null,
          skanCertyfikatu: uploadedFileUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update certificate")
      }

      toast.success("Certyfikat został zaktualizowany pomyślnie")
      router.push("/panel-eksperta/certyfikaty")
    } catch (error) {
      console.error("Error updating certificate:", error)
      toast.error("Nie udało się zaktualizować certyfikatu. Spróbuj ponownie.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie danych certyfikatu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8 min-h-screen overflow-hidden pb-12">
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
          title="Edytuj certyfikat"
          subtitle="Zaktualizuj dane certyfikatu lub uprawnienia potwierdzające Twoje kwalifikacje."
        >
          <Button asChild variant="outline" className="h-11 px-5 border-border/50 hover:bg-muted text-white rounded-xl gap-2">
            <Link href="/panel-eksperta/certyfikaty">
              <ArrowLeft className="h-4 w-4" />
              Powrót do listy
            </Link>
          </Button>
        </PageHeader>
      </motion.div>

      {/* Form Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="z-10 relative"
      >
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="rounded-2xl shadow-lg relative overflow-hidden">
            <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={8} borderWidth={1} />
            <CardHeader className="border-b border-border/20 py-5 px-6">
              <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Dane certyfikatu
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                Pola oznaczone gwiazdką (*) są wymagane do poprawnej weryfikacji.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Nazwa */}
                  <div>
                    <Label htmlFor="nazwaCertyfikatu" className="text-xs font-semibold text-zinc-300 mb-1.5">
                      Nazwa certyfikatu / Licencji *
                    </Label>
                    <Input
                      id="nazwaCertyfikatu"
                      placeholder="np. Certyfikat Radcy Prawnego, Certyfikat Mediatora"
                      value={formData.nazwaCertyfikatu}
                      onChange={(e) => handleInputChange("nazwaCertyfikatu", e.target.value)}
                      required
                      className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-white text-sm "
                    />
                  </div>

                  {/* Wydawca */}
                  <div>
                    <Label htmlFor="wydawca" className="text-xs font-semibold text-zinc-300 mb-1.5">
                      Organ wydający / Instytucja *
                    </Label>
                    <Input
                      id="wydawca"
                      placeholder="np. Okręgowa Rada Radców Prawnych"
                      value={formData.wydawca}
                      onChange={(e) => handleInputChange("wydawca", e.target.value)}
                      required
                      className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-white text-sm"
                    />
                  </div>

                  {/* Daty */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dataUzyskania" className="text-xs font-semibold text-zinc-300 mb-1.5">
                        Data uzyskania *
                      </Label>
                      <Input
                        id="dataUzyskania"
                        type="date"
                        value={formData.dataUzyskania}
                        onChange={(e) => handleInputChange("dataUzyskania", e.target.value)}
                        required
                        className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-white text-sm text-zinc-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dataWaznosci" className="text-xs font-semibold text-zinc-300 mb-1.5">
                        Data ważności (opcjonalnie)
                      </Label>
                      <Input
                        id="dataWaznosci"
                        type="date"
                        value={formData.dataWaznosci}
                        onChange={(e) => handleInputChange("dataWaznosci", e.target.value)}
                        className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-white text-sm  text-zinc-300"
                      />
                      <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">
                        Pozostaw to pole puste, jeśli certyfikat jest wydany bezterminowo.
                      </p>
                    </div>
                  </div>

                  {/* Numer */}
                  <div>
                    <Label htmlFor="numerCertyfikatu" className="text-xs font-semibold text-zinc-300 mb-1.5">
                      Numer certyfikatu / Licencji (opcjonalnie)
                    </Label>
                    <Input
                      id="numerCertyfikatu"
                      placeholder="np. CERT/2024/12345"
                      value={formData.numerCertyfikatu}
                      onChange={(e) => handleInputChange("numerCertyfikatu", e.target.value)}
                      className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-white text-sm"
                    />
                  </div>

                  {/* Skan (Plik) */}
                  <div>
                    <Label className="text-xs font-semibold text-zinc-300 mb-1.5">Skan certyfikatu (Dokument) *</Label>
                    <div className="mt-2 space-y-2">
                      {uploadedFileUrl && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border/30 bg-zinc-900/40 p-3 shadow-inner gap-2">
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs">{uploadedFileName}</span>
                            <a
                              href={uploadedFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-primary hover:text-primary-hover hover:underline transition-colors mt-0.5"
                            >
                              Podgląd aktualnego pliku
                            </a>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="file"
                              id="certificate-upload"
                              className="sr-only"
                              onChange={handleFileUpload}
                              disabled={isUploading || isSubmitting}
                              accept=".pdf,.jpg,.jpeg,.png,.webp"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("certificate-upload")?.click()}
                              disabled={isUploading || isSubmitting}
                              className="h-8 text-xs border-border/40 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg shrink-0 px-3 transition-colors"
                            >
                              {isUploading ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <Upload className="h-3 w-3 mr-1" />
                              )}
                              Zmień plik
                            </Button>
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-zinc-500 font-light">
                        Dozwolone formaty: PDF, JPEG, PNG, WEBP (maksymalnie 10MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border/10">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || isUploading || !uploadedFileUrl}
                    className="h-11 px-6 rounded-xl border-t border-white/10 shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        Zapisywanie...
                      </>
                    ) : (
                      "Zapisz zmiany"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={isSubmitting}
                    className="h-11 px-6 border-border/50 hover:bg-muted text-white rounded-xl transition-all"
                  >
                    <Link href="/panel-eksperta/certyfikaty">
                      Anuluj
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}