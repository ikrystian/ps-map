"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, ChevronDown, Check, MapPin, IdCard, List, X } from "lucide-react"
import UserMenu from "@/components/UserMenu"
import type { CategoryWithChildren } from "@/types/categories"
import { InteractiveHoverButton } from "./ui/interactive-hover-button"
import { CITIES } from "@/components/homepage/cities-list"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

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
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [firmoweCategoriesOpen, setFirmoweCategoriesOpen] = useState(false)
  const [prywatneCategoriesOpen, setPrywatneCategoriesOpen] = useState(false)
  const [searchFormOpen, setSearchFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [locationOpen, setLocationOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)

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

  // Split categories into two groups (firmowe/prywatne)
  const firmoweCat = categories.filter(c => c.typ === 'SPRAWY_FIRMOWE')
  const prywatneCat = categories.filter(c => c.typ === 'SPRAWY_PRYWATNE')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    if (selectedCity) params.set("miasto", selectedCity)
    if (selectedType && selectedType !== "all") params.set("typ", selectedType)

    window.location.href = `/panel-eksperta/sprawy?${params.toString()}`
  }

  return (
    <header className="border-b fixed left-0 top-0 right-0 z-20 flex-shrink-0 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image className="hidden md:block" src="/images/white-logo.png" alt="Logo" title="Przystąp do sprawy" width={200} height={50} />
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex gap-6">
              {/* Szukaj Button */}
              <NavigationMenuItem>
                <button
                  onClick={() => setSearchFormOpen(!searchFormOpen)}
                  className="flex items-center gap-2 px-4 py-2 hover:text-primary transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Szukaj
                </button>
              </NavigationMenuItem>

              <NavigationMenuItem className="hidden md:flex">
                <Link href="/szukaj-prawnika" className="flex items-center gap-2 px-4 py-2 hover:text-primary transition-colors">
                  Eksperci
                </Link>
              </NavigationMenuItem>

              {/* Sprawy Prywatne - Mega Menu */}
              <NavigationMenuItem>
                <DropdownMenu open={firmoweCategoriesOpen} onOpenChange={setFirmoweCategoriesOpen}>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 hover:text-primary">
                    Sprawy firmowe
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-w-[calc(100vw)] p-4">
                    <div className="grid grid-cols-3  md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {firmoweCat.map((category) => (
                        <div key={category.id}>
                          <Link
                            href={`/kategorie/${category.slug}`}
                            className="block font-semibold hover:text-primary mb-2"
                            onClick={() => setFirmoweCategoriesOpen(false)}
                          >
                            {category.nazwa}
                          </Link>
                          {category.children && category.children.length > 0 && (
                            <div className="space-y-1">
                              {category.children.slice(0, 5).map((child) => (
                                <Link
                                  key={child.id}
                                  href={`/kategorie/${category.slug}`}
                                  className="block text-sm text-muted-foreground hover:text-primary"
                                  onClick={() => setFirmoweCategoriesOpen(false)}
                                >
                                  {child.nazwa}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t text-right">
                      <Link
                        href="/kategorie"
                        className="text-sm font-medium text-primary hover:underline"
                        onClick={() => setFirmoweCategoriesOpen(false)}
                      >
                        Zobacz wszystkie kategorie →
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>

              {/* Sprawy Prywatne - Mega Menu */}
              <NavigationMenuItem>
                <DropdownMenu open={prywatneCategoriesOpen} onOpenChange={setPrywatneCategoriesOpen}>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 hover:text-primary">
                    Sprawy prywatne
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {prywatneCat.map((category) => (
                        <div key={category.id}>
                          <Link
                            href={`/kategorie/${category.slug}`}
                            className="block font-semibold hover:text-primary mb-2"
                            onClick={() => setPrywatneCategoriesOpen(false)}
                          >
                            {category.nazwa}
                          </Link>
                          {category.children && category.children.length > 0 && (
                            <div className="space-y-1">
                              {category.children.slice(0, 5).map((child) => (
                                <Link
                                  key={child.id}
                                  href={`/kategorie/${category.slug}`}
                                  className="block text-sm text-muted-foreground hover:text-primary"
                                  onClick={() => setPrywatneCategoriesOpen(false)}
                                >
                                  {child.nazwa}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Link
                        href="/kategorie"
                        className="text-sm font-medium text-primary hover:underline"
                        onClick={() => setPrywatneCategoriesOpen(false)}
                      >
                        Zobacz wszystkie kategorie →
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>
              {/* Mapa */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/mapa" className="px-4 py-2 hover:text-primary">
                    Mapa
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Dla prawnika */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/dla-prawnika" className="px-4 py-2 hover:text-primary">
                    Dla prawnika
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side - User Menu / Login */}
          <div className="flex items-center gap-4">
            {isAuthenticated && userRole ? (
              <UserMenu
                userRole={userRole}
                userName={userName}
                userImage={userImage}
                punktySaldo={punktySaldo}
                userId={userId}
              />
            ) : (
              <>
                <Link href="/panel-klienta/dodaj-sprawe">
                  <Button variant="outline">Dodaj sprawę</Button>
                </Link>
                <Link href="/logowanie">
                  <InteractiveHoverButton >Zaloguj</InteractiveHoverButton>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Search Form - Slide Down */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${searchFormOpen ? "max-h-[500px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
            }`}
        >
          <div className="border-t border-neutral-200/10 mt-1 pt-4">
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 p-0 text-white overflow-hidden">

              <form onSubmit={handleSearchSubmit} className="w-full md:pl-28 flex flex-col md:flex-row gap-3 items-stretch z-1000">
                {/* Field 1: Kogo szukasz? */}
                <div className="flex flex-1 items-center gap-2.5 px-4 bg-[#20201d] rounded-lg h-12 border border-neutral-800 focus-within:border-neutral-700 transition-colors">
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
                      className="flex flex-1 items-center gap-2.5 px-4 bg-[#20201d] rounded-lg h-12 border border-neutral-800 hover:bg-[#282825] transition-colors text-left outline-none cursor-pointer"
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
                  <PopoverContent className="w-64 p-0 bg-[#20201d] border-neutral-800 text-white" align="start">
                    <Command className="bg-[#20201d] text-white">
                      <CommandInput placeholder="Wyszukaj miasto..." className="text-white bg-transparent border-neutral-800" />
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty className="text-neutral-400 py-3 text-center text-sm">Nie znaleziono miasta.</CommandEmpty>
                        <CommandGroup>
                          {CITIES.map((city) => (
                            <CommandItem
                              key={city}
                              value={city}
                              onSelect={(currentValue) => {
                                const matchedCity = CITIES.find(c => c.toLowerCase() === currentValue.toLowerCase()) || city
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
                      className="flex flex-1 items-center justify-between gap-2.5 px-4 bg-[#20201d] rounded-lg h-12 border border-neutral-800 hover:bg-[#282825] transition-colors text-left outline-none cursor-pointer"
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
