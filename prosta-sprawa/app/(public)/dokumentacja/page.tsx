"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, FolderOpen, Download, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DocFile {
  filename: string
  order: number
  category: string
  title: string
  size: number
  modified: string
}

interface DocsData {
  files: DocFile[]
  grouped: Record<string, DocFile[]>
  total: number
}

// Category display names in Polish
const categoryNames: Record<string, string> = {
  "strony-publiczne": "Strony publiczne",
  "panel-klienta": "Panel klienta",
  "panel-kancelarii": "Panel kancelarii",
  "panel-admina": "Panel administratora",
}

// Category colors for visual distinction
const categoryColors: Record<string, string> = {
  "strony-publiczne": "bg-blue-50 border-blue-200",
  "panel-klienta": "bg-green-50 border-green-200",
  "panel-kancelarii": "bg-purple-50 border-purple-200",
  "panel-admina": "bg-orange-50 border-orange-200",
}

export default function DokumentacjaPage() {
  const [docsData, setDocsData] = useState<DocsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/docs")
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setDocsData(data)
        }
      })
      .catch(err => {
        console.error("Error fetching docs:", err)
        setError("Nie udało się załadować dokumentacji")
      })
      .finally(() => setLoading(false))
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <Skeleton className="h-12 w-96 mb-4" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">❌ {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!docsData) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          📚 Dokumentacja techniczna
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Pełna dokumentacja funkcjonalności platformy Prosta Sprawa.
          Znajdziesz tutaj szczegółowe opisy wszystkich modułów i funkcji.
        </p>
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>{docsData.total} dokumentów</span>
          </div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <span>{Object.keys(docsData.grouped).length} kategorii</span>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Spis treści
          </CardTitle>
          <CardDescription>
            Przejdź szybko do interesującej Cię kategorii
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.keys(docsData.grouped).map(category => (
              <a
                key={category}
                href={`#${category}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-white hover:shadow-md transition-shadow"
              >
                <span className="font-medium text-gray-900">
                  {categoryNames[category] || category}
                </span>
                <span className="text-sm text-gray-500">
                  {docsData.grouped[category].length} {docsData.grouped[category].length === 1 ? "dokument" : "dokumentów"}
                </span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grouped Documents */}
      <div className="space-y-8">
        {Object.entries(docsData.grouped).map(([category, files]) => (
          <Card
            key={category}
            id={category}
            className={categoryColors[category] || "bg-gray-50 border-gray-200"}
          >
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FolderOpen className="w-6 h-6" />
                {categoryNames[category] || category}
              </CardTitle>
              <CardDescription>
                {files.length} {files.length === 1 ? "dokument" : "dokumentów"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map(file => (
                  <Link
                    key={file.filename}
                    href={`/docs/${file.filename}`}
                    target="_blank"
                    className="flex items-center justify-between p-4 rounded-lg border bg-white hover:shadow-lg hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5 group-hover:text-blue-500 transition-colors" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {file.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {formatFileSize(file.size)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(file.modified)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                      →
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Info */}
      <Card className="mt-12 bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              💡 <strong>Wskazówka:</strong> Dokumenty otwierają się w nowej karcie i są w formacie Markdown (.md)
            </p>
            <p>
              📝 Dokumentacja jest regularnie aktualizowana. Data ostatniej modyfikacji widoczna jest przy każdym pliku.
            </p>
            <p>
              🔗 Wszystkie pliki znajdują się w katalogu <code className="px-2 py-1 bg-gray-200 rounded text-xs">/docs</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
