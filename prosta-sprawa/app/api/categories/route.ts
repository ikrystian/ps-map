import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: {
          select: {
            id: true,
            nazwa: true,
          },
        },
        children: {
          select: {
            id: true,
            nazwa: true,
          },
        },
        _count: {
          select: {
            lawFirms: true,
            cases: true,
          },
        },
      },
      orderBy: [
        { kolejnosc: "asc" },
        { nazwa: "asc" },
      ],
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nazwa, slug, opis, parentId, metaTitle, metaDescription, aktywna, kolejnosc } = body

    // Walidacja podstawowych pól
    if (!nazwa || !slug) {
      return NextResponse.json(
        { error: "Nazwa i slug są wymagane" },
        { status: 400 }
      )
    }

    // Sprawdzenie czy slug jest unikalny
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Kategoria z tym slugiem już istnieje" },
        { status: 409 }
      )
    }

    // Jeśli parentId jest podany, sprawdź czy kategoria nadrzędna istnieje
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      })

      if (!parentCategory) {
        return NextResponse.json(
          { error: "Kategoria nadrzędna nie istnieje" },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.create({
      data: {
        nazwa,
        slug,
        opis,
        parentId: parentId || null,
        metaTitle,
        metaDescription,
        aktywna: aktywna !== undefined ? aktywna : true,
        kolejnosc: kolejnosc || 0,
      },
      include: {
        parent: {
          select: {
            id: true,
            nazwa: true,
          },
        },
        children: {
          select: {
            id: true,
            nazwa: true,
          },
        },
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
