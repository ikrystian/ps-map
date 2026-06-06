"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/sonner"
import { AlertCircle, CheckCircle, Download, FileJson, Upload, XCircle } from "lucide-react"
import { useState } from "react"

interface ImportResult {
  summary: {
    total: number
    success: number
    errors: number
  }
  results: {
    success: string[]
    errors: { email: string; error: string }[]
  }
}

export default function ImportEkspertow() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check if file is JSON by extension or MIME type
      const isJson = selectedFile.name.toLowerCase().endsWith('.json') ||
                     selectedFile.type === "application/json" ||
                     selectedFile.type === "text/json"

      if (!isJson) {
        toast.error("Wybierz plik JSON")
        return
      }
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error("Wybierz plik do importu")
      return
    }

    setImporting(true)

    try {
      // Read file content
      const fileContent = await file.text()

      // Parse JSON with better error handling
      let jsonData
      try {
        jsonData = JSON.parse(fileContent)
      } catch (parseError) {
        toast.error("Plik nie jest poprawnym plikiem JSON. Sprawdź składnię.")
        setImporting(false)
        return
      }

      // Validate JSON structure
      if (!jsonData.lawFirms || !Array.isArray(jsonData.lawFirms)) {
        toast.error("Nieprawidłowy format pliku. Oczekiwana struktura: { lawFirms: [...] }")
        setImporting(false)
        return
      }

      // Check if array is not empty
      if (jsonData.lawFirms.length === 0) {
        toast.error("Plik nie zawiera żadnych eksperta do zaimportowania")
        setImporting(false)
        return
      }

      // Send to API
      const response = await fetch("/api/admin/import-law-firms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Wystąpił błąd podczas importu")
        setImporting(false)
        return
      }

      setResult(data)

      if (data.summary.success > 0) {
        toast.success(`Zaimportowano ${data.summary.success} ekspertów`)
      }

      if (data.summary.errors > 0) {
        toast.warning(`${data.summary.errors} eksperta nie udało się zaimportować`)
      }
    } catch (error: any) {
      console.error("Import error:", error)
      toast.error(error.message || "Wystąpił błąd podczas importu")
    } finally {
      setImporting(false)
    }
  }

  const downloadSample = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement("a")
    link.href = "/sample.json"
    link.download = "sample-experts.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import ekspertów z pliku JSON</h1>
        <p className="text-muted-foreground mt-2">
          Importuj eksperci prawni z pliku JSON zawierającego pełne profile
        </p>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Instrukcja importu
          </CardTitle>
          <CardDescription>
            Jak przygotować plik JSON do importu ekspertów
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Struktura pliku JSON:</h3>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "lawFirms": [
    {
      "user": {
        "email": "kontakt@ekspert.pl",
        "name": "Nazwa Eksperta",
        "password": "HasloEkspert123!"
      },
      "lawFirm": {
        "typ": "SPOLKA_PARTNERSKA",
        "nazwa": "Ekspert Prawny",
        "nazwaFirmy": "Ekspert Prawny Sp. P.",
        "nip": "1234567890",
        "logo": "/uploads/law-firms/logo.png",
        "zdjecieGlowne": "/uploads/law-firms/main.jpg",
        "galeriaZdjec": ["/uploads/law-firms/img1.jpg"],
        ...
      },
      "voivodeships": ["Mazowieckie", "Łódzkie"],
      "categories": ["Prawo Gospodarcze", "Prawo Cywilne"],
      "services": [...],
      "certificates": [
        {
          "nazwaCertyfikatu": "Certyfikat",
          "skanCertyfikatu": "/uploads/certificates/cert.pdf",
          ...
        }
      ]
    }
  ]
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Wymagane pola:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>user.email - unikalny adres email</li>
              <li>lawFirm.nazwa - nazwa eksperta</li>
              <li>lawFirm.nip - NIP eksperta (unikalny)</li>
              <li>lawFirm.voivodeship - województwo siedziby</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Pola obrazków i mediów:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>lawFirm.logo - URL do logo ekspercie (np. /uploads/law-firms/logo.png)</li>
              <li>lawFirm.zdjecieGlowne - URL do głównego zdjęcia (np. /uploads/law-firms/main.jpg)</li>
              <li>lawFirm.galeriaZdjec - tablica URL-i do galerii zdjęć</li>
              <li>lawFirm.filmYouTube - URL filmu z YouTube (opcjonalnie)</li>
              <li>lawFirm.okladkaFilmu - URL miniatury filmu (opcjonalnie)</li>
              <li>certificate.skanCertyfikatu - URL do skanu certyfikatu (np. /uploads/certificates/cert.pdf)</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadSample}>
              <Download className="mr-2 h-4 w-4" />
              Pobierz przykładowy plik JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Wybierz plik do importu</CardTitle>
          <CardDescription>
            Wybierz plik JSON zawierający dane eksperta do zaimportowania
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {file ? file.name : "Kliknij aby wybrać plik JSON"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    lub przeciągnij plik tutaj
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileJson className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!file || importing}
            className="w-full"
            size="lg"
          >
            {importing ? (
              <>
                <span className="mr-2">Importowanie...</span>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importuj ekspertów
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {importing && (
        <Card>
          <CardHeader>
            <CardTitle>Importowanie w toku...</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={50} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Proszę czekać, trwa importowanie eksperta...
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Wyniki importu</CardTitle>
            <CardDescription>
              Podsumowanie procesu importowania ekspertów
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Łącznie</p>
                <p className="text-2xl font-bold text-blue-700">{result.summary.total}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Sukces</p>
                <p className="text-2xl font-bold text-green-700">{result.summary.success}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Błędy</p>
                <p className="text-2xl font-bold text-red-700">{result.summary.errors}</p>
              </div>
            </div>

            {result.results.success.length > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  Pomyślnie zaimportowani eksperci
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {result.results.success.map((email, index) => (
                      <li key={index}>{email}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {result.results.errors.length > 0 && (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Błędy importu</AlertTitle>
                <AlertDescription className="text-red-700">
                  <ul className="list-disc list-inside mt-2 space-y-2">
                    {result.results.errors.map((error, index) => (
                      <li key={index}>
                        <span className="font-medium">{error.email}</span>:{" "}
                        {error.error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
