import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/account/email-change/confirm?token=... — link z maila ZMIANA_EMAIL.
 * Kliknięcie potwierdza dostęp do nowej skrzynki, więc adres jest od razu zweryfikowany.
 * Sesja JWT odświeża e-mail z bazy przy kolejnym odświeżeniu tokenu (auth.ts).
 */
export async function GET(request: NextRequest) {
  // Za reverse proxy request.url wskazuje na wewnętrzny adres — przekierowania na NEXTAUTH_URL
  const baseUrl = process.env.NEXTAUTH_URL || request.url
  const redirectTo = (status: string) => NextResponse.redirect(new URL(`/zmiana-email?status=${status}`, baseUrl))

  try {
    const token = new URL(request.url).searchParams.get("token")
    if (!token) return redirectTo("nieprawidlowy-link")

    const changeRequest = await prisma.emailChangeRequest.findUnique({ where: { token } })
    if (!changeRequest) return redirectTo("nieprawidlowy-link")

    if (changeRequest.expires < new Date()) {
      await prisma.emailChangeRequest.delete({ where: { id: changeRequest.id } })
      return redirectTo("link-wygasl")
    }

    const taken = await prisma.user.findUnique({ where: { email: changeRequest.newEmail }, select: { id: true } })
    if (taken && taken.id !== changeRequest.userId) {
      await prisma.emailChangeRequest.delete({ where: { id: changeRequest.id } })
      return redirectTo("adres-zajety")
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: changeRequest.userId },
        data: { email: changeRequest.newEmail, emailVerified: new Date() },
      }),
      prisma.emailChangeRequest.deleteMany({ where: { userId: changeRequest.userId } }),
      prisma.systemLog.create({
        data: {
          level: "INFO",
          action: "USER_EMAIL_CHANGED",
          message: "Użytkownik potwierdził zmianę adresu e-mail",
          userId: changeRequest.userId,
        },
      }),
    ])

    return redirectTo("sukces")
  } catch (error) {
    console.error("Email change confirm error:", error)
    return redirectTo("blad-serwera")
  }
}
