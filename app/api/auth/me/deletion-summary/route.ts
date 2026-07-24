import { getAccountRetentionSummary } from "@/lib/account-anonymization"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Zestawienie danych, które pozostaną w systemie po usunięciu konta
 * (obowiązek informacyjny — art. 13 ust. 2 lit. a RODO).
 * Wykorzystywane w oknie potwierdzenia usunięcia konta w panelach.
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const summary = await getAccountRetentionSummary(session.user.id)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Account retention summary error:", error)
    return NextResponse.json(
      { error: "Nie udało się pobrać informacji o usuwaniu konta" },
      { status: 500 }
    )
  }
}
