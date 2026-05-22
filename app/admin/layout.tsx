"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Upload,
  Bell,
  MapPin,
  Megaphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import UserMenu from "@/components/UserMenu"
import AdminNotificationBell from "@/components/AdminNotificationBell"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Użytkownicy", href: "/admin/users", icon: Users },
  { name: "Kancelarie", href: "/admin/law-firms", icon: Building2 },
  { name: "Import kancelarii", href: "/admin/import-kancelarii", icon: Upload },
  { name: "Opiekunowie", href: "/admin/opiekunowie", icon: UserCog },
  { name: "Sprawy", href: "/admin/cases", icon: Briefcase },
  { name: "Transakcje", href: "/admin/transakcje", icon: CreditCard },
  { name: "Promocje", href: "/admin/promocje", icon: TrendingUp },
  { name: "Reklamy", href: "/admin/reklamy", icon: Megaphone },
  { name: "Opinie", href: "/admin/reviews", icon: Star },
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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center border-border px-4 justify-between">
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
          <nav
            className="flex-1 space-y-1 overflow-y-auto p-4 relative"
            id="admin-nav-sidebar"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {navigation.map((item, index) => {
              const isActive = pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors outline-none",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  {/* Sliding/Fading Hover Background Pill */}
                  <AnimatePresence>
                    {hoveredIndex === index && !isActive && (
                      <motion.span
                        layoutId="admin-sidebar-hover-pill"
                        className="absolute inset-0 -z-10 rounded-lg bg-accent/80 border-l-[3px] border-primary/60"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon with interactive spring movement */}
                  <motion.div
                    animate={{
                      scale: hoveredIndex === index || isActive ? 1.1 : 1,
                      x: hoveredIndex === index && !isActive && !isCollapsed ? 2 : 0,
                      rotate: hoveredIndex === index && !isActive ? [0, -5, 5, 0] : 0,
                    }}
                    transition={{
                      scale: { type: "spring", stiffness: 400, damping: 20 },
                      x: { type: "spring", stiffness: 400, damping: 20 },
                      rotate: { duration: 0.4, ease: "easeInOut" }
                    }}
                    className="flex items-center justify-center flex-shrink-0"
                  >
                    <item.icon className="h-5 w-5" />
                  </motion.div>

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
            <Link href="/" className="flex items-center relative" id="main-logo">
              <Image className="hidden md:block" src="/images/white-logo.png" alt="Logo" title="Przystąp do sprawy" width={200} height={50} />
              <span className="absolute -right-3 -bottom-3 text-primary font-bold text-base">DEV</span>
            </Link>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            <AdminNotificationBell />
            <UserMenu userRole="ADMIN" />
          </div>
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
