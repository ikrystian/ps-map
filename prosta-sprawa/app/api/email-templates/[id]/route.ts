import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/email-templates/[id] - Pobierz pojedynczy szablon
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json(
        { error: "Szablon nie został znaleziony" },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const templateWithParsedData = {
      ...template,
      triggery: template.triggery ? JSON.parse(template.triggery) : [],
      zmienne: template.zmienne ? JSON.parse(template.zmienne) : [],
      opisZmiennych: template.opisZmiennych
        ? JSON.parse(template.opisZmiennych)
        : {},
    }

    return NextResponse.json(templateWithParsedData)
  } catch (error) {
    console.error("Error fetching email template:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania szablonu" },
      { status: 500 }
    )
  }
}

// PUT /api/email-templates/[id] - Aktualizuj szablon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { nazwa, temat, tresc, trescHtml, typ, aktywny, triggery, zmienne, opisZmiennych } = body

    // Check if template exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Szablon nie został znaleziony" },
        { status: 404 }
      )
    }

    // Update template
    const template = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: {
        nazwa: nazwa !== undefined ? nazwa : existingTemplate.nazwa,
        temat: temat !== undefined ? temat : existingTemplate.temat,
        tresc: tresc !== undefined ? tresc : existingTemplate.tresc,
        trescHtml: trescHtml !== undefined ? trescHtml : existingTemplate.trescHtml,
        typ: typ !== undefined ? typ : existingTemplate.typ,
        aktywny: aktywny !== undefined ? aktywny : existingTemplate.aktywny,
        triggery: triggery ? JSON.stringify(triggery) : existingTemplate.triggery,
        zmienne: zmienne ? JSON.stringify(zmienne) : existingTemplate.zmienne,
        opisZmiennych: opisZmiennych ? JSON.stringify(opisZmiennych) : existingTemplate.opisZmiennych,
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

    return NextResponse.json(templateWithParsedData)
  } catch (error) {
    console.error("Error updating email template:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji szablonu" },
      { status: 500 }
    )
  }
}

// DELETE /api/email-templates/[id] - Usuń szablon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if template exists
    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json(
        { error: "Szablon nie został znaleziony" },
        { status: 404 }
      )
    }

    // Delete template
    await prisma.emailTemplate.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting email template:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas usuwania szablonu" },
      { status: 500 }
    )
  }
}

// PATCH /api/email-templates/[id] - Toggle active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current template
    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json(
        { error: "Szablon nie został znaleziony" },
        { status: 404 }
      )
    }

    // Toggle active status
    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: { aktywny: !template.aktywny },
    })

    // Parse JSON fields for response
    const templateWithParsedData = {
      ...updatedTemplate,
      triggery: updatedTemplate.triggery ? JSON.parse(updatedTemplate.triggery) : [],
      zmienne: updatedTemplate.zmienne ? JSON.parse(updatedTemplate.zmienne) : [],
      opisZmiennych: updatedTemplate.opisZmiennych
        ? JSON.parse(updatedTemplate.opisZmiennych)
        : {},
    }

    return NextResponse.json(templateWithParsedData)
  } catch (error) {
    console.error("Error toggling email template status:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas zmiany statusu szablonu" },
      { status: 500 }
    )
  }
}
