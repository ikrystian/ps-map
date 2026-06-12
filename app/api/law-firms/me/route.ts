import { checkAndUpdatePackageExpiry } from "@/lib/api-permissions"
import { auth } from "@/lib/auth"
import { USER_CONTACT_SELECT, flattenLawFirmUser } from "@/lib/law-firm-user"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest ekspertem
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla ekspertów" },
        { status: 403 }
      )
    }

    // Pobierz dane eksperta
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { email: true, ...USER_CONTACT_SELECT } },
        voivodeships: {
          include: {
            voivodeship: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    // Sprawdź wygaśnięcie pakietu i zaktualizuj jeśli trzeba
    const updatedLawFirm = await checkAndUpdatePackageExpiry(lawFirm as any);

    return Response.json({
      ...flattenLawFirmUser(lawFirm),
      pakietSubskrypcji: updatedLawFirm.pakietSubskrypcji,
      dataPakietuOd: updatedLawFirm.dataPakietuOd,
      dataPakietuDo: updatedLawFirm.dataPakietuDo,
    })
  } catch (error) {
    console.error("Error fetching law firm data:", error)
    return Response.json(
      { error: "Błąd podczas pobierania danych eksperta" },
      { status: 500 }
    )
  }
}
