import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import { Storage } from "@google-cloud/storage"

const execPromise = promisify(exec)

export interface BackupInfo {
  name: string
  location: "local" | "gcs" | "both"
  sizeBytes?: number
  createdTime?: string
  gcsFileName?: string
}

/**
 * Returns an instance of Google Cloud Storage SDK client if credentials are present,
 * or null if credentials are missing.
 */
function getStorageClient(): Storage | null {
  const clientEmail = process.env.GCS_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GCS_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY
  const projectId = process.env.GCS_PROJECT_ID || process.env.GOOGLE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT

  if (clientEmail && privateKey) {
    return new Storage({
      projectId: projectId || undefined,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
    })
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new Storage({ projectId: projectId || undefined })
  }

  return null
}

function getBucketName(): string {
  return (
    process.env.GCS_BUCKET_NAME ||
    process.env.GOOGLE_CLOUD_BUCKET ||
    process.env.GCS_BUCKET ||
    "ps-map-backups"
  )
}

/**
 * Creates a local SQLite database backup and an archive of all application files (files, .uploads, .invoices, public/uploads),
 * uploads them to Google Cloud Storage (GCS), and performs retention cleanup both locally and in GCS.
 */
export async function backupDbToGoogleCloudStorage() {
  const storage = getStorageClient()
  const bucketName = getBucketName()

  if (!storage) {
    console.warn(
      "[BACKUP] Google Cloud Storage credentials not configured. Skipping GCS upload."
    )
    return {
      success: false,
      error:
        "Google credentials (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY or GCS_CLIENT_EMAIL / GCS_PRIVATE_KEY) are not configured.",
    }
  }

  // 1. Resolve database path
  let dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db"
  if (dbUrl.startsWith("file:")) {
    dbUrl = dbUrl.substring(5)
  }
  const dbPath = path.isAbsolute(dbUrl) ? dbUrl : path.resolve(process.cwd(), dbUrl)

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file does not exist at: ${dbPath}`)
  }

  // 2. Prepare local backup directory
  const backupDir = path.resolve(process.cwd(), "backups/db")
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  // 3. Create timestamped DB backup file name
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupFileName = `db_${timestamp}_gcs.db`
  const backupFilePath = path.join(backupDir, backupFileName)

  console.log(`[BACKUP] Creating local database backup: ${backupFilePath}`)

  // 4. Perform SQLite backup
  try {
    await execPromise(`sqlite3 "${dbPath}" ".backup '${backupFilePath}'"`)
    console.log("[BACKUP] Local SQLite backup created successfully via sqlite3 CLI.")
  } catch (error) {
    console.warn("[BACKUP] sqlite3 CLI backup failed, falling back to file copy:", error)
    fs.copyFileSync(dbPath, backupFilePath)
    console.log("[BACKUP] Local SQLite backup created successfully via file copy.")
  }

  const fileSize = fs.statSync(backupFilePath).size
  const fileSizeMb = (fileSize / (1024 * 1024)).toFixed(2)

  // 5. Create comprehensive archive of all file directories (files, .uploads, .invoices, public/uploads)
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
    console.log(`[BACKUP] Archiving application file directories (${existingTargets.join(", ")})...`)
    try {
      await execPromise(`tar -czf "${filesArchivePath}" -C "${process.cwd()}" ${existingTargets.join(" ")}`)
      if (fs.existsSync(filesArchivePath)) {
        filesArchiveCreated = true
        const size = fs.statSync(filesArchivePath).size
        filesSizeMb = (size / (1024 * 1024)).toFixed(2)
        console.log(`[BACKUP] Application files archive created: ${filesArchiveName} (${filesSizeMb} MB)`)
      }
    } catch (archError) {
      console.warn("[BACKUP] Failed to create application files archive tar.gz:", archError)
    }
  }

  // 6. Upload database backup & files archive to Google Cloud Storage
  console.log(`[BACKUP] Uploading backups to Google Cloud Storage bucket: ${bucketName}...`)
  try {
    const bucket = storage.bucket(bucketName)

    // Upload DB backup
    await bucket.upload(backupFilePath, {
      destination: backupFileName,
      metadata: {
        contentType: "application/x-sqlite3",
      },
    })
    console.log(`[BACKUP] Successfully uploaded DB backup to GCS: ${backupFileName}`)

    // Upload Files archive
    if (filesArchiveCreated && fs.existsSync(filesArchivePath)) {
      await bucket.upload(filesArchivePath, {
        destination: filesArchiveName,
        metadata: {
          contentType: "application/gzip",
        },
      })
      console.log(`[BACKUP] Successfully uploaded application Files archive to GCS: ${filesArchiveName}`)
    }
  } catch (uploadError: any) {
    console.error("[BACKUP] Google Cloud Storage upload failed:", uploadError)
    return {
      success: false,
      error: `Google Cloud Storage upload failed: ${uploadError.message || uploadError}`,
      localBackupPath: backupFilePath,
      fileSizeMb,
    }
  }

  // 7. Retention & Cleanup (Default: 30 days or BACKUP_KEEP_DAYS)
  const keepDays = parseInt(process.env.BACKUP_KEEP_DAYS || "30", 10)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - keepDays)

  console.log(`[BACKUP] Performing retention cleanup (keeping backups from last ${keepDays} days)...`)

  // 7a. Clean up old backups on Google Cloud Storage (db_, files_, uploads_, invoices_)
  let deletedGcsCount = 0
  try {
    const bucket = storage.bucket(bucketName)
    const [gcsFiles] = await bucket.getFiles()

    for (const file of gcsFiles) {
      if (
        file.name.startsWith("db_") ||
        file.name.startsWith("files_") ||
        file.name.startsWith("uploads_") ||
        file.name.startsWith("invoices_")
      ) {
        const createdTime = file.metadata.timeCreated || file.metadata.updated
        if (createdTime) {
          const createdDate = new Date(createdTime as string)
          if (createdDate < cutoffDate) {
            console.log(`[BACKUP] Deleting old GCS archive: ${file.name}`)
            await file.delete()
            deletedGcsCount++
          }
        }
      }
    }
  } catch (cleanupError) {
    console.error("[BACKUP] Failed to clean up old files on GCS:", cleanupError)
  }

  // 7b. Clean up old local backup files
  let deletedLocalCount = 0
  try {
    const localFiles = fs.readdirSync(backupDir)
    for (const file of localFiles) {
      if (
        (file.startsWith("db_") && file.endsWith(".db")) ||
        (file.startsWith("files_") && file.endsWith(".tar.gz")) ||
        (file.startsWith("uploads_") && file.endsWith(".tar.gz")) ||
        (file.startsWith("invoices_") && file.endsWith(".tar.gz"))
      ) {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)
        if (stats.mtime < cutoffDate) {
          console.log(`[BACKUP] Deleting old local backup file: ${file}`)
          fs.unlinkSync(filePath)
          deletedLocalCount++
        }
      }
    }
  } catch (cleanupError) {
    console.error("[BACKUP] Failed to clean up old local backup files:", cleanupError)
  }

  return {
    success: true,
    fileName: backupFileName,
    fileSizeMb,
    filesArchiveName: filesArchiveCreated ? filesArchiveName : undefined,
    filesSizeMb: filesArchiveCreated ? filesSizeMb : undefined,
    archivedDirectories: existingTargets,
    bucketName,
    deletedGcsCount,
    deletedLocalCount,
    keepDays,
  }
}

// Alias for convenience
export const backupDbToGCS = backupDbToGoogleCloudStorage

/**
 * Lists all database backup files locally and in Google Cloud Storage.
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
  const storage = getStorageClient()
  const bucketName = getBucketName()

  if (storage) {
    try {
      const bucket = storage.bucket(bucketName)
      const [files] = await bucket.getFiles({ prefix: "db_" })

      for (const file of files) {
        if (file.name) {
          const metadata = file.metadata
          const sizeBytes = metadata.size ? parseInt(String(metadata.size), 10) : undefined
          const createdTime = (metadata.timeCreated || metadata.updated) as string | undefined

          gcsFilesList.push({
            name: file.name,
            location: "gcs",
            sizeBytes,
            createdTime,
            gcsFileName: file.name,
          })
        }
      }
    } catch (error) {
      console.error("[BACKUP] Error fetching backup list from Google Cloud Storage:", error)
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
      existing.gcsFileName = gf.gcsFileName
      if (!existing.sizeBytes && gf.sizeBytes) existing.sizeBytes = gf.sizeBytes
      if (!existing.createdTime && gf.createdTime) existing.createdTime = gf.createdTime
    } else {
      mergedMap.set(gf.name, gf)
    }
  }

  return Array.from(mergedMap.values()).sort(
    (a, b) =>
      new Date(b.createdTime || 0).getTime() - new Date(a.createdTime || 0).getTime()
  )
}

/**
 * Restores a specific backup file to the active SQLite database.
 * If the file is only on Google Cloud Storage, it downloads it first.
 * Generates a safety pre-restore backup.
 */
export async function restoreBackup(backupFileName: string, gcsFileName?: string) {
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

  // 1. Download file from Google Cloud Storage if it is not present locally
  if (!fs.existsSync(localPath)) {
    const storage = getStorageClient()
    const bucketName = getBucketName()

    if (!storage) {
      throw new Error(
        `Plik backupu ${backupFileName} nie istnieje lokalnie, a dane uwierzytelniające Google Cloud Storage nie są skonfigurowane.`
      )
    }

    const targetGcsName = gcsFileName || backupFileName
    console.log(`[RESTORE] Downloading backup ${targetGcsName} from Google Cloud Storage bucket ${bucketName}...`)

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(targetGcsName)
    await file.download({ destination: localPath })
    console.log(`[RESTORE] Backup downloaded successfully to: ${localPath}`)
  }

  // 2. Create safety pre-restore backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const safetyBackupPath = path.join(backupDir, `db_${timestamp}_pre-restore.db`)

  console.log(`[RESTORE] Creating safety backup before restore at: ${safetyBackupPath}`)
  if (fs.existsSync(dbPath)) {
    try {
      await execPromise(`sqlite3 "${dbPath}" ".backup '${safetyBackupPath}'"`)
      console.log("[RESTORE] Safety backup created via sqlite3 CLI.")
    } catch (err) {
      console.warn("[RESTORE] sqlite3 safety backup failed, falling back to file copy:", err)
      fs.copyFileSync(dbPath, safetyBackupPath)
      console.log("[RESTORE] Safety backup created via file copy.")
    }
  }

  // 3. Restore the backup (overwrite active db)
  console.log(`[RESTORE] Restoring database from: ${localPath}`)
  try {
    await execPromise(`sqlite3 "${localPath}" ".backup '${dbPath}'"`)
    console.log("[RESTORE] Database restored successfully via sqlite3 CLI.")
  } catch (err) {
    console.warn("[RESTORE] sqlite3 restore failed, falling back to file copy:", err)
    fs.copyFileSync(localPath, dbPath)
    console.log("[RESTORE] Database restored successfully via file copy.")
  }

  return {
    success: true,
    restoredFrom: backupFileName,
    safetyBackup: path.basename(safetyBackupPath),
  }
}
