import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// PUT /api/admin/help/questions/[id] - Update question
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
    const { categoryId, pytanie, odpowiedz, slug, kolejnosc, aktywna } = body

    // Check if question exists
    const existingQuestion = await prisma.helpQuestion.findUnique({
      where: { id }
    })

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Pytanie nie zostało znalezione" },
        { status: 404 }
      )
    }

    // Check if slug is taken by another question
    if (slug !== existingQuestion.slug) {
      const slugTaken = await prisma.helpQuestion.findUnique({
        where: { slug }
      })

      if (slugTaken) {
        return NextResponse.json(
          { error: "Pytanie z tym slugiem już istnieje" },
          { status: 400 }
        )
      }
    }

    // Check if category exists
    const category = await prisma.helpCategory.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: "Kategoria nie została znaleziona" },
        { status: 404 }
      )
    }

    const updatedQuestion = await prisma.helpQuestion.update({
      where: { id },
      data: {
        categoryId,
        pytanie,
        odpowiedz,
        slug,
        kolejnosc: kolejnosc || 0,
        aktywna: aktywna ?? true,
      },
      include: {
        category: {
          select: {
            id: true,
            nazwa: true
          }
        }
      }
    })

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error("Error updating help question:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/help/questions/[id] - Delete question
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

    // Check if question exists
    const existingQuestion = await prisma.helpQuestion.findUnique({
      where: { id }
    })

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Pytanie nie zostało znalezione" },
        { status: 404 }
      )
    }

    await prisma.helpQuestion.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Pytanie zostało usunięte" })
  } catch (error) {
    console.error("Error deleting help question:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
