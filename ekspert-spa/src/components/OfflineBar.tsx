import { onlineManager } from "@tanstack/react-query"
import { WifiOff } from "lucide-react"
import { useEffect, useSyncExternalStore } from "react"

const BAR_HEIGHT = "26px"

/** Pasek nad nagłówkiem; zmienna CSS odsuwa nagłówki ekranów, żeby go nie przykrywały. */
export function OfflineBar() {
  const online = useSyncExternalStore(
    (listener) => onlineManager.subscribe(listener),
    () => onlineManager.isOnline()
  )

  useEffect(() => {
    document.documentElement.style.setProperty("--offline-bar", online ? "0px" : BAR_HEIGHT)
  }, [online])

  if (online) return null

  return (
    <div
      role="status"
      // Kolor powierzchni, bo ikony paska stanu nad nim są jasne lub ciemne zależnie od motywu
      className="fixed inset-x-0 top-0 z-30 flex justify-center bg-surface text-secondary"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <p className="flex items-center gap-1.5 text-xs font-medium" style={{ height: BAR_HEIGHT }}>
        <WifiOff className="size-3.5" aria-hidden />
        Brak połączenia z internetem
      </p>
    </div>
  )
}
