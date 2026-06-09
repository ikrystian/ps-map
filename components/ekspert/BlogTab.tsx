"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Eye, ArrowRight, BookOpen } from "lucide-react"
import Image from "next/image"
import type { LawFirm } from "@/types"
import { BlogPost } from '@/types/blog'
import { MagicCard } from "@/components/magic-card"
import { cn } from "@/lib/utils"

interface BlogTabProps {
  lawFirm: LawFirm
  formatDate: (dateString: string) => string
}

const formatViews = (views: number): string => {
  if (views === 1) return "1 wyświetlenie";
  const lastDigit = views % 10;
  const lastTwoDigits = views % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) {
    return `${views} wyświetlenia`;
  }
  return `${views} wyświetleń`;
};

export function BlogTab({ lawFirm, formatDate }: BlogTabProps) {
  // Helper function to strip HTML tags for blog excerpt
  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, "")
  }

  const pkg = lawFirm.pakietSubskrypcji;
  const isBusiness = pkg === "BIZNES";
  const isPremium = pkg === "PREMIUM";
  const isStandard = pkg === "STANDARD";

  const hoverColor = isBusiness
    ? "group-hover:text-amber-400"
    : isPremium
    ? "group-hover:text-purple-400"
    : isStandard
    ? "group-hover:text-blue-400"
    : "group-hover:text-[#0da192]";

  const hoverBorder = isBusiness
    ? "hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
    : isPremium
    ? "hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
    : isStandard
    ? "hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
    : "hover:border-[#0da192]/40 hover:shadow-[0_0_30px_rgba(13,161,146,0.15)]";

  const gradientFrom = isBusiness ? "#f59e0b" : isPremium ? "#a855f7" : isStandard ? "#3b82f6" : "#0da192";
  const gradientTo = isBusiness ? "#d97706" : isPremium ? "#7e22ce" : isStandard ? "#1d4ed8" : "#00897b";
  const gradientColor = isBusiness
    ? "rgba(245, 158, 11, 0.06)"
    : isPremium
    ? "rgba(168, 85, 247, 0.06)"
    : isStandard
    ? "rgba(59, 130, 246, 0.06)"
    : "rgba(13, 161, 146, 0.06)";

  return (
    <div className="space-y-4">
      {lawFirm.blogPosts && lawFirm.blogPosts.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lawFirm.blogPosts.map((post) => (
              <a href={`/blog/${post.slug}`} key={post.id} className="block group h-full">
                <MagicCard
                  gradientFrom={gradientFrom}
                  gradientTo={gradientTo}
                  gradientColor={gradientColor}
                  className={cn(
                    "flex flex-col h-full overflow-hidden border border-white/5 rounded-2xl bg-[#1d1d1b]/40 backdrop-blur-md transition-all duration-500",
                    hoverBorder
                  )}
                >
                  {/* Image/Placeholder section */}
                  {post.obrazekWyrozniajacy ? (
                    <div className="aspect-[16/10] w-[calc(100%-2px)] ml-[1px] mt-[1px] relative overflow-hidden rounded-t-2xl">
                      <Image
                        src={post.obrazekWyrozniajacy}
                        alt={post.tytul}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover filter brightness-[0.85] contrast-[1.05] group-hover:scale-105 group-hover:brightness-100 transition-all duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/90 via-[#1d1d1b]/20 to-transparent opacity-85 z-10" />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] w-[calc(100%-2px)] ml-[1px] mt-[1px] relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 flex items-center justify-center border-b border-white/5">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                      <BookOpen className={cn("h-10 w-10 transition-transform duration-500 group-hover:scale-110", isBusiness ? "text-amber-500/30" : isPremium ? "text-purple-500/30" : isStandard ? "text-blue-500/30" : "text-[#0da192]/30")} />
                    </div>
                  )}

                  {/* Text content area */}
                  <div className="p-6 flex flex-col flex-grow relative z-20">
                    {/* Meta info badges */}
                    <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-semibold text-muted-foreground">
                      {post.dataPublikacji && (
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/85" />
                          <span>{formatDate(post.dataPublikacji)}</span>
                        </div>
                      )}
                      {post.wyswietlenia !== undefined && post.wyswietlenia !== null && (
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground/85" />
                          <span>{formatViews(post.wyswietlenia)}</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={cn(
                      "text-xl font-bold font-playfair tracking-tight mb-3 line-clamp-2 transition-colors duration-300 text-foreground",
                      hoverColor
                    )}>
                      {post.tytul}
                    </h3>

                    {/* Text description/excerpt */}
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-6 leading-relaxed flex-grow">
                      {stripHtmlTags(post.tresc)}
                    </p>

                    {/* Read more footer element */}
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-sm font-semibold">
                      <span className={cn(
                        "transition-colors duration-300 text-muted-foreground",
                        isBusiness ? "group-hover:text-amber-400" : isPremium ? "group-hover:text-purple-400" : isStandard ? "group-hover:text-blue-400" : "group-hover:text-[#0da192]"
                      )}>
                        Czytaj artykuł
                      </span>
                      <ArrowRight className={cn(
                        "h-4 w-4 transition-all duration-300 transform group-hover:translate-x-1.5",
                        isBusiness ? "text-amber-400" : isPremium ? "text-purple-400" : isStandard ? "text-blue-400" : "text-[#0da192]"
                      )} />
                    </div>
                  </div>
                </MagicCard>
              </a>
            ))}
          </div>
          <div className="text-center pt-4">
            <Button variant="outline" asChild>
              <a href={`/blog?lawFirmId=${lawFirm.id}`}>Zobacz wszystkie artykuły eksperta</a>
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border border-white/5 bg-[#1d1d1b]/40 backdrop-blur-md rounded-2xl">
          <CardContent className="py-12 text-center text-muted-foreground">
            Ten ekspert nie opublikował jeszcze żadnych artykułów
          </CardContent>
        </Card>
      )}
    </div>
  )
}
