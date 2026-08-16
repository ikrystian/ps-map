"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { BorderBeam } from "@/components/ui/border-beam"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { motion } from "framer-motion"
import { Upload, Loader2, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

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

export default function LawFirmAddCertificatePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("")
  const [uploadedFileName, setUploadedFileName] = useState<string>("")

  const [formData, setFormData] = useState({
    nazwaCertyfikatu: "",
    wydawca: "",
    dataUzyskania: "",
    dataWaznosci: "",
    numerCertyfikatu: "",
  })

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
      toast.success("Plik został przesłany pomyślnie")
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
      toast.error("Wypełnij wszystkie wymagane pola i prześlij plik certyfikatu")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/certificates", {
        method: "POST",
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
        throw new Error(error.error || "Failed to create certificate")
      }

      toast.success("Certyfikat został dodany pomyślnie")
      router.push("/panel-eksperta/certyfikaty")
    } catch (error) {
      console.error("Error creating certificate:", error)
      toast.error("Nie udało się dodać certyfikatu. Spróbuj ponownie.")
    } finally {
      setIsSubmitting(false)
    }
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
          title="Dodaj nowy certyfikat"
          subtitle="Wypełnij poniższe pola, aby załączyć nowy dokument potwierdzający kwalifikacje zawodowe."
        >
          <Button asChild variant="outline" className="h-11 px-5 border-border/50 hover:bg-muted text-foreground rounded-xl gap-2">
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
              <CardTitle className="text-lg font-playfair text-foreground">Dane certyfikatu</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Pola oznaczone gwiazdką (*) są wymagane do poprawnej weryfikacji.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Nazwa */}
                  <div>
                    <Label htmlFor="nazwaCertyfikatu" className="text-xs font-semibold text-foreground/80 mb-1.5">
                      Nazwa certyfikatu / Licencji *
                    </Label>
                    <Input
                      id="nazwaCertyfikatu"
                      placeholder="np. Certyfikat Radcy Prawnego, Certyfikat Mediatora"
                      value={formData.nazwaCertyfikatu}
                      onChange={(e) => handleInputChange("nazwaCertyfikatu", e.target.value)}
                      required
                      className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-foreground text-sm"
                    />
                  </div>

                  {/* Wydawca */}
                  <div>
                    <Label htmlFor="wydawca" className="text-xs font-semibold text-foreground/80 mb-1.5">
                      Organ wydający / Instytucja *
                    </Label>
                    <Input
                      id="wydawca"
                      placeholder="np. Okręgowa Rada Radców Prawnych"
                      value={formData.wydawca}
                      onChange={(e) => handleInputChange("wydawca", e.target.value)}
                      required
                      className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-foreground text-sm"
                    />
                  </div>

                  {/* Daty */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dataUzyskania" className="text-xs font-semibold text-foreground/80 mb-1.5">
                        Data uzyskania *
                      </Label>
                      <Input
                        id="dataUzyskania"
                        type="date"
                        value={formData.dataUzyskania}
                        onChange={(e) => handleInputChange("dataUzyskania", e.target.value)}
                        required
                        className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-foreground text-sm text-foreground/80"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dataWaznosci" className="text-xs font-semibold text-foreground/80 mb-1.5">
                        Data ważności (opcjonalnie)
                      </Label>
                      <Input
                        id="dataWaznosci"
                        type="date"
                        value={formData.dataWaznosci}
                        onChange={(e) => handleInputChange("dataWaznosci", e.target.value)}
                        className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-foreground text-sm  text-foreground/80"
                      />
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        Pozostaw to pole puste, jeśli certyfikat jest wydany bezterminowo.
                      </p>
                    </div>
                  </div>

                  {/* Numer */}
                  <div>
                    <Label htmlFor="numerCertyfikatu" className="text-xs font-semibold text-foreground/80 mb-1.5">
                      Numer certyfikatu / Licencji (opcjonalnie)
                    </Label>
                    <Input
                      id="numerCertyfikatu"
                      placeholder="np. CERT/2024/12345"
                      value={formData.numerCertyfikatu}
                      onChange={(e) => handleInputChange("numerCertyfikatu", e.target.value)}
                      className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-foreground text-sm"
                    />
                  </div>

                  {/* Skan (Plik) */}
                  <div>
                    <Label className="text-xs font-semibold text-foreground/80">Skan certyfikatu (Dokument) *</Label>
                    <div className="mt-2 space-y-2">
                      {!uploadedFileUrl && (
                        <div>
                          <input
                            type="file"
                            id="certificate-upload"
                            className="sr-only"
                            onChange={handleFileUpload}
                            disabled={isUploading || isSubmitting}
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                          />
                          <label
                            htmlFor="certificate-upload"
                            className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 bg-background/30 rounded-xl p-6 cursor-pointer transition-all duration-300 group"
                          >
                            <div className="h-11 w-11 rounded-full bg-muted/50 group-hover:bg-primary/10 border border-border/40 group-hover:border-primary/30 flex items-center justify-center transition-all duration-300 mb-3">
                              {isUploading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              ) : (
                                <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-300">
                                {isUploading ? "Przesyłanie skanu..." : "Kliknij, aby wybrać plik certyfikatu"}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                lub przeciągnij go tutaj
                              </p>
                            </div>
                          </label>
                        </div>
                      )}
                      {uploadedFileUrl && (
                        <div className="flex items-center justify-between rounded-xl border border-border/30 bg-card/40 p-3 shadow-inner">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Award className="h-4.5 w-4.5 text-secondary shrink-0" />
                            <span className="text-xs font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">{uploadedFileName}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUploadedFileUrl("")
                              setUploadedFileName("")
                            }}
                            className="h-8 text-xs text-error hover:text-error/90 hover:bg-error/10 rounded-lg shrink-0 px-3 transition-colors"
                          >
                            Usuń skan
                          </Button>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground font-light">
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
                    className="h-11 px-6 rounded-xl border-t border-border shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                        Dodawanie...
                      </>
                    ) : (
                      "Dodaj certyfikat"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={isSubmitting}
                    className="h-11 px-6 border-border/50 hover:bg-muted text-foreground rounded-xl transition-all"
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
