"use client"

import { reactionTime } from "@/lib/substitutions/client"
import {
  KOGO,
  STATUS_LABELS,
  SUBSTITUTE_STATUS_LABELS,
  whoList,
  type WhoFlags,
} from "@/lib/substitutions/constants"
import { formatRemaining } from "@/lib/substitutions/time"
import type { PersonCardDTO } from "@/lib/substitutions/types"
import { plural } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { SubstitutionStatus } from "@prisma/client"
import {
  Building2,
  Clock,
  DoorOpen,
  Info,
  Landmark,
  Loader2,
  Lock,
  Monitor,
  Repeat,
  Scale,
  Shield,
  ShieldCheck,
  Star,
  TriangleAlert,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

/**
 * Drobne elementy interfejsu zastępstw — wspólne dla giełdy, kreatora,
 * szczegółów zlecenia, przyjętych i ustawień.
 */

/** Numer zlecenia w ciemnej plakietce: ZAS/2026/0149 */
export function IdBadge({ numer, className }: { numer: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-md bg-zinc-900 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide text-zinc-50 dark:bg-black/60",
        className
      )}
    >
      {numer ?? "Szkic"}
    </span>
  )
}

export function UrgentPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-error px-2.5 py-0.5 text-[11px] font-semibold text-error-foreground">
      <Zap className="h-3 w-3" />
      Pilne
    </span>
  )
}

export function RemotePill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-300">
      <Monitor className="h-3 w-3" />
      Zdalnie
    </span>
  )
}

export function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", className)}>
      {children}
    </span>
  )
}

export function StatusPill({
  status,
  liczbaOfert,
  perspective = "owner",
}: {
  status: SubstitutionStatus
  liczbaOfert?: number
  perspective?: "owner" | "substitute"
}) {
  const fromSubstitute = perspective === "substitute" ? SUBSTITUTE_STATUS_LABELS[status] : undefined
  const base = fromSubstitute ?? STATUS_LABELS[status]
  // Opublikowane z ofertami pokazujemy jak w makiecie: „3 oferty” na złotym tle
  if (perspective === "owner" && status === "OPUBLIKOWANE" && liczbaOfert) {
    return (
      <Pill className="border border-secondary/40 bg-secondary/15 text-secondary">
        {liczbaOfert} {plural(liczbaOfert, "oferta", "oferty", "ofert")}
      </Pill>
    )
  }
  return <Pill className={base.className}>{base.label}</Pill>
}

export function Avatar({ inicjaly, kolor, size = "md" }: { inicjaly: string; kolor: string; size?: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "grid flex-none place-items-center rounded-full font-bold text-white/90",
        size === "md" ? "h-10 w-10 text-[13px]" : "h-8 w-8 text-[11px]"
      )}
      style={{ backgroundColor: kolor }}
    >
      {inicjaly}
    </div>
  )
}

export function StatCard({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="rounded-2xl border border-border/30 bg-card/25 p-4 backdrop-blur-md">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-playfair text-2xl font-semibold tabular-nums text-foreground">
        {value} {unit && <span className="font-sans text-sm font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  )
}

export function ToggleChip({
  active,
  onClick,
  icon: Icon,
  children,
  disabled,
}: {
  active: boolean
  onClick?: () => void
  icon?: LucideIcon
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors disabled:opacity-50",
        active
          ? "border-primary bg-primary/15 font-semibold text-primary"
          : "border-border/60 bg-background/40 text-foreground/80 hover:border-muted-foreground"
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  )
}

/** Odliczanie do daty, odświeżane co 20 s: „13 h 05 min”. */
export function Countdown({ to, className }: { to: string | null; className?: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 20_000)
    return () => clearInterval(timer)
  }, [])
  if (!to) return null
  return <span className={cn("tabular-nums", className)}>{formatRemaining(new Date(to).getTime() - now)}</span>
}

const INFO_STYLES = {
  info: { box: "border-border/40 bg-background/30 text-foreground/80", icon: "text-primary", Icon: Info },
  warn: { box: "border-warning/40 bg-warning/10 text-foreground/80", icon: "text-warning", Icon: TriangleAlert },
  lock: { box: "border-secondary/40 bg-secondary/5 text-foreground/80", icon: "text-secondary", Icon: Lock },
  success: { box: "border-primary/50 bg-primary/10 text-foreground/90", icon: "text-primary", Icon: ShieldCheck },
} as const

export function InfoBox({
  variant = "info",
  icon,
  className,
  children,
}: {
  variant?: keyof typeof INFO_STYLES
  icon?: LucideIcon
  className?: string
  children: React.ReactNode
}) {
  const style = INFO_STYLES[variant]
  const Icon = icon ?? style.Icon
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed", style.box, className)}>
      <Icon className={cn("mt-0.5 h-4 w-4 flex-none", style.icon)} />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/** „Adw.”, „R. pr.”, „Apl.” — apl. z przerywaną ramką, bo działa na upoważnienie. */
export function WhoTags({ flags }: { flags: WhoFlags }) {
  return (
    <div className="flex flex-wrap gap-1">
      {whoList(flags).map((role) => (
        <span
          key={role}
          className={cn(
            "inline-flex h-[22px] items-center rounded-md border border-border/70 px-1.5 text-[11px] font-semibold text-foreground/80",
            role === "APLIKANT" && "border-dashed"
          )}
        >
          {KOGO.find((k) => k.value === role)?.short}
        </span>
      ))}
    </div>
  )
}

const PLACE_ICONS: Record<string, LucideIcon> = {
  SAD: Landmark,
  PROKURATURA: Scale,
  POLICJA: Shield,
  ZAKLAD_KARNY: DoorOpen,
  ORGAN: Building2,
  ZDALNIE: Monitor,
}

export function PlaceIcon({ typ, className }: { typ: string; className?: string }) {
  const Icon = PLACE_ICONS[typ] ?? Landmark
  return <Icon className={cn("h-4 w-4", className)} />
}

export function SectionLabel({ icon: Icon, children, className }: { icon?: LucideIcon; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-2.5 mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground", className)}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </div>
  )
}

export function DefinitionList({ items, labelWidth = "132px" }: { items: [string, React.ReactNode][]; labelWidth?: string }) {
  return (
    <dl className="grid gap-x-3.5 gap-y-2 text-[13.5px] max-sm:grid-cols-1" style={{ gridTemplateColumns: `${labelWidth} minmax(0,1fr)` }}>
      {items
        .filter(([, value]) => value !== null && value !== undefined && value !== "")
        .map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium text-foreground max-sm:mb-1.5">{value}</dd>
          </div>
        ))}
    </dl>
  )
}

/** Karta prawnika przy ofercie: tytuł, izba, liczba zastępstw, ocena, czas reakcji. */
export function PersonMeta({ osoba, compact }: { osoba: PersonCardDTO; compact?: boolean }) {
  const s = osoba.statystyki
  const reaction = reactionTime(s.czasOdpowiedziMin)
  return (
    <div className={cn("flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-muted-foreground", compact && "text-xs")}>
      <span className="inline-flex items-center gap-1">
        <ShieldCheck className="h-3.5 w-3.5" />
        {osoba.izba || "prawnik"}
        {osoba.zweryfikowany && ", zweryfikowany"}
      </span>
      <span className="inline-flex items-center gap-1">
        <Repeat className="h-3.5 w-3.5" />
        {s.zastepstwa} {plural(s.zastepstwa, "zastępstwo", "zastępstwa", "zastępstw")}
      </span>
      {s.ocena != null ? (
        <span className="inline-flex items-center gap-1 text-secondary">
          <Star className="h-3.5 w-3.5 fill-current" />
          {s.ocena.toLocaleString("pl-PL")} ({s.ocen})
        </span>
      ) : (
        <span>bez ocen</span>
      )}
      {reaction && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {reaction}
        </span>
      )}
      {s.rezygnacjePozno > 0 && (
        <span className="text-warning">
          {s.rezygnacjePozno} {plural(s.rezygnacjePozno, "późna rezygnacja", "późne rezygnacje", "późnych rezygnacji")}
        </span>
      )}
    </div>
  )
}

export function LoadingState({ text = "Wczytywanie..." }: { text?: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="space-y-3 text-center">
        <Loader2 className="mx-auto h-9 w-9 animate-spin text-primary" />
        <p className="text-sm font-light text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-muted/40">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-playfair text-base font-semibold text-foreground">{title}</h3>
      {children && <div className="text-sm font-light leading-relaxed text-muted-foreground">{children}</div>}
      {action}
    </div>
  )
}

/** Karta sekcji w stylu panelu (szklana). */
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-border/30 bg-card/25 p-5 backdrop-blur-md sm:p-6", className)}>
      {children}
    </section>
  )
}

export function PanelTitle({ children, right, className }: { children: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-center gap-3", className)}>
      <h2 className="font-playfair text-lg font-semibold text-foreground">{children}</h2>
      {right && <div className="ml-auto flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  )
}

export interface TimelineItem {
  state: "ok" | "teraz" | "przyszle"
  title: string
  note?: string | null
}

/** Oś czasu zlecenia: zaliczone kroki na turkusowo, bieżący ze złotą obwódką. */
export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ul className={cn("relative", className)}>
      {items.map((item, index) => (
        <li
          key={`${item.title}-${index}`}
          className={cn("relative pb-4 pl-7 text-[13.5px] last:pb-0", item.state === "przyszle" && "text-muted-foreground")}
        >
          {index < items.length - 1 && (
            <span
              className={cn("absolute bottom-[-2px] left-[6px] top-4 w-0.5", item.state === "ok" ? "bg-primary" : "bg-border")}
            />
          )}
          <span
            className={cn(
              "absolute left-0 top-[3px] h-3.5 w-3.5 rounded-full border-2 bg-card",
              item.state === "ok" && "border-primary bg-primary",
              item.state === "teraz" && "border-secondary shadow-[0_0_0_4px] shadow-secondary/20",
              item.state === "przyszle" && "border-border"
            )}
          />
          {item.title}
          {item.note && <span className="block text-xs text-muted-foreground">{item.note}</span>}
        </li>
      ))}
    </ul>
  )
}
