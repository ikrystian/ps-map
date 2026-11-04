import { X, type LucideIcon } from "lucide-react"
import { useEffect, useRef, type PointerEvent, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { pushBackHandler } from "@/lib/native"
import { Button, IconButton, cn } from "./ui"

const CLOSE_ANIMATION = 200
const DISMISS_DISTANCE = 110

interface SheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Modalny arkusz wysuwany od dołu ekranu, oparty na natywnym <dialog>; zamyka go też ruch w dół. */
export function Sheet({ open, title, onClose, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const drag = useRef<{ startY: number; offset: number } | null>(null)
  // Rodzic zwykle zeruje dane razem z `open`; treść ma zostać widoczna do końca animacji
  const shown = useRef({ title, children })
  if (open) shown.current = { title, children }

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open) {
      dialog.style.transform = ""
      dialog.style.transition = ""
      delete dialog.dataset.dragged
      dialog.dataset.state = "open"
      if (!dialog.open) dialog.showModal()
      return pushBackHandler(() => onCloseRef.current())
    }
    if (!dialog.open) return
    dialog.dataset.state = "closed"
    const timer = setTimeout(() => dialog.close(), CLOSE_ANIMATION)
    return () => clearTimeout(timer)
  }, [open])

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { startY: e.clientY, offset: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const moveDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !ref.current) return
    drag.current.offset = Math.max(0, e.clientY - drag.current.startY)
    ref.current.style.transition = "none"
    ref.current.style.transform = `translate3d(0, ${drag.current.offset}px, 0)`
  }

  const endDrag = () => {
    if (!drag.current || !ref.current) return
    const { offset } = drag.current
    drag.current = null
    ref.current.style.transition = "transform 0.2s ease-out"
    if (offset > DISMISS_DISTANCE) {
      // Arkusz zjeżdża z miejsca puszczenia; animacja zamknięcia wystartowałaby od góry
      ref.current.dataset.dragged = "true"
      ref.current.style.transform = "translate3d(0, 100%, 0)"
      onCloseRef.current()
    } else {
      ref.current.style.transform = ""
    }
  }

  // Portal: wewnątrz ekranu arkusz łapałby odstępy `space-y` i przewijanie pól formularza
  return createPortal(
    <dialog
      ref={ref}
      className="sheet"
      aria-label={shown.current.title}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="flex max-h-[inherit] flex-col">
        <div
          className="shrink-0 cursor-grab touch-none select-none"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span aria-hidden className="mx-auto mt-2.5 block h-1 w-10 rounded-full bg-input" />
          <div className="flex min-h-12 items-center justify-between gap-2 pl-5 pr-2 pt-1">
            <h2 className="font-serif text-lg font-semibold leading-tight">{shown.current.title}</h2>
            <IconButton
              label="Zamknij"
              onClick={onClose}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-muted-foreground"
            >
              <X className="size-5" aria-hidden />
            </IconButton>
          </div>
        </div>
        <div className="pb-safe-5 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 pt-2">
          {shown.current.children}
        </div>
      </div>
    </dialog>,
    document.body
  )
}

interface ConfirmSheetProps {
  open: boolean
  title: string
  children?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  disabled?: boolean
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmSheet({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = "Anuluj",
  danger,
  disabled,
  loading,
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  return (
    <Sheet open={open} title={title} onClose={onClose}>
      {children && <div className="text-sm text-muted-foreground">{children}</div>}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={disabled} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Sheet>
  )
}

export interface SheetAction {
  label: string
  hint?: string
  icon: LucideIcon
  danger?: boolean
  onSelect: () => void
}

interface ActionSheetProps {
  open: boolean
  title: string
  actions: SheetAction[]
  onClose: () => void
}

/** Lista akcji drugorzędnych, żeby karta na liście nie była zastawiona przyciskami. */
export function ActionSheet({ open, title, actions, onClose }: ActionSheetProps) {
  return (
    <Sheet open={open} title={title} onClose={onClose}>
      <ul className="-mx-2 -mt-2">
        {actions.map(({ label, hint, icon: Icon, danger, onSelect }) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => {
                onClose()
                onSelect()
              }}
              className="flex min-h-14 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors active:bg-muted"
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  danger ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[15px] font-medium", danger && "text-destructive")}>{label}</span>
                {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
