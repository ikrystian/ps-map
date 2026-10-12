import { auth } from "@/lib/auth"
import { serverCache } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// DELETE /api/admin/categories - usuwa wszystkie kategorie spraw.
// Sprawy (Case) mają do kategorii relację RESTRICT, więc przy istniejących
// sprawach operacja jest blokowana. Powiązania z ekspertami, statystyki,
// specjalizacje i polecenia znikają kaskadowo; mainCategoryId kancelarii
// i categoryId konsultacji są zerowane.
export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
