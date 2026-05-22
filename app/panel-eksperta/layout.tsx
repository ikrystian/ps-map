"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePermissions } from "@/hooks/usePermissions"
import { ExpiredPackageModal, PackageBadge } from "@/components/permissions"
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages"
import { NotificationSettingsPromptModal } from "@/components/law-firm/NotificationSettingsPromptModal"
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
  Trophy,
  BarChart3,
  MessageSquare,
  Settings,
  FileStack,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react"
import UserMenu from "@/components/UserMenu"
import { AccountManagerWidget } from "@/components/law-firm/AccountManagerWidget"
import { NotificationBell } from "@/components/NotificationBell"
import { triggerBadgeCheck } from "@/app/actions/badges"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const navigation = [
  { name: "Panel użytkownika", href: "/panel-eksperta", icon: LayoutDashboard },
  { name: "Sprawy", href: "/panel-eksperta/sprawy", icon: Briefcase },
  { name: "Oferty", href: "/panel-eksperta/oferty", icon: FileText },
  { name: "Konsultacje", href: "/panel-eksperta/konsultacje", icon: BookOpen },

  { name: "Profil", href: "/panel-eksperta/profil", icon: User },
  { name: "Zakres usług", href: "/panel-eksperta/zakres-uslug", icon: Wrench },
  { name: "Blog", href: "/panel-eksperta/blog", icon: BookOpen },
  { name: "Opinie", href: "/panel-eksperta/opinie", icon: Star },
  { name: "Certyfikaty", href: "/panel-eksperta/certyfikaty", icon: Award },
  { name: "Dokumenty", href: "/panel-eksperta/dokumenty", icon: FileStack },
  { name: "Punkty", href: "/panel-eksperta/punkty", icon: Coins },
  { name: "Pakiet", href: "/panel-eksperta/pakiet", icon: Package },
  { name: "Promowanie", href: "/panel-eksperta/promowanie", icon: TrendingUp },
  { name: "Pozycja ogłoszeń", href: "/panel-eksperta/pozycja-ogloszenia", icon: Trophy },
  { name: "Statystyki", href: "/panel-eksperta/statystyki", icon: BarChart3 },
  { name: "Wiadomości", href: "/panel-eksperta/wiadomosci", icon: MessageSquare },
  { name: "Ustawienia", href: "/panel-eksperta/ustawienia", icon: Settings },
]

export default function LawFirmPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [punktySaldo, setPunktySaldo] = useState<number>(0)
  const [lawFirmSlug, setLawFirmSlug] = useState<string>("")
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null)
  const [showExpiredModal, setShowExpiredModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Real-time unread messages count
  const { unreadCount } = useRealtimeMessages({
    enabled: !!session?.user && session.user.role === "LAW_FIRM",
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

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
        }
      } catch (error) {
        console.error("Error fetching law firm data:", error)
      }
    }

    if (session?.user?.role === "LAW_FIRM") {
      fetchLawFirmData()
      triggerBadgeCheck()
    }
  }, [session])

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

  // Sprawdź czy ustawienia powiadomień są skonfigurowane
  useEffect(() => {
    const checkNotificationSettings = async () => {
      try {
        const response = await fetch("/api/notification-settings")
        if (response.ok) {
          const data = await response.json()
          if (data && data.isConfigured === false) {
            setShowNotificationModal(true)
          }
        }
      } catch (error) {
        console.error("Error checking notification settings:", error)
      }
    }

    if (session?.user?.role === "LAW_FIRM" && pathname !== "/panel-eksperta/ustawienia") {
      checkNotificationSettings()
    }
  }, [session, pathname])

  const handleLogout = async () => {
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
    <nav className="flex-1 space-y-3 overflow-y-auto p-4" id="left-nav">
      {/* User Avatar and Name */}
      {(inSheet || !isCollapsed) && session?.user && (
        <div className="mb-4 flex flex-col items-center gap-2 pb-4 border-b border-border">
          <Avatar className="h-16 w-16">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getUserInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center flex flex-col items-center gap-1">
            <p className="text-md font-semibold">{session.user.name}</p>
            <p className="text-sm text-primary">Ekspert prawny</p>
            <PackageBadge packageType={subscriptionType as any} size="sm" className="mt-1" />
          </div>
        </div>
      )}
      {navigation.map((item) => {
        const isActive = pathname === item.href ||
          (item.href !== "/panel-eksperta" && pathname.startsWith(item.href))
        const isMessagesItem = item.href === "/panel-eksperta/wiadomosci"
        const showBadge = isMessagesItem && unreadCount > 0

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300 relative group hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
              isActive
                ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
              !inSheet && isCollapsed && "justify-center"
            )}
            title={!inSheet && isCollapsed ? item.name : undefined}
          >
            <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-colors duration-300", isActive ? "text-white" : "text-primary group-hover:text-white")} />
            {(inSheet || !isCollapsed) && <span>{item.name}</span>}
            {showBadge && (
              <span className={cn(
                "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white transition-all duration-300",
                !inSheet && isCollapsed && "absolute -right-1 -top-1"
              )}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        )
      })}

      {/* Link do publicznej strony eksperta */}
      {lawFirmSlug && (
        <>
          <div className="border-t border-border my-2" />
          <Link
            href={`/ekspert/${lawFirmSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300 relative group hover:scale-[1.02] hover:shadow-md active:scale-[0.98] text-muted-foreground hover:bg-primary hover:text-primary-foreground",
              !inSheet && isCollapsed && "justify-center"
            )}
            title={!inSheet && isCollapsed ? "Mój profil publiczny" : undefined}
          >
            <ExternalLink className="h-5 w-5 flex-shrink-0 text-primary group-hover:text-white transition-colors duration-300" />
            {(inSheet || !isCollapsed) && <span>Mój profil publiczny</span>}
          </Link>
        </>
      )}

      <div className="border-t border-border my-2" />
      <Button
        onClick={handleLogout}
        className={cn(
          "w-full h-auto flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300 relative group hover:scale-[1.02] hover:shadow-md active:scale-[0.98] text-muted-foreground hover:bg-primary hover:text-primary-foreground",
          !inSheet && isCollapsed && "justify-center"
        )}
        variant="ghost"
        title={!inSheet && isCollapsed ? "Wyloguj" : undefined}
      >
        <LogOut className="h-5 w-5 flex-shrink-0 text-primary group-hover:text-white transition-colors duration-300" />
        {(inSheet || !isCollapsed) && <span>Wyloguj</span>}
      </Button>
    </nav>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className={cn(
        "hidden md:block border-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72",
        getBorderColorClass(subscriptionType)
      )}>
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center px-4 justify-between border-b bg-card">
            {!isCollapsed && <h2 className="text-lg font-semibold ">Panel Eksperta</h2>}
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
              <Sheet>
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
                    <div className="flex h-16 items-center border-b border-border px-4">
                      <h2 className="text-lg font-semibold">Panel Eksperta</h2>
                    </div>
                    <NavigationItems inSheet />
                  </div>
                </SheetContent>
              </Sheet>
            )}

            <Link href="/" className="flex items-center">
              <Image className="hidden sm:block" src="/images/white-logo.png" alt="Logo" title="Przystąp do sprawy" width={150} height={38} />
              <span className="sm:hidden text-lg font-semibold">PS</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu
              userRole="LAW_FIRM"
              userName={session?.user?.name}
              userImage={session?.user?.image}
              punktySaldo={punktySaldo}
              userId={session?.user?.id}
              subscriptionType={subscriptionType}
            />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 sm:p-6">
            {children}
            <div className="mt-12 pb-4">
              {/* Partners banner */}
              <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl bg-card border border-zinc-800/30 p-5 w-full mb-6">
                <span className="text-sm font-medium text-zinc-400">Nasi partnerzy:</span>

                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                  {/* IdentyfikacjaFirm */}
                  <a
                    href="https://identyfikacjafirm.pl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800/20 text-zinc-400 group-hover:text-white transition-colors">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                        <path d="M12 7a5 5 0 1 1-5 5" />
                        <path d="M12 3a9 9 0 1 1-9 9" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-md font-bold text-white tracking-tight">
                        Identyfikacja<span className="font-extrabold text-zinc-300">Firm</span>
                      </span>
                      <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5 self-end">
                        kielce
                      </span>
                    </div>
                  </a>

                  {/* Divider between partners */}
                  <div className="hidden sm:block h-4 w-px bg-zinc-800/80" />

                  {/* 4Connection */}
                  <a
                    href="https://4connection.pl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800/20 text-zinc-400 group-hover:text-white transition-colors">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 8.5v4h5.5" />
                        <path d="M12.5 5.5v10" />
                      </svg>
                    </div>
                    <span className="text-md font-bold text-white tracking-tight">
                      4<span className="font-semibold text-zinc-300">Connection</span>
                    </span>
                  </a>
                </div>
              </div>

              {/* Separator line */}
              <div className="border-t border-zinc-800/40 my-6 max-w-3xl mx-auto" />

              {/* Bottom Copyright and Social Links */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-zinc-500">
                <span>2026 © ProstaSprawa.pl</span>
                <div className="flex gap-2">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800/80 hover:text-white border border-zinc-800/20 transition-all"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800/80 hover:text-white border border-zinc-800/20 transition-all"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800/80 hover:text-white border border-zinc-800/20 transition-all"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
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
        onSuccess={() => setShowNotificationModal(false)}
      />

      {/* Account Manager Widget */}
      <AccountManagerWidget />
    </div>
  )
}