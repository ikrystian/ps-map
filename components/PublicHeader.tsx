"use client"

import { AddCaseButton } from "@/components/AddCaseButton"
import { SiteLogo } from "@/components/site-logo"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import UserMenu from "@/components/UserMenu"
import { NotificationBell } from "@/components/NotificationBell"
import { cn } from "@/lib/utils"
import type { CategoryWithChildren } from "@/types/categories"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, ChevronRight, IdCard, List, MapPin, Menu, Search, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { InteractiveHoverButton } from "./ui/interactive-hover-button"

interface PublicHeaderProps {
  isAuthenticated?: boolean
  userRole?: "CLIENT" | "LAW_FIRM" | "ADMIN" | null
  userName?: string | null
  userImage?: string | null
  punktySaldo?: number
  userId?: string
  showCategoryCounts?: boolean
}




// Client-side cache for city searches to avoid redundant api queries
const clientCitiesCache: Record<string, any[]> = {}

export default function PublicHeader({
  isAuthenticated = false,
  userRole = null,
  userName = null,
  userImage = null,
  punktySaldo = 0,
  userId,
  showCategoryCounts = false
}: PublicHeaderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [searchFormOpen, setSearchFormOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedVoivodeship, setSelectedVoivodeship] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [locationOpen, setLocationOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [cities, setCities] = useState<any[]>([])
  const [locationSearch, setLocationSearch] = useState("")
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  // Geographic hierarchy setting
  const [geographicHierarchy, setGeographicHierarchy] = useState<"voivodeships" | "counties" | "cities">("cities")
  const [voivodeshipsList, setVoivodeshipsList] = useState<any[]>([])
  const [voivodeshipDropdownOpen, setVoivodeshipDropdownOpen] = useState(false)
  const [selectedVoivodeshipName, setSelectedVoivodeshipName] = useState("")
  const [selectedCounty, setSelectedCounty] = useState("")
  const [countyOpen, setCountyOpen] = useState(false)
  const [countyInput, setCountyInput] = useState("")

  // Expertise categories state for nested dropdown
  const [expertiseCategories, setExpertiseCategories] = useState<any[]>([])
  const [selectedExpertiseCategoryId, setSelectedExpertiseCategoryId] = useState("")
  const [selectedExpertiseCategoryName, setSelectedExpertiseCategoryName] = useState("")
  const [expertiseOpen, setExpertiseOpen] = useState(false)
  const [menuPath, setMenuPath] = useState<string[]>([])
  const [customLogo, setCustomLogo] = useState<string | null>(null)

  // Fetch custom expert logo if authenticated as a law firm
  useEffect(() => {
    const fetchExpertLogo = async () => {
      try {
        const response = await fetch("/api/law-firms/me")
        if (response.ok) {
          const data = await response.json()
          if (data.logo) {
            setCustomLogo(data.logo)
          }
        }
      } catch (error) {
        console.error("Error fetching expert logo:", error)
      }
    }

    if (isAuthenticated && userRole === "LAW_FIRM") {
      fetchExpertLogo()
    }
  }, [isAuthenticated, userRole, pathname])

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data.filter((cat: CategoryWithChildren) => !cat.parentId))
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Fetch geographic hierarchy setting and voivodeships list
  useEffect(() => {
    const fetchSettingsAndVoivodeships = async () => {
      try {
        const [settingsRes, voivodeshipsRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/voivodeships"),
        ])
        if (settingsRes.ok) {
          const data = await settingsRes.json()
          const hierarchy = data.geographicHierarchy as "voivodeships" | "counties" | "cities"
          if (hierarchy) setGeographicHierarchy(hierarchy)
        }
        if (voivodeshipsRes.ok) {
          const data = await voivodeshipsRes.json()
          setVoivodeshipsList(data)
        }
      } catch (error) {
        console.error("Error fetching settings/voivodeships:", error)
      }
    }
    fetchSettingsAndVoivodeships()
  }, [])

  // Fetch expertise categories on mount
  useEffect(() => {
    const fetchExpertiseCategories = async () => {
      try {
        const response = await fetch("/api/expertise-categories")
        if (response.ok) {
          const data = await response.json()
          setExpertiseCategories(data)
        }
      } catch (error) {
        console.error("Error fetching expertise categories:", error)
      }
    }

    fetchExpertiseCategories()
  }, [])

  // Reset drill-down menu path when popover closes
  useEffect(() => {
    if (!expertiseOpen) {
      setMenuPath([])
    }
  }, [expertiseOpen])

  // Dynamic fetch and caching for cities and postal codes
  useEffect(() => {
    const query = locationSearch.trim().toLowerCase()
    if (query.length < 2) {
      setCities([])
      setIsLoadingCities(false)
      return
    }

    const currentVoivodeship = searchParams.get("voivodeship") || ""
    const cacheKey = `${currentVoivodeship}:${query}`

    if (clientCitiesCache[cacheKey]) {
      setCities(clientCitiesCache[cacheKey])
      setIsLoadingCities(false)
      return
    }

    setIsLoadingCities(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      try {
        let url = `/api/cities?search=${encodeURIComponent(query)}`
        if (currentVoivodeship) {
          url += `&voivodeship=${encodeURIComponent(currentVoivodeship)}`
        }

        const response = await fetch(url, {
          signal: controller.signal,
        })
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            clientCitiesCache[cacheKey] = data
            setCities(data)
          }
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching cities:", error)
        }
      } finally {
        setIsLoadingCities(false)
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [locationSearch, searchParams])

  // Reset location search when popover closes
  useEffect(() => {
    if (!locationOpen) {
      setLocationSearch("")
      setCities([])
    }
  }, [locationOpen])

  // Close search form and mobile menu on pathname change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchFormOpen(false)
    setMobileMenuOpen(false)
  }, [pathname])

  // Split categories into two groups (firmowe/prywatne)
  const firmoweCat = categories.filter(c => c.typ === 'SPRAWY_FIRMOWE')
  const prywatneCat = categories.filter(c => c.typ === 'SPRAWY_PRYWATNE')

  // Rozdziela kategorie na kolumny mega menu, wyrównując je wg przybliżonej wysokości
  // (nagłówek + widoczne podkategorie), z zachowaniem kolejności
  const splitIntoColumns = (cats: CategoryWithChildren[], numCols: number) => {
    const weight = (c: CategoryWithChildren) => 2 + Math.min(c.children?.length || 0, 5)
    const total = cats.reduce((sum, c) => sum + weight(c), 0)
    const cols: CategoryWithChildren[][] = Array.from({ length: numCols }, () => [])
    let colIdx = 0
    let acc = 0
    for (const cat of cats) {
      if (
        colIdx < numCols - 1 &&
        cols[colIdx].length > 0 &&
        acc + weight(cat) / 2 > (total / numCols) * (colIdx + 1)
      ) {
        colIdx++
      }
      cols[colIdx].push(cat)
      acc += weight(cat)
    }
    return cols.filter((col) => col.length > 0)
  }

  const isFirmoweActive = firmoweCat.some(
    (category) =>
      pathname === `/kategorie/${category.slug}` ||
      (category.children && category.children.some((child) => pathname === `/kategorie/${category.slug}/${child.slug}`))
  )

  const isPrywatneActive = prywatneCat.some(
    (category) =>
      pathname === `/kategorie/${category.slug}` ||
      (category.children && category.children.some((child) => pathname === `/kategorie/${category.slug}/${child.slug}`))
  )

  const isONasActive = pathname === "/o-nas"
  const isDlaPrawnikaActive = pathname.startsWith("/dla-prawnika")
  const isZNamiWygrywaszActive = pathname === "/z-nami-wygrywasz"
  const isDlaczegoWartoActive = isDlaPrawnikaActive || isZNamiWygrywaszActive

  // Helpers for nested categories navigation
  const getVisibleCategories = () => {
    if (menuPath.length === 0) {
      return expertiseCategories
    }
    if (menuPath.length === 1) {
      const parent = expertiseCategories.find(c => c.id === menuPath[0])
      return parent?.children || []
    }
    if (menuPath.length === 2) {
      const parent = expertiseCategories.find(c => c.id === menuPath[0])
      const sub = parent?.children?.find((c: any) => c.id === menuPath[1])
      return sub?.children || []
    }
    return []
  }

  const getParentItem = () => {
    if (menuPath.length === 1) {
      return expertiseCategories.find(c => c.id === menuPath[0])
    }
    if (menuPath.length === 2) {
      const parent = expertiseCategories.find(c => c.id === menuPath[0])
      return parent?.children?.find((c: any) => c.id === menuPath[1])
    }
    return null
  }

  const getMenuTitle = () => {
    if (menuPath.length === 0) return "Wybierz kategorię"
    const parent = getParentItem()
    return parent ? parent.nazwa : "Specjalizacja"
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("search", searchQuery.trim())
    if (selectedExpertiseCategoryId) params.set("expertiseCategoryId", selectedExpertiseCategoryId)
    if (selectedType && selectedType !== "all") params.set("type", selectedType)

    if (geographicHierarchy === "voivodeships") {
      if (selectedVoivodeship) params.set("voivodeship", selectedVoivodeship)
    } else if (geographicHierarchy === "counties") {
      if (selectedCounty) params.set("county", selectedCounty)
    } else {
      if (selectedCity) params.set("city", selectedCity)
      if (selectedVoivodeship) params.set("voivodeship", selectedVoivodeship)
    }

    window.location.href = `/szukaj-prawnika?${params.toString()}`
  }

  // W jasnym motywie pasek musi być prawie kryjący: leży nad stale ciemnymi
  // sekcjami (hero na zdjęciu, landing /dla-prawnika), a przy 40% ciemne tło
  // przebijało i ciemny tekst nawigacji stawał się nieczytelny.
  return (
    <header className="fixed left-0 top-0 right-0 z-50 flex-shrink-0 backdrop-blur-md shadow-lg shadow-black/10 dark:shadow-black/70 top-bar-public bg-background/90 dark:bg-background/40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center relative" id="main-logo">
            <SiteLogo className="hidden lg:block min-w-[150px] min-w-[150px]" title="Przystąp do sprawy" width={200} height={50} />
            <Image className="lg:hidden min-w-[32px]" src="/images/mobile-logo.webp" alt="Logo" title="Przystąp do sprawy" width={53} height={45} style={{ width: "auto", height: "32px" }} />
          </Link>
          <div className="flex">
            {/* Navigation Menu */}
            <NavigationMenu className="hidden xl:flex">
              <NavigationMenuList className="flex lg:gap-2">
                {/* Szukaj / Zamknij Animated Button */}
                <NavigationMenuItem>
                  <AnimatePresence mode="wait">
                    {!searchFormOpen ? (
                      <motion.button
                        key="search-btn"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                        onClick={() => setSearchFormOpen(true)}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "flex items-center justify-center gap-2 bg-transparent hover:bg-background transition-colors lg:w-[108px]"
                        )}
                      >
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="hidden min-[1200px]:block">Szukaj</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        key="close-btn"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                        onClick={() => setSearchFormOpen(false)}
                        className="flex w-[108px] h-9 items-center justify-center rounded-md  bg-background text-foreground px-3 py-2 text-sm font-medium hover:bg-muted focus:outline-none transition-colors gap-2 shadow-lg shadow-black/10 dark:shadow-black/30"
                      >
                        <motion.div
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 220, damping: 15 }}
                        >
                          <X className="h-4 w-4 text-foreground/80" />
                        </motion.div>
                        <span className="text-neutral-700 select-none font-light">|</span>
                        <span>Zamknij</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </NavigationMenuItem>



                {/* Sprawy Firmowe - Mega Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "bg-transparent hover:bg-background",
                      isFirmoweActive && "text-primary font-semibold"
                    )}
                  >
                    Sprawy firmowe
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[800px] xl:w-[1080px] p-6 lg:p-8 bg-card max-h-[calc(100vh-5.5rem)] overflow-y-auto">
                      <div className="grid grid-cols-4">
                        {splitIntoColumns(firmoweCat, 4).map((column, columnIndex) => (
                          <div
                            key={columnIndex}
                            className={cn(
                              "space-y-5 px-5 first:pl-0 last:pr-0",
                              columnIndex > 0 && "border-l border-white/[0.08]"
                            )}
                          >
                            {column.map((category) => (
                              <div key={category.id} className="pb-5 border-b border-white/[0.08] last:border-b-0 last:pb-0">
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={`/kategorie/${category.slug}`}
                                    className={cn(
                                      "group/cat-title inline-flex items-center gap-1.5 font-semibold text-sm hover:text-primary mb-2.5 transition-colors text-neutral-800 dark:text-foreground",
                                      pathname === `/kategorie/${category.slug}` && "text-primary"
                                    )}
                                  >
                                    <span>{category.nazwa}</span>
                                    {showCategoryCounts && category._count?.lawFirms !== undefined && (
                                      <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-muted text-muted-foreground dark:text-muted-foreground group-hover/cat-title:bg-primary/15 group-hover/cat-title:text-primary transition-all duration-250 font-semibold border border-neutral-250/20 dark:border-border/30">
                                        {category._count.lawFirms}
                                      </span>
                                    )}
                                    <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1.5 group-hover/cat-title:opacity-100 group-hover/cat-title:translate-x-0 transition-all text-primary" />
                                  </Link>
                                </NavigationMenuLink>
                                {category.children && category.children.length > 0 && (
                                  <div className="border-l border-neutral-200/60 dark:border-border/60 pl-3.5 space-y-1.5 ml-0.5">
                                    {category.children.slice(0, 5).map((child) => (
                                      <NavigationMenuLink key={child.id} asChild>
                                        <Link
                                          href={`/kategorie/${category?.slug}/${child.slug}`}
                                          className={cn(
                                            "group/child-item flex items-center justify-between text-[13px] transition-all duration-300 hover:text-primary leading-relaxed relative pl-0 hover:pl-3 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary before:opacity-0 hover:before:opacity-100 before:scale-0 hover:before:scale-100 before:transition-all before:duration-300 w-full",
                                            pathname === `/kategorie/${category?.slug}/${child.slug}`
                                              ? "text-primary font-medium pl-3 before:opacity-100 before:scale-100"
                                              : "text-muted-foreground"
                                          )}
                                        >
                                          <span>{child.nazwa}</span>
                                          {showCategoryCounts && child._count?.lawFirms !== undefined && (
                                            <span className="text-sm text-muted-foreground/60 group-hover/child-item:text-primary/80 transition-colors ml-2 font-medium">
                                              ({child._count.lawFirms})
                                            </span>
                                          )}
                                        </Link>
                                      </NavigationMenuLink>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-border/80 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Potrzebujesz pomocy prawnej? Dodaj swoją sprawę na portalu.</span>
                        <NavigationMenuLink asChild>
                          <Link href="/kategorie" className="group/all text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                            Zobacz wszystkie kategorie <span className="translate-x-0 transition-transform group-hover/all:translate-x-1">→</span>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Sprawy Prywatne - Mega Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "bg-transparent hover:bg-background",
                      isPrywatneActive && "text-primary font-semibold"
                    )}
                  >
                    Sprawy prywatne
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[800px] xl:w-[1080px] p-6 lg:p-8 bg-card max-h-[calc(100vh-5.5rem)] overflow-y-auto">
                      <div className="grid grid-cols-4">
                        {splitIntoColumns(prywatneCat, 4).map((column, columnIndex) => (
                          <div
                            key={columnIndex}
                            className={cn(
                              "space-y-5 px-5 first:pl-0 last:pr-0",
                              columnIndex > 0 && "border-l border-white/[0.08]"
                            )}
                          >
                            {column.map((category) => (
                              <div key={category.id} className="pb-5 border-b border-white/[0.08] last:border-b-0 last:pb-0">
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={`/kategorie/${category.slug}`}
                                    className={cn(
                                      "group/cat-title inline-flex items-center gap-1.5 font-semibold text-sm hover:text-primary mb-2.5 transition-colors text-neutral-800 dark:text-foreground",
                                      pathname === `/kategorie/${category.slug}` && "text-primary"
                                    )}
                                  >
                                    <span>{category.nazwa}</span>
                                    {showCategoryCounts && category._count?.lawFirms !== undefined && (
                                      <span className="text-sm px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-muted text-muted-foreground dark:text-muted-foreground group-hover/cat-title:bg-primary/15 group-hover/cat-title:text-primary transition-all duration-250 font-semibold border border-neutral-250/20 dark:border-border/30">
                                        {category._count.lawFirms}
                                      </span>
                                    )}
                                    <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1.5 group-hover/cat-title:opacity-100 group-hover/cat-title:translate-x-0 transition-all text-primary" />
                                  </Link>
                                </NavigationMenuLink>
                                {category.children && category.children.length > 0 && (
                                  <div className="border-l border-neutral-200/60 dark:border-border/60 pl-3.5 space-y-1.5 ml-0.5">
                                    {category.children.slice(0, 5).map((child) => (
                                      <NavigationMenuLink key={child.id} asChild>
                                        <Link
                                          href={`/kategorie/${category?.slug}/${child.slug}`}
                                          className={cn(
                                            "group/child-item flex items-center justify-between text-[13px] transition-all duration-300 hover:text-primary leading-relaxed relative pl-0 hover:pl-3 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary before:opacity-0 hover:before:opacity-100 before:scale-0 hover:before:scale-100 before:transition-all before:duration-300 w-full",
                                            pathname === `/kategorie/${category?.slug}/${child.slug}`
                                              ? "text-primary font-medium pl-3 before:opacity-100 before:scale-100"
                                              : "text-muted-foreground"
                                          )}
                                        >
                                          <span>{child.nazwa}</span>
                                          {showCategoryCounts && child._count?.lawFirms !== undefined && (
                                            <span className="text-sm text-muted-foreground/60 group-hover/child-item:text-primary/80 transition-colors ml-2 font-medium">
                                              ({child._count.lawFirms})
                                            </span>
                                          )}
                                        </Link>
                                      </NavigationMenuLink>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-border/80 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Chcesz rozwiązać problem osobisty? Dodaj sprawę i otrzymaj oferty.</span>
                        <NavigationMenuLink asChild>
                          <Link href="/kategorie" className="group/all text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                            Zobacz wszystkie kategorie <span className="translate-x-0 transition-transform group-hover/all:translate-x-1">→</span>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuIndicator />
              </NavigationMenuList>
            </NavigationMenu>

            {/*
            Osobny NavigationMenu (własny Viewport) dla "Dlaczego warto" — współdzielony
            Viewport pozycjonuje się względem lewej krawędzi całego menu, a nie triggera,
            więc dwuelementowy dropdown wyświetlał się przy logo zamiast pod przyciskiem.
          */}
            <NavigationMenu className="hidden xl:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "bg-transparent hover:bg-background",
                      isDlaczegoWartoActive && "text-primary font-semibold"
                    )}
                  >
                    Dlaczego warto
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-[260px] p-2 bg-card">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/dla-prawnika"
                            className={cn(
                              "block rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:text-primary transition-colors",
                              isDlaPrawnikaActive && "text-primary"
                            )}
                          >
                            dla Prawnika i Eksperta
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/z-nami-wygrywasz"
                            className={cn(
                              "block rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:text-primary transition-colors",
                              isZNamiWygrywaszActive && "text-primary"
                            )}
                          >
                            dla Użytkownika
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          {/* Right Side - User Menu / Login & Hamburger */}
          <div className="flex items-center gap-2 min-[400px]:gap-3 md:gap-4">
            {isAuthenticated && userRole ? (
              <div className="flex items-center gap-2 min-[400px]:gap-3">
                {userRole === "CLIENT" && (
                  <>
                    <AddCaseButton
                      href="/dodaj-sprawe"
                      className="flex"
                      labelClassName="hidden min-[390px]:block"
                      iconClassName="min-[390px]:hidden"
                    />
                    <AddCaseButton
                      href="/panel-klienta/konsultacje/zapytaj"
                      label="Konsultacja online"
                      className="hidden lg:flex"
                    />
                  </>
                )}
                {(userRole === "CLIENT" || userRole === "LAW_FIRM") && (
                  <>
                    <NotificationBell />
                  </>
                )}
                <ThemeToggle className="hidden sm:inline-flex" />
                <UserMenu
                  userRole={userRole}
                  userName={userName}
                  userImage={customLogo || userImage}
                  punktySaldo={punktySaldo}
                  userId={userId}
                  showPoints={false}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <AddCaseButton href="/dodaj-sprawe" className="flex" />
                <AddCaseButton
                  href="/panel-klienta/konsultacje/zapytaj"
                  label="Konsultacja online"
                  className="hidden lg:flex"
                />
                <ThemeToggle className="hidden sm:inline-flex" />
                <Link href="/logowanie" className="hidden xl:flex">
                  <InteractiveHoverButton>Zaloguj</InteractiveHoverButton>
                </Link>
              </div>
            )}

            {/* Mobile Navigation Trigger */}
            <div className="xl:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-foreground/80 hover:text-foreground hover:bg-muted/50 cursor-pointer"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  side="right"
                  className="w-[300px] sm:w-[360px] bg-background border-border p-0 text-foreground flex flex-col justify-between overflow-hidden"
                >
                  <div className="flex h-16 items-center px-6 border-b border-border justify-between">
                    <Link href="/" className="flex items-center relative" onClick={() => setMobileMenuOpen(false)}>
                      <SiteLogo width={130} height={32} className="h-8 w-auto" />
                    </Link>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Action Buttons (Dodaj sprawę & Zaloguj się) */}
                    {!isAuthenticated && (
                      <div className="flex flex-col gap-3">
                        <AddCaseButton
                          href="/dodaj-sprawe"
                          className="w-full"
                          innerClassName="w-full h-11 justify-center text-base"
                          onClick={() => setMobileMenuOpen(false)}
                        />
                        <AddCaseButton
                          href="/panel-klienta/konsultacje/zapytaj"
                          label="Konsultacja online"
                          shortLabel="Konsultacja online"
                          className="w-full"
                          innerClassName="w-full h-11 justify-center text-base"
                          onClick={() => setMobileMenuOpen(false)}
                        />
                        <Link href="/logowanie" onClick={() => setMobileMenuOpen(false)} className="w-full">
                          <Button className="w-full cursor-pointer bg-primary hover:bg-primary-hover text-primary-foreground font-semibold h-11 border-0" size="lg">
                            Zaloguj się
                          </Button>
                        </Link>
                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">Motyw</p>
                            <p className="text-xs text-muted-foreground">Dopasuj wygląd aplikacji</p>
                          </div>
                          <ThemeToggle variant="segmented" />
                        </div>
                      </div>
                    )}

                    {/* Links & Accordions */}
                    <div className="space-y-4">


                      <Accordion type="single" collapsible className="w-full">
                        {/* Sprawy Firmowe Accordion */}
                        <AccordionItem value="firmowe" className="border-border">
                          <AccordionTrigger className={cn(
                            "py-2 text-base font-medium hover:no-underline text-foreground hover:text-primary transition-colors [&>svg]:text-muted-foreground [&>svg]:h-4 [&>svg]:w-4",
                            isFirmoweActive && "text-primary"
                          )}>
                            Sprawy firmowe
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4 pl-4 space-y-4">
                            {firmoweCat.map((category) => (
                              <div key={category.id} className="space-y-2">
                                <Link
                                  href={`/kategorie/${category.slug}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    "flex items-center justify-between font-semibold text-sm hover:text-primary transition-colors",
                                    pathname === `/kategorie/${category.slug}` ? "text-primary" : "text-neutral-350"
                                  )}
                                >
                                  <span>{category.nazwa}</span>
                                  {showCategoryCounts && category._count?.lawFirms !== undefined && (
                                    <span className="text-sm px-1.5 py-0.5 rounded bg-muted text-neutral-450 font-semibold border border-border">
                                      {category._count.lawFirms}
                                    </span>
                                  )}
                                </Link>
                                {category.children && category.children.length > 0 && (
                                  <div className="border-l border-border pl-3.5 space-y-2 ml-1">
                                    {category.children.slice(0, 4).map((child) => (
                                      <Link
                                        key={child.id}
                                        href={`/kategorie/${category.slug}/${child.slug}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                          "flex items-center justify-between text-xs hover:text-primary transition-colors",
                                          pathname === `/kategorie/${category.slug}/${child.slug}` ? "text-primary font-medium" : "text-muted-foreground"
                                        )}
                                      >
                                        <span>{child.nazwa}</span>
                                        {showCategoryCounts && child._count?.lawFirms !== undefined && (
                                          <span className="text-sm text-muted-foreground font-medium">
                                            ({child._count.lawFirms})
                                          </span>
                                        )}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            <Link
                              href="/kategorie"
                              onClick={() => setMobileMenuOpen(false)}
                              className="block pt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                              Zobacz wszystkie kategorie →
                            </Link>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Sprawy Prywatne Accordion */}
                        <AccordionItem value="prywatne" className="border-border">
                          <AccordionTrigger className={cn(
                            "py-2 text-base font-medium hover:no-underline text-foreground hover:text-primary transition-colors [&>svg]:text-muted-foreground [&>svg]:h-4 [&>svg]:w-4",
                            isPrywatneActive && "text-primary"
                          )}>
                            Sprawy prywatne
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4 pl-4 space-y-4">
                            {prywatneCat.map((category) => (
                              <div key={category.id} className="space-y-2">
                                <Link
                                  href={`/kategorie/${category.slug}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    "flex items-center justify-between font-semibold text-sm hover:text-primary transition-colors",
                                    pathname === `/kategorie/${category.slug}` ? "text-primary" : "text-neutral-350"
                                  )}
                                >
                                  <span>{category.nazwa}</span>
                                  {showCategoryCounts && category._count?.lawFirms !== undefined && (
                                    <span className="text-sm px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold border border-border">
                                      {category._count.lawFirms}
                                    </span>
                                  )}
                                </Link>
                                {category.children && category.children.length > 0 && (
                                  <div className="border-l border-border pl-3.5 space-y-2 ml-1">
                                    {category.children.slice(0, 4).map((child) => (
                                      <Link
                                        key={child.id}
                                        href={`/kategorie/${category.slug}/${child.slug}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                          "flex items-center justify-between text-xs hover:text-primary transition-colors",
                                          pathname === `/kategorie/${category.slug}/${child.slug}` ? "text-primary font-medium" : "text-muted-foreground"
                                        )}
                                      >
                                        <span>{child.nazwa}</span>
                                        {showCategoryCounts && child._count?.lawFirms !== undefined && (
                                          <span className="text-sm text-muted-foreground font-medium">
                                            ({child._count.lawFirms})
                                          </span>
                                        )}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            <Link
                              href="/kategorie"
                              onClick={() => setMobileMenuOpen(false)}
                              className="block pt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                              Zobacz wszystkie kategorie →
                            </Link>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Dlaczego warto Accordion */}
                        <AccordionItem value="dlaczego-warto" className="border-border">
                          <AccordionTrigger className={cn(
                            "py-2 text-base font-medium hover:no-underline text-foreground hover:text-primary transition-colors [&>svg]:text-muted-foreground [&>svg]:h-4 [&>svg]:w-4",
                            isDlaczegoWartoActive && "text-primary"
                          )}>
                            Dlaczego warto
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4 pl-4 space-y-3">
                            <Link
                              href="/dla-prawnika"
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "block text-sm hover:text-primary transition-colors",
                                isDlaPrawnikaActive ? "text-primary font-medium" : "text-muted-foreground"
                              )}
                            >
                              dla Prawnika i Eksperta
                            </Link>
                            <Link
                              href="/z-nami-wygrywasz"
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "block text-sm hover:text-primary transition-colors",
                                isZNamiWygrywaszActive ? "text-primary font-medium" : "text-muted-foreground"
                              )}
                            >
                              dla Użytkownika
                            </Link>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>



                      <Link
                        href="/o-nas"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block py-2 text-base font-medium transition-colors hover:text-primary",
                          isONasActive ? "text-primary font-semibold" : "text-foreground"
                        )}
                      >
                        O nas
                      </Link>
                    </div>
                  </div>

                  {/* Search inside Mobile Menu Footer */}
                  <div className="p-6 border-t border-border bg-background">
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      handleSearchSubmit(e)
                      setMobileMenuOpen(false)
                    }} className="space-y-3">
                      <div className="flex items-center gap-2.5 px-4 bg-background rounded-lg h-11 border border-border focus-within:border-border transition-colors">
                        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="Szukaj..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-muted-foreground text-foreground focus:ring-0"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold h-11 rounded-lg transition-colors cursor-pointer text-sm border-0">
                        Wyszukaj
                      </Button>
                    </form>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Search Form - Slide Down */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${searchFormOpen ? "max-h-[500px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
            }`}
        >
          <div className="border-t border-neutral-200/10 mt-1 pt-4">
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 p-0 text-foreground overflow-hidden">

              <form onSubmit={handleSearchSubmit} className="w-max m-auto flex flex-col md:flex-row gap-3 items-stretch z-3">
                {/* Field 0: Fraza wyszukiwania */}
                <div className="flex flex-1 items-center gap-2.5 px-4 bg-card rounded-lg h-12 border border-border focus-within:border-border transition-colors w-full md:w-64">
                  <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Wpisz frazę..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-muted-foreground text-foreground/80 focus:ring-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="hover:text-red-400 text-muted-foreground p-0.5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Field 1: Kogo szukasz? */}
                <Popover open={expertiseOpen} onOpenChange={setExpertiseOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-2.5 px-4 bg-card rounded-lg h-12 border border-border hover:bg-card transition-colors text-left outline-none cursor-pointer w-full md:w-64"
                    >
                      <IdCard className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate flex-grow text-foreground/80">
                        {selectedExpertiseCategoryName || "Kogo szukasz?"}
                      </span>
                      {selectedExpertiseCategoryName && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedExpertiseCategoryName("")
                            setSelectedExpertiseCategoryId("")
                          }}
                          className="hover:text-red-400 text-muted-foreground p-0.5"
                        >
                          <X className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 sm:w-80 p-0 bg-background border-border text-foreground z-50 shadow-xl shadow-black/10 dark:shadow-black/80" align="start">
                    <div className="flex flex-col">
                      {/* Header with back button */}
                      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-card">
                        {menuPath.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setMenuPath(menuPath.slice(0, -1))}
                            className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer border-0 bg-transparent p-0"
                          >
                            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                            Powrót
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-semibold">
                            Wybierz kategorię
                          </span>
                        )}
                        <span className="text-xs font-medium text-foreground/80 truncate max-w-[150px]">
                          {getMenuTitle()}
                        </span>
                      </div>

                      {/* Selectable categories list */}
                      <div className="max-h-64 overflow-y-auto p-1 space-y-0.5">
                        {/* Option to select parent category if we are inside one */}
                        {menuPath.length > 0 && getParentItem() && (
                          <button
                            type="button"
                            onClick={() => {
                              const parent = getParentItem()
                              if (parent) {
                                setSelectedExpertiseCategoryId(parent.id)
                                setSelectedExpertiseCategoryName(parent.nazwa)
                                setExpertiseOpen(false)
                              }
                            }}
                            className="w-full text-left px-3 py-2 text-xs rounded-md text-teal-400 hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer font-semibold border-0 bg-transparent"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Wybierz całe "{getParentItem()?.nazwa}"
                          </button>
                        )}

                        {getVisibleCategories().map((cat: any) => {
                          const hasChildren = cat.children && cat.children.length > 0
                          const isSelected = selectedExpertiseCategoryId === cat.id

                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                if (hasChildren) {
                                  setMenuPath([...menuPath, cat.id])
                                } else {
                                  setSelectedExpertiseCategoryId(cat.id)
                                  setSelectedExpertiseCategoryName(cat.nazwa)
                                  setExpertiseOpen(false)
                                }
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between cursor-pointer border-0 bg-transparent text-white hover:bg-primary",
                                isSelected && "bg-muted text-teal-400 font-semibold"
                              )}
                            >
                              <span className="truncate">{cat.nazwa}</span>
                              {hasChildren ? (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                isSelected && <Check className="h-4 w-4 text-teal-400" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Field 2: Lokalizacja (tryb zależny od geographicHierarchy) */}
                {geographicHierarchy === "voivodeships" ? (
                  <Popover open={voivodeshipDropdownOpen} onOpenChange={setVoivodeshipDropdownOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex flex-1 items-center gap-2.5 px-4 bg-card rounded-lg h-12 border border-border hover:bg-card transition-colors text-left outline-none cursor-pointer"
                      >
                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate flex-grow text-foreground/80">
                          {selectedVoivodeshipName || "Województwo"}
                        </span>
                        {selectedVoivodeshipName && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedVoivodeshipName("")
                              setSelectedVoivodeship("")
                            }}
                            className="hover:text-red-400 text-muted-foreground p-0.5"
                          >
                            <X className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-1 bg-background border-border text-foreground" align="start">
                      <div className="max-h-64 overflow-y-auto space-y-0.5">
                        {voivodeshipsList.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setSelectedVoivodeshipName(v.nazwa)
                              setSelectedVoivodeship(v.slug)
                              setVoivodeshipDropdownOpen(false)
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between cursor-pointer border-0",
                              selectedVoivodeship === v.slug
                                ? "bg-muted text-white hover:bg-primary"
                                : "text-foreground/80 hover:bg-primary hover:text-white bg-transparent"
                            )}
                          >
                            <span>{v.nazwa}</span>
                            {selectedVoivodeship === v.slug && <Check className="h-4 w-4 text-teal-400" />}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : geographicHierarchy === "counties" ? (
                  <Popover open={countyOpen} onOpenChange={setCountyOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex flex-1 items-center gap-2.5 px-4 bg-card rounded-lg h-12 border border-border hover:bg-card transition-colors text-left outline-none cursor-pointer"
                      >
                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate flex-grow text-foreground/80">
                          {selectedCounty || "Powiat"}
                        </span>
                        {selectedCounty && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCounty("")
                            }}
                            className="hover:text-red-400 text-muted-foreground p-0.5"
                          >
                            <X className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 bg-background border-border text-foreground" align="start">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Wpisz nazwę powiatu</p>
                        <input
                          type="text"
                          autoFocus
                          value={countyInput}
                          onChange={(e) => setCountyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && countyInput.trim()) {
                              setSelectedCounty(countyInput.trim())
                              setCountyOpen(false)
                              setCountyInput("")
                            }
                          }}
                          placeholder="np. powiat warszawski"
                          className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (countyInput.trim()) {
                              setSelectedCounty(countyInput.trim())
                              setCountyOpen(false)
                              setCountyInput("")
                            }
                          }}
                          className="w-full py-1.5 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
                        >
                          Wybierz
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex flex-1 items-center gap-2.5 px-4 bg-card rounded-lg h-12 border border-border hover:bg-card transition-colors text-left outline-none cursor-pointer"
                      >
                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate flex-grow text-foreground/80">
                          {selectedCity || "Lokalizacja"}
                        </span>
                        {selectedCity && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCity("")
                              setSelectedVoivodeship("")
                            }}
                            className="hover:text-red-400 text-muted-foreground p-0.5"
                          >
                            <X className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0 bg-card border-border text-foreground" align="start">
                      <Command className="bg-background text-foreground" shouldFilter={false}>
                        <CommandInput
                          placeholder="Wyszukaj miasto..."
                          value={locationSearch}
                          onValueChange={setLocationSearch}
                          className="text-foreground bg-transparent border-border"
                        />
                        <CommandList className="max-h-60 overflow-y-auto">
                          {isLoadingCities && (
                            <div className="text-neutral-450 py-3 text-center text-xs">Wyszukiwanie...</div>
                          )}
                          {!isLoadingCities && locationSearch.trim().length < 2 && (
                            <div className="text-neutral-450 py-3 text-center text-xs px-3">
                              Wpisz co najmniej 2 znaki...
                            </div>
                          )}
                          {!isLoadingCities && locationSearch.trim().length >= 2 && cities.length === 0 && (
                            <div className="text-neutral-450 py-3 text-center text-xs">Nie znaleziono miasta.</div>
                          )}
                          <CommandGroup>
                            {cities.map((city) => {
                              const matchedPostal = city.postalCodes?.find((p: any) =>
                                p.code.toLowerCase().includes(locationSearch.trim().toLowerCase())
                              )
                              const displayValue = matchedPostal
                                ? `${city.nazwa} (${matchedPostal.code})`
                                : city.nazwa

                              return (
                                <CommandItem
                                  key={city.id}
                                  value={city.nazwa}
                                  onSelect={() => {
                                    if (city.nazwa === selectedCity) {
                                      setSelectedCity("")
                                      setSelectedVoivodeship("")
                                    } else {
                                      setSelectedCity(city.nazwa)
                                      setSelectedVoivodeship(city.voivodeship?.slug || "")
                                    }
                                    setLocationOpen(false)
                                  }}
                                  className="text-foreground hover:bg-muted cursor-pointer flex items-center justify-between gap-2 py-2 px-3 text-sm rounded-md data-[selected=true]:bg-muted"
                                >
                                  <div className="flex items-center gap-2">
                                    <Check
                                      className={cn(
                                        "h-4 w-4 text-teal-400",
                                        selectedCity === city.nazwa ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span>{displayValue}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground ml-2 text-right">
                                    {city.voivodeship?.nazwa}
                                  </span>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Field 3: Typ sprawy */}
                <Popover open={typeOpen} onOpenChange={setTypeOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-between gap-2.5 px-4 bg-card rounded-lg h-12 border border-border hover:bg-card transition-colors text-left outline-none cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <List className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate text-foreground/80">
                          {selectedType === "OSOBA_PRYWATNA"
                            ? "sprawa prywatna"
                            : selectedType === "FIRMA"
                              ? "sprawa firmowa"
                              : "Typ sprawy"}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1 bg-background border-border text-foreground" align="start">
                    <div className="space-y-0.5">
                      {[
                        { value: "all", label: "Wszystkie typy" },
                        { value: "OSOBA_PRYWATNA", label: "sprawa prywatna" },
                        { value: "FIRMA", label: "sprawa firmowa" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedType(opt.value)
                            setTypeOpen(false)
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between cursor-pointer border-0",
                            selectedType === opt.value
                              ? "bg-muted text-foreground"
                              : "text-foreground/80 hover:bg-primary hover:text-white bg-transparent"
                          )}
                        >
                          <span>{opt.label}</span>
                          {selectedType === opt.value && <Check className="h-4 w-4 text-teal-400" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 h-12 rounded-lg transition-colors border-0 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  Wyszukaj
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
