import { auth } from "@/lib/auth"
import { serverCache } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Fraza z dialogu w /admin/categories — bez niej żądanie niczego nie usuwa
const DELETE_ALL_CONFIRMATION = "USUŃ"

// DELETE /api/admin/categories - usuwa wszystkie kategorie spraw.
// Sprawy (Case) mają do kategorii relację RESTRICT, więc przy istniejących
// sprawach operacja jest blokowana. Powiązania z ekspertami, statystyki,
// specjalizacje i polecenia znikają kaskadowo; mainCategoryId kancelarii
// i categoryId konsultacji są zerowane.
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (request.nextUrl.searchParams.get("confirm") !== DELETE_ALL_CONFIRMATION) {
      return NextResponse.json(
        { error: `Potwierdź usunięcie wszystkich kategorii, wpisując „${DELETE_ALL_CONFIRMATION}”` },
        { status: 400 }
      )
    }

    const casesCount = await prisma.case.count()
    if (casesCount > 0) {
      return NextResponse.json(
        {
          error: `Nie można usunąć kategorii — w bazie są sprawy (${casesCount}), które się do nich odwołują`,
          details: { cases: casesCount },
        },
        { status: 409 }
      )
    }

    const { count } = await prisma.category.deleteMany()

    serverCache.invalidatePattern("categories")

    return NextResponse.json({ deleted: count }, { status: 200 })
  } catch (error) {
    console.error("Error deleting all categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
