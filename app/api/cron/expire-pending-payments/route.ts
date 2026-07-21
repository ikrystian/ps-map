import { verifyCronAuth } from "@/lib/cron-auth"
import { expireStalePrzelewy24Orders } from "@/lib/przelewy24-resolve"
import { NextRequest, NextResponse } from "next/server"

// Ręczne/zewnętrzne wyzwolenie porządkowania porzuconych płatności P24.
// W normalnej pracy to samo zadanie uruchamia cyklicznie wewnętrzny
// scheduler (lib/scheduler.ts), więc ten endpoint jest głównie dla admina
// / ewentualnego zewnętrznego crona jako dodatkowe zabezpieczenie.
export async function GET(req: NextRequest) {
  const unauthorized = verifyCronAuth(req)
  if (unauthorized) return unauthorized

  try {
    const { checked, resolved } = await expireStalePrzelewy24Orders()

    return NextResponse.json({
      message: `Sprawdzono ${checked} przeterminowanych zamówień P24, rozstrzygnięto ${resolved}.`,
    })
  } catch (error) {
    console.error("Error in expire-pending-payments cron:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
