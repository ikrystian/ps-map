import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PUT /api/admin/help/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { nazwa, slug, opis, ikona, kolejnosc, aktywna, odbiorca } = body

    // Check if category exists
    const existingCategory = await prisma.helpCategory.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategoria nie została znaleziona" },
        { status: 404 }
      )
    }

    // Check if slug is taken by another category
    if (slug !== existingCategory.slug) {
      const slugTaken = await prisma.helpCategory.findUnique({
        where: { slug }
      })

      if (slugTaken) {
        return NextResponse.json(
          { error: "Kategoria z tym slugiem już istnieje" },
          { status: 400 }
        )
      }
    }

    const updatedCategory = await prisma.helpCategory.update({
      where: { id },
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

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error updating help category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/help/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if category exists
    const existingCategory = await prisma.helpCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategoria nie została znaleziona" },
        { status: 404 }
      )
    }

    // Delete the category (cascade will delete associated questions)
    await prisma.helpCategory.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Kategoria została usunięta" })
  } catch (error) {
    console.error("Error deleting help category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
