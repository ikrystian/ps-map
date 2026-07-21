import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { pytania: true, odpowiedzi: true } },
    },
  })

  return NextResponse.json(surveys)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { tytul, opis, nagrodaPunktow, pytania } = body

  if (!tytul || !pytania?.length) {
    return NextResponse.json({ error: "Brak wymaganych danych" }, { status: 400 })
  }

  const survey = await prisma.survey.create({
    data: {
      tytul,
      opis: opis || null,
      nagrodaPunktow: nagrodaPunktow ?? 10,
      pytania: {
        create: pytania.map((q: any, qi: number) => ({
          kolejnosc: qi,
          tresc: q.tresc,
          typ: q.typ,
          opcje: {
            create: q.opcje.map((o: any, oi: number) => ({
              kolejnosc: oi,
              tresc: o.tresc,
            })),
          },
        })),
      },
    },
    include: {
      pytania: { include: { opcje: true }, orderBy: { kolejnosc: "asc" } },
    },
  })

  return NextResponse.json(survey, { status: 201 })
}
