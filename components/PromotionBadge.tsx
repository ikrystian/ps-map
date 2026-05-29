import { Badge } from "@/components/ui/badge"
import { Award, Home, Sparkles, TrendingUp } from "lucide-react"

interface PromotionBadgeProps {
  highlightType: "PODBICIE_OGLOSZENIA" | "WYROZNIENIE" | "TOP_LISTA" | "STRONA_GLOWNA" | null
  className?: string
}

export function PromotionBadge({ highlightType, className = "" }: PromotionBadgeProps) {
  if (!highlightType) return null

  const config = {
    PODBICIE_OGLOSZENIA: {
      label: "Promowane",
      icon: TrendingUp,
      color: "bg-green-500/10 text-green-700 border-green-500/20",
    },
    WYROZNIENIE: {
      label: "Wyróżnione",
      icon: Sparkles,
      color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    },
    TOP_LISTA: {
      label: "Top Kancelaria",
      icon: Award,
      color: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    },
    STRONA_GLOWNA: {
      label: "Premium",
      icon: Home,
      color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    },
  }

  const { label, icon: Icon, color } = config[highlightType]

  return (
    <Badge variant="outline" className={`gap-1 ${color} ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
