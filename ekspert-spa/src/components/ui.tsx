import { ArrowLeft, ChevronRight, CircleAlert, Eye, EyeOff, Inbox, Loader2, Search, X, type LucideIcon } from "lucide-react"
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type InputHTMLAttributes,
  type ReactNode,
} from "react"
import { Link, useNavigate, type LinkProps } from "react-router-dom"
import { initials } from "@/lib/format"
import type { Tone } from "@/lib/labels"
import { assetUrl } from "@/lib/api"

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

const BUTTON_VARIANTS = {
  primary: "bg-primary-fill text-primary-foreground shadow-sm active:bg-primary-hover",
  soft: "bg-accent text-accent-foreground active:bg-accent/70",
  outline: "border border-input text-foreground active:bg-muted",
  ghost: "text-foreground active:bg-muted",
  danger: "border border-destructive/40 text-destructive active:bg-destructive/10",
}

type ButtonVariant = keyof typeof BUTTON_VARIANTS
type ButtonSize = "md" | "sm"

function buttonClass(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium transition-[background-color,transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
    size === "md" ? "min-h-12 px-4 text-[15px]" : "min-h-10 px-3 text-sm",
    BUTTON_VARIANTS[variant],
    className
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({ variant = "primary", size = "md", loading, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button type="button" disabled={disabled || loading} className={buttonClass(variant, size, className)} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function ButtonLink({ variant = "primary", size = "md", className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export function IconButton({ label, className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full transition-colors active:bg-muted disabled:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ flush, className, children }: { flush?: boolean; className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-border/40 bg-card shadow-card", !flush && "p-4", className)}>{children}</div>
}

export function Section({
  title,
  action,
  className,
  children,
}: {
  title: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn("space-y-2.5", className)}>
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

// Jak w panelu WWW: tinta z obwódką, a oczekiwanie i wyróżnienia są złote
const BADGE_TONES: Record<Tone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  primary: "border-primary/30 bg-primary/10 text-accent-foreground",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-secondary/30 bg-secondary/15 text-secondary",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
}

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-block max-w-full truncate rounded-full border px-2.5 py-0.5 align-middle text-xs font-medium",
        BADGE_TONES[tone]
      )}
    >
      {children}
    </span>
  )
}

const AVATAR_SIZE = {
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-14 text-base",
}

const AVATAR_TINTS = [
  "bg-accent text-accent-foreground",
  "bg-secondary/15 text-secondary",
  "bg-success/15 text-success",
  "bg-warning/15 text-warning",
]

function hashName(name: string) {
  return Array.from(name).reduce((sum, letter) => sum + letter.charCodeAt(0), 0)
}

interface AvatarProps {
  name: string
  src?: string | null
  size?: keyof typeof AVATAR_SIZE
  online?: boolean
  className?: string
}

export function Avatar({ name, src, size = "md", online, className }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  // Domyślna grafika z serwera to szary awatar; inicjały są czytelniejsze
  const image = src && !failed && !src.includes("defailt-user") ? assetUrl(src) : null

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {image ? (
        <img src={image} alt="" onError={() => setFailed(true)} className={cn("rounded-full object-cover", AVATAR_SIZE[size])} />
      ) : (
        <span
          aria-hidden
          className={cn(
            "flex items-center justify-center rounded-full font-semibold",
            AVATAR_SIZE[size],
            AVATAR_TINTS[hashName(name) % AVATAR_TINTS.length]
          )}
        >
          {initials(name)}
        </span>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-success">
          <span className="sr-only">Online</span>
        </span>
      )}
    </span>
  )
}

interface FieldRenderProps {
  id: string
  className: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}

interface FieldProps {
  label: string
  hint?: ReactNode
  error?: string
  children: (props: FieldRenderProps) => ReactNode
}

export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error ?? hint
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children({
        id,
        className: "field",
        "aria-invalid": error ? true : undefined,
        "aria-describedby": message ? messageId : undefined,
      })}
      {message && (
        <p id={messageId} className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
          {message}
        </p>
      )}
    </div>
  )
}

export function PasswordInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={cn(className, "pr-12")} />
      <IconButton
        label={visible ? "Ukryj hasło" : "Pokaż hasło"}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
        className="absolute right-0.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      >
        {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </IconButton>
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="relative min-w-0 flex-1">
      <Search className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        ref={ref}
        type="search"
        enterKeyHint="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="field border-border/40 bg-card pl-10 pr-11 shadow-card focus:border-primary [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <IconButton
          label="Wyczyść wyszukiwanie"
          onClick={() => {
            onChange("")
            ref.current?.focus()
          }}
          className="absolute right-0.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <X className="size-[18px]" aria-hidden />
        </IconButton>
      )}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-lg", className)} />
}

/** Szkielet listy kart: zajmuje tyle miejsca co dane, więc nic nie skacze po ich wczytaniu. */
export function ListSkeleton({ rows = 4, label = "Wczytywanie…" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <Card key={index} className="space-y-3">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-2/3" />
        </Card>
      ))}
    </div>
  )
}

export function RowsSkeleton({ rows = 5, label = "Wczytywanie…" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label}>
      <Card flush className="divide-y divide-border">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <CircleAlert className="size-7 text-destructive" aria-hidden />
      </span>
      <p className="max-w-xs text-sm text-muted-foreground">{error instanceof Error ? error.message : "Wystąpił błąd"}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Spróbuj ponownie
        </Button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  action?: ReactNode
  children?: ReactNode
}

export function EmptyState({ icon: Icon = Inbox, title, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="mb-1 flex size-16 items-center justify-center rounded-full bg-accent">
        <Icon className="size-7 text-accent-foreground" aria-hidden />
      </span>
      <p className="font-medium">{title}</p>
      {children && <div className="max-w-xs text-sm text-muted-foreground">{children}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** `true` wraca o ekran; tekst to dodatkowo ekran docelowy, gdy nie ma dokąd wrócić. */
  back?: string | boolean
  action?: ReactNode
  /** Pasek pod tytułem przypięty razem z nagłówkiem, np. przełącznik sekcji. */
  children?: ReactNode
}

export function PageHeader({ title, subtitle, back, action, children }: PageHeaderProps) {
  const navigate = useNavigate()

  const goBack = () => {
    // Sprawdzamy historię routera; navigate(ścieżka) dokładałby wpis i „wstecz” tworzyłoby pętlę
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1)
    else navigate(typeof back === "string" ? back : "/start", { replace: true })
  }

  return (
    <header
      data-screen-header
      className="pt-safe relative z-20 shrink-0 bg-background/90 backdrop-blur-xl transition-shadow duration-200"
    >
      <div className={cn("mx-auto flex min-h-14 max-w-2xl items-center gap-1", back ? "px-1.5" : "px-4")}>
        {back && (
          <IconButton label="Wróć" onClick={goBack}>
            <ArrowLeft className="size-[22px]" aria-hidden />
          </IconButton>
        )}
        <div className="min-w-0 flex-1 py-1.5">
          <h1 className={cn("truncate font-serif font-semibold leading-tight", back ? "text-lg" : "text-[26px]")}>{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="flex shrink-0 items-center">{action}</div>}
      </div>
      {children && <div className="mx-auto max-w-2xl px-4 pb-2.5">{children}</div>}
    </header>
  )
}

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  label: string
}

/** Przełącznik równorzędnych sekcji ekranu; suwak pokazuje wybraną pozycję. */
export function Segmented<T extends string>({ value, onChange, options, label }: SegmentedProps<T>) {
  const index = options.findIndex((option) => option.value === value)
  return (
    <div
      role="tablist"
      aria-label={label}
      className="relative grid rounded-xl bg-muted p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {index !== -1 && (
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 rounded-[9px] bg-surface shadow-sm transition-transform duration-200 ease-out"
          style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
        />
      )}
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative min-h-9 truncate rounded-[9px] px-1 text-[13px] font-medium transition-colors",
            value === option.value ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

interface ChipsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string; count?: number }[]
  label: string
  /** Pozycje zawijają się zamiast przewijać; do krótkich list w formularzach. */
  wrap?: boolean
}

/** Filtry: przewijany poziomo pasek, który sam dosuwa wybraną pozycję do środka. */
export function Chips<T extends string>({ value, onChange, options, label, wrap }: ChipsProps<T>) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    const selected = container?.querySelector<HTMLElement>('[aria-checked="true"]')
    if (!container || !selected || wrap) return
    const left = selected.offsetLeft - (container.clientWidth - selected.offsetWidth) / 2
    container.scrollTo({ left, behavior: "smooth" })
  }, [value, wrap])

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      className={cn("relative flex gap-2", wrap ? "flex-wrap" : "no-scrollbar -mx-4 overflow-x-auto px-4 py-0.5")}
    >
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors active:opacity-70",
              selected ? "border-transparent bg-primary-fill text-primary-foreground" : "border-border/60 bg-card text-muted-foreground"
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cn("tabular-nums", selected ? "opacity-80" : "opacity-60")}>{option.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className={cn("flex min-h-14 items-center justify-between gap-4 py-2.5", disabled && "opacity-60")}>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>}
      </span>
      <span className="relative h-[30px] w-[50px] shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-full bg-input transition-colors checked:bg-primary-fill disabled:cursor-not-allowed"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-0.5 top-0.5 size-[26px] rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-5"
        />
      </span>
    </label>
  )
}

interface ListRowProps {
  icon?: LucideIcon
  label: string
  hint?: string
  value?: ReactNode
  to?: string
  onClick?: () => void
  danger?: boolean
}

/** Wiersz listy ustawień; bez `to` i `onClick` jest zwykłą pozycją informacyjną. */
export function ListRow({ icon: Icon, label, hint, value, to, onClick, danger }: ListRowProps) {
  const interactive = !!(to || onClick)
  const content = (
    <>
      {Icon && (
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            danger ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"
          )}
        >
          <Icon className="size-[18px]" aria-hidden />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm font-medium", danger && "text-destructive")}>{label}</span>
        {hint && <span className="block truncate text-xs text-muted-foreground">{hint}</span>}
      </span>
      {value !== undefined && <span className="shrink-0 text-right text-sm text-muted-foreground">{value}</span>}
      {interactive && <ChevronRight className="size-[18px] shrink-0 text-muted-foreground/70" aria-hidden />}
    </>
  )
  const className = cn(
    "flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left",
    interactive && "transition-colors active:bg-muted"
  )

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    )
  }
  return <div className={className}>{content}</div>
}

/** Wiersz z akcją odsłanianą przesunięciem w lewo; to natywny scroll, więc działa jak w systemie. */
export function SwipeRow({ action, children }: { action: ReactNode; children: ReactNode }) {
  return (
    // Marginesy ujemne: przewijany kontener ucinałby cień i obwódkę karty
    <div className="no-scrollbar -mx-4 -my-2 flex snap-x snap-mandatory scroll-px-4 overflow-x-auto overscroll-x-contain px-4 py-2">
      <div className="w-full shrink-0 snap-start">{children}</div>
      <div className="flex shrink-0 snap-end pl-4">{action}</div>
    </div>
  )
}

export function SwipeAction({ icon: Icon, label, className, ...props }: ComponentProps<"button"> & { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-[84px] flex-col items-center justify-center gap-1 rounded-2xl text-xs font-medium active:opacity-80",
        className
      )}
      {...props}
    >
      <Icon className="size-5" aria-hidden />
      {label}
    </button>
  )
}

const ALLOWED_TAGS = new Set(["P", "BR", "UL", "OL", "LI", "STRONG", "B", "EM", "I", "H1", "H2", "H3", "H4"])

// Opisy spraw wpisują klienci, a w tym WebView trzymany jest token sesji — zostawiamy
// tylko znaczniki formatujące i usuwamy wszystkie atrybuty.
function sanitize(node: Element) {
  for (const child of Array.from(node.children)) {
    sanitize(child)
    if (ALLOWED_TAGS.has(child.tagName)) {
      for (const attribute of Array.from(child.attributes)) child.removeAttribute(attribute.name)
    } else {
      child.replaceWith(...Array.from(child.childNodes))
    }
  }
}

export function SafeHtml({ html, className }: { html: string; className?: string }) {
  const safe = useMemo(() => {
    const doc = new DOMParser().parseFromString(html, "text/html")
    for (const element of Array.from(doc.body.querySelectorAll("script, style, iframe, object, embed"))) element.remove()
    sanitize(doc.body)
    return doc.body.innerHTML
  }, [html])

  return <div className={cn("rich-text text-sm leading-relaxed", className)} dangerouslySetInnerHTML={{ __html: safe }} />
}

export function stripHtml(html: string) {
  return new DOMParser().parseFromString(html, "text/html").body.textContent ?? ""
}
