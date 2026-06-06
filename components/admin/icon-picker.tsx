"use client"

import React, { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { icons, Search, Check, X, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
}

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

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<keyof typeof CATEGORIES>("popular")
  const [tempSelected, setTempSelected] = useState<string>(value)

  const allIconNames = useMemo(() => Object.keys(icons), [])

  const filteredIcons = useMemo(() => {
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      // Filter from all lucide icons
      return allIconNames
        .filter((name) => name.toLowerCase().includes(query))
        .slice(0, 120) // Limit display to 120 icons for performance
    }
    
    // Otherwise filter by category
    return CATEGORIES[activeCategory]?.icons || []
  }, [searchQuery, activeCategory, allIconNames])

  const SelectedIcon = useMemo(() => {
    if (!value) return null
    const IconComponent = (icons as any)[value]
    return IconComponent ? <IconComponent className="h-5 w-5 mr-2" /> : null
  }, [value])

  const TempSelectedIcon = useMemo(() => {
    if (!tempSelected) return null
    const IconComponent = (icons as any)[tempSelected]
    return IconComponent ? <IconComponent className="h-10 w-10 text-primary" /> : null
  }, [tempSelected])

  const handleIconClick = (iconName: string) => {
    setTempSelected(iconName)
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

  const renderIconItem = (name: string) => {
    const IconComponent = (icons as any)[name]
    if (!IconComponent) return null

    const isSelected = tempSelected === name

    return (
      <button
        key={name}
        type="button"
        onClick={() => handleIconClick(name)}
        className={cn(
          "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 gap-2 cursor-pointer h-24 hover:bg-accent hover:text-accent-foreground",
          isSelected 
            ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-md scale-102" 
            : "border-border/60 bg-card text-foreground"
        )}
        title={name}
      >
        <IconComponent className="h-6 w-6 stroke-[1.75]" />
        <span className="text-[10px] text-muted-foreground truncate w-full text-center select-none font-medium">
          {name}
        </span>
      </button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleCancel()
      else setIsOpen(true)
    }}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex items-center justify-between h-10 px-3 bg-background font-normal text-left border border-input rounded-md hover:bg-accent"
        >
          <div className="flex items-center">
            {SelectedIcon || <HelpCircle className="h-5 w-5 mr-2 text-muted-foreground" />}
            <span className={cn(value ? "text-foreground font-medium" : "text-muted-foreground")}>
              {value || "Wybierz ikonę z biblioteki..."}
            </span>
          </div>
          <span className="text-xs text-muted-foreground bg-accent/80 px-2 py-0.5 rounded border">
            Zmień
          </span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl w-full max-h-[85vh] flex flex-col p-6 rounded-xl border bg-background shadow-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Wybierz ikonę Lucide
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            placeholder="Szukaj ikony po nazwie (np. scale, gavel, home)..."
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
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key as keyof typeof CATEGORIES)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
                  activeCategory === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
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
            <div className="flex items-center justify-center h-16 w-16 rounded-xl border bg-card shadow-inner">
              {TempSelectedIcon || <HelpCircle className="h-8 w-8 text-muted-foreground/40 stroke-[1.5]" />}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Wybrana ikona
              </span>
              <span className="text-sm font-bold text-foreground truncate max-w-[200px]">
                {tempSelected || "Brak (Pusta)"}
              </span>
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
  )
}
