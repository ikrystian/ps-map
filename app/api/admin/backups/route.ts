import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { deleteBackup, listBackups, restoreBackup } from "@/lib/gcs-backup"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return null
  }
  return session
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const allBackups = await listBackups()
    const total = allBackups.length

    const isAll = searchParams.get("all") === "true" || searchParams.get("limit") === "all"
    if (isAll) {
      return NextResponse.json({
        backups: allBackups,
        pagination: {
          page: 1,
          limit: total,
          total,
          totalPages: total > 0 ? 1 : 0,
        },
      })
    }

    const pageParam = parseInt(searchParams.get("page") || "1", 10)
    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
    const limitParam = parseInt(searchParams.get("limit") || "10", 10)
    const limit = Number.isInteger(limitParam) && limitParam > 0 ? Math.min(100, limitParam) : 10
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0
    const skip = (page - 1) * limit
    const backups = allBackups.slice(skip, skip + limit)

    return NextResponse.json({
      backups,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error("[ADMIN:backups] GET failed:", err)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania listy kopii zapasowych." }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const action = body?.action
    const fileName = body?.fileName
    const gcsPath = body?.gcsPath
    const driveFileId = body?.driveFileId

    if (typeof fileName !== "string" || !fileName) {
      return NextResponse.json({ error: "Wymagane jest podanie nazwy pliku kopii (fileName)." }, { status: 400 })
    }

    if (action === "restore") {
      console.log(`[ADMIN:backups] Przywracanie bazy danych z: ${fileName}`)
      const result = await restoreBackup(fileName, gcsPath, driveFileId)

      return NextResponse.json({
        ok: true,
        message: `Baza danych została pomyślnie przywrócona z pliku ${fileName}.`,
        safetyBackup: result.safetyBackup,
      })
    }

    if (action === "delete") {
      console.log(`[ADMIN:backups] Usuwanie kopii zapasowej: ${fileName}`)
      const result = await deleteBackup(fileName, gcsPath)

      return NextResponse.json({
        ok: true,
        message: `Kopia zapasowa ${fileName} została pomyślnie usunięta.`,
        details: result,
      })
    }

    return NextResponse.json(
      { error: "Nieprawidłowa akcja. Dozwolone: 'restore' lub 'delete'." },
      { status: 400 }
    )
  } catch (error: unknown) {
    const err = error as Error
    console.error("[ADMIN:backups] POST failed:", err)
    await db.systemLog
      .create({
        data: {
          level: "ERROR",
          action: "BACKUP_OPERATION_ERROR",
          message: `Błąd operacji na kopii zapasowej: ${err.message || String(error)}`,
          metadata: JSON.stringify({ error: err.stack || String(error), endpoint: "POST /api/admin/backups" }),
        },
      })
      .catch(() => {})
    return NextResponse.json(
      { error: `Błąd podczas operacji na kopii zapasowej: ${err.message || String(error)}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    let fileName = searchParams.get("fileName")
    let gcsPath = searchParams.get("gcsPath") || undefined

    if (!fileName) {
      const body = await request.json().catch(() => null)
      fileName = body?.fileName
      gcsPath = body?.gcsPath || gcsPath
    }

    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json(
        { error: "Wymagany parametr 'fileName' nie został przekazany." },
        { status: 400 }
      )
    }

    console.log(`[ADMIN:backups] DELETE żądanie usunięcia: ${fileName}`)
    const result = await deleteBackup(fileName, gcsPath)

    return NextResponse.json({
      ok: true,
      message: `Kopia zapasowa ${fileName} została usunięta (lokalnie: ${result.deletedLocal ? "tak" : "nie"}, GCS: ${result.deletedGCS ? "tak" : "nie"}).`,
      details: result,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error("[ADMIN:backups] DELETE failed:", err)
    await db.systemLog
      .create({
        data: {
          level: "ERROR",
          action: "BACKUP_OPERATION_ERROR",
          message: `Błąd usuwania kopii zapasowej: ${err.message || String(error)}`,
          metadata: JSON.stringify({ error: err.stack || String(error), endpoint: "DELETE /api/admin/backups" }),
        },
      })
      .catch(() => {})
    return NextResponse.json(
      { error: `Błąd podczas usuwania kopii zapasowej: ${err.message || String(error)}` },
      { status: 500 }
    )
  }
}
