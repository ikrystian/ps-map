"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Wrench,
  BookOpen,
  Star,
  Award,
  Coins,
  Package,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Settings,
  FileStack,
  Receipt,
  HelpCircle,
  LogOut,
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

const navigation = [
  { name: "Panel użytkownika", href: "/panel-kancelarii", icon: LayoutDashboard },
  { name: "Sprawy", href: "/panel-kancelarii/sprawy", icon: Briefcase },
  { name: "Oferty", href: "/panel-kancelarii/oferty", icon: FileText },
  { name: "Profil", href: "/panel-kancelarii/profil", icon: User },
  { name: "Zakres usług", href: "/panel-kancelarii/zakres-uslug", icon: Wrench },
  { name: "Blog", href: "/panel-kancelarii/blog", icon: BookOpen },
  { name: "Opinie", href: "/panel-kancelarii/opinie", icon: Star },
  { name: "Certyfikaty", href: "/panel-kancelarii/certyfikaty", icon: Award },
  { name: "Punkty", href: "/panel-kancelarii/punkty", icon: Coins },
  { name: "Pakiet", href: "/panel-kancelarii/pakiet", icon: Package },
  { name: "Promowanie", href: "/panel-kancelarii/promowanie", icon: TrendingUp },
  { name: "Statystyki", href: "/panel-kancelarii/statystyki", icon: BarChart3 },
  { name: "Wiadomości", href: "/panel-kancelarii/wiadomosci", icon: MessageSquare },
  { name: "Ustawienia", href: "/panel-kancelarii/ustawienia", icon: Settings },
]

export default function LawFirmPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center border-b border-border px-6">
            <h2 className="text-lg font-semibold">Panel Kancelarii</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/panel-kancelarii" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              ProstaSprawa
            </Link>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarImage src="/avatars/user.jpg" alt="User" />
                <AvatarFallback>KA</AvatarFallback>
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
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
                <LogOut className="h-4 w-4" />
                Wyloguj
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
