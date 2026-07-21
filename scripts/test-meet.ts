import dotenv from "dotenv"
import { createGoogleMeetLink } from "../lib/google-meet"

dotenv.config()

async function main() {
  console.log("Testing createGoogleMeetLink()...")
  const link = await createGoogleMeetLink({
    id: "booking-test-1",
    proposedDateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    description: "Testowa konsultacja Google Meet",
    lawFirmName: "Testowa Kancelaria",
  })

  console.log("\nResulting Meet Link:", link)
}

main().catch(console.error)
