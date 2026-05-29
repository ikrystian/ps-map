import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EmailLogStatus } from "@prisma/client"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status") as EmailLogStatus | "all"
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { to: { contains: search } },
        { subject: { contains: search } },
        { content: { contains: search } },
      ]
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { sentAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.emailLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching email logs:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
