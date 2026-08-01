import { auth } from "@/lib/auth"
import { checkAndAwardBadges } from "@/lib/badges"
import { updateBannerVerification, verifyBannerPlacement } from "@/lib/partner-program"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

/**
 * POST /api/partner-program/verify
 * Weryfikuj obecność bannera na stronie eksperta
 */
export async function POST(request: NextRequest) {
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

    // Pobierz dane eksperta z programem partnerskim
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        nazwa: true,
        stronaWww: true,
        partnerProgram: true
      }
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    if (!lawFirm.partnerProgram) {
      return Response.json(
        { error: "Nie uczestniczysz w programie partnerskim" },
        { status: 400 }
      )
    }

    if (!lawFirm.stronaWww) {
      return Response.json(
        { error: "Brak adresu strony WWW w profilu" },
        { status: 400 }
      )
    }

    // Wykonaj weryfikację
    const verificationResult = await verifyBannerPlacement(
      lawFirm.stronaWww,
      lawFirm.partnerProgram.bannerCode
    )

    // Aktualizuj status w bazie danych
    const updatedProgram = await updateBannerVerification(
      lawFirm.partnerProgram.id,
      {
        found: verificationResult.found,
        checkedUrl: verificationResult.checkedUrl
      }
    )

    // Odśwież ordery eksperta (np. odznaka klubu partnerskiego)
    await checkAndAwardBadges(lawFirm.id)

    return Response.json({
      success: verificationResult.success,
      found: verificationResult.found,
      error: verificationResult.error,
      checkedUrl: verificationResult.checkedUrl,
      bannerPlaced: updatedProgram.bannerPlaced,
      lastVerificationDate: updatedProgram.lastVerificationDate,
      verificationFailCount: updatedProgram.verificationFailCount,
      active: updatedProgram.active,
      message: verificationResult.found
        ? "Banner został pomyślnie zweryfikowany!"
        : verificationResult.error
          ? `Błąd weryfikacji: ${verificationResult.error}`
          : "Banner nie został znaleziony na stronie. Upewnij się, że kod bannera jest umieszczony w kodzie HTML Twojej strony."
    })

  } catch (error) {
    console.error("Error verifying banner:", error)
    return Response.json(
      { error: "Błąd podczas weryfikacji bannera" },
      { status: 500 }
    )
  }
}
