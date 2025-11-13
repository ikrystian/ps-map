"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
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
import { Search, ChevronDown, User, LayoutDashboard, Briefcase, MessageSquare, HelpCircle, LogOut, FileStack, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Category {
  id: string
  nazwa: string
  slug: string
  parentId: string | null
  children: Array<{
    id: string
    nazwa: string
  }>
}

interface PublicHeaderProps {
  isAuthenticated?: boolean
  userRole?: "CLIENT" | "LAW_FIRM" | "ADMIN" | null
  userName?: string | null
  userImage?: string | null
}

export default function PublicHeader({ isAuthenticated = false, userRole = null, userName = null, userImage = null }: PublicHeaderProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [firmoweCategoriesOpen, setFirmoweCategoriesOpen] = useState(false)
  const [prywatneCategoriesOpen, setPrywatneCategoriesOpen] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data.filter((cat: Category) => !cat.parentId))
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

  return (
    <header className="border-b bg-background fixed left-0 top-0 right-0 z-30 flex-shrink-0 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/images/white-logo.png" alt="Logo" title="Przystąp do sprawy" width={200} height={50} />
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex gap-6">
              {/* Szukaj Button */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/szukaj-prawnika" className="flex items-center gap-2 px-4 py-2 hover:text-primary">
                    <Search className="h-4 w-4" />
                    Szukaj
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Sprawy Firmowe - Mega Menu */}
              <NavigationMenuItem>
                <DropdownMenu open={firmoweCategoriesOpen} onOpenChange={setFirmoweCategoriesOpen}>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 hover:text-primary">
                    Sprawy firmowe
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[500px] p-4">
                    <div className="grid grid-cols-2 gap-4">
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
                  <Link href="/z-nami-wygrywasz" className="px-4 py-2 text-green-600 font-semibold hover:text-green-700">
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
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage src={userImage || undefined} alt={userName || "User"} />
                    <AvatarFallback>
                      {userName ? userName.substring(0, 2).toUpperCase() : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={userRole === "LAW_FIRM" ? "/panel-kancelarii" : "/panel-klienta"} className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Panel użytkownika
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={userRole === "LAW_FIRM" ? "/panel-kancelarii/sprawy" : "/panel-klienta/sprawy"} className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Moje sprawy
                    </Link>
                  </DropdownMenuItem>
                  {userRole === "LAW_FIRM" && (
                    <DropdownMenuItem asChild>
                      <Link href="/panel-kancelarii/dokumenty" className="flex items-center gap-2">
                        <FileStack className="h-4 w-4" />
                        Dokumenty
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={userRole === "LAW_FIRM" ? "/panel-kancelarii/wiadomosci" : "/panel-klienta/wiadomosci"} className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Wiadomości
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={userRole === "LAW_FIRM" ? "/panel-kancelarii/ustawienia" : "/panel-klienta/profil"} className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {userRole === "LAW_FIRM" ? "Ustawienia" : "Moje konto"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={userRole === "LAW_FIRM" ? "/panel-kancelarii/pomoc" : "/panel-klienta/pomoc"} className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Centrum pomocy
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/api/auth/logout" className="flex items-center gap-2 cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      Wyloguj
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/dodaj-sprawe">
                  <Button variant="outline">Dodaj sprawę</Button>
                </Link>
                <Link href="/logowanie">
                  <Button>Zaloguj</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
