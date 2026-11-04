import { useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react"
import { useLocation, useNavigationType } from "react-router-dom"
import { haptic } from "@/lib/native"
import { cn } from "./ui"

const PULL_THRESHOLD = 72
const PULL_MAX = 110
const PULL_RESISTANCE = 0.45
const MIN_REFRESH_TIME = 500

export const SCROLL_TO_TOP_EVENT = "app:scroll-to-top"

const scrollPositions = new Map<string, number>()

function useScrollMemory(ref: RefObject<HTMLDivElement | null>, tabRoot: boolean) {
  const { pathname, key } = useLocation()
  const navigationType = useNavigationType()
  const memoryKey = tabRoot ? pathname : key

  useLayoutEffect(() => {
    const scroller = ref.current
    if (!scroller) return
    if (tabRoot || navigationType === "POP") scroller.scrollTop = scrollPositions.get(memoryKey) ?? 0
    return () => {
      scrollPositions.set(memoryKey, scroller.scrollTop)
    }
  }, [memoryKey, navigationType, ref, tabRoot])
}

function usePullToRefresh(
  scrollerRef: RefObject<HTMLDivElement | null>,
  indicatorRef: RefObject<HTMLDivElement | null>,
  enabled: boolean
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const scroller = scrollerRef.current
    const indicator = indicatorRef.current
    if (!enabled || !scroller || !indicator) return

    let start: { x: number; y: number } | null = null
    let distance = 0
    let refreshing = false
    let armed = false

    const paint = (value: number, animated = false) => {
      indicator.style.transition = animated ? "transform 0.2s ease-out, opacity 0.2s ease-out" : "none"
      indicator.style.transform = `translate3d(-50%, ${value - 48}px, 0) rotate(${value * 3}deg)`
      indicator.style.opacity = String(Math.min(value / (PULL_THRESHOLD * 0.7), 1))
    }

    const onStart = (e: TouchEvent) => {
      start = refreshing || scroller.scrollTop > 0 || e.touches.length !== 1 ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    const onMove = (e: TouchEvent) => {
      if (!start) return
      const deltaY = e.touches[0].clientY - start.y
      const deltaX = e.touches[0].clientX - start.x
      // Ruch w poziomie to karuzela filtrów albo gest na wierszu, a ruch w górę to zwykłe przewijanie
      if (deltaY <= 0 || scroller.scrollTop > 0 || (distance === 0 && Math.abs(deltaX) > deltaY)) {
        if (distance === 0) start = null
        return
      }
      if (e.cancelable) e.preventDefault()
      distance = Math.min(deltaY * PULL_RESISTANCE, PULL_MAX)
      if (distance >= PULL_THRESHOLD && !armed) {
        armed = true
        haptic("light")
      } else if (distance < PULL_THRESHOLD) {
        armed = false
      }
      paint(distance)
    }

    const onEnd = async () => {
      if (!start) return
      start = null
      const pulled = distance
      distance = 0
      armed = false
      if (pulled < PULL_THRESHOLD) {
        paint(0, true)
        return
      }
      refreshing = true
      paint(PULL_THRESHOLD, true)
      indicator.dataset.refreshing = "true"
      await Promise.all([
        queryClient.refetchQueries({ type: "active" }),
        new Promise((resolve) => setTimeout(resolve, MIN_REFRESH_TIME)),
      ])
      delete indicator.dataset.refreshing
      refreshing = false
      paint(0, true)
    }

    paint(0)
    scroller.addEventListener("touchstart", onStart, { passive: true })
    // Niepasywny, bo tylko tak przy samej górze można powstrzymać systemowe odbicie
    scroller.addEventListener("touchmove", onMove, { passive: false })
    scroller.addEventListener("touchend", onEnd)
    scroller.addEventListener("touchcancel", onEnd)
    return () => {
      scroller.removeEventListener("touchstart", onStart)
      scroller.removeEventListener("touchmove", onMove)
      scroller.removeEventListener("touchend", onEnd)
      scroller.removeEventListener("touchcancel", onEnd)
    }
  }, [enabled, indicatorRef, queryClient, scrollerRef])
}

interface ScreenProps {
  header: ReactNode
  /** Pasek akcji przypięty do dołu; znika, gdy klawiatura zabiera miejsce formularzowi. */
  footer?: ReactNode
  /** Ekran zakładki pamięta przewinięcie zawsze, a nie tylko przy cofaniu. */
  tabRoot?: boolean
  refreshable?: boolean
  className?: string
  children: ReactNode
}

/** Szkielet ekranu: nagłówek, przewijana treść z „pull to refresh”, opcjonalny pasek akcji. */
export function Screen({ header, footer, tabRoot = false, refreshable = true, className, children }: ScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const navigationType = useNavigationType()
  const [enterClass] = useState(() => (tabRoot ? "screen-fade" : navigationType === "PUSH" ? "screen-push" : "screen-fade"))

  useScrollMemory(scrollerRef, tabRoot)
  usePullToRefresh(scrollerRef, indicatorRef, refreshable)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const markScrolled = () => {
      const header = rootRef.current?.querySelector<HTMLElement>("[data-screen-header]")
      if (header) header.style.boxShadow = scroller.scrollTop > 4 ? "0 1px 0 var(--border)" : ""
    }
    const scrollToTop = () => scroller.scrollTo({ top: 0, behavior: "smooth" })

    markScrolled()
    scroller.addEventListener("scroll", markScrolled, { passive: true })
    window.addEventListener(SCROLL_TO_TOP_EVENT, scrollToTop)
    return () => {
      scroller.removeEventListener("scroll", markScrolled)
      window.removeEventListener(SCROLL_TO_TOP_EVENT, scrollToTop)
    }
  }, [])

  return (
    <div ref={rootRef} className={cn("flex h-full min-h-0 flex-col", enterClass)}>
      {header}
      <div className="relative min-h-0 flex-1">
        {refreshable && (
          <div
            ref={indicatorRef}
            aria-hidden
            className="group pointer-events-none absolute left-1/2 top-0 z-10 flex size-10 items-center justify-center rounded-full bg-surface text-primary opacity-0 shadow-raised"
          >
            <RefreshCw className="size-5 group-data-refreshing:animate-spin" />
          </div>
        )}
        <div
          ref={scrollerRef}
          data-screen-scroll
          className="h-full overflow-y-auto overscroll-y-contain"
        >
          <div className={cn("mx-auto w-full max-w-2xl space-y-4 px-4 pt-1", tabRoot ? "pb-dock" : footer ? "pb-6" : "pb-safe-6", className)}>
            {children}
          </div>
        </div>
      </div>
      {footer && (
        <div className="hide-on-keyboard pb-safe-3 relative z-20 shrink-0 border-t border-border/60 bg-surface/95 px-4 pt-3 backdrop-blur-xl">
          <div className="mx-auto max-w-2xl">{footer}</div>
        </div>
      )}
    </div>
  )
}
