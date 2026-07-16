import { backupDbToGoogleDrive } from "../lib/google-drive-backup"
import * as dotenv from "dotenv"

dotenv.config()

async function main() {
  console.log("Starting DB Google Drive backup test...")
  try {
    const result = await backupDbToGoogleDrive()
    console.log("Backup completed. Result:", JSON.stringify(result, null, 2))
  } catch (error) {
    console.error("Backup failed with error:", error)
  }
}

main()
