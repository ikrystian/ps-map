"use client"

import { AddCaseButton } from "@/components/AddCaseButton"
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
import UserMenu from "@/components/UserMenu"
import { NotificationBell } from "@/components/NotificationBell"
import { cn } from "@/lib/utils"
import type { CategoryWithChildren } from "@/types/categories"
import type { BlogCategory } from "@/types"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, ChevronRight, IdCard, List, MapPin, Menu, Search, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { InteractiveHoverButton } from "./ui/interactive-hover-button"
import { BlogPost } from '@/types/blog';

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
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([])
  const [latestPost, setLatestPost] = useState<BlogPost | null>(null)
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
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

  // Fetch blog categories and latest post on mount
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const catResponse = await fetch("/api/blog/categories")
        if (catResponse.ok) {
          const catData = await catResponse.json()
          setBlogCategories(catData.slice(0, 4))
        }

        const postResponse = await fetch("/api/blog/posts?limit=4")
        if (postResponse.ok) {
          const postData = await postResponse.json()
          if (postData.posts && postData.posts.length > 0) {
            setLatestPost(postData.posts[0])
            setRecentPosts(postData.posts.slice(1, 4))
          }
        }
      } catch (error) {
        console.error("Error fetching blog data:", error)
      }
    }

    fetchBlogData()
  }, [])

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

  const isDlaPrawnikaActive = pathname.startsWith("/dla-prawnika")
  const isZNamiWygrywaszActive = pathname === "/z-nami-wygrywasz"
  const isBlogActive = pathname.startsWith("/blog")
  const isONasActive = pathname === "/o-nas"

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

  return (
    <header className="fixed left-0 top-0 right-0 z-50 flex-shrink-0 backdrop-blur-md shadow-lg shadow-black/70 top-bar-public bg-[#141414]/40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center relative" id="main-logo">
            <Image className="block min-w-[150px] sm:hidden lg:block min-w-[150px]" src="/logo.svg" alt="Logo" title="Przystąp do sprawy" width={200} height={50} />
            <Image className="hidden sm:block lg:hidden min-w-[32px]" src="/images/mobile-logo.webp" alt="Logo" title="Przystąp do sprawy" width={53} height={45} style={{ width: "auto", height: "32px" }} />
            <span className="hidden sm:block self-end ml-1.5 lg:ml-0 lg:absolute lg:-right-3 lg:-bottom-3 text-primary font-bold text-sm lg:text-base" id="env">{process.env.ENV}</span>
          </Link>

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
                        "flex items-center justify-center gap-2 bg-transparent hover:bg-[#121212] transition-colors lg:w-[108px]"
                      )}
                    >
                      <Search className="h-4 w-4 text-neutral-400" />
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
                      className="flex w-[108px] h-9 items-center justify-center rounded-md  bg-[#141414] text-neutral-200 px-3 py-2 text-sm font-medium hover:bg-black focus:outline-none transition-colors gap-2 shadow-lg shadow-black/30"
                    >
                      <motion.div
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 220, damping: 15 }}
                      >
                        <X className="h-4 w-4 text-neutral-300" />
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
                    "bg-transparent hover:bg-[#121212]",
                    isFirmoweActive && "text-primary font-semibold"
                  )}
                >
                  Sprawy firmowe
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[800px] xl:w-[1080px] p-6 lg:p-8 bg-[#212121] max-h-[calc(100vh-5.5rem)] overflow-y-auto">
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
                                    "group/cat-title inline-flex items-center gap-1.5 font-semibold text-sm hover:text-primary mb-2.5 transition-colors text-neutral-800 dark:text-neutral-100",
                                    pathname === `/kategorie/${category.slug}` && "text-primary"
                                  )}
                                >
                                  <span>{category.nazwa}</span>
                                  {showCategoryCounts && category._count?.lawFirms !== undefined && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 group-hover/cat-title:bg-primary/15 group-hover/cat-title:text-primary transition-all duration-250 font-semibold border border-neutral-250/20 dark:border-neutral-700/30">
                                      {category._count.lawFirms}
                                    </span>
                                  )}
                                  <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1.5 group-hover/cat-title:opacity-100 group-hover/cat-title:translate-x-0 transition-all text-primary" />
                                </Link>
                              </NavigationMenuLink>
                              {category.children && category.children.length > 0 && (
                                <div className="border-l border-neutral-200/60 dark:border-neutral-800/60 pl-3.5 space-y-1.5 ml-0.5">
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
                    <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
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
                    "bg-transparent hover:bg-[#121212]",
                    isPrywatneActive && "text-primary font-semibold"
                  )}
                >
                  Sprawy prywatne
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[800px] xl:w-[1080px] p-6 lg:p-8 bg-[#212121] max-h-[calc(100vh-5.5rem)] overflow-y-auto">
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
                                    "group/cat-title inline-flex items-center gap-1.5 font-semibold text-sm hover:text-primary mb-2.5 transition-colors text-neutral-800 dark:text-neutral-100",
                                    pathname === `/kategorie/${category.slug}` && "text-primary"
                                  )}
                                >
                                  <span>{category.nazwa}</span>
                                  {showCategoryCounts && category._count?.lawFirms !== undefined && (
                                    <span className="text-sm px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 group-hover/cat-title:bg-primary/15 group-hover/cat-title:text-primary transition-all duration-250 font-semibold border border-neutral-250/20 dark:border-neutral-700/30">
                                      {category._count.lawFirms}
                                    </span>
                                  )}
                                  <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1.5 group-hover/cat-title:opacity-100 group-hover/cat-title:translate-x-0 transition-all text-primary" />
                                </Link>
                              </NavigationMenuLink>
                              {category.children && category.children.length > 0 && (
                                <div className="border-l border-neutral-200/60 dark:border-neutral-800/60 pl-3.5 space-y-1.5 ml-0.5">
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
                    <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
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


              {/* Blog - Mega Menu */}
              <NavigationMenuItem >
                <NavigationMenuTrigger
                  className={cn(
                    "bg-transparent hover:bg-[#121212] hidden lg:flex",
                    isBlogActive && "text-primary font-semibold"
                  )}
                >
                  Blog
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[700px] xl:w-[1000px] p-6 bg-[#212121] text-white max-h-[calc(100vh-5.5rem)] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      {/* Left Column: Categories and Topics */}
                      <div className="md:col-span-7 xl:col-span-5 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
                            Poradniki i kategorie
                          </h4>

                          {/* Grid of categories & top topics */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                            {blogCategories.length > 0 ? (
                              blogCategories.map((category) => (
                                <NavigationMenuLink key={category.id} asChild>
                                  <Link
                                    href={`/blog?category=${category.slug}`}
                                    className="group/blog-cat flex flex-col gap-0.5"
                                  >
                                    <span className="text-sm font-semibold text-neutral-100 group-hover/blog-cat:text-primary transition-colors flex items-center gap-1">
                                      {category.nazwa}
                                      <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover/blog-cat:opacity-100 group-hover/blog-cat:translate-x-0 transition-all text-primary" />
                                    </span>
                                    {category.opis && (
                                      <span className="text-[11px] text-neutral-400 line-clamp-1 font-light leading-snug">
                                        {category.opis}
                                      </span>
                                    )}
                                  </Link>
                                </NavigationMenuLink>
                              ))
                            ) : (
                              <>
                                <NavigationMenuLink asChild>
                                  <Link href="/blog" className="group/blog-cat flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-neutral-100 group-hover/blog-cat:text-primary transition-colors flex items-center gap-1">
                                      Porady Prawne
                                      <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover/blog-cat:opacity-100 group-hover/blog-cat:translate-x-0 transition-all text-primary" />
                                    </span>
                                    <span className="text-[11px] text-neutral-405 font-light">
                                      Artykuły i porady z różnych dziedzin prawa
                                    </span>
                                  </Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                  <Link href="/blog" className="group/blog-cat flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-neutral-100 group-hover/blog-cat:text-primary transition-colors flex items-center gap-1">
                                      Prawo w Biznesie
                                      <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover/blog-cat:opacity-100 group-hover/blog-cat:translate-x-0 transition-all text-primary" />
                                    </span>
                                    <span className="text-[11px] text-neutral-405 font-light">
                                      Wskazówki prawne dla przedsiębiorców
                                    </span>
                                  </Link>
                                </NavigationMenuLink>
                              </>
                            )}

                            <div className="col-span-2 my-2 border-t border-neutral-800/80 pt-3">
                              <h5 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2.5">
                                Popularne zagadnienia
                              </h5>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                {[
                                  { label: "Rozwód i alimenty", search: "rozwód" },
                                  { label: "Kredyty frankowe", search: "frankowe" },
                                  { label: "Prawo pracy", search: "pracy" },
                                  { label: "Odszkodowania", search: "odszkodowanie" },
                                ].map((topic, i) => (
                                  <NavigationMenuLink key={i} asChild>
                                    <Link
                                      href={`/blog?search=${encodeURIComponent(topic.search)}`}
                                      className="group/topic-item flex items-center gap-1 text-[13px] text-neutral-300 hover:text-primary transition-colors font-medium"
                                    >
                                      <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover/topic-item:bg-primary transition-colors" />
                                      <span>{topic.label}</span>
                                    </Link>
                                  </NavigationMenuLink>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-800/60">
                          <NavigationMenuLink asChild>
                            <Link href="/blog" className="group/all-blog text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                              Wszystkie artykuły i porady <span className="translate-x-0 transition-transform group-hover/all-blog:translate-x-1">→</span>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>

                      {/* Middle Column: Recent Articles */}
                      <div className="hidden xl:flex xl:col-span-3 flex-col">
                        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
                          Najnowsze artykuły
                        </h4>
                        {recentPosts.length > 0 ? (
                          <div className="flex flex-col gap-4">
                            {recentPosts.map((post) => (
                              <NavigationMenuLink key={post.id} asChild>
                                <Link
                                  href={`/blog/${post.slug}`}
                                  className="group/recent-post flex flex-col gap-1 border-b border-neutral-800/60 pb-3.5 last:border-b-0"
                                >
                                  <span className="text-[13px] font-medium text-neutral-100 group-hover/recent-post:text-primary transition-colors leading-snug line-clamp-2">
                                    {post.tytul}
                                  </span>
                                  <span className="text-[11px] text-neutral-500 font-light flex items-center gap-1.5">
                                    {post.category?.nazwa && (
                                      <span className="text-primary/80 font-medium">{post.category.nazwa}</span>
                                    )}
                                    {post.dataPublikacji && (
                                      <span>
                                        {new Date(post.dataPublikacji).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" })}
                                      </span>
                                    )}
                                  </span>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[12px] text-neutral-500 font-light leading-relaxed">
                            Wkrótce pojawią się tu nowe artykuły i porady naszych ekspertów.
                          </p>
                        )}
                      </div>

                      {/* Right Column: Featured Banner */}
                      <div className="md:col-span-5 xl:col-span-4">
                        {latestPost ? (
                          <Link href={`/blog/${latestPost.slug}`} className="group/featured-card block h-full">
                            <div className="relative h-full min-h-[200px] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl transition-all duration-300 group-hover/featured-card:border-primary/30 flex flex-col justify-end p-4">
                              {latestPost.obrazekWyrozniajacy ? (
                                <img
                                  src={latestPost.obrazekWyrozniajacy}
                                  alt={latestPost.tytul}
                                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/featured-card:scale-105"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#0da192]/20 via-neutral-950 to-neutral-900" />
                              )}

                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 transition-opacity duration-300" />

                              <div className="relative z-10 text-white flex flex-col h-full justify-between">
                                <span className="text-[10px] px-2 py-0.5 rounded bg-[#0da192] text-white font-semibold tracking-wider uppercase w-fit mb-4">
                                  Najnowszy wpis
                                </span>
                                <div>
                                  <h4 className="font-semibold text-sm leading-tight text-white mb-2 line-clamp-2 group-hover/featured-card:text-primary transition-colors">
                                    {latestPost.tytul}
                                  </h4>
                                  <span className="text-[11px] text-primary group-hover/featured-card:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                                    Czytaj artykuł <ChevronRight className="h-3 w-3" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <Link href="/blog" className="group/fallback-card block h-full">
                            <div className="relative h-full min-h-[220px] overflow-hidden rounded-xl border border-neutral-800 bg-gradient-to-br from-[#0da192]/20 via-neutral-950 to-neutral-900 shadow-xl transition-all duration-300 group-hover/fallback-card:border-primary/30 flex flex-col justify-between p-5">
                              <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#0da192]/10 rounded-full blur-2xl group-hover/fallback-card:bg-[#0da192]/20 transition-all duration-500" />

                              <div className="relative z-10 flex flex-col gap-1.5">
                                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">
                                  Baza Wiedzy
                                </span>
                                <h4 className="font-playfair font-semibold text-base text-neutral-100 group-hover/fallback-card:text-white transition-colors leading-snug">
                                  Ekspercka wiedza w zasięgu ręki
                                </h4>
                                <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                                  Dowiedz się więcej o swoich prawach i obowiązkach z artykułów pisanych przez profesjonalistów.
                                </p>
                              </div>

                              <div className="relative z-10">
                                <span className="text-xs font-semibold text-white group-hover/fallback-card:text-primary transition-colors flex items-center gap-1">
                                  Przejdź do bloga
                                  <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/fallback-card:translate-x-1" />
                                </span>
                              </div>
                            </div>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>


              {/* Dla prawnika */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/dla-prawnika"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent hover:bg-[#121212]",
                      isDlaPrawnikaActive && "text-primary font-semibold"
                    )}
                  >
                    Dla prawnika
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/z-nami-wygrywasz" className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent hover:bg-[#121212]",
                    isZNamiWygrywaszActive && "text-primary font-semibold"
                  )}>
                    Z nami wygrywasz
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>


              <NavigationMenuIndicator />
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side - User Menu / Login & Hamburger */}
          <div className="flex items-center gap-2 min-[400px]:gap-3 md:gap-4">
            {isAuthenticated && userRole ? (
              <div className="flex items-center gap-2 min-[400px]:gap-3">
                {userRole === "CLIENT" && (
                  <AddCaseButton
                    href="/panel-klienta/sprawy/dodaj"
                    className="flex"
                    labelClassName="hidden min-[390px]:block"
                    iconClassName="min-[390px]:hidden"
                  />
                )}
                {(userRole === "CLIENT" || userRole === "LAW_FIRM") && (
                  <>
                    <NotificationBell />
                  </>
                )}
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
                <AddCaseButton href="/panel-klienta/sprawy/dodaj" className="flex" />
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
                    className="h-10 w-10 text-neutral-300 hover:text-white hover:bg-neutral-800/50 cursor-pointer"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  side="right"
                  className="w-[300px] sm:w-[360px] bg-[#141414] border-neutral-850 p-0 text-white flex flex-col justify-between overflow-hidden"
                >
                  <div className="flex h-16 items-center px-6 border-b border-neutral-800 justify-between">
                    <Link href="/" className="flex items-center relative" onClick={() => setMobileMenuOpen(false)}>
                      <Image src="/logo.svg" alt="Logo" width={130} height={32} style={{ width: "auto", height: "32px" }} />
                    </Link>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Action Buttons (Dodaj sprawę & Zaloguj się) */}
                    {!isAuthenticated && (
                      <div className="flex flex-col gap-3">
                        <AddCaseButton
                          href="/panel-klienta/sprawy/dodaj"
                          className="w-full"
                          innerClassName="w-full h-11 justify-center text-base"
                          onClick={() => setMobileMenuOpen(false)}
                        />
                        <Link href="/logowanie" onClick={() => setMobileMenuOpen(false)} className="w-full">
                          <Button className="w-full cursor-pointer bg-teal-600 hover:bg-teal-700 text-white font-semibold h-11 border-0" size="lg">
                            Zaloguj się
                          </Button>
                        </Link>
                      </div>
                    )}

                    {/* Links & Accordions */}
                    <div className="space-y-4">


                      <Accordion type="single" collapsible className="w-full">
                        {/* Sprawy Firmowe Accordion */}
                        <AccordionItem value="firmowe" className="border-neutral-800">
                          <AccordionTrigger className={cn(
                            "py-2 text-base font-medium hover:no-underline text-neutral-200 hover:text-primary transition-colors [&>svg]:text-neutral-400 [&>svg]:h-4 [&>svg]:w-4",
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
                                    <span className="text-sm px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-450 font-semibold border border-neutral-700">
                                      {category._count.lawFirms}
                                    </span>
                                  )}
                                </Link>
                                {category.children && category.children.length > 0 && (
                                  <div className="border-l border-neutral-800 pl-3.5 space-y-2 ml-1">
                                    {category.children.slice(0, 4).map((child) => (
                                      <Link
                                        key={child.id}
                                        href={`/kategorie/${category.slug}/${child.slug}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                          "flex items-center justify-between text-xs hover:text-primary transition-colors",
                                          pathname === `/kategorie/${category.slug}/${child.slug}` ? "text-primary font-medium" : "text-neutral-400"
                                        )}
                                      >
                                        <span>{child.nazwa}</span>
                                        {showCategoryCounts && child._count?.lawFirms !== undefined && (
                                          <span className="text-sm text-neutral-500 font-medium">
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
                        <AccordionItem value="prywatne" className="border-neutral-800">
                          <AccordionTrigger className={cn(
                            "py-2 text-base font-medium hover:no-underline text-neutral-200 hover:text-primary transition-colors [&>svg]:text-neutral-400 [&>svg]:h-4 [&>svg]:w-4",
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
                                    <span className="text-sm px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-semibold border border-neutral-700">
                                      {category._count.lawFirms}
                                    </span>
                                  )}
                                </Link>
                                {category.children && category.children.length > 0 && (
                                  <div className="border-l border-neutral-800 pl-3.5 space-y-2 ml-1">
                                    {category.children.slice(0, 4).map((child) => (
                                      <Link
                                        key={child.id}
                                        href={`/kategorie/${category.slug}/${child.slug}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                          "flex items-center justify-between text-xs hover:text-primary transition-colors",
                                          pathname === `/kategorie/${category.slug}/${child.slug}` ? "text-primary font-medium" : "text-neutral-400"
                                        )}
                                      >
                                        <span>{child.nazwa}</span>
                                        {showCategoryCounts && child._count?.lawFirms !== undefined && (
                                          <span className="text-sm text-neutral-500 font-medium">
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
                      </Accordion>



                      <Link
                        href="/blog"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block py-2 text-base font-medium transition-colors hover:text-primary",
                          isBlogActive ? "text-primary font-semibold" : "text-neutral-200"
                        )}
                      >
                        Aktualności
                      </Link>

                      <Link
                        href="/dla-prawnika"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block py-2 text-base font-medium transition-colors hover:text-primary",
                          isDlaPrawnikaActive ? "text-primary font-semibold" : "text-neutral-200"
                        )}
                      >
                        Dla prawnika
                      </Link>

                      <Link
                        href="/o-nas"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block py-2 text-base font-medium transition-colors hover:text-primary",
                          isONasActive ? "text-primary font-semibold" : "text-neutral-200"
                        )}
                      >
                        O nas
                      </Link>
                      {
                        <Link
                          href="/z-nami-wygrywasz"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "block py-2 text-base font-medium transition-colors hover:text-primary",
                            isZNamiWygrywaszActive ? "text-primary font-semibold" : "text-neutral-200"
                          )}
                        >
                          Z nami wygrywasz
                        </Link>}
                    </div>
                  </div>

                  {/* Search inside Mobile Menu Footer */}
                  <div className="p-6 border-t border-neutral-800 bg-[#101010]">
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      handleSearchSubmit(e)
                      setMobileMenuOpen(false)
                    }} className="space-y-3">
                      <div className="flex items-center gap-2.5 px-4 bg-[#20201d] rounded-lg h-11 border border-neutral-800 focus-within:border-neutral-700 transition-colors">
                        <Search className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="Szukaj..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-neutral-500 text-white focus:ring-0"
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
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 p-0 text-white overflow-hidden">

              <form onSubmit={handleSearchSubmit} className="w-max m-auto flex flex-col md:flex-row gap-3 items-stretch z-3">
                {/* Field 0: Fraza wyszukiwania */}
                <div className="flex flex-1 items-center gap-2.5 px-4 bg-card rounded-lg h-12 border border-neutral-800 focus-within:border-neutral-700 transition-colors w-full md:w-64">
                  <Search className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Wpisz frazę..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-neutral-500 text-neutral-300 focus:ring-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="hover:text-red-400 text-neutral-400 p-0.5"
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
                      className="flex flex-1 items-center gap-2.5 px-4 bg-card rounded-lg h-12 border border-neutral-800 hover:bg-[#282825] transition-colors text-left outline-none cursor-pointer w-full md:w-64"
                    >
                      <IdCard className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                      <span className="text-sm truncate flex-grow text-neutral-300">
                        {selectedExpertiseCategoryName || "Kogo szukasz?"}
                      </span>
                      {selectedExpertiseCategoryName && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedExpertiseCategoryName("")
                            setSelectedExpertiseCategoryId("")
                          }}
                          className="hover:text-red-400 text-neutral-400 p-0.5"
                        >
                          <X className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 sm:w-80 p-0 bg-[#20201d] border-neutral-800 text-white z-50 shadow-xl shadow-black/80" align="start">
                    <div className="flex flex-col">
                      {/* Header with back button */}
                      <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-800 bg-[#161614]">
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
                          <span className="text-xs text-neutral-400 font-semibold">
                            Wybierz kategorię
                          </span>
                        )}
                        <span className="text-xs font-medium text-neutral-300 truncate max-w-[150px]">
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
                            className="w-full text-left px-3 py-2 text-xs rounded-md text-teal-400 hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer font-semibold border-0 bg-transparent"
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
                                "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between cursor-pointer border-0 bg-transparent text-white hover:bg-neutral-800/80",
                                isSelected && "bg-neutral-800 text-teal-400 font-semibold"
                              )}
                            >
                              <span className="truncate">{cat.nazwa}</span>
                              {hasChildren ? (
                                <ChevronRight className="h-4 w-4 text-neutral-500" />
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
                        className="flex flex-1 items-center gap-2.5 px-4 bg-card rounded-lg h-12 border border-neutral-800 hover:bg-[#282825] transition-colors text-left outline-none cursor-pointer"
                      >
                        <MapPin className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm truncate flex-grow text-neutral-300">
                          {selectedVoivodeshipName || "Województwo"}
                        </span>
                        {selectedVoivodeshipName && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedVoivodeshipName("")
                              setSelectedVoivodeship("")
                            }}
                            className="hover:text-red-400 text-neutral-400 p-0.5"
                          >
                            <X className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-1 bg-[#20201d] border-neutral-800 text-white" align="start">
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
                                ? "bg-neutral-800 text-white"
                                : "text-neutral-300 hover:bg-neutral-800/50 hover:text-white bg-transparent"
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
                        className="flex flex-1 items-center gap-2.5 px-4 bg-card rounded-lg h-12 border border-neutral-800 hover:bg-[#282825] transition-colors text-left outline-none cursor-pointer"
                      >
                        <MapPin className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm truncate flex-grow text-neutral-300">
                          {selectedCounty || "Powiat"}
                        </span>
                        {selectedCounty && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCounty("")
                            }}
                            className="hover:text-red-400 text-neutral-400 p-0.5"
                          >
                            <X className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 bg-[#20201d] border-neutral-800 text-white" align="start">
                      <div className="space-y-2">
                        <p className="text-xs text-neutral-400">Wpisz nazwę powiatu</p>
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
                          className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                        className="flex flex-1 items-center gap-2.5 px-4 bg-card rounded-lg h-12 border border-neutral-800 hover:bg-[#282825] transition-colors text-left outline-none cursor-pointer"
                      >
                        <MapPin className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm truncate flex-grow text-neutral-300">
                          {selectedCity || "Lokalizacja"}
                        </span>
                        {selectedCity && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCity("")
                              setSelectedVoivodeship("")
                            }}
                            className="hover:text-red-400 text-neutral-400 p-0.5"
                          >
                            <X className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0 bg-card border-neutral-800 text-white" align="start">
                      <Command className="bg-[#20201d] text-white" shouldFilter={false}>
                        <CommandInput
                          placeholder="Wyszukaj miasto..."
                          value={locationSearch}
                          onValueChange={setLocationSearch}
                          className="text-white bg-transparent border-neutral-800"
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
                                  className="text-white hover:bg-neutral-800 cursor-pointer flex items-center justify-between gap-2 py-2 px-3 text-sm rounded-md data-[selected=true]:bg-neutral-800"
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
                                  <span className="text-xs text-neutral-400 ml-2 text-right">
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
                      className="flex flex-1 items-center justify-between gap-2.5 px-4 bg-card rounded-lg h-12 border border-neutral-800 hover:bg-[#282825] transition-colors text-left outline-none cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <List className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm truncate text-neutral-300">
                          {selectedType === "OSOBA_PRYWATNA"
                            ? "sprawa prywatna"
                            : selectedType === "FIRMA"
                              ? "sprawa firmowa"
                              : "Typ sprawy"}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1 bg-[#20201d] border-neutral-800 text-white" align="start">
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
                              ? "bg-neutral-800 text-white"
                              : "text-neutral-300 hover:bg-neutral-800/50 hover:text-white bg-transparent"
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
