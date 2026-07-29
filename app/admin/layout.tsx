"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import AdminNotificationBell from "@/components/AdminNotificationBell"
import AdminPageTitle from "@/components/admin/AdminPageTitle"
import { AdminTitleProvider } from "@/components/admin/AdminTitleContext"
import ImpersonateUserDialog from "@/components/admin/ImpersonateUserDialog"
import UserMenu from "@/components/UserMenu"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar"
import { AnimatePresence, motion } from "framer-motion"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ArrowUpDown,
  Bell,
  BookOpen,
  Briefcase,
  Bug,
  Building2,
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

type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  isSubmenu?: boolean
  action?: "impersonate"
}

type NavGroup = {
  title: string
  icon: LucideIcon
  items: NavItem[]
}

const SIDEBAR_NAV_STORAGE_KEY = "admin_sidebar_menu_groups_state"

function getStoredNavGroupState(groupTitle: string, defaultValue: boolean): boolean {
  if (typeof window === "undefined") return defaultValue
  try {
    const raw = localStorage.getItem(SIDEBAR_NAV_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed[groupTitle] === "boolean") {
        return parsed[groupTitle]
      }
    }
  } catch (e) {
    console.error("Failed to read nav state from localStorage:", e)
  }
  return defaultValue
}

function setStoredNavGroupState(groupTitle: string, isOpen: boolean) {
  if (typeof window === "undefined") return
  try {
    const raw = localStorage.getItem(SIDEBAR_NAV_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    parsed[groupTitle] = isOpen
    localStorage.setItem(SIDEBAR_NAV_STORAGE_KEY, JSON.stringify(parsed))
  } catch (e) {
    console.error("Failed to write nav state to localStorage:", e)
  }
}

const navigation: NavGroup[] = [
  {
    title: "Główne",
    icon: LayoutDashboard,
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Użytkownicy i eksperci",
    icon: Users,
    items: [
      { name: "Klienci", href: "/admin/users", icon: Users },
      { name: "Eksperci", href: "/admin/law-firms", icon: Building2 },
      { name: "Opiekunowie", href: "/admin/opiekunowie", icon: UserCog },
      { name: "Sprawy", href: "/admin/cases", icon: Briefcase },
    ],
  },
  {
    title: "Finanse",
    icon: CreditCard,
    items: [
      { name: "Transakcje", href: "/admin/transakcje", icon: CreditCard },
      { name: "Transakcje punktami", href: "/admin/transakcje/punkty", icon: Coins, isSubmenu: true },
      { name: "Faktury", href: "/admin/faktury", icon: FileText },
      { name: "Pakiety", href: "/admin/pakiety", icon: Shield },
    ],
  },
  {
    title: "Marketing i promocja",
    icon: Megaphone,
    items: [
      { name: "Promocje", href: "/admin/promocje", icon: TrendingUp },
      { name: "Pozycjonowanie", href: "/admin/pozycjonowanie", icon: ArrowUpDown },
      { name: "Reklamy", href: "/admin/reklamy", icon: Megaphone },
      { name: "Partnerzy", href: "/admin/partnerzy", icon: Handshake },
    ],
  },
  {
    title: "Opinie i reputacja",
    icon: Star,
    items: [
      { name: "Opinie", href: "/admin/reviews", icon: Star },
      { name: "Opinie główne", href: "/admin/testimonials", icon: MessageSquare },
      { name: "Ordery", href: "/admin/badges", icon: Star },
    ],
  },
  {
    title: "Struktura danych",
    icon: FolderTree,
    items: [
      { name: "Kategorie", href: "/admin/categories", icon: FolderTree },
      { name: "Typy działalności", href: "/admin/expertise-categories", icon: Briefcase },
      { name: "Lokalizacje", href: "/admin/locations", icon: MapPin },
    ],
  },
  {
    title: "Treści",
    icon: FileText,
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
    icon: Mail,
    items: [
      { name: "Wiadomości kontaktowe", href: "/admin/kontakt", icon: MessageSquare },
      { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
      { name: "Zarządzanie emailami", href: "/admin/emails", icon: Mail },
      { name: "Powiadomienia", href: "/admin/notifications", icon: Bell },
    ],
  },
  {
    title: "System",
    icon: Settings,
    items: [
      { name: "Zaloguj jako", href: "#", icon: LogIn, action: "impersonate" },
      { name: "Zgłoszenia błędów", href: "/admin/bug-reports", icon: Bug },
      { name: "Harmonogram zadań", href: "/admin/scheduler", icon: Clock },
      { name: "Ustawienia", href: "/admin/settings", icon: Settings },
    ],
  },
]

const flatNavigation = navigation.flatMap(group => group.items)

function CollapsibleNavGroup({
  group,
  isNavItemActive,
  setImpersonateOpen,
}: {
  group: NavGroup
  isNavItemActive: (href: string) => boolean
  setImpersonateOpen: (open: boolean) => void
}) {
  const isGroupActive = group.items.some((item) => isNavItemActive(item.href))
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const storedState = getStoredNavGroupState(group.title, true)
    if (storedState !== true) {
      const timer = setTimeout(() => {
        setIsOpen(storedState)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [group.title])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    setStoredNavGroupState(group.title, newOpen)
  }

  const GroupIcon = group.icon

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={group.title}
            isActive={isGroupActive}
            className={cn(
              "group/btn font-semibold text-primary transition-colors duration-200 hover:text-white",
              isGroupActive
                ? "data-[active=true]:bg-tranparent data-[active=true]:text-primary"
                : ""
            )}
          >
            {GroupIcon && (
              <GroupIcon className={cn(
                "h-5 w-5 shrink-0 transition-colors duration-200 text-primary group-hover/btn:text-white",
                isGroupActive && "text-white"
              )} />
            )}
            <span className={cn(
              "transition-colors duration-200 text-primary group-hover/btn:text-white",
              isGroupActive && "text-white"
            )}>
              {group.title}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="ml-auto flex items-center"
            >
              <ChevronRight className={cn(
                "h-4 w-4 shrink-0 transition-colors duration-200 text-primary group-hover/btn:text-white",
                isGroupActive && "text-white"
              )} />
            </motion.div>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <AnimatePresence initial={false}>
          {isOpen && (
            <CollapsibleContent forceMount asChild>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="overflow-hidden"
              >
                <SidebarMenuSub>
                  {group.items.map((item) => {
                    const isActive = isNavItemActive(item.href)

                    if (item.action === "impersonate") {
                      return (
                        <SidebarMenuSubItem key={item.name}>
                          <SidebarMenuSubButton
                            onClick={() => setImpersonateOpen(true)}
                            isActive={isActive}
                            className={cn(
                              "group/subbtn transition-colors duration-200 cursor-pointer text-muted-foreground hover:text-white",
                              isActive && "data-[active=true]:bg-primary data-[active=true]:text-white font-semibold"
                            )}
                          >
                            <item.icon className={cn(
                              "h-4 w-4 shrink-0 transition-colors duration-200 text-primary group-hover/subbtn:text-white",
                              isActive && "text-white"
                            )} />
                            <span>{item.name}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    }

                    return (
                      <SidebarMenuSubItem key={item.name}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "group/subbtn transition-colors duration-200 text-muted-foreground hover:text-white",
                            isActive && "data-[active=true]:bg-primary data-[active=true]:text-white font-semibold"
                          )}
                        >
                          <Link href={item.href}>
                            <item.icon className={cn(
                              "h-4 w-4 shrink-0 transition-colors duration-200 text-primary group-hover/subbtn:text-white",
                              isActive && "text-white"
                            )} />
                            <span>{item.name}</span>
                            {isActive && (
                              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />
                            )}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
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
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="icon" variant="sidebar">
          <SidebarHeader className="border-b border-sidebar-border/50 px-3 py-3">
            <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
              <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <Image src="/logo.svg" alt="Logo" width={160} height={40} className="h-7 w-auto" />
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">DEV</span>
              </Link>
              <SidebarTrigger />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup className="p-2">
              <SidebarMenu>
                {navigation.map((group) => (
                  <CollapsibleNavGroup
                    key={group.title}
                    group={group}
                    isNavItemActive={isNavItemActive}
                    setImpersonateOpen={setImpersonateOpen}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter />
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <AdminPageTitle />
            </div>

            <div className="flex items-center gap-3">
              <AdminNotificationBell />
              <UserMenu userRole="ADMIN" />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="container-full mx-auto p-6">
              {children}
            </div>
          </main>
        </SidebarInset>

        <ImpersonateUserDialog open={impersonateOpen} onOpenChange={setImpersonateOpen} />
      </SidebarProvider>
    </AdminTitleProvider>
  )
}
