"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Briefcase,
  UserCircle,
  MessageSquare,
  MapPin,
  Package,
  Star,
  TrendingUp,
  Coins,
  BookOpen,
  CreditCard,
  LogOut,
  Wrench,
  HelpCircle,
  User,
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
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Panel użytkownika", href: "/panel-klienta", icon: LayoutDashboard },
  { name: "Zarządzanie profilem", href: "/panel-klienta/profil", icon: UserCircle },
  { name: "Zakres usług", href: "/panel-klienta/zakres-uslug", icon: Wrench },
  { name: "Wiadomości", href: "/panel-klienta/wiadomosci", icon: MessageSquare },
  { name: "Pozycja ogłoszenia", href: "/panel-klienta/pozycja-ogloszenia", icon: MapPin },
  { name: "Pakiet", href: "/panel-klienta/pakiet", icon: Package },
  { name: "Sprawy", href: "/panel-klienta/sprawy", icon: Briefcase },
  { name: "Opinie i certyfikaty", href: "/panel-klienta/opinie-certyfikaty", icon: Star },
  { name: "Promowanie", href: "/panel-klienta/promowanie", icon: TrendingUp },
  { name: "Punkty", href: "/panel-klienta/punkty", icon: Coins },
  { name: "Moje artykuły", href: "/panel-klienta/artykuly", icon: BookOpen },
  { name: "Subskrypcje i płatności", href: "/panel-klienta/subskrypcje", icon: CreditCard },
]

export default function ClientPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center border-b border-border px-6">
            <h2 className="text-lg font-semibold">Panel Klienta</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/panel-klienta" && pathname.startsWith(item.href))

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
            <Button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              variant="ghost"
            >
              <LogOut className="h-5 w-5" />
              Wyloguj
            </Button>
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
                <AvatarImage src="/avatars/client.jpg" alt="Klient" />
                <AvatarFallback>KL</AvatarFallback>
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
