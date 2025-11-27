"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    MapPin,
    Star,
    CheckCircle2,
    Phone,
    Mail,
    Globe,
    ArrowUpRight,
    Clock,
    Award
} from "lucide-react"
import { cn } from "@/lib/utils"

// Helper function to check if law firm is open (copied from pages)
const isLawFirmOpen = (godzinyOtwarcia?: Record<string, string>, statusGodzinyOtwarcia?: boolean) => {
    if (!statusGodzinyOtwarcia || !godzinyOtwarcia) return null

    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const dayMap: Record<number, string> = {
        0: "niedziela",
        1: "poniedzialek",
        2: "wtorek",
        3: "sroda",
        4: "czwartek",
        5: "piatek",
        6: "sobota",
    }

    const todayKey = dayMap[currentDay]
    const todayHours = godzinyOtwarcia[todayKey]

    if (!todayHours || todayHours.toLowerCase() === "zamknięte" || todayHours.trim() === "") {
        return false
    }

    const [from, to] = todayHours.split("-").map(t => t.trim())
    if (!from || !to) return null

    const [fromHour, fromMin] = from.split(":").map(Number)
    const [toHour, toMin] = to.split(":").map(Number)

    const fromTime = fromHour * 60 + fromMin
    const toTime = toHour * 60 + toMin

    return currentTime >= fromTime && currentTime <= toTime
}

export interface LawFirm {
    id: string
    slug: string
    nazwa: string
    nazwaFirmy: string
    logo?: string
    opis?: string
    miasto: string
    voivodeship: {
        nazwa: string
    }
    zweryfikowana: boolean
    onlineOnly: boolean
    categories: Array<{
        nazwa: string
        slug: string
    }>
    avgRating: number
    reviewCount: number
    pakietSubskrypcji?: string
    statusGodzinyOtwarcia?: boolean
    godzinyOtwarcia?: Record<string, string>
    telefon?: string
    email?: string
    stronaWww?: string
}

interface LawFirmListItemProps {
    lawFirm: LawFirm
}

export function LawFirmListItem({ lawFirm }: LawFirmListItemProps) {
    const isOpen = isLawFirmOpen(lawFirm.godzinyOtwarcia, lawFirm.statusGodzinyOtwarcia)
    const isBiznesPlan = lawFirm.pakietSubskrypcji === "BIZNES"

    return (
        <Link href={`/ekspert/${lawFirm.slug}`} className="block group">
            <Card className={cn(
                "overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50 bg-[#1c1c1c]",
                isBiznesPlan ? "border-primary/20" : ""
            )}>
                <div className="flex flex-col md:flex-row h-full">
                    {/* Left Column - Image */}
                    <div className="relative w-full md:w-[400px] h-[250px] md:h-auto flex-shrink-0 bg-muted">
                        {/* Main Image - Placeholder if no image, ideally we'd have a cover image but using logo or generic for now if no cover */}
                        {/* Since the interface doesn't have a cover image, I'll use a placeholder or the logo if it's high res, 
                but the design implies a photo of the lawyer. For now I will use a placeholder gradient or the logo in a creative way 
                if no specific cover image exists in the data. 
                However, looking at the design, it looks like a profile photo. 
                I'll assume for now we might want to use the logo or a placeholder. 
                Let's use a generic lawyer placeholder if no specific image is available, 
                but actually the design shows a person. 
                If `logo` is the only image we have, we might need to stick with that or check if there's another field.
                The current interface only has `logo`. I will use `logo` but maybe styled differently or a placeholder.
                Wait, the design has a "Logo" in the bottom right corner AND a main photo. 
                If the data only has `logo`, I can't invent a photo. 
                I will use a dark gradient background with the logo centered if no other image.
            */}
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                            {lawFirm.logo ? (
                                <Image
                                    src={lawFirm.logo}
                                    alt={lawFirm.nazwa}
                                    fill
                                    className="object-cover opacity-50 group-hover:opacity-60 transition-opacity"
                                />
                            ) : (
                                <div className="text-neutral-600">
                                    <Avatar className="w-32 h-32 opacity-20" />
                                </div>
                            )}
                        </div>

                        {/* Status Badge - Top Right */}
                        <div className="absolute top-4 right-4 z-10">
                            {isOpen === true && (
                                <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white border-0 px-3 py-1">
                                    Otwarte
                                </Badge>
                            )}
                            {isOpen === false && (
                                <Badge className="bg-rose-500/90 hover:bg-rose-500 text-white border-0 px-3 py-1">
                                    Zamknięte
                                </Badge>
                            )}
                        </div>

                        {/* Rating - Bottom Left */}
                        <div className="absolute bottom-4 left-4 z-10">
                            <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-md flex items-center gap-2 shadow-lg">
                                <span className="text-lg font-bold">{lawFirm.avgRating.toFixed(1)}</span>
                                <div className="flex flex-col text-[10px] leading-tight">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("w-2 h-2 fill-current", i < Math.round(lawFirm.avgRating) ? "text-white" : "text-white/30")} />
                                        ))}
                                    </div>
                                    <span className="opacity-90">{lawFirm.reviewCount} opinii</span>
                                </div>
                            </div>
                        </div>

                        {/* Logo Overlay - Bottom Right */}
                        {lawFirm.logo && (
                            <div className="absolute bottom-4 right-4 z-10">
                                <div className="w-12 h-12 rounded-full border-2 border-amber-400/50 bg-black/80 p-1 shadow-xl overflow-hidden">
                                    <Image
                                        src={lawFirm.logo}
                                        alt="Logo"
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between relative bg-[#1c1c1c]">
                        {/* Top Section */}
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-2xl font-serif text-white mb-2 group-hover:text-primary transition-colors">
                                        {lawFirm.nazwa}
                                    </h3>
                                    <div className="flex items-center text-emerald-500 mb-4">
                                        <MapPin className="w-4 h-4 mr-1.5" />
                                        <span className="text-sm font-medium">
                                            {lawFirm.miasto}, {lawFirm.voivodeship.nazwa}
                                        </span>
                                    </div>
                                </div>
                                {/* Award Icon */}
                                <div className="text-amber-400">
                                    <Award className="w-10 h-10" />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3">
                                    {lawFirm.opis || "Brak opisu kancelarii."}
                                </p>
                            </div>

                            {/* Badges/Categories */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {lawFirm.categories.slice(0, 3).map((cat) => (
                                    <Badge
                                        key={cat.slug}
                                        variant="secondary"
                                        className="bg-[#2a2a2a] text-neutral-300 hover:bg-[#333] border-0 rounded-md px-3 py-1.5 font-normal"
                                    >
                                        {cat.nazwa}
                                    </Badge>
                                ))}
                                {lawFirm.categories.length > 3 && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-[#2a2a2a] text-neutral-300 hover:bg-[#333] border-0 rounded-md px-3 py-1.5 font-normal"
                                    >
                                        +{lawFirm.categories.length - 3}
                                    </Badge>
                                )}
                                <Badge className="bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/40 border-0 rounded-md px-3 py-1.5 font-normal">
                                    ORA Kielce
                                </Badge>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                            <div className="flex gap-3">
                                <Button size="icon" variant="ghost" className="rounded-full bg-[#2a2a2a] text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors h-10 w-10">
                                    <Phone className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-full bg-[#2a2a2a] text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors h-10 w-10">
                                    <Mail className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-full bg-[#2a2a2a] text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors h-10 w-10">
                                    <Globe className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg p-2 transition-colors">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
