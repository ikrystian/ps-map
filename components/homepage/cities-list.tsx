"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Loader2, MapPin } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function CitiesList() {
  const [cities, setCities] = useState<{ id: string; nazwa: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("/api/cities?hasExperts=true")
        const data = await res.json()
        if (Array.isArray(data)) {
          const seen = new Set<string>()
          const unique: { id: string; nazwa: string }[] = []
          for (const c of data) {
            if (c.nazwa && !seen.has(c.nazwa)) {
              seen.add(c.nazwa)
              unique.push({ id: c.id, nazwa: c.nazwa })
            }
          }
          setCities(unique)
        }
      } catch (error) {
        console.error("Error fetching cities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [])

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (cities.length === 0) {
    return null
  }

  const visibleCities = isExpanded ? cities : cities.slice(0, 25)

  return (
    <section className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            Znajdź usługi w swoim mieście
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Eksperci prawni dostępni w całej Polsce
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {visibleCities.map((city) => (
              <Button
                key={city.id}
                asChild
                variant="outline"
                className="justify-start"
              >
                <Link href={`/szukaj-prawnika?miasto=${city.nazwa}`}>
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  {city.nazwa}
                </Link>
              </Button>
            ))}
          </div>

          {cities.length > 25 && (
            <div className="text-center mt-10">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline"
                size="lg"
                className="gap-2 font-medium"
              >
                {isExpanded ? (
                  <>
                    Pokaż mniej <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Pokaż więcej <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
