import { auth } from "@/lib/auth"
import { generateBugReportReplyEmail, sendEmail } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { BUG_REPORT_REPLY_MAX_LENGTH, bugReportCategoryLabels } from "@/types/bug-reports"
import { NextRequest, NextResponse } from "next/server"

// Odpowiedź z BOK trafia z powrotem na skrzynkę biura (jak w potwierdzeniu formularza kontaktowego)
const BOK_EMAIL = process.env.CONTACT_FORM_EMAIL || "bok@prostasprawa.pl"

// POST /api/admin/bug-reports/[id]/reply - Odpowiedź na zgłoszenie błędu wysyłana mailem do eksperta (ADMIN only)
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
    const body = await request.json()
    const tresc = typeof body.tresc === "string" ? body.tresc.trim() : ""

    if (!tresc) {
      return NextResponse.json({ error: "Treść odpowiedzi jest wymagana" }, { status: 400 })
    }

    if (tresc.length > BUG_REPORT_REPLY_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Odpowiedź może mieć maksymalnie ${BUG_REPORT_REPLY_MAX_LENGTH} znaków` },
        { status: 400 }
      )
    }

    const bugReport = await prisma.bugReport.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true, imie: true },
        },
      },
    })

    if (!bugReport) {
      return NextResponse.json({ error: "Nie znaleziono zgłoszenia" }, { status: 404 })
    }

    const email = generateBugReportReplyEmail({
      recipientName: bugReport.user.imie || bugReport.user.name,
      replyMessage: tresc,
      reportId: bugReport.id,
      reportDescription: bugReport.opis,
      reportUrl: bugReport.url,
      reportCategory: bugReportCategoryLabels[bugReport.kategoria],
      reportedAt: bugReport.createdAt,
    })

    const sent = await sendEmail({
      to: bugReport.user.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: BOK_EMAIL,
      templateType: "BUG_REPORT_REPLY",
    })

    if (!sent) {
      return NextResponse.json(
        { error: "Nie udało się wysłać wiadomości e-mail. Odpowiedź nie została zapisana." },
        { status: 502 }
      )
    }

    // Mail już wyszedł — błąd zapisu historii nie może skończyć się błędem, bo admin wysłałby odpowiedź drugi raz
    try {
      const reply = await prisma.bugReportReply.create({
        data: {
          bugReportId: bugReport.id,
          adminId: session.user.id,
          adminName: session.user.name || session.user.email || "Administrator",
          tresc,
          wyslanoNa: bugReport.user.email,
        },
      })
      return NextResponse.json({ success: true, reply }, { status: 201 })
    } catch (err) {
      console.error(`Odpowiedź na zgłoszenie błędu ${bugReport.id} wysłana, ale nie zapisano jej w historii:`, err)
      return NextResponse.json({ success: true, reply: null }, { status: 201 })
    }
  } catch (error) {
    console.error("Error replying to bug report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
