"use client"

import type { LawFirm } from "@/types/lawfirms"
import { ArrowUpRight, MapPin, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PackageBadge } from "@/components/permissions"

interface SimilarExpertsProps {
  experts: LawFirm[]
  currentExpertId: string
  expertiseCategoryName: string | null | undefined
}

const packageRank: Record<string, number> = {
  BIZNES: 4,
  PREMIUM: 3,
  STANDARD: 2,
  PODSTAWOWY: 1,
}

export function SimilarExperts({ experts, currentExpertId, expertiseCategoryName }: SimilarExpertsProps) {
  const filtered = experts
    .filter((e) => e.id !== currentExpertId)
    .sort((a, b) => (packageRank[b.pakietSubskrypcji || ""] || 0) - (packageRank[a.pakietSubskrypcji || ""] || 0))
    .slice(0, 8)

  if (!filtered.length) return null

  return (
    <section className="py-12 lg:py-20 bg-darker border-t border-zinc-900/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-6 mb-10 px-1">
          <h2 className="font-playfair text-2xl md:text-3xl font-normal text-white tracking-wide whitespace-nowrap">
            Podobni eksperci
            {expertiseCategoryName && (
              <>
                {" "}·{" "}
                <span className="italic font-light text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.35)" }}>
                  {expertiseCategoryName}
                </span>
              </>
            )}
          </h2>
          <div className="hidden md:block flex-grow border-t border-zinc-800/80" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((expert) => {
            const profession = expert.categories?.[0]?.category?.nazwa || expert.categories?.[0]?.nazwa || "Ekspert"
            const hasImage = expert.logo && (
              expert.logo.startsWith("http") ||
              expert.logo.startsWith("/uploads") ||
              expert.logo.startsWith("/generate") ||
              expert.logo.startsWith("/api/files")
            )

            return (
              <Link
                key={expert.id}
                href={`/ekspert/${expert.slug}`}
                className="group flex gap-4 items-center bg-[#1d1d1f] hover:bg-[#242422] border border-zinc-800/60 hover:border-zinc-700/80 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700/50">
                  {hasImage ? (
                    <Image
                      src={expert.logo!}
                      alt={expert.nazwaFirmy || expert.nazwa}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <span className="text-xl font-bold text-zinc-600">
                        {(expert.nazwaFirmy || expert.nazwa || "E")[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-zinc-500 tracking-[0.12em] uppercase truncate mb-0.5">
                        {profession}
                      </p>
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#0da192] transition-colors truncate leading-tight">
                        {expert.nazwaFirmy || expert.nazwa}
                      </h3>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-[#0da192] transition-colors flex-shrink-0 mt-0.5" />
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {expert.pakietSubskrypcji && (
                      <PackageBadge
                        packageType={expert.pakietSubskrypcji as "PODSTAWOWY" | "STANDARD" | "PREMIUM" | "BIZNES" | null}
                        size="sm"
                      />
                    )}
                    {expert.avgRating > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-yellow-400 font-semibold">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {expert.avgRating.toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-[#cda567] font-semibold">
                      <MapPin className="w-3 h-3" />
                      {expert.miasto}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
