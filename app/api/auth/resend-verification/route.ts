import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, sendEmailWithTemplate, generateEmailVerificationEmail } from "@/lib/email"
import { EmailType } from "@prisma/client"
import crypto from "crypto"

/**
 * POST /api/auth/resend-verification
 * Resends email verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = (email as string).toLowerCase().trim()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      // For security reasons, don't reveal if user exists
      return NextResponse.json(
        { message: "If an account with this email exists, we have sent a new verification link." },
        { status: 200 }
      )
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified. You can log in." },
        { status: 400 }
      )
    }

    // Delete old verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    })

    // Generate new verification token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = new Date()
    verificationExpiry.setHours(verificationExpiry.getHours() + 24) // Token valid for 24 hours

    // Save new token
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: verificationExpiry,
      },
    })

    // Send verification email
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
      { message: "Verification link has been sent to your email address." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "An error occurred while sending verification email" },
      { status: 500 }
    )
  }
}
