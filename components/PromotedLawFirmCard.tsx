import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, CheckCircle2 } from "lucide-react"
import { PromotionBadge } from "./PromotionBadge"
import Link from "next/link"
import { cn, getSubscriptionBorderColor } from "@/lib/utils"

interface PromotedLawFirmCardProps {
  lawFirm: {
    id: string
    nazwa: string
    nazwaFirmy: string
    logo?: string | null
    opis?: string | null
    miasto: string
    zweryfikowana: boolean
    avgRating: number
    reviewCount: number
    categories: Array<{ nazwa: string }>
    promoted?: boolean
    highlightType?: "PODBICIE_OGLOSZENIA" | "WYROZNIENIE" | "TOP_LISTA" | "STRONA_GLOWNA" | null
    subscriptionType?: string | null
  }
  className?: string
}

export function PromotedLawFirmCard({ lawFirm, className = "" }: PromotedLawFirmCardProps) {
  const isPromoted = lawFirm.promoted && lawFirm.highlightType

  // Get subscription border color for logo
  const logoBorderColor = getSubscriptionBorderColor(lawFirm.subscriptionType)

  // Determine card styling based on promotion type
  const getCardStyle = () => {
    if (!isPromoted) return ""

    switch (lawFirm.highlightType) {
      case "WYROZNIENIE":
        return "border-yellow-500/50 shadow-lg shadow-yellow-500/10 bg-gradient-to-br from-yellow-50/50 to-transparent"
      case "TOP_LISTA":
        return "border-purple-500/50 shadow-lg shadow-purple-500/10 bg-gradient-to-br from-purple-50/50 to-transparent"
      case "STRONA_GLOWNA":
        return "border-blue-500/50 shadow-xl shadow-blue-500/20 bg-gradient-to-br from-blue-50/50 to-transparent"
      case "PODBICIE_OGLOSZENIA":
        return "border-green-500/30 shadow-md shadow-green-500/10"
      default:
        return ""
    }
  }

  return (
    <Card className={`relative hover:shadow-lg transition-all ${getCardStyle()} ${className}`}>
      {/* Promotion Badge - Top Right */}
      {isPromoted && lawFirm.highlightType && (
        <div className="absolute top-3 right-3 z-10">
          <PromotionBadge highlightType={lawFirm.highlightType} />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {/* Logo */}
          {lawFirm.logo ? (
            <img
              src={lawFirm.logo}
              alt={lawFirm.nazwa}
              className={cn("w-16 h-16 rounded-lg object-cover border-2", logoBorderColor)}
            />
          ) : (
            <div className={cn("w-16 h-16 rounded-lg bg-secondary flex items-center justify-center border-2", logoBorderColor)}>
              <span className="text-2xl font-bold text-muted-foreground">
                {lawFirm.nazwa.charAt(0)}
              </span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg truncate">{lawFirm.nazwa}</CardTitle>
              {lawFirm.zweryfikowana && (
                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <CardDescription className="text-sm">{lawFirm.nazwaFirmy}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{lawFirm.miasto}</span>
        </div>

        {/* Rating */}
        {lawFirm.reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{lawFirm.avgRating}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({lawFirm.reviewCount} {lawFirm.reviewCount === 1 ? "opinia" : "opinii"})
            </span>
          </div>
        )}

        {/* Categories */}
        {lawFirm.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lawFirm.categories.slice(0, 3).map((category, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {category.nazwa}
              </Badge>
            ))}
            {lawFirm.categories.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{lawFirm.categories.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Description */}
        {lawFirm.opis && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {lawFirm.opis}
          </p>
        )}

        {/* Action Button */}
        <Link href={`/kancelaria/${lawFirm.id}`} className="block">
          <Button className="w-full" variant={isPromoted ? "default" : "outline"}>
            Zobacz profil
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
