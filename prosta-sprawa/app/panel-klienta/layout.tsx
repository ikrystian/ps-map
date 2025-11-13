"use client"
import Image from "next/image"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import UserMenu from "@/components/UserMenu"

const navigation = [
  { name: "Panel użytkownika", href: "/panel-klienta", icon: LayoutDashboard },
  { name: "Zarządzanie profilem", href: "/panel-klienta/profil", icon: UserCircle },
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

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-border bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center border-b border-border px-4 justify-between">
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
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/panel-klienta" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
            <Button
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center"
              )}
              variant="ghost"
              title={isCollapsed ? "Wyloguj" : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
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
            <Image src="/images/white-logo.png" alt="Logo" title="Przystąp do sprawy" width={200} height={50} />
          </Link>
          </div>

          {/* User menu */}
          <UserMenu
            userRole="CLIENT"
            userName={session?.user?.name}
            userImage={session?.user?.image}
            userId={session?.user?.id}
          />
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
