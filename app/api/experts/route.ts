import { getExpertsCatalog } from "@/lib/experts"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/experts
 *
 * Zwraca katalog ekspertów (imię, nazwisko, firma, kategorie, lokalizacja,
 * link do profilu) na potrzeby asystenta AI oraz wyszukiwania specjalisty
 * dopasowanego do problemu użytkownika.
 *
 * Parametry zapytania:
 *   - category : slug lub fragment nazwy kategorii (filtr po specjalizacji)
 *   - q        : fraza wyszukiwania (firma, ekspert, słowa kluczowe, kategoria)
 *   - limit    : maksymalna liczba wyników (1–200, domyślnie 60)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get("category")?.trim() || undefined
    const query = searchParams.get("q")?.trim() || undefined
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined

    const experts = await getExpertsCatalog({
      category,
      query,
      limit: Number.isFinite(limit) ? limit : undefined,
    })

    return NextResponse.json({ count: experts.length, experts })
  } catch (error) {
    console.error("Error in /api/experts route:", error)
    return NextResponse.json(
      { error: "Nie udało się pobrać listy ekspertów" },
      { status: 500 }
    )
  }
}
