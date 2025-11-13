"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  Briefcase,
  User,
  MessageSquare,
  Heart,
  LogOut,
  HelpCircle,
  FileStack,
  Receipt,
  Settings,
  Users,
  FileText,
  Coins,
  Moon,
  Sun,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface UserMenuProps {
  userRole: "CLIENT" | "LAW_FIRM" | "ADMIN"
  userName?: string | null
  userImage?: string | null
  punktySaldo?: number
  userId?: string
}

export default function UserMenu({
  userRole,
  userName,
  userImage,
  punktySaldo = 0,
  userId,
}: UserMenuProps) {
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/wylogowano" })
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    if (userName) {
      return userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (userRole === "CLIENT") return "KL"
    if (userRole === "LAW_FIRM") return "KA"
    if (userRole === "ADMIN") return "AD"
    return "U"
  }

  // CLIENT Menu
  if (userRole === "CLIENT") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none" id="user-menu-button">
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarImage src={userImage || "/avatars/client.jpg"} alt="Klient" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/panel-klienta" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Panel użytkownika
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/panel-klienta/sprawy" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Moje sprawy
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/panel-klienta/profil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Moje konto
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/panel-klienta/pomoc" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Centrum pomocy
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleTheme} className="flex items-center gap-2 cursor-pointer">
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                Jasny motyw
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                Ciemny motyw
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
            <LogOut className="h-4 w-4" />
            Wyloguj
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // LAW_FIRM Menu
  if (userRole === "LAW_FIRM") {
    return (
      <div className="flex items-center gap-4">
        {/* Points Counter */}
        <Link href="/panel-kancelarii/punkty">
          <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer">
            <Coins className="h-4 w-4 text-primary" />
            <span className="font-semibold">{punktySaldo}</span>
            <span className="text-muted-foreground">punktów</span>
          </Badge>
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none" id="user-menu-button">
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src={userImage || "/avatars/user.jpg"} alt="User" />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/panel-kancelarii" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Panel użytkownika
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/panel-kancelarii/sprawy" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Moje sprawy
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/panel-kancelarii/dokumenty" className="flex items-center gap-2">
                <FileStack className="h-4 w-4" />
                Dokumenty
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/panel-kancelarii/faktury" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Faktury
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/panel-kancelarii/pomoc" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Centrum pomocy
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/panel-kancelarii/profil" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Konto
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleTheme} className="flex items-center gap-2 cursor-pointer">
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" />
                  Jasny motyw
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Ciemny motyw
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
              <LogOut className="h-4 w-4" />
              Wyloguj
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // ADMIN Menu
  if (userRole === "ADMIN") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none" id="user-menu-button">
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarImage src={userImage || "/avatars/admin.jpg"} alt="Admin" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Panel administracyjny</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Użytkownicy
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Ustawienia
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logi systemowe
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/profil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mój profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleTheme} className="flex items-center gap-2 cursor-pointer">
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                Jasny motyw
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                Ciemny motyw
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Wyloguj
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return null
}
