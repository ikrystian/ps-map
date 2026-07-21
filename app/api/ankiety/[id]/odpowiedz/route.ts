import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "LAW_FIRM") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: surveyId } = await params

  const lawFirm = await prisma.lawFirm.findUnique({
    where: { userId: session.user.id },
    select: { id: true, punktySaldo: true },
  })
  if (!lawFirm) {
    return NextResponse.json({ error: "Nie znaleziono eksperta" }, { status: 404 })
  }

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId, aktywna: true },
    select: { id: true, nagrodaPunktow: true },
  })
  if (!survey) {
    return NextResponse.json({ error: "Ankieta nie istnieje" }, { status: 404 })
  }

  const existing = await prisma.surveyResponse.findUnique({
    where: { surveyId_lawFirmId: { surveyId, lawFirmId: lawFirm.id } },
  })
  if (existing) {
    return NextResponse.json({ error: "Ankieta już wypełniona" }, { status: 409 })
  }

  // answers: [{ questionId, optionIds: string[] }]
  const { answers } = await request.json()

  if (!answers?.length) {
    return NextResponse.json({ error: "Brak odpowiedzi" }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    const response = await tx.surveyResponse.create({
      data: {
        surveyId,
        lawFirmId: lawFirm.id,
        odpowiedzi: {
          create: answers.flatMap((a: { questionId: string; optionIds: string[] }) =>
            a.optionIds.map((optionId: string) => ({
              questionId: a.questionId,
              optionId,
            }))
          ),
        },
      },
    })

    if (survey.nagrodaPunktow > 0) {
      const newBalance = lawFirm.punktySaldo + survey.nagrodaPunktow
      await tx.lawFirm.update({
        where: { id: lawFirm.id },
        data: { punktySaldo: newBalance },
      })
      await tx.pointTransaction.create({
        data: {
          lawFirmId: lawFirm.id,
          amount: survey.nagrodaPunktow,
          balanceAfter: newBalance,
          type: "SURVEY_REWARD",
          description: `Nagroda za wypełnienie ankiety`,
        },
      })
    }

    return response
  })

  return NextResponse.json({ ok: true, punkty: survey.nagrodaPunktow })
}
