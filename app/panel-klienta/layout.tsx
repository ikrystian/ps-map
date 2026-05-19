"use client"
import Image from "next/image"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Briefcase,
  UserCircle,
  MessageSquare,
  Heart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import UserMenu from "@/components/UserMenu"
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages"
import { NotificationBell } from "@/components/NotificationBell"

const navigation = [
  { name: "Panel użytkownika", href: "/panel-klienta", icon: LayoutDashboard },
  { name: "Zarządzanie profilem", href: "/panel-klienta/profil", icon: UserCircle },
  { name: "Konsultacje", href: "/panel-klienta/konsultacje", icon: CalendarCheck },
  { name: "Wiadomości", href: "/panel-klienta/wiadomosci", icon: MessageSquare },
  { name: "Sprawy", href: "/panel-klienta/sprawy", icon: Briefcase },
  { name: "Wybrani eksperci", href: "/panel-klienta/eksperci", icon: Heart },
]

export default function ClientPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Real-time unread messages count
  const { unreadCount } = useRealtimeMessages({
    enabled: !!session?.user && session.user.role === "CLIENT",
  })

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

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
            {!isCollapsed && <h2 className="text-lg font-semibold">Panel Klienta</h2>}
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
          <nav id="left-nav" className="flex-1 space-y-3 overflow-y-auto p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/panel-klienta" && pathname.startsWith(item.href))
              const isMessagesItem = item.href === "/panel-klienta/wiadomosci"
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
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-colors duration-300", isActive ? "text-white" : "text-primary group-hover:text-white")} />
                  {!isCollapsed && <span>{item.name}</span>}
                  {showBadge && (
                    <span className={cn(
                      "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white transition-all duration-300",
                      isCollapsed && "absolute -right-1 -top-1"
                    )}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              )
            })}
            <Button
              onClick={handleLogout}
              className={cn(
                "flex w-full h-auto items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300 relative group hover:scale-[1.02] hover:shadow-md active:scale-[0.98] text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                isCollapsed && "justify-center"
              )}
              variant="ghost"
              title={isCollapsed ? "Wyloguj" : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 text-primary group-hover:text-white transition-colors duration-300" />
              {!isCollapsed && <span>Wyloguj</span>}
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
            <Link href="/" className="flex items-center">
              <Image className="hidden md:block" src="/images/white-logo.png" alt="Logo" title="Przystąp do sprawy" width={200} height={50} />
            </Link>
          </div>

          {/* Notifications and User menu */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu
              userRole="CLIENT"
              userName={session?.user?.name}
              userImage={session?.user?.image}
              userId={session?.user?.id}
            />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6 px-4 mx-auto">
            {children}
            {/* Footer */}
            <div className="mt-12 pb-4">
              {/* Partners banner */}
              <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl bg-card border border-zinc-800/30 p-5 w-full mx-auto mb-6">
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
    </div>
  )
}