import { backupDbToGoogleCloudStorage } from "../lib/google-cloud-storage-backup"
import * as dotenv from "dotenv"

dotenv.config()

async function main() {
  console.log("Starting DB Google Cloud Storage backup test...")
  try {
    const result = await backupDbToGoogleCloudStorage()
    console.log("Backup completed. Result:", JSON.stringify(result, null, 2))
  } catch (error) {
    console.error("Backup failed with error:", error)
  }
}

main()
