"use client"

import { useState } from "react"
import Image from "next/image"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Star,
  FolderTree,
  BookOpen,
  Mail,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Tags,
  CreditCard,
  TrendingUp,
  HelpCircle,
  LayoutTemplate,
  FileCode,
  UserCog,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import UserMenu from "@/components/UserMenu"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Użytkownicy", href: "/admin/users", icon: Users },
  { name: "Kancelarie", href: "/admin/law-firms", icon: Building2 },
  { name: "Opiekunowie", href: "/admin/opiekunowie", icon: UserCog },
  { name: "Sprawy", href: "/admin/cases", icon: Briefcase },
  { name: "Transakcje", href: "/admin/transakcje", icon: CreditCard },
  { name: "Promocje", href: "/admin/promocje", icon: TrendingUp },
  { name: "Opinie", href: "/admin/reviews", icon: Star },
  { name: "Kategorie", href: "/admin/categories", icon: FolderTree },
  { name: "Strony", href: "/admin/pages", icon: LayoutTemplate },
  { name: "Moduły", href: "/admin/modules", icon: FileCode },
  { name: "Blog", href: "/admin/blog", icon: BookOpen },
  { name: "Kategorie bloga", href: "/admin/blog/categories", icon: Tags },
  { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { name: "Zarządzanie emailami", href: "/admin/emails", icon: Mail },
  { name: "Centrum pomocy", href: "/admin/centrum-pomocy", icon: HelpCircle },
  { name: "Ustawienia", href: "/admin/settings", icon: Settings },
  { name: "Pakiety", href: "/admin/pakiety", icon: Shield }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-border bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center border-b border-border px-4 justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">Panel Admina</h2>
              </div>
            )}
            {isCollapsed && <Shield className="h-6 w-6 text-primary mx-auto" />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
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
          <Link href="/" className="flex items-center">
            <Image className="hidden md:block" src="/images/white-logo.png" alt="Logo" title="Przystąp do sprawy" width={200} height={50} />
          </Link>
          </div>

          {/* User menu */}
          <UserMenu userRole="ADMIN" />
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
