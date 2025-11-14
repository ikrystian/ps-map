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
import { ExpiredPackageModal } from "@/components/permissions"
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
  Receipt,
  HelpCircle,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"
import UserMenu from "@/components/UserMenu"

const navigation = [
  { name: "Panel użytkownika", href: "/panel-kancelarii", icon: LayoutDashboard },
  { name: "Sprawy", href: "/panel-kancelarii/sprawy", icon: Briefcase },
  { name: "Oferty", href: "/panel-kancelarii/oferty", icon: FileText },
  { name: "Profil", href: "/panel-kancelarii/profil", icon: User },
  { name: "Zakres usług", href: "/panel-kancelarii/zakres-uslug", icon: Wrench },
  { name: "Blog", href: "/panel-kancelarii/blog", icon: BookOpen },
  { name: "Opinie", href: "/panel-kancelarii/opinie", icon: Star },
  { name: "Certyfikaty", href: "/panel-kancelarii/certyfikaty", icon: Award },
  { name: "Dokumenty", href: "/panel-kancelarii/dokumenty", icon: FileStack },
  { name: "Punkty", href: "/panel-kancelarii/punkty", icon: Coins },
  { name: "Pakiet", href: "/panel-kancelarii/pakiet", icon: Package },
  { name: "Promowanie", href: "/panel-kancelarii/promowanie", icon: TrendingUp },
  { name: "Pozycja ogłoszeń", href: "/panel-kancelarii/pozycja-ogloszenia", icon: Trophy },
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
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [punktySaldo, setPunktySaldo] = useState<number>(0)
  const [lawFirmSlug, setLawFirmSlug] = useState<string>("")
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showExpiredModal, setShowExpiredModal] = useState(false)

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
          setSubscriptionType(data.subscriptionPlan?.typ || null)
        }
      } catch (error) {
        console.error("Error fetching law firm data:", error)
      }
    }

    if (session?.user?.role === "LAW_FIRM") {
      fetchLawFirmData()
    }
  }, [session])

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/conversations/unread-count")
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error("Error fetching unread count:", error)
      }
    }

    if (session?.user) {
      fetchUnreadCount()
      // Odświeżaj co 30 sekund
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  // Sprawdź czy pakiet wygasł i pokaż modal
  useEffect(() => {
    if (!permissionsLoading && packageExpired && session?.user?.role === "LAW_FIRM") {
      // Pokaż modal tylko raz na sesję (możesz użyć localStorage jeśli chcesz trwałość)
      const hasSeenExpiredModal = sessionStorage.getItem("hasSeenExpiredModal")
      if (!hasSeenExpiredModal) {
        setShowExpiredModal(true)
        sessionStorage.setItem("hasSeenExpiredModal", "true")
      }
    }
  }, [permissionsLoading, packageExpired, session])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  // Navigation Items Component (reusable for desktop sidebar and mobile sheet)
  const NavigationItems = ({ inSheet = false }: { inSheet?: boolean }) => (
    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href ||
          (item.href !== "/panel-kancelarii" && pathname.startsWith(item.href))
        const isMessagesItem = item.href === "/panel-kancelarii/wiadomosci"
        const showBadge = isMessagesItem && unreadCount > 0

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              !inSheet && isCollapsed && "justify-center"
            )}
            title={!inSheet && isCollapsed ? item.name : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {(inSheet || !isCollapsed) && <span>{item.name}</span>}
            {showBadge && (
              <span className={cn(
                "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white",
                !inSheet && isCollapsed && "absolute -right-1 -top-1"
              )}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        )
      })}

      {/* Link do publicznej strony kancelarii */}
      {lawFirmSlug && (
        <>
          <div className="border-t border-border my-2" />
          <Link
            href={`/kancelaria/${lawFirmSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              !inSheet && isCollapsed && "justify-center"
            )}
            title={!inSheet && isCollapsed ? "Mój profil publiczny" : undefined}
          >
            <ExternalLink className="h-5 w-5 flex-shrink-0" />
            {(inSheet || !isCollapsed) && <span>Mój profil publiczny</span>}
          </Link>
        </>
      )}

      <div className="border-t border-border my-2" />
      <Button
        onClick={handleLogout}
        className={cn(
          "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          !inSheet && isCollapsed && "justify-center"
        )}
        variant="ghost"
        title={!inSheet && isCollapsed ? "Wyloguj" : undefined}
      >
        <LogOut className="h-5 w-5 flex-shrink-0" />
        {(inSheet || !isCollapsed) && <span>Wyloguj</span>}
      </Button>
    </nav>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className={cn(
        "hidden md:block border-r border-border bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center border-b border-border px-4 justify-between">
            {!isCollapsed && <h2 className="text-lg font-semibold">Panel Kancelarii</h2>}
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
                <div className="flex h-full flex-col">
                  <div className="flex h-16 items-center border-b border-border px-4">
                    <h2 className="text-lg font-semibold">Panel Kancelarii</h2>
                  </div>
                  <NavigationItems inSheet />
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center">
              <Image className="hidden sm:block" src="/images/white-logo.png" alt="Logo" title="Przystąp do sprawy" width={150} height={38} />
              <span className="sm:hidden text-lg font-semibold">PS</span>
            </Link>
          </div>

          <UserMenu
            userRole="LAW_FIRM"
            userName={session?.user?.name}
            userImage={session?.user?.image}
            punktySaldo={punktySaldo}
            userId={session?.user?.id}
            subscriptionType={subscriptionType}
          />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 sm:p-6">
            {children}
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
    </div>
  )
}
