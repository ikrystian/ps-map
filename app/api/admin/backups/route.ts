import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
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

    const backups = await listBackups()
    return NextResponse.json({ backups })
  } catch (error: any) {
    console.error("[ADMIN:backups] GET failed:", error)
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
  } catch (error: any) {
    console.error("[ADMIN:backups] POST failed:", error)
    return NextResponse.json(
      { error: `Błąd podczas operacji na kopii zapasowej: ${error.message || error}` },
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
  } catch (error: any) {
    console.error("[ADMIN:backups] DELETE failed:", error)
    return NextResponse.json(
      { error: `Błąd podczas usuwania kopii zapasowej: ${error.message || error}` },
      { status: 500 }
    )
  }
}
