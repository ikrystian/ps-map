import { auth } from "@/lib/auth"
import { generateEmailVerificationEmail, sendEmail } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { NextResponse } from "next/server"

/**
 * POST /api/admin/users/send-pending-verification
 *
 * Wysyła maile weryfikacyjne do wszystkich użytkowników ze statusem PENDING
 * i niezweryfikowanym adresem email (emailVerified = null).
 * Przeznaczone dla kont zarejestrowanych przez rejestracja.prostasprawa.pl.
 */
export async function POST() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz wszystkich użytkowników PENDING bez potwierdzonego emaila
    const pendingUsers = await prisma.user.findMany({
      where: {
        status: "PENDING",
        emailVerified: null,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        imie: true,
        lawFirm: {
          select: { nazwa: true },
        },
      },
    })

    if (pendingUsers.length === 0) {
      return NextResponse.json({
        message: "Brak użytkowników PENDING do powiadomienia.",
        sent: 0,
        failed: 0,
        total: 0,
      })
    }

    const baseUrl = process.env.NEXTAUTH_URL || "https://prostasprawa.pl"
    const results = { sent: 0, failed: 0, errors: [] as string[] }

    for (const user of pendingUsers) {
      try {
        // Utwórz nowy token weryfikacyjny (24h), usuń poprzedni jeśli istnieje
        const token = crypto.randomBytes(32).toString("hex")
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

        await prisma.verificationToken.deleteMany({
          where: { identifier: user.email },
        })
        await prisma.verificationToken.create({
          data: {
            identifier: user.email,
            token,
            expires,
          },
        })

        const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`
        const displayName =
          user.name ||
          user.imie ||
          user.lawFirm?.nazwa ||
          user.email

        const emailContent = generateEmailVerificationEmail(
          verificationUrl,
          displayName,
          !!user.lawFirm
        )

        await sendEmail({
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
          templateType: "POTWIERDZENIE_EMAIL",
        })

        results.sent++
      } catch (err: any) {
        results.failed++
        results.errors.push(`${user.email}: ${err?.message || "Unknown error"}`)
        console.error(`Failed to send verification email to ${user.email}:`, err)
      }
    }

    return NextResponse.json({
      message: `Wysłano ${results.sent} z ${pendingUsers.length} maili aktywacyjnych.`,
      sent: results.sent,
      failed: results.failed,
      total: pendingUsers.length,
      errors: results.errors.length > 0 ? results.errors : undefined,
    })
  } catch (error) {
    console.error("Error in send-pending-verification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
