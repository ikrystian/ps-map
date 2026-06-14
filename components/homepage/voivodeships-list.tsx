"use client"

import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function VoivodeshipsList() {
  const [voivodeships, setVoivodeships] = useState<{ id: string; nazwa: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVoivodeships = async () => {
      try {
        const res = await fetch("/api/voivodeships")
        const data = await res.json()
        if (Array.isArray(data)) {
          setVoivodeships(data)
        }
      } catch (error) {
        console.error("Error fetching voivodeships:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVoivodeships()
  }, [])

  if (loading || voivodeships.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Znajdź prawnika w swoim województwie
          </h2>
          <p className="text-xl text-muted-foreground">
            Eksperci prawni dostępni w całej Polsce
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {voivodeships.map((v) => (
              <Button
                key={v.id}
                asChild
                variant="outline"
                className="justify-start"
              >
                <Link href={`/szukaj-prawnika?voivodeship=${v.slug}`}>
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  {v.nazwa}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
