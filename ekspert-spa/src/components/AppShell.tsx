import { useQuery } from "@tanstack/react-query"
import { Briefcase, CalendarClock, House, MessageSquare, UserRound } from "lucide-react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { api } from "@/lib/api"
import { haptic } from "@/lib/native"
import { usePendingBookingsCount } from "@/lib/queries"
import { SCROLL_TO_TOP_EVENT } from "./Screen"
import { cn } from "./ui"

const TABS = [
  { to: "/start", label: "Start", icon: House },
  { to: "/sprawy", label: "Sprawy", icon: Briefcase },
  { to: "/konsultacje", label: "Konsultacje", icon: CalendarClock },
  { to: "/wiadomosci", label: "Wiadomości", icon: MessageSquare },
  { to: "/konto", label: "Konto", icon: UserRound },
]

export function AppShell() {
  const { data: unread } = useQuery({
    queryKey: ["conversations", "unread"],
    queryFn: () => api<{ unreadCount: number }>("/api/conversations/unread-count"),
    refetchInterval: 30 * 1000,
  })
  const pendingBookings = usePendingBookingsCount()

  const badges: Record<string, number> = {
    "/wiadomosci": unread?.unreadCount ?? 0,
    "/konsultacje": pendingBookings,
  }

  return (
    <div className="relative h-full">
      <main className="h-full">
        <Outlet />
      </main>
      <TabDock badges={badges} />
    </div>
  )
}

/**
 * Pływający dok nad treścią. Etykietę ma tylko aktywna zakładka: pięć polskich nazw nie mieści się
 * obok siebie na wąskich telefonach bez czcionki poniżej 9 px.
 */
function TabDock({ badges }: { badges: Record<string, number> }) {
  const { pathname } = useLocation()

  const handleTap = (to: string) => {
    // Ponowne dotknięcie aktywnej zakładki wraca na górę listy, jak w aplikacjach systemowych
    if (pathname === to) window.dispatchEvent(new Event(SCROLL_TO_TOP_EVENT))
    else haptic("light")
  }

  return (
    <div className="hide-on-keyboard pb-safe-2 pointer-events-none absolute inset-x-0 bottom-0 z-20 px-3 pt-8">
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-transparent" />
      <nav aria-label="Główna" className="dock pointer-events-auto relative mx-auto max-w-md rounded-full p-1.5">
        <ul className="flex">
          {TABS.map(({ to, label, icon: Icon }) => {
            const badge = badges[to] ?? 0
            return (
              <li key={to} className="min-w-0 flex-auto">
                <NavLink
                  to={to}
                  replace
                  aria-label={badge > 0 ? `${label}, nowe: ${badge}` : label}
                  onClick={() => handleTap(to)}
                  className={({ isActive }) =>
                    cn(
                      "flex h-(--dock-item) items-center justify-center rounded-full px-2 transition-colors duration-200",
                      isActive ? "dock-active text-primary-foreground min-[350px]:px-3.5" : "text-muted-foreground active:bg-muted/60"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative shrink-0">
                        <Icon className="size-[22px]" strokeWidth={isActive ? 2.2 : 1.8} aria-hidden />
                        {badge > 0 && (
                          <span
                            className={cn(
                              "absolute -right-2 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white ring-2",
                              isActive ? "ring-primary-fill" : "ring-surface"
                            )}
                          >
                            {badge > 9 ? "9+" : badge}
                          </span>
                        )}
                      </span>
                      {/* Siatka 0fr → 1fr animuje szerokość tekstu bez mierzenia go w JS */}
                      <span
                        className={cn(
                          "grid transition-[grid-template-columns,opacity,margin-left] duration-300 ease-out",
                          isActive ? "ml-1.5 grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0"
                        )}
                      >
                        <span className="overflow-hidden whitespace-nowrap text-[13px] font-semibold">{label}</span>
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
