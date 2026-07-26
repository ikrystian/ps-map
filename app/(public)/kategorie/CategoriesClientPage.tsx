"use client"

import { CategoryIcon } from "@/components/category-icon"
import { MagicCard } from "@/components/magic-card"
import ParticlesBackground from "@/components/ParticlesBackground"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { NumberTicker } from "@/components/ui/number-ticker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Briefcase,
  Building2,
  LayoutGrid,
  Loader2,
  Scale,
  Search,
  User,
  Users
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { Category } from "@/types/categories"

const DEFAULT_BUSINESS_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
const DEFAULT_PRIVATE_IMAGE = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80"

export default function CategoriesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const activeTabFromUrl = searchParams.get("tab") || "all"
  const [activeTab, setActiveTab] = useState(activeTabFromUrl)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const tab = searchParams.get("tab") || "all"
    if (tab !== activeTab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (val: string) => {
    setActiveTab(val)
    const params = new URLSearchParams(searchParams.toString())
    if (val === "all") {
      params.delete("tab")
    } else {
      params.set("tab", val)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        // Only keep root categories for the grid
        setCategories(data.filter((cat: Category) => cat.aktywna && !cat.parentId))
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch = cat.nazwa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.opis && cat.opis.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cat.children && cat.children.some(child => child.nazwa.toLowerCase().includes(searchQuery.toLowerCase())))

      const matchesTab = activeTab === "all" ||
        (activeTab === "private" && cat.typ === "SPRAWY_PRYWATNE") ||
        (activeTab === "business" && cat.typ === "SPRAWY_FIRMOWE")

      return matchesSearch && matchesTab
    })
  }, [categories, searchQuery, activeTab])

  const stats = useMemo(() => {
    const privateCount = categories
      .filter(c => c.typ === "SPRAWY_PRYWATNE")
      .reduce((sum, cat) => sum + (cat.children?.length || 0), 0)
    const businessCount = categories
      .filter(c => c.typ === "SPRAWY_FIRMOWE")
      .reduce((sum, cat) => sum + (cat.children?.length || 0), 0)
    return {
      all: categories.reduce((sum, cat) => sum + (cat.children?.length || 0), 0),
      private: privateCount,
      business: businessCount
    }
  }, [categories])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Przygotowujemy kategorie dla Ciebie...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-[#0f0f0e]bg-bg-[#0f0f0e] selection:bg-primary/30 relative"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/10 py-20 text-white lg:py-32" style={{
        backgroundImage: "linear-gradient(to bottom, rgba(20, 20, 18, 0.85), rgba(20, 20, 18, 0.95)), url('/4085ef6e-74b2-4e6e-aa70-a2135f53b9cb.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
        <ParticlesBackground />

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-[#d7b56d]/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary-foreground text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Katalog spraw i ekspertów
          </div>

          <h1 className="mb-6 text-4xl  font-playfair tracking-tight md:text-6xl lg:text-7xl">
            Znajdź <span className="text-primary">właściwą</span> pomoc
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 md:text-xl">
            Od spraw codziennych po skomplikowane procesy biznesowe.
            Wybierz kategorię i połącz się z najlepszymi specjalistami w Polsce.
          </p>

          {/* Search Bar in Hero */}
          <div className="mx-auto max-w-2xl">
            <div className="group relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-[#d7b56d] opacity-20 blur transition duration-1000 group-hover:opacity-40 group-hover:duration-200"></div>
              <div className="relative flex  items-center rounded-xl bg-slate-900 border border-slate-800 p-1 shadow-2xl">
                <Input
                  placeholder="Czego szukasz? (np. alimenty, spółki, nieruchomości)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 flex flex-1 w-full border-none bg-transparent text-lg text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-4 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-3xl md:text-4xl font-bold text-white">
                <NumberTicker value={stats.all} />
              </p>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">Wszystkich kategorii</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-3xl md:text-4xl font-bold text-[#d7b56d]">
                <NumberTicker value={stats.private} />
              </p>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">Prywatnych</p>
            </div>
            <div className="hidden md:flex flex-col items-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-3xl md:text-4xl font-bold text-primary">
                <NumberTicker value={stats.business} />
              </p>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">Firmowych</p>
            </div>
            <div className="md:hidden col-span-2 flex flex-col items-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-3xl font-bold text-primary">
                <NumberTicker value={stats.business} />
              </p>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">Firmowych</p>
            </div>
          </div>
        </div>

        {/* Bottom mesh gradient */}
      </section>

      {/* Categories Content */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
          <div className="mb-12 flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight">Obszary Prawa</h2>
              <p className="text-muted-foreground mt-2 max-w-md">
                Wybierz interesującą Cię kategorię, aby zobaczyć szczegóły i listę dostępnych ekspertów.
              </p>
            </div>
            <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground grid w-full grid-cols-3 md:w-[450px]">
              <TabsTrigger value="all" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-10">
                <LayoutGrid className="h-4 w-4" />
                <span>Wszystkie</span>
              </TabsTrigger>
              <TabsTrigger value="private" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-10">
                <Users className="h-4 w-4" />
                <span>Prywatne</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-10">
                <Building2 className="h-4 w-4" />
                <span>Firmowe</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0 ring-offset-background focus-visible:outline-none">
            <GroupedCategoryGrid categories={filteredCategories} />
          </TabsContent>
          <TabsContent value="private" className="mt-0 ring-offset-background focus-visible:outline-none">
            <GroupedCategoryGrid categories={filteredCategories} />
          </TabsContent>
          <TabsContent value="business" className="mt-0 ring-offset-background focus-visible:outline-none">
            <GroupedCategoryGrid categories={filteredCategories} />
          </TabsContent>
        </Tabs>

        {filteredCategories.length === 0 && (
          <div className="py-24 text-center border rounded-3xl bg-muted/30 border-dashed">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-background shadow-sm mb-6">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold">Brak wyników wyszukiwania</h3>
            <p className="text-muted-foreground mt-3 max-w-sm mx-auto">
              Nie znaleźliśmy kategorii pasujących do hasła <span className="text-foreground font-semibold">"{searchQuery}"</span>.
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                handleTabChange("all")
              }}
              className="mt-8 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Pokaż wszystkie kategorie
            </button>
          </div>
        )}
      </div>
    </div >
  )
}

// Grupowanie wewnątrz zakładki: kategorie prawne vs usługi ekspertów (flaga `ekspercka`)
function GroupedCategoryGrid({ categories }: { categories: Category[] }) {
  const legal = categories.filter((c) => !c.ekspercka)
  const expert = categories.filter((c) => c.ekspercka)

  if (expert.length === 0) {
    return <CategoryGrid categories={legal} />
  }

  return (
    <div className="space-y-12">
      {legal.length > 0 && (
        <section>
          <div className="mb-6 flex items-center gap-3">
            <Scale className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold tracking-tight">Sprawy prawne</h3>
          </div>
          <CategoryGrid categories={legal} />
        </section>
      )}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold tracking-tight">Usługi ekspertów</h3>
        </div>
        <CategoryGrid categories={expert} />
      </section>
    </div>
  )
}

function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="proste-kategorie-grid">
      {categories.map((category) => {
        const isBusiness = category.typ === "SPRAWY_FIRMOWE"

        // Custom gradient and glow config per category tiype matching standard brand colors:
        // Sprawy Firmowe -> Teal (#0da192), Sprawy Prywatne -> Gold/Amber (#d7b56d)
        const gradientFrom = isBusiness ? "#0da192" : "#d7b56d"
        const gradientTo = isBusiness ? "#00897b" : "#bfa05d"
        const gradientColor = isBusiness ? "rgba(13, 161, 146, 0.08)" : "rgba(215, 181, 109, 0.08)"

        return (
          <MagicCard
            key={category.id}
            className={`flex flex-col h-full overflow-hidden border-border/60 rounded-2xl transition-all duration-300 group ${isBusiness
              ? "hover:border-[#0da192]/40"
              : "hover:border-[#d7b56d]/40"
              }`}
            gradientFrom={gradientFrom}
            gradientTo={gradientTo}
            gradientColor={gradientColor}
          >
            {/* Category Image Header */}
            <div className="relative w-[calc(100%-2px)] ml-[1px] h-44 overflow-hidden rounded-t-2xl">
              <img
                src={category.backgroundImageUrl || (isBusiness ? DEFAULT_BUSINESS_IMAGE : DEFAULT_PRIVATE_IMAGE)}
                alt={category.nazwa}
                className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.05] group-hover:scale-105 group-hover:brightness-100 transition-all duration-700 ease-out"
              />
              {/* Elegant dark overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />

              {/* Floating Badge on Image */}
              <div className="absolute top-4 right-4 z-20">
                <Badge
                  className={`backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-bold gap-1.5 border transition-all ${isBusiness
                    ? "bg-slate-900/70 text-[#0da192] border-[#0da192]/30 hover:bg-slate-900/90"
                    : "bg-slate-900/70 text-[#d7b56d] border-[#d7b56d]/30 hover:bg-slate-900/90"
                    }`}
                >
                  {isBusiness ? (
                    <>
                      <Briefcase className="h-3 w-3" />
                      <span>Sprawy Firmowe</span>
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3" />
                      <span>Sprawy Prywatne</span>
                    </>
                  )}
                </Badge>
              </div>

              {/* Floating Icon Wrapper overlapping the image bottom */}
              <Link
                href={`/kategorie/${category.slug}`}
                className={`absolute top-3 left-3 z-20 rounded-xl p-3 shadow-lg border transition-all duration-500 transform group-hover:rotate-6 bg-card ${isBusiness
                  ? "text-[#0da192] border-[#0da192]/20 group-hover:bg-[#0da192] group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(13,161,146,0.3)]"
                  : "text-[#d7b56d] border-[#d7b56d]/20 group-hover:bg-[#d7b56d] group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(215,181,109,0.3)]"
                  }`}
              >
                <CategoryIcon
                  ikona={category.ikona}
                  ikonaUrl={category.ikonaUrl}
                  fallback={isBusiness ? Briefcase : Scale}
                  className="h-6 w-6"
                />
              </Link>
            </div>

            {/* Subtle background glow highlight in bottom right */}
            <div
              className={`absolute bottom-0 right-0 h-36 w-36 bg-gradient-to-tl from-transparent via-transparent to-transparent rounded-tl-full pointer-events-none transition-all duration-500 ${isBusiness
                ? "from-[#0da192]/5 group-hover:from-[#0da192]/10"
                : "from-[#d7b56d]/5 group-hover:from-[#d7b56d]/10"
                }`}
            />

            <div className="p-6 flex flex-col flex-grow relative z-10">
              {/* Title with matching color on hover */}
              <Link href={`/kategorie/${category.slug}`}>
                <h3 className={`text-2xl font-bold mb-3 transition-colors font-playfair line-clamp-1 ${isBusiness ? "group-hover:text-[#0da192]" : "group-hover:text-[#d7b56d]"
                  }`}>
                  {category.nazwa}
                </h3>
              </Link>

              {/* Description */}
              {category.opis && (
                <p className="text-muted-foreground text-sm line-clamp-2 mb-6 leading-relaxed flex-grow">
                  {category.opis}
                </p>
              )}

              {/* Subcategories (Children) with Custom Color Coding */}
              {category.children && category.children.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-x-2 gap-y-2">
                  {category.children.slice(0, 6).map((child) => (
                    <Link
                      key={child.id}
                      href={`/kategorie/${category.slug}/${child.slug}`}
                      className={`group inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[11px] font-medium transition-colors ${isBusiness
                        ? "hover:border-[#0da192]/50 hover:bg-[#0da192]/5 hover:text-[#0da192]"
                        : "hover:border-[#d7b56d]/50 hover:bg-[#d7b56d]/5 hover:text-[#d7b56d]"
                        }`}
                    >
                      <span>{child.nazwa}</span>
                      {child._count?.lawFirms !== undefined && (
                        <span className={`text-sm transition-colors ml-0.5 font-semibold ${isBusiness
                          ? "text-muted-foreground/60 group-hover:text-[#0da192]/80"
                          : "text-muted-foreground/60 group-hover:text-[#d7b56d]/80"
                          }`}>
                          ({child._count.lawFirms})
                        </span>
                      )}
                    </Link>
                  ))}
                  {category.children.length > 6 && (
                    <Link
                      href={`/kategorie/${category.slug}`}
                      className={`inline-flex items-center px-2 py-1 text-sm text-muted-foreground transition-colors font-medium ${isBusiness ? "hover:text-[#0da192]" : "hover:text-[#d7b56d]"
                        }`}
                    >
                      +{category.children.length - 6} więcej...
                    </Link>
                  )}
                </div>
              )}



            </div>
          </MagicCard>
        )
      })}
    </div>
  )
}
