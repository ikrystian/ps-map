"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MapPin, Star, Sparkles } from "lucide-react"
import { LawFirmCardWrapper } from "@/components/law-firm-card-wrapper"
import { motion } from "framer-motion"
import type { Category } from "@/types/categories"
import type { LawFirm } from "@/types/lawfirms"

interface MostConsultedCategoriesProps {
  categories: Category[]
  lawFirms: LawFirm[]
}

export function MostConsultedCategories({ categories, lawFirms }: MostConsultedCategoriesProps) {
  return (
    <section className="py-16 bg-card/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Najczęściej konsultowane kategorie
            </h2>
            <p className="text-xl text-muted-foreground">
              Sprawdź ekspertów w najpopularniejszych kategoriach prawnych
            </p>
          </div>

          <div className="space-y-8 max-w-6xl mx-auto">
            {categories.slice(0, 3).map((category, index) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold">{category.nazwa}</h3>
                  <Button asChild variant="ghost">
                    <Link href={`/kategorie/${category.slug}`}>
                      Zobacz więcej
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {lawFirms.slice(0, 3).map((firm) => (
                    <Link key={firm.id} href={`/ekspert/${firm.slug}`}>
                      <LawFirmCardWrapper pakietSubskrypcji={firm.pakietSubskrypcji} className="rounded-lg h-full">
                        <Card className={`hover:shadow-lg transition-shadow h-full ${firm.pakietSubskrypcji === "BIZNES" ? "border-0" : ""}`}>
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                {firm.logo && (
                                  <AvatarImage src={firm.logo} alt={firm.nazwa} />
                                )}
                                <AvatarFallback>
                                  {firm.nazwa.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-base">{firm.nazwa}</CardTitle>
                                  {firm.pakietSubskrypcji === "BIZNES" && (
                                    <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      Biznes
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {firm.miasto}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-1 mb-3">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{firm.avgRating.toFixed(1)}</span>
                            </div>
                            <Button asChild size="sm" className="w-full">
                              <span>
                                Zobacz profil
                              </span>
                            </Button>
                          </CardContent>
                        </Card>
                      </LawFirmCardWrapper>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
