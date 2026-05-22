import { prisma } from "./lib/prisma"

async function run() {
  try {
    console.log("Fetching email templates...")
    const templates = await prisma.emailTemplate.findMany()
    console.log(`Found ${templates.length} templates:`)
    templates.forEach(t => {
      console.log(`- Typ: ${t.typ}, Aktywny: ${t.aktywny}`)
    })
  } catch (error) {
    console.error("Failed to query email templates:", error)
  } finally {
    await prisma.$disconnect()
  }
}

run()
