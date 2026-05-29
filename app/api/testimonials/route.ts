import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * GET /api/testimonials
 * Pobiera aktywne referencje do wyświetlenia na stronie głównej
 */
export async function GET() {
  try {
    const testimonials = await prisma.homepageTestimonial.findMany({
      where: {
        active: true,
      },
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error("Error fetching public testimonials:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
