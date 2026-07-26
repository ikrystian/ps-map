"use client"

import React, { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AnimateUiIcon } from "@/components/animate-ui/icons/animate-ui-icon"
import {
  ANIMATE_UI_ICON_KEYWORDS,
  ANIMATE_UI_ICON_NAMES,
} from "@/components/animate-ui/icons/registry"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getAnimateUiIconName,
  isAnimateUiIconValue,
  toAnimateUiIconValue,
} from "@/lib/category-icons"
import { icons, Search, Check, X, HelpCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
}

type IconLibrary = "lucide" | "animate-ui"

const POPULAR_ICONS = [
  "Scale", "Gavel", "Shield", "ShieldCheck", "ShieldAlert", "Briefcase", "Handshake",
  "Coins", "DollarSign", "CreditCard", "Wallet", "Receipt", "Percent", "TrendingUp",
  "Home", "User", "Users", "UserCheck", "Heart", "Activity", "HeartPulse", "Stethoscope",
  "Mail", "Phone", "MessageSquare", "Globe", "Search", "Settings", "Zap"
]

const CATEGORIES = {
  popular: {
    label: "Popularne",
    icons: POPULAR_ICONS
  },
  law: {
    label: "Prawo i Pomoc",
    icons: [
      "Scale", "Gavel", "Shield", "ShieldCheck", "ShieldAlert", "Briefcase", "Handshake",
      "FileText", "FileCheck", "FileSignature", "FileWarning", "Fingerprint", "Key", "Lock",
      "Unlock", "BookOpen", "Landmark", "Library", "Award", "Trophy", "Vote", "Hammer"
    ]
  },
  business: {
    label: "Biznes i Finanse",
    icons: [
      "Coins", "DollarSign", "CreditCard", "Wallet", "Receipt", "Percent", "TrendingUp",
      "TrendingDown", "LineChart", "PieChart", "Target", "Building", "Building2",
      "Factory", "Store", "Network", "Presentation", "FolderOpen", "Compass", "Globe"
    ]
  },
  family: {
    label: "Ludzie i Zdrowie",
    icons: [
      "User", "Users", "UserCheck", "UserX", "Heart", "Baby", "Activity", "HeartPulse",
      "Stethoscope", "Brain", "Flame", "Gift", "Smile", "Frown", "Sparkles", "GraduationCap"
    ]
  },
  property: {
    label: "Dom i Mienie",
    icons: [
      "Home", "Warehouse", "Bed", "Bath", "KeyRound", "Lamp", "Armchair", "Car", "Truck",
      "Plane", "Ship", "MapPin", "Map", "Compass", "Anchor", "HardHat", "Construction"
    ]
  },
  communication: {
    label: "Komunikacja i Inne",
    icons: [
      "Mail", "Phone", "PhoneCall", "MessageSquare", "MessageCircle", "Send", "Clock",
      "Calendar", "Bell", "Search", "Settings", "Settings2", "HelpCircle", "Info",
      "AlertTriangle", "File", "Folder", "HardDrive", "Server", "Laptop", "Smartphone", "Zap"
    ]
  }
}

// Animate UI udostępnia ~260 ikon — grupy ułatwiają przeglądanie, a zakładka
// "Wszystkie" daje dostęp do całej biblioteki.
const ANIMATE_UI_GROUPS = {
  popular: {
    label: "Popularne",
    icons: [
      "gavel", "hammer", "badge-check", "clipboard-check", "clipboard-list", "lock-keyhole",
      "key", "fingerprint", "users-round", "user-round", "phone-call", "send",
      "message-square-text", "search", "star", "sparkles", "party-popper", "thumbs-up",
      "chart-line", "gauge", "route", "compass", "map-pin", "clock", "timer", "layers",
      "settings", "bell-ring", "check-check", "circle-check-big"
    ]
  },
  law: {
    label: "Prawo i Dokumenty",
    icons: [
      "gavel", "hammer", "axe", "pickaxe", "clipboard", "clipboard-check", "clipboard-list",
      "list", "badge-check", "check", "check-check", "check-line", "circle-check",
      "circle-check-big", "copy", "paperclip", "kanban", "square-kanban",
      "square-dashed-kanban", "layers", "layers-2", "frame", "crop", "binary", "terminal",
      "blocks"
    ]
  },
  security: {
    label: "Bezpieczeństwo",
    icons: [
      "lock", "lock-open", "lock-keyhole", "lock-keyhole-open", "key", "fingerprint", "cctv",
      "bell", "bell-ring", "bell-off", "circle-x", "cross", "x", "equal-not", "contrast",
      "blend", "log-in", "log-out", "radio-tower", "pin", "pin-off", "trash-2"
    ]
  },
  people: {
    label: "Ludzie i Kontakt",
    icons: [
      "user", "user-round", "users", "users-round", "accessibility", "message-square",
      "message-square-text", "message-square-heart", "message-square-more",
      "message-square-plus", "message-square-quote", "message-square-warning",
      "message-circle", "message-circle-heart", "message-circle-more",
      "message-circle-question", "message-circle-warning", "phone-call", "send",
      "send-horizontal", "bot", "bot-message-square", "thumbs-up", "thumbs-down",
      "party-popper"
    ]
  },
  business: {
    label: "Biznes i Wykresy",
    icons: [
      "chart-bar", "chart-bar-increasing", "chart-bar-decreasing", "chart-column",
      "chart-column-increasing", "chart-column-decreasing", "chart-line", "chart-spline",
      "chart-scatter", "chart-no-axes-column", "gauge", "activity", "layout-dashboard",
      "blocks", "forklift", "ev-charger", "route", "router", "orbit", "sliders-horizontal",
      "sliders-vertical", "settings", "cog", "star", "sparkles"
    ]
  },
  interface: {
    label: "Interfejs",
    icons: [
      "arrow-up", "arrow-down", "arrow-left", "arrow-right", "arrow-up-down", "chevron-up",
      "chevron-down", "chevron-left", "chevron-right", "chevron-up-down", "chevron-left-right",
      "move-up", "move-down", "move-left", "move-right", "menu", "ellipsis",
      "ellipsis-vertical", "expand", "shrink", "maximize", "minimize", "external-link", "link",
      "link-2", "plus", "square-plus", "circle-plus", "square-x", "refresh-cw", "rotate-cw",
      "download", "upload", "scissors"
    ]
  },
  all: {
    label: "Wszystkie",
    icons: ANIMATE_UI_ICON_NAMES
  }
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<keyof typeof CATEGORIES>("popular")
  const [activeAnimateGroup, setActiveAnimateGroup] = useState<keyof typeof ANIMATE_UI_GROUPS>("popular")
  const [library, setLibrary] = useState<IconLibrary>(() => (isAnimateUiIconValue(value) ? "animate-ui" : "lucide"))
  const [tempSelected, setTempSelected] = useState<string>(value)
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)
  const [isPreviewHovered, setIsPreviewHovered] = useState(false)

  // Synchronize tempSelected with value when value changes or dialog opens
  React.useEffect(() => {
    setTempSelected(value)
    setLibrary(isAnimateUiIconValue(value) ? "animate-ui" : "lucide")
  }, [value, isOpen])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setTempSelected("")
  }

  const allIconNames = useMemo(() => Object.keys(icons), [])

  const filteredIcons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (library === "animate-ui") {
      if (query !== "") {
        return ANIMATE_UI_ICON_NAMES.filter(
          (name) =>
            name.includes(query) ||
            (ANIMATE_UI_ICON_KEYWORDS[name] ?? []).some((keyword) => keyword.includes(query)),
        ).slice(0, 120)
      }
      return ANIMATE_UI_GROUPS[activeAnimateGroup]?.icons ?? []
    }

    if (query !== "") {
      // Filter from all lucide icons
      return allIconNames
        .filter((name) => name.toLowerCase().includes(query))
        .slice(0, 120) // Limit display to 120 icons for performance
    }

    // Otherwise filter by category
    return CATEGORIES[activeCategory]?.icons || []
  }, [searchQuery, library, activeCategory, activeAnimateGroup, allIconNames])

  const handleLibraryChange = (nextLibrary: IconLibrary) => {
    setLibrary(nextLibrary)
    setSearchQuery("")
    setHoveredIcon(null)
  }

  const handleIconClick = (iconValue: string) => {
    setTempSelected(iconValue)
  }

  const handleConfirm = () => {
    onChange(tempSelected)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleCancel = () => {
    setTempSelected(value)
    setIsOpen(false)
    setSearchQuery("")
  }

  /** Podgląd zapisanej wartości — obsługuje obie biblioteki. */
  const renderIconPreview = (iconValue: string, className: string, animate = false) => {
    const animateUiName = getAnimateUiIconName(iconValue)
    if (animateUiName) {
      return <AnimateUiIcon name={animateUiName} animate={animate} className={className} />
    }

    const IconComponent = (icons as any)[iconValue]
    return IconComponent ? <IconComponent className={className} /> : null
  }

  const renderIconItem = (name: string) => {
    const isAnimateUi = library === "animate-ui"
    const iconValue = isAnimateUi ? toAnimateUiIconValue(name) : name

    if (!isAnimateUi && !(icons as any)[name]) return null

    const isSelected = tempSelected === iconValue

    return (
      <button
        key={iconValue}
        type="button"
        onClick={() => handleIconClick(iconValue)}
        onMouseEnter={() => setHoveredIcon(iconValue)}
        onMouseLeave={() => setHoveredIcon((current) => (current === iconValue ? null : current))}
        onFocus={() => setHoveredIcon(iconValue)}
        onBlur={() => setHoveredIcon((current) => (current === iconValue ? null : current))}
        className={cn(
          "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 gap-2 cursor-pointer h-24 hover:bg-accent hover:text-accent-foreground",
          isSelected
            ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-md scale-102"
            : "border-border/60 bg-card text-foreground"
        )}
        title={name}
      >
        {isAnimateUi ? (
          <AnimateUiIcon
            name={name}
            animate={hoveredIcon === iconValue}
            preload={false}
            className="h-6 w-6"
          />
        ) : (
          renderIconPreview(name, "h-6 w-6 stroke-[1.75]")
        )}
        <span className="text-[10px] text-muted-foreground truncate w-full text-center select-none font-medium">
          {name}
        </span>
      </button>
    )
  }

  const tabs =
    library === "animate-ui"
      ? Object.entries(ANIMATE_UI_GROUPS).map(([key, group]) => ({ key, label: group.label }))
      : Object.entries(CATEGORIES).map(([key, category]) => ({ key, label: category.label }))

  const activeTab = library === "animate-ui" ? activeAnimateGroup : activeCategory

  const handleTabChange = (key: string) => {
    if (library === "animate-ui") setActiveAnimateGroup(key as keyof typeof ANIMATE_UI_GROUPS)
    else setActiveCategory(key as keyof typeof CATEGORIES)
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) handleCancel()
        else setIsOpen(true)
      }}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="flex-1 flex items-center justify-between h-10 px-3 bg-background font-normal text-left border border-input rounded-md hover:bg-accent min-w-0"
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              {renderIconPreview(value, "h-5 w-5 shrink-0") || (
                <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <span className={cn(value ? "text-foreground font-medium" : "text-muted-foreground", "truncate")}>
                {getAnimateUiIconName(value) || value || "Wybierz ikonę z biblioteki..."}
              </span>
              {isAnimateUiIconValue(value) && (
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                  animowana
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground bg-accent/80 px-2 py-0.5 rounded border shrink-0 ml-2">
              Zmień
            </span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl w-full max-h-[85vh] flex flex-col p-6 rounded-xl border bg-background shadow-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Wybierz ikonę
          </DialogTitle>
        </DialogHeader>

        {/* Wybór biblioteki ikon */}
        <div className="grid grid-cols-2 gap-1 p-1 mb-4 rounded-lg bg-accent/40 shrink-0">
          <button
            type="button"
            onClick={() => handleLibraryChange("lucide")}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer",
              library === "lucide"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Lucide
            <span className="text-[10px] font-medium text-muted-foreground">statyczne</span>
          </button>
          <button
            type="button"
            onClick={() => handleLibraryChange("animate-ui")}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer",
              library === "animate-ui"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Animate UI
            <span className="text-[10px] font-medium text-muted-foreground">animowane</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            placeholder={
              library === "animate-ui"
                ? "Szukaj ikony po nazwie (np. gavel, lock, users)..."
                : "Szukaj ikony po nazwie (np. scale, gavel, home)..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 border border-input bg-background/50 focus-visible:ring-primary focus-visible:border-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground text-xs"
            >
              Wyczyść
            </button>
          )}
        </div>

        {/* Categories Tabs (only visible when not searching) */}
        {!searchQuery && (
          <div className="flex gap-1 overflow-x-auto pb-3 mb-2 border-b border-border/40 scrollbar-none shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {library === "animate-ui" && (
          <p className="text-xs text-muted-foreground mb-2 shrink-0">
            Najedź na ikonę, aby zobaczyć jej animację. Na stronie głównej odtworzy się po
            najechaniu na kafelek kategorii.
          </p>
        )}

        {/* Grid Scroll Area */}
        <ScrollArea className="flex-1 min-h-[300px] border rounded-lg bg-accent/10 p-4">
          {filteredIcons.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {filteredIcons.map((name) => renderIconItem(name))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
              <Search className="h-10 w-10 text-muted-foreground/50 stroke-[1.5]" />
              <p className="text-sm font-medium">Brak pasujących ikon</p>
              <p className="text-xs">Spróbuj wpisać inną nazwę</p>
            </div>
          )}
        </ScrollArea>

        {/* Footer with Selection Status and Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t pt-4 mt-4 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center h-16 w-16 rounded-xl border bg-card shadow-inner"
              onMouseEnter={() => setIsPreviewHovered(true)}
              onMouseLeave={() => setIsPreviewHovered(false)}
            >
              {renderIconPreview(tempSelected, "h-10 w-10 text-primary", isPreviewHovered) || (
                <HelpCircle className="h-8 w-8 text-muted-foreground/40 stroke-[1.5]" />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Wybrana ikona
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground truncate max-w-[150px]">
                  {getAnimateUiIconName(tempSelected) || tempSelected || "Brak (Pusta)"}
                </span>
                {tempSelected && (
                  <button
                    type="button"
                    onClick={() => setTempSelected("")}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors underline decoration-dotted"
                  >
                    wyczyść
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 sm:flex-none"
            >
              <X className="h-4 w-4 mr-2" />
              Anuluj
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none"
            >
              <Check className="h-4 w-4 mr-2" />
              Zatwierdź
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    {value && (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleClear}
        className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
        title="Wyczyść ikonę"
      >
        <X className="h-4 w-4" />
      </Button>
    )}
  </div>
)
}
