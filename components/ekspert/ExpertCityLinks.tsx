"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"

interface City {
  id: string
  nazwa: string
}

interface ExpertCityLinksProps {
  cities: City[]
  expertiseCategoryId: string | null | undefined
  expertiseCategoryName: string | null | undefined
  voivodeshipName: string | null | undefined
}

export function ExpertCityLinks({
  cities,
  expertiseCategoryId,
  expertiseCategoryName,
  voivodeshipName,
}: ExpertCityLinksProps) {
  if (!cities.length || !expertiseCategoryId || !expertiseCategoryName) return null

  return (
    <section className="py-10 lg:py-14 bg-background border-t border-border/40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <MapPin className="w-4 h-4 text-[#0da192] flex-shrink-0" />
          <p className="text-xs font-bold text-muted-foreground tracking-[0.18em] uppercase">
            {expertiseCategoryName}{voivodeshipName ? ` · ${voivodeshipName}` : ""}
          </p>
          <div className="flex-grow border-t border-border/60" />
        </div>

        <div className="flex flex-wrap gap-2">
          {cities.map((city) => {
            const params = new URLSearchParams({
              expertiseCategoryId,
              city: city.nazwa,
            })
            return (
              <Link
                key={city.id}
                href={`/szukaj-prawnika?${params.toString()}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground bg-card/60 hover:bg-muted border border-border/60 hover:border-border transition-all duration-200"
              >
                {expertiseCategoryName} {city.nazwa}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
