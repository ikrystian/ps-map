"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
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
import { cn } from "@/lib/utils"
import type { CategoryWithChildren } from "@/types/categories"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, ChevronRight, IdCard, List, MapPin, Menu, Search, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { InteractiveHoverButton } from "./ui/interactive-hover-button"


interface PublicHeaderProps {
  isAuthenticated?: boolean
  userRole?: "CLIENT" | "LAW_FIRM" | "ADMIN" | null
  userName?: string | null
  userImage?: string | null
  punktySaldo?: number
  userId?: string
}

export default function PublicHeader({
  isAuthenticated = false,
  userRole = null,
  userName = null,
  userImage = null,
  punktySaldo = 0,
  userId
}: PublicHeaderProps) {
  const pathname = usePathname()
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [searchFormOpen, setSearchFormOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [locationOpen, setLocationOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [cities, setCities] = useState<string[]>([])

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

    const fetchCities = async () => {
      try {
        const response = await fetch("/api/cities")
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            setCities(data.map((c: { nazwa: string }) => c.nazwa))
          }
        }
      } catch (error) {
        console.error("Error fetching cities:", error)
      }
    }

    fetchCategories()
    fetchCities()
  }, [])

  // Close search form and mobile menu on pathname change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchFormOpen(false)
    setMobileMenuOpen(false)
  }, [pathname])

  // Split categories into two groups (firmowe/prywatne)
  const firmoweCat = categories.filter(c => c.typ === 'SPRAWY_FIRMOWE')
  const prywatneCat = categories.filter(c => c.typ === 'SPRAWY_PRYWATNE')

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("search", searchQuery.trim())
    if (selectedCity) params.set("city", selectedCity)
    if (selectedType && selectedType !== "all") params.set("type", selectedType)

    window.location.href = `/szukaj-prawnika?${params.toString()}`
  }

  return (
    <header className="fixed left-0 top-0 right-0 z-1550 flex-shrink-0 backdrop-blur-md shadow-lg shadow-black/70 top-bar-public bg-[#141414]/40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center relative" id="main-logo">
            <Image className="hidden md:block" src="/images/white-logo.png" alt="Logo" title="Przystąp do sprawy" width={200} height={50} />
            <Image className="block md:hidden" src="/images/mobile-logo.webp" alt="Logo" title="Przystąp do sprawy" width={53} height={45} style={{ width: "auto", height: "32px" }} />
            <span className="absolute -right-3 -bottom-3 text-primary font-bold text-base" id="env">{process.env.ENV}</span>
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex gap-6">
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
                        "flex items-center justify-center gap-2 bg-transparent hover:bg-[#121212] transition-colors w-[108px]"
                      )}
                    >
                      <Search className="h-4 w-4 text-neutral-400" />
                      <span>Szukaj</span>
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
                  <div className="w-[800px] xl:w-[1080px] p-6 lg:p-8">
                    <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-x-8 gap-y-6 [column-fill:balance] [&>div]:break-inside-avoid">
                      {firmoweCat.map((category) => (
                        <div key={category.id} className="mb-6">
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/kategorie/${category.slug}`}
                              className={cn(
                                "group/cat-title inline-flex items-center gap-1.5 font-semibold text-sm hover:text-primary mb-2.5 transition-colors text-neutral-800 dark:text-neutral-100",
                                pathname === `/kategorie/${category.slug}` && "text-primary"
                              )}
                            >
                              <span>{category.nazwa}</span>
                              {category._count?.lawFirms !== undefined && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 group-hover/cat-title:bg-primary/15 group-hover/cat-title:text-primary transition-all duration-250 font-semibold border border-neutral-250/20 dark:border-neutral-700/30">
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
                                    {child._count?.lawFirms !== undefined && (
                                      <span className="text-[10px] text-muted-foreground/60 group-hover/child-item:text-primary/80 transition-colors ml-2 font-medium">
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
                  <div className="w-[800px] xl:w-[1080px] p-6 lg:p-8">
                    <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-x-8 gap-y-6 [column-fill:balance] [&>div]:break-inside-avoid">
                      {prywatneCat.map((category) => (
                        <div key={category.id} className="mb-6">
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/kategorie/${category.slug}`}
                              className={cn(
                                "group/cat-title inline-flex items-center gap-1.5 font-semibold text-sm hover:text-primary mb-2.5 transition-colors text-neutral-800 dark:text-neutral-100",
                                pathname === `/kategorie/${category.slug}` && "text-primary"
                              )}
                            >
                              <span>{category.nazwa}</span>
                              {category._count?.lawFirms !== undefined && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 group-hover/cat-title:bg-primary/15 group-hover/cat-title:text-primary transition-all duration-250 font-semibold border border-neutral-250/20 dark:border-neutral-700/30">
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
                                    {child._count?.lawFirms !== undefined && (
                                      <span className="text-[10px] text-muted-foreground/60 group-hover/child-item:text-primary/80 transition-colors ml-2 font-medium">
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
          <div className="flex items-center gap-3 md:gap-4">
            {isAuthenticated && userRole ? (
              <UserMenu
                userRole={userRole}
                userName={userName}
                userImage={userImage}
                punktySaldo={punktySaldo}
                userId={userId}
                showPoints={false}
              />
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/panel-klienta/dodaj-sprawe">
                  <Button variant="outline">Dodaj sprawę</Button>
                </Link>
                <Link href="/logowanie">
                  <InteractiveHoverButton>Zaloguj</InteractiveHoverButton>
                </Link>
              </div>
            )}

            {/* Mobile Navigation Trigger */}
            <div className="md:hidden">
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
                <SheetContent side="right" className="w-[300px] sm:w-[360px] bg-[#141414] border-neutral-850 p-0 text-white flex flex-col justify-between overflow-hidden">
                  <div className="flex h-16 items-center px-6 border-b border-neutral-800 justify-between">
                    <Link href="/" className="flex items-center relative" onClick={() => setMobileMenuOpen(false)}>
                      <Image src="/images/white-logo.png" alt="Logo" width={130} height={32} style={{ width: "auto", height: "32px" }} />
                    </Link>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Search inside Mobile Menu */}
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
                                  {category._count?.lawFirms !== undefined && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-450 font-semibold border border-neutral-700">
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
                                        {child._count?.lawFirms !== undefined && (
                                          <span className="text-[10px] text-neutral-500 font-medium">
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
                                  {category._count?.lawFirms !== undefined && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-semibold border border-neutral-700">
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
                                        {child._count?.lawFirms !== undefined && (
                                          <span className="text-[10px] text-neutral-500 font-medium">
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
                        href="/dla-prawnika"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block py-2 text-base font-medium transition-colors hover:text-primary",
                          isDlaPrawnikaActive ? "text-primary font-semibold" : "text-neutral-200"
                        )}
                      >
                        Dla prawnika
                      </Link>

                    </div>
                  </div>

                  {/* Mobile Actions Footer */}
                  {!isAuthenticated && (
                    <div className="p-6 border-t border-neutral-800 bg-[#101010] flex flex-col gap-3">
                      <Link href="/panel-klienta/dodaj-sprawe" onClick={() => setMobileMenuOpen(false)} className="w-full">
                        <Button className="w-full cursor-pointer border-neutral-700 hover:bg-neutral-850 text-neutral-200 h-11" variant="outline" size="lg">
                          Dodaj sprawę
                        </Button>
                      </Link>
                      <Link href="/logowanie" onClick={() => setMobileMenuOpen(false)} className="w-full">
                        <Button className="w-full cursor-pointer bg-teal-600 hover:bg-teal-700 text-white font-semibold h-11 border-0" size="lg">
                          Zaloguj się
                        </Button>
                      </Link>
                    </div>
                  )}
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
                {/* Field 1: Kogo szukasz? */}
                <div className="flex flex-1 items-center gap-2.5 px-4 bg-card rounded-lg h-12 border border-neutral-800 focus-within:border-neutral-700 transition-colors">
                  <IdCard className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Kogo szukasz?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-neutral-500 text-white focus:ring-0"
                    autoFocus={searchFormOpen}
                  />
                </div>

                {/* Field 2: Lokalizacja */}
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
                          }}
                          className="hover:text-red-400 text-neutral-400 p-0.5"
                        >
                          <X className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0 bg-card border-neutral-800 text-white" align="start">
                    <Command className="bg-[#20201d] text-white">
                      <CommandInput placeholder="Wyszukaj miasto..." className="text-white bg-transparent border-neutral-800" />
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty className="text-neutral-400 py-3 text-center text-sm">Nie znaleziono miasta.</CommandEmpty>
                        <CommandGroup>
                          {cities.map((city) => (
                            <CommandItem
                              key={city}
                              value={city}
                              onSelect={(currentValue) => {
                                const matchedCity = cities.find(c => c.toLowerCase() === currentValue.toLowerCase()) || city
                                setSelectedCity(matchedCity === selectedCity ? "" : matchedCity)
                                setLocationOpen(false)
                              }}
                              className="text-white hover:bg-neutral-800 cursor-pointer flex items-center gap-2 py-2 px-3 text-sm rounded-md data-[selected=true]:bg-neutral-800"
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4 text-teal-400",
                                  selectedCity === city ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {city}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

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
