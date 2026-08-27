"use client"
import Image from "next/image"
import { SiteLogo } from "@/components/site-logo"

import { AddCaseButton } from "@/components/AddCaseButton"
import { MessageNotificationSound } from "@/components/MessageNotificationSound"
import { NotificationBell } from "@/components/NotificationBell"
import { PanelFooter } from "@/components/PanelFooter"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import UserMenu from "@/components/UserMenu"
import ImpersonationNotice from "@/components/ImpersonationNotice"
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages"
import { cn, clearAppCacheAndStorage, resolveActiveNavHref } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { AnimatedNavIcon } from "@/components/AnimatedNavIcon"
import {
  ArrowRightStartOnRectangleIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  NewspaperIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  UserCircleIcon,
} from "@heroicons-animated/react"
import {
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { clientAvatar } from "@/lib/client-avatar"

const navigation = [
  { name: "Panel użytkownika", href: "/panel-klienta", icon: Squares2X2Icon },
  { name: "Sprawy", href: "/panel-klienta/sprawy", icon: BriefcaseIcon },
  { name: "Konsultacje", href: "/panel-klienta/konsultacje", icon: CalendarDaysIcon },
  { name: "Zapytania o konsultacje", href: "/panel-klienta/konsultacje/zapytania", icon: ChatBubbleLeftRightIcon },
  { name: "Wiadomości", href: "/panel-klienta/wiadomosci", icon: ChatBubbleLeftRightIcon },
  { name: "Wybrani eksperci", href: "/panel-klienta/eksperci", icon: HeartIcon },
  { name: "Centrum pomocy", href: "/panel-klienta/pomoc", icon: QuestionMarkCircleIcon },
  { name: "Centrum newsów", href: "/panel-klienta/newsy", icon: NewspaperIcon },
  { name: "Ustawienia profilu", href: "/panel-klienta/profil", icon: UserCircleIcon },
]

export default function ClientPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [menuCounts, setMenuCounts] = useState<{ sprawy?: number; konsultacje?: number }>({})

  // Real-time unread messages count
  const { unreadCount } = useRealtimeMessages({
    enabled: !!session?.user && session.user.role === "CLIENT",
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch navigation menu counts
  useEffect(() => {
    const fetchMenuCounts = async () => {
      try {
        const response = await fetch("/api/menu-counts")
        if (response.ok) {
          const data = await response.json()
          setMenuCounts(data)
        }
      } catch (error) {
        console.error("Error fetching menu counts:", error)
      }
    }

    if (session?.user) {
      fetchMenuCounts()
    }
  }, [session, pathname])

  const handleLogout = async () => {
    await clearAppCacheAndStorage()
    await signOut({ callbackUrl: "/wylogowano" });
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name[0].toUpperCase()
  }

  // Podświetlamy tylko najbardziej szczegółową pasującą pozycję menu
  const activeHref = resolveActiveNavHref(
    navigation.map((item) => item.href),
    pathname,
    "/panel-klienta"
  )

  // Navigation Items Component (reusable for desktop sidebar and mobile sheet)
  const NavigationItems = ({ inSheet = false }: { inSheet?: boolean }) => (
    <nav
      id="left-nav"
      className="flex-1 bg-background-sec space-y-1 overflow-y-auto p-4 lg:pt-7 relative"
      onMouseLeave={() => setHoveredIndex(null)}
      onClick={() => {
        if (inSheet) {
          setIsMobileOpen(false)
        }
      }}
    >
      {/* User Avatar and Name */}
      {(inSheet || !isCollapsed) && session?.user && (
        <div className="mb-4 flex flex-col items-center gap-2 pb-4 border-b border-border">
          <Avatar className="h-16 w-16">
            <AvatarImage src={clientAvatar(session.user.image)} alt={session.user.name || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getUserInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center flex flex-col items-center gap-1">
            <p className="text-md font-semibold text-foreground">{session.user.name}</p>
            <p className="text-sm text-primary">Klient</p>
          </div>
          <ImpersonationNotice className="mt-2" />
        </div>
      )}
      {navigation.map((item, index) => {
        const isActive = item.href === activeHref
        const isMessagesItem = item.href === "/panel-klienta/wiadomosci"
        const showBadge = isMessagesItem && unreadCount > 0

        const isSprawy = item.href === "/panel-klienta/sprawy"
        const isKonsultacje = item.href === "/panel-klienta/konsultacje"
        const count = isSprawy ? menuCounts.sprawy : isKonsultacje ? menuCounts.konsultacje : undefined
        const showCountBadge = count !== undefined

        return (
          <Link
            key={item.name}
            href={item.href}
            onMouseEnter={() => setHoveredIndex(index)}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors duration-200 outline-none",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:text-foreground",
              !inSheet && isCollapsed && "justify-center"
            )}
            title={!inSheet && isCollapsed ? item.name : undefined}
          >
            <AnimatePresence>
              {hoveredIndex === index && !isActive && (
                <motion.span
                  layoutId="client-sidebar-hover-pill"
                  className="absolute inset-0 -z-10 rounded-md bg-accent/80 border-l-[3px] border-primary/60"
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

            <div className="flex items-center justify-center flex-shrink-0">
              <AnimatedNavIcon
                icon={item.icon}
                isHovered={hoveredIndex === index}
                size={20}
                className={cn("h-5 w-5 transition-colors duration-200", isActive ? "" : "text-primary group-hover:text-foreground")}
              />
            </div>

            {/* Text label with elegant fade-slide */}
            {(inSheet || !isCollapsed) && (
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

            {showBadge && (
              <span className={cn(
                "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-error px-1.5 text-xs font-semibold text-error-foreground transition-all duration-300",
                !inSheet && isCollapsed && "absolute -right-1 -top-1"
              )}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}

            {showCountBadge && (
              <span className={cn(
                "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold transition-all duration-300",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary/15 text-primary border border-primary/30 dark:bg-background-sec/60 dark:text-muted-foreground dark:border-border/30",
                !inSheet && isCollapsed && "absolute -right-1 -top-1 h-4 min-w-[16px] text-[10px] px-1"
              )}>
                {count}
              </span>
            )}

            {/* Active accent dot for extra polish */}
            {isActive && (inSheet || !isCollapsed) && !showCountBadge && (
              <motion.span
                layoutId="client-sidebar-active-indicator"
                className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-foreground/80"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </Link>
        )
      })}
      <Button
        onClick={handleLogout}
        onMouseEnter={() => setHoveredIndex(navigation.length)}
        onMouseLeave={() => setHoveredIndex(null)}
        className={cn(
          "group w-full h-auto relative flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors duration-200 outline-none justify-start text-muted-foreground hover:text-foreground hover:bg-transparent",
          !inSheet && isCollapsed && "justify-center"
        )}
        variant="ghost"
        title={!inSheet && isCollapsed ? "Wyloguj" : undefined}
      >
        <AnimatePresence>
          {hoveredIndex === navigation.length && (
            <motion.span
              layoutId="client-sidebar-hover-pill"
              className="absolute inset-0 -z-10 rounded-md bg-accent/80 border-l-[3px] border-primary/60"
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

        <div className="flex items-center justify-center flex-shrink-0">
          <AnimatedNavIcon
            icon={ArrowRightStartOnRectangleIcon}
            isHovered={hoveredIndex === navigation.length}
            size={24}
            className="h-6 w-6 transition-colors duration-200 text-muted-foreground group-hover:text-foreground"
          />
        </div>

        {(inSheet || !isCollapsed) && (
          <motion.span
            animate={{
              x: hoveredIndex === navigation.length ? 4 : 0,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            Wyloguj
          </motion.span>
        )}
      </Button>
    </nav>
  )

  return (
    <div className="flex h-screen bg-background-sec">
      {/* Dźwięk powiadomień o nowych wiadomościach (globalnie w całym panelu) */}
      <MessageNotificationSound />
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className={cn(
        "hidden md:block transition-all duration-300 ease-in-out bg-card",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center px-4 justify-start gap-2 border-b bg-card">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            {!isCollapsed && <Link href="/" className="flex items-center relative" id="main-logo">
              <SiteLogo className="hidden sm:block" title="Przystąp do sprawy" width={200} height={50} />
              <span className="sm:hidden text-lg font-semibold">PS</span>
            </Link>}
          </div>

          {/* Navigation */}
          <NavigationItems />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          {/* Mobile Menu Button + Logo */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Sheet */}
            {isClient && (
              <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-error px-1.5 text-xs font-semibold text-error-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center border-b border-border px-4 font-playfair">
                      <h2 className="text-lg font-semibold">Panel Klienta</h2>
                    </div>
                    <NavigationItems inSheet />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* Notifications and User menu */}
          <div className="flex items-center gap-3">
            <AddCaseButton href="/dodaj-sprawe" />

            <ThemeToggle />
            <NotificationBell />
            <UserMenu
              userRole="CLIENT"
              userName={session?.user?.name}
              userEmail={session?.user?.email}
              userImage={session?.user?.image}
              userId={session?.user?.id}
            />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container p-4 mx-auto ">
            {children}
            {/* Footer */}
            {pathname !== "/panel-klienta/wiadomosci" && (
              <PanelFooter className="mt-12 pb-4" id="client-footer" />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}