import { getSubstitutionContext } from "@/lib/substitutions/access"
import { INVOICE_STATUS_LABELS } from "@/lib/substitutions/constants"
import { errorResponse } from "@/lib/substitutions/http"
import { loadSettlements } from "@/lib/substitutions/read"
import { formatDay } from "@/lib/substitutions/time"
import type { SettlementRowDTO } from "@/lib/substitutions/types"
import { NextRequest, NextResponse } from "next/server"

const csvCell = (value: string | number) => {
  const text = String(value)
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function toCsv(rows: SettlementRowDTO[], tab: "wykonane" | "zlecone"): string {
  const header = [
    "Data",
    "Numer",
    "Zlecenie",
    "Miejsce",
    tab === "wykonane" ? "Zlecający" : "Zastępca",
    "Stawka netto (zł)",
    "Faktura VAT",
    "Status faktury",
  ]
  const lines = rows.map((row) =>
    [
      formatDay(row.data),
      row.numer ?? "",
      row.tytul,
      row.miejsce ?? "",
      row.osoba,
      row.stawka,
      row.fakturaVat ? "tak" : "nie",
      tab === "wykonane" ? INVOICE_STATUS_LABELS[row.fakturaStatus].label : INVOICE_STATUS_LABELS[row.fakturaStatus].ordererLabel,
    ]
      .map(csvCell)
      .join(";")
  )
  // BOM, żeby Excel otworzył polskie znaki bez kreatora importu
  return String.fromCharCode(0xfeff) + [header.join(";"), ...lines].join("\r\n")
}

/**
 * GET /api/substitutions/settlements?miesiac=2026-10 — zestawienie do faktur
 * (wykonane przeze mnie / zlecone przeze mnie). `&format=csv&zakladka=wykonane`
 * pobiera miesiąc jako CSV. Platforma nie przyjmuje pieniędzy — to tylko pomoc w pamiętaniu o fakturach.
 */
export async function GET(request: NextRequest) {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response

    const params = request.nextUrl.searchParams
    const data = await loadSettlements(ctx.firm, params.get("miesiac"))

    if (params.get("format") === "csv") {
      const tab = params.get("zakladka") === "zlecone" ? "zlecone" : "wykonane"
      const csv = toCsv(tab === "wykonane" ? data.wykonane : data.zlecone, tab)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="zastepstwa-${tab}-${data.miesiac}.csv"`,
          "Cache-Control": "private, no-store",
        },
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    return errorResponse(error, "Błąd pobierania rozliczeń zastępstw")
  }
}
