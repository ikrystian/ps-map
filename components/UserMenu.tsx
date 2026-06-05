"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn, getSubscriptionBorderColor, clearAppCacheAndStorage } from "@/lib/utils"
import {
  Briefcase,
  ChevronDown,
  Coins,
  FileStack,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Moon,
  Receipt,
  Settings,
  Sun,
  User,
  Users,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import Link from "next/link"

interface UserMenuProps {
  userRole: "CLIENT" | "LAW_FIRM" | "ADMIN"
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
  punktySaldo?: number
  userId?: string
  subscriptionType?: string | null
  showPoints?: boolean
}

export default function UserMenu({
  userRole,
  userName,
  userEmail,
  userImage,
  punktySaldo = 0,
  userId,
  subscriptionType,
  showPoints = true,
}: UserMenuProps) {
  const { theme, setTheme } = useTheme()

  // Get subscription border color
  const borderColor = getSubscriptionBorderColor(subscriptionType)

  const handleLogout = async () => {
    await clearAppCacheAndStorage()
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
    if (userRole === "LAW_FIRM") return "EK"
    if (userRole === "ADMIN") return "AD"
    return "U"
  }

  // Shared Trigger
  const Trigger = ({ image, alt }: { image?: string | null; alt: string }) => (
    <DropdownMenuTrigger
      className="focus:outline-none flex items-center gap-2 p-1 -m-1 rounded-lg hover:bg-accent/50 data-[state=open]:bg-accent/50 transition-colors duration-200 cursor-pointer"
      id="user-menu-button"
    >
      <Avatar className={cn("h-9 w-9 cursor-pointer border-2", borderColor)}>
        <AvatarImage src={image || undefined} alt={alt} />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      {userName && (
        <span className="text-sm font-medium hidden sm:block">{userName.split(" ")[0]}</span>
      )}
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
    </DropdownMenuTrigger>
  )

  // Shared Profile Header inside dropdown
  const ProfileHeader = ({ image, alt }: { image?: string | null; alt: string }) => (
    <div className="px-4 py-3 flex items-center gap-3 border-b border-border/60 mb-1">
      <Avatar className={cn("h-10 w-10 border-2 flex-shrink-0", borderColor)}>
        <AvatarImage src={image || undefined} alt={alt} />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        {userName && (
          <span className="text-sm font-semibold text-foreground truncate">{userName}</span>
        )}
        {userEmail && (
          <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
        )}
      </div>
    </div>
  )

  // CLIENT Menu
  if (userRole === "CLIENT") {
    return (
      <DropdownMenu>
        <Trigger image={userImage} alt="Klient" />
        <DropdownMenuContent align="end" className="w-64 z-[1551] p-0 overflow-hidden">
          <ProfileHeader image={userImage} alt="Klient" />

          <div className="py-1">
            <DropdownMenuItem asChild>
              <Link href="/panel-klienta" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                Panel użytkownika
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/panel-klienta/sprawy" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Moje sprawy
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/panel-klienta/pomoc" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                Centrum pomocy
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/panel-klienta/profil" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                Konto
              </Link>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          <div className="py-1">
            <DropdownMenuItem
              onClick={handleLogout}
              className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Wyloguj
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // LAW_FIRM Menu
  if (userRole === "LAW_FIRM") {
    return (
      <div className="flex items-center gap-4">
        {/* Points Counter */}
        {showPoints && (
          <Link href="/panel-eksperta/punkty">
            <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-semibold">{punktySaldo}</span>
              <span className="text-muted-foreground">punktów</span>
            </Badge>
          </Link>
        )}

        {/* User menu */}
        <DropdownMenu>
          <Trigger image={userImage} alt="Kancelaria" />
          <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden">
            <ProfileHeader image={userImage} alt="Kancelaria" />

            <div className="py-1">
              <DropdownMenuItem asChild>
                <Link href="/panel-eksperta" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3">
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                  Panel użytkownika
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/panel-eksperta/sprawy" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  Moje sprawy
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/panel-eksperta/dokumenty" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3">
                  <FileStack className="h-4 w-4 text-muted-foreground" />
                  Dokumenty
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/panel-eksperta/faktury" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  Faktury
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/panel-eksperta/pomoc" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  Centrum pomocy
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/panel-eksperta/profil" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Konto
                </Link>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator />

            <div className="py-1">
              <DropdownMenuItem
                onClick={handleLogout}
                className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
                Wyloguj
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // ADMIN Menu
  if (userRole === "ADMIN") {
    return (
      <DropdownMenu>
        <Trigger image={userImage} alt="Admin" />
        <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden">
          <ProfileHeader image={userImage} alt="Admin" />

          <div className="py-1">
            <DropdownMenuItem asChild>
              <Link href="/admin" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/users" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2">
                <Users className="h-4 w-4" />
                Użytkownicy
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Ustawienia
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/logs" className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Logi systemowe
              </Link>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          <div className="py-1">
            <DropdownMenuItem
              onClick={toggleTheme}
              className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2"
            >
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
              className="px-4 py-2.5 text-sm cursor-pointer"
            >
              Wyloguj
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return null
}
