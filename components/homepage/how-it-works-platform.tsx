"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Building2, Home } from "lucide-react"
import Link from "next/link"

export function HowItWorksPlatform() {
  return (
    <section className="py-16 bg-card/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            Jak to działa?
          </h2>
          <p className="text-xl text-muted-foreground">
            Prosta Sprawa łączy klientów z ekspertami prawnymi
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* For Users */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Home className="h-6 w-6 mr-2 text-primary" />
                  Dla użytkowników
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      1
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Opisz swoją sprawę</h4>
                    <p className="text-sm text-muted-foreground">
                      Wypełnij prosty formularz i opisz swoją sytuację prawną.
                      To zajmuje tylko kilka minut.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      2
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Otrzymaj oferty</h4>
                    <p className="text-sm text-muted-foreground">
                      Prawnicy zainteresowani Twoją sprawą przygotują dla Ciebie oferty.
                      Porównaj je i wybierz najlepszą.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      3
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Współpracuj z ekspertem</h4>
                    <p className="text-sm text-muted-foreground">
                      Nawiąż kontakt z wybranym prawnikiem i rozwiąż swoją sprawę
                      z pomocą profesjonalisty.
                    </p>
                  </div>
                </div>

                <Button asChild className="w-full mt-auto">
                  <Link href="/dodaj-sprawe">
                    Dodaj sprawę
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* For Experts */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Building2 className="h-6 w-6 mr-2 text-secondary" />
                  Dla ekspertów
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                      1
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Stwórz profil</h4>
                    <p className="text-sm text-muted-foreground">
                      Zarejestruj swój profil eksperta i stwórz profesjonalną wizytówkę.
                      Pokaż swoje doświadczenie i specjalizacje.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                      2
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Przeglądaj sprawy</h4>
                    <p className="text-sm text-muted-foreground">
                      Otrzymuj powiadomienia o nowych sprawach w Twoich kategoriach.
                      Wybieraj te, które Cię interesują.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                      3
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Zdobywaj klientów</h4>
                    <p className="text-sm text-muted-foreground">
                      Składaj oferty i zdobywaj nowych klientów.
                      Rozwijaj swoją praktykę i buduj reputację.
                    </p>
                  </div>
                </div>

                <Button asChild variant="secondary" className="w-full mt-auto">
                  <Link href="/dla-prawnika">
                    Dowiedz się więcej
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

