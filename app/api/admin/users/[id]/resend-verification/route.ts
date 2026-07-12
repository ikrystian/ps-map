import { auth } from "@/lib/auth"
import { generateEmailVerificationEmail, sendEmailWithTemplate } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { EmailType } from "@prisma/client"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

// POST /api/admin/users/[id]/resend-verification - Resend the email verification link (ADMIN only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      )
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    })

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = new Date()
    verificationExpiry.setHours(verificationExpiry.getHours() + 24) // Token valid for 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: verificationExpiry,
      },
    })

    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`
    const isLawFirm = user.role === "LAW_FIRM"

    await sendEmailWithTemplate({
      to: user.email,
      templateType: EmailType.POTWIERDZENIE_EMAIL,
      variables: {
        "{imie}": user.name || user.email,
        "{email}": user.email,
        "{linkPotwierdzenia}": verificationUrl,
        "{kod}": verificationCode,
      },
      fallbackProvider: () => {
        const emailContent = generateEmailVerificationEmail(
          verificationUrl,
          user.name || user.email,
          isLawFirm
        )
        return {
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        }
      }
    })

    return NextResponse.json(
      { message: "Verification link has been sent to the user's email address." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error resending verification email:", error)
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    )
  }
}
