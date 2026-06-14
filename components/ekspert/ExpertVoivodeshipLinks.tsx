"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"

interface Voivodeship {
  id: string
  nazwa: string
  slug: string
}

interface ExpertVoivodeshipLinksProps {
  voivodeships: Voivodeship[]
  expertiseCategoryId: string | null | undefined
  expertiseCategoryName: string | null | undefined
}

export function ExpertVoivodeshipLinks({
  voivodeships,
  expertiseCategoryId,
  expertiseCategoryName,
}: ExpertVoivodeshipLinksProps) {
  if (!voivodeships.length || !expertiseCategoryId || !expertiseCategoryName) return null

  return (
    <section className="py-10 lg:py-14 bg-background border-t border-zinc-900/40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <MapPin className="w-4 h-4 text-[#0da192] flex-shrink-0" />
          <p className="text-xs font-bold text-zinc-500 tracking-[0.18em] uppercase">
            {expertiseCategoryName} · Województwa
          </p>
          <div className="flex-grow border-t border-zinc-800/60" />
        </div>

        <div className="flex flex-wrap gap-2">
          {voivodeships.map((v) => {
            const params = new URLSearchParams({
              expertiseCategoryId,
              voivodeship: v.slug,
            })
            return (
              <Link
                key={v.id}
                href={`/szukaj-prawnika?${params.toString()}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/60 hover:border-zinc-700 transition-all duration-200"
              >
                {expertiseCategoryName} {v.nazwa}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
