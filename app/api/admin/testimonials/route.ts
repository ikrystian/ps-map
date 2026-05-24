import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/testimonials
 * Zwraca wszystkie opinie (aktywne i nieaktywne) posortowane po order
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const testimonials = await prisma.homepageTestimonial.findMany({
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error("Error fetching admin testimonials:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/admin/testimonials
 * Tworzy nową opinię
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, designation, quote, src, active, order } = body

    if (!name || !designation || !quote || !src) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const testimonial = await prisma.homepageTestimonial.create({
      data: {
        name,
        designation,
        quote,
        src,
        active: active ?? true,
        order: order ?? 0,
      },
    })

    return NextResponse.json({ testimonial })
  } catch (error) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
