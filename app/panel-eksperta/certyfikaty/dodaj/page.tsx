"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Upload, Award } from "lucide-react"
import Link from "next/link"

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight font-playfair">
            Dodaj nowy certyfikat
          </h1>
          <p className="text-muted-foreground mt-2">
            Wypełnij formularz, aby dodać nowy certyfikat lub uprawnienie
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dane certyfikatu</CardTitle>
          <CardDescription>
            Pola oznaczone gwiazdką (*) są wymagane
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nazwaCertyfikatu">
                  Nazwa certyfikatu *
                </Label>
                <Input
                  id="nazwaCertyfikatu"
                  placeholder="np. Certyfikat Radcy Prawnego, Certyfikat Mediatora"
                  value={formData.nazwaCertyfikatu}
                  onChange={(e) => handleInputChange("nazwaCertyfikatu", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="wydawca">
                  Wydawca *
                </Label>
                <Input
                  id="wydawca"
                  placeholder="np. Okręgowa Rada Radców Prawnych"
                  value={formData.wydawca}
                  onChange={(e) => handleInputChange("wydawca", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataUzyskania">
                    Data uzyskania *
                  </Label>
                  <Input
                    id="dataUzyskania"
                    type="date"
                    value={formData.dataUzyskania}
                    onChange={(e) => handleInputChange("dataUzyskania", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dataWaznosci">
                    Data ważności (opcjonalnie)
                  </Label>
                  <Input
                    id="dataWaznosci"
                    type="date"
                    value={formData.dataWaznosci}
                    onChange={(e) => handleInputChange("dataWaznosci", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Zostaw puste, jeśli certyfikat jest bezterminowy
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="numerCertyfikatu">
                  Numer certyfikatu (opcjonalnie)
                </Label>
                <Input
                  id="numerCertyfikatu"
                  placeholder="np. CERT/2024/12345"
                  value={formData.numerCertyfikatu}
                  onChange={(e) => handleInputChange("numerCertyfikatu", e.target.value)}
                />
              </div>

              <div>
                <Label>Skan certyfikatu *</Label>
                <div className="mt-2 space-y-2">
                  {!uploadedFileUrl && (
                    <div>
                      <input
                        type="file"
                        id="certificate-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById("certificate-upload")?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? "Przesyłanie..." : "Wybierz plik"}
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Dozwolone typy: PDF, JPEG, PNG, WEBP (max 10MB)
                  </p>
                  {uploadedFileUrl && (
                    <div className="flex items-center justify-between rounded-lg border p-3 bg-muted">
                      <span className="text-sm font-medium">{uploadedFileName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFileUrl("")
                          setUploadedFileName("")
                        }}
                      >
                        Usuń
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || isUploading || !uploadedFileUrl}
              >
                {isSubmitting ? "Dodawanie..." : "Dodaj certyfikat"}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isSubmitting}
              >
                <Link href="/panel-eksperta/certyfikaty">
                  Anuluj
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
