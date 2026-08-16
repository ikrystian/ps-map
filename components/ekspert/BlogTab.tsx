"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, ArrowRight, BookOpen, Lock, Sparkles, Zap, Plus, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import type { LawFirm } from "@/types"
import { MagicCard } from "@/components/magic-card"
import { cn } from "@/lib/utils"

interface BlogTabProps {
  lawFirm: LawFirm
  formatDate: (dateString: string) => string
  isOwnProfile?: boolean
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

export function BlogTab({ lawFirm, formatDate, isOwnProfile: propIsOwnProfile }: BlogTabProps) {
  const { data: session } = useSession()
  
  const isOwnProfile =
    propIsOwnProfile ??
    !!(
      session?.user?.lawFirm?.id &&
      lawFirm?.id &&
      session.user.lawFirm.id === lawFirm.id
    )

  // Helper function to strip HTML tags for blog excerpt
  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, "")
  }

  const pkg = lawFirm.pakietSubskrypcji;
  const isBusiness = pkg === "BIZNES" || (lawFirm as any).mozliwoscBloga === true;
  const isPremium = pkg === "PREMIUM";
  const isStandard = pkg === "STANDARD";

  // Blog jest dostępny gdy plan to BIZNES lub flaga mozliwoscBloga jest true
  const hasBlogAccess = isBusiness;

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

  // Jeśli brak dostępu do modułu bloga w pakiecie eksperta:
  if (!hasBlogAccess) {
    return (
      <Card className="border border-border bg-card/50 backdrop-blur-md rounded-2xl overflow-hidden relative shadow-lg">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

        <CardContent className="py-14 px-6 text-center max-w-xl mx-auto space-y-6 relative z-10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Funkcja Dostępna w Pakiecie BIZNES
            </div>
            <h3 className="text-xl font-bold font-playfair text-foreground tracking-tight">
              Moduł Bloga Niedostępny w Aktualnym Pakiecie
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">
              Ten ekspert korzysta z planu subskrypcyjnego ({pkg ?? "Podstawowy"}), który nie obejmuje publikacji autorskich artykułów na profilu.
            </p>
          </div>

          {isOwnProfile ? (
            <div className="pt-2 p-5 rounded-xl bg-card/60 border border-amber-500/20 space-y-3 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <Zap className="h-4 w-4 fill-amber-300" />
                <span>Twój profil nie posiada jeszcze aktywnego bloga</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Przejdź na pakiet BIZNES, aby publikować porady prawne, zdobywać bezpłatny ruch z wyszukiwarki Google i wyróżnić swoją kancelarię na tle konkurencji.
              </p>
              <Button
                asChild
                className="w-full h-10 mt-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-xl text-xs gap-2 shadow-md"
              >
                <Link href="/panel-eksperta/pakiet">
                  Aktywuj moduł bloga w pakiecie BIZNES
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="pt-2">
              <Button variant="outline" asChild className="rounded-xl text-xs border-border">
                <Link href={`/kancelaria/${lawFirm.slug}`}>
                  Zobacz pozostałe informacje o ekspercie
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

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
                    "flex flex-col h-full overflow-hidden border border-border rounded-2xl bg-card/40 backdrop-blur-md transition-all duration-500",
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
                      <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent opacity-85 z-10" />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] w-[calc(100%-2px)] ml-[1px] mt-[1px] relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-card via-background to-card flex items-center justify-center border-b border-border">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                      <BookOpen className={cn("h-10 w-10 transition-transform duration-500 group-hover:scale-110", isBusiness ? "text-amber-500/30" : isPremium ? "text-purple-500/30" : isStandard ? "text-blue-500/30" : "text-[#0da192]/30")} />
                    </div>
                  )}

                  {/* Text content area */}
                  <div className="p-6 flex flex-col flex-grow relative z-20">
                    {/* Meta info badges */}
                    <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-semibold text-muted-foreground">
                      {post.dataPublikacji && (
                        <div className="flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1 rounded-md border border-border">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/85" />
                          <span>{formatDate(post.dataPublikacji)}</span>
                        </div>
                      )}
                      {post.wyswietlenia !== undefined && post.wyswietlenia !== null && (
                        <div className="flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1 rounded-md border border-border">
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
                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm font-semibold">
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
        <Card className="border border-border bg-card/40 backdrop-blur-md rounded-2xl">
          <CardContent className="py-14 text-center space-y-4 text-muted-foreground">
            <div className="w-12 h-12 rounded-xl bg-foreground/5 border border-border flex items-center justify-center mx-auto text-muted-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-foreground">Brak artykułów na blogu</h4>
              <p className="text-xs text-muted-foreground font-light mt-1">
                Ten ekspert posiada aktywny moduł bloga, ale nie opublikował jeszcze pierwszych artykułów.
              </p>
            </div>
            {isOwnProfile && (
              <div className="pt-2">
                <Button asChild className="h-10 px-5 rounded-xl bg-primary text-white text-xs gap-2">
                  <Link href="/panel-eksperta/blog/nowy">
                    <Plus className="h-4 w-4" />
                    Napisz pierwszy artykuł
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
