"use client"

import { BadgesSection } from "@/components/law-firm/BadgesSection"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, GraduationCap, ZoomIn, FileText, CheckCircle2, Star, Sparkles } from "lucide-react"
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
    skanCertyfikatu?: string
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
        <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/30 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary/80" />
              O kancelarii
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div
              className="about-description"
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
          <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/30 pb-4">
              <CardTitle className="text-lg font-bold">Zakres usług i specjalizacje</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {lawFirm.unikatowyOpisUslugi && (
                <p className="whitespace-pre-wrap text-md text-foreground/90 leading-relaxed">{lawFirm.unikatowyOpisUslugi}</p>
              )}

              {lawFirm.categories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-md font-bold uppercase text-muted-foreground tracking-wider">Kategorie spraw</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lawFirm.categories.map((cat) => (
                      <Badge key={cat.category.slug} variant="secondary" className="bg-secondary/70 border border-border/60 hover:bg-secondary font-medium rounded-lg text-md py-0.5 px-2.5 transition-colors">
                        {cat.category.nazwa}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {lawFirm.slowaKluczowe && lawFirm.slowaKluczowe.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/30">
                  <p className="text-md font-bold uppercase text-muted-foreground tracking-wider">Obszary praktyki</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lawFirm.slowaKluczowe.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="bg-background/40 border-border/50 hover:bg-muted/20 text-md py-0.5 px-2 rounded-lg font-normal transition-colors">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {/* Education */}
      {lawFirm.edukacja && lawFirm.edukacja.length > 0 && (
        <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/30 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary/80" />
              Wykształcenie i kwalifikacje
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6 relative pl-2">
              {lawFirm.edukacja.map((edu, index) => (
                <div key={index} className="relative pl-6 pb-6 last:pb-0">
                  {/* Timeline vertical bar */}
                  <div className="absolute left-[3px] top-2 bottom-0 w-0.5 bg-border last:hidden" />
                  {/* Timeline node */}
                  <div className="absolute left-0 top-[6px] h-2 w-2 rounded-full bg-primary ring-4 ring-background" />

                  <div className="space-y-1">
                    <p className="font-bold text-foreground leading-snug">{edu.uczelnia}</p>
                    <p className="text-sm text-muted-foreground font-medium">{edu.wydzial}</p>
                    <p className="text-[11px] font-bold text-primary/95 bg-primary/5 border border-primary/10 rounded-md px-2 py-0.5 w-fit mt-1.5">
                      {edu.rokOd} — {edu.rokDo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificates */}
      {lawFirm.certificates.length > 0 && (
        <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/30 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary/80" />
              Certyfikaty i wyróżnienia
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {lawFirm.certificates.map((cert) => (
                <div key={cert.id} className="flex items-start gap-4 p-4 border border-border/60 hover:border-primary/25 rounded-xl hover:shadow-sm transition-all duration-300 bg-background/30">
                  <Award className="h-8 w-8 text-primary/80 flex-shrink-0 mt-0.5 p-1 rounded-lg bg-primary/10" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-sm text-foreground leading-snug">{cert.nazwaCertyfikatu}</p>
                    <p className="text-md text-muted-foreground">Wydawca: <span className="font-medium text-foreground/80">{cert.wydawca}</span></p>
                    <p className="text-md text-muted-foreground">Uzyskano: <span className="font-medium text-foreground/80">{formatDate(cert.dataUzyskania)}</span></p>
                    {cert.numerCertyfikatu && (
                      <p className="text-[10px] text-muted-foreground font-mono bg-muted/40 px-1.5 py-0.5 rounded w-fit">Nr: {cert.numerCertyfikatu}</p>
                    )}
                    {cert.skanCertyfikatu && (
                      <a
                        href={cert.skanCertyfikatu}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-md text-primary hover:underline hover:text-primary/80 transition-colors font-semibold pt-1.5"
                      >
                        <FileText className="h-3 w-3" />
                        Zobacz skan certyfikatu
                      </a>
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
        <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/30 pb-4">
            <CardTitle className="text-lg font-bold">Galeria zdjęć</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6" id="expert-gallery">
              {[0, 1, 2, 3].map((colIdx) => (
                <div key={colIdx} className="grid gap-4 h-fit">
                  {lawFirm.galeriaZdjec!
                    .map((img, i) => ({ img, i }))
                    .filter(({ i }) => i % 4 === colIdx)
                    .map(({ img, i }) => (
                      <div
                        key={i}
                        className={`relative rounded-2xl overflow-hidden cursor-pointer group bg-muted/30 border border-border/40 shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:shadow-md ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]"
                          }`}
                        onClick={() => {
                          setLightboxIndex(i)
                          setLightboxOpen(true)
                        }}
                      >
                        <Image
                          src={img}
                          alt={`Galeria ${i + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ZoomIn className="h-8 w-8 text-white scale-90 group-hover:scale-100 transition-transform duration-300" />
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
