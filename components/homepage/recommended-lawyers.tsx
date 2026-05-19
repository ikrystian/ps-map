"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle2, Sparkles } from "lucide-react"
import { LawFirmCardWrapper } from "@/components/law-firm-card-wrapper"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { motion } from "framer-motion"
import type { LawFirm } from "@/types/lawfirms"

interface RecommendedLawyersProps {
  lawFirms: LawFirm[]
}

export function RecommendedLawyers({ lawFirms }: RecommendedLawyersProps) {
  return (
    <section className="py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Polecani prawnicy i adwokaci
            </h2>
            <p className="text-xl text-muted-foreground">
              Najwyżej oceniani eksperci gotowi pomóc w Twojej sprawie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {lawFirms.slice(0, 3).map((firm, index) => (
              <motion.div
                key={firm.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/ekspert/${firm.slug}`}>
                  <LawFirmCardWrapper pakietSubskrypcji={firm.pakietSubskrypcji}>
                    <Card className={`hover:shadow-lg transition-shadow ${firm.pakietSubskrypcji === "BIZNES" ? "border-0" : ""}`}>
                      {/* Obrazek na całą szerokość karty */}
                      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                        {firm.logo ? (
                          <img
                            src={firm.logo}
                            alt={firm.nazwa}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <span className="text-4xl font-bold text-muted-foreground">
                              {firm.nazwa.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      <CardHeader className="pb-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <CardTitle className="text-lg">{firm.nazwa}</CardTitle>
                            {firm.zweryfikowana && (
                              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                            {firm.pakietSubskrypcji === "BIZNES" && (
                              <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Biznes
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-center text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {firm.miasto}{firm.voivodeship?.nazwa && `, ${firm.voivodeship.nazwa}`}
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{firm.avgRating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">
                              ({firm.reviewCount} opinii)
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {firm.opis && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 text-center">
                            {firm.opis}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-4 justify-center">
                          {firm.categories.slice(0, 3).map((cat) => (
                            <Badge key={cat.slug} variant="secondary">
                              {cat.nazwa}
                            </Badge>
                          ))}
                        </div>
                        <InteractiveHoverButton className="w-full" ><span>Zobacz profil</span></InteractiveHoverButton>
                      </CardContent>
                    </Card>
                  </LawFirmCardWrapper>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
