"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/sonner"
import { AlertCircle, CheckCircle, Download, FileJson, Upload, XCircle } from "lucide-react"
import { useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

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
      <AdminHeaderSetter title="Import ekspertów" subtitle="Importuj eksperci prawni z pliku JSON zawierającego pełne profile" />

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
        "email": "kontakt@kancelaria-kowalski.pl",   // WYMAGANE, unikalny
        "password": "BezpieczneHaslo123!",            // opcjonalne (domyślnie Password123!)
        "name": "Kancelaria Kowalski"                 // opcjonalne (domyślnie = nazwa)
      },
      "lawFirm": {
        // --- Dane podstawowe ---
        "typ": "SPOLKA_PARTNERSKA",                   // patrz "Dozwolone wartości"
        "typInny": null,                              // tylko gdy typ = "INNY"
        "nazwa": "Kancelaria Kowalski",               // WYMAGANE
        "nazwa": "Kowalski i Wspólnicy Sp. P.",
        "nip": "1234567890",                          // unikalny (zalecane)
        "regon": "123456789",
        "krs": "0000123456",

        // --- Dane kontaktowe i adres siedziby (zapis w koncie User) ---
        "imieKontakt": "Jan",
        "nazwiskoKontakt": "Kowalski",
        "numerTelefonu": "+48 600 100 200",
        "numerTelefonu2": "+48 22 100 20 30",
        "adres": "ul. Marszałkowska 1",
        "kodPocztowy": "00-001",
        "miasto": "Warszawa",
        "voivodeship": "Mazowieckie",                 // województwo siedziby (zalecane)
        "latitude": 52.2297,
        "longitude": 21.0122,

        // --- Profil publiczny i multimedia ---
        "opis": "Doświadczona kancelaria...",
        "logo": "/uploads/law-firms/logo.png",
        "zdjecieGlowne": "/uploads/law-firms/main.jpg",
        "galeriaZdjec": ["/uploads/law-firms/img1.jpg", "/uploads/law-firms/img2.jpg"],
        "filmYouTube": "https://www.youtube.com/watch?v=xxxx",
        "okladkaFilmu": "/uploads/law-firms/cover.jpg",
        "kolejnoscMultimedia": "zdjecia",             // "zdjecia" lub "film"

        // --- Godziny otwarcia ---
        "statusGodzinyOtwarcia": true,
        "godzinyOtwarcia": {
          "poniedzialek": "9:00-17:00",
          "wtorek": "9:00-17:00",
          "sroda": "9:00-17:00",
          "czwartek": "9:00-17:00",
          "piatek": "9:00-15:00",
          "sobota": "zamkniete",
          "niedziela": "zamkniete"
        },

        // --- Social media i strona WWW ---
        "linkLinkedIn": "https://linkedin.com/company/kowalski",
        "linkFacebook": "https://facebook.com/kowalski",
        "linkInstagram": "https://instagram.com/kowalski",
        "linkTwitter": "https://twitter.com/kowalski",
        "linkTikTok": "https://tiktok.com/@kowalski",
        "stronaWww": "https://kancelaria-kowalski.pl",

        // --- Edukacja ---
        "edukacja": [
          { "uczelnia": "Uniwersytet Warszawski", "wydzial": "Prawo i Administracja", "rokOd": 2005, "rokDo": 2010 }
        ],

        // --- Wpisy do rejestrów (OIRP / ORA) ---
        "oirpMiasto": "Warszawa",
        "oirpWpis": "WA-1234",
        "oirpStatus": true,
        "oraMiasto": "Warszawa",
        "oraWpis": "ORA-5678",
        "oraStatus": false,

        // --- Specjalizacja i wyszukiwanie ---
        "unikatowyOpisUslugi": "Kompleksowa obsługa prawna firm.",
        "slowaKluczowe": ["prawo gospodarcze", "spółki", "kontrakty"],

        // --- Obszar i typ działania ---
        "callaPolska": false,                         // obsługa całej Polski
        "onlineOnly": false,                          // tylko zdalnie
        "typOferty": "WSZYSTKIE",                     // patrz "Dozwolone wartości"

        // --- Subskrypcja i status konta ---
        "pakietSubskrypcji": "PREMIUM",               // patrz "Dozwolone wartości"
        "zweryfikowana": true,
        "aktywna": true,
        "zgodaRegulamin": true,
        "zgodaPrzetwarzanie": true
      },

      // --- Powiązane kolekcje ---
      "voivodeships": ["Mazowieckie", "Łódzkie"],     // województwa działania (nazwy)
      "categories": ["Prawo Gospodarcze", "Prawo Cywilne"], // specjalizacje (nazwy kategorii)
      "services": [
        {
          "nazwaUslugi": "Rejestracja spółki",
          "opisUslugi": "Kompleksowa rejestracja spółki z o.o.",
          "cenaOd": 1500,
          "cenaDo": 3000,
          "jednostka": "ZA_USLUGE",                   // patrz "Dozwolone wartości"
          "aktywna": true
        }
      ],
      "certificates": [
        {
          "nazwaCertyfikatu": "Radca Prawny",
          "wydawca": "Okręgowa Izba Radców Prawnych",
          "dataUzyskania": "2012-06-15",
          "dataWaznosci": null,                        // null = bezterminowy
          "numerCertyfikatu": "RP-12345",
          "skanCertyfikatu": "/uploads/certificates/cert.pdf",
          "aktywny": true
        }
      ]
    }
  ]
}`}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Powyżej pokazano komentarze (// ...) wyłącznie dla czytelności – w pliku
              importu muszą zostać usunięte, ponieważ JSON ich nie dopuszcza. Pobierz
              gotowy, poprawny plik przyciskiem na dole.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Wymagane pola:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>user.email - unikalny adres email (login eksperta)</li>
              <li>lawFirm.nazwa - nazwa wyświetlana eksperta</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              Zalecane: lawFirm.nip (unikalny) oraz lawFirm.voivodeship (województwo
              siedziby). Pozostałe pola są opcjonalne – brakujące dane zostaną uzupełnione
              wartościami domyślnymi.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Konto i dane kontaktowe:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>user.email, user.password, user.name - dane logowania</li>
              <li>lawFirm.imieKontakt, lawFirm.nazwiskoKontakt - osoba kontaktowa</li>
              <li>lawFirm.numerTelefonu, lawFirm.numerTelefonu2 - telefony</li>
              <li>lawFirm.adres, lawFirm.kodPocztowy, lawFirm.miasto - adres siedziby</li>
              <li>lawFirm.voivodeship - województwo siedziby (nazwa)</li>
              <li>lawFirm.latitude, lawFirm.longitude - współrzędne na mapie</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Dane firmy i rejestry:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>lawFirm.typ, lawFirm.typInny - forma działalności</li>
              <li>lawFirm.nazwa, lawFirm.nip, lawFirm.regon, lawFirm.krs</li>
              <li>lawFirm.oirpMiasto, lawFirm.oirpWpis, lawFirm.oirpStatus - wpis OIRP</li>
              <li>lawFirm.oraMiasto, lawFirm.oraWpis, lawFirm.oraStatus - wpis ORA</li>
              <li>lawFirm.zweryfikowana, lawFirm.aktywna - status konta</li>
              <li>lawFirm.zgodaRegulamin, lawFirm.zgodaPrzetwarzanie - zgody</li>
              <li>lawFirm.pakietSubskrypcji - pakiet subskrypcji</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Profil, multimedia i social media:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>lawFirm.opis, lawFirm.unikatowyOpisUslugi - opisy profilu</li>
              <li>lawFirm.logo - URL do logo (np. /uploads/law-firms/logo.png)</li>
              <li>lawFirm.zdjecieGlowne - URL głównego zdjęcia</li>
              <li>lawFirm.galeriaZdjec - tablica URL-i do galerii zdjęć</li>
              <li>lawFirm.filmYouTube, lawFirm.okladkaFilmu - film i jego miniatura</li>
              <li>lawFirm.kolejnoscMultimedia - "zdjecia" lub "film"</li>
              <li>lawFirm.statusGodzinyOtwarcia, lawFirm.godzinyOtwarcia - godziny pracy</li>
              <li>lawFirm.linkLinkedIn, linkFacebook, linkInstagram, linkTwitter, linkTikTok, stronaWww</li>
              <li>lawFirm.edukacja - tablica wpisów (uczelnia, wydzial, rokOd, rokDo)</li>
              <li>lawFirm.slowaKluczowe - tablica tagów do wyszukiwania</li>
              <li>lawFirm.callaPolska, lawFirm.onlineOnly, lawFirm.typOferty - obszar i typ działania</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Powiązane kolekcje (tablice obok user / lawFirm):</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>voivodeships - województwa działania (tablica nazw)</li>
              <li>categories - specjalizacje (tablica nazw kategorii)</li>
              <li>services - usługi (nazwaUslugi, opisUslugi, cenaOd, cenaDo, jednostka, aktywna)</li>
              <li>certificates - certyfikaty (nazwaCertyfikatu, wydawca, dataUzyskania, dataWaznosci, numerCertyfikatu, skanCertyfikatu, aktywny)</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              Nazwy w voivodeships i categories muszą odpowiadać istniejącym słownikom –
              wartości nierozpoznane są pomijane.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Dozwolone wartości (enumy):</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>lawFirm.typ: OSOBA_FIZYCZNA, SPOLKA_CYWILNA, SPOLKA_PARTNERSKA, SPOLKA_KOMANDYTOWA, SPOLKA_JAWNA, SPOLKA_ZOO, INNY</li>
              <li>lawFirm.typOferty: STALA_WSPOLPRACA, JEDNORAZOWA_USLUGA, KONSULTACJA, WSZYSTKIE</li>
              <li>lawFirm.pakietSubskrypcji: PODSTAWOWY, STANDARD, PREMIUM, BIZNES</li>
              <li>service.jednostka: ZA_USLUGE, ZA_GODZINE, RYCZALT, DO_UZGODNIENIA</li>
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
