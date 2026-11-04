import { CheckCircle2, CircleAlert } from "lucide-react"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { haptic } from "@/lib/native"

const TOAST_DURATION = 3500
const TOAST_WITH_ACTION_DURATION = 6000

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastMessage {
  id: number
  text: string
  tone: "success" | "error"
  action?: ToastAction
}

interface ToastContextValue {
  success: (text: string, action?: ToastAction) => void
  error: (error: unknown) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const nextId = useRef(1)
  const layerRef = useRef<HTMLDivElement>(null)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (text: string, tone: ToastMessage["tone"], action?: ToastAction) => {
      const id = nextId.current++
      setToasts((prev) => [...prev, { id, text, tone, action }])
      setTimeout(() => dismiss(id), action ? TOAST_WITH_ACTION_DURATION : TOAST_DURATION)
      haptic(tone === "success" ? "success" : "error")
    },
    [dismiss]
  )

  const value = useMemo(
    () => ({
      success: (text: string, action?: ToastAction) => push(text, "success", action),
      error: (error: unknown) => push(error instanceof Error ? error.message : String(error), "error"),
    }),
    [push]
  )

  // <dialog> leży w warstwie top layer; toast musi wejść tam po nim, żeby nie został pod arkuszem
  const hasToasts = toasts.length > 0
  useEffect(() => {
    const layer = layerRef.current
    if (!layer || typeof layer.showPopover !== "function") return
    if (!hasToasts) {
      if (layer.matches(":popover-open")) layer.hidePopover()
      return
    }
    if (layer.matches(":popover-open")) layer.hidePopover()
    layer.showPopover()
  }, [hasToasts, toasts.length])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div ref={layerRef} popover="manual" role="status" aria-live="polite" className="toast-layer">
        <div className="flex flex-col items-center gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="toast pointer-events-auto flex w-full max-w-md items-center gap-2.5 rounded-2xl border border-border/60 bg-surface px-3.5 py-3 text-sm shadow-raised"
              onClick={() => !toast.action && dismiss(toast.id)}
            >
              {toast.tone === "success" ? (
                <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden />
              ) : (
                <CircleAlert className="size-5 shrink-0 text-destructive" aria-hidden />
              )}
              <span className="min-w-0 flex-1">{toast.text}</span>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick()
                    dismiss(toast.id)
                  }}
                  className="-my-1 min-h-9 shrink-0 rounded-lg px-2 font-semibold text-primary active:bg-muted"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast wymaga ToastProvider")
  return context
}
