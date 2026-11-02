import { backupDbToGCS, listBackups } from "../lib/gcs-backup"
import * as dotenv from "dotenv"

dotenv.config()

async function main() {
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
  }
}

main()
