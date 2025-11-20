import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/email-templates - Lista wszystkich szablonów
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const typ = searchParams.get("typ")
    const aktywny = searchParams.get("aktywny")

    const where: any = {}
    if (typ) {
      where.typ = typ
    }
    if (aktywny !== null && aktywny !== undefined) {
      where.aktywny = aktywny === "true"
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    // Parse JSON fields
    const templatesWithParsedData = templates.map((template: any) => ({
      ...template,
      triggery: template.triggery ? JSON.parse(template.triggery) : [],
      zmienne: template.zmienne ? JSON.parse(template.zmienne) : [],
      opisZmiennych: template.opisZmiennych
        ? JSON.parse(template.opisZmiennych)
        : {},
    }))

    return NextResponse.json(templatesWithParsedData)
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania szablonów" },
      { status: 500 }
    )
  }
}

// POST /api/email-templates - Tworzenie nowego szablonu
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { nazwa, temat, tresc, trescHtml, typ, aktywny, triggery, zmienne, opisZmiennych } = body

    // Validate required fields
    if (!nazwa || !temat || !tresc || !typ) {
      return NextResponse.json(
        { error: "Nazwa, temat, treść i typ są wymagane" },
        { status: 400 }
      )
    }

    // Create template
    const template = await prisma.emailTemplate.create({
      data: {
        nazwa,
        temat,
        tresc,
        trescHtml: trescHtml || null,
        typ,
        aktywny: aktywny !== undefined ? aktywny : true,
        triggery: triggery ? JSON.stringify(triggery) : null,
        zmienne: zmienne ? JSON.stringify(zmienne) : null,
        opisZmiennych: opisZmiennych ? JSON.stringify(opisZmiennych) : null,
      },
    })

    // Parse JSON fields for response
    const templateWithParsedData = {
      ...template,
      triggery: template.triggery ? JSON.parse(template.triggery) : [],
      zmienne: template.zmienne ? JSON.parse(template.zmienne) : [],
      opisZmiennych: template.opisZmiennych
        ? JSON.parse(template.opisZmiennych)
        : {},
    }

    return NextResponse.json(templateWithParsedData, { status: 201 })
  } catch (error) {
    console.error("Error creating email template:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia szablonu" },
      { status: 500 }
    )
  }
}
