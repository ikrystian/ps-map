import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const item = await prisma.expertiseCategory.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, nazwa: true } },
        children: {
          orderBy: [{ kolejnosc: "asc" }, { nazwa: "asc" }],
        },
      },
    })
    if (!item) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching expertise category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { nazwa, parentId, kolejnosc, aktywna, kolor } = body

    if (!nazwa?.trim()) {
      return NextResponse.json({ error: "Nazwa jest wymagana" }, { status: 400 })
    }

    if (parentId === id) {
      return NextResponse.json({ error: "Kategoria nie może być swoim rodzicem" }, { status: 400 })
    }

    const item = await prisma.expertiseCategory.update({
      where: { id },
      data: {
        nazwa: nazwa.trim(),
        parentId: parentId || null,
        kolejnosc: kolejnosc ?? 0,
        aktywna: aktywna !== undefined ? aktywna : true,
        kolor: kolor || null,
      },
      include: { parent: { select: { id: true, nazwa: true } } },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error updating expertise category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const children = await prisma.expertiseCategory.count({ where: { parentId: id } })
    if (children > 0) {
      return NextResponse.json(
        { error: "Nie można usunąć kategorii mającej podkategorie. Usuń najpierw podkategorie." },
        { status: 400 }
      )
    }

    await prisma.expertiseCategory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expertise category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
