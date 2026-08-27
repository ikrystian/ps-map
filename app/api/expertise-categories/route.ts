import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get("all") === "true"
    const activeFilter = all ? undefined : true

    const items = await prisma.expertiseCategory.findMany({
      where: { parentId: null, ...(activeFilter !== undefined ? { aktywna: activeFilter } : {}) },
      include: {
        children: {
          ...(activeFilter !== undefined ? { where: { aktywna: activeFilter } } : {}),
          include: {
            children: {
              ...(activeFilter !== undefined ? { where: { aktywna: activeFilter } } : {}),
              orderBy: [{ kolejnosc: "asc" }, { nazwa: "asc" }],
            },
          },
          orderBy: [{ kolejnosc: "asc" }, { nazwa: "asc" }],
        },
      },
      orderBy: [{ kolejnosc: "asc" }, { nazwa: "asc" }],
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching expertise categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nazwa, parentId, kolejnosc, aktywna, kolor } = body

    if (!nazwa?.trim()) {
      return NextResponse.json({ error: "Nazwa jest wymagana" }, { status: 400 })
    }

    if (parentId) {
      const parent = await prisma.expertiseCategory.findUnique({ where: { id: parentId } })
      if (!parent) {
        return NextResponse.json({ error: "Kategoria nadrzędna nie istnieje" }, { status: 400 })
      }
    }

    const item = await prisma.expertiseCategory.create({
      data: {
        nazwa: nazwa.trim(),
        parentId: parentId || null,
        kolejnosc: kolejnosc ?? 0,
        aktywna: aktywna !== undefined ? aktywna : true,
        kolor: kolor || null,
      },
      include: { parent: { select: { id: true, nazwa: true } } },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Error creating expertise category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
