import { lookupCompanyByNip } from "@/lib/biala-lista"
import { NextRequest, NextResponse } from "next/server"

/**
 * Wyszukiwanie danych firmy po numerze NIP w Wykazie podatników VAT
 * (Biała lista Ministerstwa Finansów) — REST, bez klucza.
 *
 * Endpoint publiczny (używany w trakcie rejestracji eksperta "jako firma",
 * zanim powstanie konto). Zwraca komplet pól z przedrostkiem COMPANY_.
 *
 * POST /api/company-lookup
 * body: { nip: string }
 */
export async function POST(request: NextRequest) {
  let nip: string | undefined
  try {
    const body = await request.json()
    nip = typeof body?.nip === "string" ? body.nip : undefined
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane żądania." }, { status: 400 })
  }

  if (!nip) {
    return NextResponse.json({ error: "Brak numeru NIP." }, { status: 400 })
  }

  const result = await lookupCompanyByNip(nip)

  if (!result.ok) {
    const status =
      result.code === "INVALID_NIP"
        ? 400
        : result.code === "NOT_FOUND"
          ? 404
          : 502
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status }
    )
  }

  return NextResponse.json({ data: result.data })
}
