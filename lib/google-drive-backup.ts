/**
 * Backward compatibility wrapper for database backup operations.
 * Re-exports GCS implementation.
 */
export {
  backupDbToGoogleCloudStorage as backupDbToGoogleDrive,
  backupDbToGCS,
  backupDbToGoogleCloudStorage,
  listBackups,
  restoreBackup,
} from "./google-cloud-storage-backup"

export type { BackupInfo } from "./google-cloud-storage-backup"
