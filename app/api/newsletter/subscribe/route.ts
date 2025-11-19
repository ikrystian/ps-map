import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, imie } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email jest wymagany" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingSubscription = await prisma.newsletter.findUnique({
      where: { email }
    })

    if (existingSubscription) {
      if (existingSubscription.aktywny) {
        return NextResponse.json(
          { error: "Ten adres e-mail jest już zapisany do newslettera" },
          { status: 400 }
        )
      }

      // Reactivate if previously unsubscribed
      await prisma.newsletter.update({
        where: { email },
        data: {
          aktywny: true,
          imie: imie || existingSubscription.imie,
          dataZapisu: new Date(),
          dataRezygnacji: null,
        }
      })

      return NextResponse.json({
        message: "Pomyślnie zapisano do newslettera"
      }, { status: 200 })
    }

    // Create new subscription
    await prisma.newsletter.create({
      data: {
        email,
        imie: imie || null,
        zgoda: true,
        aktywny: true,
      }
    })

    return NextResponse.json({
      message: "Pomyślnie zapisano do newslettera"
    }, { status: 201 })
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas zapisywania do newslettera" },
      { status: 500 }
    )
  }
}
