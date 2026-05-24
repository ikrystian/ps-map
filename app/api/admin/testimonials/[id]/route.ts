import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PUT /api/admin/testimonials/[id]
 * Aktualizuje istniejącą opinię
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, designation, quote, src, active, order } = body

    const existingTestimonial = await prisma.homepageTestimonial.findUnique({
      where: { id },
    })

    if (!existingTestimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    const updatedTestimonial = await prisma.homepageTestimonial.update({
      where: { id },
      data: {
        name: name ?? existingTestimonial.name,
        designation: designation ?? existingTestimonial.designation,
        quote: quote ?? existingTestimonial.quote,
        src: src ?? existingTestimonial.src,
        active: active ?? existingTestimonial.active,
        order: order ?? existingTestimonial.order,
      },
    })

    return NextResponse.json({ testimonial: updatedTestimonial })
  } catch (error) {
    console.error("Error updating testimonial:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/testimonials/[id]
 * Usuwa opinię
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existingTestimonial = await prisma.homepageTestimonial.findUnique({
      where: { id },
    })

    if (!existingTestimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    await prisma.homepageTestimonial.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Testimonial deleted successfully" })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
