import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/cases/[id] - Pobiera szczegóły sprawy (tylko ADMIN)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: {
              select: {
                email: true,
                createdAt: true,
              },
            },
            voivodeship: true,
          },
        },
        category: true,
        voivodeship: true,
        offers: {
          include: {
            lawFirm: {
              select: {
                id: true,
                nazwa: true,
                nazwaFirmy: true,
                emailKontakt: true,
                numerTelefonu: true,
                logo: true,
              },
            },
            negotiations: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Parse załączniki jeśli są w JSON
    const parsedCase = {
      ...caseData,
      zalaczniki: caseData.zalaczniki && typeof caseData.zalaczniki === 'string' && caseData.zalaczniki.trim()
        ? JSON.parse(caseData.zalaczniki)
        : [],
    }

    return NextResponse.json(parsedCase)
  } catch (error) {
    console.error("Error fetching case:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/cases/[id] - Aktualizuje sprawę (tylko ADMIN)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Sprawdź czy sprawa istnieje
    const existingCase = await prisma.case.findUnique({
      where: { id },
    })

    if (!existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Przygotuj dane do aktualizacji
    const updateData: any = {}

    // Podstawowe pola
    if (body.nazwaSprawy !== undefined) updateData.nazwaSprawy = body.nazwaSprawy
    if (body.opisSprawy !== undefined) updateData.opisSprawy = body.opisSprawy
    if (body.typSprawy !== undefined) updateData.typSprawy = body.typSprawy
    if (body.status !== undefined) updateData.status = body.status
    if (body.trybPilny !== undefined) updateData.trybPilny = body.trybPilny
    if (body.doNegocjacji !== undefined) updateData.doNegocjacji = body.doNegocjacji

    // Pola opcjonalne
    if (body.wybranadziedzinaPrawa !== undefined) updateData.wybranadziedzinaPrawa = body.wybranadziedzinaPrawa
    if (body.wybranaSpecyfikacja !== undefined) updateData.wybranaSpecyfikacja = body.wybranaSpecyfikacja
    if (body.specjalizacja !== undefined) updateData.specjalizacja = body.specjalizacja

    // Budżet
    if (body.budzetOd !== undefined) updateData.budzetOd = body.budzetOd
    if (body.budzetDo !== undefined) updateData.budzetDo = body.budzetDo

    // Dane kontaktowe
    if (body.imieNazwisko !== undefined) updateData.imieNazwisko = body.imieNazwisko
    if (body.emailKontakt !== undefined) updateData.emailKontakt = body.emailKontakt
    if (body.telefonKontakt !== undefined) updateData.telefonKontakt = body.telefonKontakt
    if (body.preferowanyKontakt !== undefined) updateData.preferowanyKontakt = body.preferowanyKontakt

    // Daty
    if (body.oczekiwanyTerminRealizacji !== undefined) {
      updateData.oczekiwanyTerminRealizacji = body.oczekiwanyTerminRealizacji
        ? new Date(body.oczekiwanyTerminRealizacji)
        : null
    }

    // Załączniki
    if (body.zalaczniki !== undefined) {
      updateData.zalaczniki = body.zalaczniki?.length > 0 ? JSON.stringify(body.zalaczniki) : null
    }

    // Relacje (sprawdź czy istnieją)
    if (body.categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: { id: body.categoryId },
      })
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }
      updateData.categoryId = body.categoryId
    }

    if (body.voivodeshipId !== undefined) {
      const voivodeship = await prisma.voivodeship.findUnique({
        where: { id: body.voivodeshipId },
      })
      if (!voivodeship) {
        return NextResponse.json({ error: "Voivodeship not found" }, { status: 404 })
      }
      updateData.voivodeshipId = body.voivodeshipId
    }

    // Archiwizacja
    if (body.isArchived !== undefined) {
      updateData.isArchived = body.isArchived
      if (body.isArchived) {
        updateData.archivedAt = new Date()
      } else {
        updateData.archivedAt = null
      }
    }

    // Status zamknięcia
    if (body.status === "ZAKONCZONA" && !existingCase.zamknieto) {
      updateData.zamknieto = new Date()
    } else if (body.status !== "ZAKONCZONA" && existingCase.zamknieto) {
      updateData.zamknieto = null
    }

    // Wykonaj aktualizację
    const updatedCase = await prisma.case.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        category: true,
        voivodeship: true,
        offers: {
          include: {
            lawFirm: {
              select: {
                id: true,
                nazwa: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedCase)
  } catch (error) {
    console.error("Error updating case:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/cases/[id] - Usuwa lub archiwizuje sprawę (tylko ADMIN)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const hardDelete = searchParams.get("hardDelete") === "true"

    // Sprawdź czy sprawa istnieje
    const existingCase = await prisma.case.findUnique({
      where: { id },
    })

    if (!existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    if (hardDelete) {
      // Trwałe usunięcie (kaskadowo usuwa oferty i wiadomości)
      await prisma.case.delete({
        where: { id },
      })

      return NextResponse.json({ message: "Case permanently deleted", id })
    } else {
      // Soft delete - archiwizacja
      const archivedCase = await prisma.case.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date(),
        },
      })

      return NextResponse.json({ message: "Case archived", case: archivedCase })
    }
  } catch (error) {
    console.error("Error deleting case:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
