import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/help/questions - List all questions
export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const questions = await prisma.helpQuestion.findMany({
      include: {
        category: {
          select: {
            id: true,
            nazwa: true
          }
        }
      },
      orderBy: [
        { categoryId: "asc" },
        { kolejnosc: "asc" }
      ]
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error fetching help questions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/admin/help/questions - Create new question
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
    const { categoryId, pytanie, odpowiedz, slug, kolejnosc, aktywna } = body

    // Check if slug already exists
    const existingQuestion = await prisma.helpQuestion.findUnique({
      where: { slug }
    })

    if (existingQuestion) {
      return NextResponse.json(
        { error: "Pytanie z tym slugiem już istnieje" },
        { status: 400 }
      )
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

    const question = await prisma.helpQuestion.create({
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

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error("Error creating help question:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
