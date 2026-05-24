"use client"
import Image from "next/image"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { MessagesBell } from "@/components/MessagesBell"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Real-time unread messages count
  const { unreadCount } = useRealtimeMessages({
    enabled: !!session?.user && session.user.role === "CLIENT",
  })

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
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

  return (
    <div className="flex h-screen bg-background-sec">
      {/* Sidebar */}
      <aside className={cn(
        "transition-all duration-300 ease-in-out",
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
          <nav
            id="left-nav"
            className="flex-1 space-y-1 overflow-y-auto p-4 relative"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* User Avatar and Name */}
            {!isCollapsed && session?.user && (
              <div className="mb-4 flex flex-col items-center gap-2 pb-4 border-b border-border">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getUserInitials(session.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center flex flex-col items-center gap-1">
                  <p className="text-md font-semibold text-foreground">{session.user.name}</p>
                  <p className="text-sm text-primary">Klient</p>
                </div>
              </div>
            )}
            {navigation.map((item, index) => {
              const isActive = pathname === item.href ||
                (item.href !== "/panel-klienta" && pathname.startsWith(item.href))
              const isMessagesItem = item.href === "/panel-klienta/wiadomosci"
              const showBadge = isMessagesItem && unreadCount > 0

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
                        layoutId="client-sidebar-hover-pill"
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
                    <item.icon className={cn("h-5 w-5", isActive ? "" : "text-primary")} />
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

                  {showBadge && (
                    <span className={cn(
                      "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white transition-all duration-300",
                      isCollapsed && "absolute -right-1 -top-1"
                    )}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}

                  {/* Active accent dot for extra polish */}
                  {isActive && !isCollapsed && (
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
              className={cn(
                "w-full h-auto relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors outline-none justify-start text-muted-foreground hover:text-foreground hover:bg-transparent",
                isCollapsed && "justify-center"
              )}
              variant="ghost"
              title={isCollapsed ? "Wyloguj" : undefined}
            >
              <AnimatePresence>
                {hoveredIndex === navigation.length && (
                  <motion.span
                    layoutId="client-sidebar-hover-pill"
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
                  scale: hoveredIndex === navigation.length ? 1.1 : 1,
                  x: hoveredIndex === navigation.length && !isCollapsed ? 2 : 0,
                  rotate: hoveredIndex === navigation.length ? [0, -5, 5, 0] : 0,
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

              {!isCollapsed && (
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

          {/* Notifications and User menu */}
          <div className="flex items-center gap-2">
            <MessagesBell />
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