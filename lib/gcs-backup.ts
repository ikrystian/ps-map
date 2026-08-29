import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import { Storage } from "@google-cloud/storage"

const execPromise = promisify(exec)

export interface GCSConfig {
  storage: Storage
  bucketName: string
  prefix: string
}

/**
 * Inicjalizuje klienta Google Cloud Storage na podstawie zmiennych środowiskowych.
 * Obsługuje:
 *  - GCS_BUCKET_NAME / GOOGLE_CLOUD_STORAGE_BUCKET / GOOGLE_STORAGE_BUCKET
 *  - GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY (standardowe GCP Service Account)
 *  - GCS_CLIENT_EMAIL + GCS_PRIVATE_KEY
 *  - GOOGLE_APPLICATION_CREDENTIALS (ścieżka do pliku JSON)
 *  - GOOGLE_SERVICE_ACCOUNT_KEY (surowy ciąg JSON)
 *  - ADC (Application Default Credentials na GCP)
 */
export function getGCSStorage(): GCSConfig | null {
  const bucketName =
    process.env.GCS_BUCKET_NAME ||
    process.env.GOOGLE_CLOUD_STORAGE_BUCKET ||
    process.env.GOOGLE_STORAGE_BUCKET

  if (!bucketName) {
    return null
  }

  const rawPrefix = process.env.GCS_BACKUP_FOLDER ?? process.env.GCS_BACKUP_PREFIX ?? "backups/db"
  const prefix = rawPrefix.replace(/^\/+|\/+$/g, "")

  const clientEmail = process.env.GCS_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GCS_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY
  const projectId =
    process.env.GCS_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT_ID ||
    process.env.GCP_PROJECT_ID ||
    process.env.GOOGLE_PROJECT_ID

  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
      const storage = new Storage({
        projectId: projectId || parsed.project_id,
        credentials: {
          client_email: parsed.client_email,
          private_key: parsed.private_key?.replace(/\\n/g, "\n"),
        },
      })
      return { storage, bucketName, prefix }
    } catch (e) {
      console.error("[BACKUP] Nie udało się sparsować GOOGLE_SERVICE_ACCOUNT_KEY:", e)
    }
  }

  if (clientEmail && privateKey) {
    const storage = new Storage({
      projectId: projectId || undefined,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
    })
    return { storage, bucketName, prefix }
  }

  if (keyFilename && fs.existsSync(keyFilename)) {
    const storage = new Storage({
      projectId: projectId || undefined,
      keyFilename,
    })
    return { storage, bucketName, prefix }
  }

  // ADC / domyślne uwierzytelnianie GCP
  const storage = new Storage({
    projectId: projectId || undefined,
  })
  return { storage, bucketName, prefix }
}

/**
 * Tworzy lokalny backup bazy danych SQLite + archiwum katalogów plików aplikacji,
 * przesyła oba pliki do Google Cloud Storage oraz wykonuje czyszczenie starych kopii (retencja).
 */
export async function backupDbToGCS() {
  const gcs = getGCSStorage()

  if (!gcs) {
    console.warn("[BACKUP] Brak konfiguracji Google Cloud Storage (GCS_BUCKET_NAME lub kluczy konta). Kopia zostanie utworzona tylko lokalnie.")
  }

  // 1. Ścieżka do bazy danych
  let dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db"
  if (dbUrl.startsWith("file:")) {
    dbUrl = dbUrl.substring(5)
  }
  const dbPath = path.isAbsolute(dbUrl) ? dbUrl : path.resolve(process.cwd(), dbUrl)

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Plik bazy danych nie istnieje pod ścieżką: ${dbPath}`)
  }

  // 2. Przygotowanie lokalnego folderu na backupy
  const backupDir = path.resolve(process.cwd(), "backups/db")
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  // 3. Nazwa pliku kopii zapasowej
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupFileName = `db_${timestamp}_gcs.db`
  const backupFilePath = path.join(backupDir, backupFileName)

  console.log(`[BACKUP] Tworzenie lokalnej kopii zapasowej SQLite: ${backupFilePath}`)

  // 4. Kopia SQLite (sqlite3 .backup lub kopia pliku)
  try {
    await execPromise(`sqlite3 "${dbPath}" ".backup '${backupFilePath}'"`)
    console.log("[BACKUP] Kopia bazy danych utworzona pomyślnie przez sqlite3 CLI.")
  } catch (error) {
    console.warn("[BACKUP] sqlite3 CLI niedostępne lub zwróciło błąd, fallback do kopiowania pliku:", error)
    fs.copyFileSync(dbPath, backupFilePath)
    console.log("[BACKUP] Kopia bazy danych utworzona przez kopiowanie pliku.")
  }

  const fileSize = fs.statSync(backupFilePath).size
  const fileSizeMb = (fileSize / (1024 * 1024)).toFixed(2)

  // 5. Archiwizacja katalogów z plikami aplikacji (files, .uploads, .invoices, public/uploads)
  const filesArchiveName = `files_${timestamp}_gcs.tar.gz`
  const filesArchivePath = path.join(backupDir, filesArchiveName)
  let filesArchiveCreated = false
  let filesSizeMb = "0"

  const fileDirs = [
    { name: "files", path: path.resolve(process.cwd(), "files") },
    { name: ".uploads", path: path.resolve(process.cwd(), ".uploads") },
    { name: ".invoices", path: path.resolve(process.cwd(), ".invoices") },
    { name: "public/uploads", path: path.resolve(process.cwd(), "public/uploads") },
  ]
  const existingTargets = fileDirs.filter((d) => fs.existsSync(d.path)).map((d) => d.name)

  if (existingTargets.length > 0) {
    console.log(`[BACKUP] Tworzenie archiwum katalogów plików (${existingTargets.join(", ")})...`)
    try {
      await execPromise(`tar -czf "${filesArchivePath}" -C "${process.cwd()}" ${existingTargets.join(" ")}`)
      if (fs.existsSync(filesArchivePath)) {
        filesArchiveCreated = true
        const size = fs.statSync(filesArchivePath).size
        filesSizeMb = (size / (1024 * 1024)).toFixed(2)
        console.log(`[BACKUP] Archiwum plików utworzone: ${filesArchiveName} (${filesSizeMb} MB)`)
      }
    } catch (archError) {
      console.warn("[BACKUP] Nie udało się utworzyć archiwum tar.gz plików:", archError)
    }
  }

  // 6. Przesyłanie do Google Cloud Storage
  let gcsPath: string | undefined
  let filesArchiveGcsPath: string | undefined
  let uploadError: unknown = null

  if (gcs) {
    console.log(`[BACKUP] Przesyłanie kopii do Google Cloud Storage (bucket: ${gcs.bucketName})...`)
    const bucket = gcs.storage.bucket(gcs.bucketName)
    const dbDest = gcs.prefix ? `${gcs.prefix}/${backupFileName}` : backupFileName
    const filesDest = gcs.prefix ? `${gcs.prefix}/${filesArchiveName}` : filesArchiveName

    try {
      await bucket.upload(backupFilePath, {
        destination: dbDest,
        metadata: {
          contentType: "application/x-sqlite3",
          metadata: {
            createdTime: new Date().toISOString(),
            originalName: backupFileName,
          },
        },
      })
      gcsPath = dbDest
      console.log(`[BACKUP] Pomyślnie przesłano kopię bazy do GCS: gs://${gcs.bucketName}/${dbDest}`)

      if (filesArchiveCreated && fs.existsSync(filesArchivePath)) {
        await bucket.upload(filesArchivePath, {
          destination: filesDest,
          metadata: {
            contentType: "application/gzip",
            metadata: {
              createdTime: new Date().toISOString(),
              originalName: filesArchiveName,
            },
          },
        })
        filesArchiveGcsPath = filesDest
        console.log(`[BACKUP] Pomyślnie przesłano archiwum plików do GCS: gs://${gcs.bucketName}/${filesDest}`)
      }
    } catch (error: any) {
      console.error("[BACKUP] Błąd podczas przesyłania do Google Cloud Storage:", error)
      uploadError = error
    }
  }

  // 7. Retencja i czyszczenie (domyślnie 30 dni)
  const keepDays = parseInt(process.env.BACKUP_KEEP_DAYS || "30", 10)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - keepDays)

  console.log(`[BACKUP] Wykonywanie retencji (zachowywanie kopii z ostatnich ${keepDays} dni)...`)

  // 7a. Czyszczenie starych plików w Google Cloud Storage
  let deletedGcsCount = 0
  if (gcs) {
    try {
      const bucket = gcs.storage.bucket(gcs.bucketName)
      const options = gcs.prefix ? { prefix: `${gcs.prefix}/` } : {}
      const [files] = await bucket.getFiles(options)

      for (const file of files) {
        const baseName = path.basename(file.name)
        const isBackup =
          baseName.startsWith("db_") ||
          baseName.startsWith("files_") ||
          baseName.startsWith("uploads_") ||
          baseName.startsWith("invoices_")

        if (isBackup) {
          const timeCreatedStr = (file.metadata.timeCreated || file.metadata.updated) as string | undefined
          const fileDate = timeCreatedStr ? new Date(timeCreatedStr) : null

          if (fileDate && fileDate < cutoffDate) {
            console.log(`[BACKUP] Usuwanie starej kopii z GCS: ${file.name}`)
            await file.delete()
            deletedGcsCount++
          }
        }
      }
    } catch (cleanupError) {
      console.error("[BACKUP] Błąd podczas usuwania starych plików z GCS:", cleanupError)
    }
  }

  // 7b. Czyszczenie starych kopii lokalnych
  let deletedLocalCount = 0
  try {
    const localFiles = fs.readdirSync(backupDir)
    for (const file of localFiles) {
      const isDbBackup = file.startsWith("db_") && file.endsWith(".db")
      const isArchive =
        (file.startsWith("files_") || file.startsWith("uploads_") || file.startsWith("invoices_")) &&
        (file.endsWith(".tar.gz") || file.endsWith(".gz"))

      if (isDbBackup || isArchive) {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)
        if (stats.mtime < cutoffDate) {
          console.log(`[BACKUP] Usuwanie starej lokalnej kopii: ${file}`)
          fs.unlinkSync(filePath)
          deletedLocalCount++
        }
      }
    }
  } catch (cleanupError) {
    console.error("[BACKUP] Błąd podczas czyszczenia lokalnych kopii zapasowych:", cleanupError)
  }

  if (uploadError) {
    const message = uploadError instanceof Error ? uploadError.message : String(uploadError)
    throw new Error(`Błąd przesyłania do Google Cloud Storage: ${message}`)
  }

  return {
    success: true,
    fileName: backupFileName,
    fileSizeMb,
    filesArchiveName: filesArchiveCreated ? filesArchiveName : undefined,
    filesSizeMb: filesArchiveCreated ? filesSizeMb : undefined,
    archivedDirectories: existingTargets,
    gcsPath,
    filesArchiveGcsPath,
    deletedGcsCount,
    deletedLocalCount,
    keepDays,
  }
}

export interface BackupInfo {
  name: string
  location: "local" | "gcs" | "gdrive" | "both"
  sizeBytes?: number
  createdTime?: string
  gcsPath?: string
  driveFileId?: string
}

/**
 * Zwraca listę kopii zapasowych dostępnych lokalnie oraz w Google Cloud Storage.
 */
export async function listBackups(): Promise<BackupInfo[]> {
  const localFilesList: BackupInfo[] = []
  const backupDir = path.resolve(process.cwd(), "backups/db")

  if (fs.existsSync(backupDir)) {
    const files = fs.readdirSync(backupDir)
    for (const file of files) {
      if (file.startsWith("db_") && file.endsWith(".db")) {
        const filePath = path.join(backupDir, file)
        const stat = fs.statSync(filePath)
        localFilesList.push({
          name: file,
          location: "local",
          sizeBytes: stat.size,
          createdTime: stat.mtime.toISOString(),
        })
      }
    }
  }

  const gcsFilesList: BackupInfo[] = []
  const gcs = getGCSStorage()
  if (gcs) {
    try {
      const bucket = gcs.storage.bucket(gcs.bucketName)
      const options = gcs.prefix ? { prefix: `${gcs.prefix}/` } : {}
      const [files] = await bucket.getFiles(options)

      for (const file of files) {
        const baseName = path.basename(file.name)
        if (baseName.startsWith("db_") && baseName.endsWith(".db")) {
          const size = file.metadata.size ? parseInt(file.metadata.size as string, 10) : undefined
          const createdTime = (file.metadata.timeCreated || file.metadata.updated) as string | undefined
          gcsFilesList.push({
            name: baseName,
            location: "gcs",
            sizeBytes: size,
            createdTime,
            gcsPath: file.name,
          })
        }
      }
    } catch (error) {
      console.error("[BACKUP] Błąd podczas pobierania listy plików z Google Cloud Storage:", error)
    }
  }

  const mergedMap = new Map<string, BackupInfo>()
  for (const lf of localFilesList) {
    mergedMap.set(lf.name, lf)
  }

  for (const gf of gcsFilesList) {
    const existing = mergedMap.get(gf.name)
    if (existing) {
      existing.location = "both"
      existing.gcsPath = gf.gcsPath
      if (!existing.sizeBytes && gf.sizeBytes) existing.sizeBytes = gf.sizeBytes
      if (!existing.createdTime && gf.createdTime) existing.createdTime = gf.createdTime
    } else {
      mergedMap.set(gf.name, gf)
    }
  }

  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdTime || 0).getTime() - new Date(a.createdTime || 0).getTime()
  )
}

/**
 * Przywraca wskazaną kopię zapasową do aktywnej bazy danych SQLite.
 * Jeśli plik nie istnieje lokalnie, pobiera go z Google Cloud Storage.
 * Przed nadpisaniem bazy tworzy kopię bezpieczeństwa aktualnego stanu.
 */
export async function restoreBackup(
  backupFileName: string,
  gcsPath?: string,
  _driveFileId?: string
) {
  let dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db"
  if (dbUrl.startsWith("file:")) {
    dbUrl = dbUrl.substring(5)
  }
  const dbPath = path.isAbsolute(dbUrl) ? dbUrl : path.resolve(process.cwd(), dbUrl)

  const backupDir = path.resolve(process.cwd(), "backups/db")
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const localPath = path.join(backupDir, backupFileName)

  // 1. Pobierz plik z GCS jeśli nie ma go lokalnie
  if (!fs.existsSync(localPath)) {
    const gcs = getGCSStorage()
    if (gcs) {
      const bucket = gcs.storage.bucket(gcs.bucketName)
      const targetGcsPath = gcsPath || (gcs.prefix ? `${gcs.prefix}/${backupFileName}` : backupFileName)
      console.log(`[RESTORE] Pobieranie kopii zapasowej ${backupFileName} z GCS (gs://${gcs.bucketName}/${targetGcsPath})...`)

      const file = bucket.file(targetGcsPath)
      const [exists] = await file.exists()
      if (!exists) {
        throw new Error(`Plik kopii ${targetGcsPath} nie został odnaleziony w buckecie GCS ${gcs.bucketName}.`)
      }

      await file.download({ destination: localPath })
      console.log(`[RESTORE] Kopia pobrana pomyślnie z GCS: ${localPath}`)
    } else {
      throw new Error(`Plik kopii ${backupFileName} nie istnieje lokalnie, a Google Cloud Storage nie jest skonfigurowany.`)
    }
  }

  // 2. Kopia bezpieczeństwa aktualnego stanu przed przywróceniem
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const safetyBackupPath = path.join(backupDir, `db_${timestamp}_pre-restore.db`)

  console.log(`[RESTORE] Tworzenie kopii bezpieczeństwa przed przywróceniem: ${safetyBackupPath}`)
  if (fs.existsSync(dbPath)) {
    try {
      await execPromise(`sqlite3 "${dbPath}" ".backup '${safetyBackupPath}'"`)
      console.log("[RESTORE] Kopia bezpieczeństwa utworzona przez sqlite3 CLI.")
    } catch (err) {
      console.warn("[RESTORE] sqlite3 CLI nie powiodło się, fallback do kopiowania pliku:", err)
      fs.copyFileSync(dbPath, safetyBackupPath)
      console.log("[RESTORE] Kopia bezpieczeństwa utworzona przez kopiowanie pliku.")
    }
  }

  // 3. Nadpisanie bazy danymi z kopii
  console.log(`[RESTORE] Przywracanie bazy danych z pliku: ${localPath}`)
  try {
    await execPromise(`sqlite3 "${localPath}" ".backup '${dbPath}'"`)
    console.log("[RESTORE] Baza danych przywrócona pomyślnie przez sqlite3 CLI.")
  } catch (err) {
    console.warn("[RESTORE] sqlite3 CLI nie powiodło się, fallback do kopiowania pliku:", err)
    fs.copyFileSync(localPath, dbPath)
    console.log("[RESTORE] Baza danych przywrócona przez kopiowanie pliku.")
  }

  return {
    success: true,
    restoredFrom: backupFileName,
    safetyBackup: path.basename(safetyBackupPath),
  }
}

/**
 * Usuwa wskazaną kopię zapasową (zarówno z lokalnego dysku, jak i z Google Cloud Storage).
 * Jeśli istnieje powiązane archiwum plików o tym samym znaczniku czasu, również je usuwa.
 */
export async function deleteBackup(fileName: string, gcsPath?: string) {
  const safeFileName = path.basename(fileName)
  const backupDir = path.resolve(process.cwd(), "backups/db")

  let deletedLocal = false
  let deletedGCS = false

  // 1. Usunięcie lokalnego pliku bazy
  const localDbPath = path.join(backupDir, safeFileName)
  if (fs.existsSync(localDbPath)) {
    fs.unlinkSync(localDbPath)
    deletedLocal = true
    console.log(`[BACKUP] Usunięto lokalną kopię bazy danych: ${safeFileName}`)
  }

  // Usunięcie powiązanego lokalnego archiwum plików (np. files_... zamiast db_...)
  const relatedFilesArchive = safeFileName.startsWith("db_")
    ? safeFileName.replace(/^db_/, "files_").replace(/\.db$/, ".tar.gz")
    : null

  if (relatedFilesArchive) {
    const localArchivePath = path.join(backupDir, relatedFilesArchive)
    if (fs.existsSync(localArchivePath)) {
      fs.unlinkSync(localArchivePath)
      console.log(`[BACKUP] Usunięto powiązane lokalne archiwum plików: ${relatedFilesArchive}`)
    }
  }

  // 2. Usunięcie z Google Cloud Storage
  const gcs = getGCSStorage()
  if (gcs) {
    try {
      const bucket = gcs.storage.bucket(gcs.bucketName)
      const targetGcsPath = gcsPath || (gcs.prefix ? `${gcs.prefix}/${safeFileName}` : safeFileName)

      const file = bucket.file(targetGcsPath)
      const [exists] = await file.exists()
      if (exists) {
        await file.delete()
        deletedGCS = true
        console.log(`[BACKUP] Usunięto kopię bazy z GCS: gs://${gcs.bucketName}/${targetGcsPath}`)
      }

      // Usunięcie powiązanego archiwum plików z GCS
      const relatedGcsArchive = targetGcsPath.includes("/db_")
        ? targetGcsPath.replace(/\/db_([^/]+)\.db$/, "/files_$1.tar.gz")
        : targetGcsPath.startsWith("db_")
        ? targetGcsPath.replace(/^db_([^/]+)\.db$/, "files_$1.tar.gz")
        : null

      if (relatedGcsArchive && relatedGcsArchive !== targetGcsPath) {
        const archiveFile = bucket.file(relatedGcsArchive)
        const [archiveExists] = await archiveFile.exists()
        if (archiveExists) {
          await archiveFile.delete()
          console.log(`[BACKUP] Usunięto powiązane archiwum plików z GCS: gs://${gcs.bucketName}/${relatedGcsArchive}`)
        }
      }
    } catch (error) {
      console.error("[BACKUP] Błąd podczas usuwania z Google Cloud Storage:", error)
      throw new Error(`Błąd podczas usuwania z Google Cloud Storage: ${error instanceof Error ? error.message : error}`)
    }
  }

  return {
    success: true,
    fileName: safeFileName,
    deletedLocal,
    deletedGCS,
  }
}

// Alias dla kompatybilności wstecznej
export const backupDbToGoogleDrive = backupDbToGCS
