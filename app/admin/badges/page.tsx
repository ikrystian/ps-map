import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { db } from "@/lib/db"
import { Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

const conditionLabels: Record<string, string> = {
    YEARS_IN_SERVICE: "Lata w serwisie",
    WON_CASES: "Wygrane sprawy",
    REVIEWS_COUNT: "Liczba opinii",
    BLOG_POSTS_COUNT: "Wpisy na blogu",
    OFFERS_SUBMITTED: "Złożone oferty",
    PROFILE_VIEWS: "Wyświetlenia profilu",
    MANUAL: "Manualny (ręczny)",
}

export default async function BadgesPage() {
    const badges = await db.badge.findMany({
        orderBy: {
            createdAt: "desc",
        },
    })

    return (
        <div className="space-y-6">
            <AdminHeaderSetter title="Ordery" subtitle="Zarządzaj orderami i odznakami w systemie" />
            <div className="flex items-center justify-between">
                <div />
                <Link href="/admin/badges/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Dodaj nowy order
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Obrazek</TableHead>
                            <TableHead>Nazwa</TableHead>
                            <TableHead>Warunek</TableHead>
                            <TableHead>Próg</TableHead>
                            <TableHead className="text-right">Akcje</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {badges.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    Brak zdefiniowanych orderów.
                                </TableCell>
                            </TableRow>
                        )}
                        {badges.map((badge) => (
                            <TableRow key={badge.id}>
                                <TableCell>
                                    <div className="relative h-12 w-12">
                                        <Image
                                            src={badge.imageUrl}
                                            alt={badge.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div>{badge.name}</div>
                                    <div className="text-sm text-muted-foreground">{badge.description}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {conditionLabels[badge.conditionType] || badge.conditionType}
                                    </Badge>
                                </TableCell>
                                <TableCell>{badge.threshold}</TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/admin/badges/${badge.id}`}>
                                        <Button variant="ghost" size="sm">
                                            Edytuj
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
