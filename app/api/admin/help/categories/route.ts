import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/help/categories - List all categories
export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const categories = await prisma.helpCategory.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { kolejnosc: "asc" }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching help categories:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/admin/help/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nazwa, slug, opis, ikona, kolejnosc, aktywna, odbiorca } = body

    // Check if slug already exists
    const existingCategory = await prisma.helpCategory.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Kategoria z tym slugiem już istnieje" },
        { status: 400 }
      )
    }

    const category = await prisma.helpCategory.create({
      data: {
        nazwa,
        slug,
        opis: opis || null,
        ikona: ikona || null,
        kolejnosc: kolejnosc || 0,
        aktywna: aktywna ?? true,
        odbiorca: odbiorca || "ALL",
      },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating help category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
