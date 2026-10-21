import { auth } from "@/lib/auth"
import { formatDate } from "@/lib/format"
import { prisma } from "@/lib/prisma"
import { EmailType, Prisma, UserRole } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

/**
 * Ręczna wysyłka maila ZMIANA_REGULAMINU (wyzwalacz terms_changed).
 * GET  — liczba odbiorców w każdej grupie.
 * POST — wrzuca maile do kolejki ScheduledEmail (wysyła je job "scheduled-emails").
 */

const AUDIENCES: Record<string, UserRole[]> = {
  ALL: ["CLIENT", "LAW_FIRM"],
  CLIENT: ["CLIENT"],
  LAW_FIRM: ["LAW_FIRM"],
}

function recipientsWhere(roles: UserRole[]): Prisma.UserWhereInput {
  // Zanonimizowane konta mają deletedAt — nie mają już prawdziwego adresu
  return { role: { in: roles }, deletedAt: null }
}

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [clients, lawFirms, template] = await Promise.all([
    prisma.user.count({ where: recipientsWhere(["CLIENT"]) }),
    prisma.user.count({ where: recipientsWhere(["LAW_FIRM"]) }),
    prisma.emailTemplate.findUnique({ where: { typ: EmailType.ZMIANA_REGULAMINU }, select: { aktywny: true } }),
  ])

  return NextResponse.json({
    counts: { ALL: clients + lawFirms, CLIENT: clients, LAW_FIRM: lawFirms },
    templateActive: !!template?.aktywny,
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const roles = AUDIENCES[body?.odbiorcy as string]
    const effectiveDate = typeof body?.dataWejscia === "string" ? new Date(body.dataWejscia) : null
    const summary = typeof body?.podsumowanieZmian === "string" ? body.podsumowanieZmian.trim() : ""

    if (!roles) return NextResponse.json({ error: "Wybierz odbiorców" }, { status: 400 })
    if (!effectiveDate || Number.isNaN(effectiveDate.getTime())) {
      return NextResponse.json({ error: "Podaj datę wejścia zmian w życie" }, { status: 400 })
    }
    if (!summary) return NextResponse.json({ error: "Podaj podsumowanie zmian" }, { status: 400 })

    const template = await prisma.emailTemplate.findUnique({
      where: { typ: EmailType.ZMIANA_REGULAMINU },
      select: { aktywny: true, temat: true },
    })
    if (!template?.aktywny) {
      return NextResponse.json(
        { error: "Szablon „Zmiana regulaminu” nie istnieje albo jest wyłączony" },
        { status: 400 }
      )
    }

    const users = await prisma.user.findMany({
      where: recipientsWhere(roles),
      select: {
        email: true,
        name: true,
        client: { select: { imie: true, nazwisko: true } },
        lawFirm: { select: { nazwa: true } },
      },
    })

    const baseUrl = (process.env.NEXTAUTH_URL || process.env.URL || "http://localhost:3000").replace(/\/$/, "")
    const dataWejscia = formatDate(effectiveDate)
    const now = new Date()

    const result = await prisma.scheduledEmail.createMany({
      data: users.map((user) => ({
        to: user.email,
        subject: template.temat,
        templateType: EmailType.ZMIANA_REGULAMINU,
        scheduledAt: now,
        variables: JSON.stringify({
          "{odbiorca}":
            user.lawFirm?.nazwa ||
            [user.client?.imie, user.client?.nazwisko].filter(Boolean).join(" ") ||
            user.name ||
            "",
          "{dataWejscia}": dataWejscia,
          "{podsumowanieZmian}": summary,
          "{linkDoRegulaminu}": `${baseUrl}/regulamin`,
        }),
      })),
    })

    await prisma.systemLog.create({
      data: {
        level: "INFO",
        action: "TERMS_CHANGE_MAILING",
        message: `Zaplanowano ${result.count} maili o zmianie regulaminu (od ${dataWejscia})`,
        userId: session.user.id,
        metadata: JSON.stringify({ odbiorcy: body.odbiorcy, dataWejscia, podsumowanieZmian: summary }),
      },
    })

    return NextResponse.json({ queued: result.count })
  } catch (error) {
    console.error("Terms change mailing error:", error)
    return NextResponse.json({ error: "Nie udało się zaplanować wysyłki" }, { status: 500 })
  }
}
