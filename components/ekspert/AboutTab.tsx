"use client"

import { BadgesSection } from "@/components/law-firm/BadgesSection"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BorderBeam } from "@/components/ui/border-beam"
import { Award, GraduationCap, ZoomIn, FileText, Sparkles, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import type { LawFirm } from "@/types"

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
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl">
          <BorderBeam lightColor="#0da192" lightWidth={350} duration={8} borderWidth={1} />
          <CardHeader className="border-b border-border/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl text-foreground font-playfair">O ekspercie</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div
              className="about-description text-foreground/80 leading-relaxed text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: lawFirm.opis }}
            />
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      {lawFirm.badges && <BadgesSection badges={lawFirm.badges} />}

      {/* Scope of Services & Specializations */}
      {(lawFirm.unikatowyOpisUslugi ||
        lawFirm.categories.length > 0 ||
        (lawFirm.slowaKluczowe && lawFirm.slowaKluczowe.length > 0)) && (
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <BorderBeam lightColor="#0da192" lightWidth={350} duration={8} borderWidth={1} />
            <CardHeader className="border-b border-border/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl text-foreground font-playfair">Zakres usług i specjalizacje</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {lawFirm.unikatowyOpisUslugi && (
                <p className="whitespace-pre-wrap text-sm md:text-base text-foreground/80 leading-relaxed">{lawFirm.unikatowyOpisUslugi}</p>
              )}

              {lawFirm.categories.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Kategorie spraw</p>
                  <div className="flex flex-wrap gap-2">
                    {lawFirm.categories.map((cat) => cat.category && (
                      <Badge key={cat.category.slug} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-semibold rounded-lg text-xs py-1 px-3 transition-all">
                        {cat.category.nazwa}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {lawFirm.slowaKluczowe && lawFirm.slowaKluczowe.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/10">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Obszary praktyki</p>
                  <div className="flex flex-wrap gap-2">
                    {(lawFirm.slowaKluczowe as string[]).map((keyword: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-foreground/5 border-border/20 hover:bg-foreground/10 text-foreground/80 text-xs py-1 px-3 rounded-lg font-medium transition-all">
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
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl">
          <BorderBeam lightColor="#0da192" lightWidth={350} duration={8} borderWidth={1} />
          <CardHeader className="border-b border-border/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl text-foreground font-playfair">Wykształcenie i kwalifikacje</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6 relative pl-2">
              {lawFirm.edukacja.map((edu, index: number) => (
                <div key={index} className="relative pl-6 pb-6 last:pb-0">
                  {/* Timeline vertical bar */}
                  <div className="absolute left-[3px] top-2 bottom-0 w-0.5 bg-border/20 last:hidden" />
                  {/* Timeline node */}
                  <div className="absolute left-0 top-[6px] h-2 w-2 rounded-full bg-primary ring-4 ring-border" />

                  <div className="space-y-2">
                    <p className="font-bold text-foreground text-base leading-snug">{edu.uczelnia}</p>
                    <p className="text-sm text-muted-foreground font-medium">{edu.wydzial}</p>
                    <p className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-md px-2.5 py-0.5 w-fit mt-1.5 uppercase tracking-wider">
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
      {lawFirm.certificates && lawFirm.certificates.length > 0 && (
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl">
          <BorderBeam lightColor="#0da192" lightWidth={350} duration={8} borderWidth={1} />
          <CardHeader className="border-b border-border/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Award className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl text-foreground font-playfair">Certyfikaty i wyróżnienia</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {lawFirm.certificates && lawFirm.certificates.map((cert) => (
                <div key={cert.id} className="flex items-start gap-4 p-4 border border-border/30 hover:border-primary/25 rounded-xl hover:shadow-md transition-all duration-300 bg-card/10">
                  <Award className="h-8 w-8 text-primary flex-shrink-0 mt-0.5 p-1 rounded-lg bg-primary/10" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-sm text-foreground leading-snug">{cert.nazwaCertyfikatu}</p>
                    <p className="text-xs text-muted-foreground">Wydawca: <span className="font-medium text-foreground/80">{cert.wydawca}</span></p>
                    <p className="text-xs text-muted-foreground">Uzyskano: <span className="font-medium text-foreground/80">{formatDate(cert.dataUzyskania)}</span></p>
                    {cert.numerCertyfikatu && (
                      <p className="text-[10px] text-muted-foreground font-mono bg-muted border border-border/15 px-2 py-0.5 rounded w-fit">Nr: {cert.numerCertyfikatu}</p>
                    )}
                    {cert.skanCertyfikatu && (
                      <a
                        href={cert.skanCertyfikatu}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline hover:text-primary/80 transition-colors font-semibold pt-1.5"
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
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl">
          <BorderBeam lightColor="#0da192" lightWidth={350} duration={8} borderWidth={1} />
          <CardHeader className="border-b border-border/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <ImageIcon className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl text-foreground font-playfair">Galeria zdjęć</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6" id="expert-gallery">
              {[0, 1, 2, 3].map((colIdx: number) => (
                <div key={colIdx} className="grid gap-4 h-fit">
                  {lawFirm.galeriaZdjec!
                    .map((img: string, i: number) => ({ img, i }))
                    .filter(({ i }: { i: number }) => i % 4 === colIdx)
                    .map(({ img, i }: { img: string; i: number }) => (
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
                          <ZoomIn className="h-8 w-8 text-foreground scale-90 group-hover:scale-100 transition-transform duration-300" />
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

