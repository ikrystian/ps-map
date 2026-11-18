import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/mobile/push-token
 * Rejestruje lub aktualizuje token powiadomień FCM dla zalogowanego użytkownika.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const token = body?.token
    const platform = body?.platform || "android"
    const deviceInfo = body?.deviceInfo

    if (!token || typeof token !== "string" || token.trim().length < 10) {
      return NextResponse.json({ error: "Nieprawidłowy token urządzenia" }, { status: 400 })
    }

    const cleanToken = token.trim()

    // Upsert tokenu: jeśli token już istnieje (np. po przelogowaniu),
    // przypisujemy go do aktualnego użytkownika.
    const record = await prisma.pushDeviceToken.upsert({
      where: { token: cleanToken },
      create: {
        userId: session.user.id,
        token: cleanToken,
        platform: typeof platform === "string" ? platform.toLowerCase() : "android",
        deviceInfo: typeof deviceInfo === "string" ? deviceInfo.slice(0, 255) : null,
      },
      update: {
        userId: session.user.id,
        platform: typeof platform === "string" ? platform.toLowerCase() : "android",
        deviceInfo: typeof deviceInfo === "string" ? deviceInfo.slice(0, 255) : null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      id: record.id,
      platform: record.platform,
    })
  } catch (error) {
    console.error("[PushToken API] Błąd podczas rejestracji tokenu:", error)
    return NextResponse.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 })
  }
}

/**
 * DELETE /api/mobile/push-token
 * Wyrejestrowuje token FCM dla zalogowanego użytkownika (np. przy wylogowaniu).
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const token = body?.token || request.nextUrl.searchParams.get("token")

    if (token && typeof token === "string") {
      await prisma.pushDeviceToken.deleteMany({
        where: {
          token: token.trim(),
          userId: session.user.id,
        },
      })
    } else {
      // Jeśli nie podano konkretnego tokenu, usuwamy wszystkie tokeny tego usera
      await prisma.pushDeviceToken.deleteMany({
        where: {
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PushToken API] Błąd podczas usuwania tokenu:", error)
    return NextResponse.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 })
  }
}
