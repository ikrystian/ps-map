import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const survey = await prisma.survey.findFirst({
    where: { aktywna: true },
    include: {
      pytania: {
        orderBy: { kolejnosc: "asc" },
        include: { opcje: { orderBy: { kolejnosc: "asc" } } },
      },
    },
  })

  if (!survey) {
    return NextResponse.json(null)
  }

  const session = await auth()
  let wypelniona = false

  if (session?.user?.role === "LAW_FIRM") {
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (lawFirm) {
      const existing = await prisma.surveyResponse.findUnique({
        where: { surveyId_lawFirmId: { surveyId: survey.id, lawFirmId: lawFirm.id } },
      })
      wypelniona = !!existing
    }
  }

  return NextResponse.json({ ...survey, wypelniona })
}
