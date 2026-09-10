<<<<<<< HEAD
<<<<<<<< HEAD:scripts/test-gcs-backup.ts
import { backupDbToGoogleCloudStorage } from "../lib/google-cloud-storage-backup"
========
import { backupDbToGCS } from "../lib/gcs-backup"
>>>>>>>> a0701d6a46b52a413c7f997ce95e358a2813e55c:scripts/test-gdrive-backup.ts
=======
import { backupDbToGCS, listBackups } from "../lib/gcs-backup"
>>>>>>> a0701d6a46b52a413c7f997ce95e358a2813e55c
import * as dotenv from "dotenv"

dotenv.config()

async function main() {
<<<<<<< HEAD
  console.log("Starting DB Google Cloud Storage backup test...")
  try {
<<<<<<<< HEAD:scripts/test-gcs-backup.ts
    const result = await backupDbToGoogleCloudStorage()
========
    const result = await backupDbToGCS()
>>>>>>>> a0701d6a46b52a413c7f997ce95e358a2813e55c:scripts/test-gdrive-backup.ts
    console.log("Backup completed. Result:", JSON.stringify(result, null, 2))
  } catch (error) {
    console.error("Backup failed with error:", error)
=======
  console.log("Rozpoczynanie testu tworzenia kopii zapasowej w Google Cloud Storage...")
  try {
    const result = await backupDbToGCS()
    console.log("Backup zakończony sukcesem. Wynik:", JSON.stringify(result, null, 2))

    console.log("\nPobieranie listy kopii zapasowych:")
    const backups = await listBackups()
    console.log(`Liczba znalezionych kopii: ${backups.length}`)
    console.log(JSON.stringify(backups.slice(0, 5), null, 2))
  } catch (error) {
    console.error("Test tworzenia kopii zapasowej zakończony błędem:", error)
>>>>>>> a0701d6a46b52a413c7f997ce95e358a2813e55c
  }
}

main()
