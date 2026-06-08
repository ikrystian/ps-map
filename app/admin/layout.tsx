"use client"

import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"

import AdminNotificationBell from "@/components/AdminNotificationBell"
import AdminPageTitle from "@/components/admin/AdminPageTitle"
import { AdminTitleProvider } from "@/components/admin/AdminTitleContext"
import { Button } from "@/components/ui/button"
import UserMenu from "@/components/UserMenu"
import { cn } from "@/lib/utils"
import {
  ArrowUpDown,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  FileCode,
  FolderTree,
  HelpCircle,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Settings,
  Shield,
  Star,
  Tags,
  TrendingUp,
  Upload,
  UserCog,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Użytkownicy", href: "/admin/users", icon: Users },
  { name: "Eksperci", href: "/admin/law-firms", icon: Building2 },
  { name: "Import ekspertów", href: "/admin/import-ekspertow", icon: Upload },
  { name: "Opiekunowie", href: "/admin/opiekunowie", icon: UserCog },
  { name: "Sprawy", href: "/admin/cases", icon: Briefcase },
  { name: "Transakcje", href: "/admin/transakcje", icon: CreditCard },
  { name: "Transakcje punktami", href: "/admin/transakcje/punkty", icon: Coins, isSubmenu: true },
  { name: "Promocje", href: "/admin/promocje", icon: TrendingUp },
  { name: "Pozycjonowanie", href: "/admin/pozycjonowanie", icon: ArrowUpDown },
  { name: "Reklamy", href: "/admin/reklamy", icon: Megaphone },
  { name: "Opinie", href: "/admin/reviews", icon: Star },
  { name: "Opinie główne", href: "/admin/testimonials", icon: MessageSquare },
  { name: "Kategorie", href: "/admin/categories", icon: FolderTree },
  { name: "Lokalizacje", href: "/admin/locations", icon: MapPin },
  { name: "Strony", href: "/admin/pages", icon: LayoutTemplate },
  { name: "Moduły", href: "/admin/modules", icon: FileCode },
  { name: "Blog", href: "/admin/blog", icon: BookOpen },
  { name: "Kategorie bloga", href: "/admin/blog/categories", icon: Tags },
  { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { name: "Zarządzanie emailami", href: "/admin/emails", icon: Mail },
  { name: "Powiadomienia", href: "/admin/notifications", icon: Bell },
  { name: "Centrum pomocy", href: "/admin/centrum-pomocy", icon: HelpCircle },
  { name: "Harmonogram zadań", href: "/admin/scheduler", icon: Clock },
  { name: "Ustawienia", href: "/admin/settings", icon: Settings },
  { name: "Pakiety", href: "/admin/pakiety", icon: Shield },
  { name: "Ordery", href: "/admin/badges", icon: Star }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const activeItem = navigation.find(item => {
    return pathname === item.href ||
      (item.href !== "/admin" &&
        item.href !== "/admin/transakcje" &&
        pathname.startsWith(item.href)) ||
      (item.href === "/admin/transakcje" &&
        pathname.startsWith("/admin/transakcje") &&
        !pathname.startsWith("/admin/transakcje/punkty"))
  })

  const defaultSubtitle = activeItem
    ? activeItem.name === "Dashboard"
      ? "Przegląd systemu i statystyki"
      : `Zarządzanie sekcją ${activeItem.name.toLowerCase()}`
    : "Zarządzanie systemem"

  return (
    <AdminTitleProvider defaultTitle={activeItem?.name} defaultSubtitle={defaultSubtitle}>
      <div className="flex h-screen bg-background-sec">
        {/* Sidebar */}
        <aside className={cn(
          " transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}>
          <div className="flex h-full flex-col">
            {/* Logo/Header */}
            <div className="flex h-16 items-center border-border px-4 justify-between bg-card">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              {!isCollapsed && <Link href="/" className="flex items-center relative" id="main-logo">
                <Image className="hidden md:block" src="/images/white-logo.png" alt="Logo" title="Przystąp do sprawy" width={200} height={50} />
                <span className="absolute -right-3 -bottom-3 text-primary font-bold text-base">DEV</span>
              </Link>}
            </div>

            {/* Navigation */}
            <nav
              className="flex-1 space-y-1 overflow-y-auto p-4 relative"
              id="admin-nav-sidebar"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {navigation.map((item, index) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/admin" &&
                    item.href !== "/admin/transakcje" &&
                    pathname.startsWith(item.href)) ||
                  (item.href === "/admin/transakcje" &&
                    pathname.startsWith("/admin/transakcje") &&
                    !pathname.startsWith("/admin/transakcje/punkty"))

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onMouseEnter={() => setHoveredIndex(index)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors outline-none",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground",
                      isCollapsed && "justify-center",
                      item.isSubmenu && !isCollapsed && "pl-8 text-xs opacity-90"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {/* Sliding/Fading Hover Background Pill */}

                    <div className="flex items-center justify-center flex-shrink-0">
                      <item.icon className={cn("h-5 w-5", isActive ? "" : "text-primary")} />
                    </div>

                    {/* Text label with elegant fade-slide */}
                    {!isCollapsed && (
                      <motion.span
                        animate={{
                          x: hoveredIndex === index && !isActive ? 4 : 0,
                          fontWeight: isActive ? 600 : 500,
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {item.name}
                      </motion.span>
                    )}

                    {/* Active accent dot for extra polish */}
                    {isActive && !isCollapsed && (
                      <motion.span
                        layoutId="admin-sidebar-active-indicator"
                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-foreground/80"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
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
              {/* NEW TITLE COMPONENT HERE */}
              <AdminPageTitle />
            </div>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <AdminNotificationBell />
              <UserMenu userRole="ADMIN" />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container-full mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminTitleProvider>
  )
}
