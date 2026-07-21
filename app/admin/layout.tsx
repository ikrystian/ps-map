"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"

import AdminNotificationBell from "@/components/AdminNotificationBell"
import AdminPageTitle from "@/components/admin/AdminPageTitle"
import { AdminTitleProvider } from "@/components/admin/AdminTitleContext"
import ImpersonateUserDialog from "@/components/admin/ImpersonateUserDialog"
import { Button } from "@/components/ui/button"
import UserMenu from "@/components/UserMenu"
import { cn } from "@/lib/utils"
import {
  ArrowUpDown,
  Bell,
  BookOpen,
  Briefcase,
  Bug,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  FileCode,
  ClipboardList,
  FileText,
  FolderTree,
  Handshake,
  HelpCircle,
  type LucideIcon,
  LayoutDashboard,
  LayoutTemplate,
  LogIn,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  Tags,
  TrendingUp,
  Upload,
  UserCog,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  isSubmenu?: boolean
  action?: "impersonate"
}

const navigation: { title: string; items: NavItem[] }[] = [
  {
    title: "Główne",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Użytkownicy i eksperci",
    items: [
      { name: "Użytkownicy", href: "/admin/users", icon: Users },
      { name: "Eksperci", href: "/admin/law-firms", icon: Building2 },
      { name: "Import ekspertów", href: "/admin/import-ekspertow", icon: Upload, isSubmenu: true },
      { name: "Opiekunowie", href: "/admin/opiekunowie", icon: UserCog },
      { name: "Sprawy", href: "/admin/cases", icon: Briefcase },
    ],
  },
  {
    title: "Finanse",
    items: [
      { name: "Transakcje", href: "/admin/transakcje", icon: CreditCard },
      { name: "Transakcje punktami", href: "/admin/transakcje/punkty", icon: Coins, isSubmenu: true },
      { name: "Faktury", href: "/admin/faktury", icon: FileText },
      { name: "Pakiety", href: "/admin/pakiety", icon: Shield },
    ],
  },
  {
    title: "Marketing i promocja",
    items: [
      { name: "Promocje", href: "/admin/promocje", icon: TrendingUp },
      { name: "Pozycjonowanie", href: "/admin/pozycjonowanie", icon: ArrowUpDown },
      { name: "Reklamy", href: "/admin/reklamy", icon: Megaphone },
      { name: "Partnerzy", href: "/admin/partnerzy", icon: Handshake },
    ],
  },
  {
    title: "Opinie i reputacja",
    items: [
      { name: "Opinie", href: "/admin/reviews", icon: Star },
      { name: "Opinie główne", href: "/admin/testimonials", icon: MessageSquare },
      { name: "Ordery", href: "/admin/badges", icon: Star },
    ],
  },
  {
    title: "Struktura danych",
    items: [
      { name: "Kategorie", href: "/admin/categories", icon: FolderTree },
      { name: "Typy działalności", href: "/admin/expertise-categories", icon: Briefcase },
      { name: "Lokalizacje", href: "/admin/locations", icon: MapPin },
    ],
  },
  {
    title: "Treści",
    items: [
      { name: "Strony", href: "/admin/pages", icon: LayoutTemplate },
      { name: "Polityka prywatności", href: "/admin/pages/polityka-prywatnosci", icon: ShieldCheck, isSubmenu: true },
      { name: "Regulamin", href: "/admin/pages/regulamin", icon: ScrollText, isSubmenu: true },
      { name: "Moduły", href: "/admin/modules", icon: FileCode },
      { name: "Blog", href: "/admin/blog", icon: BookOpen },
      { name: "Kategorie bloga", href: "/admin/blog/categories", icon: Tags, isSubmenu: true },
      { name: "Centrum pomocy", href: "/admin/centrum-pomocy", icon: HelpCircle },
      { name: "Ankiety", href: "/admin/ankiety", icon: ClipboardList },
    ],
  },
  {
    title: "Komunikacja",
    items: [
      { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
      { name: "Zarządzanie emailami", href: "/admin/emails", icon: Mail },
      { name: "Powiadomienia", href: "/admin/notifications", icon: Bell },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Zaloguj jako", href: "#", icon: LogIn, action: "impersonate" },
      { name: "Zgłoszenia błędów", href: "/admin/bug-reports", icon: Bug },
      { name: "Harmonogram zadań", href: "/admin/scheduler", icon: Clock },
      { name: "Ustawienia", href: "/admin/settings", icon: Settings },
    ],
  },
]

const flatNavigation = navigation.flatMap(group => group.items)

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [impersonateOpen, setImpersonateOpen] = useState(false)

  // Podstrony "Stron" z własnymi pozycjami w podmenu
  const legalPagesRoutes = ["/admin/pages/polityka-prywatnosci", "/admin/pages/regulamin"]

  const isNavItemActive = (href: string) => {
    if (href === "#") return false
    if (pathname === href) return true
    if (href === "/admin") return false
    if (href === "/admin/transakcje") {
      return pathname.startsWith("/admin/transakcje") &&
        !pathname.startsWith("/admin/transakcje/punkty")
    }
    if (href === "/admin/pages") {
      return pathname.startsWith("/admin/pages") &&
        !legalPagesRoutes.some(route => pathname.startsWith(route))
    }
    return pathname.startsWith(href)
  }

  const activeItem = flatNavigation.find(item => isNavItemActive(item.href))

  const defaultSubtitle = activeItem
    ? activeItem.name === "Dashboard"
      ? "Przegląd systemu i statystyki"
      : `Zarządzanie sekcją ${activeItem.name.toLowerCase()}`
    : "Zarządzanie systemem"

  if (pathname?.endsWith("/drukuj")) {
    return <>{children}</>
  }

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
                <Image className="hidden md:block" src="/logo.svg" alt="Logo" title="Przystąp do sprawy" width={200} height={50} />
                <span className="absolute -right-3 -bottom-3 text-primary font-bold text-base">DEV</span>
              </Link>}
            </div>

            {/* Navigation */}
            <nav
              className="flex-1 space-y-1 overflow-y-auto p-4 relative"
              id="admin-nav-sidebar"
              onMouseLeave={() => setHoveredIndex(null)}
              suppressHydrationWarning
            >
              {navigation.map((group, groupIndex) => (
                <div key={group.title}>
                  {groupIndex > 0 && (
                    <div className={cn("border-t border-border/60", isCollapsed ? "my-2 mx-2" : "my-2 mx-1")} />
                  )}
                  {!isCollapsed && (
                    <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {group.title}
                    </p>
                  )}
                  {group.items.map((item) => {
                    const index = flatNavigation.indexOf(item)
                    const isActive = isNavItemActive(item.href)

                    const itemClassName = cn(
                      "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:text-white",
                      isCollapsed && "justify-center",
                      item.isSubmenu && !isCollapsed && "pl-8 text-xs opacity-90"
                    )

                    const itemInner = (
                      <>
                        <div className="flex items-center justify-center flex-shrink-0" suppressHydrationWarning>
                          <item.icon className={cn("h-5 w-5 transition-colors duration-200", isActive ? "" : "text-primary group-hover:text-white")} />
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
                      </>
                    )

                    // Pozycje-akcje (np. "Zaloguj jako") otwierają modal zamiast nawigować.
                    if (item.action === "impersonate") {
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setImpersonateOpen(true)}
                          onMouseEnter={() => setHoveredIndex(index)}
                          className={cn(itemClassName, "w-full text-left")}
                          title={isCollapsed ? item.name : undefined}
                        >
                          {itemInner}
                        </button>
                      )
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onMouseEnter={() => setHoveredIndex(index)}
                        className={itemClassName}
                        title={isCollapsed ? item.name : undefined}
                      >
                        {itemInner}
                      </Link>
                    )
                  })}
                </div>
              ))}
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

      <ImpersonateUserDialog open={impersonateOpen} onOpenChange={setImpersonateOpen} />
    </AdminTitleProvider>
  )
}
