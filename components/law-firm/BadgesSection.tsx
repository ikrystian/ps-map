import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award } from "lucide-react"
import Image from "next/image"

interface BadgesSectionProps {
    badges: Array<{
        id: string
        badge: {
            id: string
            name: string
            description: string
            imageUrl: string
        }
        awardedAt: string | Date
    }>
}

export function BadgesSection({ badges }: BadgesSectionProps) {
    if (badges.length === 0) return null

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="font-playfair font-light 2xl flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Ordery i wyróżnienia
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {badges.map((item) => (
                        <div key={item.id} className="flex flex-col items-center text-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors group relative">
                            <div className="relative w-16 h-16">
                                <Image
                                    src={item.badge.imageUrl}
                                    alt={item.badge.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{item.badge.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 group-hover:line-clamp-none transition-all">
                                    {item.badge.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
