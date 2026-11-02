"use client"

import { getSocket } from "@/lib/socket-client"
import { useEffect, useState } from "react"

/** Wysyłane po zmianie statusu zgłoszenia — licznik w menu odświeża się od razu, bez czekania na odpytywanie */
const BUG_REPORTS_CHANGED_EVENT = "admin:bug-reports-changed"
const POLL_INTERVAL_MS = 60_000
const BUG_REPORTS_PATH = "/admin/bug-reports"

export function notifyBugReportsChanged() {
  window.dispatchEvent(new Event(BUG_REPORTS_CHANGED_EVENT))
}

/**
 * Liczba nowych (nierozpatrzonych) zgłoszeń błędów do licznika w menu admina.
 * Odświeżana przy starcie, co minutę, po powiadomieniu Socket.IO o nowym zgłoszeniu
 * oraz po `notifyBugReportsChanged()`.
 */
export function useNewBugReportsCount(enabled: boolean): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!enabled) return

    const refresh = () => {
      fetch("/api/admin/bug-reports/new-count")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (typeof data?.count === "number") setCount(data.count)
        })
        .catch(() => {
          // Licznik to dodatek — przy błędzie sieci zostaje poprzednia wartość
        })
    }

    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)

    const socket = getSocket()
    // Nowe zgłoszenie błędu przychodzi do adminów jako powiadomienie linkujące do tej listy
    const handleNotification = (notification: { linkUrl?: string | null }) => {
      if (notification?.linkUrl === BUG_REPORTS_PATH) refresh()
    }
    socket.on("notification:new", handleNotification)
    window.addEventListener(BUG_REPORTS_CHANGED_EVENT, refresh)

    return () => {
      clearInterval(interval)
      socket.off("notification:new", handleNotification)
      window.removeEventListener(BUG_REPORTS_CHANGED_EVENT, refresh)
    }
  }, [enabled])

  return count
}
