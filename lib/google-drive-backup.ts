import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import { google } from "googleapis"

const execPromise = promisify(exec)

const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"]

/**
 * Builds a Google auth client for Drive access, preferring an OAuth2 refresh
 * token (a standard @gmail.com account has its own storage quota) over the
 * service account JWT (service accounts have 0 bytes of Drive storage quota
 * unless used with a Workspace shared drive — see lib/google-meet.ts for the
 * same fallback pattern used for Calendar/Meet).
 *
 * Returns null if no credentials are configured at all.
 */
function getDriveAuth() {
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET

  if (refreshToken && clientId && clientSecret) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    return oauth2Client
  }

  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: DRIVE_SCOPES,
    })
  }

  return null
}

/**
 * Creates a local SQLite database backup + an archive of application file
 * directories, uploads both to Google Drive, and performs retention cleanup
 * both locally and on Google Drive.
 *
 * Cleanup always runs, even if the upload fails, so a persistent upload
 * failure (e.g. Google blocking the server's IP, or a misconfigured account)
 * doesn't fill up local disk. Upload failures are thrown (not swallowed into
 * a `{success:false}` return) so the scheduler's job-runner correctly marks
 * the run as FAILED and its retry mechanism kicks in.
 */
export async function backupDbToGoogleDrive() {
  const auth = getDriveAuth()

  if (!auth) {
    console.warn("[BACKUP] Google Drive credentials not configured. Skipping upload.")
    return {
      success: false,
      error:
        "Google Drive credentials are not configured (need either GOOGLE_DRIVE_REFRESH_TOKEN + GOOGLE_CLIENT_ID/AUTH_GOOGLE_ID + GOOGLE_CLIENT_SECRET/AUTH_GOOGLE_SECRET, or GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY).",
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
  const backupFileName = `db_${timestamp}_gdrive.db`
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

  // 5. Archive application file directories (files, .uploads, .invoices, public/uploads)
  const filesArchiveName = `files_${timestamp}_gdrive.tar.gz`
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

  // 6. Google Drive client
  console.log("[BACKUP] Authenticating with Google API...")
  const drive = google.drive({ version: "v3", auth: auth as any })
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || undefined

  async function uploadFile(filePath: string, fileName: string, mimeType: string) {
    const fileMetadata: any = { name: fileName }
    if (folderId) fileMetadata.parents = [folderId]

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: { mimeType, body: fs.createReadStream(filePath) },
      fields: "id, name",
      supportsAllDrives: true,
    })
    return response.data.id || ""
  }

  // 7. Upload DB backup & files archive to Google Drive. Cleanup (step 8)
  // always runs afterwards, even on upload failure — the failure is only
  // thrown at the very end so retention cleanup isn't skipped.
  console.log("[BACKUP] Uploading backups to Google Drive...")
  let driveFileId = ""
  let filesArchiveDriveFileId: string | undefined
  let uploadError: unknown = null

  try {
    driveFileId = await uploadFile(backupFilePath, backupFileName, "application/x-sqlite3")
    console.log(`[BACKUP] Successfully uploaded DB backup to Google Drive. File ID: ${driveFileId}`)

    if (filesArchiveCreated && fs.existsSync(filesArchivePath)) {
      filesArchiveDriveFileId = await uploadFile(filesArchivePath, filesArchiveName, "application/gzip")
      console.log(`[BACKUP] Successfully uploaded application files archive to Google Drive. File ID: ${filesArchiveDriveFileId}`)
    }
  } catch (error: any) {
    console.error("[BACKUP] Google Drive upload failed:", error)
    uploadError = error
  }

  // 8. Retention & Cleanup (Default: 30 days) — runs regardless of upload result.
  const keepDays = parseInt(process.env.BACKUP_KEEP_DAYS || "30", 10)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - keepDays)

  console.log(`[BACKUP] Performing retention cleanup (keeping backups from last ${keepDays} days)...`)

  // 8a. Clean up old backups on Google Drive
  let deletedDriveCount = 0
  try {
    let query = "(name contains 'db_' or name contains 'files_') and name contains '_gdrive' and trashed = false"
    if (folderId) {
      query += ` and '${folderId}' in parents`
    }

    const driveList = await drive.files.list({
      q: query,
      fields: "files(id, name, createdTime)",
      orderBy: "createdTime desc",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })

    const driveFiles = driveList.data.files || []
    for (const file of driveFiles) {
      if (file.id && file.createdTime) {
        const createdDate = new Date(file.createdTime)
        if (createdDate < cutoffDate) {
          console.log(`[BACKUP] Deleting old Google Drive backup: ${file.name} (${file.id})`)
          await drive.files.delete({ fileId: file.id, supportsAllDrives: true })
          deletedDriveCount++
        }
      }
    }
  } catch (cleanupError) {
    console.error("[BACKUP] Failed to clean up old files on Google Drive:", cleanupError)
  }

  // 8b. Clean up old local backup files (db_*.db and files_*.tar.gz)
  let deletedLocalCount = 0
  try {
    const localFiles = fs.readdirSync(backupDir)
    for (const file of localFiles) {
      const isDbBackup = file.startsWith("db_") && file.endsWith("_gdrive.db")
      const isFilesArchive = file.startsWith("files_") && file.endsWith("_gdrive.tar.gz")
      if (isDbBackup || isFilesArchive) {
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

  if (uploadError) {
    const message = uploadError instanceof Error ? uploadError.message : String(uploadError)
    throw new Error(`Google Drive upload failed: ${message}`)
  }

  return {
    success: true,
    fileName: backupFileName,
    fileSizeMb,
    filesArchiveName: filesArchiveCreated ? filesArchiveName : undefined,
    filesSizeMb: filesArchiveCreated ? filesSizeMb : undefined,
    archivedDirectories: existingTargets,
    driveFileId,
    filesArchiveDriveFileId,
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
  const auth = getDriveAuth()
  if (auth) {
    try {
      const drive = google.drive({ version: "v3", auth: auth as any })
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

      let query = "name contains 'db_' and name contains '.db' and trashed = false"
      if (folderId) {
        query += ` and '${folderId}' in parents`
      }

      const driveList = await drive.files.list({
        q: query,
        fields: "files(id, name, size, createdTime)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
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
    const auth = getDriveAuth()
    if (!auth) {
      throw new Error("Dane uwierzytelniające Google Drive nie są skonfigurowane.")
    }

    console.log(`[RESTORE] Downloading backup ${backupFileName} (${driveFileId}) from Google Drive...`)
    const drive = google.drive({ version: "v3", auth: auth as any })

    const response = await drive.files.get(
      { fileId: driveFileId, alt: "media", supportsAllDrives: true },
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
