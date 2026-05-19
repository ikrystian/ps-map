"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Sparkles } from "lucide-react"
import { LawFirmCardWrapper } from "@/components/law-firm-card-wrapper"
import { motion } from "framer-motion"
import type { LawFirm } from "@/types/lawfirms"

interface NewExpertsProps {
  newLawFirms: LawFirm[]
}

export function NewExperts({ newLawFirms }: NewExpertsProps) {
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
              Nowi eksperci już dostępni
            </h2>
            <p className="text-xl text-muted-foreground">
              Poznaj najnowszych prawników na naszej platformie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newLawFirms.map((firm, index) => (
              <motion.div
                key={firm.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/ekspert/${firm.slug}`}>
                  <LawFirmCardWrapper pakietSubskrypcji={firm.pakietSubskrypcji} className="rounded-lg h-full">
                    <Card className={`hover:shadow-lg transition-shadow h-full ${firm.pakietSubskrypcji === "BIZNES" ? "border-0" : ""}`}>
                      <CardHeader>
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-3">
                            {firm.logo && (
                              <AvatarImage src={firm.logo} alt={firm.nazwa} />
                            )}
                            <AvatarFallback className="text-xl">
                              {firm.nazwa.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-2 justify-center mb-1">
                            <CardTitle className="text-lg">{firm.nazwa}</CardTitle>
                            {firm.pakietSubskrypcji === "BIZNES" && (
                              <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Biznes
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            {firm.miasto}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-sm">
                              {firm.avgRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button asChild size="sm" className="w-full">
                          <span>
                            Zobacz profil
                          </span>
                        </Button>
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
