import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      pytania: {
        orderBy: { kolejnosc: "asc" },
        include: {
          opcje: { orderBy: { kolejnosc: "asc" } },
          odpowiedzi: { include: { option: true } },
        },
      },
      _count: { select: { odpowiedzi: true } },
    },
  })

  if (!survey) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 })
  }

  return NextResponse.json(survey)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { tytul, opis, nagrodaPunktow, aktywna } = body

  // Jeśli aktywujemy ankietę — dezaktywuj pozostałe
  if (aktywna === true) {
    await prisma.survey.updateMany({
      where: { id: { not: id }, aktywna: true },
      data: { aktywna: false },
    })
  }

  const survey = await prisma.survey.update({
    where: { id },
    data: {
      ...(tytul !== undefined && { tytul }),
      ...(opis !== undefined && { opis }),
      ...(nagrodaPunktow !== undefined && { nagrodaPunktow }),
      ...(aktywna !== undefined && { aktywna }),
    },
  })

  return NextResponse.json(survey)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  await prisma.survey.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
