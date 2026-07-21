import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import { Readable } from "stream"
import { google } from "googleapis"

const execPromise = promisify(exec)

/**
 * Creates a local SQLite database backup, uploads it to Google Drive,
 * and performs retention cleanup both locally and on Google Drive.
 */
export async function backupDbToGoogleDrive() {
  const isDev = process.env.NODE_ENV === "development"
  
  // 1. Check if Google Drive credentials are configured
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.warn("[BACKUP] Google credentials not configured. Skipping Google Drive upload.")
    return {
      success: false,
      error: "Google credentials (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY) are not configured in environment variables.",
    }
  }

  // 2. Resolve database path
  let dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db"
  if (dbUrl.startsWith("file:")) {
    dbUrl = dbUrl.substring(5)
  }
  const dbPath = path.isAbsolute(dbUrl) ? dbUrl : path.resolve(process.cwd(), dbUrl)

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file does not exist at: ${dbPath}`)
  }

  // 3. Prepare backup directory
  const backupDir = path.resolve(process.cwd(), "backups/db")
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  // 4. Create timestamped backup file name
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupFileName = `db_${timestamp}_gdrive.db`
  const backupFilePath = path.join(backupDir, backupFileName)

  console.log(`[BACKUP] Creating local backup: ${backupFilePath}`)
  
  // 5. Perform backup using sqlite3 CLI if available, otherwise fallback to simple copy
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

  // 6. Authenticate with Google Drive API
  console.log("[BACKUP] Authenticating with Google API...")
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"],
  })

  const drive = google.drive({ version: "v3", auth })

  // 7. Upload the backup file to Google Drive
  console.log("[BACKUP] Uploading backup to Google Drive...")
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || undefined
  const fileMetadata: any = {
    name: backupFileName,
  }
  if (folderId) {
    fileMetadata.parents = [folderId]
  }

  // Read file into buffer to avoid multipart boundary issues with createReadStream
  const fileBuffer = fs.readFileSync(backupFilePath)
  const fileReadable = new Readable()
  fileReadable.push(fileBuffer)
  fileReadable.push(null)

  const media = {
    mimeType: "application/x-sqlite3",
    body: fileReadable,
  }

  let driveFileId = ""
  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name",
    })

    driveFileId = response.data.id || ""
    console.log(`[BACKUP] Successfully uploaded to Google Drive. File ID: ${driveFileId}`)
  } catch (uploadError: any) {
    console.error("[BACKUP] Google Drive upload failed:", uploadError)
    // Clean up local backup if it fails (optional, but keep it for manual debugging if needed)
    return {
      success: false,
      error: `Google Drive upload failed: ${uploadError.message || uploadError}`,
      localBackupPath: backupFilePath,
      fileSizeMb,
    }
  }

  // 8. Retention & Cleanup (Default: 30 days)
  const keepDays = parseInt(process.env.BACKUP_KEEP_DAYS || "30", 10)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - keepDays)

  console.log(`[BACKUP] Performing retention cleanup (keeping backups from last ${keepDays} days)...`)

  // 8a. Clean up old backups on Google Drive
  let deletedDriveCount = 0
  try {
    let query = "name contains 'db_' and name contains '_gdrive.db' and trashed = false"
    if (folderId) {
      query += ` and '${folderId}' in parents`
    }

    const driveList = await drive.files.list({
      q: query,
      fields: "files(id, name, createdTime)",
      orderBy: "createdTime desc",
    })

    const driveFiles = driveList.data.files || []
    for (const file of driveFiles) {
      if (file.id && file.createdTime) {
        const createdDate = new Date(file.createdTime)
        if (createdDate < cutoffDate) {
          console.log(`[BACKUP] Deleting old Google Drive backup: ${file.name} (${file.id})`)
          await drive.files.delete({ fileId: file.id })
          deletedDriveCount++
        }
      }
    }
  } catch (cleanupError) {
    console.error("[BACKUP] Failed to clean up old files on Google Drive:", cleanupError)
  }

  // 8b. Clean up old local backup files
  let deletedLocalCount = 0
  try {
    const localFiles = fs.readdirSync(backupDir)
    for (const file of localFiles) {
      if (file.startsWith("db_") && file.endsWith("_gdrive.db")) {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)
        if (stats.mtime < cutoffDate) {
          console.log(`[BACKUP] Deleting old local backup: ${file}`)
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
    driveFileId,
    deletedDriveCount,
    deletedLocalCount,
    keepDays,
  }
}

export interface BackupInfo {
  name: string
  location: "local" | "gdrive" | "both"
  sizeBytes?: number
  createdTime?: string
  driveFileId?: string
}

/**
 * Lists all database backup files locally and on Google Drive.
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

  const driveFilesList: BackupInfo[] = []
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    try {
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/drive"],
      })
      const drive = google.drive({ version: "v3", auth })
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
      
      let query = "name contains 'db_' and name contains '.db' and trashed = false"
      if (folderId) {
        query += ` and '${folderId}' in parents`
      }

      const driveList = await drive.files.list({
        q: query,
        fields: "files(id, name, size, createdTime)",
      })

      for (const file of driveList.data.files || []) {
        if (file.name && file.id) {
          driveFilesList.push({
            name: file.name,
            location: "gdrive",
            sizeBytes: file.size ? parseInt(file.size, 10) : undefined,
            createdTime: file.createdTime || undefined,
            driveFileId: file.id,
          })
        }
      }
    } catch (error) {
      console.error("[BACKUP] Error fetching backup list from Google Drive:", error)
    }
  }

  const mergedMap = new Map<string, BackupInfo>()
  for (const lf of localFilesList) {
    mergedMap.set(lf.name, lf)
  }

  for (const df of driveFilesList) {
    const existing = mergedMap.get(df.name)
    if (existing) {
      existing.location = "both"
      existing.driveFileId = df.driveFileId
      if (!existing.sizeBytes && df.sizeBytes) existing.sizeBytes = df.sizeBytes
      if (!existing.createdTime && df.createdTime) existing.createdTime = df.createdTime
    } else {
      mergedMap.set(df.name, df)
    }
  }

  return Array.from(mergedMap.values()).sort(
    (a, b) =>
      new Date(b.createdTime || 0).getTime() - new Date(a.createdTime || 0).getTime()
  )
}

/**
 * Restores a specific backup file to the active SQLite database.
 * If the file is only on Google Drive, it downloads it first.
 * Generates a safety pre-restore backup.
 */
export async function restoreBackup(backupFileName: string, driveFileId?: string) {
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

  // 1. Download file from Google Drive if it is not present locally
  if (!fs.existsSync(localPath)) {
    if (!driveFileId) {
      throw new Error(`Plik backupu ${backupFileName} nie istnieje lokalnie, a ID z Google Drive nie zostało przesłane.`)
    }
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error("Dane uwierzytelniające Google Drive (Service Account) nie są skonfigurowane.")
    }

    console.log(`[RESTORE] Downloading backup ${backupFileName} (${driveFileId}) from Google Drive...`)
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/drive"],
    })
    const drive = google.drive({ version: "v3", auth })

    const response = await drive.files.get(
      { fileId: driveFileId, alt: "media" },
      { responseType: "stream" }
    )

    const dest = fs.createWriteStream(localPath)
    await new Promise((resolve, reject) => {
      response.data
        .on("error", reject)
        .pipe(dest)
        .on("error", reject)
        .on("finish", resolve)
    })
    console.log(`[RESTORE] Backup downloaded successfully: ${localPath}`)
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

