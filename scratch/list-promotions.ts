import { prisma } from "../lib/prisma"

async function main() {
  const promotions = await prisma.promotion.findMany({
    select: {
      id: true,
      typPromocji: true,
      startPromocji: true,
      koniecPromocji: true,
      automatyczneOdnowienie: true,
      aktywna: true,
    }
  })
  console.log("PROMOTIONS:", promotions)
}

main()
