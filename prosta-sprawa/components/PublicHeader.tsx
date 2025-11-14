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
import { Search, ChevronDown } from "lucide-react"
import UserMenu from "@/components/UserMenu"
import type { CategoryWithChildren } from "@/types/categories"

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
  const firmoweCat = categories.slice(0, Math.ceil(categories.length / 2))
  const prywatneCat = categories.slice(Math.ceil(categories.length / 2))

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/szukaj-prawnika?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="border-b bg-background fixed left-0 top-0 right-0 z-30 flex-shrink-0 backdrop-blur-md">
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

              {/* Sprawy Firmowe - Mega Menu */}
              <NavigationMenuItem>
                <DropdownMenu open={firmoweCategoriesOpen} onOpenChange={setFirmoweCategoriesOpen}>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 hover:text-primary">
                    Sprawy firmowe
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[700px] p-4">
                    <div className="grid grid-cols-3 gap-4">
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
                    <div className="mt-4 pt-4 border-t">
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
                  <DropdownMenuContent className="w-[500px] p-4">
                    <div className="grid grid-cols-2 gap-4">
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

              {/* Z nami wygrywasz */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/z-nami-wygrywasz" className="px-4 py-2 hover:text-primary">
                    Z nami wygrywasz
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
                  <Button>Zaloguj</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Search Form - Slide Down */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            searchFormOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t py-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Wyszukaj prawnika lub specjalizację..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus={searchFormOpen}
              />
              <Button type="submit" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Wyszukaj
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
