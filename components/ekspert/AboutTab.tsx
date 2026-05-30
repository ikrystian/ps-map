"use client"

import { BadgesSection } from "@/components/law-firm/BadgesSection"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, GraduationCap, ZoomIn } from "lucide-react"
import Image from "next/image"

interface LawFirm {
  opis?: string
  badges: any[]
  unikatowyOpisUslugi?: string
  categories: Array<{
    category: {
      nazwa: string
      slug: string
    }
  }>
  slowaKluczowe?: string[]
  edukacja?: Array<{
    uczelnia: string
    wydzial: string
    rokOd: number
    rokDo: number
  }>
  certificates: Array<{
    id: string
    nazwaCertyfikatu: string
    wydawca: string
    dataUzyskania: string
    numerCertyfikatu?: string
  }>
  galeriaZdjec?: string[]
}

interface AboutTabProps {
  lawFirm: LawFirm
  formatDate: (dateString: string) => string
  setLightboxIndex: (index: number) => void
  setLightboxOpen: (open: boolean) => void
}

export function AboutTab({
  lawFirm,
  formatDate,
  setLightboxIndex,
  setLightboxOpen,
}: AboutTabProps) {
  return (
    <div className="space-y-6">
      {/* Description */}
      {lawFirm.opis && (
        <Card>
          <CardHeader>
            <CardTitle>Opis kancelarii</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="about-description prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: lawFirm.opis }}
            />
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      <BadgesSection badges={lawFirm.badges} />

      {/* Scope of Services & Specializations */}
      {(lawFirm.unikatowyOpisUslugi ||
        lawFirm.categories.length > 0 ||
        (lawFirm.slowaKluczowe && lawFirm.slowaKluczowe.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle>Zakres usług</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lawFirm.unikatowyOpisUslugi && (
              <p className="whitespace-pre-wrap">{lawFirm.unikatowyOpisUslugi}</p>
            )}

            {lawFirm.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {lawFirm.categories.map((cat) => (
                  <Badge key={cat.category.slug} variant="secondary">
                    {cat.category.nazwa}
                  </Badge>
                ))}
              </div>
            )}

            {lawFirm.slowaKluczowe && lawFirm.slowaKluczowe.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t mt-2">
                {lawFirm.slowaKluczowe.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {lawFirm.edukacja && lawFirm.edukacja.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Wykształcenie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lawFirm.edukacja.map((edu, index) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <p className="font-semibold">{edu.uczelnia}</p>
                  <p className="text-muted-foreground">{edu.wydzial}</p>
                  <p className="text-sm text-muted-foreground">
                    {edu.rokOd} - {edu.rokDo}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificates */}
      {lawFirm.certificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certyfikaty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lawFirm.certificates.map((cert) => (
                <div key={cert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Award className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold">{cert.nazwaCertyfikatu}</p>
                    <p className="text-sm text-muted-foreground">Wydawca: {cert.wydawca}</p>
                    <p className="text-sm text-muted-foreground">
                      Data uzyskania: {formatDate(cert.dataUzyskania)}
                    </p>
                    {cert.numerCertyfikatu && (
                      <p className="text-sm text-muted-foreground">Nr: {cert.numerCertyfikatu}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery */}
      {lawFirm.galeriaZdjec && lawFirm.galeriaZdjec.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Galeria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4" id="expert-gallery">
              {lawFirm.galeriaZdjec.map((img, index) => (
                <div
                  key={index}
                  className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setLightboxIndex(index)
                    setLightboxOpen(true)
                  }}
                >
                  <Image
                    src={img}
                    alt={`Galeria ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ZoomIn className="h-8 w-8 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
