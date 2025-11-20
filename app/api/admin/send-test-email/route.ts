import { auth } from "@/auth"
import { sendEmail } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/admin/send-test-email
 * Wysyła testowy email
 */
export async function POST(request: NextRequest) {
  try {
    // Sprawdź autoryzację
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Brak uprawnień" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { to, templateId } = body

    if (!to || !templateId) {
      return NextResponse.json(
        { error: "Brak wymaganych danych (to, templateId)" },
        { status: 400 }
      )
    }

    // Walidacja email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Nieprawidłowy adres email" },
        { status: 400 }
      )
    }

    // Pobierz szablon z bazy danych
    const { prisma } = await import("@/lib/prisma")
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json(
        { error: "Szablon nie został znaleziony" },
        { status: 404 }
      )
    }

    // Przygotuj dane testowe dla zmiennych
    const testVariables: Record<string, string> = {
      "{nazwaSprawi}": "Przykładowa sprawa testowa",
      "{kategoria}": "Prawo karne",
      "{klient}": "Jan Kowalski",
      "{budżet}": "5000 PLN",
      "{kancelaria}": "Kancelaria Testowa sp. z o.o.",
      "{kwota}": "3500 PLN",
      "{imie}": "Jan",
      "{nazwisko}": "Kowalski",
      "{email}": to,
      "{nazwa}": "Kancelaria Testowa",
      "{nip}": "1234567890",
    }

    // Zastąp zmienne w temacie i treści
    let subject = template.temat
    let html = template.trescHtml || template.tresc
    let text = template.tresc

    Object.entries(testVariables).forEach(([variable, value]) => {
      subject = subject.replace(new RegExp(variable, 'g'), value)
      html = html.replace(new RegExp(variable, 'g'), value)
      text = text.replace(new RegExp(variable, 'g'), value)
    })

    // Dodaj informację że to email testowy
    const testNotice = `
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px;">
        <strong>⚠️ To jest email testowy</strong>
        <p style="margin: 5px 0 0 0; font-size: 14px;">
          Ten email został wysłany jako test z panelu administracyjnego.
        </p>
      </div>
    `

    if (template.trescHtml) {
      html = testNotice + html
    }

    text = "⚠️ TO JEST EMAIL TESTOWY\n" +
           "Ten email został wysłany jako test z panelu administracyjnego.\n\n" +
           text

    // Wyślij email
    const result = await sendEmail({
      to,
      subject: `[TEST] ${subject}`,
      html,
      text,
    })

    if (!result) {
      return NextResponse.json(
        {
          error: "Nie udało się wysłać emaila. Sprawdź konfigurację SMTP w zmiennych środowiskowych.",
          details: "Upewnij się że EMAIL_SERVER_HOST, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD i EMAIL_FROM są ustawione."
        },
        { status: 500 }
      )
    }

    // Zapisz log w bazie danych (opcjonalnie)
    await prisma.systemLog.create({
      data: {
        action: "EMAIL_TESTOWY",
        message: `Wysłano testowy email na ${to} (szablon: ${template.nazwa})`,
        userId: session.user.id,
      },
    }).catch((err: any) => {
      console.error("Failed to create system log:", err)
      // Nie przerywaj procesu jeśli zapis logu się nie udał
    })

    return NextResponse.json({
      success: true,
      message: `Email testowy został wysłany na adres ${to}`,
    })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas wysyłania emaila",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
