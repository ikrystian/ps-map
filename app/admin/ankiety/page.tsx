import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
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
import { Coins, Eye, Plus } from "lucide-react"
import Link from "next/link"
import SurveyToggle from "./SurveyToggle"

export default async function AnkietyPage() {
  const surveys = await db.survey.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { pytania: true, odpowiedzi: true } },
    },
  })

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Ankiety" subtitle="Zarządzaj ankietami dla ekspertów" />

      <div className="flex items-center justify-between">
        <div />
        <Link href="/admin/ankiety/nowa">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nowa ankieta
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tytuł</TableHead>
              <TableHead className="text-center">Pytania</TableHead>
              <TableHead className="text-center">Wypełnień</TableHead>
              <TableHead className="text-center">Nagroda</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Utworzona</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {surveys.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Brak ankiet
                </TableCell>
              </TableRow>
            )}
            {surveys.map((survey) => (
              <TableRow key={survey.id}>
                <TableCell className="font-medium">{survey.tytul}</TableCell>
                <TableCell className="text-center">{survey._count.pytania}</TableCell>
                <TableCell className="text-center">{survey._count.odpowiedzi}</TableCell>
                <TableCell className="text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-yellow-500" />
                    {survey.nagrodaPunktow} pkt
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <SurveyToggle id={survey.id} aktywna={survey.aktywna} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {survey.createdAt.toLocaleDateString("pl-PL")}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/ankiety/${survey.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      Wyniki
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
