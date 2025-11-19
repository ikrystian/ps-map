"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Upload, Award } from "lucide-react"
import Link from "next/link"

interface Certificate {
  id: string
  nazwaCertyfikatu: string
  wydawca: string
  dataUzyskania: string
  dataWaznosci: string | null
  numerCertyfikatu: string | null
  skanCertyfikatu: string
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
      const filename = certificate.skanCertyfikatu.split("/").pop() || "certificate"
      setUploadedFileName(filename)
    } catch (error) {
      console.error("Error fetching certificate:", error)
      toast.error("Nie udało się pobrać danych certyfikatu")
      router.push("/panel-kancelarii/certyfikaty")
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
      router.push("/panel-kancelarii/certyfikaty")
    } catch (error) {
      console.error("Error updating certificate:", error)
      toast.error("Nie udało się zaktualizować certyfikatu. Spróbuj ponownie.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ładowanie certyfikatu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-2"
          >
            <Link href="/panel-kancelarii/certyfikaty">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do listy certyfikatów
            </Link>
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Edytuj certyfikat
          </h1>
          <p className="text-muted-foreground mt-2">
            Zaktualizuj dane certyfikatu lub uprawnienia
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
                  {uploadedFileUrl && (
                    <div className="flex items-center justify-between rounded-lg border p-3 bg-muted mb-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{uploadedFileName}</span>
                        <a
                          href={uploadedFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Podgląd aktualnego pliku
                        </a>
                      </div>
                    </div>
                  )}
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
                      {isUploading ? "Przesyłanie..." : "Zmień plik"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dozwolone typy: PDF, JPEG, PNG, WEBP (max 10MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isSubmitting}
              >
                <Link href="/panel-kancelarii/certyfikaty">
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
