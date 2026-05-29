import { auth } from "@/lib/auth"
import { hasActivePackage } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

async function getLimits(userId: string) {
  const lawFirm = await prisma.lawFirm.findUnique({
    where: { userId },
    select: {
      id: true,
      pakietSubskrypcji: true,
      dataPakietuOd: true,
      dataPakietuDo: true,
    },
  })

  if (!lawFirm) return { maxVoivodeships: 1, maxCities: 3 }

  let maxVoivodeships = 1
  let maxCities = 3

  // 1. Get defaults from settings
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ["maxLawFirmVoivodeships", "maxLawFirmCities"]
      }
    }
  })

  settings.forEach(s => {
    if (s.key === "maxLawFirmVoivodeships") maxVoivodeships = parseInt(s.value) || 1
    if (s.key === "maxLawFirmCities") maxCities = parseInt(s.value) || 3
  })

  // 2. Override with package limits if active
  if (lawFirm.pakietSubskrypcji && hasActivePackage(lawFirm as any)) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { typ: lawFirm.pakietSubskrypcji }
    })

    if (plan) {
      maxVoivodeships = plan.wojewodztwa
      maxCities = plan.miasta
    }
  }

  return { maxVoivodeships, maxCities }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      include: {
        voivodeships: {
          include: {
            voivodeship: true
          }
        },
        cities: {
          include: {
            city: {
              include: {
                voivodeship: true
              }
            }
          }
        }
      }
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    const limits = await getLimits(session.user.id)

    return NextResponse.json({
      callaPolska: lawFirm.callaPolska,
      onlineOnly: lawFirm.onlineOnly,
      voivodeships: lawFirm.voivodeships.map(v => v.voivodeship),
      cities: lawFirm.cities.map(c => c.city),
      ...limits
    })
  } catch (error) {
    console.error("Error fetching area of activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id }
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    const body = await request.json()
    const { callaPolska, onlineOnly, voivodeshipsIds, citiesIds } = body

    // Validate limits
    if (!callaPolska) {
      const limits = await getLimits(session.user.id)

      if (voivodeshipsIds && voivodeshipsIds.length > limits.maxVoivodeships) {
        return NextResponse.json({ error: `Przekroczono limit województw (${limits.maxVoivodeships})` }, { status: 400 })
      }

      if (citiesIds && citiesIds.length > limits.maxCities) {
        return NextResponse.json({ error: `Przekroczono limit miast (${limits.maxCities})` }, { status: 400 })
      }
    }

    // Update basic flags
    await prisma.lawFirm.update({
      where: { id: lawFirm.id },
      data: {
        callaPolska: !!callaPolska,
        onlineOnly: !!onlineOnly,
      }
    })

    // Update voivodeships
    if (voivodeshipsIds) {
      await prisma.lawFirmVoivodeship.deleteMany({
        where: { lawFirmId: lawFirm.id }
      })

      if (voivodeshipsIds.length > 0) {
        await prisma.lawFirmVoivodeship.createMany({
          data: voivodeshipsIds.map((id: string) => ({
            lawFirmId: lawFirm.id,
            voivodeshipId: id
          }))
        })
      }
    }

    // Update cities
    if (citiesIds) {
      await prisma.lawFirmCity.deleteMany({
        where: { lawFirmId: lawFirm.id }
      })

      if (citiesIds.length > 0) {
        await prisma.lawFirmCity.createMany({
          data: citiesIds.map((id: string) => ({
            lawFirmId: lawFirm.id,
            cityId: id
          }))
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating area of activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
