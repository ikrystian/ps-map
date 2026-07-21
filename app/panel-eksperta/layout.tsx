"use client"

import { cn, clearAppCacheAndStorage } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { triggerBadgeCheck } from "@/app/actions/badges"
import { ExpertTourManager } from "@/components/expert-panel/ExpertTourManager"
import { AccountManagerWidget } from "@/components/law-firm/AccountManagerWidget"
import { NotificationSettingsPromptModal } from "@/components/law-firm/NotificationSettingsPromptModal"
import { BusinessPackageWelcomeModal } from "@/components/law-firm/BusinessPackageWelcomeModal"
import { AreaRequiredModal } from "@/components/law-firm/AreaRequiredModal"
import ImpersonationNotice from "@/components/ImpersonationNotice"
import { MessageNotificationSound } from "@/components/MessageNotificationSound"
import { NotificationBell } from "@/components/NotificationBell"
import { PanelFooter } from "@/components/PanelFooter"
import { ExpiredPackageModal } from "@/components/permissions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import UserMenu from "@/components/UserMenu"
import { usePermissions } from "@/hooks/usePermissions"
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages"
import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Coins,
  CreditCard,
  ExternalLink,
  FileStack,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Star,
  TrendingUp,
  Trophy,
  User,
  Wrench,
} from "lucide-react"

// Pogrupowana nawigacja — sekcje porządkują panel i poprawiają UX.
// Pierwsza grupa (bez nagłówka) to pulpit, kolejne grupują funkcje tematycznie.
const navigationGroups = [
  {
    label: null,
    items: [
      { name: "Panel użytkownika", href: "/panel-eksperta", icon: LayoutDashboard },
    ],
  },
  {
    label: "Obsługa spraw",
    items: [
      { name: "Sprawy", href: "/panel-eksperta/sprawy", icon: Briefcase },
      { name: "Oferty", href: "/panel-eksperta/oferty", icon: FileText },
      { name: "Konsultacje", href: "/panel-eksperta/konsultacje", icon: BookOpen },
      { name: "Wiadomości", href: "/panel-eksperta/wiadomosci", icon: MessageSquare },
    ],
  },
  {
    label: "Wizytówka",
    items: [
      { name: "Edycja profilu", href: "/panel-eksperta/profil", icon: User },
      { name: "Podgląd profilu", href: "/ekspert/[slug]", icon: ExternalLink },
      { name: "Zakres usług", href: "/panel-eksperta/zakres-uslug", icon: Wrench },
      { name: "Blog", href: "/panel-eksperta/blog", icon: BookOpen },
      { name: "Opinie", href: "/panel-eksperta/opinie", icon: Star },
      { name: "Certyfikaty", href: "/panel-eksperta/certyfikaty", icon: Award },
      { name: "Dokumenty", href: "/panel-eksperta/dokumenty", icon: FileStack },
    ],
  },
  {
    label: "Promocja i wyniki",
    items: [
      { name: "Promowanie", href: "/panel-eksperta/promowanie", icon: TrendingUp },
      { name: "Pozycja ogłoszeń", href: "/panel-eksperta/pozycja-ogloszenia", icon: Trophy },
      { name: "Statystyki", href: "/panel-eksperta/statystyki", icon: BarChart3 },
    ],
  },
  {
    label: "Konto i płatności",
    items: [
      { name: "Punkty", href: "/panel-eksperta/punkty", icon: Coins },
      { name: "Pakiet", href: "/panel-eksperta/pakiet", icon: Package },
      { name: "Subskrypcje i płatności", href: "/panel-eksperta/subskrypcje-i-platnosci", icon: CreditCard },
      { name: "Ustawienia", href: "/panel-eksperta/ustawienia", icon: Settings },
    ],
  },
]

// Spłaszczona lista — zachowuje zgodność z indeksami używanymi przez efekty hover.
const navigation = navigationGroups.flatMap((group) => group.items)

export default function LawFirmPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [punktySaldo, setPunktySaldo] = useState<number>(0)
  const [lawFirmSlug, setLawFirmSlug] = useState<string>("")
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null)
  const [expertLogo, setExpertLogo] = useState<string>("")
  const [showExpiredModal, setShowExpiredModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Real-time unread messages count
  const { unreadCount } = useRealtimeMessages({
    enabled: !!session?.user && session.user.role === "LAW_FIRM",
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [menuCounts, setMenuCounts] = useState<{ sprawy?: number; oferty?: number; konsultacje?: number }>({})

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

  // Hook do sprawdzania uprawnień
  const { packageExpired, expiryDate, packageName, loading: permissionsLoading } = usePermissions()

  useEffect(() => {
    const fetchLawFirmData = async () => {
      try {
        const response = await fetch("/api/law-firms/me")
        if (response.ok) {
          const data = await response.json()
          setPunktySaldo(data.punktySaldo || 0)
          setLawFirmSlug(data.slug || "")
          setSubscriptionType(data.pakietSubskrypcji || null)
          setExpertLogo(data.logo || "")
        }
      } catch (error) {
        console.error("Error fetching law firm data:", error)
      }
    }

    if (session?.user?.role === "LAW_FIRM") {
      fetchLawFirmData()
      triggerBadgeCheck()
    }
  }, [session, pathname])

  // Sprawdź czy pakiet wygasł i pokaż modal
  useEffect(() => {
    // Pokaż modal tylko jeśli użytkownik MA pakiet (nie null) i jest wygasły
    if (!permissionsLoading && packageExpired && packageName && session?.user?.role === "LAW_FIRM") {
      // Pokaż modal tylko raz na sesję (możesz użyć localStorage jeśli chcesz trwałość)
      const hasSeenExpiredModal = sessionStorage.getItem("hasSeenExpiredModal")
      if (!hasSeenExpiredModal) {
        setShowExpiredModal(true)
        sessionStorage.setItem("hasSeenExpiredModal", "true")
      }
    }
  }, [permissionsLoading, packageExpired, packageName, session])

  // Sprawdź czy ustawienia powiadomień są skonfigurowane oraz czy przyznano pakiet powitalny
  useEffect(() => {
    const checkNotificationSettings = async () => {
      try {
        const response = await fetch("/api/notification-settings")
        if (response.ok) {
          const data = await response.json()
          if (data) {
            if (data.isConfigured === false) {
              setShowNotificationModal(true)
            } else if (data.welcomePackageSeen === false && subscriptionType === "BIZNES") {
              setShowWelcomeModal(true)
            }
          }
        }
      } catch (error) {
        console.error("Error checking notification settings:", error)
      }
    }

    if (session?.user?.role === "LAW_FIRM" && pathname !== "/panel-eksperta/ustawienia") {
      checkNotificationSettings()
    }
  }, [session, pathname, subscriptionType])

  const handleLogout = async () => {
    await clearAppCacheAndStorage()
    await signOut({ callbackUrl: "/" })
  }

  // Get border color class based on subscription type
  const getBorderColorClass = (type: string | null) => {
    switch (type) {
      case "STANDARD":
        return "border-l-4 border-l-blue-500"
      case "PREMIUM":
        return "border-l-4 border-l-purple-500"
      case "BIZNES":
        return "border-l-4 border-l-yellow-500"
      default:
        return "border-l-4 border-l-transparent"
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name[0].toUpperCase()
  }

  // Navigation Items Component (reusable for desktop sidebar and mobile sheet)
  const NavigationItems = ({ inSheet = false }: { inSheet?: boolean }) => (
    <nav
      className="flex-1 space-y-1 overflow-y-auto p-4 bg-background-sec relative"
      id="left-nav"
      onClick={() => {
        if (inSheet) {
          setIsMobileOpen(false)
        }
      }}
    >
      {/* User Avatar and Name */}
      {(inSheet || !isCollapsed) && session?.user && (
        <div className="mb-4 flex flex-col items-center gap-2 pb-4 border-b border-border expert-avatar-area">
          <Avatar className="h-16 w-16">
            <AvatarImage src={expertLogo || session.user.image || undefined} alt={session.user.name || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getUserInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center flex flex-col items-center gap-1">
            <p className="text-md font-semibold">{session.user.name}</p>
            <p className="text-sm text-primary">Ekspert prawny</p>
          </div>
          <ImpersonationNotice className="mt-2" />
        </div>
      )}

      {navigationGroups.map((group, groupIndex) => (
        <div key={group.label ?? `group-${groupIndex}`} className={cn("space-y-1", groupIndex > 0 && "pt-2")}>
          {/* Section header — hidden when collapsed so only icons remain */}
          {group.label && (inSheet || !isCollapsed) && (
            <p className="px-4 pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
              {group.label}
            </p>
          )}
          {/* Subtle divider replaces the header when the sidebar is collapsed */}
          {group.label && !inSheet && isCollapsed && (
            <div className="mx-3 border-t border-border/60" />
          )}
          {group.items.map((item) => {
            const index = navigation.indexOf(item)
            const href = item.href.replace("[slug]", lawFirmSlug || "")
            const isActive = pathname === href ||
              (href !== "/panel-eksperta" && pathname.startsWith(href))
            const isMessagesItem = href === "/panel-eksperta/wiadomosci"
            const showBadge = isMessagesItem && unreadCount > 0

            const isSprawy = href === "/panel-eksperta/sprawy"
            const isOferty = href === "/panel-eksperta/oferty"
            const isKonsultacje = href === "/panel-eksperta/konsultacje"
            const count = isSprawy ? menuCounts.sprawy : isOferty ? menuCounts.oferty : isKonsultacje ? menuCounts.konsultacje : undefined
            const showCountBadge = count !== undefined

            const isProfilePreview = item.href.includes("[slug]")

            return (
              <Link
                key={item.name}
                href={href}
                target={isProfilePreview ? "_blank" : undefined}
                rel={isProfilePreview ? "noopener noreferrer" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 outline-none",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:text-white",
                  !inSheet && isCollapsed && "justify-center"
                )}
                title={!inSheet && isCollapsed ? item.name : undefined}
              >


                <div className="flex items-center justify-center flex-shrink-0">
                  <item.icon className={cn("h-5 w-5 transition-colors duration-200", isActive ? "" : "text-primary group-hover:text-white")} />
                </div>

                {/* Text label with elegant fade-slide */}
                {
                  (inSheet || !isCollapsed) && (
                    <motion.span
                      animate={{
                        x: hoveredIndex === index && !isActive ? 4 : 0,
                        fontWeight: isActive ? 600 : 500,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {item.name}
                    </motion.span>
                  )
                }

                {
                  showBadge && (
                    <span className={cn(
                      "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white transition-all duration-300",
                      !inSheet && isCollapsed && "absolute -right-1 -top-1"
                    )}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )
                }

                {
                  showCountBadge && (
                    <span className={cn(
                      "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold transition-all duration-300",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/15 text-primary border border-primary/30 dark:bg-background-sec/60 dark:text-muted-foreground dark:border-border/30",
                      !inSheet && isCollapsed && "absolute -right-1 -top-1 h-4 min-w-[16px] text-[10px] px-1"
                    )}>
                      {count}
                    </span>
                  )
                }


              </Link>
            )
          })}
        </div>
      ))}


      <div className="border-t border-border my-2" />
      <Button
        onClick={handleLogout}
        onMouseEnter={() => setHoveredIndex(navigation.length + 1)}
        className={cn(
          "group w-full h-auto relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 outline-none justify-start text-muted-foreground hover:text-white hover:bg-transparent",
          !inSheet && isCollapsed && "justify-center"
        )}
        variant="ghost"
        title={!inSheet && isCollapsed ? "Wyloguj" : undefined}
      >
        <AnimatePresence>
          {hoveredIndex === navigation.length + 1 && (
            <motion.span
              layoutId="expert-sidebar-hover-pill"
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

        <motion.div
          animate={{
            scale: hoveredIndex === navigation.length + 1 ? 1.1 : 1,
            x: hoveredIndex === navigation.length + 1 && (!inSheet && !isCollapsed) ? 2 : 0,
            rotate: hoveredIndex === navigation.length + 1 ? [0, -5, 5, 0] : 0,
          }}
          transition={{
            scale: { type: "spring", stiffness: 400, damping: 20 },
            x: { type: "spring", stiffness: 400, damping: 20 },
            rotate: { duration: 0.4, ease: "easeInOut" }
          }}
          className="flex items-center justify-center flex-shrink-0"
        >
          <LogOut className="h-5 w-5" />
        </motion.div>

        {(inSheet || !isCollapsed) && (
          <motion.span
            animate={{
              x: hoveredIndex === navigation.length + 1 ? 4 : 0,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            Wyloguj
          </motion.span>
        )}
      </Button>
    </nav >
  )

  if (pathname?.endsWith("/drukuj")) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-background-sec">
      {/* Dźwięk powiadomień o nowych wiadomościach (globalnie w całym panelu) */}
      <MessageNotificationSound />
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className={cn(
        "hidden md:block border-border transition-all duration-300 ease-in-out bg-card",
        isCollapsed ? "" : "w-72",
        getBorderColorClass(subscriptionType)
      )}>
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center px-4 justify-start gap-2 border-b bg-card w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            {!isCollapsed && <Link href="/" className="flex items-center relative" id="main-logo">
              <Image className="hidden sm:block" src="/logo.svg" alt="Logo" title="Przystąp do sprawy" width={200} height={50} />
              <span className="sm:hidden text-lg font-semibold">PS</span>
              <span className="absolute -right-3 -bottom-3 text-primary font-bold text-base">DEV</span>
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
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className={cn("flex h-full flex-col", getBorderColorClass(subscriptionType))}>
                    <div className="flex h-16 items-center border-b border-border px-4 font-playfair">
                      <h2 className="text-lg font-semibold">Panel Eksperta</h2>
                    </div>
                    <NavigationItems inSheet />
                  </div>
                </SheetContent>
              </Sheet>
            )}


          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <UserMenu
              userRole="LAW_FIRM"
              userName={session?.user?.name}
              userEmail={session?.user?.email}
              userImage={expertLogo || session?.user?.image}
              punktySaldo={punktySaldo}
              userId={session?.user?.id}
              subscriptionType={subscriptionType}
            />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 sm:p-6 pb-0 sm:pb-0">
            {children}
            {/* Footer (z paskiem partnerów) ukryty na wiadomościach — czat ma zajmować cały ekran */}
            {pathname !== "/panel-eksperta/wiadomosci" && (
              <PanelFooter className="mt-6" />
            )}
          </div>
        </main>
      </div>

      {/* Modal wygasłego pakietu */}
      <ExpiredPackageModal
        open={showExpiredModal}
        onOpenChange={setShowExpiredModal}
        packageName={packageName || ""}
        expiryDate={expiryDate}
      />

      {/* Modal konfiguracji powiadomień na pierwszym logowaniu */}
      <NotificationSettingsPromptModal
        open={showNotificationModal}
        onOpenChange={setShowNotificationModal}
        onSuccess={() => {
          setShowNotificationModal(false)
          // Po pomyślnym zapisaniu powiadomień, jeśli ekspert ma pakiet Biznes i nie widział modalu powitalnego, wyświetl go
          if (subscriptionType === "BIZNES") {
            setShowWelcomeModal(true)
          }
        }}
      />

      {/* Modal powitalny dla darmowego pakietu Biznes */}
      <BusinessPackageWelcomeModal
        open={showWelcomeModal}
        onOpenChange={setShowWelcomeModal}
        onConfirm={() => {
          setShowWelcomeModal(false)
        }}
      />

      {/* Account Manager Widget */}
      <AccountManagerWidget />

      {/* Modal braku zakresu usług / obszaru działania */}
      <AreaRequiredModal />

      {/* Expert Onboarding Tour */}
      <ExpertTourManager />
    </div>
  )
}